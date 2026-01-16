import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  Plus,
  AlertTriangle,
  AlertCircle,
  FileText,
  Plane,
  Calendar,
  User,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
} from "lucide-react";
import { Button } from "../components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";
import { Label } from "../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

// 严重程度级别
const SEVERITY_LEVELS = {
  LOW: {
    label: "轻微",
    color: "bg-yellow-100 text-yellow-700",
    description: "不影响飞行安全，可继续执行任务",
  },
  MEDIUM: {
    label: "中等",
    color: "bg-orange-100 text-orange-700",
    description: "需要注意，建议完成任务后检查",
  },
  HIGH: {
    label: "严重",
    color: "bg-red-100 text-red-700",
    description: "影响飞行安全，应立即降落检查",
  },
  CRITICAL: {
    label: "紧急",
    color: "bg-red-600 text-white",
    description: "严重安全隐患，必须中止飞行",
  },
};

// 故障类别
const FAULT_CATEGORIES = {
  POWER: { label: "动力系统", color: "bg-red-50 text-red-700" },
  FLIGHT_CONTROL: { label: "飞控系统", color: "bg-orange-50 text-orange-700" },
  COMMUNICATION: { label: "通信系统", color: "bg-blue-50 text-blue-700" },
  NAVIGATION: { label: "导航系统", color: "bg-purple-50 text-purple-700" },
  STRUCTURE: { label: "结构部件", color: "bg-yellow-50 text-yellow-700" },
  PAYLOAD: { label: "任务载荷", color: "bg-cyan-50 text-cyan-700" },
  BATTERY: { label: "电源系统", color: "bg-green-50 text-green-700" },
  OTHER: { label: "其他", color: "bg-slate-50 text-slate-700" },
};

// 处理状态
const STATUS_TYPES = {
  OPEN: {
    label: "待处理",
    color: "bg-slate-100 text-slate-700",
    icon: Clock,
  },
  INVESTIGATING: {
    label: "调查中",
    color: "bg-blue-100 text-blue-700",
    icon: Search,
  },
  WORK_ORDER_CREATED: {
    label: "已生成工单",
    color: "bg-purple-100 text-purple-700",
    icon: FileText,
  },
  RESOLVED: {
    label: "已解决",
    color: "bg-green-100 text-green-700",
    icon: CheckCircle2,
  },
  CLOSED: {
    label: "已关闭",
    color: "bg-slate-50 text-slate-500",
    icon: XCircle,
  },
};

// 飞行阶段
const FLIGHT_PHASES = {
  PRE_FLIGHT: { label: "飞行前" },
  TAKEOFF: { label: "起飞" },
  CLIMB: { label: "爬升" },
  CRUISE: { label: "巡航" },
  DESCENT: { label: "下降" },
  LANDING: { label: "着陆" },
  POST_FLIGHT: { label: "飞行后" },
};

/**
 * 故障报告(PIREP)列表页面
 */
export function PirepListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedAircraft, setSelectedAircraft] = useState<string>("all");
  const [selectedSeverities, setSelectedSeverities] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedPirep, setSelectedPirep] = useState<any>(null);

  // 飞机列表
  const aircraft = [
    { id: "all", registration: "全部飞机" },
    { id: "ac-001", registration: "B-7011U", model: "DJI M350 RTK" },
    { id: "ac-002", registration: "B-7012U", model: "Autel Evo II" },
    { id: "ac-003", registration: "B-7013U", model: "DJI Mavic 3" },
  ];

  // 故障报告列表
  const pireps = [
    {
      id: "pirep-001",
      reportNumber: "PIREP-2026-0116",
      title: "电机异响",
      description: "1号电机在飞行过程中出现明显异响，转速不稳定",
      severity: "HIGH",
      category: "POWER",
      status: "WORK_ORDER_CREATED",
      aircraftId: "ac-001",
      aircraftRegistration: "B-7011U",
      flightLogId: "fl-001",
      flightPhase: "CRUISE",
      reportedBy: "张三",
      reportedAt: "2026-01-15T10:30:00",
      workOrderId: "wo-001",
      workOrderNumber: "WO-2026-0116",
      hasPhoto: true,
      photoCount: 2,
      altitude: 120,
      speed: 12,
      notes: "异响在减速时更明显，建议检查电机轴承",
    },
    {
      id: "pirep-002",
      reportNumber: "PIREP-2026-0115",
      title: "GPS信号丢失",
      description: "飞行中GPS信号突然丢失，飞机进入姿态模式",
      severity: "CRITICAL",
      category: "NAVIGATION",
      status: "INVESTIGATING",
      aircraftId: "ac-002",
      aircraftRegistration: "B-7012U",
      flightLogId: "fl-002",
      flightPhase: "CLIMB",
      reportedBy: "李四",
      reportedAt: "2026-01-16T14:20:00",
      workOrderId: null,
      workOrderNumber: null,
      hasPhoto: false,
      photoCount: 0,
      altitude: 80,
      speed: 8,
      notes: "天气晴朗，无明显遮挡物",
    },
    {
      id: "pirep-003",
      reportNumber: "PIREP-2026-0114",
      title: "电池电量下降异常",
      description: "电池电量下降速度比正常快，可能电池老化",
      severity: "MEDIUM",
      category: "BATTERY",
      status: "OPEN",
      aircraftId: "ac-001",
      aircraftRegistration: "B-7011U",
      flightLogId: "fl-003",
      flightPhase: "CRUISE",
      reportedBy: "张三",
      reportedAt: "2026-01-16T09:15:00",
      workOrderId: null,
      workOrderNumber: null,
      hasPhoto: true,
      photoCount: 1,
      altitude: 100,
      speed: 10,
      notes: "该电池已使用280次，接近更换周期",
    },
    {
      id: "pirep-004",
      reportNumber: "PIREP-2026-0113",
      title: "图传信号不稳定",
      description: "图传信号时断时续，画面卡顿",
      severity: "LOW",
      category: "COMMUNICATION",
      status: "RESOLVED",
      aircraftId: "ac-003",
      aircraftRegistration: "B-7013U",
      flightLogId: "fl-004",
      flightPhase: "CRUISE",
      reportedBy: "王五",
      reportedAt: "2026-01-14T16:45:00",
      workOrderId: "wo-002",
      workOrderNumber: "WO-2026-0113",
      hasPhoto: false,
      photoCount: 0,
      altitude: 60,
      speed: 6,
      notes: "更换图传天线后问题解决",
      resolvedAt: "2026-01-15T10:00:00",
      resolvedBy: "李维修",
    },
    {
      id: "pirep-005",
      reportNumber: "PIREP-2026-0112",
      title: "云台抖动",
      description: "云台在运动时出现明显抖动，影响拍摄效果",
      severity: "MEDIUM",
      category: "PAYLOAD",
      status: "WORK_ORDER_CREATED",
      aircraftId: "ac-002",
      aircraftRegistration: "B-7012U",
      flightLogId: "fl-005",
      flightPhase: "CRUISE",
      reportedBy: "李四",
      reportedAt: "2026-01-15T11:30:00",
      workOrderId: "wo-003",
      workOrderNumber: "WO-2026-0112",
      hasPhoto: true,
      photoCount: 3,
      altitude: 90,
      speed: 8,
      notes: "抖动主要在快速转向时发生",
    },
    {
      id: "pirep-006",
      reportNumber: "PIREP-2026-0111",
      title: "螺旋桨轻微裂纹",
      description: "飞行后检查发现螺旋桨有轻微裂纹",
      severity: "HIGH",
      category: "STRUCTURE",
      status: "RESOLVED",
      aircraftId: "ac-001",
      aircraftRegistration: "B-7011U",
      flightLogId: "fl-006",
      flightPhase: "POST_FLIGHT",
      reportedBy: "张三",
      reportedAt: "2026-01-13T15:20:00",
      workOrderId: "wo-004",
      workOrderNumber: "WO-2026-0111",
      hasPhoto: true,
      photoCount: 2,
      altitude: 0,
      speed: 0,
      notes: "已更换新螺旋桨，旧件已报废处理",
      resolvedAt: "2026-01-14T14:00:00",
      resolvedBy: "张维修",
    },
    {
      id: "pirep-007",
      reportNumber: "PIREP-2026-0110",
      title: "飞控校准漂移",
      description: "飞机飞行姿态有轻微漂移，需要重新校准",
      severity: "LOW",
      category: "FLIGHT_CONTROL",
      status: "CLOSED",
      aircraftId: "ac-003",
      aircraftRegistration: "B-7013U",
      flightLogId: "fl-007",
      flightPhase: "PRE_FLIGHT",
      reportedBy: "王五",
      reportedAt: "2026-01-12T10:00:00",
      workOrderId: "wo-005",
      workOrderNumber: "WO-2026-0110",
      hasPhoto: false,
      photoCount: 0,
      altitude: 0,
      speed: 0,
      notes: "重新校准后恢复正常",
      resolvedAt: "2026-01-12T11:00:00",
      resolvedBy: "王维修",
    },
  ];

  // 筛选报告
  const filteredPireps = pireps.filter((pirep) => {
    const matchesSearch =
      searchQuery === "" ||
      pirep.reportNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pirep.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pirep.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pirep.aircraftRegistration.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeverity = severityFilter === "all" || pirep.severity === severityFilter;
    const matchesCategory = categoryFilter === "all" || pirep.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || pirep.status === statusFilter;
    const matchesAircraft = selectedAircraft === "all" || pirep.aircraftId === selectedAircraft;

    return matchesSearch && matchesSeverity && matchesCategory && matchesStatus && matchesAircraft;
  });

  // 统计
  const stats = {
    total: filteredPireps.length,
    open: filteredPireps.filter((p) => p.status === "OPEN").length,
    investigating: filteredPireps.filter((p) => p.status === "INVESTIGATING").length,
    workOrderCreated: filteredPireps.filter((p) => p.status === "WORK_ORDER_CREATED").length,
    resolved: filteredPireps.filter((p) => p.status === "RESOLVED").length,
    critical: filteredPireps.filter((p) => p.severity === "CRITICAL").length,
  };

  // 查看详情
  const viewDetail = (pirep: typeof pireps[0]) => {
    setSelectedPirep(pirep);
    setShowDetailDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">故障报告</h1>
          <p className="text-muted-foreground">
            飞行员报告的故障和异常情况
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            导出
          </Button>
          <Button asChild>
            <Link to="/pirep/new">
              <Plus className="w-4 h-4 mr-2" />
              新建报告
            </Link>
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              全部
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              待处理
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-slate-600">{stats.open}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              调查中
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-blue-600">{stats.investigating}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              已生成工单
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-purple-600">{stats.workOrderCreated}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              已解决
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-green-600">{stats.resolved}</div>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              紧急
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-red-600">{stats.critical}</div>
          </CardContent>
        </Card>
      </div>

      {/* Severity Filter Bar */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={severityFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setSeverityFilter("all")}
        >
          全部 ({stats.total})
        </Button>
        {Object.entries(SEVERITY_LEVELS).map(([key, { label, color }]) => {
          const count = filteredPireps.filter((p) => p.severity === key).length;
          return (
            <Button
              key={key}
              variant={severityFilter === key ? "default" : "outline"}
              size="sm"
              onClick={() => setSeverityFilter(key)}
              className={severityFilter === key ? color : ""}
            >
              {label} ({count})
            </Button>
          );
        })}
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索报告号、标题、飞机或描述..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="all">全部类别</option>
              {Object.entries(FAULT_CATEGORIES).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="all">全部状态</option>
              {Object.entries(STATUS_TYPES).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <select
              value={selectedAircraft}
              onChange={(e) => setSelectedAircraft(e.target.value)}
              className="h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              {aircraft.map((ac) => (
                <option key={ac.id} value={ac.id}>
                  {ac.registration}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* PIREPs List */}
      <Card>
        <CardHeader>
          <CardTitle>故障报告列表</CardTitle>
          <CardDescription>
            共 {filteredPireps.length} 条报告
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPireps.map((pirep) => {
              const StatusIcon = STATUS_TYPES[piresp.status as keyof typeof STATUS_TYPES].icon;

              return (
                <div
                  key={pirep.id}
                  className={`border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                    pirep.severity === "CRITICAL" ? "border-red-300 bg-red-50/30" : ""
                  }`}
                  onClick={() => viewDetail(pirep)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Severity Indicator */}
                      <div className={`h-10 w-1 rounded-full ${
                        pirep.severity === "CRITICAL" ? "bg-red-600" :
                        pirep.severity === "HIGH" ? "bg-orange-500" :
                        pirep.severity === "MEDIUM" ? "bg-yellow-500" :
                        "bg-slate-400"
                      }`} />

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-mono text-sm text-primary">
                            {pirep.reportNumber}
                          </span>
                          <Badge className={SEVERITY_LEVELS[piresp.severity as keyof typeof SEVERITY_LEVELS].color}>
                            {SEVERITY_LEVELS[piresp.severity as keyof typeof SEVERITY_LEVELS].label}
                          </Badge>
                          <Badge className={FAULT_CATEGORIES[piresp.category as keyof typeof FAULT_CATEGORIES].color}>
                            {FAULT_CATEGORIES[piresp.category as keyof typeof FAULT_CATEGORIES].label}
                          </Badge>
                          <Badge className={STATUS_TYPES[piresp.status as keyof typeof STATUS_TYPES].color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {STATUS_TYPES[piresp.status as keyof typeof STATUS_TYPES].label}
                          </Badge>
                          {pirep.hasPhoto && (
                            <Badge variant="outline" className="gap-1">
                              <FileText className="h-3 w-3" />
                              {pirep.photoCount}张照片
                            </Badge>
                          )}
                        </div>

                        <h3 className="font-medium text-sm mb-1">{pirep.title}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                          {pirep.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Plane className="h-3.5 w-3.5" />
                            <Link
                              to={`/aircraft/${piresp.aircraftId}`}
                              className="text-primary hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {piresp.aircraftRegistration}
                            </Link>
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(piresp.reportedAt).toLocaleString("zh-CN")}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5" />
                            {piresp.reportedBy}
                          </span>
                          <span>
                            {FLIGHT_PHASES[piresp.flightPhase as keyof typeof FLIGHT_PHASES].label}
                          </span>
                          {piresp.altitude > 0 && (
                            <span>高度: {piresp.altitude}m</span>
                          )}
                        </div>

                        {/* Work Order Link */}
                        {piresp.workOrderId && (
                          <div className="mt-2">
                            <Link
                              to={`/work-orders/${piresp.workOrderId}`}
                              className="text-xs text-primary hover:underline flex items-center gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <FileText className="h-3 w-3" />
                              {piresp.workOrderNumber}
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredPireps.length === 0 && (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">未找到故障报告</h3>
              <p className="text-muted-foreground">
                {searchQuery || severityFilter !== "all" || categoryFilter !== "all"
                  ? "尝试调整搜索或筛选条件"
                  : "点击上方按钮创建第一个故障报告"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>故障报告详情</DialogTitle>
            <DialogDescription>
              {selectedPirep?.reportNumber}
            </DialogDescription>
          </DialogHeader>
          {selectedPirep && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">故障标题</Label>
                  <p className="font-medium">{selectedPirep.title}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">严重程度</Label>
                  <p className="font-medium">
                    <Badge className={SEVERITY_LEVELS[selectedPirep.severity as keyof typeof SEVERITY_LEVELS].color}>
                      {SEVERITY_LEVELS[selectedPirep.severity as keyof typeof SEVERITY_LEVELS].label}
                    </Badge>
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">故障类别</Label>
                  <p className="font-medium">
                    {FAULT_CATEGORIES[selectedPirep.category as keyof typeof FAULT_CATEGORIES].label}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">处理状态</Label>
                  <p className="font-medium">
                    <Badge className={STATUS_TYPES[selectedPirep.status as keyof typeof STATUS_TYPES].color}>
                      {STATUS_TYPES[selectedPirep.status as keyof typeof STATUS_TYPES].label}
                    </Badge>
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-muted-foreground">飞机</Label>
                  <p className="font-medium">{selectedPirep.aircraftRegistration}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">飞行阶段</Label>
                  <p className="font-medium">
                    {FLIGHT_PHASES[selectedPirep.flightPhase as keyof typeof FLIGHT_PHASES].label}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">报告人</Label>
                  <p className="font-medium">{selectedPirep.reportedBy}</p>
                </div>
              </div>
              {selectedPirep.altitude > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">飞行高度</Label>
                    <p className="font-medium">{selectedPirep.altitude} 米</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">飞行速度</Label>
                    <p className="font-medium">{selectedPirep.speed} m/s</p>
                  </div>
                </div>
              )}
              <div>
                <Label className="text-muted-foreground">故障描述</Label>
                <p className="text-sm mt-1">{selectedPirep.description}</p>
              </div>
              {selectedPirep.notes && (
                <div>
                  <Label className="text-muted-foreground">备注</Label>
                  <p className="text-sm mt-1">{selectedPirep.notes}</p>
                </div>
              )}
              {selectedPirep.workOrderId && (
                <div className="border-t pt-4">
                  <Label className="text-muted-foreground">关联工单</Label>
                  <Link
                    to={`/work-orders/${selectedPirep.workOrderId}`}
                    className="block mt-1 text-primary hover:underline"
                  >
                    {selectedPirep.workOrderNumber}
                  </Link>
                </div>
              )}
              {selectedPirep.resolvedAt && (
                <div className="border-t pt-4">
                  <Label className="text-muted-foreground">解决信息</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">解决时间: </span>
                      {new Date(selectedPirep.resolvedAt).toLocaleString("zh-CN")}
                    </div>
                    <div>
                      <span className="text-muted-foreground">处理人: </span>
                      {selectedPirep.resolvedBy}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              关闭
            </Button>
            {selectedPirep?.status === "OPEN" && (
              <>
                <Button variant="outline">
                  创建工单
                </Button>
                <Button>
                  开始调查
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
