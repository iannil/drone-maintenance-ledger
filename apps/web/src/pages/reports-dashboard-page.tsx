import { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Plane,
  Clock,
  AlertTriangle,
  CheckCircle,
  Wrench,
  Calendar,
  Download,
} from "lucide-react";
import { Button } from "../components/ui/button";
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

/**
 * 数据看板页面
 */
export function ReportsDashboardPage() {
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedFleet, setSelectedFleet] = useState("all");

  // Mock data for stats
  const stats = {
    fleet: {
      total: 12,
      serviceable: 8,
      maintenance: 3,
      grounded: 1,
      utilization: 78.5,
    },
    flights: {
      total: 156,
      totalHours: 312.5,
      avgDuration: 2.0,
      onTimeRate: 94.2,
    },
    maintenance: {
      completed: 45,
      pending: 8,
      overdue: 2,
      compliance: 96.5,
    },
    safety: {
      incidents: 1,
      accidents: 0,
      daysSinceIncident: 45,
      safeFlightHours: 1250,
    },
  };

  // Mock utilization data
  const utilizationData = [
    { aircraft: "B-7011U", hours: 45.2, utilization: 85 },
    { aircraft: "B-7012U", hours: 52.1, utilization: 92 },
    { aircraft: "B-7013U", hours: 12.5, utilization: 35 },
    { aircraft: "B-7021U", hours: 38.7, utilization: 78 },
    { aircraft: "B-7022U", hours: 41.3, utilization: 82 },
  ];

  // Mock maintenance alerts
  const maintenanceAlerts = [
    {
      id: 1,
      aircraft: "B-7011U",
      type: "到期",
      description: "电机检查到期",
      dueDate: "2026-01-18",
      priority: "high",
    },
    {
      id: 2,
      aircraft: "B-7012U",
      type: "即将到期",
      description: "螺旋桨更换",
      dueDate: "2026-01-22",
      priority: "medium",
    },
    {
      id: 3,
      aircraft: "B-7023U",
      type: "已逾期",
      description: "180天检查",
      dueDate: "2026-01-14",
      priority: "critical",
    },
  ];

  // Mock recent activities
  const recentActivities = [
    { time: "10分钟前", type: "flight", description: "B-7011U 完成巡检任务", user: "张三" },
    { time: "30分钟前", type: "maintenance", description: "完成 B-7012U 电机检查", user: "李四" },
    { time: "1小时前", type: "incident", description: "B-7013U 报告 GPS 信号异常", user: "王五" },
    { time: "2小时前", type: "flight", description: "B-7021U 完成配送任务", user: "赵六" },
    { time: "3小时前", type: "maintenance", description: "创建工单 WO-20260116-003", user: "系统" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">数据看板</h1>
          <p className="text-muted-foreground">
            机队运营、维保合规性和安全性分析
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">最近7天</SelectItem>
              <SelectItem value="30d">最近30天</SelectItem>
              <SelectItem value="90d">最近90天</SelectItem>
              <SelectItem value="1y">最近一年</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            导出报告
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Fleet Status */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                机队状态
              </CardTitle>
              <Plane className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.fleet.serviceable}/{stats.fleet.total}</div>
            <p className="text-xs text-muted-foreground mt-1">飞机可用</p>
            <div className="flex items-center gap-2 mt-3">
              <Badge className="bg-green-100 text-green-700">
                {stats.fleet.serviceable} 可用
              </Badge>
              <Badge className="bg-yellow-100 text-yellow-700">
                {stats.fleet.maintenance} 维护中
              </Badge>
              <Badge className="bg-red-100 text-red-700">
                {stats.fleet.grounded} 停飞
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Utilization Rate */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                机队利用率
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{stats.fleet.utilization}%</div>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              较上月 +3.2%
            </p>
            <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${stats.fleet.utilization}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Flight Stats */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                飞行统计
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.flights.total}</div>
            <p className="text-xs text-muted-foreground mt-1">架次</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">总时长:</span>{" "}
                <span className="font-medium">{stats.flights.totalHours}h</span>
              </div>
              <div>
                <span className="text-muted-foreground">平均:</span>{" "}
                <span className="font-medium">{stats.flights.avgDuration}h</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Compliance */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                维保合规率
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.maintenance.compliance}%</div>
            <p className="text-xs text-muted-foreground mt-1">合规性</p>
            <div className="mt-3 flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                {stats.maintenance.completed} 完成
              </span>
              <span className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-yellow-500" />
                {stats.maintenance.pending} 待处理
              </span>
              <span className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-red-500" />
                {stats.maintenance.overdue} 逾期
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Aircraft Utilization */}
        <Card>
          <CardHeader>
            <CardTitle>飞机利用率</CardTitle>
            <CardDescription>
              各飞机飞行小时数和利用率对比
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {utilizationData.map((item) => (
                <div key={item.aircraft} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.aircraft}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground">{item.hours}h</span>
                      <span className={item.utilization >= 80 ? "text-green-600" : item.utilization >= 50 ? "text-yellow-600" : "text-red-600"}>
                        {item.utilization}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        item.utilization >= 80 ? "bg-green-500" : item.utilization >= 50 ? "bg-yellow-500" : "bg-red-500"
                      }`}
                      style={{ width: `${item.utilization}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>维保预警</CardTitle>
            <CardDescription>
              需要关注的维保项目
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {maintenanceAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border-l-4 ${
                    alert.priority === "critical"
                      ? "border-red-500 bg-red-50"
                      : alert.priority === "high"
                      ? "border-orange-500 bg-orange-50"
                      : "border-yellow-500 bg-yellow-50"
                  }`}
                >
                  <AlertTriangle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                    alert.priority === "critical"
                      ? "text-red-500"
                      : alert.priority === "high"
                      ? "text-orange-500"
                      : "text-yellow-500"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{alert.aircraft}</span>
                      <Badge
                        variant="outline"
                        className={
                          alert.priority === "critical"
                            ? "border-red-500 text-red-700 text-xs"
                            : "text-xs"
                        }
                      >
                        {alert.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{alert.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      到期: {alert.dueDate}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="flex-shrink-0">
                    查看
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Safety Overview */}
        <Card>
          <CardHeader>
            <CardTitle>安全概览</CardTitle>
            <CardDescription>
              安全指标和记录
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">安全飞行小时</span>
              <span className="font-bold text-green-600">{stats.safety.safeFlightHours}h</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">无事故天数</span>
              <span className="font-bold">{stats.safety.daysSinceIncident} 天</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">本期事件</span>
              <Badge variant={stats.safety.incidents > 0 ? "destructive" : "default"}>
                {stats.safety.incidents} 起
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">本期事故</span>
              <Badge variant={stats.safety.accidents > 0 ? "destructive" : "default"}>
                {stats.safety.accidents} 起
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>最近活动</CardTitle>
            <CardDescription>
              系统中的最新操作
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.type === "flight"
                      ? "bg-blue-100"
                      : activity.type === "maintenance"
                      ? "bg-green-100"
                      : activity.type === "incident"
                      ? "bg-red-100"
                      : "bg-slate-100"
                  }`}>
                    {activity.type === "flight" && <Plane className="h-4 w-4 text-blue-600" />}
                    {activity.type === "maintenance" && <Wrench className="h-4 w-4 text-green-600" />}
                    {activity.type === "incident" && <AlertTriangle className="h-4 w-4 text-red-600" />}
                    {activity.type === "system" && <CheckCircle className="h-4 w-4 text-slate-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.user} · {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
