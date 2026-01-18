import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit2,
  Package,
  Clock,
  Activity,
  FileText,
  Wrench,
  History,
  Calendar,
  Plane,
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
import { AircraftStatusBadge } from "../components/common/status-badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import {
  fullAircraftService,
  fleetService,
  Aircraft,
  AircraftStatus,
  Fleet,
} from "../services/fleet.service";
import {
  componentService,
  Component,
  ComponentType,
  COMPONENT_TYPE_LABELS,
  COMPONENT_STATUS_LABELS,
  STATUS_DISPLAY_MAP,
} from "../services/component.service";
import { flightLogService, FlightLog, FLIGHT_TYPE_LABELS } from "../services/flight-log.service";
import { workOrderService, WorkOrder, WORK_ORDER_TYPE_LABELS } from "../services/work-order.service";
import { userService, User } from "../services/user.service";
import { ComponentStatusBadge } from "../components/common/status-badge";

/**
 * Map backend status to frontend status badge
 */
const STATUS_MAP: Record<AircraftStatus, "SERVICEABLE" | "MAINTENANCE" | "GROUNDED" | "RETIRED"> = {
  AVAILABLE: "SERVICEABLE",
  IN_MAINTENANCE: "MAINTENANCE",
  AOG: "GROUNDED",
  RETIRED: "RETIRED",
};

/**
 * Aircraft detail page with comprehensive information
 */
export function AircraftDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [aircraft, setAircraft] = useState<Aircraft | null>(null);
  const [fleet, setFleet] = useState<Fleet | null>(null);
  const [components, setComponents] = useState<Component[]>([]);
  const [flightLogs, setFlightLogs] = useState<FlightLog[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [pilots, setPilots] = useState<Map<string, User>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load aircraft data
  useEffect(() => {
    async function loadData() {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const aircraftData = await fullAircraftService.getById(id);
        setAircraft(aircraftData);

        // Load fleet info if available
        if (aircraftData.fleetId) {
          try {
            const fleetData = await fleetService.getById(aircraftData.fleetId);
            setFleet(fleetData);
          } catch {
            console.warn("Failed to load fleet info");
          }
        }

        // Load installed components
        try {
          const componentsData = await componentService.list(undefined, undefined, id);
          setComponents(componentsData);
        } catch {
          console.warn("Failed to load components");
        }

        // Load flight logs
        try {
          const flightLogsData = await flightLogService.getByAircraft(id, 10);
          setFlightLogs(flightLogsData);

          // Load pilot info for flight logs
          const pilotIds = new Set(flightLogsData.map((fl) => fl.pilotId));
          const pilotMap = new Map<string, User>();
          for (const pilotId of pilotIds) {
            try {
              const pilot = await userService.getById(pilotId);
              pilotMap.set(pilotId, pilot);
            } catch {
              // Ignore pilot not found
            }
          }
          setPilots(pilotMap);
        } catch {
          console.warn("Failed to load flight logs");
        }

        // Load work orders (maintenance history)
        try {
          const workOrdersData = await workOrderService.getByAircraft(id, 10);
          setWorkOrders(workOrdersData);
        } catch {
          console.warn("Failed to load work orders");
        }
      } catch (err) {
        console.error("Failed to load aircraft:", err);
        setError("无法加载飞机信息");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [id]);

  // Helper functions
  const formatFlightDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

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

  if (error || !aircraft) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/aircraft">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900">飞机详情</h1>
          </div>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <Plane className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">{error || "未找到飞机"}</h3>
            <p className="text-muted-foreground mb-4">
              请检查链接是否正确或返回列表页面
            </p>
            <Button onClick={() => navigate("/aircraft")}>
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
          <Link to="/aircraft">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{aircraft.registrationNumber}</h1>
            <AircraftStatusBadge status={STATUS_MAP[aircraft.status]} />
            {!aircraft.isAirworthy && (
              <Badge variant="destructive">不适航</Badge>
            )}
          </div>
          <p className="text-muted-foreground">{aircraft.model}</p>
        </div>
        <Button variant="outline" onClick={() => navigate(`/aircraft/${id}/edit`)}>
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
                <p className="text-2xl font-bold">{aircraft.totalFlightHours}h</p>
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
                <p className="text-2xl font-bold">{aircraft.totalFlightCycles}</p>
                <p className="text-xs text-muted-foreground">起降循环</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-bold">{formatDate(aircraft.lastInspectionAt)}</p>
                <p className="text-xs text-muted-foreground">上次检查</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-bold">{components.length}</p>
                <p className="text-xs text-muted-foreground">装载零部件</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="components">零部件</TabsTrigger>
          <TabsTrigger value="flights">飞行记录</TabsTrigger>
          <TabsTrigger value="maintenance">维保历史</TabsTrigger>
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
                  <span className="text-muted-foreground">注册号</span>
                  <span className="font-medium">{aircraft.registrationNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">型号</span>
                  <span className="font-medium">{aircraft.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">序列号</span>
                  <span className="font-medium font-mono">{aircraft.serialNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">制造商</span>
                  <span className="font-medium">{aircraft.manufacturer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">所属机队</span>
                  {fleet ? (
                    <Link
                      to={`/fleets/${aircraft.fleetId}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {fleet.name}
                    </Link>
                  ) : (
                    <span className="font-medium">-</span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">适航状态</span>
                  <span className={aircraft.isAirworthy ? "text-green-600" : "text-red-600"}>
                    {aircraft.isAirworthy ? "适航" : "不适航"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Status & Notes */}
            <Card>
              <CardHeader>
                <CardTitle>状态与检查</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">当前状态</p>
                  <AircraftStatusBadge status={STATUS_MAP[aircraft.status]} />
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">上次检查</span>
                  <span className="font-medium">{formatDate(aircraft.lastInspectionAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">下次检查到期</span>
                  <span className="font-medium">{formatDate(aircraft.nextInspectionDue)}</span>
                </div>
                <div className="pt-4 border-t flex gap-2">
                  <Button variant="outline" size="sm">
                    <Wrench className="w-4 h-4 mr-2" />
                    更新状态
                  </Button>
                  <Button variant="outline" size="sm">
                    <FileText className="w-4 h-4 mr-2" />
                    创建工单
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Components Tab */}
        <TabsContent value="components" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>装机零部件</CardTitle>
                  <CardDescription>当前安装在飞机上的所有零部件</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Package className="w-4 h-4 mr-2" />
                  装机/拆下
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {components.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                          序列号
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                          料号
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                          类型
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                          飞行小时
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                          状态
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {components.map((comp) => (
                        <tr key={comp.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">
                            <Link
                              to={`/components/${comp.id}`}
                              className="font-medium text-primary hover:underline font-mono"
                            >
                              {comp.serialNumber}
                            </Link>
                          </td>
                          <td className="py-3 px-4 text-sm font-mono">{comp.partNumber}</td>
                          <td className="py-3 px-4 text-sm">
                            {COMPONENT_TYPE_LABELS[comp.type as ComponentType]}
                          </td>
                          <td className="py-3 px-4 text-sm">{comp.totalFlightHours}h</td>
                          <td className="py-3 px-4">
                            <ComponentStatusBadge
                              status={STATUS_DISPLAY_MAP[comp.status]}
                              label={COMPONENT_STATUS_LABELS[comp.status]}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  暂无装机零部件
                </div>
              )}
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
                  <CardDescription>最近的飞行记录</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/flight-logs?aircraft=${aircraft.id}`}>查看全部</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {flightLogs.map((flight) => (
                  <div
                    key={flight.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {flight.missionDescription || FLIGHT_TYPE_LABELS[flight.flightType]}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(flight.flightDate).toLocaleDateString("zh-CN")} · 飞行员: {pilots.get(flight.pilotId)?.name || "未知"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatFlightDuration(flight.flightDuration)}</p>
                      <p className="text-sm text-muted-foreground">
                        {flight.flightHours.toFixed(2)}h
                      </p>
                    </div>
                  </div>
                ))}

                {flightLogs.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    暂无飞行记录
                  </div>
                )}
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
                  <CardTitle>维保历史</CardTitle>
                  <CardDescription>过去的维保记录（工单）</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/work-orders?aircraft=${aircraft.id}`}>
                    <History className="w-4 h-4 mr-2" />
                    查看全部
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workOrders.map((wo) => (
                  <div key={wo.id} className="flex gap-4 p-4 rounded-lg border">
                    <div className="w-12 h-12 rounded-lg bg-muted flex flex-col items-center justify-center">
                      <span className="text-xs font-medium">
                        {new Date(wo.createdAt).toLocaleDateString("zh-CN", { month: "short" })}
                      </span>
                      <span className="text-lg font-bold">
                        {new Date(wo.createdAt).getDate()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Link
                          to={`/work-orders/${wo.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {wo.title}
                        </Link>
                        <Badge variant="outline" className="text-xs">
                          {WORK_ORDER_TYPE_LABELS[wo.type]}
                        </Badge>
                        <Badge
                          variant={wo.status === "COMPLETED" || wo.status === "RELEASED" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {wo.status === "COMPLETED" || wo.status === "RELEASED" ? "已完成" : "进行中"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{wo.description || wo.orderNumber}</p>
                    </div>
                  </div>
                ))}

                {workOrders.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    暂无维保记录
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
