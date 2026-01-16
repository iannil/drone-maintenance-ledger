import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Search,
  Package,
  AlertCircle,
  CheckCircle2,
  Wrench,
  Calendar,
  Clock,
  FileText,
  Upload,
  X,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { AircraftStatusBadge } from "../components/common/status-badge";

// Work order types
const WORK_ORDER_TYPES = [
  { value: "SCHEDULED", label: "计划性维护", description: "按维保计划执行的定期检查" },
  { value: "UNSCHEDULED", label: "非计划性维修", description: "故障修复、临时检修等" },
  { value: "MODIFICATION", label: "改装/升级", description: "设备改装、软件升级等" },
  { value: "INSPECTION", label: "专项检查", description: "事故后检查、适航检查等" },
];

// Priority levels
const PRIORITY_LEVELS = [
  { value: "LOW", label: "低", color: "bg-slate-100 text-slate-700" },
  { value: "MEDIUM", label: "中", color: "bg-yellow-100 text-yellow-700" },
  { value: "HIGH", label: "高", color: "bg-orange-100 text-orange-700" },
  { value: "CRITICAL", label: "紧急", color: "bg-red-100 text-red-700" },
];

// Mock aircraft data
const MOCK_AIRCRAFT = [
  {
    id: "ac-001",
    registration: "B-7011U",
    model: "DJI M350 RTK",
    status: "SERVICEABLE",
    totalFlightHours: 125.5,
    location: "基地停机坪",
    upcomingMaintenance: [
      { id: "ms-001", name: "电机定期检查", dueIn: "5h", type: "FH" },
    ],
  },
  {
    id: "ac-002",
    registration: "B-7012U",
    model: "DJI M350 RTK",
    status: "SERVICEABLE",
    totalFlightHours: 89.3,
    location: "巡检点A",
    upcomingMaintenance: [],
  },
  {
    id: "ac-003",
    registration: "B-7013U",
    model: "DJI M300 RTK",
    status: "MAINTENANCE",
    totalFlightHours: 210.8,
    location: "维修车间",
    upcomingMaintenance: [
      { id: "ms-002", name: "180天检查", dueIn: "2天", type: "CALENDAR" },
    ],
  },
  {
    id: "ac-004",
    registration: "B-7021U",
    model: "DJI Mavic 3E",
    status: "GROUNDED",
    totalFlightHours: 45.2,
    location: "维修车间",
    upcomingMaintenance: [
      { id: "ms-003", name: "GPS模块更换", dueIn: "已逾期", type: "CALENDAR" },
    ],
  },
];

// Mock maintenance schedules
const MOCK_SCHEDULES = [
  {
    id: "ms-001",
    name: "电机定期检查",
    description: "每50飞行小时检查电机状态",
    triggerType: "FH",
    triggerValue: 50,
    tasks: [
      { title: "外观检查 - 左前电机", description: "检查电机外观是否有损伤", isRii: false },
      { title: "外观检查 - 右前电机", description: "检查电机外观是否有损伤", isRii: false },
      { title: "外观检查 - 左后电机", description: "检查电机外观是否有损伤", isRii: false },
      { title: "外观检查 - 右后电机", description: "检查电机外观是否有损伤", isRii: false },
      { title: "转速测试 - 左前电机", description: "测试电机最大转速", isRii: true },
      { title: "转速测试 - 右前电机", description: "测试电机最大转速", isRii: true },
      { title: "温度检查", description: "检查电机工作温度", isRii: false },
    ],
  },
  {
    id: "ms-002",
    name: "180天定期检查",
    description: "每180天执行全面检查",
    triggerType: "CALENDAR",
    triggerValue: 180,
    tasks: [
      { title: "机身结构检查", description: "检查机身结构完整性", isRii: true },
      { title: "电池系统检查", description: "检查电池仓和电源管理系统", isRii: false },
      { title: "通信系统测试", description: "测试图传和遥控信号", isRii: false },
    ],
  },
];

// Mock inventory parts
const MOCK_PARTS = [
  { id: "part-001", name: "电机组件", partNumber: "MOTOR-350-01", quantity: 5, unit: "个", location: "A-01" },
  { id: "part-002", name: "螺旋桨", partNumber: "PROP-350-21", quantity: 24, unit: "个", location: "B-03" },
  { id: "part-003", name: "电池包 TB65", partNumber: "BATT-TB65", quantity: 12, unit: "个", location: "C-01" },
  { id: "part-004", name: "GPS模块", partNumber: "GPS-M300-01", quantity: 2, unit: "个", location: "A-05" },
  { id: "part-005", name: "主控板", partNumber: "FC-350-01", quantity: 1, unit: "个", location: "A-02" },
];

// Mock technicians
const MOCK_TECHNICIANS = [
  { id: "user-001", name: "张三", role: "MECHANIC", specialization: "电机系统" },
  { id: "user-002", name: "李四", role: "MECHANIC", specialization: "结构维修" },
  { id: "user-003", name: "王五", role: "MECHANIC", specialization: "电子设备" },
  { id: "user-004", name: "赵六", role: "INSPECTOR", specialization: "质量检验" },
];

interface Task {
  id: string;
  title: string;
  description: string;
  isRii: boolean;
}

interface PartReservation {
  id: string;
  partId: string;
  partName: string;
  partNumber: string;
  quantity: number;
  unit: string;
  location: string;
}

interface WorkOrderFormData {
  workOrderType: string;
  aircraftId: string;
  scheduleId: string;
  title: string;
  description: string;
  priority: string;
  assignedTo: string;
  dueDate: string;
  estimatedHours: number;
  tasks: Task[];
  parts: PartReservation[];
  notes: string;
  attachments: File[];
}

/**
 * Work order form page for creating/editing work orders
 */
export function WorkOrderFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  // Form state
  const [formData, setFormData] = useState<WorkOrderFormData>({
    workOrderType: "SCHEDULED",
    aircraftId: "",
    scheduleId: "",
    title: "",
    description: "",
    priority: "MEDIUM",
    assignedTo: "",
    dueDate: "",
    estimatedHours: 2,
    tasks: [],
    parts: [],
    notes: "",
    attachments: [],
  });

  // UI state
  const [showPartDialog, setShowPartDialog] = useState(false);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [selectedAircraft, setSelectedAircraft] = useState<typeof MOCK_AIRCRAFT[0] | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<typeof MOCK_SCHEDULES[0] | null>(null);
  const [partSearch, setPartSearch] = useState("");
  const [filteredParts, setFilteredParts] = useState(MOCK_PARTS);
  const [newTask, setNewTask] = useState<Partial<Task>>({ title: "", description: "", isRii: false });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update aircraft info when selection changes
  useEffect(() => {
    if (formData.aircraftId) {
      const aircraft = MOCK_AIRCRAFT.find((a) => a.id === formData.aircraftId);
      setSelectedAircraft(aircraft || null);

      // Auto-suggest schedule if aircraft has upcoming maintenance
      if (aircraft && aircraft.upcomingMaintenance.length > 0 && !formData.scheduleId) {
        const suggestedSchedule = aircraft.upcomingMaintenance[0];
        setSelectedSchedule(MOCK_SCHEDULES.find((s) => s.id === suggestedSchedule.id) || null);
        setFormData((prev) => ({ ...prev, scheduleId: suggestedSchedule.id }));
      }
    } else {
      setSelectedAircraft(null);
    }
  }, [formData.aircraftId]);

  // Update schedule info when selection changes
  useEffect(() => {
    if (formData.scheduleId) {
      const schedule = MOCK_SCHEDULES.find((s) => s.id === formData.scheduleId);
      setSelectedSchedule(schedule || null);

      // Auto-fill tasks from schedule
      if (schedule && formData.tasks.length === 0) {
        setFormData((prev) => ({
          ...prev,
          tasks: schedule.tasks.map((t, i) => ({ ...t, id: `task-${Date.now()}-${i}` })),
          title: prev.title || schedule.name,
          description: prev.description || schedule.description,
        }));
      }
    } else {
      setSelectedSchedule(null);
    }
  }, [formData.scheduleId]);

  // Filter parts based on search
  useEffect(() => {
    if (partSearch) {
      setFilteredParts(
        MOCK_PARTS.filter(
          (p) =>
            p.name.toLowerCase().includes(partSearch.toLowerCase()) ||
            p.partNumber.toLowerCase().includes(partSearch.toLowerCase())
        )
      );
    } else {
      setFilteredParts(MOCK_PARTS);
    }
  }, [partSearch]);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.aircraftId) {
      newErrors.aircraftId = "请选择飞机";
    }
    if (!formData.title.trim()) {
      newErrors.title = "请输入工单标题";
    }
    if (!formData.assignedTo) {
      newErrors.assignedTo = "请指定负责人";
    }
    if (!formData.dueDate) {
      newErrors.dueDate = "请选择到期日期";
    }
    if (formData.tasks.length === 0) {
      newErrors.tasks = "请至少添加一个任务";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = () => {
    if (validateForm()) {
      console.log("Submit work order:", formData);
      // TODO: API call to create/update work order
      navigate("/work-orders");
    }
  };

  // Update form field
  const updateField = <K extends keyof WorkOrderFormData>(
    key: K,
    value: WorkOrderFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    // Clear error when user starts typing
    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  // Add task
  const handleAddTask = () => {
    if (newTask.title.trim()) {
      setFormData((prev) => ({
        ...prev,
        tasks: [
          ...prev.tasks,
          {
            id: `task-${Date.now()}`,
            title: newTask.title!,
            description: newTask.description || "",
            isRii: newTask.isRii || false,
          },
        ],
      }));
      setNewTask({ title: "", description: "", isRii: false });
      setShowTaskDialog(false);
    }
  };

  // Remove task
  const handleRemoveTask = (taskId: string) => {
    setFormData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== taskId),
    }));
  };

  // Add part reservation
  const handleAddPart = (part: typeof MOCK_PARTS[0]) => {
    const existingIndex = formData.parts.findIndex((p) => p.partId === part.id);
    if (existingIndex >= 0) {
      // Update quantity if already exists
      const updated = [...formData.parts];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: updated[existingIndex].quantity + 1,
      };
      setFormData((prev) => ({ ...prev, parts: updated }));
    } else {
      setFormData((prev) => ({
        ...prev,
        parts: [
          ...prev.parts,
          {
            id: `reserve-${Date.now()}`,
            partId: part.id,
            partName: part.name,
            partNumber: part.partNumber,
            quantity: 1,
            unit: part.unit,
            location: part.location,
          },
        ],
      }));
    }
    setShowPartDialog(false);
  };

  // Remove part reservation
  const handleRemovePart = (reserveId: string) => {
    setFormData((prev) => ({
      ...prev,
      parts: prev.parts.filter((p) => p.id !== reserveId),
    }));
  };

  // Update part quantity
  const handleUpdatePartQty = (reserveId: string, delta: number) => {
    setFormData((prev) => ({
      ...prev,
      parts: prev.parts.map((p) =>
        p.id === reserveId ? { ...p, quantity: Math.max(1, p.quantity + delta) } : p
      ),
    }));
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...files],
    }));
  };

  // Remove attachment
  const handleRemoveAttachment = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/work-orders">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">
            {isEditing ? "编辑工单" : "创建工单"}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? "修改工单信息" : "创建新的维修工单"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate("/work-orders")}>
            取消
          </Button>
          <Button onClick={handleSubmit}>
            <Save className="w-4 h-4 mr-2" />
            {isEditing ? "保存修改" : "创建工单"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
              <CardDescription>工单的基本信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Work Order Type */}
              <div>
                <Label htmlFor="type">工单类型 *</Label>
                <Select
                  value={formData.workOrderType}
                  onValueChange={(value) => updateField("workOrderType", value)}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WORK_ORDER_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {type.description}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Aircraft Selection */}
              <div>
                <Label htmlFor="aircraft">关联飞机 *</Label>
                <Select
                  value={formData.aircraftId}
                  onValueChange={(value) => updateField("aircraftId", value)}
                >
                  <SelectTrigger id="aircraft" className={errors.aircraftId ? "border-red-500" : ""}>
                    <SelectValue placeholder="选择飞机" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_AIRCRAFT.map((aircraft) => (
                      <SelectItem key={aircraft.id} value={aircraft.id}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{aircraft.registration}</span>
                          <span className="text-muted-foreground">·</span>
                          <span className="text-sm">{aircraft.model}</span>
                          <span className="text-muted-foreground">·</span>
                          <AircraftStatusBadge status={aircraft.status} />
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.aircraftId && (
                  <p className="text-sm text-red-500 mt-1">{errors.aircraftId}</p>
                )}

                {/* Aircraft Info Card */}
                {selectedAircraft && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{selectedAircraft.registration}</span>
                      <AircraftStatusBadge status={selectedAircraft.status} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div>
                        <span>型号: </span>
                        <span className="text-foreground">{selectedAircraft.model}</span>
                      </div>
                      <div>
                        <span>飞行小时: </span>
                        <span className="text-foreground">{selectedAircraft.totalFlightHours}h</span>
                      </div>
                      <div>
                        <span>位置: </span>
                        <span className="text-foreground">{selectedAircraft.location}</span>
                      </div>
                    </div>

                    {/* Maintenance Suggestions */}
                    {selectedAircraft.upcomingMaintenance.length > 0 && (
                      <div className="pt-2 border-t">
                        <p className="text-xs font-medium text-muted-foreground mb-2">
                          建议维保计划:
                        </p>
                        {selectedAircraft.upcomingMaintenance.map((maint) => (
                          <button
                            key={maint.id}
                            type="button"
                            onClick={() => updateField("scheduleId", maint.id)}
                            className={`w-full text-left p-2 rounded text-xs ${
                              formData.scheduleId === maint.id
                                ? "bg-primary text-primary-foreground"
                                : "bg-white border hover:bg-slate-50"
                            }`}
                          >
                            <div className="font-medium">{maint.name}</div>
                            <div className="text-muted-foreground">
                              到期: {maint.dueIn}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Status Warning */}
                    {(selectedAircraft.status === "MAINTENANCE" ||
                      selectedAircraft.status === "GROUNDED") && (
                      <div className="flex items-start gap-2 p-2 bg-amber-50 rounded text-amber-800 text-xs">
                        <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <span>
                          该飞机当前状态为 {selectedAircraft.status === "GROUNDED" ? "停飞" : "维护中"}
                          ，请确认是否可以创建新工单
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Schedule Selection */}
              {formData.workOrderType === "SCHEDULED" && (
                <div>
                  <Label htmlFor="schedule">关联维保计划</Label>
                  <Select
                    value={formData.scheduleId}
                    onValueChange={(value) => updateField("scheduleId", value)}
                  >
                    <SelectTrigger id="schedule">
                      <SelectValue placeholder="选择维保计划（可选）" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">无关联</SelectItem>
                      {MOCK_SCHEDULES.map((schedule) => (
                        <SelectItem key={schedule.id} value={schedule.id}>
                          <div>
                            <div className="font-medium">{schedule.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {schedule.description}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Title */}
              <div>
                <Label htmlFor="title">工单标题 *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="例如：电机定期检查 - B-7011U"
                  className={errors.title ? "border-red-500" : ""}
                />
                {errors.title && (
                  <p className="text-sm text-red-500 mt-1">{errors.title}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">描述</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="详细描述工单内容..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Tasks */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>工卡任务</CardTitle>
                  <CardDescription>
                    {formData.tasks.length > 0
                      ? `已添加 ${formData.tasks.length} 个任务`
                      : "添加需要执行的任务"}
                  </CardDescription>
                </div>
                <Button size="sm" onClick={() => setShowTaskDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  添加任务
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {errors.tasks && (
                <p className="text-sm text-red-500 mb-3">{errors.tasks}</p>
              )}

              {formData.tasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Wrench className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>暂无任务，请添加工卡任务</p>
                  <p className="text-xs mt-1">选择维保计划可自动导入任务</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.tasks.map((task, index) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-3 p-3 border rounded-lg hover:bg-slate-50"
                    >
                      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{task.title}</span>
                          {task.isRii && (
                            <Badge variant="outline" className="text-xs border-red-500 text-red-700">
                              必检项
                            </Badge>
                          )}
                        </div>
                        {task.description && (
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveTask(task.id)}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Parts Reservation */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>配件预留</CardTitle>
                  <CardDescription>
                    {formData.parts.length > 0
                      ? `已预留 ${formData.parts.length} 种配件`
                      : "预留需要的配件"}
                  </CardDescription>
                </div>
                <Button size="sm" onClick={() => setShowPartDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  添加配件
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {formData.parts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>暂无预留配件</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {formData.parts.map((part) => (
                    <div
                      key={part.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                          <Package className="h-5 w-5 text-slate-500" />
                        </div>
                        <div>
                          <p className="font-medium">{part.partName}</p>
                          <p className="text-xs text-muted-foreground">
                            {part.partNumber} · {part.location}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleUpdatePartQty(part.id, -1)}
                        >
                          -
                        </Button>
                        <span className="w-8 text-center font-medium">{part.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleUpdatePartQty(part.id, 1)}
                        >
                          +
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemovePart(part.id)}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Assignment & Priority */}
          <Card>
            <CardHeader>
              <CardTitle>分配与优先级</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Priority */}
              <div>
                <Label htmlFor="priority">优先级</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => updateField("priority", value)}
                >
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        <Badge className={level.color}>{level.label}</Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Assigned To */}
              <div>
                <Label htmlFor="assignedTo">负责人 *</Label>
                <Select
                  value={formData.assignedTo}
                  onValueChange={(value) => updateField("assignedTo", value)}
                >
                  <SelectTrigger id="assignedTo" className={errors.assignedTo ? "border-red-500" : ""}>
                    <SelectValue placeholder="选择负责人" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_TECHNICIANS.map((tech) => (
                      <SelectItem key={tech.id} value={tech.id}>
                        <div>
                          <div className="font-medium">{tech.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {tech.specialization}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.assignedTo && (
                  <p className="text-sm text-red-500 mt-1">{errors.assignedTo}</p>
                )}
              </div>

              {/* Due Date */}
              <div>
                <Label htmlFor="dueDate">到期日期 *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => updateField("dueDate", e.target.value)}
                  className={errors.dueDate ? "border-red-500" : ""}
                />
                {errors.dueDate && (
                  <p className="text-sm text-red-500 mt-1">{errors.dueDate}</p>
                )}
              </div>

              {/* Estimated Hours */}
              <div>
                <Label htmlFor="estimatedHours">预计工时（小时）</Label>
                <Input
                  id="estimatedHours"
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={formData.estimatedHours}
                  onChange={(e) => updateField("estimatedHours", parseFloat(e.target.value) || 0)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>备注</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                placeholder="添加备注信息..."
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Attachments */}
          <Card>
            <CardHeader>
              <CardTitle>附件</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Upload Button */}
              <div className="relative">
                <Input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => document.getElementById("file-upload")?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  上传附件
                </Button>
              </div>

              {/* File List */}
              {formData.attachments.length > 0 && (
                <div className="space-y-2">
                  {formData.attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 border rounded-lg text-sm"
                    >
                      <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="flex-1 truncate">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleRemoveAttachment(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Schedule Info */}
          {selectedSchedule && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">关联维保计划</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p className="font-medium">{selectedSchedule.name}</p>
                <p className="text-muted-foreground">{selectedSchedule.description}</p>
                <div className="pt-2 mt-2 border-t border-blue-200">
                  <span className="text-muted-foreground">触发条件: </span>
                  <span className="font-medium">
                    {selectedSchedule.triggerType === "FH"
                      ? `每 ${selectedSchedule.triggerValue} 飞行小时`
                      : selectedSchedule.triggerType === "CALENDAR"
                      ? `每 ${selectedSchedule.triggerValue} 天`
                      : `${selectedSchedule.triggerValue} 次起降`}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Add Task Dialog */}
      <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加任务</DialogTitle>
            <DialogDescription>创建一个新的工卡任务</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="taskTitle">任务标题 *</Label>
              <Input
                id="taskTitle"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="例如：外观检查"
              />
            </div>
            <div>
              <Label htmlFor="taskDesc">任务描述</Label>
              <Textarea
                id="taskDesc"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="详细描述任务内容..."
                rows={3}
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="isRii"
                checked={newTask.isRii}
                onCheckedChange={(checked) => setNewTask({ ...newTask, isRii: !!checked })}
              />
              <Label htmlFor="isRii" className="flex items-center gap-2 cursor-pointer">
                标记为必检项 (RII)
                <Badge variant="outline" className="text-xs border-red-500 text-red-700">
                  需要检验员签字
                </Badge>
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTaskDialog(false)}>
              取消
            </Button>
            <Button onClick={handleAddTask} disabled={!newTask.title.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              添加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Part Dialog */}
      <Dialog open={showPartDialog} onOpenChange={setShowPartDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>添加配件预留</DialogTitle>
            <DialogDescription>搜索并选择需要预留的配件</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索配件名称或件号..."
                value={partSearch}
                onChange={(e) => setPartSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Parts List */}
            <div className="max-h-64 overflow-y-auto">
              {filteredParts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  未找到匹配的配件
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredParts.map((part) => (
                    <div
                      key={part.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 cursor-pointer"
                      onClick={() => handleAddPart(part)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                          <Package className="h-5 w-5 text-slate-500" />
                        </div>
                        <div>
                          <p className="font-medium">{part.name}</p>
                          <p className="text-xs text-muted-foreground">
                            件号: {part.partNumber} · 库位: {part.location}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={part.quantity > 5 ? "default" : "destructive"}>
                          库存: {part.quantity}
                        </Badge>
                        <Button size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPartDialog(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
