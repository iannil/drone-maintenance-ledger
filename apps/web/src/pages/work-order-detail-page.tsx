import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  User,
  Calendar,
  FileText,
  CheckCircle2,
  AlertCircle,
  Wrench,
  XCircle,
  Plus,
  Edit2,
  MoreHorizontal,
  Download,
  Printer,
  Signature,
  Loader2,
  RefreshCw,
  PlayCircle,
  PauseCircle,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
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
import { Skeleton } from "../components/ui/skeleton";
import {
  workOrderService,
  WorkOrder,
  WorkOrderTask,
  WorkOrderPart,
  WORK_ORDER_STATUS_LABELS,
  WORK_ORDER_STATUS_COLORS,
  WORK_ORDER_TYPE_LABELS,
  WORK_ORDER_PRIORITY_LABELS,
} from "../services/work-order.service";
import { fullAircraftService, Aircraft } from "../services/fleet.service";
import { useToast } from "../components/ui/toast";

// 工单状态图标映射
const STATUS_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  DRAFT: Clock,
  OPEN: Clock,
  IN_PROGRESS: Wrench,
  PENDING_PARTS: PauseCircle,
  PENDING_INSPECTION: AlertCircle,
  COMPLETED: CheckCircle2,
  RELEASED: CheckCircle2,
  CANCELLED: XCircle,
};

/**
 * 格式化时间戳
 */
function formatTimestamp(ts: number | null): string {
  if (!ts) return "-";
  return new Date(ts).toLocaleString("zh-CN");
}

function formatDate(ts: number | null): string {
  if (!ts) return "-";
  return new Date(ts).toLocaleDateString("zh-CN");
}

/**
 * 工单详情页
 */
export function WorkOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toastActions = useToast();
  const [showSignDialog, setShowSignDialog] = useState(false);
  const [signature, setSignature] = useState("");

  // Data state
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [aircraft, setAircraft] = useState<Aircraft | null>(null);
  const [tasks, setTasks] = useState<WorkOrderTask[]>([]);
  const [parts, setParts] = useState<WorkOrderPart[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch work order data
  useEffect(() => {
    if (!id) return;

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        // Fetch work order
        const wo = await workOrderService.getById(id!);
        setWorkOrder(wo);

        // Fetch aircraft
        if (wo.aircraftId) {
          try {
            const ac = await fullAircraftService.getById(wo.aircraftId);
            setAircraft(ac);
          } catch {
            // Aircraft may not exist
          }
        }

        // Fetch tasks and parts
        const [tasksData, partsData] = await Promise.all([
          workOrderService.getTasks(id!),
          workOrderService.getParts(id!),
        ]);
        setTasks(tasksData);
        setParts(partsData);
      } catch (err) {
        console.error("Failed to fetch work order:", err);
        setError("加载工单详情失败");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  // Handle status changes
  const handleStart = async () => {
    if (!workOrder) return;
    setActionLoading(true);
    try {
      const updated = await workOrderService.start(workOrder.id);
      setWorkOrder(updated);
      toastActions.success("已开始工作");
    } catch (err) {
      toastActions.error("操作失败", "无法开始工单");
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!workOrder) return;
    setActionLoading(true);
    try {
      const updated = await workOrderService.complete(workOrder.id);
      setWorkOrder(updated);
      toastActions.success("工单已完成");
    } catch (err) {
      toastActions.error("操作失败", "无法完成工单");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRelease = async () => {
    if (!workOrder || !signature) return;
    setActionLoading(true);
    try {
      const updated = await workOrderService.release(workOrder.id);
      setWorkOrder(updated);
      setShowSignDialog(false);
      setSignature("");
      toastActions.success("工单已放行");
    } catch (err) {
      toastActions.error("操作失败", "无法放行工单");
    } finally {
      setActionLoading(false);
    }
  };

  const handleTaskStatusChange = async (taskId: string, status: WorkOrderTask["status"]) => {
    try {
      const updated = await workOrderService.updateTaskStatus(taskId, status);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      toastActions.success("任务状态已更新");
    } catch (err) {
      toastActions.error("操作失败", "无法更新任务状态");
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div className="flex-1">
            <Skeleton className="h-7 w-64 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-lg" />
      </div>
    );
  }

  // Error state
  if (error || !workOrder) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">{error || "工单不存在"}</h2>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              重试
            </Button>
            <Button onClick={() => navigate("/work-orders")}>返回工单列表</Button>
          </div>
        </div>
      </div>
    );
  }

  const StatusIcon = STATUS_ICONS[workOrder.status] || Clock;
  const completedTasks = tasks.filter((t) => t.status === "COMPLETED").length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Check if due date is past
  const isPastDue =
    workOrder.scheduledEnd &&
    new Date(workOrder.scheduledEnd) < new Date() &&
    !["COMPLETED", "RELEASED", "CANCELLED"].includes(workOrder.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/work-orders")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-slate-900">{workOrder.title}</h1>
            <Badge className={WORK_ORDER_STATUS_COLORS[workOrder.status]}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {WORK_ORDER_STATUS_LABELS[workOrder.status]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {workOrder.orderNumber}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" title="打印">
            <Printer className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" title="导出">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => navigate(`/work-orders/${id}/edit`)}>
            <Edit2 className="h-4 w-4 mr-2" />
            编辑
          </Button>
          {workOrder.status === "PENDING_INSPECTION" && (
            <Button onClick={() => setShowSignDialog(true)} disabled={actionLoading}>
              {actionLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Signature className="h-4 w-4 mr-2" />
              )}
              签字放行
            </Button>
          )}
          {workOrder.status === "COMPLETED" && (
            <Button onClick={() => setShowSignDialog(true)} disabled={actionLoading}>
              {actionLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Signature className="h-4 w-4 mr-2" />
              )}
              签字放行
            </Button>
          )}
          {workOrder.status === "IN_PROGRESS" && (
            <Button onClick={handleComplete} disabled={actionLoading}>
              {actionLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              完成工单
            </Button>
          )}
          {(workOrder.status === "OPEN" || workOrder.status === "DRAFT") && (
            <Button onClick={handleStart} disabled={actionLoading}>
              {actionLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <PlayCircle className="h-4 w-4 mr-2" />
              )}
              开始工作
            </Button>
          )}
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              关联飞机
            </CardTitle>
          </CardHeader>
          <CardContent>
            {aircraft ? (
              <>
                <Link
                  to={`/aircraft/${workOrder.aircraftId}`}
                  className="font-medium text-primary hover:underline"
                >
                  {aircraft.registration}
                </Link>
                <p className="text-xs text-muted-foreground">{aircraft.model}</p>
              </>
            ) : (
              <span className="text-muted-foreground">-</span>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              负责人
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{workOrder.assignedTo || "未分配"}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              计划完成
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className={`font-medium ${isPastDue ? "text-red-600" : ""}`}>
                {formatDate(workOrder.scheduledEnd)}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              飞机工时
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="font-medium">
              {workOrder.aircraftHours ? `${workOrder.aircraftHours.toFixed(1)} 小时` : "-"}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="tasks">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="tasks">工卡任务</TabsTrigger>
          <TabsTrigger value="details">详情信息</TabsTrigger>
          <TabsTrigger value="parts">领用配件</TabsTrigger>
          <TabsTrigger value="attachments">附件</TabsTrigger>
          <TabsTrigger value="history">操作历史</TabsTrigger>
        </TabsList>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>工卡任务</CardTitle>
                  <CardDescription>
                    进度: {completedTasks}/{totalTasks} ({Math.round(progress)}%)
                  </CardDescription>
                </div>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  添加任务
                </Button>
              </div>
              {/* Progress Bar */}
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden mt-4">
                <div
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </CardHeader>
            <CardContent>
              {tasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  暂无工卡任务
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks.map((task, index) => {
                    const isCompleted = task.status === "COMPLETED";
                    const isRii = task.isRii;

                    return (
                      <div
                        key={task.id}
                        className={`border rounded-lg p-4 ${isCompleted ? "bg-green-50/50" : ""}`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 mt-1">
                            <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium ${
                              isCompleted
                                ? "bg-green-500 text-white"
                                : "bg-slate-200 text-slate-600"
                            }`}>
                              {task.sequence || index + 1}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{task.title}</h4>
                              {isRii && (
                                <Badge variant="outline" className="text-xs border-red-500 text-red-700">
                                  必检项 (RII)
                                </Badge>
                              )}
                              <Badge
                                variant="outline"
                                className={isCompleted ? "border-green-500 text-green-700" : ""}
                              >
                                {isCompleted ? "已完成" : task.status === "IN_PROGRESS" ? "进行中" : "待处理"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {task.description || task.instructions}
                            </p>
                            {isCompleted && (
                              <div className="text-xs text-muted-foreground">
                                <span>完成人: {task.completedBy || "-"}</span>
                                <span className="mx-2">•</span>
                                <span>完成时间: {formatTimestamp(task.completedAt)}</span>
                                {task.riiSignedOffBy && (
                                  <>
                                    <span className="mx-2">•</span>
                                    <span>检验员: {task.riiSignedOffBy}</span>
                                  </>
                                )}
                              </div>
                            )}
                            {task.result && (
                              <div className="mt-2 text-sm">
                                <span className="text-muted-foreground">结果: </span>
                                {task.result}
                              </div>
                            )}
                            {task.notes && (
                              <div className="mt-2 text-sm">
                                <span className="text-muted-foreground">备注: </span>
                                {task.notes}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            {!isCompleted && workOrder.status === "IN_PROGRESS" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleTaskStatusChange(task.id, "COMPLETED")}
                                title="标记完成"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>工单详情</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-muted-foreground">工单号</Label>
                  <p className="font-medium">{workOrder.orderNumber}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">类型</Label>
                  <p className="font-medium">{WORK_ORDER_TYPE_LABELS[workOrder.type]}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">优先级</Label>
                  <p className="font-medium">{WORK_ORDER_PRIORITY_LABELS[workOrder.priority]}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">创建时间</Label>
                  <p className="font-medium">{formatTimestamp(workOrder.createdAt)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">计划开始</Label>
                  <p className="font-medium">{formatTimestamp(workOrder.scheduledStart)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">计划完成</Label>
                  <p className="font-medium">{formatTimestamp(workOrder.scheduledEnd)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">实际开始</Label>
                  <p className="font-medium">{formatTimestamp(workOrder.actualStart)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">实际完成</Label>
                  <p className="font-medium">{formatTimestamp(workOrder.actualEnd)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">飞机工时</Label>
                  <p className="font-medium">
                    {workOrder.aircraftHours ? `${workOrder.aircraftHours.toFixed(1)} 小时` : "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">飞机循环</Label>
                  <p className="font-medium">
                    {workOrder.aircraftCycles ? `${workOrder.aircraftCycles} 次` : "-"}
                  </p>
                </div>
                {workOrder.completedBy && (
                  <div>
                    <Label className="text-muted-foreground">完成人</Label>
                    <p className="font-medium">{workOrder.completedBy}</p>
                  </div>
                )}
                {workOrder.releasedBy && (
                  <div>
                    <Label className="text-muted-foreground">放行人</Label>
                    <p className="font-medium">{workOrder.releasedBy}</p>
                  </div>
                )}
              </div>

              {workOrder.description && (
                <div>
                  <Label className="text-muted-foreground">描述</Label>
                  <p className="text-sm">{workOrder.description}</p>
                </div>
              )}

              {workOrder.reason && (
                <div>
                  <Label className="text-muted-foreground">原因</Label>
                  <p className="text-sm">{workOrder.reason}</p>
                </div>
              )}

              {workOrder.completionNotes && (
                <div>
                  <Label className="text-muted-foreground">完成备注</Label>
                  <p className="text-sm">{workOrder.completionNotes}</p>
                </div>
              )}

              {workOrder.discrepancies && (
                <div>
                  <Label className="text-muted-foreground">缺陷</Label>
                  <p className="text-sm text-amber-700">{workOrder.discrepancies}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Parts Tab */}
        <TabsContent value="parts">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>领用配件</CardTitle>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  添加配件
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {parts.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4 font-medium text-sm">件号</th>
                      <th className="text-left py-2 px-4 font-medium text-sm">配件名称</th>
                      <th className="text-left py-2 px-4 font-medium text-sm">数量</th>
                      <th className="text-left py-2 px-4 font-medium text-sm">单位</th>
                      <th className="text-left py-2 px-4 font-medium text-sm">安装位置</th>
                      <th className="text-right py-2 px-4 font-medium text-sm">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parts.map((part) => (
                      <tr key={part.id} className="border-b">
                        <td className="py-3 px-4 font-mono text-sm">{part.partNumber}</td>
                        <td className="py-3 px-4">{part.partName}</td>
                        <td className="py-3 px-4">{part.quantity}</td>
                        <td className="py-3 px-4">{part.unit}</td>
                        <td className="py-3 px-4">{part.installedLocation || "-"}</td>
                        <td className="py-3 px-4 text-right">
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  暂无领用配件
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attachments Tab */}
        <TabsContent value="attachments">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>附件</CardTitle>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  上传附件
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                暂无附件
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>操作历史</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workOrder.releasedAt && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="w-0.5 flex-1 bg-slate-200 mt-2" />
                    </div>
                    <div className="flex-1 pb-6">
                      <p className="font-medium">工单放行</p>
                      <p className="text-sm text-muted-foreground">
                        {workOrder.releasedBy || "检验员"} 放行了工单
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimestamp(workOrder.releasedAt)}
                      </p>
                    </div>
                  </div>
                )}
                {workOrder.completedAt && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="w-0.5 flex-1 bg-slate-200 mt-2" />
                    </div>
                    <div className="flex-1 pb-6">
                      <p className="font-medium">工单完成</p>
                      <p className="text-sm text-muted-foreground">
                        {workOrder.completedBy || "维修人员"} 完成了工单
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimestamp(workOrder.completedAt)}
                      </p>
                    </div>
                  </div>
                )}
                {workOrder.actualStart && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Wrench className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="w-0.5 flex-1 bg-slate-200 mt-2" />
                    </div>
                    <div className="flex-1 pb-6">
                      <p className="font-medium">开始工作</p>
                      <p className="text-sm text-muted-foreground">
                        {workOrder.assignedTo || "维修人员"} 开始执行工单
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimestamp(workOrder.actualStart)}
                      </p>
                    </div>
                  </div>
                )}
                {workOrder.assignedAt && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                        <User className="h-4 w-4 text-slate-600" />
                      </div>
                      <div className="w-0.5 flex-1 bg-slate-200 mt-2" />
                    </div>
                    <div className="flex-1 pb-6">
                      <p className="font-medium">分配工单</p>
                      <p className="text-sm text-muted-foreground">
                        工单分配给 {workOrder.assignedTo || "维修人员"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimestamp(workOrder.assignedAt)}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-slate-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">创建工单</p>
                    <p className="text-sm text-muted-foreground">
                      工单已创建
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTimestamp(workOrder.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Sign Dialog */}
      <Dialog open={showSignDialog} onOpenChange={setShowSignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>签字放行</DialogTitle>
            <DialogDescription>
              请确认工单已完成并签字放行。签字后工单将被标记为已放行。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="signature">检验员签字</Label>
              <Input
                id="signature"
                placeholder="输入姓名或签字"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
              />
            </div>
            <div className="p-3 bg-amber-50 rounded-lg text-sm text-amber-800">
              <p className="font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                注意事项
              </p>
              <ul className="mt-2 space-y-1 text-xs">
                <li>• 确认所有必检项(RII)已完成</li>
                <li>• 确认所有工卡任务已完成</li>
                <li>• 确认所有记录和照片已上传</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSignDialog(false)}>
              取消
            </Button>
            <Button onClick={handleRelease} disabled={!signature || actionLoading}>
              {actionLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Signature className="h-4 w-4 mr-2" />
              )}
              确认放行
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
