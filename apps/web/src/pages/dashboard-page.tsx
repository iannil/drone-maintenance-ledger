import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import {
  Plane,
  Package,
  AlertCircle,
  Wrench,
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowRight,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { authStore } from "../stores/auth.store";

/**
 * Dashboard home page with statistics and quick actions
 */
export function DashboardPage() {
  // TODO: Replace with real data from API
  const stats = {
    totalAircraft: 12,
    serviceable: 8,
    maintenance: 3,
    grounded: 1,
    totalFleets: 3,
    pendingWorkOrders: 5,
    dueMaintenance: 7,
  };

  const recentActivities = [
    { id: 1, type: "maintenance", message: "B-7011U 完成定期维护", time: "2小时前" },
    { id: 2, type: "flight", message: "B-7012U 完成飞行记录 #1234", time: "4小时前" },
    { id: 3, type: "warning", message: "B-7013U 达到维保预警阈值", time: "昨天" },
    { id: 4, type: "workorder", message: "工单 #WO-2024-001 已创建", time: "昨天" },
  ];

  const dueMaintenanceItems = [
    { id: 1, aircraft: "B-7011U", component: "电机 #1 (SN-M001)", type: "飞行小时", dueIn: "5小时内", status: "urgent" },
    { id: 2, aircraft: "B-7012U", component: "桨叶组 (SN-P002)", type: "日历日", dueIn: "2天后", status: "warning" },
    { id: 3, aircraft: "B-7013U", component: "电池包 #3 (SN-B003)", type: "电池循环", dueIn: "3天后", status: "warning" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">仪表板</h1>
          <p className="text-muted-foreground">欢迎回来，{authStore.user?.fullName || "用户"}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/work-orders/new">创建工单</Link>
          </Button>
          <Button asChild>
            <Link to="/flight-logs/new">
              <Plane className="w-4 h-4 mr-2" />
              记录飞行
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Aircraft */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>飞机总数</CardDescription>
            <Plane className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAircraft}</div>
            <p className="text-xs text-muted-foreground mt-1">
              分布在 {stats.totalFleets} 个机队
            </p>
          </CardContent>
        </Card>

        {/* Serviceable */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>可用飞机</CardDescription>
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-serviceable">{stats.serviceable}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round((stats.serviceable / stats.totalAircraft) * 100)}% 可用率
            </p>
          </CardContent>
        </Card>

        {/* Maintenance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>维护中</CardDescription>
            <Wrench className="w-4 h-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-maintenance">{stats.maintenance}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.pendingWorkOrders} 个待处理工单
            </p>
          </CardContent>
        </Card>

        {/* Grounded */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>停飞</CardDescription>
            <AlertCircle className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-grounded">{stats.grounded}</div>
            <p className="text-xs text-muted-foreground mt-1">
              需要立即处理
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Due Maintenance - Takes 2 columns */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>维保预警</CardTitle>
                <CardDescription>需要关注即将到期的维保项目</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/maintenance/schedules">查看全部</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {dueMaintenanceItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>暂无维保预警</p>
              </div>
            ) : (
              <div className="space-y-4">
                {dueMaintenanceItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{item.aircraft}</span>
                        <Badge variant={item.status === "urgent" ? "destructive" : "secondary"}>
                          {item.status === "urgent" ? "紧急" : "预警"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.component}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.type}触发 · {item.dueIn}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/work-orders/new?aircraft=${item.aircraft}`}>
                        创建工单
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>最近活动</CardTitle>
            <CardDescription>系统动态和操作记录</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const icon = {
                  maintenance: <Wrench className="w-4 h-4 text-amber-600" />,
                  flight: <Plane className="w-4 h-4 text-blue-600" />,
                  warning: <AlertCircle className="w-4 h-4 text-red-600" />,
                  workorder: <Clock className="w-4 h-4 text-purple-600" />,
                }[activity.type];

                return (
                  <div key={activity.id} className="flex gap-3">
                    <div className="mt-0.5">{icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>快捷操作</CardTitle>
          <CardDescription>常用功能快速入口</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto flex-col gap-2 py-4" asChild>
              <Link to="/flight-logs/new">
                <Plane className="w-5 h-5" />
                <span>记录飞行</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4" asChild>
              <Link to="/work-orders/new">
                <Wrench className="w-5 h-5" />
                <span>创建工单</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4" asChild>
              <Link to="/components/install">
                <Package className="w-5 h-5" />
                <span>装机/拆下</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4" asChild>
              <Link to="/reports">
                <TrendingUp className="w-5 h-5" />
                <span>数据报表</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
