import { useState, useEffect } from "react";
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
  AlertTriangle,
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
import { Skeleton } from "../components/ui/skeleton";
import {
  workOrderService,
  WorkOrder,
  WorkOrderType,
  WorkOrderStatus,
  WorkOrderPriority,
  WORK_ORDER_TYPE_LABELS,
  WORK_ORDER_TYPE_COLORS,
  WORK_ORDER_STATUS_LABELS,
  WORK_ORDER_STATUS_COLORS,
  WORK_ORDER_PRIORITY_LABELS,
  WORK_ORDER_PRIORITY_COLORS,
} from "../services/work-order.service";
import { fullAircraftService, Aircraft } from "../services/fleet.service";

// Status icons
const STATUS_ICONS: Record<WorkOrderStatus, typeof Clock> = {
  DRAFT: Clock,
  OPEN: Clock,
  IN_PROGRESS: Wrench,
  PENDING_PARTS: AlertCircle,
  PENDING_INSPECTION: AlertCircle,
  COMPLETED: CheckCircle2,
  RELEASED: CheckCircle2,
  CANCELLED: XCircle,
};

/**
 * 工单列表页
 */
export function WorkOrderListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [aircraftList, setAircraftList] = useState<Aircraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [ordersData, aircraftData] = await Promise.all([
        workOrderService.getRecent(100),
        fullAircraftService.list(),
      ]);

      setWorkOrders(ordersData);
      setAircraftList(aircraftData);
    } catch (err) {
      console.error("Failed to load work orders:", err);
      setError("加载工单失败");
    } finally {
      setLoading(false);
    }
  };

  // Build aircraft lookup map
  const aircraftMap = new Map(aircraftList.map((a) => [a.id, a]));

  // Filter work orders
  const filteredWorkOrders = workOrders.filter((wo) => {
    const aircraft = aircraftMap.get(wo.aircraftId);
    const matchesSearch =
      wo.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      aircraft?.registration?.toLowerCase().includes(searchQuery.toLowerCase());

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

  // Format date from timestamp
  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return "-";
    return new Date(timestamp).toLocaleDateString("zh-CN");
  };

  // Priority badge
  const PriorityBadge = ({ priority }: { priority: WorkOrderPriority }) => {
    return (
      <div className="flex items-center gap-1">
        <div
          className={`h-2 w-2 rounded-full ${WORK_ORDER_PRIORITY_COLORS[priority]}`}
        />
        <span className="text-xs text-muted-foreground">
          {WORK_ORDER_PRIORITY_LABELS[priority]}
        </span>
      </div>
    );
  };

  // Kanban board
  const KanbanBoard = () => {
    const columns: Array<{ key: string; label: string; status: WorkOrderStatus }> =
      [
        { key: "open", label: "待处理", status: "OPEN" },
        { key: "in-progress", label: "进行中", status: "IN_PROGRESS" },
        { key: "inspection", label: "待检验", status: "PENDING_INSPECTION" },
        { key: "completed", label: "已完成", status: "COMPLETED" },
      ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((column) => {
          const columnOrders = filteredWorkOrders.filter(
            (wo) => wo.status === column.status
          );

          return (
            <div key={column.key} className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm">{column.label}</h3>
                <Badge variant="outline" className="text-xs">
                  {columnOrders.length}
                </Badge>
              </div>
              <div className="space-y-3">
                {columnOrders.map((wo) => {
                  const aircraft = aircraftMap.get(wo.aircraftId);
                  return (
                    <Link
                      key={wo.id}
                      to={`/work-orders/${wo.id}`}
                      className="block bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            WORK_ORDER_PRIORITY_COLORS[wo.priority]
                          }`}
                        />
                        <span className="text-xs font-medium text-muted-foreground">
                          {wo.orderNumber}
                        </span>
                      </div>
                      <p className="text-sm font-medium mb-1 line-clamp-2">
                        {wo.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {aircraft?.registration || "未知飞机"}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-3 w-16" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-6 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">加载失败</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={loadData}>重试</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">工单管理</h1>
          <p className="text-muted-foreground">创建、分配和跟踪维修工单</p>
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
          <Button asChild>
            <Link to="/work-orders/new">
              <Plus className="w-4 h-4 mr-2" />
              新建工单
            </Link>
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
              {(statusCounts.DRAFT || 0) + (statusCounts.OPEN || 0)}
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
              {statusCounts.PENDING_INSPECTION || 0}
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
              {(statusCounts.COMPLETED || 0) + (statusCounts.RELEASED || 0)}
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
              {
                workOrders.filter(
                  (wo) =>
                    wo.priority === "CRITICAL" &&
                    !["COMPLETED", "RELEASED", "CANCELLED"].includes(wo.status)
                ).length
              }
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
        {(
          [
            "OPEN",
            "IN_PROGRESS",
            "PENDING_INSPECTION",
            "COMPLETED",
            "CANCELLED",
          ] as WorkOrderStatus[]
        ).map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(status)}
            className={
              statusFilter === status ? WORK_ORDER_STATUS_COLORS[status] : ""
            }
          >
            {WORK_ORDER_STATUS_LABELS[status]} ({statusCounts[status] || 0})
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
              {Object.entries(WORK_ORDER_TYPE_LABELS).map(([key, label]) => (
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
            <CardDescription>共 {filteredWorkOrders.length} 个工单</CardDescription>
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
                      计划日期
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                      创建时间
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWorkOrders.map((wo) => {
                    const StatusIcon = STATUS_ICONS[wo.status];
                    const aircraft = aircraftMap.get(wo.aircraftId);

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
                            {wo.orderNumber}
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
                            {wo.description && (
                              <p className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                                {wo.description}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {aircraft ? (
                            <Link
                              to={`/aircraft/${wo.aircraftId}`}
                              className="text-sm text-primary hover:underline"
                            >
                              {aircraft.registration}
                            </Link>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              未知
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            className={
                              WORK_ORDER_TYPE_COLORS[wo.type as WorkOrderType] ||
                              "bg-slate-50 text-slate-700"
                            }
                          >
                            {WORK_ORDER_TYPE_LABELS[wo.type as WorkOrderType] ||
                              wo.type}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={WORK_ORDER_STATUS_COLORS[wo.status]}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {WORK_ORDER_STATUS_LABELS[wo.status]}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span>{formatDate(wo.scheduledEnd)}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-muted-foreground">
                            {formatDate(wo.createdAt)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/work-orders/${wo.id}`}>
                              <MoreHorizontal className="w-4 h-4" />
                            </Link>
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
