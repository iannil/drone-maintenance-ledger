import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Pause,
  MoreHorizontal,
  Loader2,
  Play,
  RefreshCw,
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
  maintenanceSchedulerService,
  MaintenanceAlert,
  ScheduleCounts,
  TriggerType,
} from "../services/maintenance-scheduler.service";

// Trigger type configuration
const TRIGGER_TYPES: Record<TriggerType, { label: string; icon: typeof Calendar; color: string }> = {
  CALENDAR_DAYS: { label: "日历日", icon: Calendar, color: "text-blue-500" },
  FLIGHT_HOURS: { label: "飞行小时", icon: Clock, color: "text-green-500" },
  FLIGHT_CYCLES: { label: "起降循环", icon: AlertTriangle, color: "text-orange-500" },
  BATTERY_CYCLES: { label: "电池循环", icon: CheckCircle, color: "text-purple-500" },
};

// Alert type configuration
const ALERT_TYPE_CONFIG = {
  WARNING: { label: "预警", color: "bg-yellow-100 text-yellow-700" },
  DUE: { label: "到期", color: "bg-orange-100 text-orange-700" },
  OVERDUE: { label: "逾期", color: "bg-red-100 text-red-700" },
};

/**
 * Maintenance Schedule List Page
 */
export function MaintenanceSchedulePage() {
  // Data state
  const [alerts, setAlerts] = useState<MaintenanceAlert[]>([]);
  const [counts, setCounts] = useState<ScheduleCounts | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunningScheduler, setIsRunningScheduler] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [alertsData, countsData] = await Promise.all([
        maintenanceSchedulerService.getAlerts({ limit: 100 }),
        maintenanceSchedulerService.getScheduleCounts(),
      ]);
      setAlerts(alertsData);
      setCounts(countsData);
    } catch (err) {
      console.error("Failed to load maintenance data:", err);
      setError("加载维保数据失败");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunScheduler = async () => {
    setIsRunningScheduler(true);
    try {
      const result = await maintenanceSchedulerService.runScheduler();
      console.log("Scheduler result:", result);
      // Reload data after running scheduler
      await loadData();
    } catch (err) {
      console.error("Failed to run scheduler:", err);
      alert("运行调度器失败");
    } finally {
      setIsRunningScheduler(false);
    }
  };

  // Filter alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const matchesSearch =
        searchQuery === "" ||
        alert.scheduleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.aircraftRegistration.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.triggerName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || alert.alertType === statusFilter;
      const matchesType = typeFilter === "all" || alert.triggerType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [alerts, searchQuery, statusFilter, typeFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = counts
      ? counts.PENDING + counts.DUE + counts.OVERDUE + counts.COMPLETED
      : 0;
    const overdue = alerts.filter((a) => a.alertType === "OVERDUE").length;
    const due = alerts.filter((a) => a.alertType === "DUE").length;
    const warning = alerts.filter((a) => a.alertType === "WARNING").length;

    return { total, overdue, due, warning };
  }, [alerts, counts]);

  // Get remaining display
  const getRemainingDisplay = (alert: MaintenanceAlert) => {
    if (alert.remainingDays !== null) {
      if (alert.remainingDays < 0) {
        return `逾期 ${Math.abs(alert.remainingDays)} 天`;
      }
      return `${alert.remainingDays} 天后到期`;
    }
    if (alert.remainingValue !== null) {
      const triggerConfig = TRIGGER_TYPES[alert.triggerType];
      const unit =
        alert.triggerType === "FLIGHT_HOURS"
          ? "小时"
          : alert.triggerType === "FLIGHT_CYCLES"
          ? "次"
          : alert.triggerType === "BATTERY_CYCLES"
          ? "次"
          : "";
      if (alert.remainingValue < 0) {
        return `逾期 ${Math.abs(alert.remainingValue).toFixed(1)} ${unit}`;
      }
      return `剩余 ${alert.remainingValue.toFixed(1)} ${unit}`;
    }
    return "-";
  };

  // Calculate progress
  const calculateProgress = (alert: MaintenanceAlert) => {
    if (alert.dueAtValue !== null && alert.currentValue !== null) {
      // For value-based triggers
      const progress = (alert.currentValue / alert.dueAtValue) * 100;
      return Math.min(progress, 100);
    }
    if (alert.remainingDays !== null) {
      // For calendar-based triggers - assuming 30 days total
      const totalDays = 30; // Default interval
      const daysPassed = totalDays - alert.remainingDays;
      return Math.min((daysPassed / totalDays) * 100, 100);
    }
    return 0;
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-medium text-slate-900">{error}</p>
          <Button className="mt-4" onClick={loadData}>
            重试
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">维保计划</h1>
          <p className="text-muted-foreground">
            管理飞机和零部件的维保计划与触发器
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRunScheduler} disabled={isRunningScheduler}>
            {isRunningScheduler ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            运行调度器
          </Button>
          <Button asChild>
            <Link to="/maintenance/schedules/new">
              <Plus className="w-4 h-4 mr-2" />
              新建计划
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              全部预警
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <div className="text-2xl font-bold">{alerts.length}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              预警
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <div className="text-2xl font-bold text-yellow-600">{stats.warning}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              即将到期
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <div className="text-2xl font-bold text-orange-600">{stats.due}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              已逾期
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            )}
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
          全部 ({alerts.length})
        </Button>
        <Button
          variant={statusFilter === "WARNING" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("WARNING")}
          className={statusFilter === "WARNING" ? "bg-yellow-600 hover:bg-yellow-700" : ""}
        >
          预警 ({stats.warning})
        </Button>
        <Button
          variant={statusFilter === "DUE" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("DUE")}
          className={statusFilter === "DUE" ? "bg-orange-600 hover:bg-orange-700" : ""}
        >
          到期 ({stats.due})
        </Button>
        <Button
          variant={statusFilter === "OVERDUE" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("OVERDUE")}
          className={statusFilter === "OVERDUE" ? "bg-red-600 hover:bg-red-700" : ""}
        >
          逾期 ({stats.overdue})
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索计划名称或飞机..."
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
              <option value="all">全部触发类型</option>
              {Object.entries(TRIGGER_TYPES).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <Card>
        <CardHeader>
          <CardTitle>维保预警列表</CardTitle>
          <CardDescription>
            共 {filteredAlerts.length} 条预警
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAlerts.map((alert) => {
                const triggerConfig = TRIGGER_TYPES[alert.triggerType];
                const TriggerIcon = triggerConfig?.icon || Calendar;
                const alertConfig = ALERT_TYPE_CONFIG[alert.alertType];
                const progress = calculateProgress(alert);
                const isOverdue = alert.alertType === "OVERDUE";
                const isDue = alert.alertType === "DUE";

                return (
                  <div
                    key={`${alert.scheduleId}-${alert.triggerId}`}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        {/* Trigger Icon */}
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                            isOverdue
                              ? "bg-red-100"
                              : isDue
                              ? "bg-orange-100"
                              : "bg-yellow-100"
                          }`}
                        >
                          <TriggerIcon
                            className={`h-5 w-5 ${triggerConfig?.color || "text-slate-500"}`}
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-medium text-slate-900">
                              {alert.scheduleName}
                            </span>
                            <Badge className={alertConfig.color}>{alertConfig.label}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {alert.triggerName}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            飞机:{" "}
                            <Link
                              to={`/aircraft/${alert.aircraftId}`}
                              className="text-primary hover:underline"
                            >
                              {alert.aircraftRegistration}
                            </Link>
                            {" | "}
                            触发类型: {triggerConfig?.label || alert.triggerType}
                          </p>

                          {/* Progress and Details */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            <span>
                              当前值: {alert.currentValue?.toFixed(1) || "-"}
                            </span>
                            {alert.dueAtValue !== null && (
                              <span>到期值: {alert.dueAtValue.toFixed(1)}</span>
                            )}
                            <span
                              className={`font-medium ${
                                isOverdue
                                  ? "text-red-600"
                                  : isDue
                                  ? "text-orange-600"
                                  : "text-yellow-600"
                              }`}
                            >
                              {getRemainingDisplay(alert)}
                            </span>
                          </div>

                          {/* Progress Bar */}
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                              <span>进度</span>
                              <span>{Math.round(progress)}%</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all ${
                                  isOverdue
                                    ? "bg-red-500"
                                    : isDue
                                    ? "bg-orange-500"
                                    : "bg-yellow-500"
                                }`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/work-orders/new?schedule=${alert.scheduleId}`}>
                            创建工单
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredAlerts.length === 0 && (
            <div className="text-center py-12">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                  ? "未找到匹配的维保预警"
                  : "暂无维保预警"}
              </h3>
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                  ? "尝试调整搜索或筛选条件"
                  : "所有维保项目状态正常"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
