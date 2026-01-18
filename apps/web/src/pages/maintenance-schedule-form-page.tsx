import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Clock,
  Calendar,
  RotateCcw,
  AlertCircle,
  Settings,
  FileText,
  Wrench,
  Shield,
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
import { Checkbox } from "../components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  maintenanceSchedulerService,
  type TriggerType,
} from "../services/maintenance-scheduler.service";

// Trigger types
const TRIGGER_TYPES: { value: TriggerType | "MANUAL"; label: string; icon: typeof Clock; description: string }[] = [
  { value: "FLIGHT_HOURS", label: "飞行小时", icon: Clock, description: "每X飞行小时执行一次" },
  { value: "FLIGHT_CYCLES", label: "起降循环", icon: RotateCcw, description: "每X次起降执行一次" },
  { value: "CALENDAR_DAYS", label: "日历时间", icon: Calendar, description: "每X天执行一次" },
  { value: "BATTERY_CYCLES", label: "电池循环", icon: Settings, description: "每X次充放电执行一次" },
  { value: "MANUAL", label: "手动触发", icon: Wrench, description: "不自动触发" },
];

// Task templates
const TASK_TEMPLATES = [
  {
    name: "电机检查模板",
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
    name: "机身结构检查模板",
    tasks: [
      { title: "机架检查", description: "检查机架是否有裂纹、变形", isRii: true },
      { title: "起落架检查", description: "检查起落架完整性", isRii: false },
      { title: "机身罩检查", description: "检查机身罩固定和完整性", isRii: false },
    ],
  },
];

// Mock aircraft models
const AIRCRAFT_MODELS = [
  { id: "model-001", name: "DJI M350 RTK", category: "多旋翼" },
  { id: "model-002", name: "DJI M300 RTK", category: "多旋翼" },
  { id: "model-003", name: "DJI Mavic 3E", category: "多旋翼" },
];

interface ScheduleTask {
  id: string;
  title: string;
  description: string;
  isRii: boolean;
  estimatedMinutes: number;
}

interface ScheduleFormData {
  name: string;
  description: string;
  triggerType: TriggerType | "MANUAL";
  triggerValue: number;
  triggerUnit: string;
  applicableModels: string[];
  estimatedHours: number;
  priority: string;
  tasks: ScheduleTask[];
  isActive: boolean;
  notes: string;
}

/**
 * Maintenance schedule form page for creating/editing maintenance schedules
 */
export function MaintenanceScheduleFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  // API 状态
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<ScheduleFormData>({
    name: "",
    description: "",
    triggerType: "FLIGHT_HOURS",
    triggerValue: 50,
    triggerUnit: "小时",
    applicableModels: [],
    estimatedHours: 2,
    priority: "MEDIUM",
    tasks: [],
    isActive: true,
    notes: "",
  });

  // UI state
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [currentTask, setCurrentTask] = useState<Partial<ScheduleTask>>({
    title: "",
    description: "",
    isRii: false,
    estimatedMinutes: 15,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "请输入计划名称";
    }
    if (!formData.description.trim()) {
      newErrors.description = "请输入计划描述";
    }
    if (formData.triggerType !== "MANUAL" && formData.triggerValue <= 0) {
      newErrors.triggerValue = "请输入有效的触发值";
    }
    if (formData.applicableModels.length === 0) {
      newErrors.applicableModels = "请选择适用的机型";
    }
    if (formData.tasks.length === 0) {
      newErrors.tasks = "请至少添加一个任务";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // 首先创建 program
      const programCode = `MP-${Date.now()}`;
      const program = await maintenanceSchedulerService.createProgram({
        name: formData.name,
        code: programCode,
        description: formData.description,
        aircraftModel: formData.applicableModels.join(","),
        isDefault: false,
      });

      // 然后创建 trigger（如果不是手动触发）
      if (formData.triggerType !== "MANUAL") {
        const triggerCode = `TR-${Date.now()}`;
        await maintenanceSchedulerService.createTrigger({
          programId: program.id,
          name: `${formData.name} 触发器`,
          code: triggerCode,
          description: `自动触发: 每 ${formData.triggerValue} ${formData.triggerUnit}`,
          type: formData.triggerType,
          intervalValue: formData.triggerValue,
          warningThreshold: Math.floor(formData.triggerValue * 0.1),
        });
      }

      navigate("/maintenance/schedules");
    } catch (err) {
      console.error("Submit error:", err);
      setSubmitError(err instanceof Error ? err.message : "提交失败，请重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update form field
  const updateField = <K extends keyof ScheduleFormData>(
    key: K,
    value: ScheduleFormData[K]
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

  // Add task
  const handleAddTask = () => {
    if (currentTask.title?.trim()) {
      setFormData((prev) => ({
        ...prev,
        tasks: [
          ...prev.tasks,
          {
            id: `task-${Date.now()}`,
            title: currentTask.title!,
            description: currentTask.description || "",
            isRii: currentTask.isRii || false,
            estimatedMinutes: currentTask.estimatedMinutes || 15,
          },
        ],
      }));
      setCurrentTask({ title: "", description: "", isRii: false, estimatedMinutes: 15 });
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

  // Apply template
  const applyTemplate = (templateIndex: number) => {
    const template = TASK_TEMPLATES[templateIndex];
    setFormData((prev) => ({
      ...prev,
      tasks: template.tasks.map((t, i) => ({
        id: `task-${Date.now()}-${i}`,
        title: t.title,
        description: t.description,
        isRii: t.isRii,
        estimatedMinutes: 15,
      })),
    }));
    setShowTemplateDialog(false);
  };

  // Toggle model selection
  const toggleModel = (modelId: string) => {
    setFormData((prev) => ({
      ...prev,
      applicableModels: prev.applicableModels.includes(modelId)
        ? prev.applicableModels.filter((id) => id !== modelId)
        : [...prev.applicableModels, modelId],
    }));
  };

  // Get trigger unit
  const getTriggerUnit = (triggerType: string) => {
    switch (triggerType) {
      case "FLIGHT_HOURS": return "小时";
      case "FLIGHT_CYCLES": return "次";
      case "CALENDAR_DAYS": return "天";
      case "BATTERY_CYCLES": return "次";
      default: return "";
    }
  };

  // Update trigger unit when trigger type changes
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      triggerUnit: getTriggerUnit(prev.triggerType),
    }));
  }, [formData.triggerType]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/maintenance/schedules">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">
            {isEditing ? "编辑维保计划" : "创建维保计划"}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? "修改维保计划配置" : "配置自动触发的维保计划"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate("/maintenance/schedules")}>
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
                {isEditing ? "保存修改" : "创建计划"}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Submit error */}
      {submitError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">提交失败</p>
                <p className="text-sm text-red-700">{submitError}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
              <CardDescription>维保计划的基本配置</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Name */}
              <div>
                <Label htmlFor="name">计划名称 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="例如：电机定期检查"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">描述 *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="详细描述维保计划的目的和内容"
                  rows={3}
                  className={errors.description ? "border-red-500" : ""}
                />
                {errors.description && (
                  <p className="text-sm text-red-500 mt-1">{errors.description}</p>
                )}
              </div>

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
                    <SelectItem value="LOW">低</SelectItem>
                    <SelectItem value="MEDIUM">中</SelectItem>
                    <SelectItem value="HIGH">高</SelectItem>
                    <SelectItem value="CRITICAL">紧急</SelectItem>
                  </SelectContent>
                </Select>
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

          {/* Trigger Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>触发条件</CardTitle>
              <CardDescription>配置自动触发维保的条件</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Trigger Type */}
              <div>
                <Label htmlFor="triggerType">触发类型 *</Label>
                <Select
                  value={formData.triggerType}
                  onValueChange={(value) => updateField("triggerType", value as TriggerType | "MANUAL")}
                >
                  <SelectTrigger id="triggerType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRIGGER_TYPES.map((type) => {
                      const Icon = type.icon;
                      return (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{type.label}</div>
                              <div className="text-xs text-muted-foreground">
                                {type.description}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Trigger Value */}
              {formData.triggerType !== "MANUAL" && (
                <div>
                  <Label htmlFor="triggerValue">
                    触发阈值 ({formData.triggerUnit}) *
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="triggerValue"
                      type="number"
                      min="1"
                      value={formData.triggerValue}
                      onChange={(e) => updateField("triggerValue", parseFloat(e.target.value) || 0)}
                      className={errors.triggerValue ? "border-red-500" : ""}
                    />
                    <span className="text-muted-foreground">{formData.triggerUnit}</span>
                  </div>
                  {errors.triggerValue && (
                    <p className="text-sm text-red-500 mt-1">{errors.triggerValue}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    每达到 {formData.triggerValue} {formData.triggerUnit} 时自动创建工单
                  </p>
                </div>
              )}

              {/* Applicable Models */}
              <div>
                <Label>适用机型 *</Label>
                <div className="space-y-2 mt-2">
                  {AIRCRAFT_MODELS.map((model) => (
                    <div
                      key={model.id}
                      className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                        formData.applicableModels.includes(model.id)
                          ? "border-primary bg-primary/5"
                          : "hover:bg-slate-50"
                      }`}
                      onClick={() => toggleModel(model.id)}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={formData.applicableModels.includes(model.id)}
                          onChange={() => {}}
                        />
                        <div>
                          <p className="font-medium">{model.name}</p>
                          <p className="text-xs text-muted-foreground">{model.category}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {errors.applicableModels && (
                  <p className="text-sm text-red-500 mt-1">{errors.applicableModels}</p>
                )}
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
                      : "添加维保任务"}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTemplateDialog(true)}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    使用模板
                  </Button>
                  <Button size="sm" onClick={() => setShowTaskDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    添加任务
                  </Button>
                </div>
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
                  <p className="text-xs mt-1">您也可以使用模板快速创建</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.tasks.map((task, index) => {
                    const totalMinutes = formData.tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);
                    return (
                      <div
                        key={task.id}
                        className="flex items-start gap-3 p-3 border rounded-lg hover:bg-slate-50"
                      >
                        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{task.title}</span>
                            {task.isRii && (
                              <Badge variant="outline" className="text-xs border-red-500 text-red-700">
                                <Shield className="h-3 w-3 mr-1" />
                                必检项
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {task.estimatedMinutes} 分钟
                            </Badge>
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
                    );
                  })}
                  {/* Total estimated time */}
                  {formData.tasks.length > 0 && (
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded text-sm">
                      <span className="text-muted-foreground">预计总耗时</span>
                      <span className="font-medium">
                        {formData.tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0)} 分钟
                        ({Math.round(formData.tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0) / 60 * 10) / 10} 小时)
                      </span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">计划状态</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => updateField("isActive", !!checked)}
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  启用此计划
                </Label>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                启用后，系统将根据触发条件自动创建工单
              </p>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">备注说明</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="添加备注信息..."
                value={formData.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Preview */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                计划预览
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">名称:</span>
                <span className="font-medium">{formData.name || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">触发:</span>
                <span className="font-medium">
                  {formData.triggerType === "MANUAL"
                    ? "手动触发"
                    : `每 ${formData.triggerValue} ${formData.triggerUnit}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">任务:</span>
                <span className="font-medium">{formData.tasks.length} 个</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">适用机型:</span>
                <span className="font-medium">{formData.applicableModels.length} 个</span>
              </div>
            </CardContent>
          </Card>
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
                value={currentTask.title}
                onChange={(e) => setCurrentTask({ ...currentTask, title: e.target.value })}
                placeholder="例如：外观检查"
              />
            </div>
            <div>
              <Label htmlFor="taskDesc">任务描述</Label>
              <Textarea
                id="taskDesc"
                value={currentTask.description}
                onChange={(e) => setCurrentTask({ ...currentTask, description: e.target.value })}
                placeholder="详细描述任务内容..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="taskTime">预计耗时（分钟）</Label>
              <Input
                id="taskTime"
                type="number"
                min="1"
                value={currentTask.estimatedMinutes}
                onChange={(e) => setCurrentTask({ ...currentTask, estimatedMinutes: parseInt(e.target.value) || 15 })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="isRii"
                checked={currentTask.isRii}
                onCheckedChange={(checked) => setCurrentTask({ ...currentTask, isRii: !!checked })}
              />
              <Label htmlFor="isRii" className="flex items-center gap-2 cursor-pointer">
                标记为必检项 (RII)
              </Label>
            </div>
            <div className="flex items-start gap-2 p-3 bg-amber-50 rounded text-amber-800 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <p>
                必检项需要检验员签字确认后才能完成工单。
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTaskDialog(false)}>
              取消
            </Button>
            <Button onClick={handleAddTask} disabled={!currentTask.title?.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              添加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>选择任务模板</DialogTitle>
            <DialogDescription>
              使用预定义的模板快速创建任务列表
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {TASK_TEMPLATES.map((template, index) => (
              <button
                key={index}
                onClick={() => applyTemplate(index)}
                className="w-full text-left p-4 border rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{template.name}</p>
                    <p className="text-sm text-muted-foreground">
                      包含 {template.tasks.length} 个任务
                    </p>
                  </div>
                  <ArrowLeft className="h-5 w-5 rotate-180 text-muted-foreground" />
                </div>
              </button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
              取消
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
