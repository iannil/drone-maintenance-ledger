import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Plane,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  MoreHorizontal,
  Users,
  FileText,
  Wrench,
  TrendingUp,
  TrendingDown,
  Plus,
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
import { Progress } from "../components/ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";

// 飞机状态
const AIRCRAFT_STATUS = {
  AIRBORNE: { label: "飞行中", color: "bg-green-500 text-white" },
  READY: { label: "可用", color: "bg-blue-100 text-blue-700" },
  MAINTENANCE: { label: "维保中", color: "bg-orange-100 text-orange-700" },
  GROUNDED: { label: "停飞", color: "bg-red-100 text-red-700" },
  RETIRED: { label: "退役", color: "bg-slate-100 text-slate-700" },
};

/**
 * 机队详情页面
 */
export function FleetDetailPage() {
  const { id } = useParams<{ id: string }>();

  // Mock 机队数据
  const fleet = {
    id: id || "fleet-001",
    name: "巡检机队A",
    code: "FLT-A",
    description: "负责华北地区电力巡检任务",
    base: "北京基地",
    status: "ACTIVE",
    createdAt: "2024-01-15",
    manager: "李经理",
    managerId: "u-001",
    aircraftCount: 5,
    activeAircraft: 4,
    totalFlightHours: 1250.5,
    totalFlights: 342,
    lastFlightDate: "2026-01-16",
  };

  // 机队中的飞机列表
  const aircraft = [
    {
      id: "ac-001",
      registration: "B-7011U",
      model: "DJI M350 RTK",
      status: "READY",
      flightHours: 325.5,
      flights: 89,
      lastFlight: "2026-01-15",
      location: "北京基地",
    },
    {
      id: "ac-002",
      registration: "B-7012U",
      model: "Autel Evo II",
      status: "AIRBORNE",
      flightHours: 298.3,
      flights: 78,
      lastFlight: "2026-01-16",
      location: "巡检任务中",
    },
    {
      id: "ac-003",
      registration: "B-7013U",
      model: "DJI Mavic 3",
      status: "READY",
      flightHours: 256.8,
      flights: 95,
      lastFlight: "2026-01-14",
      location: "北京基地",
    },
    {
      id: "ac-004",
      registration: "B-7014U",
      model: "DJI M350 RTK",
      status: "MAINTENANCE",
      flightHours: 218.5,
      flights: 56,
      lastFlight: "2026-01-10",
      location: "维修车间",
      dueDate: "2026-01-20",
    },
    {
      id: "ac-005",
      registration: "B-7015U",
      model: "DJI Mavic 3",
      status: "GROUNDED",
      flightHours: 151.4,
      flights: 24,
      lastFlight: "2026-01-08",
      location: "待检区",
      reason: "等待检验",
    },
  ];

  // 维保记录
  const maintenanceRecords = [
    {
      id: "wo-001",
      workOrderNumber: "WO-2026-0116",
      aircraftRegistration: "B-7011U",
      title: "电机定期检查",
      status: "COMPLETED",
      completedAt: "2026-01-14",
      completedBy: "张维修",
    },
    {
      id: "wo-002",
      workOrderNumber: "WO-2026-0118",
      aircraftRegistration: "B-7014U",
      title: "180天日历检查",
      status: "IN_PROGRESS",
      dueDate: "2026-01-20",
      assignedTo: "李维修",
    },
    {
      id: "wo-003",
      workOrderNumber: "WO-2026-0115",
      aircraftRegistration: "B-7012U",
      title: "GPS故障维修",
      status: "PENDING",
      dueDate: "2026-01-18",
      assignedTo: null,
    },
  ];

  // 飞行记录
  const recentFlights = [
    {
      id: "fl-001",
      date: "2026-01-16",
      time: "10:30",
      aircraftRegistration: "B-7012U",
      pilot: "李四",
      missionType: "PATROL",
      takeoffLocation: "北京基地",
      landingLocation: "北京基地",
      duration: 45,
      distance: 12.5,
      status: "COMPLETED",
    },
    {
      id: "fl-002",
      date: "2026-01-15",
      time: "14:20",
      aircraftRegistration: "B-7011U",
      pilot: "张三",
      missionType: "INSPECTION",
      takeoffLocation: "北京基地",
      landingLocation: "北京基地",
      duration: 52,
      distance: 15.8,
      status: "COMPLETED",
    },
    {
      id: "fl-003",
      date: "2026-01-15",
      time: "09:15",
      aircraftRegistration: "B-7013U",
      pilot: "王五",
      missionType: "SURVEY",
      takeoffLocation: "北京基地",
      landingLocation: "测区A",
      duration: 38,
      distance: 8.3,
      status: "COMPLETED",
    },
  ];

  // 机队成员
  const members = [
    { id: "u-001", name: "李经理", role: "MANAGER", email: "li@example.com" },
    { id: "u-002", name: "张三", role: "PILOT", email: "zhang@example.com" },
    { id: "u-003", name: "李四", role: "PILOT", email: "li4@example.com" },
    { id: "u-004", name: "王五", role: "PILOT", email: "wang@example.com" },
    { id: "u-005", name: "张维修", role: "MECHANIC", email: "zhangw@example.com" },
    { id: "u-006", name: "李维修", role: "MECHANIC", email: "liw@example.com" },
  ];

  // 角色标签
  const roleLabels = {
    MANAGER: { label: "经理", color: "bg-purple-100 text-purple-700" },
    PILOT: { label: "飞手", color: "bg-blue-100 text-blue-700" },
    MECHANIC: { label: "维修工", color: "bg-orange-100 text-orange-700" },
    INSPECTOR: { label: "检验员", color: "bg-green-100 text-green-700" },
  };

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
            <p className="text-muted-foreground">{fleet.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            编辑机队
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
            <div className="text-2xl font-bold">{fleet.aircraftCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {fleet.activeAircraft} 架可用
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
            <div className="text-2xl font-bold">{fleet.totalFlightHours}</div>
            <p className="text-xs text-muted-foreground mt-1">小时</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              总飞行次数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fleet.totalFlights}</div>
            <p className="text-xs text-muted-foreground mt-1">架次</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              最后飞行
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{fleet.lastFlightDate}</div>
            <p className="text-xs text-muted-foreground mt-1">2天前</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              驻地
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{fleet.base}</div>
            <p className="text-xs text-muted-foreground mt-1">机队经理: {fleet.manager}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="aircraft" className="space-y-6">
        <TabsList>
          <TabsTrigger value="aircraft">飞机</TabsTrigger>
          <TabsTrigger value="maintenance">维保</TabsTrigger>
          <TabsTrigger value="flights">飞行记录</TabsTrigger>
          <TabsTrigger value="members">成员</TabsTrigger>
        </TabsList>

        {/* Aircraft Tab */}
        <TabsContent value="aircraft" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">机队飞机</h2>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              添加飞机
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {aircraft.map((ac) => (
              <Link key={ac.id} to={`/aircraft/${ac.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{ac.registration}</CardTitle>
                        <CardDescription className="text-xs">{ac.model}</CardDescription>
                      </div>
                      <Badge className={AIRCRAFT_STATUS[ac.status as keyof typeof AIRCRAFT_STATUS].color}>
                        {AIRCRAFT_STATUS[ac.status as keyof typeof AIRCRAFT_STATUS].label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">飞行时长</span>
                        <span className="font-medium">{ac.flightHours} h</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">飞行次数</span>
                        <span className="font-medium">{ac.flights} 次</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">最后飞行</span>
                        <span className="font-medium">{ac.lastFlight}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">当前位置</span>
                        <span className="font-medium">{ac.location}</span>
                      </div>
                      {ac.dueDate && (
                        <div className="flex justify-between text-orange-600">
                          <span>预计完成</span>
                          <span className="font-medium">{ac.dueDate}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
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
            <CardContent className="p-0">
              <div className="divide-y">
                {maintenanceRecords.map((record) => (
                  <Link
                    key={record.id}
                    to={`/work-orders/${record.id}`}
                    className="block hover:bg-muted/50 transition-colors"
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                            record.status === "COMPLETED" ? "bg-green-100" :
                            record.status === "IN_PROGRESS" ? "bg-blue-100" :
                            "bg-slate-100"
                          }`}>
                            {record.status === "COMPLETED" ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            ) : record.status === "IN_PROGRESS" ? (
                              <Wrench className="h-5 w-5 text-blue-600" />
                            ) : (
                              <Clock className="h-5 w-5 text-slate-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-sm text-primary">
                                {record.workOrderNumber}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {record.aircraftRegistration}
                              </Badge>
                              <Badge className={
                                record.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                                record.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-700" :
                                "bg-slate-100 text-slate-700"
                              }>
                                {record.status === "COMPLETED" ? "已完成" :
                                 record.status === "IN_PROGRESS" ? "进行中" : "待处理"}
                              </Badge>
                            </div>
                            <h3 className="font-medium text-sm">{record.title}</h3>
                            <p className="text-xs text-muted-foreground mt-1">
                              {record.status === "COMPLETED" && (
                                <>完成于 {record.completedAt} · {record.completedBy}</>
                              )}
                              {record.status === "IN_PROGRESS" && (
                                <>到期日 {record.dueDate} · 负责人: {record.assignedTo}</>
                              )}
                              {record.status === "PENDING" && (
                                <>到期日 {record.dueDate} · 未分配</>
                              )}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Flights Tab */}
        <TabsContent value="flights" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">最近飞行</h2>
            <Button variant="outline" size="sm" asChild>
              <Link to="/flight-logs/search">查看全部</Link>
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {recentFlights.map((flight) => (
                  <Link
                    key={flight.id}
                    to={`/flight-logs/${flight.id}`}
                    className="block hover:bg-muted/50 transition-colors"
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                            <Plane className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{flight.aircraftRegistration}</span>
                              <Badge variant="outline" className="text-xs">
                                {flight.missionType === "PATROL" ? "巡逻" :
                                 flight.missionType === "INSPECTION" ? "巡检" : "测绘"}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              <span>{flight.date} {flight.time}</span>
                              <span className="mx-2">·</span>
                              <span>{flight.pilot}</span>
                              <span className="mx-2">·</span>
                              <span>{flight.takeoffLocation} → {flight.landingLocation}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <p className="font-medium">{flight.duration} 分钟</p>
                          <p className="text-muted-foreground">{flight.distance} km</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">机队成员</h2>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              添加成员
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member) => (
              <Card key={member.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                      {member.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{member.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{member.email}</p>
                      <Badge className={roleLabels[member.role as keyof typeof roleLabels].color} variant="outline" className="mt-1">
                        {roleLabels[member.role as keyof typeof roleLabels].label}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
