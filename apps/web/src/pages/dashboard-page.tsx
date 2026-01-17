import { useEffect, useState } from "react";
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
  AlertTriangle,
  Boxes,
} from "lucide-react";
import { Link } from "react-router-dom";
import { authStore } from "../stores/auth.store";
import { statsService, DashboardStats, RecentActivity, DueMaintenanceItem } from "../services/stats.service";
import { maintenanceSchedulerService, MaintenanceAlert } from "../services/maintenance-scheduler.service";
import { inventoryService, InventoryAlerts } from "../services/inventory.service";

/**
 * Format relative time from ISO date string
 */
function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays === 1) return "昨天";
  if (diffDays < 7) return `${diffDays}天前`;
  return date.toLocaleDateString("zh-CN");
}

/**
 * Dashboard home page with statistics and quick actions
 */
export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [dueMaintenanceItems, setDueMaintenanceItems] = useState<DueMaintenanceItem[]>([]);
  const [maintenanceAlerts, setMaintenanceAlerts] = useState<MaintenanceAlert[]>([]);
  const [inventoryAlerts, setInventoryAlerts] = useState<InventoryAlerts | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      setIsLoading(true);
      try {
        const [statsData, activitiesData, maintenanceData, schedulerAlerts, invAlerts] = await Promise.all([
          statsService.getDashboardStats(),
          statsService.getRecentActivities(10),
          statsService.getDueMaintenanceItems(5),
          maintenanceSchedulerService.getAlerts({ limit: 5 }).catch(() => []),
          inventoryService.getAlerts().catch(() => ({ lowStock: [], expiring: [] })),
        ]);
        setStats(statsData);
        setActivities(activitiesData);
        setDueMaintenanceItems(maintenanceData);
        setMaintenanceAlerts(schedulerAlerts);
        setInventoryAlerts(invAlerts);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  // Calculate derived stats
  const totalAircraft = stats?.totalAircraft || 0;
  const serviceable = stats?.aircraftByStatus.serviceable || 0;
  const maintenance = stats?.aircraftByStatus.maintenance || 0;
  const grounded = stats?.aircraftByStatus.grounded || 0;
  const pendingWorkOrders = (stats?.workOrders.pending || 0) + (stats?.workOrders.inProgress || 0);
  const availabilityRate = totalAircraft > 0 ? Math.round((serviceable / totalAircraft) * 100) : 0;

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
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{totalAircraft}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  分布在 {stats?.totalFleets || 0} 个机队
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Serviceable */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>可用飞机</CardDescription>
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600">{serviceable}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {availabilityRate}% 可用率
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Maintenance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>维护中</CardDescription>
            <Wrench className="w-4 h-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-amber-600">{maintenance}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {pendingWorkOrders} 个待处理工单
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Grounded */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>停飞</CardDescription>
            <AlertCircle className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-red-600">{grounded}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {grounded > 0 ? "需要立即处理" : "全部正常"}
                </p>
              </>
            )}
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
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : dueMaintenanceItems.length === 0 ? (
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
                      <Link to={`/work-orders/new?aircraft=${item.aircraftId}`}>
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
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>暂无活动记录</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => {
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
                        <p className="text-xs text-muted-foreground">
                          {formatRelativeTime(activity.time)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Inventory Alerts Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>库存预警</CardTitle>
              <CardDescription>需要关注的库存问题</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/inventory/alerts">查看全部</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex gap-4">
              <Skeleton className="h-20 flex-1" />
              <Skeleton className="h-20 flex-1" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Low Stock */}
              <div className="p-4 rounded-lg border bg-orange-50/50 border-orange-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">库存不足</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {inventoryAlerts?.lowStock.length || 0}
                    </p>
                  </div>
                  {(inventoryAlerts?.lowStock.length || 0) > 0 && (
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/inventory/alerts">处理</Link>
                    </Button>
                  )}
                </div>
                {inventoryAlerts && inventoryAlerts.lowStock.length > 0 && (
                  <div className="mt-3 text-xs text-muted-foreground">
                    {inventoryAlerts.lowStock.slice(0, 3).map((item, i) => (
                      <span key={item.id}>
                        {item.name}
                        {i < Math.min(inventoryAlerts.lowStock.length, 3) - 1 ? "、" : ""}
                      </span>
                    ))}
                    {inventoryAlerts.lowStock.length > 3 && ` 等${inventoryAlerts.lowStock.length}项`}
                  </div>
                )}
              </div>

              {/* Expiring */}
              <div className="p-4 rounded-lg border bg-yellow-50/50 border-yellow-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Boxes className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">即将过期</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {inventoryAlerts?.expiring.length || 0}
                    </p>
                  </div>
                  {(inventoryAlerts?.expiring.length || 0) > 0 && (
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/inventory/alerts">查看</Link>
                    </Button>
                  )}
                </div>
                {inventoryAlerts && inventoryAlerts.expiring.length > 0 && (
                  <div className="mt-3 text-xs text-muted-foreground">
                    {inventoryAlerts.expiring.slice(0, 3).map((item, i) => (
                      <span key={item.id}>
                        {item.name}
                        {i < Math.min(inventoryAlerts.expiring.length, 3) - 1 ? "、" : ""}
                      </span>
                    ))}
                    {inventoryAlerts.expiring.length > 3 && ` 等${inventoryAlerts.expiring.length}项`}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
              <Link to="/components">
                <Package className="w-5 h-5" />
                <span>零部件管理</span>
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
