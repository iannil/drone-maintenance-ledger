import { useState } from "react";
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
import { AircraftStatusBadge } from "../components/common/status-badge";

// 工单状态
const WORK_ORDER_STATUS = {
  PENDING: { label: "待处理", color: "bg-slate-100 text-slate-700", icon: Clock },
  IN_PROGRESS: { label: "进行中", color: "bg-blue-100 text-blue-700", icon: Wrench },
  INSPECTION_REQUIRED: { label: "待检验", color: "bg-yellow-100 text-yellow-700", icon: AlertCircle },
  COMPLETED: { label: "已完成", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  CANCELLED: { label: "已取消", color: "bg-red-100 text-red-700", icon: XCircle },
};

// Mock work order data
const MOCK_WORK_ORDER: Record<string, any> = {
  "wo-001": {
    id: "wo-001",
    workOrderNumber: "WO-2026-0116",
    title: "电机定期检查 - B-7011U",
    description: "每50飞行小时检查电机状态，测试电机转速和温度",
    type: "SCHEDULED",
    priority: "HIGH",
    status: "IN_PROGRESS",
    aircraftId: "ac-001",
    aircraftRegistration: "B-7011U",
    aircraftModel: "DJI M350 RTK",
    scheduleId: "ms-001",
    scheduleName: "电机定期检查",
    assignedTo: "张三",
    createdBy: "系统",
    createdAt: "2026-01-15T09:00:00",
    dueDate: "2026-01-20T18:00:00",
    startedAt: "2026-01-15T10:30:00",
    completedAt: null,
    estimatedHours: 2,
    actualHours: 1.5,
    notes: "按计划执行，未发现异常。",
    tasks: [
      {
        id: "task-001",
        title: "外观检查 - 左前电机",
        description: "检查电机外观是否有损伤、裂纹或异物",
        isRii: false,
        status: "COMPLETED",
        completedBy: "张三",
        completedAt: "2026-01-15T11:00:00",
        photos: ["photo1.jpg"],
      },
      {
        id: "task-002",
        title: "外观检查 - 右前电机",
        description: "检查电机外观是否有损伤、裂纹或异物",
        isRii: false,
        status: "COMPLETED",
        completedBy: "张三",
        completedAt: "2026-01-15T11:15:00",
        photos: [],
      },
      {
        id: "task-003",
        title: "转速测试 - 左前电机",
        description: "测试电机最大转速，检查是否平稳",
        isRii: true,
        status: "COMPLETED",
        completedBy: "张三",
        completedAt: "2026-01-15T11:45:00",
        photos: ["photo2.jpg"],
        inspector: "李四",
        inspectedAt: "2026-01-15T12:00:00",
      },
      {
        id: "task-004",
        title: "转速测试 - 右前电机",
        description: "测试电机最大转速，检查是否平稳",
        isRii: true,
        status: "PENDING",
        completedBy: null,
        completedAt: null,
        photos: [],
      },
      {
        id: "task-005",
        title: "温度检查",
        description: "检查电机工作温度是否在正常范围内",
        isRii: false,
        status: "PENDING",
        completedBy: null,
        completedAt: null,
        photos: [],
      },
    ],
    partsUsed: [
      { id: "part-001", name: "M3螺丝", quantity: 4, unit: "个" },
      { id: "part-002", name: "垫片", quantity: 4, unit: "个" },
    ],
    attachments: [
      { id: "att-001", name: "检查表.pdf", type: "pdf", size: "245KB" },
      { id: "att-002", name: "电机测试数据.xlsx", type: "xlsx", size: "128KB" },
    ],
  },
};

/**
 * 工单详情页
 */
export function WorkOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showSignDialog, setShowSignDialog] = useState(false);
  const [signature, setSignature] = useState("");

  const workOrder = id ? MOCK_WORK_ORDER[id] : null;

  if (!workOrder) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">工单不存在</h2>
          <Button onClick={() => navigate("/work-orders")}>返回工单列表</Button>
        </div>
      </div>
    );
  }

  const StatusIcon = WORK_ORDER_STATUS[workOrder.status].icon;
  const completedTasks = workOrder.tasks.filter((t: any) => t.status === "COMPLETED").length;
  const totalTasks = workOrder.tasks.length;
  const progress = (completedTasks / totalTasks) * 100;

  const handleStatusChange = (newStatus: string) => {
    console.log("Status change:", newStatus);
    // TODO: Implement status change
  };

  const handleSign = () => {
    console.log("Sign work order:", signature);
    setShowSignDialog(false);
    // TODO: Implement signing
  };

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
            <Badge className={WORK_ORDER_STATUS[workOrder.status].color}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {WORK_ORDER_STATUS[workOrder.status].label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {workOrder.workOrderNumber}
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
          {workOrder.status === "INSPECTION_REQUIRED" && (
            <Button onClick={() => setShowSignDialog(true)}>
              <Signature className="h-4 w-4 mr-2" />
              签字放行
            </Button>
          )}
          {workOrder.status === "PENDING" && (
            <Button onClick={() => handleStatusChange("IN_PROGRESS")}>
              <Wrench className="h-4 w-4 mr-2" />
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
              负责人
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{workOrder.assignedTo}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              到期时间
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className={`font-medium ${new Date(workOrder.dueDate) < new Date() && workOrder.status !== "COMPLETED" ? "text-red-600" : ""}`}>
                {new Date(workOrder.dueDate).toLocaleDateString("zh-CN")}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              工时
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="font-medium">
              {workOrder.actualHours || 0} / {workOrder.estimatedHours} 小时
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
              <div className="space-y-4">
                {workOrder.tasks.map((task: any, index: number) => {
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
                            {index + 1}
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
                              {isCompleted ? "已完成" : "待处理"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {task.description}
                          </p>
                          {isCompleted && (
                            <div className="text-xs text-muted-foreground">
                              <span>完成人: {task.completedBy}</span>
                              <span className="mx-2">•</span>
                              <span>完成时间: {new Date(task.completedAt).toLocaleString("zh-CN")}</span>
                              {task.inspector && (
                                <>
                                  <span className="mx-2">•</span>
                                  <span>检验员: {task.inspector}</span>
                                </>
                              )}
                            </div>
                          )}
                          {task.photos && task.photos.length > 0 && (
                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                已添加 {task.photos.length} 张照片
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" disabled={isCompleted}>
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
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
                  <p className="font-medium">{workOrder.workOrderNumber}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">类型</Label>
                  <p className="font-medium">{workOrder.type === "SCHEDULED" ? "计划性" : "非计划性"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">优先级</Label>
                  <p className="font-medium">{workOrder.priority === "HIGH" ? "高" : workOrder.priority === "CRITICAL" ? "紧急" : "中"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">创建人</Label>
                  <p className="font-medium">{workOrder.createdBy}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">创建时间</Label>
                  <p className="font-medium">{new Date(workOrder.createdAt).toLocaleString("zh-CN")}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">开始时间</Label>
                  <p className="font-medium">
                    {workOrder.startedAt ? new Date(workOrder.startedAt).toLocaleString("zh-CN") : "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">完成时间</Label>
                  <p className="font-medium">
                    {workOrder.completedAt ? new Date(workOrder.completedAt).toLocaleString("zh-CN") : "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">预计工时</Label>
                  <p className="font-medium">{workOrder.estimatedHours} 小时</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">实际工时</Label>
                  <p className="font-medium">{workOrder.actualHours || 0} 小时</p>
                </div>
              </div>

              {workOrder.scheduleId && (
                <div>
                  <Label className="text-muted-foreground">关联维保计划</Label>
                  <Link
                    to={`/maintenance/schedules/${workOrder.scheduleId}`}
                    className="block font-medium text-primary hover:underline"
                  >
                    {workOrder.scheduleName}
                  </Link>
                </div>
              )}

              <div>
                <Label className="text-muted-foreground">描述</Label>
                <p className="text-sm">{workOrder.description}</p>
              </div>

              {workOrder.notes && (
                <div>
                  <Label className="text-muted-foreground">备注</Label>
                  <p className="text-sm">{workOrder.notes}</p>
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
              {workOrder.partsUsed.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4 font-medium text-sm">配件名称</th>
                      <th className="text-left py-2 px-4 font-medium text-sm">数量</th>
                      <th className="text-left py-2 px-4 font-medium text-sm">单位</th>
                      <th className="text-right py-2 px-4 font-medium text-sm">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workOrder.partsUsed.map((part: any) => (
                      <tr key={part.id} className="border-b">
                        <td className="py-3 px-4">{part.name}</td>
                        <td className="py-3 px-4">{part.quantity}</td>
                        <td className="py-3 px-4">{part.unit}</td>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {workOrder.attachments.map((att: any) => (
                  <div
                    key={att.id}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{att.name}</p>
                      <p className="text-xs text-muted-foreground">{att.size}</p>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
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
                      张三 开始执行工单
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      2026-01-15 10:30
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-slate-600" />
                    </div>
                    <div className="w-0.5 flex-1 bg-slate-200 mt-2" />
                  </div>
                  <div className="flex-1 pb-6">
                    <p className="font-medium">创建工单</p>
                    <p className="text-sm text-muted-foreground">
                      系统 创建了工单，分配给 张三
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      2026-01-15 09:00
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
              请确认工单已完成并签字放行。签字后工单将被标记为已完成。
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
            <Button onClick={handleSign} disabled={!signature}>
              <Signature className="h-4 w-4 mr-2" />
              确认放行
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
