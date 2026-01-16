/**
 * Mobile Work Order Execute Page
 * 移动端工单执行页面
 *
 * This is a mobile-optimized page for executing work orders in the field.
 * It features large touch targets, offline support considerations, and simplified workflows.
 */

import { useState } from "react";
import { useParams, Link } from "react-router-dom";
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
} from "lucide-react";

// Mock work order data
const MOCK_WORK_ORDER = {
  id: "WO-2025-0142",
  title: "50小时检查 - B-702A",
  status: "IN_PROGRESS",
  priority: "NORMAL",
  aircraft: {
    id: "AC-2024-0015",
    registration: "B-702A",
    model: "DJI Matrice 350 RTK",
    serialNumber: "SN-M350-0015",
  },
  location: "北京基地机库1号位",
  scheduledStart: "2025-01-15T09:00:00",
  scheduledEnd: "2025-01-15T11:00:00",
  actualStart: "2025-01-15T09:15:00",
  estimatedDuration: 120, // minutes
  elapsedTime: 45, // minutes
  assignedTo: {
    id: "U-001",
    name: "张维修",
    role: "MECHANIC",
  },
  tasks: [
    {
      id: "task-001",
      title: "外观检查",
      description: "检查机体是否有裂纹、变形、腐蚀等损伤",
      required: true,
      isRII: false,
      status: "COMPLETED",
      completedAt: "2025-01-15T09:25:00",
      completedBy: "张维修",
      photos: ["photo-001.jpg"],
      notes: "未发现异常",
    },
    {
      id: "task-002",
      title: "螺旋桨检查",
      description: "检查桨叶是否有损伤、变形，平衡状态是否正常",
      required: true,
      isRII: false,
      status: "COMPLETED",
      completedAt: "2025-01-15T09:45:00",
      completedBy: "张维修",
      photos: ["photo-002.jpg", "photo-003.jpg"],
      notes: "左侧桨叶发现轻微划痕，不影响使用",
    },
    {
      id: "task-003",
      title: "电机测试",
      description: "测试各电机运转状态，检查异响、振动",
      required: true,
      isRII: false,
      status: "IN_PROGRESS",
      completedAt: null,
      completedBy: null,
      photos: [],
      notes: "",
    },
    {
      id: "task-004",
      title: "电池检查",
      description: "检查电池外观、电压、内阻、循环次数",
      required: true,
      isRII: false,
      status: "PENDING",
      completedAt: null,
      completedBy: null,
      photos: [],
      notes: "",
    },
    {
      id: "task-005",
      title: "云台校准",
      description: "校准云台，检查俯仰、横滚、航向动作",
      required: true,
      isRII: false,
      status: "PENDING",
      completedAt: null,
      completedBy: null,
      photos: [],
      notes: "",
    },
    {
      id: "task-006",
      title: "GPS测试",
      description: "测试GPS定位精度和卫星数量",
      required: true,
      isRII: false,
      status: "PENDING",
      completedAt: null,
      completedBy: null,
      photos: [],
      notes: "",
    },
    {
      id: "task-007",
      title: "试飞验证",
      description: "进行功能测试飞行，验证所有系统正常",
      required: true,
      isRII: true,
      status: "PENDING",
      completedAt: null,
      completedBy: null,
      photos: [],
      notes: "",
    },
  ],
  parts: [
    { id: "1", name: "桨叶 M350", partNumber: "PROP-M350-01", quantity: 0, used: 0 },
  ],
  tools: ["扭力扳手", "万用表", "笔记本电脑", "校准工具"],
  warnings: [
    "注意电机高温，等待冷却后再操作",
    "试飞前确保周围空域安全",
  ],
};

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
  const [currentTaskIndex, setCurrentTaskIndex] = useState(2); // Start with current task
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [taskNotes, setTaskNotes] = useState("");
  const [isPaused, setIsPaused] = useState(false);

  const currentTask = MOCK_WORK_ORDER.tasks[currentTaskIndex];
  const completedCount = MOCK_WORK_ORDER.tasks.filter((t) => t.status === "COMPLETED").length;
  const progress = (completedCount / MOCK_WORK_ORDER.tasks.length) * 100;

  const handleCompleteTask = () => {
    console.log("Completing task:", currentTask.id);
    // Move to next task
    if (currentTaskIndex < MOCK_WORK_ORDER.tasks.length - 1) {
      setCurrentTaskIndex(currentTaskIndex + 1);
    }
  };

  const handleSkipTask = () => {
    console.log("Skipping task:", currentTask.id);
    if (currentTaskIndex < MOCK_WORK_ORDER.tasks.length - 1) {
      setCurrentTaskIndex(currentTaskIndex + 1);
    }
  };

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
              <h1 className="text-base font-semibold text-slate-900">{MOCK_WORK_ORDER.title}</h1>
              <p className="text-xs text-slate-500">{MOCK_WORK_ORDER.id}</p>
            </div>
            <button className="p-2 -mr-2 hover:bg-slate-100 rounded-lg">
              <MoreVertical className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>进度</span>
              <span>{completedCount}/{MOCK_WORK_ORDER.tasks.length} 已完成</span>
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
                <p className="font-semibold text-slate-900">{MOCK_WORK_ORDER.aircraft.registration}</p>
                <p className="text-sm text-slate-500">{MOCK_WORK_ORDER.aircraft.model}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-slate-500">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{MOCK_WORK_ORDER.location}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-500 mt-1">
                <User className="w-4 h-4" />
                <span className="text-sm">{MOCK_WORK_ORDER.assignedTo.name}</span>
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
                    {Math.floor(MOCK_WORK_ORDER.elapsedTime / 60)}:{(MOCK_WORK_ORDER.elapsedTime % 60).toString().padStart(2, "0")}
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
        {MOCK_WORK_ORDER.warnings.length > 0 && (
          <div className="bg-orange-50 border-b border-orange-200 p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-orange-900">注意事项</p>
                <ul className="mt-2 space-y-1">
                  {MOCK_WORK_ORDER.warnings.map((warning, index) => (
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
              <p className="text-sm text-slate-500">任务 {currentTaskIndex + 1} / {MOCK_WORK_ORDER.tasks.length}</p>
            </div>
            <button
              onClick={() => setCurrentTaskIndex(currentTaskIndex + 1)}
              disabled={currentTaskIndex === MOCK_WORK_ORDER.tasks.length - 1}
              className={`p-2 rounded-lg ${
                currentTaskIndex === MOCK_WORK_ORDER.tasks.length - 1
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
            {MOCK_WORK_ORDER.tasks.map((task, index) => {
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
            {MOCK_WORK_ORDER.tools.map((tool) => (
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
