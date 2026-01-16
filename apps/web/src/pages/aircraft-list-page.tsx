import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  Plane,
  Edit2,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
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

/**
 * Aircraft list page with search and filtering
 */
export function AircraftListPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [fleetFilter, setFleetFilter] = useState<string>("all");

  // Mock data - TODO: Replace with API call
  const fleets = [
    { id: "fleet-001", name: "巡检机队A", code: "INSP-A" },
    { id: "fleet-002", name: "物流机队B", code: "LOG-B" },
    { id: "fleet-003", name: "测绘机队C", code: "SURV-C" },
  ];

  const aircraft = [
    {
      id: "ac-001",
      registration: "B-7011U",
      model: "DJI M350 RTK",
      fleetId: "fleet-001",
      fleetName: "巡检机队A",
      status: "SERVICEABLE" as const,
      totalFlightHours: 125.5,
      totalFlightCycles: 89,
      lastFlightDate: "2026-01-15",
      location: "基地停机坪",
    },
    {
      id: "ac-002",
      registration: "B-7012U",
      model: "DJI M350 RTK",
      fleetId: "fleet-001",
      fleetName: "巡检机队A",
      status: "SERVICEABLE" as const,
      totalFlightHours: 98.2,
      totalFlightCycles: 72,
      lastFlightDate: "2026-01-14",
      location: "巡检任务中",
    },
    {
      id: "ac-003",
      registration: "B-7013U",
      model: "DJI M350 RTK",
      fleetId: "fleet-001",
      fleetName: "巡检机队A",
      status: "MAINTENANCE" as const,
      totalFlightHours: 156.8,
      totalFlightCycles: 112,
      lastFlightDate: "2026-01-10",
      location: "维修车间",
    },
    {
      id: "ac-004",
      registration: "B-7021U",
      model: "DJI M300 RTK",
      fleetId: "fleet-002",
      fleetName: "物流机队B",
      status: "SERVICEABLE" as const,
      totalFlightHours: 234.1,
      totalFlightCycles: 178,
      lastFlightDate: "2026-01-15",
      location: "基地停机坪",
    },
    {
      id: "ac-005",
      registration: "B-7022U",
      model: "DJI M300 RTK",
      fleetId: "fleet-002",
      fleetName: "物流机队B",
      status: "SERVICEABLE" as const,
      totalFlightHours: 189.5,
      totalFlightCycles: 145,
      lastFlightDate: "2026-01-13",
      location: "配送途中",
    },
    {
      id: "ac-006",
      registration: "B-7023U",
      model: "DJI M300 RTK",
      fleetId: "fleet-002",
      fleetName: "物流机队B",
      status: "GROUNDED" as const,
      totalFlightHours: 312.7,
      totalFlightCycles: 234,
      lastFlightDate: "2026-01-08",
      location: "停飞区",
    },
    {
      id: "ac-007",
      registration: "B-7031U",
      model: "DJI Mavic 3 Enterprise",
      fleetId: "fleet-003",
      fleetName: "测绘机队C",
      status: "SERVICEABLE" as const,
      totalFlightHours: 45.3,
      totalFlightCycles: 38,
      lastFlightDate: "2026-01-15",
      location: "基地停机坪",
    },
    {
      id: "ac-008",
      registration: "B-7032U",
      model: "DJI Mavic 3 Enterprise",
      fleetId: "fleet-003",
      fleetName: "测绘机队C",
      status: "MAINTENANCE" as const,
      totalFlightHours: 67.8,
      totalFlightCycles: 54,
      lastFlightDate: "2026-01-12",
      location: "维修车间",
    },
  ];

  // Filter aircraft
  const filteredAircraft = aircraft.filter((ac) => {
    const matchesSearch =
      ac.registration.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ac.model.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || ac.status === statusFilter;
    const matchesFleet = fleetFilter === "all" || ac.fleetId === fleetFilter;

    return matchesSearch && matchesStatus && matchesFleet;
  });

  // Status counts
  const statusCounts = aircraft.reduce(
    (acc, ac) => {
      acc[ac.status] = (acc[ac.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">飞机管理</h1>
          <p className="text-muted-foreground">
            管理所有飞机及其状态、飞行记录和维保信息
          </p>
        </div>
        <Button onClick={() => navigate("/aircraft/new")}>
          <Plus className="w-4 h-4 mr-2" />
          新建飞机
        </Button>
      </div>

      {/* Status Filter Bar */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={statusFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("all")}
        >
          全部 ({aircraft.length})
        </Button>
        <Button
          variant={statusFilter === "SERVICEABLE" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("SERVICEABLE")}
          className="data-[variant=default]:bg-serviceable data-[variant=default]:text-serviceable-foreground"
        >
          可用 ({statusCounts.SERVICEABLE || 0})
        </Button>
        <Button
          variant={statusFilter === "MAINTENANCE" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("MAINTENANCE")}
          className="data-[variant=default]:bg-maintenance data-[variant=default]:text-maintenance-foreground"
        >
          维护中 ({statusCounts.MAINTENANCE || 0})
        </Button>
        <Button
          variant={statusFilter === "GROUNDED" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("GROUNDED")}
          className="data-[variant=default]:bg-grounded data-[variant=default]:text-grounded-foreground"
        >
          停飞 ({statusCounts.GROUNDED || 0})
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索注册号或型号..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={fleetFilter}
              onChange={(e) => setFleetFilter(e.target.value)}
              className="h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="all">全部机队</option>
              {fleets.map((fleet) => (
                <option key={fleet.id} value={fleet.id}>
                  {fleet.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Aircraft Table */}
      <Card>
        <CardHeader>
          <CardTitle>飞机列表</CardTitle>
          <CardDescription>
            共 {filteredAircraft.length} 架飞机
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    注册号
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    型号
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    机队
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    状态
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    飞行小时
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    起降循环
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    当前位置
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAircraft.map((ac) => (
                  <tr key={ac.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <Link
                        to={`/aircraft/${ac.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {ac.registration}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-sm">{ac.model}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {ac.fleetName}
                    </td>
                    <td className="py-3 px-4">
                      <AircraftStatusBadge status={ac.status} />
                    </td>
                    <td className="py-3 px-4 text-sm">{ac.totalFlightHours}h</td>
                    <td className="py-3 px-4 text-sm">{ac.totalFlightCycles}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {ac.location}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/aircraft/${ac.id}`}>
                            <MoreHorizontal className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => navigate(`/aircraft/${ac.id}/edit`)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredAircraft.length === 0 && (
            <div className="text-center py-12">
              <Plane className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">未找到飞机</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== "all" || fleetFilter !== "all"
                  ? "尝试调整搜索或筛选条件"
                  : "点击上方按钮创建第一架飞机"}
              </p>
              {!searchQuery && statusFilter === "all" && fleetFilter === "all" && (
                <Button onClick={() => navigate("/aircraft/new")}>
                  <Plus className="w-4 h-4 mr-2" />
                  新建飞机
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
