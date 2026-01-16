import { useState } from "react";
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
  User,
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
import { AircraftStatusBadge } from "../components/common/status-badge";

// 维保触发器类型
const TRIGGER_TYPES = {
  CALENDAR_DAYS: { label: "日历日", icon: Calendar, color: "text-blue-500" },
  FLIGHT_HOURS: { label: "飞行小时", icon: Clock, color: "text-green-500" },
  FLIGHT_CYCLES: { label: "起降循环", icon: AlertTriangle, color: "text-orange-500" },
  BATTERY_CYCLES: { label: "电池循环", icon: CheckCircle, color: "text-purple-500" },
};

// 维保状态
const SCHEDULE_STATUS = {
  ACTIVE: { label: "进行中", color: "bg-green-100 text-green-700" },
  PAUSED: { label: "暂停", color: "bg-yellow-100 text-yellow-700" },
  COMPLETED: { label: "已完成", color: "bg-blue-100 text-blue-700" },
};

/**
 * 维保计划列表页
 */
export function MaintenanceSchedulePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Mock aircraft data
  const aircraft = [
    { id: "ac-001", registration: "B-7011U" },
    { id: "ac-002", registration: "B-7012U" },
    { id: "ac-003", registration: "B-7013U" },
  ];

  // Mock maintenance schedules
  const schedules = [
    {
      id: "ms-001",
      name: "电机定期检查",
      description: "每50飞行小时检查电机状态",
      aircraftId: "ac-001",
      aircraftRegistration: "B-7011U",
      triggerType: "FLIGHT_HOURS",
      triggerValue: 50,
      currentUsage: 125.5,
      lastCompleted: "2026-01-01",
      nextDue: "2026-01-20",
      status: "ACTIVE" as const,
      priority: "high" as const,
    },
    {
      id: "ms-002",
      name: "螺旋桨更换",
      description: "每200小时更换螺旋桨",
      aircraftId: "ac-001",
      aircraftRegistration: "B-7011U",
      triggerType: "FLIGHT_HOURS",
      triggerValue: 200,
      currentUsage: 125.5,
      lastCompleted: "2025-10-15",
      nextDue: "2026-02-10",
      status: "ACTIVE" as const,
      priority: "medium" as const,
    },
    {
      id: "ms-003",
      name: "180天日历检查",
      description: "每180天进行的全面检查",
      aircraftId: "ac-001",
      aircraftRegistration: "B-7011U",
      triggerType: "CALENDAR_DAYS",
      triggerValue: 180,
      currentUsage: 45,
      lastCompleted: "2025-07-20",
      nextDue: "2026-01-16",
      status: "ACTIVE" as const,
      priority: "high" as const,
    },
    {
      id: "ms-004",
      name: "电池包更换",
      description: "电池循环达到300次后更换",
      aircraftId: "ac-002",
      aircraftRegistration: "B-7012U",
      triggerType: "BATTERY_CYCLES",
      triggerValue: 300,
      currentUsage: 198,
      lastCompleted: "2025-08-01",
      nextDue: "2026-03-15",
      status: "ACTIVE" as const,
      priority: "medium" as const,
    },
    {
      id: "ms-005",
      name: "起落架检查",
      description: "每100次起降检查起落架",
      aircraftId: "ac-002",
      aircraftRegistration: "B-7012U",
      triggerType: "FLIGHT_CYCLES",
      triggerValue: 100,
      currentUsage: 72,
      lastCompleted: "2025-11-20",
      nextDue: "2026-02-01",
      status: "ACTIVE" as const,
      priority: "low" as const,
    },
    {
      id: "ms-006",
      name: "GPS模块校准",
      description: "定期校准GPS模块",
      aircraftId: "ac-003",
      aircraftRegistration: "B-7013U",
      triggerType: "CALENDAR_DAYS",
      triggerValue: 90,
      currentUsage: 30,
      lastCompleted: "2025-10-01",
      nextDue: "2025-12-30",
      status: "COMPLETED" as const,
      priority: "low" as const,
    },
    {
      id: "ms-007",
      name: "飞控软件升级",
      description: "飞控系统固件升级计划",
      aircraftId: "ac-003",
      aircraftRegistration: "B-7013U",
      triggerType: "CALENDAR_DAYS",
      triggerValue: 30,
      currentUsage: 15,
      lastCompleted: "2025-12-01",
      nextDue: "2026-01-15",
      status: "PAUSED" as const,
      priority: "medium" as const,
    },
  ];

  // Filter schedules
  const filteredSchedules = schedules.filter((schedule) => {
    const matchesSearch =
      schedule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      schedule.aircraftRegistration.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || schedule.status === statusFilter;
    const matchesType = typeFilter === "all" || schedule.triggerType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Calculate progress
  const calculateProgress = (schedule: typeof schedules[0]) => {
    if (schedule.triggerType === "FLIGHT_HOURS" || schedule.triggerType === "BATTERY_CYCLES") {
      const progress = (schedule.currentUsage % schedule.triggerValue) / schedule.triggerValue * 100;
      return Math.min(progress, 100);
    }
    if (schedule.triggerType === "FLIGHT_CYCLES") {
      const progress = (schedule.currentUsage % schedule.triggerValue) / schedule.triggerValue * 100;
      return Math.min(progress, 100);
    }
    // Calendar days - calculate based on days passed since last completion
    const daysSinceLast = Math.floor(
      (Date.now() - new Date(schedule.lastCompleted).getTime()) / (1000 * 60 * 60 * 24)
    );
    return Math.min((daysSinceLast / schedule.triggerValue) * 100, 100);
  };

  // Check if due soon
  const isDueSoon = (schedule: typeof schedules[0]) => {
    if (schedule.status !== "ACTIVE") return false;
    const daysUntilDue = Math.ceil(
      (new Date(schedule.nextDue).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilDue <= 7 && daysUntilDue >= 0;
  };

  // Check if overdue
  const isOverdue = (schedule: typeof schedules[0]) => {
    if (schedule.status !== "ACTIVE") return false;
    return new Date(schedule.nextDue) < new Date();
  };

  // Priority badge
  const PriorityBadge = ({ priority }: { priority: "high" | "medium" | "low" }) => {
    const styles = {
      high: "bg-red-100 text-red-700",
      medium: "bg-yellow-100 text-yellow-700",
      low: "bg-slate-100 text-slate-700",
    };
    const labels = {
      high: "高",
      medium: "中",
      low: "低",
    };
    return (
      <Badge className={styles[priority]}>
        {labels[priority]}
      </Badge>
    );
  };

  // Status counts
  const statusCounts = schedules.reduce(
    (acc, s) => {
      acc[s.status] = (acc[s.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

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
        <Button asChild>
          <Link to="/maintenance/schedules/new">
            <Plus className="w-4 h-4 mr-2" />
            新建计划
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              全部计划
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schedules.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              进行中
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {statusCounts.ACTIVE || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              即将到期
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {schedules.filter(isDueSoon).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              已逾期
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {schedules.filter(isOverdue).length}
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
          全部 ({schedules.length})
        </Button>
        <Button
          variant={statusFilter === "ACTIVE" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("ACTIVE")}
        >
          进行中 ({statusCounts.ACTIVE || 0})
        </Button>
        <Button
          variant={statusFilter === "PAUSED" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("PAUSED")}
        >
          暂停 ({statusCounts.PAUSED || 0})
        </Button>
        <Button
          variant={statusFilter === "COMPLETED" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("COMPLETED")}
        >
          已完成 ({statusCounts.COMPLETED || 0})
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

      {/* Schedules List */}
      <Card>
        <CardHeader>
          <CardTitle>维保计划列表</CardTitle>
          <CardDescription>
            共 {filteredSchedules.length} 个维保计划
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredSchedules.map((schedule) => {
              const TriggerIcon = TRIGGER_TYPES[schedule.triggerType].icon;
              const progress = calculateProgress(schedule);
              const dueSoon = isDueSoon(schedule);
              const overdue = isOverdue(schedule);

              return (
                <div
                  key={schedule.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Trigger Icon */}
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        overdue ? "bg-red-100" : dueSoon ? "bg-orange-100" : "bg-slate-100"
                      }`}>
                        <TriggerIcon className={`h-5 w-5 ${TRIGGER_TYPES[schedule.triggerType].color}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Link
                            to={`/maintenance/schedules/${schedule.id}`}
                            className="font-medium text-slate-900 hover:text-primary"
                          >
                            {schedule.name}
                          </Link>
                          <PriorityBadge priority={schedule.priority} />
                          <Badge className={SCHEDULE_STATUS[schedule.status].color}>
                            {SCHEDULE_STATUS[schedule.status].label}
                          </Badge>
                          {overdue && (
                            <Badge variant="destructive" className="gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              已逾期
                            </Badge>
                          )}
                          {dueSoon && !overdue && (
                            <Badge variant="outline" className="border-orange-500 text-orange-700 gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              即将到期
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {schedule.description}
                        </p>

                        {/* Details */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                          <span className="text-muted-foreground">
                            飞机:{" "}
                            <Link
                              to={`/aircraft/${schedule.aircraftId}`}
                              className="text-primary hover:underline"
                            >
                              {schedule.aircraftRegistration}
                            </Link>
                          </span>
                          <span className="text-muted-foreground">
                            触发: {TRIGGER_TYPES[schedule.triggerType].label} / {schedule.triggerValue}
                          </span>
                          <span className="text-muted-foreground">
                            下次到期: {schedule.nextDue}
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
                                overdue ? "bg-red-500" : dueSoon ? "bg-orange-500" : "bg-green-500"
                              }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      {schedule.status === "PAUSED" && (
                        <Button variant="ghost" size="icon" title="恢复">
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
                      {schedule.status === "ACTIVE" && (
                        <Button variant="ghost" size="icon" title="暂停">
                          <Pause className="w-4 h-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredSchedules.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">未找到维保计划</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                  ? "尝试调整搜索或筛选条件"
                  : "点击上方按钮创建第一个维保计划"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
