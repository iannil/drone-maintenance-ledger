import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  X,
  Plane,
  Calendar,
  Clock,
  MapPin,
  User,
  FileText,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Trash2,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";

// 飞行类型选项
const FLIGHT_TYPES = [
  { value: "INSPECTION", label: "巡检", description: "电力巡检、管道巡检等" },
  { value: "DELIVERY", label: "配送", description: "物流配送、物资运输" },
  { value: "SURVEY", label: "测绘", description: "地形测绘、三维建模" },
  { value: "TRAINING", label: "训练", description: "飞行员培训、练习" },
  { value: "TEST", label: "测试", description: "设备测试、功能验证" },
  { value: "EMERGENCY", label: "应急", description: "紧急救援、应急响应" },
  { value: "OTHER", label: "其他", description: "其他任务类型" },
];

// Mock 飞机数据
const MOCK_AIRCRAFT = [
  { id: "ac-001", registration: "B-7011U", model: "DJI M350 RTK", status: "SERVICEABLE" },
  { id: "ac-002", registration: "B-7012U", model: "DJI M350 RTK", status: "SERVICEABLE" },
  { id: "ac-003", registration: "B-7013U", model: "DJI M300 RTK", status: "MAINTENANCE" },
  { id: "ac-004", registration: "B-7021U", model: "DJI M30", status: "SERVICEABLE" },
  { id: "ac-005", registration: "B-7022U", model: "DJI M30", status: "GROUNDED" },
];

// Mock 飞行员数据
const MOCK_PILOTS = [
  { id: "user-001", name: "张三", role: "PILOT" },
  { id: "user-002", name: "李四", role: "PILOT" },
  { id: "user-003", name: "王五", role: "PILOT" },
  { id: "user-004", name: "赵六", role: "PILOT" },
];

// 常用地点
const COMMON_LOCATIONS = [
  "基地停机坪",
  "巡检区域A",
  "巡检区域B",
  "配送中心",
  "临时起降点1",
  "临时起降点2",
];

// 表单数据类型
interface FlightLogFormData {
  aircraftId: string;
  pilotId: string;
  copilotId: string;
  flightDate: string;
  takeoffTime: string;
  landingTime: string;
  takeoffLocation: string;
  landingLocation: string;
  flightType: string;
  flightHours: number;
  flightCycles: number;
  missionDescription: string;
  remarks: string;
  attachments: File[];
}

/**
 * 飞行记录创建/编辑页面
 */
export function FlightLogFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  // 表单状态
  const [formData, setFormData] = useState<FlightLogFormData>({
    aircraftId: "",
    pilotId: "",
    copilotId: "",
    flightDate: new Date().toISOString().split("T")[0],
    takeoffTime: "",
    landingTime: "",
    takeoffLocation: "",
    landingLocation: "",
    flightType: "INSPECTION",
    flightHours: 0,
    flightCycles: 1,
    missionDescription: "",
    remarks: "",
    attachments: [],
  });

  // UI 状态
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPirepHint, setShowPirepHint] = useState(false);

  // 计算飞行小时
  useEffect(() => {
    if (formData.takeoffTime && formData.landingTime && formData.flightDate) {
      const takeoff = new Date(`${formData.flightDate}T${formData.takeoffTime}`);
      const landing = new Date(`${formData.flightDate}T${formData.landingTime}`);

      // 处理跨天情况
      if (landing < takeoff) {
        landing.setDate(landing.getDate() + 1);
      }

      const diffMs = landing.getTime() - takeoff.getTime();
      const hours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
      setFormData((prev) => ({ ...prev, flightHours: hours > 0 ? hours : 0 }));
    }
  }, [formData.takeoffTime, formData.landingTime, formData.flightDate]);

  // 获取选中的飞机
  const selectedAircraft = MOCK_AIRCRAFT.find((a) => a.id === formData.aircraftId);

  // 处理输入变化
  const handleInputChange = (
    field: keyof FlightLogFormData,
    value: string | number | File[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  // 处理文件上传
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...files],
    }));
    setIsDirty(true);
  };

  // 移除附件
  const handleRemoveAttachment = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
    setIsDirty(true);
  };

  // 表单验证
  const validateForm = (): string | null => {
    if (!formData.aircraftId) return "请选择飞机";
    if (!formData.pilotId) return "请选择飞行员";
    if (!formData.flightDate) return "请选择飞行日期";
    if (!formData.takeoffTime) return "请输入起飞时间";
    if (!formData.landingTime) return "请输入降落时间";
    if (!formData.takeoffLocation) return "请输入起飞地点";
    if (!formData.landingLocation) return "请输入降落地点";
    if (!formData.flightType) return "请选择任务性质";
    if (formData.flightHours <= 0) return "飞行时间必须大于0";
    return null;
  };

  // 提交表单
  const handleSubmit = async (submitPirep = false) => {
    const error = validateForm();
    if (error) {
      alert(error);
      return;
    }

    setIsSubmitting(true);

    // 模拟 API 调用
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("提交飞行记录:", formData);

    if (submitPirep) {
      // 跳转到 PIREP 创建页面
      navigate("/pireps/new", {
        state: { flightLogId: "new", aircraftId: formData.aircraftId },
      });
    } else {
      // 跳转到详情页
      navigate("/flight-logs");
    }

    setIsSubmitting(false);
    setIsDirty(false);
  };

  // 取消/返回
  const handleCancel = () => {
    if (isDirty) {
      if (confirm("有未保存的更改，确定要离开吗？")) {
        navigate("/flight-logs");
      }
    } else {
      navigate("/flight-logs");
    }
  };

  // 保存草稿
  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    // 模拟保存草稿
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log("保存草稿:", formData);
    setIsSubmitting(false);
    setIsDirty(false);
    alert("草稿已保存");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleCancel}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">
            {isEditing ? "编辑飞行记录" : "创建飞行记录"}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? "修改飞行记录信息" : "记录飞行数据和任务信息"}
          </p>
        </div>
      </div>

      {/* Alert for aircraft status */}
      {selectedAircraft?.status !== "SERVICEABLE" && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">注意：飞机状态异常</p>
                <p className="text-sm text-amber-700">
                  所选飞机当前状态为{" "}
                  {selectedAircraft?.status === "MAINTENANCE" && "维护中"}
                  {selectedAircraft?.status === "GROUNDED" && "已停飞"}
                  {selectedAircraft?.status === "RETIRED" && "已退役"}
                  ，请确认是否可以执行飞行任务。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plane className="h-5 w-5" />
                  基本信息
                </CardTitle>
                <CardDescription>记录飞行的基本信息</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 飞机和飞行员 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="aircraft">
                      飞机 <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.aircraftId}
                      onValueChange={(value) => handleInputChange("aircraftId", value)}
                    >
                      <SelectTrigger id="aircraft">
                        <SelectValue placeholder="选择飞机" />
                      </SelectTrigger>
                      <SelectContent>
                        {MOCK_AIRCRAFT.map((aircraft) => (
                          <SelectItem
                            key={aircraft.id}
                            value={aircraft.id}
                            disabled={aircraft.status !== "SERVICEABLE"}
                          >
                            <div className="flex items-center gap-2">
                              <span>{aircraft.registration}</span>
                              <span className="text-muted-foreground text-xs">
                                {aircraft.model}
                              </span>
                              {aircraft.status !== "SERVICEABLE" && (
                                <Badge variant="outline" className="text-xs">
                                  {aircraft.status === "MAINTENANCE" && "维护中"}
                                  {aircraft.status === "GROUNDED" && "停飞"}
                                  {aircraft.status === "RETIRED" && "退役"}
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pilot">
                      飞行员 <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.pilotId}
                      onValueChange={(value) => handleInputChange("pilotId", value)}
                    >
                      <SelectTrigger id="pilot">
                        <SelectValue placeholder="选择飞行员" />
                      </SelectTrigger>
                      <SelectContent>
                        {MOCK_PILOTS.map((pilot) => (
                          <SelectItem key={pilot.id} value={pilot.id}>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              {pilot.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* 副驾驶 */}
                <div className="space-y-2">
                  <Label htmlFor="copilot">副驾驶（可选）</Label>
                  <Select
                    value={formData.copilotId}
                    onValueChange={(value) => handleInputChange("copilotId", value)}
                  >
                    <SelectTrigger id="copilot">
                      <SelectValue placeholder="选择副驾驶" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">无副驾驶</SelectItem>
                      {MOCK_PILOTS.filter((p) => p.id !== formData.pilotId).map((pilot) => (
                        <SelectItem key={pilot.id} value={pilot.id}>
                          {pilot.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 日期和时间 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="flightDate">
                      飞行日期 <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="flightDate"
                      type="date"
                      value={formData.flightDate}
                      onChange={(e) => handleInputChange("flightDate", e.target.value)}
                      max={new Date().toISOString().split("T")[0]}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="takeoffTime">
                      起飞时间 <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="takeoffTime"
                      type="time"
                      value={formData.takeoffTime}
                      onChange={(e) => handleInputChange("takeoffTime", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="landingTime">
                      降落时间 <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="landingTime"
                      type="time"
                      value={formData.landingTime}
                      onChange={(e) => handleInputChange("landingTime", e.target.value)}
                    />
                  </div>
                </div>

                {/* 地点 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="takeoffLocation">
                      起飞地点 <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="takeoffLocation"
                        className="pl-9"
                        placeholder="输入或选择起飞地点"
                        value={formData.takeoffLocation}
                        onChange={(e) => handleInputChange("takeoffLocation", e.target.value)}
                        list="takeoff-locations"
                      />
                      <datalist id="takeoff-locations">
                        {COMMON_LOCATIONS.map((loc) => (
                          <option key={loc} value={loc} />
                        ))}
                      </datalist>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="landingLocation">
                      降落地点 <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="landingLocation"
                        className="pl-9"
                        placeholder="输入或选择降落地点"
                        value={formData.landingLocation}
                        onChange={(e) => handleInputChange("landingLocation", e.target.value)}
                        list="landing-locations"
                      />
                      <datalist id="landing-locations">
                        {COMMON_LOCATIONS.map((loc) => (
                          <option key={loc} value={loc} />
                        ))}
                      </datalist>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Flight Data */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  飞行数据
                </CardTitle>
                <CardDescription>飞行时长、循环次数和任务信息</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 任务性质 */}
                <div className="space-y-2">
                  <Label htmlFor="flightType">
                    任务性质 <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.flightType}
                    onValueChange={(value) => handleInputChange("flightType", value)}
                  >
                    <SelectTrigger id="flightType">
                      <SelectValue placeholder="选择任务性质" />
                    </SelectTrigger>
                    <SelectContent>
                      {FLIGHT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center justify-between w-full gap-4">
                            <span>{type.label}</span>
                            <span className="text-muted-foreground text-xs">
                              {type.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 飞行小时和循环 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="flightHours">
                      飞行小时 <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="flightHours"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.flightHours || ""}
                        onChange={(e) => handleInputChange("flightHours", parseFloat(e.target.value) || 0)}
                        className="pr-16"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        小时
                      </span>
                    </div>
                    {formData.takeoffTime && formData.landingTime && (
                      <p className="text-xs text-muted-foreground">
                        已根据起降时间自动计算
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="flightCycles">
                      起降循环 <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="flightCycles"
                      type="number"
                      min="1"
                      value={formData.flightCycles}
                      onChange={(e) => handleInputChange("flightCycles", parseInt(e.target.value) || 1)}
                    />
                  </div>
                </div>

                {/* 任务描述 */}
                <div className="space-y-2">
                  <Label htmlFor="missionDescription">任务描述</Label>
                  <Textarea
                    id="missionDescription"
                    placeholder="描述本次飞行任务的具体内容..."
                    value={formData.missionDescription}
                    onChange={(e) => handleInputChange("missionDescription", e.target.value)}
                    rows={3}
                  />
                </div>

                {/* 备注 */}
                <div className="space-y-2">
                  <Label htmlFor="remarks">备注</Label>
                  <Textarea
                    id="remarks"
                    placeholder="其他需要记录的信息..."
                    value={formData.remarks}
                    onChange={(e) => handleInputChange("remarks", e.target.value)}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Attachments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  附件（可选）
                </CardTitle>
                <CardDescription>
                  上传飞行日志文件、照片或轨迹文件
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Upload Area */}
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors">
                  <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-3">
                    拖拽文件到此处或点击上传
                  </p>
                  <input
                    type="file"
                    id="file-upload"
                    multiple
                    accept=".log,.txt,.pdf,.kml,.gpx,.jpg,.jpeg,.png,.zip"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label htmlFor="file-upload">
                    <Button type="button" variant="outline" size="sm" asChild>
                      <span>选择文件</span>
                    </Button>
                  </label>
                  <p className="text-xs text-muted-foreground mt-2">
                    支持 LOG, TXT, PDF, KML, GPX, JPG, PNG, ZIP 格式
                  </p>
                </div>

                {/* File List */}
                {formData.attachments.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm">已选择的文件</Label>
                    {formData.attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(file.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveAttachment(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">飞行概览</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground">飞行时长</p>
                  <p className="text-2xl font-bold">{formData.flightHours.toFixed(2)}h</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">起降循环</p>
                  <p className="text-2xl font-bold">{formData.flightCycles}</p>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground">任务类型</p>
                  <Badge className="mt-1">
                    {FLIGHT_TYPES.find((t) => t.value === formData.flightType)?.label}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">快捷操作</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setShowPirepHint(!showPirepHint)}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  本次飞行发现异常？
                </Button>

                {showPirepHint && (
                  <div className="p-3 bg-amber-50 rounded-lg text-sm">
                    <p className="font-medium text-amber-800 mb-2">
                      创建故障报告 (PIREP)
                    </p>
                    <p className="text-amber-700 text-xs mb-3">
                      如果飞行中发现任何异常、故障或需要报告的问题，请在提交飞行记录后创建故障报告。
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      className="w-full"
                      onClick={() => handleSubmit(true)}
                    >
                      提交记录并创建报告
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Form Help */}
            <Card className="bg-slate-50">
              <CardHeader>
                <CardTitle className="text-base text-sm">填写提示</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>• 飞行小时将根据起降时间自动计算</p>
                <p>• 起降循环通常记录为 1 次</p>
                <p>• 可上传飞行日志文件用于后续分析</p>
                <p>• 如发现异常请及时创建 PIREP</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Form Actions */}
        <div className="sticky bottom-0 bg-background border-t pt-4 mt-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {isDirty && (
                <span className="flex items-center gap-1 text-amber-600">
                  <span className="h-2 w-2 rounded-full bg-amber-600" />
                  有未保存的更改
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                取消
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isSubmitting || !isDirty}
              >
                <Save className="h-4 w-4 mr-2" />
                保存草稿
              </Button>
              <Button
                type="button"
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    提交中...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    提交记录
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
