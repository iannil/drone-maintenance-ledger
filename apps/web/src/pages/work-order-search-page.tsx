import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  Download,
  Calendar,
  Clock,
  User,
  Wrench,
  CheckCircle2,
  AlertCircle,
  Plane,
  ChevronDown,
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

// 工单状态
const WORK_ORDER_STATUS = {
  PENDING: { label: "待处理", color: "bg-slate-100 text-slate-700" },
  IN_PROGRESS: { label: "进行中", color: "bg-blue-100 text-blue-700" },
  INSPECTION_REQUIRED: { label: "待检验", color: "bg-yellow-100 text-yellow-700" },
  COMPLETED: { label: "已完成", color: "bg-green-100 text-green-700" },
  CANCELLED: { label: "已取消", color: "bg-red-100 text-red-700" },
};

// 工单类型
const WORK_ORDER_TYPES = {
  SCHEDULED: { label: "计划性", color: "bg-purple-50 text-purple-700" },
  UNSCHEDULED: { label: "非计划性", color: "bg-orange-50 text-orange-700" },
  EMERGENCY: { label: "紧急", color: "bg-red-50 text-red-700" },
};

// 优先级
const PRIORITY = {
  CRITICAL: { label: "紧急", color: "bg-red-500" },
  HIGH: { label: "高", color: "bg-orange-500" },
  MEDIUM: { label: "中", color: "bg-yellow-500" },
  LOW: { label: "低", color: "bg-slate-400" },
};

// 日期范围选项
const DATE_RANGE_OPTIONS = [
  { value: "today", label: "今天" },
  { value: "tomorrow", label: "明天" },
  { value: "next7days", label: "未来7天" },
  { value: "next30days", label: "未来30天" },
  { value: "overdue", label: "已逾期" },
  { value: "custom", label: "自定义" },
];

// 排序选项
const SORT_OPTIONS = [
  { value: "dueDate-asc", label: "到期日升序" },
  { value: "dueDate-desc", label: "到期日降序" },
  { value: "priority-desc", label: "优先级降序" },
  { value: "created-desc", label: "创建时间降序" },
  { value: "created-asc", label: "创建时间升序" },
];

/**
 * 工单搜索筛选页面
 */
export function WorkOrderSearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // 筛选状态
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [typeFilters, setTypeFilters] = useState<string[]>([]);
  const [priorityFilters, setPriorityFilters] = useState<string[]>([]);
  const [selectedAircraft, setSelectedAircraft] = useState<string>("all");
  const [selectedAssignee, setSelectedAssignee] = useState<string>("all");
  const [dueDateFilter, setDueDateFilter] = useState<string>("all");
  const [hasRiiFilter, setHasRiiFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState("dueDate-asc");

  // 飞机列表
  const aircraft = [
    { id: "ac-001", registration: "B-7011U", model: "DJI M350 RTK" },
    { id: "ac-002", registration: "B-7012U", model: "Autel Evo II" },
    { id: "ac-003", registration: "B-7013U", model: "DJI Mavic 3" },
  ];

  // 人员列表
  const users = [
    { id: "u-001", name: "张维修", role: "MECHANIC" },
    { id: "u-002", name: "李维修", role: "MECHANIC" },
    { id: "u-003", name: "王检验", role: "INSPECTOR" },
    { id: "u-004", name: "赵飞手", role: "PILOT" },
  ];

  // Mock 工单数据
  const workOrders = [
    {
      id: "wo-001",
      workOrderNumber: "WO-2026-0116",
      title: "电机定期检查 - B-7011U",
      description: "每50飞行小时检查电机状态",
      type: "SCHEDULED",
      priority: "HIGH",
      status: "IN_PROGRESS",
      aircraftId: "ac-001",
      aircraftRegistration: "B-7011U",
      assignedTo: "u-001",
      assignedToName: "张维修",
      createdAt: "2026-01-15",
      dueDate: "2026-01-20",
      estimatedHours: 2,
      actualHours: 1.5,
      taskCount: 5,
      completedTasks: 3,
      hasRii: true,
      riiCompleted: false,
      scheduleId: "ms-001",
    },
    {
      id: "wo-002",
      workOrderNumber: "WO-2026-0115",
      title: "螺旋桨更换 - B-7011U",
      description: "更换4片螺旋桨并进行动平衡测试",
      type: "SCHEDULED",
      priority: "MEDIUM",
      status: "PENDING",
      aircraftId: "ac-001",
      aircraftRegistration: "B-7011U",
      assignedTo: "u-002",
      assignedToName: "李维修",
      createdAt: "2026-01-14",
      dueDate: "2026-01-22",
      estimatedHours: 3,
      actualHours: null,
      taskCount: 8,
      completedTasks: 0,
      hasRii: true,
      riiCompleted: false,
      scheduleId: "ms-002",
    },
    {
      id: "wo-003",
      workOrderNumber: "WO-2026-0114",
      title: "GPS故障紧急维修 - B-7012U",
      description: "GPS模块无信号，需要紧急检查和更换",
      type: "EMERGENCY",
      priority: "CRITICAL",
      status: "INSPECTION_REQUIRED",
      aircraftId: "ac-002",
      aircraftRegistration: "B-7012U",
      assignedTo: "u-001",
      assignedToName: "张维修",
      createdAt: "2026-01-16",
      dueDate: "2026-01-16",
      estimatedHours: 4,
      actualHours: 3.5,
      taskCount: 6,
      completedTasks: 6,
      hasRii: true,
      riiCompleted: false,
      scheduleId: null,
    },
    {
      id: "wo-004",
      workOrderNumber: "WO-2026-0113",
      title: "180天日历检查 - B-7013U",
      description: "每180天进行的全面检查",
      type: "SCHEDULED",
      priority: "HIGH",
      status: "PENDING",
      aircraftId: "ac-003",
      aircraftRegistration: "B-7013U",
      assignedTo: null,
      assignedToName: null,
      createdAt: "2026-01-13",
      dueDate: "2026-01-18",
      estimatedHours: 8,
      actualHours: null,
      taskCount: 20,
      completedTasks: 0,
      hasRii: true,
      riiCompleted: false,
      scheduleId: "ms-003",
    },
    {
      id: "wo-005",
      workOrderNumber: "WO-2026-0112",
      title: "电池包更换 - B-7012U",
      description: "电池循环接近300次，需要更换电池包",
      type: "UNSCHEDULED",
      priority: "MEDIUM",
      status: "COMPLETED",
      aircraftId: "ac-002",
      aircraftRegistration: "B-7012U",
      assignedTo: "u-002",
      assignedToName: "李维修",
      createdAt: "2026-01-10",
      dueDate: "2026-01-15",
      estimatedHours: 1,
      actualHours: 1,
      taskCount: 3,
      completedTasks: 3,
      hasRii: true,
      riiCompleted: true,
      completedAt: "2026-01-14",
      scheduleId: "ms-004",
    },
    {
      id: "wo-006",
      workOrderNumber: "WO-2026-0111",
      title: "飞控软件升级 - B-7013U",
      description: "升级飞控固件到最新版本",
      type: "SCHEDULED",
      priority: "LOW",
      status: "CANCELLED",
      aircraftId: "ac-003",
      aircraftRegistration: "B-7013U",
      assignedTo: null,
      assignedToName: null,
      createdAt: "2026-01-08",
      dueDate: "2026-01-12",
      estimatedHours: 1.5,
      actualHours: null,
      taskCount: 2,
      completedTasks: 0,
      hasRii: false,
      riiCompleted: false,
      scheduleId: null,
    },
    {
      id: "wo-007",
      workOrderNumber: "WO-2026-0117",
      title: "起落架检查 - B-7011U",
      description: "检查起落架结构和减震器",
      type: "UNSCHEDULED",
      priority: "LOW",
      status: "PENDING",
      aircraftId: "ac-001",
      aircraftRegistration: "B-7011U",
      assignedTo: null,
      assignedToName: null,
      createdAt: "2026-01-16",
      dueDate: "2026-01-25",
      estimatedHours: 2,
      actualHours: null,
      taskCount: 4,
      completedTasks: 0,
      hasRii: false,
      riiCompleted: false,
      scheduleId: null,
    },
    {
      id: "wo-008",
      workOrderNumber: "WO-2026-0118",
      title: "电调更换 - B-7012U",
      description: "更换故障电调",
      type: "EMERGENCY",
      priority: "CRITICAL",
      status: "PENDING",
      aircraftId: "ac-002",
      aircraftRegistration: "B-7012U",
      assignedTo: null,
      assignedToName: null,
      createdAt: "2026-01-16",
      dueDate: "2026-01-16",
      estimatedHours: 3,
      actualHours: null,
      taskCount: 5,
      completedTasks: 0,
      hasRii: true,
      riiCompleted: false,
      scheduleId: null,
    },
  ];

  // 筛选工单
  const filteredWorkOrders = workOrders.filter((wo) => {
    // 搜索匹配
    const matchesSearch =
      searchQuery === "" ||
      wo.workOrderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.aircraftRegistration.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.description.toLowerCase().includes(searchQuery.toLowerCase());

    // 状态筛选
    const matchesStatus =
      statusFilters.length === 0 || statusFilters.includes(wo.status);

    // 类型筛选
    const matchesType =
      typeFilters.length === 0 || typeFilters.includes(wo.type);

    // 优先级筛选
    const matchesPriority =
      priorityFilters.length === 0 || priorityFilters.includes(wo.priority);

    // 飞机筛选
    const matchesAircraft = selectedAircraft === "all" || wo.aircraftId === selectedAircraft;

    // 负责人筛选
    const matchesAssignee =
      selectedAssignee === "all" ||
      (selectedAssignee === "unassigned" && !wo.assignedTo) ||
      wo.assignedTo === selectedAssignee;

    // 到期日筛选
    let matchesDueDate = true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(wo.dueDate);
    dueDate.setHours(0, 0, 0, 0);

    switch (dueDateFilter) {
      case "today":
        matchesDueDate = dueDate.getTime() === today.getTime();
        break;
      case "tomorrow":
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        matchesDueDate = dueDate.getTime() === tomorrow.getTime();
        break;
      case "next7days":
        const next7days = new Date(today);
        next7days.setDate(next7days.getDate() + 7);
        matchesDueDate = dueDate >= today && dueDate <= next7days;
        break;
      case "next30days":
        const next30days = new Date(today);
        next30days.setDate(next30days.getDate() + 30);
        matchesDueDate = dueDate >= today && dueDate <= next30days;
        break;
      case "overdue":
        matchesDueDate = dueDate < today && wo.status !== "COMPLETED" && wo.status !== "CANCELLED";
        break;
    }

    // RII筛选
    const matchesRii =
      hasRiiFilter === "all" ||
      (hasRiiFilter === "yes" && wo.hasRii) ||
      (hasRiiFilter === "no" && !wo.hasRii) ||
      (hasRiiFilter === "pending" && wo.hasRii && !wo.riiCompleted);

    return (
      matchesSearch &&
      matchesStatus &&
      matchesType &&
      matchesPriority &&
      matchesAircraft &&
      matchesAssignee &&
      matchesDueDate &&
      matchesRii
    );
  });

  // 排序
  const sortedWorkOrders = [...filteredWorkOrders].sort((a, b) => {
    const [field, direction] = sortBy.split("-");

    switch (field) {
      case "dueDate":
        const dateCompare = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        return direction === "asc" ? dateCompare : -dateCompare;
      case "priority":
        const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
        const priorityCompare = priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
        return direction === "asc" ? priorityCompare : -priorityCompare;
      case "created":
        const createdCompare = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        return direction === "asc" ? createdCompare : -createdCompare;
      default:
        return 0;
    }
  });

  // 统计
  const stats = {
    total: filteredWorkOrders.length,
    pending: filteredWorkOrders.filter((wo) => wo.status === "PENDING").length,
    inProgress: filteredWorkOrders.filter((wo) => wo.status === "IN_PROGRESS").length,
    inspection: filteredWorkOrders.filter((wo) => wo.status === "INSPECTION_REQUIRED").length,
    completed: filteredWorkOrders.filter((wo) => wo.status === "COMPLETED").length,
    overdue: filteredWorkOrders.filter((wo) => {
      const dueDate = new Date(wo.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return dueDate < today && wo.status !== "COMPLETED" && wo.status !== "CANCELLED";
    }).length,
    unassigned: filteredWorkOrders.filter((wo) => !wo.assignedTo).length,
  };

  // 清空筛选
  const clearFilters = () => {
    setStatusFilters([]);
    setTypeFilters([]);
    setPriorityFilters([]);
    setSelectedAircraft("all");
    setSelectedAssignee("all");
    setDueDateFilter("all");
    setHasRiiFilter("all");
    setDateFrom("");
    setDateTo("");
  };

  // 活跃筛选数量
  const activeFiltersCount =
    statusFilters.length +
    typeFilters.length +
    priorityFilters.length +
    (selectedAircraft !== "all" ? 1 : 0) +
    (selectedAssignee !== "all" ? 1 : 0) +
    (dueDateFilter !== "all" ? 1 : 0) +
    (hasRiiFilter !== "all" ? 1 : 0) +
    (dateFrom ? 1 : 0) +
    (dateTo ? 1 : 0);

  // Priority badge
  const PriorityBadge = ({ priority }: { priority: keyof typeof PRIORITY }) => {
    return (
      <div className="flex items-center gap-1">
        <div className={`h-2 w-2 rounded-full ${PRIORITY[priority].color}`} />
        <span className="text-xs text-muted-foreground">{PRIORITY[priority].label}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">工单搜索</h1>
          <p className="text-muted-foreground">
            高级搜索和筛选工单
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            导出
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索工单号、标题、飞机号或描述..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="relative"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              高级筛选
              {activeFiltersCount > 0 && (
                <Badge className="ml-2 h-5 px-1.5 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 状态筛选 */}
                <div>
                  <Label className="text-sm text-muted-foreground">状态</Label>
                  <div className="mt-1 border rounded-md p-2 max-h-32 overflow-y-auto">
                    {Object.entries(WORK_ORDER_STATUS).map(([key, { label }]) => (
                      <div key={key} className="flex items-center space-x-2 py-1">
                        <Checkbox
                          id={`status-${key}`}
                          checked={statusFilters.includes(key)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setStatusFilters([...statusFilters, key]);
                            } else {
                              setStatusFilters(statusFilters.filter((s) => s !== key));
                            }
                          }}
                        />
                        <Label htmlFor={`status-${key}`} className="text-sm cursor-pointer">
                          {label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 类型筛选 */}
                <div>
                  <Label className="text-sm text-muted-foreground">类型</Label>
                  <div className="mt-1 border rounded-md p-2">
                    {Object.entries(WORK_ORDER_TYPES).map(([key, { label }]) => (
                      <div key={key} className="flex items-center space-x-2 py-1">
                        <Checkbox
                          id={`type-${key}`}
                          checked={typeFilters.includes(key)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setTypeFilters([...typeFilters, key]);
                            } else {
                              setTypeFilters(typeFilters.filter((t) => t !== key));
                            }
                          }}
                        />
                        <Label htmlFor={`type-${key}`} className="text-sm cursor-pointer">
                          {label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 优先级筛选 */}
                <div>
                  <Label className="text-sm text-muted-foreground">优先级</Label>
                  <div className="mt-1 border rounded-md p-2">
                    {Object.entries(PRIORITY).map(([key, { label }]) => (
                      <div key={key} className="flex items-center space-x-2 py-1">
                        <Checkbox
                          id={`priority-${key}`}
                          checked={priorityFilters.includes(key)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setPriorityFilters([...priorityFilters, key]);
                            } else {
                              setPriorityFilters(priorityFilters.filter((p) => p !== key));
                            }
                          }}
                        />
                        <Label htmlFor={`priority-${key}`} className="text-sm cursor-pointer">
                          {label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 飞机 */}
                <div>
                  <Label className="text-sm text-muted-foreground">飞机</Label>
                  <Select value={selectedAircraft} onValueChange={setSelectedAircraft}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="全部飞机" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部飞机</SelectItem>
                      {aircraft.map((ac) => (
                        <SelectItem key={ac.id} value={ac.id}>
                          {ac.registration} - {ac.model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 负责人 */}
                <div>
                  <Label className="text-sm text-muted-foreground">负责人</Label>
                  <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="全部人员" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部人员</SelectItem>
                      <SelectItem value="unassigned">未分配</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 到期日 */}
                <div>
                  <Label className="text-sm text-muted-foreground">到期日</Label>
                  <Select value={dueDateFilter} onValueChange={setDueDateFilter}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="全部" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部</SelectItem>
                      {DATE_RANGE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* RII */}
                <div>
                  <Label className="text-sm text-muted-foreground">必检项(RII)</Label>
                  <Select value={hasRiiFilter} onValueChange={setHasRiiFilter}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="全部" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部</SelectItem>
                      <SelectItem value="yes">包含RII</SelectItem>
                      <SelectItem value="no">无RII</SelectItem>
                      <SelectItem value="pending">RII待完成</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 自定义日期范围 */}
                <div>
                  <Label className="text-sm text-muted-foreground">创建日期</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="h-9"
                    />
                    <span className="text-muted-foreground">-</span>
                    <Input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="h-9"
                    />
                  </div>
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex items-center justify-between pt-2">
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-1" />
                  清空筛选 ({activeFiltersCount})
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          找到 <span className="font-medium text-foreground">{filteredWorkOrders.length}</span> 个工单
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-sm">排序:</Label>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="h-8 w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">全部</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">待处理</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-slate-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">进行中</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-blue-600">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">待检验</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-yellow-600">{stats.inspection}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">已逾期</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-red-600">{stats.overdue}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">未分配</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-orange-600">{stats.unassigned}</div>
          </CardContent>
        </Card>
      </div>

      {/* Work Orders List */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {sortedWorkOrders.map((wo) => {
              const isOverdue = new Date(wo.dueDate) < new Date() && wo.status !== "COMPLETED" && wo.status !== "CANCELLED";

              return (
                <Link
                  key={wo.id}
                  to={`/work-orders/${wo.id}`}
                  className="block hover:bg-muted/50 transition-colors"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        {/* Priority Indicator */}
                        <div className={`h-10 w-1 rounded-full ${PRIORITY[wo.priority as keyof typeof PRIORITY].color}`} />

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-mono text-sm text-primary">
                              {wo.workOrderNumber}
                            </span>
                            <Badge className={WORK_ORDER_STATUS[wo.status as keyof typeof WORK_ORDER_STATUS].color}>
                              {WORK_ORDER_STATUS[wo.status as keyof typeof WORK_ORDER_STATUS].label}
                            </Badge>
                            <Badge className={WORK_ORDER_TYPES[wo.type as keyof typeof WORK_ORDER_TYPES].color}>
                              {WORK_ORDER_TYPES[wo.type as keyof typeof WORK_ORDER_TYPES].label}
                            </Badge>
                            {isOverdue && (
                              <Badge variant="destructive" className="gap-1">
                                <AlertCircle className="h-3 w-3" />
                                已逾期
                              </Badge>
                            )}
                            {wo.hasRii && !wo.riiCompleted && (
                              <Badge variant="outline" className="text-amber-600 border-amber-600">
                                RII待检
                              </Badge>
                            )}
                          </div>

                          <h3 className="font-medium text-sm mb-1">{wo.title}</h3>
                          <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                            {wo.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Plane className="h-3 w-3" />
                              <Link
                                to={`/aircraft/${wo.aircraftId}`}
                                className="text-primary hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {wo.aircraftRegistration}
                              </Link>
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {wo.assignedToName || "未分配"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span className={isOverdue ? "text-red-600" : ""}>
                                到期: {wo.dueDate}
                              </span>
                            </span>
                            {wo.estimatedHours && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {wo.actualHours || wo.estimatedHours}h / {wo.estimatedHours}h
                              </span>
                            )}
                          </div>

                          {/* Task Progress */}
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                              <span>任务进度</span>
                              <span>{wo.completedTasks}/{wo.taskCount}</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500 rounded-full transition-all"
                                style={{ width: `${(wo.completedTasks / wo.taskCount) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Priority Badge */}
                        <div className="text-right">
                          <PriorityBadge priority={wo.priority as keyof typeof PRIORITY} />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Empty State */}
          {sortedWorkOrders.length === 0 && (
            <div className="text-center py-12">
              <Wrench className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">未找到匹配的工单</h3>
              <p className="text-muted-foreground">
                尝试调整搜索条件或清空筛选器
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
