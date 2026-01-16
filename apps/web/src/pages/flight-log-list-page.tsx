import { useState } from "react";
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
  Filter,
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

// 飞行类型
const FLIGHT_TYPES = {
  INSPECTION: { label: "巡检", color: "bg-blue-50 text-blue-700 border-blue-200" },
  DELIVERY: { label: "配送", color: "bg-green-50 text-green-700 border-green-200" },
  SURVEY: { label: "测绘", color: "bg-purple-50 text-purple-700 border-purple-200" },
  TRAINING: { label: "训练", color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  TEST: { label: "测试", color: "bg-slate-50 text-slate-700 border-slate-200" },
  EMERGENCY: { label: "应急", color: "bg-red-50 text-red-700 border-red-200" },
};

// 飞行状态
const FLIGHT_STATUS = {
  COMPLETED: { label: "已完成", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  IN_PROGRESS: { label: "进行中", color: "bg-blue-100 text-blue-700", icon: Plane },
  ABORTED: { label: "中止", color: "bg-yellow-100 text-yellow-700", icon: AlertTriangle },
  INCIDENT: { label: "事故", color: "bg-red-100 text-red-700", icon: AlertTriangle },
};

/**
 * 飞行日志列表页
 */
export function FlightLogListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [aircraftFilter, setAircraftFilter] = useState<string>("all");

  // Mock aircraft data
  const aircraft = [
    { id: "ac-001", registration: "B-7011U", model: "DJI M350 RTK" },
    { id: "ac-002", registration: "B-7012U", model: "DJI M350 RTK" },
    { id: "ac-003", registration: "B-7013U", model: "DJI M300 RTK" },
  ];

  // Mock flight logs
  const flightLogs = [
    {
      id: "fl-001",
      flightNumber: "FL-20260116-001",
      date: "2026-01-16",
      takeoffTime: "08:30",
      landingTime: "10:15",
      aircraftId: "ac-001",
      aircraftRegistration: "B-7011U",
      pilot: "张三",
      copilot: "李四",
      flightType: "INSPECTION",
      status: "COMPLETED",
      flightHours: 1.75,
      flightCycles: 1,
      takeoffLocation: "基地",
      landingLocation: "基地",
      route: "基地 -> 巡检区域A -> 巡检区域B -> 基地",
      maxAltitude: 120,
      distance: 15.2,
      payload: ["相机", "红外"],
      remarks: "正常完成巡检任务",
      hasIncident: false,
      pirepSubmitted: true,
    },
    {
      id: "fl-002",
      flightNumber: "FL-20260116-002",
      date: "2026-01-16",
      takeoffTime: "10:45",
      landingTime: "12:30",
      aircraftId: "ac-002",
      aircraftRegistration: "B-7012U",
      pilot: "王五",
      copilot: null,
      flightType: "DELIVERY",
      status: "COMPLETED",
      flightHours: 1.75,
      flightCycles: 1,
      takeoffLocation: "配送中心A",
      landingLocation: "配送中心B",
      route: "配送中心A -> 客户1 -> 客户2 -> 配送中心B",
      maxAltitude: 80,
      distance: 8.5,
      payload: ["货箱"],
      remarks: "配送任务顺利完成",
      hasIncident: false,
      pirepSubmitted: true,
    },
    {
      id: "fl-003",
      flightNumber: "FL-20260116-003",
      date: "2026-01-16",
      takeoffTime: "14:00",
      landingTime: null,
      aircraftId: "ac-001",
      aircraftRegistration: "B-7011U",
      pilot: "赵六",
      copilot: "钱七",
      flightType: "SURVEY",
      status: "IN_PROGRESS",
      flightHours: 0,
      flightCycles: 0,
      takeoffLocation: "基地",
      landingLocation: null,
      route: "基地 -> 测绘区域",
      maxAltitude: null,
      distance: 0,
      payload: ["激光雷达"],
      remarks: "测绘任务进行中",
      hasIncident: false,
      pirepSubmitted: false,
    },
    {
      id: "fl-004",
      flightNumber: "FL-20260115-004",
      date: "2026-01-15",
      takeoffTime: "16:00",
      landingTime: "16:45",
      aircraftId: "ac-003",
      aircraftRegistration: "B-7013U",
      pilot: "孙八",
      copilot: null,
      flightType: "TEST",
      status: "ABORTED",
      flightHours: 0.25,
      flightCycles: 0,
      takeoffLocation: "测试场",
      landingLocation: "测试场",
      route: "测试场",
      maxAltitude: 30,
      distance: 0.5,
      payload: [],
      remarks: "GPS信号异常，中止测试",
      hasIncident: false,
      pirepSubmitted: true,
    },
    {
      id: "fl-005",
      flightNumber: "FL-20260115-005",
      date: "2026-01-15",
      takeoffTime: "09:00",
      landingTime: "11:30",
      aircraftId: "ac-002",
      aircraftRegistration: "B-7012U",
      pilot: "周九",
      copilot: "吴十",
      flightType: "INSPECTION",
      status: "COMPLETED",
      flightHours: 2.5,
      flightCycles: 1,
      takeoffLocation: "基地",
      landingLocation: "基地",
      route: "基地 -> 电力线路巡检 -> 基地",
      maxAltitude: 100,
      distance: 22.0,
      payload: ["相机", "红外"],
      remarks: "发现1处绝缘子破损，已记录",
      hasIncident: false,
      pirepSubmitted: true,
    },
    {
      id: "fl-006",
      flightNumber: "FL-20260114-006",
      date: "2026-01-14",
      takeoffTime: "15:00",
      landingTime: "16:20",
      aircraftId: "ac-001",
      aircraftRegistration: "B-7011U",
      pilot: "郑十一",
      copilot: null,
      flightType: "EMERGENCY",
      status: "COMPLETED",
      flightHours: 1.33,
      flightCycles: 1,
      takeoffLocation: "基地",
      landingLocation: "搜索区域",
      route: "基地 -> 搜索区域",
      maxAltitude: 150,
      distance: 18.5,
      payload: ["热成像"],
      remarks: "应急搜索任务",
      hasIncident: true,
      pirepSubmitted: true,
    },
  ];

  // Filter flight logs
  const filteredLogs = flightLogs.filter((log) => {
    const matchesSearch =
      log.flightNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.aircraftRegistration.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.pilot.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.route?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || log.status === statusFilter;
    const matchesType = typeFilter === "all" || log.flightType === typeFilter;
    const matchesAircraft = aircraftFilter === "all" || log.aircraftId === aircraftFilter;

    return matchesSearch && matchesStatus && matchesType && matchesAircraft;
  });

  // Status counts
  const statusCounts = flightLogs.reduce(
    (acc, log) => {
      acc[log.status] = (acc[log.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Calculate totals
  const totalFlightHours = flightLogs.reduce((sum, log) => sum + log.flightHours, 0);
  const totalDistance = flightLogs.reduce((sum, log) => sum + log.distance, 0);
  const incidentCount = flightLogs.filter((log) => log.hasIncident).length;

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
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          新建飞行记录
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
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
              总里程
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{totalDistance.toFixed(1)}km</div>
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
              中止
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-yellow-600">
              {statusCounts.ABORTED || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              事故/事件
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-red-600">{incidentCount}</div>
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
          全部 ({flightLogs.length})
        </Button>
        {Object.entries(FLIGHT_STATUS).map(([key, { label, color }]) => (
          <Button
            key={key}
            variant={statusFilter === key ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(key)}
            className={statusFilter === key ? color : ""}
          >
            {label} ({statusCounts[key] || 0})
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
                placeholder="搜索飞行号、飞机、飞行员或航线..."
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
              {Object.entries(FLIGHT_TYPES).map(([key, { label }]) => (
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
              {aircraft.map((ac) => (
                <option key={ac.id} value={ac.id}>
                  {ac.registration}
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
          <CardDescription>
            共 {filteredLogs.length} 条记录
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    飞行号
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    日期
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    飞机
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    飞行员
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    类型
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    起降时间
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    飞行小时
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    航线
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    状态
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => {
                  const StatusIcon = FLIGHT_STATUS[log.status].icon;

                  return (
                    <tr key={log.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <Link
                          to={`/flight-logs/${log.id}`}
                          className="font-mono text-sm font-medium text-primary hover:underline"
                        >
                          {log.flightNumber}
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span>{log.date}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          to={`/aircraft/${log.aircraftId}`}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          {log.aircraftRegistration}
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-sm">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span>{log.pilot}</span>
                          {log.copilot && <span className="text-muted-foreground">/ {log.copilot}</span>}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={FLIGHT_TYPES[log.flightType].color}>
                          {FLIGHT_TYPES[log.flightType].label}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <Plane className="h-3 w-3 text-green-500" />
                            <span>{log.takeoffTime}</span>
                          </div>
                          {log.landingTime && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Plane className="h-3 w-3 rotate-45" />
                              <span>{log.landingTime}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span>{log.flightHours}h</span>
                          {log.hasIncident && (
                            <AlertTriangle className="h-3 w-3 text-red-500" />
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-sm max-w-[150px]">
                          <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          <span className="truncate">{log.route}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={FLIGHT_STATUS[log.status].color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {FLIGHT_STATUS[log.status].label}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          {!log.pirepSubmitted && (
                            <Button variant="ghost" size="sm" className="h-7 text-xs">
                              <FileText className="h-3 w-3 mr-1" />
                              PIREP
                            </Button>
                          )}
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
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
                {searchQuery || statusFilter !== "all" || typeFilter !== "all" || aircraftFilter !== "all"
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
