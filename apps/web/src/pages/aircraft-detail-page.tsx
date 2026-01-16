import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Edit2,
  Wings,
  Clock,
  Activity,
  FileText,
  Wrench,
  Package,
  History,
  MoreHorizontal,
  User,
  Calendar,
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
import { AircraftStatusBadge } from "../components/common/status-badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";

/**
 * Aircraft detail page with comprehensive information
 */
export function AircraftDetailPage() {
  const { id } = useParams<{ id: string }>();

  // Mock data - TODO: Replace with API call
  const aircraft = {
    id: "ac-001",
    registration: "B-7011U",
    model: "DJI M350 RTK",
    serialNumber: "SN-M350-2024-001",
    manufacturer: "DJI",
    productionDate: "2024-03-15",
    fleetId: "fleet-001",
    fleetName: "巡检机队A",
    status: "SERVICEABLE" as const,
    totalFlightHours: 125.5,
    totalFlightCycles: 89,
    lastFlightDate: "2026-01-15",
    lastFlightPilot: "张三",
    location: "基地停机坪",
    notes: "主要执行电力巡检任务，状态良好",
  };

  // Mock components data
  const components = [
    {
      id: "comp-001",
      name: "电机 #1",
      serialNumber: "SN-M001",
      type: "MOTOR",
      status: "INSTALLED" as const,
      location: "左前",
      installDate: "2024-03-20",
      totalFlightHours: 125.5,
      dueMaintenance: "50h 后",
    },
    {
      id: "comp-002",
      name: "电机 #2",
      serialNumber: "SN-M002",
      type: "MOTOR",
      status: "INSTALLED" as const,
      location: "右前",
      installDate: "2024-03-20",
      totalFlightHours: 125.5,
      dueMaintenance: "50h 后",
    },
    {
      id: "comp-003",
      name: "电机 #3",
      serialNumber: "SN-M003",
      type: "MOTOR",
      status: "INSTALLED" as const,
      location: "左后",
      installDate: "2024-05-10",
      totalFlightHours: 85.2,
      dueMaintenance: "正常",
    },
    {
      id: "comp-004",
      name: "电机 #4",
      serialNumber: "SN-M004",
      type: "MOTOR",
      status: "INSTALLED" as const,
      location: "右后",
      installDate: "2024-05-10",
      totalFlightHours: 85.2,
      dueMaintenance: "正常",
    },
    {
      id: "comp-005",
      name: "主控模块",
      serialNumber: "SN-FC-001",
      type: "FLIGHT_CONTROLLER",
      status: "INSTALLED" as const,
      location: "机身内部",
      installDate: "2024-03-15",
      totalFlightHours: 125.5,
      dueMaintenance: "正常",
    },
    {
      id: "comp-006",
      name: "电池包 #1",
      serialNumber: "SN-B001",
      type: "BATTERY",
      status: "INSTALLED" as const,
      location: "电池仓1",
      installDate: "2025-12-01",
      totalFlightHours: 45.0,
      batteryCycles: 28,
      dueMaintenance: "需更换",
    },
  ];

  // Mock maintenance history
  const maintenanceHistory = [
    {
      id: "maint-001",
      date: "2026-01-10",
      type: "定期检查",
      description: "100小时定期检查",
      technician: "李四",
      status: "completed",
    },
    {
      id: "maint-002",
      date: "2025-12-15",
      type: "部件更换",
      description: "更换桨叶组 (SN-P002)",
      technician: "王五",
      status: "completed",
    },
    {
      id: "maint-003",
      date: "2025-11-01",
      type: "定期检查",
      description: "50小时定期检查",
      technician: "李四",
      status: "completed",
    },
  ];

  // Mock flight logs
  const recentFlights = [
    {
      id: "flight-001",
      date: "2026-01-15",
      pilot: "张三",
      duration: "1h 25m",
      flightHours: 1.42,
      takeoffLocation: "基地",
      landingLocation: "基地",
      purpose: "电力巡检",
    },
    {
      id: "flight-002",
      date: "2026-01-14",
      pilot: "李四",
      duration: "2h 10m",
      flightHours: 2.17,
      takeoffLocation: "基地",
      landingLocation: "基地",
      purpose: "线路巡视",
    },
    {
      id: "flight-003",
      date: "2026-01-13",
      pilot: "张三",
      duration: "0h 45m",
      flightHours: 0.75,
      takeoffLocation: "巡检点A",
      landingLocation: "基地",
      purpose: "设备测试",
    },
  ];

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
            <h1 className="text-2xl font-bold text-slate-900">{aircraft.registration}</h1>
            <AircraftStatusBadge status={aircraft.status} />
          </div>
          <p className="text-muted-foreground">{aircraft.model}</p>
        </div>
        <Button variant="outline">
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
                <p className="text-sm font-bold">{aircraft.lastFlightDate}</p>
                <p className="text-xs text-muted-foreground">最后飞行</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Wings className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-bold">{components.length}</p>
                <p className="text-xs text-muted-foreground">装载数量</p>
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
                  <span className="font-medium">{aircraft.registration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">型号</span>
                  <span className="font-medium">{aircraft.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">序列号</span>
                  <span className="font-medium">{aircraft.serialNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">制造商</span>
                  <span className="font-medium">{aircraft.manufacturer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">生产日期</span>
                  <span className="font-medium">{aircraft.productionDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">所属机队</span>
                  <Link
                    to={`/fleets/${aircraft.fleetId}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {aircraft.fleetName}
                  </Link>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">当前位置</span>
                  <span className="font-medium">{aircraft.location}</span>
                </div>
              </CardContent>
            </Card>

            {/* Status & Notes */}
            <Card>
              <CardHeader>
                <CardTitle>状态与备注</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">当前状态</p>
                  <AircraftStatusBadge status={aircraft.status} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">备注</p>
                  <p className="text-sm">{aircraft.notes}</p>
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

          {/* Maintenance Alert */}
          {components.some((c) => c.dueMaintenance === "需更换" || c.dueMaintenance.includes("后")) && (
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="text-amber-800">维保提醒</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {components
                    .filter((c) => c.dueMaintenance === "需更换" || c.dueMaintenance.includes("后"))
                    .map((c) => (
                      <li key={c.id} className="flex items-center justify-between text-sm">
                        <span>{c.name} ({c.serialNumber})</span>
                        <Badge variant="secondary">{c.dueMaintenance}</Badge>
                      </li>
                    ))}
                </ul>
              </CardContent>
            </Card>
          )}
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
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                        名称
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                        序列号
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                        位置
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
                            className="font-medium text-primary hover:underline"
                          >
                            {comp.name}
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-sm">{comp.serialNumber}</td>
                        <td className="py-3 px-4 text-sm">{comp.location}</td>
                        <td className="py-3 px-4 text-sm">{comp.type}</td>
                        <td className="py-3 px-4 text-sm">{comp.totalFlightHours}h</td>
                        <td className="py-3 px-4">
                          {comp.dueMaintenance === "需更换" ? (
                            <Badge variant="destructive">需更换</Badge>
                          ) : comp.dueMaintenance.includes("后") ? (
                            <Badge variant="secondary">{comp.dueMaintenance}</Badge>
                          ) : (
                            <Badge className="bg-serviceable text-serviceable">正常</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                  <CardDescription>最近的飞行记录</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/flight-logs?aircraft=${aircraft.id}`}>查看全部</Link>
                </Button>
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
                          {flight.date} · 飞行员: {flight.pilot}
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
                  <CardDescription>过去的维保记录</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <History className="w-4 h-4 mr-2" />
                  导出记录
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
                        <Badge variant="outline" className="text-xs">
                          {record.status === "completed" ? "已完成" : "进行中"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{record.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        技术员: {record.technician}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
