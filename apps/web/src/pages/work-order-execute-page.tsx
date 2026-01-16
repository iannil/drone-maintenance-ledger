import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Camera,
  Send,
  Clock,
  AlertCircle,
  User,
  Calendar,
  Wrench,
  FileText,
  Save,
  Plus,
  X,
  ChevronRight,
  ChevronLeft,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { AircraftStatusBadge } from "../components/common/status-badge";

// Mock work order data
const MOCK_WORK_ORDER = {
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
  actualHours: 0,
  notes: "",
  tasks: [
    {
      id: "task-001",
      title: "外观检查 - 左前电机",
      description: "检查电机外观是否有损伤、裂纹或异物，检查固定螺丝是否松动",
      isRii: false,
      status: "PENDING",
      completedBy: null,
      completedAt: null,
      photos: [],
      notes: "",
    },
    {
      id: "task-002",
      title: "外观检查 - 右前电机",
      description: "检查电机外观是否有损伤、裂纹或异物，检查固定螺丝是否松动",
      isRii: false,
      status: "PENDING",
      completedBy: null,
      completedAt: null,
      photos: [],
      notes: "",
    },
    {
      id: "task-003",
      title: "外观检查 - 左后电机",
      description: "检查电机外观是否有损伤、裂纹或异物，检查固定螺丝是否松动",
      isRii: false,
      status: "PENDING",
      completedBy: null,
      completedAt: null,
      photos: [],
      notes: "",
    },
    {
      id: "task-004",
      title: "外观检查 - 右后电机",
      description: "检查电机外观是否有损伤、裂纹或异物，检查固定螺丝是否松动",
      isRii: false,
      status: "PENDING",
      completedBy: null,
      completedAt: null,
      photos: [],
      notes: "",
    },
    {
      id: "task-005",
      title: "转速测试 - 左前电机",
      description: "测试电机最大转速，检查是否平稳，有无异响",
      isRii: true,
      status: "PENDING",
      completedBy: null,
      completedAt: null,
      photos: [],
      notes: "",
      inspector: null,
      inspectedAt: null,
    },
    {
      id: "task-006",
      title: "转速测试 - 右前电机",
      description: "测试电机最大转速，检查是否平稳，有无异响",
      isRii: true,
      status: "PENDING",
      completedBy: null,
      completedAt: null,
      photos: [],
      notes: "",
      inspector: null,
      inspectedAt: null,
    },
    {
      id: "task-007",
      title: "温度检查",
      description: "检查电机工作温度是否在正常范围内",
      isRii: false,
      status: "PENDING",
      completedBy: null,
      completedAt: null,
      photos: [],
      notes: "",
    },
  ],
  partsUsed: [],
  attachments: [],
};

interface TaskExecution {
  taskId: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  notes: string;
  photos: File[];
  completedAt: string | null;
}

/**
 * Work order execution page for technicians to perform maintenance tasks
 */
export function WorkOrderExecutePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // State
  const [workOrder, setWorkOrder] = useState(MOCK_WORK_ORDER);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [taskExecutions, setTaskExecutions] = useState<Record<string, TaskExecution>>({});
  const [showPhotoDialog, setShowPhotoDialog] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [selectedPhotoTask, setSelectedPhotoTask] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0); // in minutes

  // Timer for tracking work time
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const currentTask = workOrder.tasks[currentTaskIndex];
  const currentExecution = taskExecutions[currentTask.id] || {
    taskId: currentTask.id,
    status: currentTask.status,
    notes: "",
    photos: [],
    completedAt: null,
  };

  // Calculate progress
  const completedTasks = workOrder.tasks.filter((t) => {
    const exec = taskExecutions[t.id];
    return exec?.status === "COMPLETED" || t.status === "COMPLETED";
  }).length;
  const progress = (completedTasks / workOrder.tasks.length) * 100;

  // Navigate tasks
  const goToTask = (index: number) => {
    setCurrentTaskIndex(index);
  };

  const goToNextTask = () => {
    if (currentTaskIndex < workOrder.tasks.length - 1) {
      setCurrentTaskIndex(currentTaskIndex + 1);
    }
  };

  const goToPrevTask = () => {
    if (currentTaskIndex > 0) {
      setCurrentTaskIndex(currentTaskIndex - 1);
    }
  };

  // Update task execution
  const updateTaskExecution = (updates: Partial<TaskExecution>) => {
    setTaskExecutions((prev) => ({
      ...prev,
      [currentTask.id]: {
        ...currentExecution,
        ...updates,
      },
    }));
  };

  // Complete current task
  const completeTask = () => {
    updateTaskExecution({
      status: "COMPLETED",
      completedAt: new Date().toISOString(),
    });
    // Auto advance to next task after short delay
    setTimeout(() => {
      if (currentTaskIndex < workOrder.tasks.length - 1) {
        goToNextTask();
      }
    }, 500);
  };

  // Reopen task
  const reopenTask = () => {
    updateTaskExecution({
      status: "PENDING",
      completedAt: null,
    });
  };

  // Handle photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      updateTaskExecution({
        photos: [...currentExecution.photos, ...files],
      });
      setShowPhotoDialog(false);
    }
  };

  // Remove photo
  const handleRemovePhoto = (photoIndex: number) => {
    updateTaskExecution({
      photos: currentExecution.photos.filter((_, i) => i !== photoIndex),
    });
  };

  // Submit work order
  const handleSubmitWorkOrder = () => {
    console.log("Submit work order:", {
      workOrderId: workOrder.id,
      taskExecutions,
      elapsedTime,
    });
    // TODO: API call to submit work order
    setShowSubmitDialog(false);
    navigate(`/work-orders/${id}`);
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
          <h1 className="text-2xl font-bold text-slate-900">{workOrder.title}</h1>
          <p className="text-muted-foreground">
            {workOrder.workOrderNumber} · 任务执行
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate(`/work-orders/${id}`)}>
            暂存退出
          </Button>
          <Button onClick={() => setShowSubmitDialog(true)} disabled={completedTasks === 0}>
            <Send className="w-4 h-4 mr-2" />
            提交工单
          </Button>
        </div>
      </div>

      {/* Work Order Info Bar */}
      <Card className="bg-slate-50">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <span className="text-muted-foreground">负责人:</span>
                <span className="font-medium ml-1">{workOrder.assignedTo}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <span className="text-muted-foreground">到期:</span>
                <span className="font-medium ml-1">
                  {new Date(workOrder.dueDate).toLocaleDateString("zh-CN")}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <span className="text-muted-foreground">已用时:</span>
                <span className="font-medium ml-1">{Math.floor(elapsedTime / 60)}h {elapsedTime % 60}m</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <span className="text-muted-foreground">进度:</span>
                <span className="font-medium ml-1">{completedTasks}/{workOrder.tasks.length}</span>
              </span>
            </div>
            <div className="flex-1" />
            <Link
              to={`/aircraft/${workOrder.aircraftId}`}
              className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              {workOrder.aircraftRegistration}
              <AircraftStatusBadge status="SERVICEABLE" />
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Task Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Progress Bar */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">完成进度</span>
                <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Current Task */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-xl">
                      任务 {currentTaskIndex + 1} / {workOrder.tasks.length}
                    </CardTitle>
                    {currentTask.isRii && (
                      <Badge variant="outline" className="border-red-500 text-red-700">
                        必检项 (RII)
                      </Badge>
                    )}
                    {currentExecution.status === "COMPLETED" ? (
                      <Badge className="bg-green-100 text-green-700">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        已完成
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        <Circle className="h-3 w-3 mr-1" />
                        待处理
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-base">
                    {currentTask.title}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Task Description */}
              <div>
                <Label className="text-muted-foreground">任务描述</Label>
                <p className="mt-1 text-sm">{currentTask.description}</p>
              </div>

              {/* Task Instructions */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="font-medium text-blue-900 mb-2">执行要点</p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• 仔细检查所有相关部位</li>
                  <li>• 如发现异常，请在下方备注中详细记录</li>
                  <li>• 建议拍摄照片存档</li>
                  {currentTask.isRii && (
                    <li className="font-medium">• 此任务为必检项，完成后需要检验员签字确认</li>
                  )}
                </ul>
              </div>

              {/* Execution Notes */}
              <div>
                <Label htmlFor="notes">执行备注</Label>
                <Textarea
                  id="notes"
                  placeholder="记录执行过程中发现的问题、检查结果等..."
                  value={currentExecution.notes}
                  onChange={(e) => updateTaskExecution({ notes: e.target.value })}
                  rows={4}
                  className="mt-1"
                />
              </div>

              {/* Photos */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label>现场照片</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedPhotoTask(currentTask.id);
                      setShowPhotoDialog(true);
                    }}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    添加照片
                  </Button>
                </div>
                {currentExecution.photos.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {currentExecution.photos.map((photo, index) => (
                      <div
                        key={index}
                        className="relative aspect-square rounded-lg overflow-hidden border group"
                      >
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemovePhoto(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground border rounded-lg border-dashed">
                    <Camera className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">暂无照片</p>
                    <p className="text-xs mt-1">点击上方按钮添加现场照片</p>
                  </div>
                )}
              </div>

              {/* Task Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={goToPrevTask}
                  disabled={currentTaskIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  上一任务
                </Button>

                <div className="flex items-center gap-2">
                  {currentExecution.status === "COMPLETED" ? (
                    <>
                      <span className="text-sm text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" />
                        已完成
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={reopenTask}
                      >
                        重新打开
                      </Button>
                    </>
                  ) : (
                    <Button onClick={completeTask}>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      标记完成
                    </Button>
                  )}
                </div>

                <Button
                  variant="outline"
                  onClick={goToNextTask}
                  disabled={currentTaskIndex === workOrder.tasks.length - 1}
                >
                  下一任务
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Reference Materials */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">参考资料</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link to={`/maintenance/schedules/${workOrder.scheduleId}`}>
                    <FileText className="h-4 w-4 mr-2" />
                    查看维保计划详情
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link to={`/aircraft/${workOrder.aircraftId}`}>
                    <FileText className="h-4 w-4 mr-2" />
                    查看飞机技术手册
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Task List */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">任务列表</CardTitle>
              <CardDescription>
                已完成 {completedTasks} / {workOrder.tasks.length}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-2">
              <div className="space-y-1">
                {workOrder.tasks.map((task, index) => {
                  const exec = taskExecutions[task.id];
                  const isCompleted = exec?.status === "COMPLETED" || task.status === "COMPLETED";
                  const isCurrent = index === currentTaskIndex;

                  return (
                    <button
                      key={task.id}
                      onClick={() => goToTask(index)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        isCurrent
                          ? "bg-primary text-primary-foreground"
                          : isCompleted
                          ? "bg-green-50 text-green-700 hover:bg-green-100"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                          isCompleted
                            ? "bg-green-500 text-white"
                            : isCurrent
                            ? "bg-white/20"
                            : "bg-slate-200 text-slate-600"
                        }`}>
                          {isCompleted ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            index + 1
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{task.title}</p>
                          {task.isRii && (
                            <Badge variant="outline" className={`text-xs mt-1 ${
                              isCurrent ? "border-white/30 text-white" : "border-red-500 text-red-700"
                            }`}>
                              RII
                            </Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">快捷操作</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to={`/work-orders/${id}`}>
                  <FileText className="h-4 w-4 mr-2" />
                  查看工单详情
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowSubmitDialog(true)}
                disabled={completedTasks === 0}
              >
                <Send className="h-4 w-4 mr-2" />
                提交工单
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Photo Upload Dialog */}
      <Dialog open={showPhotoDialog} onOpenChange={setShowPhotoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加现场照片</DialogTitle>
            <DialogDescription>
              上传任务执行过程中的现场照片
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="hidden"
              id="photo-upload"
            />
            <Button
              className="w-full"
              onClick={() => document.getElementById("photo-upload")?.click()}
            >
              <Camera className="h-4 w-4 mr-2" />
              选择照片
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              支持多选，可同时上传多张照片
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPhotoDialog(false)}>
              取消
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Submit Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>提交工单</DialogTitle>
            <DialogDescription>
              确认要提交此工单吗？
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">完成任务</p>
                <p className="font-medium">{completedTasks} / {workOrder.tasks.length}</p>
              </div>
              <div>
                <p className="text-muted-foreground">工作时长</p>
                <p className="font-medium">{Math.floor(elapsedTime / 60)}h {elapsedTime % 60}m</p>
              </div>
            </div>

            {completedTasks < workOrder.tasks.length && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 rounded text-amber-800 text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">还有未完成的任务</p>
                  <p className="text-xs mt-1">
                    确认要提交工单吗？未完成的任务将保持待处理状态。
                  </p>
                </div>
              </div>
            )}

            {/* Check for RII tasks */}
            {workOrder.tasks.filter((t) => t.isRii).length > 0 && (
              <div className="p-3 bg-blue-50 rounded text-blue-800 text-sm">
                <p className="font-medium">包含必检项任务</p>
                <p className="text-xs mt-1">
                  此工单包含必检项(RII)，提交后需要检验员审核签字才能最终完成。
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="finalNotes">最终备注</Label>
              <Textarea
                id="finalNotes"
                placeholder="总结本次维修工作，记录发现的问题或建议..."
                rows={3}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
              继续工作
            </Button>
            <Button onClick={handleSubmitWorkOrder}>
              <Send className="h-4 w-4 mr-2" />
              确认提交
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
