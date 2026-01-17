import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Plane,
  Calendar,
  Clock,
  MapPin,
  User,
  FileText,
  AlertTriangle,
  CheckCircle2,
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
import { Skeleton } from "../components/ui/skeleton";
import {
  flightLogService,
  FlightLog,
  FlightType,
  FLIGHT_TYPE_LABELS,
  FLIGHT_TYPE_COLORS,
} from "../services/flight-log.service";
import { fullAircraftService, Aircraft } from "../services/fleet.service";

/**
 * 飞行日志列表页
 */
export function FlightLogListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [aircraftFilter, setAircraftFilter] = useState<string>("all");
  const [flightLogs, setFlightLogs] = useState<FlightLog[]>([]);
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

      const [logsData, aircraftData] = await Promise.all([
        flightLogService.getRecent(100),
        fullAircraftService.list(),
      ]);

      setFlightLogs(logsData);
      setAircraftList(aircraftData);
    } catch (err) {
      console.error("Failed to load flight logs:", err);
      setError("加载飞行记录失败");
    } finally {
      setLoading(false);
    }
  };

  // Build aircraft lookup map
  const aircraftMap = new Map(aircraftList.map((a) => [a.id, a]));

  // Filter flight logs
  const filteredLogs = flightLogs.filter((log) => {
    const aircraft = aircraftMap.get(log.aircraftId);
    const matchesSearch =
      aircraft?.registrationNumber
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      log.departureLocation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.arrivalLocation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.missionDescription?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === "all" || log.flightType === typeFilter;
    const matchesAircraft =
      aircraftFilter === "all" || log.aircraftId === aircraftFilter;

    return matchesSearch && matchesType && matchesAircraft;
  });

  // Calculate totals
  const totalFlightHours = flightLogs.reduce(
    (sum, log) => sum + (log.flightHours || 0),
    0
  );
  const totalCycles = flightLogs.reduce(
    (sum, log) => sum + (log.takeoffCycles || 0),
    0
  );

  // Format date from timestamp
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("zh-CN");
  };

  // Format time from timestamp
  const formatTime = (timestamp: number | null) => {
    if (!timestamp) return null;
    return new Date(timestamp).toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    });
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

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-3 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-6 w-16" />
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
          <h1 className="text-2xl font-bold text-slate-900">飞行记录</h1>
          <p className="text-muted-foreground">
            记录和查询所有飞行日志与飞行员报告
          </p>
        </div>
        <Button asChild>
          <Link to="/flight-logs/new">
            <Plus className="w-4 h-4 mr-2" />
            新建飞行记录
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              总飞行次数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{flightLogs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              总飞行小时
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{totalFlightHours.toFixed(1)}h</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              总起降循环
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{totalCycles}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              活跃飞机
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-blue-600">
              {aircraftList.filter((a) => a.status === "AVAILABLE").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索飞机、地点或任务描述..."
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
              {Object.entries(FLIGHT_TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <select
              value={aircraftFilter}
              onChange={(e) => setAircraftFilter(e.target.value)}
              className="h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="all">全部飞机</option>
              {aircraftList.map((ac) => (
                <option key={ac.id} value={ac.id}>
                  {ac.registrationNumber}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Flight Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>飞行记录列表</CardTitle>
          <CardDescription>共 {filteredLogs.length} 条记录</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    日期
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    飞机
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    类型
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    起降时间
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    飞行时长
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    航线
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    任务
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => {
                  const aircraft = aircraftMap.get(log.aircraftId);

                  return (
                    <tr key={log.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span>{formatDate(log.flightDate)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {aircraft ? (
                          <Link
                            to={`/aircraft/${log.aircraftId}`}
                            className="text-sm font-medium text-primary hover:underline"
                          >
                            {aircraft.registrationNumber}
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
                            FLIGHT_TYPE_COLORS[log.flightType as FlightType] ||
                            "bg-slate-50 text-slate-700"
                          }
                        >
                          {FLIGHT_TYPE_LABELS[log.flightType as FlightType] ||
                            log.flightType}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          {log.departureTime && (
                            <div className="flex items-center gap-1">
                              <Plane className="h-3 w-3 text-green-500" />
                              <span>{formatTime(log.departureTime)}</span>
                            </div>
                          )}
                          {log.arrivalTime && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Plane className="h-3 w-3 rotate-45" />
                              <span>{formatTime(log.arrivalTime)}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span>{log.flightHours}h</span>
                          <span className="text-muted-foreground">
                            / {log.takeoffCycles}次
                          </span>
                          {log.discrepancies && (
                            <AlertTriangle className="h-3 w-3 text-yellow-500" />
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-sm max-w-[150px]">
                          <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          <span className="truncate">
                            {log.departureLocation}
                            {log.arrivalLocation &&
                              log.arrivalLocation !== log.departureLocation &&
                              ` → ${log.arrivalLocation}`}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-muted-foreground truncate max-w-[150px] block">
                          {log.missionDescription || "-"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/flight-logs/${log.id}`}>
                              <FileText className="h-3 w-3 mr-1" />
                              详情
                            </Link>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredLogs.length === 0 && (
            <div className="text-center py-12">
              <Plane className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">未找到飞行记录</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || typeFilter !== "all" || aircraftFilter !== "all"
                  ? "尝试调整搜索或筛选条件"
                  : "点击上方按钮创建第一条飞行记录"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
