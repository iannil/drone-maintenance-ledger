import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileText,
  User,
  Calendar,
  Clock,
  Shield,
  Signature,
  Eye,
  Download,
  Printer,
  Loader2,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { AircraftStatusBadge } from "../components/common/status-badge";
import {
  workOrderService,
  WorkOrder,
  WorkOrderTask,
  WORK_ORDER_TYPE_LABELS,
  WORK_ORDER_STATUS_LABELS,
} from "../services/work-order.service";
import { fullAircraftService, Aircraft } from "../services/fleet.service";
import { userService, User as UserType, ROLE_LABELS } from "../services/user.service";

// Work order with additional UI fields
interface ReleaseWorkOrder {
  id: string;
  workOrderNumber: string;
  title: string;
  description: string | null;
  type: string;
  priority: string;
  status: string;
  aircraftId: string | null;
  aircraftRegistration: string | null;
  aircraftModel: string | null;
  assignedTo: string | null;
  completedBy: string | null;
  completedAt: string | null;
  createdAt: string;
  dueDate: string | null;
  estimatedHours: number;
  actualHours: number;
  notes: string | null;
  tasks: {
    id: string;
    title: string;
    description: string | null;
    isRii: boolean;
    status: string;
    completedBy: string | null;
    completedAt: string | null;
    photos: string[];
    notes: string | null;
    inspector?: string | null;
    inspectedAt?: string | null;
  }[];
  partsUsed: { id: string; name: string; quantity: number; unit: string; partNumber: string }[];
  attachments: { id: string; name: string; type: string; size: string }[];
}

/**
 * Airworthiness release page for inspectors to review and sign off work orders
 */
export function WorkOrderReleasePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [workOrder, setWorkOrder] = useState<ReleaseWorkOrder | null>(null);
  const [currentInspector, setCurrentInspector] = useState<UserType | null>(null);

  // UI states
  const [approvalStatus, setApprovalStatus] = useState<"APPROVED" | "REJECTED" | null>(null);
  const [inspectorNotes, setInspectorNotes] = useState("");
  const [signature, setSignature] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showSignDialog, setShowSignDialog] = useState(false);
  const [selectedTaskForReview, setSelectedTaskForReview] = useState<ReleaseWorkOrder["tasks"][0] | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Load work order data
  useEffect(() => {
    async function loadData() {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        // Load current user as inspector
        const inspector = await userService.getProfile();
        setCurrentInspector(inspector);
        setSignature(inspector.name);

        // Load work order
        const wo = await workOrderService.getById(id);
        const tasks = await workOrderService.getTasks(id);

        // Load aircraft info
        let aircraftReg = null;
        let aircraftModel = null;
        if (wo.aircraftId) {
          try {
            const aircraft = await fullAircraftService.getById(wo.aircraftId);
            aircraftReg = aircraft.registrationNumber;
            aircraftModel = aircraft.model;
          } catch {
            console.warn("Failed to load aircraft info");
          }
        }

        // Map to ReleaseWorkOrder format
        const releaseWo: ReleaseWorkOrder = {
          id: wo.id,
          workOrderNumber: wo.orderNumber,
          title: wo.title,
          description: wo.description,
          type: wo.type,
          priority: wo.priority,
          status: wo.status,
          aircraftId: wo.aircraftId,
          aircraftRegistration: aircraftReg,
          aircraftModel: aircraftModel,
          assignedTo: wo.assignedTo,
          completedBy: null,
          completedAt: wo.completedAt ? new Date(wo.completedAt).toISOString() : null,
          createdAt: new Date(wo.createdAt).toISOString(),
          dueDate: wo.scheduledEnd ? new Date(wo.scheduledEnd).toISOString() : null,
          estimatedHours: 0,
          actualHours: 0,
          notes: wo.completionNotes || wo.description,
          tasks: tasks.map((t) => ({
            id: t.id,
            title: t.title,
            description: t.description,
            isRii: t.isRii,
            status: t.status,
            completedBy: null,
            completedAt: t.completedAt ? new Date(t.completedAt).toISOString() : null,
            photos: [],
            notes: t.notes,
            inspector: null,
            inspectedAt: null,
          })),
          partsUsed: [],
          attachments: [],
        };

        setWorkOrder(releaseWo);
      } catch (err) {
        console.error("Failed to load work order:", err);
        setError("无法加载工单信息");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [id]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Error state
  if (error || !workOrder) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h2 className="text-lg font-semibold">{error || "未找到工单"}</h2>
        <Button variant="outline" onClick={() => navigate("/work-orders")}>
          返回工单列表
        </Button>
      </div>
    );
  }

  // Calculated values
  const riiTasks = workOrder.tasks.filter((t) => t.isRii);
  const completedRiiTasks = riiTasks.filter((t) => t.status === "COMPLETED");
  const pendingRiiTasks = riiTasks.filter((t) => !t.inspector);

  // Check if can release
  const canRelease = workOrder.tasks.every((t) => t.status === "COMPLETED");

  // Handle approve
  const handleApprove = () => {
    if (!signature) {
      alert("请签字确认");
      return;
    }
    setShowSignDialog(true);
  };

  const confirmApprove = () => {
    console.log("Approve work order:", {
      workOrderId: workOrder.id,
      signature,
      inspectorNotes,
      inspector: currentInspector,
    });
    // TODO: API call to approve work order
    setShowSignDialog(false);
    navigate(`/work-orders/${id}`);
  };

  // Handle reject
  const handleReject = () => {
    setShowRejectDialog(true);
  };

  const confirmReject = () => {
    if (!rejectionReason.trim()) {
      alert("请说明驳回原因");
      return;
    }
    console.log("Reject work order:", {
      workOrderId: workOrder.id,
      reason: rejectionReason,
    });
    // TODO: API call to reject work order
    setShowRejectDialog(false);
    navigate(`/work-orders/${id}`);
  };

  // View task details
  const viewTaskDetails = (task: ReleaseWorkOrder["tasks"][0]) => {
    setSelectedTaskForReview(task);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to={`/work-orders/${id}`}>
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">适航放行审核</h1>
            <Badge variant="outline" className="text-xs">
              <Shield className="h-3 w-3 mr-1" />
              检验员
            </Badge>
          </div>
          <p className="text-muted-foreground">
            {workOrder.workOrderNumber} · 审核维修工作并签字放行
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link to={`/work-orders/${id}`}>
              <Eye className="w-4 h-4 mr-2" />
              查看详情
            </Link>
          </Button>
          <Button variant="outline">
            <Printer className="w-4 h-4 mr-2" />
            打印
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            导出
          </Button>
        </div>
      </div>

      {/* Status Alert */}
      {!canRelease ? (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-900">工单尚未完成</p>
            <p className="text-sm text-red-700 mt-1">
              此工单还有未完成的任务，需要所有任务完成后才能进行放行审核。
            </p>
          </div>
        </div>
      ) : pendingRiiTasks.length > 0 && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-900">有待审核的必检项</p>
            <p className="text-sm text-amber-700 mt-1">
              此工单包含 {pendingRiiTasks.length} 个必检项(RII)需要您的审核确认。
            </p>
          </div>
        </div>
      )}

      {/* Work Order Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              关联飞机
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              to={`/aircraft/${workOrder.aircraftId}`}
              className="font-medium text-primary hover:underline"
            >
              {workOrder.aircraftRegistration}
            </Link>
            <p className="text-xs text-muted-foreground">{workOrder.aircraftModel}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              完成人员
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{workOrder.completedBy}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              完成时间
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {new Date(workOrder.completedAt!).toLocaleString("zh-CN")}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              实际工时
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{workOrder.actualHours} 小时</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* RII Tasks Review */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>必检项(RII)审核</CardTitle>
                  <CardDescription>
                    已完成 {completedRiiTasks.length} / {riiTasks.length} 个必检项
                  </CardDescription>
                </div>
                <Badge variant="outline" className="border-red-500 text-red-700">
                  共 {riiTasks.length} 项
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {riiTasks.map((task, index) => {
                  const isInspected = !!task.inspector;
                  return (
                    <div
                      key={task.id}
                      className={`border rounded-lg p-4 ${
                        isInspected ? "bg-green-50/50" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium">{task.title}</span>
                            <Badge variant="outline" className="text-xs border-red-500 text-red-700">
                              必检项
                            </Badge>
                            {isInspected && (
                              <Badge className="bg-green-100 text-green-700 text-xs">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                已审核
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {task.description}
                          </p>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <div>执行人: {task.completedBy}</div>
                            <div>完成时间: {new Date(task.completedAt!).toLocaleString("zh-CN")}</div>
                            {task.notes && (
                              <div>执行备注: {task.notes}</div>
                            )}
                            {task.photos && task.photos.length > 0 && (
                              <div>已添加 {task.photos.length} 张照片</div>
                            )}
                            {isInspected && (
                              <div className="text-green-600 font-medium">
                                检验员: {task.inspector} · {new Date(task.inspectedAt!).toLocaleString("zh-CN")}
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewTaskDetails(task)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          查看
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* All Tasks Review */}
          <Card>
            <CardHeader>
              <CardTitle>所有任务清单</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">全部 ({workOrder.tasks.length})</TabsTrigger>
                  <TabsTrigger value="completed">已完成 ({workOrder.tasks.filter(t => t.status === "COMPLETED").length})</TabsTrigger>
                  <TabsTrigger value="rii">必检项 ({riiTasks.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="mt-4">
                  <div className="space-y-2">
                    {workOrder.tasks.map((task, index) => (
                      <div key={task.id} className="flex items-center gap-3 p-3 border rounded-lg text-sm">
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${
                          task.status === "COMPLETED"
                            ? "bg-green-500 text-white"
                            : "bg-slate-200 text-slate-600"
                        }`}>
                          {task.status === "COMPLETED" ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            index + 1
                          )}
                        </div>
                        <span className="flex-1">{task.title}</span>
                        {task.isRii && (
                          <Badge variant="outline" className="text-xs border-red-500 text-red-700">
                            RII
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="completed" className="mt-4">
                  <div className="space-y-2">
                    {workOrder.tasks.filter(t => t.status === "COMPLETED").map((task) => (
                      <div key={task.id} className="flex items-center gap-3 p-3 border rounded-lg text-sm bg-green-50/50">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <span className="flex-1">{task.title}</span>
                        <span className="text-muted-foreground">{task.completedBy}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="rii" className="mt-4">
                  <div className="space-y-2">
                    {riiTasks.map((task) => (
                      <div key={task.id} className="flex items-center gap-3 p-3 border rounded-lg text-sm">
                        <Shield className="h-5 w-5 text-red-500" />
                        <span className="flex-1">{task.title}</span>
                        {task.inspector ? (
                          <Badge className="bg-green-100 text-green-700">已审核</Badge>
                        ) : (
                          <Badge variant="outline">待审核</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Parts Used */}
          {workOrder.partsUsed.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>使用配件</CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4 font-medium text-sm">配件名称</th>
                      <th className="text-left py-2 px-4 font-medium text-sm">件号</th>
                      <th className="text-left py-2 px-4 font-medium text-sm">数量</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workOrder.partsUsed.map((part) => (
                      <tr key={part.id} className="border-b">
                        <td className="py-3 px-4">{part.name}</td>
                        <td className="py-3 px-4 font-mono text-sm">{part.partNumber}</td>
                        <td className="py-3 px-4">
                          {part.quantity} {part.unit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Inspector Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">检验员信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">姓名</p>
                <p className="font-medium">{currentInspector?.name || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">执照号</p>
                <p className="font-mono text-sm">{currentInspector?.licenseNumber || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">角色</p>
                <p className="font-medium">{ROLE_LABELS[currentInspector?.role || "VIEWER"]}</p>
              </div>
            </CardContent>
          </Card>

          {/* Work Order Notes */}
          {workOrder.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">维修备注</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{workOrder.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Release Decision */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">放行决定</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="inspectorNotes">检验备注</Label>
                <Textarea
                  id="inspectorNotes"
                  placeholder="记录检验过程中发现的问题或审核意见..."
                  value={inspectorNotes}
                  onChange={(e) => setInspectorNotes(e.target.value)}
                  rows={4}
                  className="mt-1"
                />
              </div>

              <div className="p-3 bg-blue-50 rounded text-sm">
                <p className="font-medium text-blue-900 mb-1">审核要点</p>
                <ul className="text-blue-800 space-y-1 text-xs">
                  <li>• 确认所有任务已完成</li>
                  <li>• 检查必检项(RII)的执行质量</li>
                  <li>• 确认使用配件正确安装</li>
                  <li>• 验证维修记录完整准确</li>
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="border-red-500 text-red-700 hover:bg-red-50"
                  onClick={handleReject}
                  disabled={!canRelease}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  驳回
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={!canRelease}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  批准放行
                </Button>
              </div>

              {!canRelease && (
                <p className="text-xs text-muted-foreground text-center">
                  工单尚未完成，暂时无法放行
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">快速链接</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link to={`/aircraft/${workOrder.aircraftId}`}>
                  <FileText className="h-4 w-4 mr-2" />
                  查看飞机详情
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link to={`/work-orders/${id}`}>
                  <FileText className="h-4 w-4 mr-2" />
                  查看工单详情
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Task Detail Dialog */}
      <Dialog open={!!selectedTaskForReview} onOpenChange={() => setSelectedTaskForReview(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>任务详情审核</DialogTitle>
            <DialogDescription>
              {selectedTaskForReview?.title}
            </DialogDescription>
          </DialogHeader>
          {selectedTaskForReview && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">任务描述</p>
                <p className="text-sm">{selectedTaskForReview.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">执行人</p>
                  <p className="font-medium">{selectedTaskForReview.completedBy}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">完成时间</p>
                  <p className="font-medium">
                    {new Date(selectedTaskForReview.completedAt!).toLocaleString("zh-CN")}
                  </p>
                </div>
              </div>
              {selectedTaskForReview.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">执行备注</p>
                  <p className="text-sm">{selectedTaskForReview.notes}</p>
                </div>
              )}
              {selectedTaskForReview.photos && selectedTaskForReview.photos.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">现场照片 ({selectedTaskForReview.photos.length})</p>
                  <div className="grid grid-cols-4 gap-2">
                    {selectedTaskForReview.photos.map((_, i) => (
                      <div
                        key={i}
                        className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center"
                      >
                        <FileText className="h-8 w-8 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setSelectedTaskForReview(null)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sign Dialog */}
      <Dialog open={showSignDialog} onOpenChange={setShowSignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              批准放行
            </DialogTitle>
            <DialogDescription>
              确认要批准此工单并签字放行吗？此操作将标记飞机为适航状态。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="signature">检验员签字</Label>
              <Input
                id="signature"
                placeholder="输入姓名进行电子签名"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                className="mt-1"
              />
            </div>
            {inspectorNotes && (
              <div>
                <p className="text-sm text-muted-foreground">检验备注</p>
                <p className="text-sm mt-1 p-2 bg-slate-50 rounded">{inspectorNotes}</p>
              </div>
            )}
            <div className="flex items-start gap-2 p-3 bg-green-50 rounded text-green-800 text-sm">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <p>
                批准后，工单将被标记为已完成，飞机将恢复适航状态，可以继续执行飞行任务。
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSignDialog(false)}>
              取消
            </Button>
            <Button onClick={confirmApprove} disabled={!signature}>
              <Signature className="h-4 w-4 mr-2" />
              确认放行
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              驳回工单
            </DialogTitle>
            <DialogDescription>
              请说明驳回此工单的原因，工单将被退回给维修人员重新处理。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejectionReason">驳回原因 *</Label>
              <Textarea
                id="rejectionReason"
                placeholder="请详细说明需要返工的问题..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="mt-1"
              />
            </div>
            <div className="flex items-start gap-2 p-3 bg-amber-50 rounded text-amber-800 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <p>
                驳回后，工单状态将变为"返工"，维修人员需要根据您的意见进行处理。
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={confirmReject} disabled={!rejectionReason.trim()}>
              <XCircle className="h-4 w-4 mr-2" />
              确认驳回
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
