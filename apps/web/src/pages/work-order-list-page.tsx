import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  ClipboardList,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Wrench,
  Calendar,
  MoreHorizontal,
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

// 工单状态
const WORK_ORDER_STATUS = {
  PENDING: {
    label: "待处理",
    color: "bg-slate-100 text-slate-700",
    icon: Clock,
  },
  IN_PROGRESS: {
    label: "进行中",
    color: "bg-blue-100 text-blue-700",
    icon: Wrench,
  },
  INSPECTION_REQUIRED: {
    label: "待检验",
    color: "bg-yellow-100 text-yellow-700",
    icon: AlertCircle,
  },
  COMPLETED: {
    label: "已完成",
    color: "bg-green-100 text-green-700",
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: "已取消",
    color: "bg-red-100 text-red-700",
    icon: XCircle,
  },
};

// 工单类型
const WORK_ORDER_TYPES = {
  SCHEDULED: { label: "计划性", color: "bg-purple-50 text-purple-700 border-purple-200" },
  UNSCHEDULED: { label: "非计划性", color: "bg-orange-50 text-orange-700 border-orange-200" },
  EMERGENCY: { label: "紧急", color: "bg-red-50 text-red-700 border-red-200" },
};

// 优先级
const PRIORITY = {
  CRITICAL: { label: "紧急", color: "bg-red-500" },
  HIGH: { label: "高", color: "bg-orange-500" },
  MEDIUM: { label: "中", color: "bg-yellow-500" },
  LOW: { label: "低", color: "bg-slate-400" },
};

/**
 * 工单列表页
 */
export function WorkOrderListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");

  // Mock work orders
  const workOrders = [
    {
      id: "wo-001",
      workOrderNumber: "WO-2026-0116",
      title: "电机定期检查 - B-7011U",
      description: "每50飞行小时检查电机状态，测试电机转速和温度",
      type: "SCHEDULED" as const,
      priority: "HIGH" as const,
      status: "IN_PROGRESS" as const,
      aircraftId: "ac-001",
      aircraftRegistration: "B-7011U",
      scheduleId: "ms-001",
      assignedTo: "张三",
      createdAt: "2026-01-15",
      dueDate: "2026-01-20",
      estimatedHours: 2,
      actualHours: 1.5,
      taskCount: 5,
      completedTasks: 3,
    },
    {
      id: "wo-002",
      workOrderNumber: "WO-2026-0115",
      title: "螺旋桨更换 - B-7011U",
      description: "更换4片螺旋桨，进行动平衡测试",
      type: "SCHEDULED" as const,
      priority: "MEDIUM" as const,
      status: "PENDING" as const,
      aircraftId: "ac-001",
      aircraftRegistration: "B-7011U",
      scheduleId: "ms-002",
      assignedTo: "李四",
      createdAt: "2026-01-14",
      dueDate: "2026-01-22",
      estimatedHours: 3,
      actualHours: null,
      taskCount: 8,
      completedTasks: 0,
    },
    {
      id: "wo-003",
      workOrderNumber: "WO-2026-0114",
      title: "紧急维修 - GPS故障 - B-7012U",
      description: "GPS模块无信号，需要紧急检查和更换",
      type: "EMERGENCY" as const,
      priority: "CRITICAL" as const,
      status: "INSPECTION_REQUIRED" as const,
      aircraftId: "ac-002",
      aircraftRegistration: "B-7012U",
      scheduleId: null,
      assignedTo: "王五",
      createdAt: "2026-01-16",
      dueDate: "2026-01-16",
      estimatedHours: 4,
      actualHours: 3.5,
      taskCount: 6,
      completedTasks: 6,
    },
    {
      id: "wo-004",
      workOrderNumber: "WO-2026-0113",
      title: "180天日历检查 - B-7013U",
      description: "每180天进行的全面检查，包括所有系统",
      type: "SCHEDULED" as const,
      priority: "HIGH" as const,
      status: "PENDING" as const,
      aircraftId: "ac-003",
      aircraftRegistration: "B-7013U",
      scheduleId: "ms-003",
      assignedTo: null,
      createdAt: "2026-01-13",
      dueDate: "2026-01-18",
      estimatedHours: 8,
      actualHours: null,
      taskCount: 20,
      completedTasks: 0,
    },
    {
      id: "wo-005",
      workOrderNumber: "WO-2026-0112",
      title: "电池包更换 - B-7012U",
      description: "电池循环接近300次，需要更换电池包",
      type: "UNSCHEDULED" as const,
      priority: "MEDIUM" as const,
      status: "COMPLETED" as const,
      aircraftId: "ac-002",
      aircraftRegistration: "B-7012U",
      scheduleId: "ms-004",
      assignedTo: "赵六",
      createdAt: "2026-01-10",
      dueDate: "2026-01-15",
      estimatedHours: 1,
      actualHours: 1,
      taskCount: 3,
      completedTasks: 3,
      completedAt: "2026-01-14",
    },
    {
      id: "wo-006",
      workOrderNumber: "WO-2026-0111",
      title: "机架紧固检查 - B-7013U",
      description: "检查机架所有紧固件扭矩",
      type: "SCHEDULED" as const,
      priority: "LOW" as const,
      status: "CANCELLED" as const,
      aircraftId: "ac-003",
      aircraftRegistration: "B-7013U",
      scheduleId: null,
      assignedTo: "钱七",
      createdAt: "2026-01-08",
      dueDate: "2026-01-12",
      estimatedHours: 2,
      actualHours: null,
      taskCount: 4,
      completedTasks: 0,
    },
  ];

  // Filter work orders
  const filteredWorkOrders = workOrders.filter((wo) => {
    const matchesSearch =
      wo.workOrderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.aircraftRegistration.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || wo.status === statusFilter;
    const matchesType = typeFilter === "all" || wo.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Status counts
  const statusCounts = workOrders.reduce(
    (acc, wo) => {
      acc[wo.status] = (acc[wo.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Priority badge
  const PriorityBadge = ({ priority }: { priority: keyof typeof PRIORITY }) => {
    return (
      <div className="flex items-center gap-1">
        <div className={`h-2 w-2 rounded-full ${PRIORITY[priority].color}`} />
        <span className="text-xs text-muted-foreground">{PRIORITY[priority].label}</span>
      </div>
    );
  };

  // Task progress
  const TaskProgress = ({ completed, total }: { completed: number; total: number }) => {
    const progress = (completed / total) * 100;
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden max-w-[100px]">
          <div
            className="h-full bg-green-500 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground">
          {completed}/{total}
        </span>
      </div>
    );
  };

  // Kanban board
  const KanbanBoard = () => {
    const columns: Array<{ key: string; label: string; status: string }> = [
      { key: "pending", label: "待处理", status: "PENDING" },
      { key: "in-progress", label: "进行中", status: "IN_PROGRESS" },
      { key: "inspection", label: "待检验", status: "INSPECTION_REQUIRED" },
      { key: "completed", label: "已完成", status: "COMPLETED" },
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((column) => {
          const columnOrders = filteredWorkOrders.filter((wo) => wo.status === column.status);

          return (
            <div key={column.key} className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm">{column.label}</h3>
                <Badge variant="outline" className="text-xs">
                  {columnOrders.length}
                </Badge>
              </div>
              <div className="space-y-3">
                {columnOrders.map((wo) => (
                  <div
                    key={wo.id}
                    className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => {/* Navigate to detail */}}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`h-2 w-2 rounded-full ${PRIORITY[wo.priority].color}`} />
                      <span className="text-xs font-medium text-muted-foreground">
                        {wo.workOrderNumber}
                      </span>
                    </div>
                    <p className="text-sm font-medium mb-1 line-clamp-2">{wo.title}</p>
                    <p className="text-xs text-muted-foreground mb-2">
                      {wo.aircraftRegistration}
                    </p>
                    <TaskProgress completed={wo.completedTasks} total={wo.taskCount} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">工单管理</h1>
          <p className="text-muted-foreground">
            创建、分配和跟踪维修工单
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("list")}
            title="列表视图"
          >
            <ClipboardList className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "kanban" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("kanban")}
            title="看板视图"
          >
            <Wrench className="w-4 h-4" />
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            新建工单
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              全部
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{workOrders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              待处理
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-slate-600">
              {statusCounts.PENDING || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              进行中
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-blue-600">
              {statusCounts.IN_PROGRESS || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              待检验
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-yellow-600">
              {statusCounts.INSPECTION_REQUIRED || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              已完成
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-green-600">
              {statusCounts.COMPLETED || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              紧急
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-red-600">
              {workOrders.filter((wo) => wo.priority === "CRITICAL" && wo.status !== "COMPLETED").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Filter Bar */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={statusFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("all")}
        >
          全部 ({workOrders.length})
        </Button>
        {Object.entries(WORK_ORDER_STATUS).map(([key, { label, color }]) => (
          <Button
            key={key}
            variant={statusFilter === key ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(key)}
            className={statusFilter === key ? color : ""}
          >
            {label} ({statusCounts[key] || 0})
          </Button>
        ))}
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索工单号、标题或飞机..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="all">全部类型</option>
              {Object.entries(WORK_ORDER_TYPES).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {viewMode === "kanban" ? (
        <KanbanBoard />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>工单列表</CardTitle>
            <CardDescription>
              共 {filteredWorkOrders.length} 个工单
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                      优先级
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                      工单号
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                      标题
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                      飞机
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                      类型
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                      状态
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                      负责人
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                      到期日
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                      进度
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWorkOrders.map((wo) => {
                    const StatusIcon = WORK_ORDER_STATUS[wo.status].icon;

                    return (
                      <tr key={wo.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <PriorityBadge priority={wo.priority} />
                        </td>
                        <td className="py-3 px-4">
                          <Link
                            to={`/work-orders/${wo.id}`}
                            className="font-mono text-sm text-primary hover:underline"
                          >
                            {wo.workOrderNumber}
                          </Link>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <Link
                              to={`/work-orders/${wo.id}`}
                              className="font-medium text-sm hover:text-primary"
                            >
                              {wo.title}
                            </Link>
                            <p className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                              {wo.description}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Link
                            to={`/aircraft/${wo.aircraftId}`}
                            className="text-sm text-primary hover:underline"
                          >
                            {wo.aircraftRegistration}
                          </Link>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={WORK_ORDER_TYPES[wo.type].color}>
                            {WORK_ORDER_TYPES[wo.type].label}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={WORK_ORDER_STATUS[wo.status].color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {WORK_ORDER_STATUS[wo.status].label}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          {wo.assignedTo ? (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">{wo.assignedTo}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">未分配</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className={new Date(wo.dueDate) < new Date() && wo.status !== "COMPLETED" ? "text-red-600" : ""}>
                              {wo.dueDate}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <TaskProgress completed={wo.completedTasks} total={wo.taskCount} />
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {filteredWorkOrders.length === 0 && (
              <div className="text-center py-12">
                <ClipboardList className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">未找到工单</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                    ? "尝试调整搜索或筛选条件"
                    : "点击上方按钮创建第一个工单"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
