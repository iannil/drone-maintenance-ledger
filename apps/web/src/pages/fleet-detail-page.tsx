import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Plane,
  Clock,
  CheckCircle2,
  MoreHorizontal,
  Wrench,
  Plus,
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { fleetService, fullAircraftService, Fleet, Aircraft, AircraftStatus } from "../services/fleet.service";

/**
 * Aircraft status display configuration
 */
const AIRCRAFT_STATUS: Record<AircraftStatus, { label: string; color: string }> = {
  AVAILABLE: { label: "可用", color: "bg-green-100 text-green-700" },
  IN_MAINTENANCE: { label: "维保中", color: "bg-amber-100 text-amber-700" },
  AOG: { label: "停飞", color: "bg-red-100 text-red-700" },
  RETIRED: { label: "退役", color: "bg-slate-100 text-slate-700" },
};

/**
 * Format date from timestamp
 */
function formatDate(timestamp: number | null): string {
  if (!timestamp) return "-";
  return new Date(timestamp).toLocaleDateString("zh-CN");
}

/**
 * Fleet detail page
 */
export function FleetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [fleet, setFleet] = useState<Fleet | null>(null);
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("aircraft");

  useEffect(() => {
    if (!id) return;

    async function loadFleetData() {
      setIsLoading(true);
      try {
        const [fleetData, aircraftList] = await Promise.all([
          fleetService.getById(id!),
          fullAircraftService.list(100, 0, id!),
        ]);
        setFleet(fleetData);
        setAircraft(aircraftList);
      } catch (error) {
        console.error("Failed to load fleet data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadFleetData();
  }, [id]);

  // Calculate fleet stats
  const stats = {
    total: aircraft.length,
    available: aircraft.filter(a => a.status === "AVAILABLE").length,
    inMaintenance: aircraft.filter(a => a.status === "IN_MAINTENANCE").length,
    aog: aircraft.filter(a => a.status === "AOG").length,
    totalFlightHours: aircraft.reduce((sum, a) => sum + a.totalFlightHours, 0),
    totalCycles: aircraft.reduce((sum, a) => sum + a.totalFlightCycles, 0),
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center gap-4">
          <Skeleton className="w-10 h-10 rounded" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        {/* Stats skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-16" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Tab content skeleton */}
        <Card>
          <CardContent className="py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!fleet) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/fleets">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">机队不存在</h1>
            <p className="text-muted-foreground">无法找到指定的机队</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/fleets">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">{fleet.name}</h1>
              <Badge variant="outline">{fleet.code}</Badge>
              <Badge className="bg-green-100 text-green-700">活跃</Badge>
            </div>
            <p className="text-muted-foreground">
              {fleet.description || fleet.organization}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link to={`/fleets/${id}/edit`}>
              <Edit className="w-4 h-4 mr-2" />
              编辑机队
            </Link>
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              飞机数量
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.available} 架可用
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              总飞行时长
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFlightHours}</div>
            <p className="text-xs text-muted-foreground mt-1">小时</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              总起降次数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCycles}</div>
            <p className="text-xs text-muted-foreground mt-1">架次</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              维护中
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.inMaintenance}</div>
            <p className="text-xs text-muted-foreground mt-1">架</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              所属单位
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">{fleet.organization}</div>
            <p className="text-xs text-muted-foreground mt-1">
              创建于 {formatDate(fleet.createdAt)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="aircraft">飞机</TabsTrigger>
          <TabsTrigger value="maintenance">维保</TabsTrigger>
          <TabsTrigger value="flights">飞行记录</TabsTrigger>
        </TabsList>

        {/* Aircraft Tab */}
        <TabsContent value="aircraft" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">机队飞机</h2>
            <Button variant="outline" size="sm" asChild>
              <Link to={`/aircraft/new?fleetId=${id}`}>
                <Plus className="w-4 h-4 mr-2" />
                添加飞机
              </Link>
            </Button>
          </div>
          {aircraft.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Plane className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">暂无飞机</h3>
                <p className="text-muted-foreground mb-4">
                  此机队还没有添加任何飞机
                </p>
                <Button asChild>
                  <Link to={`/aircraft/new?fleetId=${id}`}>
                    <Plus className="w-4 h-4 mr-2" />
                    添加第一架飞机
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {aircraft.map((ac) => (
                <Link key={ac.id} to={`/aircraft/${ac.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{ac.registrationNumber}</CardTitle>
                          <CardDescription className="text-xs">{ac.model}</CardDescription>
                        </div>
                        <Badge className={AIRCRAFT_STATUS[ac.status].color}>
                          {AIRCRAFT_STATUS[ac.status].label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">制造商</span>
                          <span className="font-medium">{ac.manufacturer}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">飞行时长</span>
                          <span className="font-medium">{ac.totalFlightHours} h</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">起降次数</span>
                          <span className="font-medium">{ac.totalFlightCycles} 次</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">适航状态</span>
                          <span className={`font-medium ${ac.isAirworthy ? "text-green-600" : "text-red-600"}`}>
                            {ac.isAirworthy ? "适航" : "不适航"}
                          </span>
                        </div>
                        {ac.nextInspectionDue && (
                          <div className="flex justify-between text-amber-600">
                            <span>下次检查</span>
                            <span className="font-medium">{formatDate(ac.nextInspectionDue)}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Maintenance Tab */}
        <TabsContent value="maintenance" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">维保记录</h2>
            <Button variant="outline" size="sm" asChild>
              <Link to="/work-orders/new">
                <Plus className="w-4 h-4 mr-2" />
                新建工单
              </Link>
            </Button>
          </div>
          <Card>
            <CardContent className="py-12 text-center">
              <Wrench className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">暂无维保记录</h3>
              <p className="text-muted-foreground">
                工单 API 对接后将显示此机队的维保记录
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Flights Tab */}
        <TabsContent value="flights" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">最近飞行</h2>
            <Button variant="outline" size="sm" asChild>
              <Link to="/flight-logs">查看全部</Link>
            </Button>
          </div>
          <Card>
            <CardContent className="py-12 text-center">
              <Plane className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">暂无飞行记录</h3>
              <p className="text-muted-foreground">
                飞行记录 API 对接后将显示此机队的飞行记录
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
