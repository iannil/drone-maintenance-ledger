import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Edit2,
  Package,
  Clock,
  History,
  Wrench,
  FileText,
  QrCode,
  Calendar,
  MapPin,
  Activity,
  User,
  AlertTriangle,
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
import { ComponentStatusBadge } from "../components/common/status-badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";

/**
 * Component detail page with comprehensive history tracking
 */
export function ComponentDetailPage() {
  const { id } = useParams<{ id: string }>();

  // Mock data - TODO: Replace with API call
  const component = {
    id: "comp-001",
    name: "电机 #1",
    serialNumber: "SN-M001",
    type: "MOTOR",
    manufacturer: "DJI",
    model: "M350 Motor",
    partNumber: "M350-MOTOR-001",
    productionDate: "2024-01-15",
    status: "INSTALLED" as const,
    currentAircraftId: "ac-001",
    currentAircraftReg: "B-7011U",
    location: "左前",
    installDate: "2024-03-20",
    totalFlightHours: 125.5,
    totalFlightCycles: 89,
    batteryCycles: null,
    notes: "运行正常，定期检查无异常",
    specifications: {
      maxPower: "500W",
      ratedVoltage: "24V",
      maxRpm: "8000",
      weight: "180g",
    },
  };

  // Installation history (履历解耦核心)
  const installationHistory = [
    {
      id: "inst-003",
      action: "INSTALL",
      aircraftId: "ac-001",
      aircraftReg: "B-7011U",
      location: "左前",
      date: "2024-03-20",
      flightHoursAtInstall: 0,
      technician: "李四",
      reason: "新机装机",
    },
    {
      id: "inst-002",
      action: "REMOVE",
      aircraftId: "ac-002",
      aircraftReg: "B-7012U",
      location: "右前",
      date: "2024-03-19",
      flightHoursAtRemove: 0,
      technician: "王五",
      reason: "测试完成，拆下",
    },
    {
      id: "inst-001",
      action: "INSTALL",
      aircraftId: "ac-002",
      aircraftReg: "B-7012U",
      location: "右前",
      date: "2024-03-18",
      flightHoursAtInstall: 0,
      technician: "李四",
      reason: "测试装机",
    },
  ];

  // Maintenance history
  const maintenanceHistory = [
    {
      id: "maint-003",
      date: "2026-01-10",
      type: "定期检查",
      description: "100小时检查：轴承润滑，螺丝紧固",
      result: "正常",
      technician: "张三",
    },
    {
      id: "maint-002",
      date: "2025-10-15",
      type: "定期检查",
      description: "50小时检查：绝缘测试，震动测试",
      result: "正常",
      technician: "李四",
    },
    {
      id: "maint-001",
      date: "2025-07-20",
      type: "清洁保养",
      description: "清洁散热片，检查线缆连接",
      result: "正常",
      technician: "王五",
    },
  ];

  // Flight logs involving this component
  const recentFlights = [
    {
      id: "flight-003",
      date: "2026-01-15",
      aircraftReg: "B-7011U",
      pilot: "张三",
      duration: "1h 25m",
      flightHours: 1.42,
      purpose: "电力巡检",
    },
    {
      id: "flight-002",
      date: "2026-01-14",
      aircraftReg: "B-7011U",
      pilot: "李四",
      duration: "2h 10m",
      flightHours: 2.17,
      purpose: "线路巡视",
    },
    {
      id: "flight-001",
      date: "2026-01-13",
      aircraftReg: "B-7011U",
      pilot: "张三",
      duration: "0h 45m",
      flightHours: 0.75,
      purpose: "设备测试",
    },
  ];

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
            <h1 className="text-2xl font-bold text-slate-900">{component.name}</h1>
            <ComponentStatusBadge status={component.status} />
          </div>
          <p className="text-muted-foreground">
            {component.manufacturer} {component.model}
          </p>
        </div>
        <Button variant="outline" size="icon" title="查看二维码">
          <QrCode className="w-4 h-4" />
        </Button>
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
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-bold">{component.currentAircraftReg}</p>
                <p className="text-xs text-muted-foreground">{component.location}</p>
              </div>
            </div>
          </CardContent>
        </Card>
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
                  <span className="text-muted-foreground">名称</span>
                  <span className="font-medium">{component.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">序列号</span>
                  <span className="font-medium font-mono">{component.serialNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">零件号</span>
                  <span className="font-medium">{component.partNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">类型</span>
                  <span className="font-medium">{component.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">制造商</span>
                  <span className="font-medium">{component.manufacturer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">型号</span>
                  <span className="font-medium">{component.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">生产日期</span>
                  <span className="font-medium">{component.productionDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">当前状态</span>
                  <ComponentStatusBadge status={component.status} />
                </div>
              </CardContent>
            </Card>

            {/* Current Installation */}
            <Card>
              <CardHeader>
                <CardTitle>当前装机</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">飞机注册号</span>
                  <Link
                    to={`/aircraft/${component.currentAircraftId}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {component.currentAircraftReg}
                  </Link>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">安装位置</span>
                  <span className="font-medium">{component.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">装机日期</span>
                  <span className="font-medium">{component.installDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">本次飞行小时</span>
                  <span className="font-medium">{component.totalFlightHours}h</span>
                </div>
                <div className="pt-4 border-t flex gap-2">
                  <Button variant="outline" size="sm">
                    <Package className="w-4 h-4 mr-2" />
                    拆下
                  </Button>
                  <Button variant="outline" size="sm">
                    <Wrench className="w-4 h-4 mr-2" />
                    创建维保
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Specifications */}
          <Card>
            <CardHeader>
              <CardTitle>技术规格</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(component.specifications).map(([key, value]) => (
                  <div key={key} className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground uppercase">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </p>
                    <p className="font-medium">{value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {component.notes && (
            <Card>
              <CardHeader>
                <CardTitle>备注</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{component.notes}</p>
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
                              <span className="font-medium">{record.flightHoursAtInstall || record.flightHoursAtRemove}h</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
