/**
 * Mobile Work Order Execute Page
 * 移动端工单执行页面
 *
 * This is a mobile-optimized page for executing work orders in the field.
 * It features large touch targets, offline support considerations, and simplified workflows.
 */

import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  Clock,
  Camera,
  Mic,
  FileText,
  AlertTriangle,
  Wrench,
  User,
  Calendar,
  MapPin,
  ChevronRight,
  ChevronLeft,
  Home,
  Save,
  Pause,
  Play,
  CircleDot,
  Signature,
  MoreVertical,
  Loader2,
} from "lucide-react";
import {
  workOrderService,
  WorkOrder,
  WorkOrderTask,
} from "../services/work-order.service";
import { fullAircraftService, Aircraft } from "../services/fleet.service";
import { userService, User as UserType } from "../services/user.service";

// Extended work order type for execution page
interface ExecutionWorkOrder {
  id: string;
  title: string;
  status: string;
  priority: string;
  aircraft: {
    id: string;
    registration: string;
    model: string;
    serialNumber: string;
  } | null;
  location: string;
  scheduledStart: string | null;
  scheduledEnd: string | null;
  actualStart: string | null;
  estimatedDuration: number;
  elapsedTime: number;
  assignedTo: {
    id: string;
    name: string;
    role: string;
  } | null;
  tasks: {
    id: string;
    title: string;
    description: string | null;
    required: boolean;
    isRII: boolean;
    status: string;
    completedAt: string | null;
    completedBy: string | null;
    photos: string[];
    notes: string;
  }[];
  parts: { id: string; name: string; partNumber: string; quantity: number; used: number }[];
  tools: string[];
  warnings: string[];
}

const STATUS_CONFIG = {
  PENDING: {
    label: "待执行",
    color: "bg-slate-100 text-slate-700",
    icon: CircleDot,
  },
  IN_PROGRESS: {
    label: "进行中",
    color: "bg-blue-100 text-blue-700",
    icon: Play,
  },
  COMPLETED: {
    label: "已完成",
    color: "bg-green-100 text-green-700",
    icon: CheckCircle,
  },
  SKIPPED: {
    label: "已跳过",
    color: "bg-orange-100 text-orange-700",
    icon: XCircle,
  },
};

export function MobileWorkOrderExecutePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workOrder, setWorkOrder] = useState<ExecutionWorkOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [taskNotes, setTaskNotes] = useState("");
  const [isPaused, setIsPaused] = useState(false);

  // Load work order data
  useEffect(() => {
    async function loadWorkOrder() {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const wo = await workOrderService.getById(id);
        const tasks = await workOrderService.getTasks(id);

        // Load aircraft info
        let aircraft: { id: string; registration: string; model: string; serialNumber: string } | null = null;
        if (wo.aircraftId) {
          try {
            const aircraftData = await fullAircraftService.getById(wo.aircraftId);
            aircraft = {
              id: aircraftData.id,
              registration: aircraftData.registrationNumber,
              model: aircraftData.model,
              serialNumber: aircraftData.serialNumber,
            };
          } catch {
            console.warn("Failed to load aircraft info");
          }
        }

        // Load assignee info
        let assignedTo: { id: string; name: string; role: string } | null = null;
        if (wo.assignedTo) {
          try {
            const user = await userService.getById(wo.assignedTo);
            assignedTo = {
              id: user.id,
              name: user.name,
              role: user.role,
            };
          } catch {
            console.warn("Failed to load assignee info");
          }
        }

        // Map to ExecutionWorkOrder format
        const executionWorkOrder: ExecutionWorkOrder = {
          id: wo.id,
          title: wo.title,
          status: wo.status,
          priority: wo.priority,
          aircraft,
          location: "-",
          scheduledStart: wo.scheduledStart ? new Date(wo.scheduledStart).toISOString() : null,
          scheduledEnd: wo.scheduledEnd ? new Date(wo.scheduledEnd).toISOString() : null,
          actualStart: wo.actualStart ? new Date(wo.actualStart).toISOString() : null,
          estimatedDuration: 120,
          elapsedTime: wo.actualStart ? Math.floor((Date.now() - wo.actualStart) / 60000) : 0,
          assignedTo,
          tasks: tasks.map((t) => ({
            id: t.id,
            title: t.title,
            description: t.description,
            required: true,
            isRII: t.isRii,
            status: t.status,
            completedAt: t.completedAt ? new Date(t.completedAt).toISOString() : null,
            completedBy: null,
            photos: [],
            notes: t.notes || "",
          })),
          parts: [],
          tools: [],
          warnings: [],
        };

        setWorkOrder(executionWorkOrder);

        // Set current task index to first non-completed task
        const firstIncomplete = executionWorkOrder.tasks.findIndex((t) => t.status !== "COMPLETED");
        setCurrentTaskIndex(firstIncomplete >= 0 ? firstIncomplete : 0);
      } catch (err) {
        console.error("Failed to load work order:", err);
        setError("无法加载工单信息");
      } finally {
        setIsLoading(false);
      }
    }
    loadWorkOrder();
  }, [id]);

  const currentTask = workOrder?.tasks[currentTaskIndex];
  const completedCount = workOrder?.tasks.filter((t) => t.status === "COMPLETED").length || 0;
  const progress = workOrder ? (completedCount / workOrder.tasks.length) * 100 : 0;

  const handleCompleteTask = () => {
    if (!currentTask || !workOrder) return;
    console.log("Completing task:", currentTask.id);
    // Move to next task
    if (currentTaskIndex < workOrder.tasks.length - 1) {
      setCurrentTaskIndex(currentTaskIndex + 1);
    }
  };

  const handleSkipTask = () => {
    if (!currentTask || !workOrder) return;
    console.log("Skipping task:", currentTask.id);
    if (currentTaskIndex < workOrder.tasks.length - 1) {
      setCurrentTaskIndex(currentTaskIndex + 1);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-slate-600">加载工单信息...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !workOrder) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-slate-900 mb-2">{error || "未找到工单"}</h2>
          <p className="text-slate-600 mb-4">请检查工单是否存在或联系管理员</p>
          <Link
            to="/work-orders"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            <Home className="w-4 h-4" />
            返回工单列表
          </Link>
        </div>
      </div>
    );
  }

  // Empty tasks state
  if (!workOrder.tasks.length || !currentTask) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="text-center">
          <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-slate-900 mb-2">暂无工单任务</h2>
          <p className="text-slate-600 mb-4">此工单尚未添加任务项</p>
          <Link
            to={`/work-orders/${workOrder.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            查看工单详情
          </Link>
        </div>
      </div>
    );
  }

  const handlePrevTask = () => {
    if (currentTaskIndex > 0) {
      setCurrentTaskIndex(currentTaskIndex - 1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Mobile Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/work-orders" className="p-2 -ml-2 hover:bg-slate-100 rounded-lg">
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div className="text-center">
              <h1 className="text-base font-semibold text-slate-900">{workOrder.title}</h1>
              <p className="text-xs text-slate-500">{workOrder.id}</p>
            </div>
            <button className="p-2 -mr-2 hover:bg-slate-100 rounded-lg">
              <MoreVertical className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>进度</span>
              <span>{completedCount}/{workOrder.tasks.length} 已完成</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="pb-24">
        {/* Aircraft Info Card */}
        <div className="bg-white border-b border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-xl">✈️</span>
              </div>
              <div>
                <p className="font-semibold text-slate-900">{workOrder.aircraft.registration}</p>
                <p className="text-sm text-slate-500">{workOrder.aircraft.model}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-slate-500">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{workOrder.location}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-500 mt-1">
                <User className="w-4 h-4" />
                <span className="text-sm">{workOrder.assignedTo.name}</span>
              </div>
            </div>
          </div>

          {/* Timer */}
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-xs text-slate-500">已用时间</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {Math.floor(workOrder.elapsedTime / 60)}:{(workOrder.elapsedTime % 60).toString().padStart(2, "0")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPaused(!isPaused)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  isPaused ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                <span className="font-medium">{isPaused ? "继续" : "暂停"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Warnings */}
        {workOrder.warnings.length > 0 && (
          <div className="bg-orange-50 border-b border-orange-200 p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-orange-900">注意事项</p>
                <ul className="mt-2 space-y-1">
                  {workOrder.warnings.map((warning, index) => (
                    <li key={index} className="text-sm text-orange-700">
                      • {warning}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Task Navigation */}
        <div className="bg-white border-b border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevTask}
              disabled={currentTaskIndex === 0}
              className={`p-2 rounded-lg ${
                currentTaskIndex === 0 ? "text-slate-300" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="text-center">
              <p className="text-sm text-slate-500">任务 {currentTaskIndex + 1} / {workOrder.tasks.length}</p>
            </div>
            <button
              onClick={() => setCurrentTaskIndex(currentTaskIndex + 1)}
              disabled={currentTaskIndex === workOrder.tasks.length - 1}
              className={`p-2 rounded-lg ${
                currentTaskIndex === workOrder.tasks.length - 1
                  ? "text-slate-300"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Current Task */}
        {currentTask && (
          <div className="bg-white m-4 rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-slate-900">{currentTask.title}</h2>
                    {currentTask.isRII && (
                      <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded">
                        必检项
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mt-1">{currentTask.description}</p>
                </div>
                <div className={`px-2 py-1 text-xs font-medium rounded ${
                  STATUS_CONFIG[currentTask.status as keyof typeof STATUS_CONFIG].color
                }`}>
                  {STATUS_CONFIG[currentTask.status as keyof typeof STATUS_CONFIG].label}
                </div>
              </div>
            </div>

            {/* Task Actions */}
            <div className="p-4 space-y-3">
              {/* Photo Capture */}
              <button
                onClick={() => setShowPhotoModal(true)}
                className="w-full flex items-center justify-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 active:bg-slate-200"
              >
                <Camera className="w-6 h-6 text-slate-600" />
                <div className="text-left">
                  <p className="font-medium text-slate-900">拍照记录</p>
                  <p className="text-xs text-slate-500">
                    {currentTask.photos.length > 0 ? `${currentTask.photos.length} 张照片` : "添加现场照片"}
                  </p>
                </div>
              </button>

              {/* Voice Note */}
              <button
                onClick={() => setShowVoiceModal(true)}
                className="w-full flex items-center justify-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 active:bg-slate-200"
              >
                <Mic className="w-6 h-6 text-slate-600" />
                <div className="text-left">
                  <p className="font-medium text-slate-900">语音备注</p>
                  <p className="text-xs text-slate-500">录制语音说明</p>
                </div>
              </button>

              {/* Notes Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  文字备注
                </label>
                <textarea
                  value={taskNotes}
                  onChange={(e) => setTaskNotes(e.target.value)}
                  placeholder="输入任务执行备注..."
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-3 gap-3">
                <button className="flex flex-col items-center justify-center p-3 bg-blue-50 border border-blue-200 rounded-xl active:bg-blue-100">
                  <CheckCircle className="w-6 h-6 text-blue-600 mb-1" />
                  <span className="text-xs font-medium text-blue-700">正常</span>
                </button>
                <button className="flex flex-col items-center justify-center p-3 bg-yellow-50 border border-yellow-200 rounded-xl active:bg-yellow-100">
                  <AlertTriangle className="w-6 h-6 text-yellow-600 mb-1" />
                  <span className="text-xs font-medium text-yellow-700">异常</span>
                </button>
                <button className="flex flex-col items-center justify-center p-3 bg-slate-50 border border-slate-200 rounded-xl active:bg-slate-100">
                  <Wrench className="w-6 h-6 text-slate-600 mb-1" />
                  <span className="text-xs font-medium text-slate-700">需维修</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Task List Overview */}
        <div className="bg-white m-4 rounded-xl border border-slate-200 p-4">
          <h3 className="font-semibold text-slate-900 mb-3">任务列表</h3>
          <div className="space-y-2">
            {workOrder.tasks.map((task, index) => {
              const StatusIcon = STATUS_CONFIG[task.status as keyof typeof STATUS_CONFIG].icon;
              const isActive = index === currentTaskIndex;

              return (
                <button
                  key={task.id}
                  onClick={() => setCurrentTaskIndex(index)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    isActive
                      ? "bg-blue-50 border-blue-300"
                      : "bg-white border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : task.status === "COMPLETED"
                        ? "bg-green-100 text-green-600"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {task.status === "COMPLETED" ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p
                      className={`text-sm font-medium ${
                        isActive ? "text-blue-700" : "text-slate-900"
                      }`}
                    >
                      {task.title}
                    </p>
                    {task.isRII && (
                      <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                        RII
                      </span>
                    )}
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-slate-400"}`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Tools Reference */}
        <div className="bg-white m-4 rounded-xl border border-slate-200 p-4">
          <h3 className="font-semibold text-slate-900 mb-3">所需工具</h3>
          <div className="flex flex-wrap gap-2">
            {workOrder.tools.map((tool) => (
              <span
                key={tool}
                className="px-3 py-1.5 text-sm bg-slate-100 text-slate-700 rounded-lg"
              >
                {tool}
              </span>
            ))}
          </div>
        </div>
      </main>

      {/* Bottom Action Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-3 z-50">
        <div className="flex items-center gap-3">
          <Link
            to="/work-orders"
            className="flex items-center justify-center gap-2 p-3 bg-slate-100 text-slate-700 rounded-xl flex-1"
          >
            <Home className="w-5 h-5" />
            <span className="font-medium">首页</span>
          </Link>
          <button
            onClick={handleSkipTask}
            className="flex items-center justify-center gap-2 p-3 bg-orange-100 text-orange-700 rounded-xl flex-1"
          >
            <XCircle className="w-5 h-5" />
            <span className="font-medium">跳过</span>
          </button>
          <button
            onClick={handleCompleteTask}
            className="flex items-center justify-center gap-2 p-3 bg-blue-600 text-white rounded-xl flex-1"
          >
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">完成</span>
          </button>
        </div>
      </nav>

      {/* Photo Modal (Placeholder) */}
      {showPhotoModal && (
        <div className="fixed inset-0 bg-black/80 flex items-end z-50">
          <div className="bg-white rounded-t-3xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">拍照记录</h3>
              <button
                onClick={() => setShowPhotoModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                ×
              </button>
            </div>
            <div className="aspect-square bg-slate-100 rounded-xl flex items-center justify-center mb-4">
              <Camera className="w-16 h-16 text-slate-400" />
            </div>
            <button className="w-full py-4 bg-blue-600 text-white rounded-xl font-medium">
              拍照
            </button>
          </div>
        </div>
      )}

      {/* Voice Modal (Placeholder) */}
      {showVoiceModal && (
        <div className="fixed inset-0 bg-black/80 flex items-end z-50">
          <div className="bg-white rounded-t-3xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">语音备注</h3>
              <button
                onClick={() => setShowVoiceModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                ×
              </button>
            </div>
            <div className="py-8 flex flex-col items-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Mic className="w-10 h-10 text-red-600" />
              </div>
              <p className="text-slate-500">按住说话</p>
            </div>
          </div>
        </div>
      )}

      {/* Signature Modal (Placeholder) */}
      {showSignatureModal && (
        <div className="fixed inset-0 bg-black/80 flex items-end z-50">
          <div className="bg-white rounded-t-3xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">签字确认</h3>
              <button
                onClick={() => setShowSignatureModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                ×
              </button>
            </div>
            <div className="aspect-[2/1] bg-slate-100 rounded-xl flex items-center justify-center mb-4">
              <Signature className="w-12 h-12 text-slate-400" />
            </div>
            <button className="w-full py-4 bg-blue-600 text-white rounded-xl font-medium">
              确认签字
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
