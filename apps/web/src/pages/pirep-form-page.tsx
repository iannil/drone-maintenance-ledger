import { useState, useEffect } from "react";
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  AlertTriangle,
  Camera,
  Upload,
  X,
  Plane,
  Calendar,
  Clock,
  MapPin,
  User,
  FileText,
  Wrench,
  Loader2,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Checkbox } from "../components/ui/checkbox";
import { AircraftStatusBadge } from "../components/common/status-badge";
import { fullAircraftService, type Aircraft } from "../services/fleet.service";
import { userService, type User as UserType } from "../services/user.service";
import { pilotReportService, type PilotReportSeverity, SEVERITY_LABELS } from "../services/pilot-report.service";
import { flightLogService, type FlightLog } from "../services/flight-log.service";

// PIREP severity levels
const SEVERITY_LEVELS: { value: PilotReportSeverity; label: string; color: string; description: string }[] = [
  { value: "LOW", label: "轻微", color: "bg-yellow-100 text-yellow-700", description: "不影响飞行安全，可继续执行任务" },
  { value: "MEDIUM", label: "中等", color: "bg-orange-100 text-orange-700", description: "需要注意，建议完成任务后检查" },
  { value: "HIGH", label: "严重", color: "bg-red-100 text-red-700", description: "影响飞行安全，应立即降落检查" },
  { value: "CRITICAL", label: "紧急", color: "bg-red-600 text-white", description: "严重安全隐患，必须中止飞行" },
];

// PIREP categories
const FAULT_CATEGORIES = [
  { value: "POWER", label: "动力系统", description: "电机、电调、螺旋桨等" },
  { value: "BATTERY", label: "电源系统", description: "电池、充电器、电源管理等" },
  { value: "FLIGHT_CONTROL", label: "飞行控制", description: "飞控、IMU、姿态控制等" },
  { value: "NAVIGATION", label: "导航定位", description: "GPS、RTK、指南针等" },
  { value: "COMMUNICATION", label: "通信系统", description: "图传、遥控、数传等" },
  { value: "PAYLOAD", label: "任务载荷", description: "云台、相机、其他挂载设备" },
  { value: "STRUCTURE", label: "机身结构", description: "机架、起落架、机身罩等" },
  { value: "SENSOR", label: "传感器系统", description: "避障、视觉、超声波等" },
  { value: "SOFTWARE", label: "软件问题", description: "固件bug、APP问题等" },
  { value: "OTHER", label: "其他", description: "未分类的问题" },
];

interface PirepFormData {
  aircraftId: string;
  flightLogId: string;
  reporterId: string;
  occurrenceTime: string;
  location: string;
  altitude: string;
  flightPhase: string;
  severity: PilotReportSeverity;
  category: string;
  title: string;
  description: string;
  immediateAction: string;
  flightImpact: boolean;
  flightImpactDescription: string;
  attachments: File[];
  createWorkOrder: boolean;
  workOrderPriority: string;
}

/**
 * PIREP (Pilot Report) form page for reporting flight anomalies and faults
 */
export function PirepFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditing = Boolean(id);

  // 从 location state 获取预设值（从飞行记录页面跳转时）
  const presetAircraftId = location.state?.aircraftId || "";
  const presetFlightLogId = location.state?.flightLogId || "";

  // API 数据状态
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [pilots, setPilots] = useState<UserType[]>([]);
  const [flightLogs, setFlightLogs] = useState<FlightLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<PirepFormData>({
    aircraftId: presetAircraftId,
    flightLogId: presetFlightLogId,
    reporterId: "",
    occurrenceTime: new Date().toISOString().slice(0, 16),
    location: "",
    altitude: "",
    flightPhase: "CRUISE",
    severity: "MEDIUM",
    category: "",
    title: "",
    description: "",
    immediateAction: "",
    flightImpact: false,
    flightImpactDescription: "",
    attachments: [],
    createWorkOrder: false,
    workOrderPriority: "MEDIUM",
  });

  // UI state
  const [selectedAircraft, setSelectedAircraft] = useState<Aircraft | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [createdPirepId, setCreatedPirepId] = useState("");

  // Flight phases
  const FLIGHT_PHASES = [
    { value: "PRE_FLIGHT", label: "起飞前" },
    { value: "TAKEOFF", label: "起飞" },
    { value: "CLIMB", label: "爬升" },
    { value: "CRUISE", label: "巡航" },
    { value: "DESCENT", label: "下降" },
    { value: "APPROACH", label: "进近" },
    { value: "LANDING", label: "着陆" },
    { value: "POST_FLIGHT", label: "着陆后" },
  ];

  // 加载数据
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const [aircraftData, pilotsData, flightLogsData] = await Promise.all([
          fullAircraftService.list(100),
          userService.getPilots(100),
          flightLogService.getRecent(50),
        ]);
        setAircraft(aircraftData);
        setPilots(pilotsData);
        setFlightLogs(flightLogsData);
      } catch (err) {
        console.error("Failed to load data:", err);
        setLoadError("加载数据失败，请刷新页面重试");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Update aircraft info when selection changes
  useEffect(() => {
    if (formData.aircraftId) {
      const ac = aircraft.find((a) => a.id === formData.aircraftId);
      setSelectedAircraft(ac || null);
    } else {
      setSelectedAircraft(null);
    }
  }, [formData.aircraftId, aircraft]);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.aircraftId) newErrors.aircraftId = "请选择飞机";
    if (!formData.reporterId) newErrors.reporterId = "请选择报告人";
    if (!formData.title.trim()) newErrors.title = "请输入故障标题";
    if (!formData.description.trim()) newErrors.description = "请详细描述故障现象";
    if (!formData.category) newErrors.category = "请选择故障类别";
    if (!formData.immediateAction.trim()) newErrors.immediateAction = "请说明已采取的措施";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // 构建 API 请求数据
      const dto = {
        aircraftId: formData.aircraftId,
        flightLogId: formData.flightLogId && formData.flightLogId !== "none" ? formData.flightLogId : undefined,
        title: formData.title,
        description: `${formData.description}${formData.immediateAction ? `\n\n已采取措施: ${formData.immediateAction}` : ""}${formData.flightImpact && formData.flightImpactDescription ? `\n\n对飞行影响: ${formData.flightImpactDescription}` : ""}`,
        severity: formData.severity,
        affectedSystem: formData.category || undefined,
        affectedComponent: undefined,
        isAog: formData.severity === "CRITICAL",
      };

      const result = await pilotReportService.create(dto);
      setCreatedPirepId(result.id);
      setShowSuccessDialog(true);
    } catch (err) {
      console.error("Submit error:", err);
      setSubmitError(err instanceof Error ? err.message : "提交失败，请重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update form field
  const updateField = <K extends keyof PirepFormData>(
    key: K,
    value: PirepFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
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

  // Handle success dialog close
  const handleSuccessClose = () => {
    setShowSuccessDialog(false);
    if (formData.createWorkOrder) {
      // Navigate to work order creation with PIREP data
      navigate(`/work-orders/new?pirep=${createdPirepId}`);
    } else {
      navigate("/flight-logs");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/flight-logs">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">
              {isEditing ? "编辑故障报告" : "创建故障报告"}
            </h1>
            <Badge variant="outline" className="text-xs">
              PIREP
            </Badge>
          </div>
          <p className="text-muted-foreground">
            {isEditing ? "修改故障报告信息" : "报告飞行中发现的异常或故障"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                提交中...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isEditing ? "保存修改" : "提交报告"}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
              <span className="text-blue-800">加载数据中...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error state */}
      {loadError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">加载失败</p>
                <p className="text-sm text-red-700">{loadError}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit error */}
      {submitError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">提交失败</p>
                <p className="text-sm text-red-700">{submitError}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alert for severity */}
      {(formData.severity === "HIGH" || formData.severity === "CRITICAL") && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-900">
              {formData.severity === "CRITICAL" ? "紧急严重故障" : "严重故障"}
            </p>
            <p className="text-sm text-red-700 mt-1">
              {formData.severity === "CRITICAL"
                ? "此故障属于紧急级别，已自动通知相关负责人。请立即中止飞行并安全降落。"
                : "此故障属于严重级别，可能影响飞行安全，请尽快完成当前任务并降落检查。"}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Flight Information */}
          <Card>
            <CardHeader>
              <CardTitle>飞行信息</CardTitle>
              <CardDescription>故障发生时的飞行相关信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Aircraft */}
                <div>
                  <Label htmlFor="aircraft">飞机 *</Label>
                  <Select
                    value={formData.aircraftId}
                    onValueChange={(value) => updateField("aircraftId", value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="aircraft" className={errors.aircraftId ? "border-red-500" : ""}>
                      <SelectValue placeholder="选择飞机" />
                    </SelectTrigger>
                    <SelectContent>
                      {aircraft.map((ac) => (
                        <SelectItem key={ac.id} value={ac.id}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{ac.registrationNumber}</span>
                            <span className="text-muted-foreground">·</span>
                            <span className="text-sm">{ac.model}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.aircraftId && (
                    <p className="text-sm text-red-500 mt-1">{errors.aircraftId}</p>
                  )}
                </div>

                {/* Flight Log */}
                <div>
                  <Label htmlFor="flightLog">关联飞行记录</Label>
                  <Select
                    value={formData.flightLogId}
                    onValueChange={(value) => updateField("flightLogId", value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="flightLog">
                      <SelectValue placeholder="选择飞行记录（可选）" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">无关联</SelectItem>
                      {flightLogs.map((fl) => {
                        const flDate = new Date(fl.flightDate);
                        const matchingAircraft = aircraft.find((a) => a.id === fl.aircraftId);
                        return (
                          <SelectItem key={fl.id} value={fl.id}>
                            {flDate.toLocaleDateString("zh-CN")} · {matchingAircraft?.registrationNumber || "未知"} · {fl.flightHours}h
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Aircraft Info Card */}
              {selectedAircraft && (
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{selectedAircraft.registrationNumber}</span>
                    <Badge variant="outline">
                      {selectedAircraft.status === "AVAILABLE" && "可用"}
                      {selectedAircraft.status === "IN_MAINTENANCE" && "维护中"}
                      {selectedAircraft.status === "AOG" && "停飞"}
                      {selectedAircraft.status === "RETIRED" && "退役"}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    型号: {selectedAircraft.model} · 总飞行小时: {selectedAircraft.totalFlightHours}h
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Occurrence Time */}
                <div>
                  <Label htmlFor="occurrenceTime">发生时间 *</Label>
                  <Input
                    id="occurrenceTime"
                    type="datetime-local"
                    value={formData.occurrenceTime}
                    onChange={(e) => updateField("occurrenceTime", e.target.value)}
                  />
                </div>

                {/* Flight Phase */}
                <div>
                  <Label htmlFor="flightPhase">飞行阶段</Label>
                  <Select
                    value={formData.flightPhase}
                    onValueChange={(value) => updateField("flightPhase", value)}
                  >
                    <SelectTrigger id="flightPhase">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FLIGHT_PHASES.map((phase) => (
                        <SelectItem key={phase.value} value={phase.value}>
                          {phase.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Altitude */}
                <div>
                  <Label htmlFor="altitude">高度（米）</Label>
                  <Input
                    id="altitude"
                    type="number"
                    placeholder="例如：120"
                    value={formData.altitude}
                    onChange={(e) => updateField("altitude", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Location */}
                <div>
                  <Label htmlFor="location">发生地点</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="location"
                      placeholder="例如：巡检区域A"
                      value={formData.location}
                      onChange={(e) => updateField("location", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Reporter */}
                <div>
                  <Label htmlFor="reporter">报告人 *</Label>
                  <Select
                    value={formData.reporterId}
                    onValueChange={(value) => updateField("reporterId", value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="reporter" className={errors.reporterId ? "border-red-500" : ""}>
                      <SelectValue placeholder="选择报告人" />
                    </SelectTrigger>
                    <SelectContent>
                      {pilots.map((pilot) => (
                        <SelectItem key={pilot.id} value={pilot.id}>
                          <div>
                            <div className="font-medium">{pilot.name}</div>
                            {pilot.licenseNumber && (
                              <div className="text-xs text-muted-foreground">
                                执照号: {pilot.licenseNumber}
                              </div>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.reporterId && (
                    <p className="text-sm text-red-500 mt-1">{errors.reporterId}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fault Description */}
          <Card>
            <CardHeader>
              <CardTitle>故障描述</CardTitle>
              <CardDescription>详细描述故障现象和相关情况</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Severity */}
              <div>
                <Label>严重程度 *</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                  {SEVERITY_LEVELS.map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => updateField("severity", level.value)}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        formData.severity === level.value
                          ? "border-current " + level.color
                          : "border-transparent hover:bg-slate-50"
                      }`}
                    >
                      <div className="font-medium">{level.label}</div>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {SEVERITY_LEVELS.find((l) => l.value === formData.severity)?.description}
                </p>
              </div>

              {/* Category */}
              <div>
                <Label htmlFor="category">故障类别 *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => updateField("category", value)}
                >
                  <SelectTrigger id="category" className={errors.category ? "border-red-500" : ""}>
                    <SelectValue placeholder="选择故障类别" />
                  </SelectTrigger>
                  <SelectContent>
                    {FAULT_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div>
                          <div className="font-medium">{cat.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {cat.description}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-red-500 mt-1">{errors.category}</p>
                )}
              </div>

              {/* Title */}
              <div>
                <Label htmlFor="title">故障标题 *</Label>
                <Input
                  id="title"
                  placeholder="简要概括故障现象，例如：左前电机转速异常"
                  value={formData.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  className={errors.title ? "border-red-500" : ""}
                />
                {errors.title && (
                  <p className="text-sm text-red-500 mt-1">{errors.title}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">详细描述 *</Label>
                <Textarea
                  id="description"
                  placeholder="请详细描述：&#10;1. 故障发生的具体现象&#10;2. 故障发生前后的操作&#10;3. 任何异常的声音、震动、指示灯等&#10;4. 其他可能相关的信息"
                  value={formData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  rows={6}
                  className={errors.description ? "border-red-500" : ""}
                />
                {errors.description && (
                  <p className="text-sm text-red-500 mt-1">{errors.description}</p>
                )}
              </div>

              {/* Immediate Action */}
              <div>
                <Label htmlFor="immediateAction">已采取措施 *</Label>
                <Textarea
                  id="immediateAction"
                  placeholder="描述故障发生后采取的措施，例如：立即降落、关闭设备、尝试重启等"
                  value={formData.immediateAction}
                  onChange={(e) => updateField("immediateAction", e.target.value)}
                  rows={3}
                  className={errors.immediateAction ? "border-red-500" : ""}
                />
                {errors.immediateAction && (
                  <p className="text-sm text-red-500 mt-1">{errors.immediateAction}</p>
                )}
              </div>

              {/* Flight Impact */}
              <div>
                <Label>对飞行的影响</Label>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="flightImpact"
                      checked={formData.flightImpact}
                      onCheckedChange={(checked) => updateField("flightImpact", !!checked)}
                    />
                    <Label htmlFor="flightImpact" className="cursor-pointer">
                      此故障影响了正常飞行任务
                    </Label>
                  </div>
                </div>
                {formData.flightImpact && (
                  <Textarea
                    placeholder="请描述对飞行任务的具体影响..."
                    value={formData.flightImpactDescription}
                    onChange={(e) => updateField("flightImpactDescription", e.target.value)}
                    rows={2}
                    className="mt-3"
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Attachments */}
          <Card>
            <CardHeader>
              <CardTitle>附件</CardTitle>
              <CardDescription>上传相关照片、截图或日志文件</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Upload Button */}
              <div className="relative">
                <Input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.log,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="pirep-file-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => document.getElementById("pirep-file-upload")?.click()}
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
                      className="flex items-center gap-3 p-3 border rounded-lg"
                    >
                      <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                        {file.type.startsWith("image/") ? (
                          <Camera className="h-5 w-5 text-slate-500" />
                        ) : (
                          <FileText className="h-5 w-5 text-slate-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveAttachment(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded text-blue-800 text-sm">
                <Camera className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <p>
                  建议上传现场照片、APP截图或日志文件，有助于技术人员快速定位问题。
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>后续处理</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="createWorkOrder"
                  checked={formData.createWorkOrder}
                  onCheckedChange={(checked) => updateField("createWorkOrder", !!checked)}
                />
                <Label htmlFor="createWorkOrder" className="cursor-pointer font-medium">
                  创建维修工单
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                勾选后提交报告将自动创建维修工单，分配给维修人员处理。
              </p>

              {formData.createWorkOrder && (
                <div>
                  <Label htmlFor="workOrderPriority">工单优先级</Label>
                  <Select
                    value={formData.workOrderPriority}
                    onValueChange={(value) => updateField("workOrderPriority", value)}
                  >
                    <SelectTrigger id="workOrderPriority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">低</SelectItem>
                      <SelectItem value="MEDIUM">中</SelectItem>
                      <SelectItem value="HIGH">高</SelectItem>
                      <SelectItem value="CRITICAL">紧急</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reference */}
          <Card className="bg-amber-50 border-amber-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                报告提示
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2 text-amber-900">
              <p>• 请尽可能详细地描述故障现象</p>
              <p>• 记录故障发生时的环境和操作</p>
              <p>• 上传相关照片和日志文件</p>
              <p>• 说明已采取的应急措施</p>
              <p>• 严重故障会自动通知相关负责人</p>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">快速链接</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link to="/work-orders">
                  <Wrench className="h-4 w-4 mr-2" />
                  查看工单列表
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link to="/aircraft">
                  <Plane className="h-4 w-4 mr-2" />
                  查看飞机状态
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link to="/flight-logs">
                  <FileText className="h-4 w-4 mr-2" />
                  查看飞行记录
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={handleSuccessClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-green-600" />
              </div>
              故障报告已提交
            </DialogTitle>
            <DialogDescription>
              您的故障报告已成功提交。报告编号: <strong>{createdPirepId}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="p-3 bg-green-50 rounded text-sm text-green-800">
              {formData.severity === "CRITICAL" || formData.severity === "HIGH" ? (
                <p>由于故障等级较高，已自动通知相关负责人和维修团队。</p>
              ) : (
                <p>报告已发送给维修团队，将根据优先级安排处理。</p>
              )}
            </div>
            {formData.createWorkOrder && (
              <div className="p-3 bg-blue-50 rounded text-sm text-blue-800">
                <p>正在创建维修工单，完成后将跳转到工单页面。</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleSuccessClose}>
              {formData.createWorkOrder ? "继续创建工单" : "返回"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
