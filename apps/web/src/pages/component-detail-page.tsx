import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit2,
  Package,
  Clock,
  History,
  Wrench,
  QrCode,
  Activity,
  Loader2,
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
import { Skeleton } from "../components/ui/skeleton";
import { ComponentStatusBadge } from "../components/common/status-badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import {
  componentService,
  Component,
  ComponentType,
  COMPONENT_TYPE_LABELS,
  COMPONENT_STATUS_LABELS,
  STATUS_DISPLAY_MAP,
} from "../services/component.service";

/**
 * Component detail page with comprehensive history tracking
 */
export function ComponentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [component, setComponent] = useState<Component | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load component data
  useEffect(() => {
    async function loadComponent() {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await componentService.getById(id);
        setComponent(data);
      } catch (err) {
        console.error("Failed to load component:", err);
        setError("无法加载零部件信息");
      } finally {
        setIsLoading(false);
      }
    }
    loadComponent();
  }, [id]);

  // Mock installation history - TODO: Add API endpoint for installation history
  const installationHistory = [
    {
      id: "inst-001",
      action: "INSTALL",
      aircraftId: "ac-001",
      aircraftReg: "B-7011U",
      location: "左前",
      date: "2024-03-20",
      flightHoursAtInstall: 0,
      technician: "李四",
      reason: "新机装机",
    },
  ];

  // Mock maintenance history - TODO: Add API endpoint for maintenance history
  const maintenanceHistory = [
    {
      id: "maint-001",
      date: "2026-01-10",
      type: "定期检查",
      description: "100小时检查：轴承润滑，螺丝紧固",
      result: "正常",
      technician: "张三",
    },
  ];

  // Mock flight logs - TODO: Add API endpoint for flight logs
  const recentFlights = [
    {
      id: "flight-001",
      date: "2026-01-15",
      aircraftReg: "B-7011U",
      pilot: "张三",
      duration: "1h 25m",
      flightHours: 1.42,
      purpose: "电力巡检",
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error || !component) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/components">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900">零部件详情</h1>
          </div>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">{error || "未找到零部件"}</h3>
            <p className="text-muted-foreground mb-4">
              请检查链接是否正确或返回列表页面
            </p>
            <Button onClick={() => navigate("/components")}>
              返回列表
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return "-";
    return new Date(timestamp).toLocaleDateString("zh-CN");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/components">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 font-mono">
              {component.serialNumber}
            </h1>
            <ComponentStatusBadge
              status={STATUS_DISPLAY_MAP[component.status]}
              label={COMPONENT_STATUS_LABELS[component.status]}
            />
            {!component.isAirworthy && (
              <Badge variant="destructive">不适航</Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            {component.manufacturer} {component.model || ""}
          </p>
        </div>
        <Button variant="outline" size="icon" title="查看二维码">
          <QrCode className="w-4 h-4" />
        </Button>
        <Button variant="outline" onClick={() => navigate(`/components/${id}/edit`)}>
          <Edit2 className="w-4 h-4 mr-2" />
          编辑
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{component.totalFlightHours}h</p>
                <p className="text-xs text-muted-foreground">总飞行小时</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{component.totalFlightCycles}</p>
                <p className="text-xs text-muted-foreground">起降循环</p>
              </div>
            </div>
          </CardContent>
        </Card>
        {component.type === "BATTERY" && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{component.batteryCycles}</p>
                  <p className="text-xs text-muted-foreground">电池循环</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <History className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-bold">{installationHistory.length}</p>
                <p className="text-xs text-muted-foreground">装机次数</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="history">履历历史</TabsTrigger>
          <TabsTrigger value="maintenance">维保记录</TabsTrigger>
          <TabsTrigger value="flights">飞行记录</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>基本信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">序列号</span>
                  <span className="font-medium font-mono">{component.serialNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">料号</span>
                  <span className="font-medium font-mono">{component.partNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">类型</span>
                  <span className="font-medium">
                    {COMPONENT_TYPE_LABELS[component.type as ComponentType]}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">制造商</span>
                  <span className="font-medium">{component.manufacturer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">型号</span>
                  <span className="font-medium">{component.model || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">生产日期</span>
                  <span className="font-medium">{formatDate(component.manufacturedAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">采购日期</span>
                  <span className="font-medium">{formatDate(component.purchasedAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">当前状态</span>
                  <ComponentStatusBadge
                    status={STATUS_DISPLAY_MAP[component.status]}
                    label={COMPONENT_STATUS_LABELS[component.status]}
                  />
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">适航状态</span>
                  <span className={component.isAirworthy ? "text-green-600" : "text-red-600"}>
                    {component.isAirworthy ? "适航" : "不适航"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Life Limited Parts Info */}
            <Card>
              <CardHeader>
                <CardTitle>寿命限制信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">是否寿命件</span>
                  <span className="font-medium">
                    {component.isLifeLimited ? "是" : "否"}
                  </span>
                </div>
                {component.isLifeLimited && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">最大飞行小时</span>
                      <span className="font-medium">
                        {component.maxFlightHours ? `${component.maxFlightHours}h` : "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">剩余小时</span>
                      <span className="font-medium">
                        {component.maxFlightHours
                          ? `${Math.max(0, component.maxFlightHours - component.totalFlightHours)}h`
                          : "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">最大循环次数</span>
                      <span className="font-medium">
                        {component.maxCycles || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">剩余循环</span>
                      <span className="font-medium">
                        {component.maxCycles
                          ? Math.max(0, component.maxCycles - component.totalFlightCycles)
                          : "-"}
                      </span>
                    </div>
                  </>
                )}
                <div className="pt-4 border-t flex gap-2">
                  <Button variant="outline" size="sm">
                    <Package className="w-4 h-4 mr-2" />
                    装机/拆下
                  </Button>
                  <Button variant="outline" size="sm">
                    <Wrench className="w-4 h-4 mr-2" />
                    创建维保
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          {component.description && (
            <Card>
              <CardHeader>
                <CardTitle>描述</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{component.description}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* History Tab (履历解耦核心) */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>装机/拆下履历</CardTitle>
              <CardDescription>
                零部件履历跟随零部件，记录完整的装机历史
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Timeline */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

                <div className="space-y-6">
                  {installationHistory.map((record, index) => (
                    <div key={record.id} className="relative pl-10">
                      {/* Timeline dot */}
                      <div
                        className={`absolute left-2.5 w-3 h-3 rounded-full border-2 ${
                          record.action === "INSTALL"
                            ? "bg-component-installed border-component-installed"
                            : "bg-component-removed border-component-removed"
                        }`}
                      />

                      <Card className={index === 0 ? "border-primary" : ""}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant={record.action === "INSTALL" ? "default" : "secondary"}
                                  className={
                                    record.action === "INSTALL"
                                      ? "bg-component-installed text-component-installed"
                                      : "bg-component-removed text-component-removed"
                                  }
                                >
                                  {record.action === "INSTALL" ? "装机" : "拆下"}
                                </Badge>
                                <span className="font-medium">{record.date}</span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {record.reason}
                              </p>
                            </div>
                            {index === 0 && (
                              <Badge variant="outline" className="text-xs">
                                当前
                              </Badge>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-sm mt-3 pt-3 border-t">
                            <div>
                              <span className="text-muted-foreground">飞机: </span>
                              <Link
                                to={`/aircraft/${record.aircraftId}`}
                                className="font-medium text-primary hover:underline"
                              >
                                {record.aircraftReg}
                              </Link>
                            </div>
                            <div>
                              <span className="text-muted-foreground">位置: </span>
                              <span className="font-medium">{record.location}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">技术员: </span>
                              <span className="font-medium">{record.technician}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                {record.action === "INSTALL" ? "装机时" : "拆下时"}小时:{" "}
                              </span>
                              <span className="font-medium">{record.flightHoursAtInstall}h</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}

                  {installationHistory.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      暂无装机记录
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maintenance Tab */}
        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>维保记录</CardTitle>
                  <CardDescription>该零部件的所有维护保养记录</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Wrench className="w-4 h-4 mr-2" />
                  记录维保
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {maintenanceHistory.map((record) => (
                  <div key={record.id} className="flex gap-4 p-4 rounded-lg border">
                    <div className="w-12 h-12 rounded-lg bg-muted flex flex-col items-center justify-center">
                      <span className="text-xs font-medium">
                        {new Date(record.date).toLocaleDateString("zh-CN", { month: "short" })}
                      </span>
                      <span className="text-lg font-bold">
                        {new Date(record.date).getDate()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{record.type}</p>
                        <Badge
                          variant={record.result === "正常" ? "default" : "destructive"}
                          className="text-xs bg-serviceable text-serviceable"
                        >
                          {record.result}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{record.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        技术员: {record.technician}
                      </p>
                    </div>
                  </div>
                ))}

                {maintenanceHistory.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    暂无维保记录
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Flights Tab */}
        <TabsContent value="flights" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>飞行记录</CardTitle>
                  <CardDescription>
                    该零部件参与的所有飞行记录
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentFlights.map((flight) => (
                  <div
                    key={flight.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{flight.purpose}</p>
                        <p className="text-sm text-muted-foreground">
                          {flight.date} · {flight.aircraftReg} · 飞行员: {flight.pilot}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{flight.duration}</p>
                      <p className="text-sm text-muted-foreground">
                        {flight.flightHours}h
                      </p>
                    </div>
                  </div>
                ))}

                {recentFlights.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    暂无飞行记录
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
