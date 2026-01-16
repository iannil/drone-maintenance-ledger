import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Edit2,
  Download,
  Printer,
  Plane,
  Calendar,
  Clock,
  MapPin,
  User,
  Mountain,
  Route,
  Package,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Plus,
  X,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
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

// Mock flight log data
const MOCK_FLIGHT_LOG: Record<string, any> = {
  "fl-001": {
    id: "fl-001",
    flightNumber: "FL-20260116-001",
    date: "2026-01-16",
    takeoffTime: "08:30",
    landingTime: "10:15",
    aircraftId: "ac-001",
    aircraftRegistration: "B-7011U",
    aircraftModel: "DJI M350 RTK",
    pilot: "张三",
    copilot: "李四",
    flightType: "INSPECTION",
    status: "COMPLETED",
    flightHours: 1.75,
    flightCycles: 1,
    takeoffLocation: "基地停机坪",
    landingLocation: "基地停机坪",
    route: "基地 -> 巡检区域A -> 巡检区域B -> 基地",
    waypoints: [
      { name: "基地", lat: 31.2304, lng: 121.4737, alt: 0, time: "08:30" },
      { name: "巡检区域A", lat: 31.2400, lng: 121.4900, alt: 100, time: "08:45" },
      { name: "巡检区域B", lat: 31.2600, lng: 121.5100, alt: 120, time: "09:30" },
      { name: "基地", lat: 31.2304, lng: 121.4737, alt: 0, time: "10:15" },
    ],
    maxAltitude: 120,
    avgAltitude: 95,
    distance: 15.2,
    payload: ["相机", "红外"],
    fuel: { start: 95, end: 45, unit: "%" },
    battery: { start: 100, end: 35, unit: "%" },
    remarks: "正常完成巡检任务，发现1处异常已记录",
    hasIncident: false,
    pirepSubmitted: true,
    pirep: {
      submittedAt: "2026-01-16T11:00:00",
      submittedBy: "张三",
      content: "飞行过程正常，天气晴朗，能见度良好。巡检区域A发现1处绝缘子轻微破损，已拍照记录。设备运行正常，无异常。",
      findings: [
        { type: "damage", description: "绝缘子轻微破损", location: "巡检区域A塔杆#23", severity: "minor" },
      ],
    },
    events: [
      { time: "08:30", type: "takeoff", description: "起飞" },
      { time: "08:45", type: "waypoint", description: "到达巡检区域A" },
      { time: "09:15", type: "observation", description: "发现绝缘子破损" },
      { time: "09:30", type: "waypoint", description: "到达巡检区域B" },
      { time: "10:15", type: "landing", description: "降落" },
    ],
    attachments: [
      { id: "att-001", name: "飞行轨迹.kml", type: "kml", size: "45KB" },
      { id: "att-002", name: "巡检照片.zip", type: "zip", size: "128MB" },
      { id: "att-003", name: "飞行日志.pdf", type: "pdf", size: "256KB" },
    ],
    createdAt: "2026-01-16T08:00:00",
    createdBy: "张三",
    updatedAt: "2026-01-16T11:30:00",
  },
};

/**
 * 飞行日志详情页
 */
export function FlightLogDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showPirepDialog, setShowPirepDialog] = useState(false);
  const [pirepContent, setPirepContent] = useState("");

  const flightLog = id ? MOCK_FLIGHT_LOG[id] : null;

  if (!flightLog) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">飞行记录不存在</h2>
          <Button onClick={() => navigate("/flight-logs")}>返回飞行记录列表</Button>
        </div>
      </div>
    );
  }

  const StatusIcon = FLIGHT_STATUS[flightLog.status].icon;

  const handlePirepSubmit = () => {
    console.log("Submit PIREP:", pirepContent);
    setShowPirepDialog(false);
    // TODO: Implement PIREP submission
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/flight-logs")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-slate-900">{flightLog.flightNumber}</h1>
            <Badge className={FLIGHT_STATUS[flightLog.status].color}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {FLIGHT_STATUS[flightLog.status].label}
            </Badge>
            <Badge className={FLIGHT_TYPES[flightLog.flightType].color}>
              {FLIGHT_TYPES[flightLog.flightType].label}
            </Badge>
            {flightLog.hasIncident && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                有事故
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {flightLog.date} · {flightLog.aircraftRegistration}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" title="打印">
            <Printer className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" title="导出">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => navigate(`/flight-logs/${id}/edit`)}>
            <Edit2 className="h-4 w-4 mr-2" />
            编辑
          </Button>
          {!flightLog.pirepSubmitted && (
            <Button onClick={() => setShowPirepDialog(true)}>
              <FileText className="h-4 w-4 mr-2" />
              提交飞行员报告
            </Button>
          )}
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              关联飞机
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              to={`/aircraft/${flightLog.aircraftId}`}
              className="font-medium text-primary hover:underline"
            >
              {flightLog.aircraftRegistration}
            </Link>
            <p className="text-xs text-muted-foreground">{flightLog.aircraftModel}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              飞行员
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{flightLog.pilot}</span>
            </div>
            {flightLog.copilot && (
              <p className="text-xs text-muted-foreground">副驾: {flightLog.copilot}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              飞行时间
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{flightLog.flightHours} 小时</span>
            </div>
            <p className="text-xs text-muted-foreground">{flightLog.flightCycles} 次循环</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              飞行里程
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1">
              <Route className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{flightLog.distance} km</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              最大高度
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1">
              <Mountain className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{flightLog.maxAltitude} m</span>
            </div>
            <p className="text-xs text-muted-foreground">平均: {flightLog.avgAltitude}m</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              剩余电量
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="font-medium">{flightLog.battery.end}%</span>
            <p className="text-xs text-muted-foreground">起始: {flightLog.battery.start}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="route">航线轨迹</TabsTrigger>
          <TabsTrigger value="pirep">飞行员报告</TabsTrigger>
          <TabsTrigger value="events">事件记录</TabsTrigger>
          <TabsTrigger value="attachments">附件</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Flight Info */}
            <Card>
              <CardHeader>
                <CardTitle>飞行信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-xs">起飞时间</Label>
                    <p className="font-medium">{flightLog.takeoffTime}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">降落时间</Label>
                    <p className="font-medium">{flightLog.landingTime}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">起飞地点</Label>
                    <p className="font-medium">{flightLog.takeoffLocation}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">降落地点</Label>
                    <p className="font-medium">{flightLog.landingLocation}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">航线</Label>
                  <p className="text-sm">{flightLog.route}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">任务载荷</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {flightLog.payload.map((item: string, index: number) => (
                      <Badge key={index} variant="outline">
                        <Package className="h-3 w-3 mr-1" />
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Battery/Fuel Info */}
            <Card>
              <CardHeader>
                <CardTitle>能源消耗</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs">电池</Label>
                    <span className="text-sm text-muted-foreground">
                      {flightLog.battery.start}% → {flightLog.battery.end}%
                    </span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{ width: `${flightLog.battery.end}%` }}
                    />
                  </div>
                </div>
                {flightLog.remarks && (
                  <div>
                    <Label className="text-xs">备注</Label>
                    <p className="text-sm text-muted-foreground mt-1">{flightLog.remarks}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Route Tab */}
        <TabsContent value="route">
          <Card>
            <CardHeader>
              <CardTitle>航线轨迹</CardTitle>
              <CardDescription>
                航点列表与飞行轨迹
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6 p-4 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                <div className="text-center text-muted-foreground">
                  <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>地图视图（待集成地图组件）</p>
                </div>
              </div>

              <h3 className="font-semibold mb-4">航点列表</h3>
              <div className="space-y-2">
                {flightLog.waypoints.map((wp: any, index: number) => (
                  <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="flex-shrink-0">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        index === 0
                          ? "bg-green-100 text-green-700"
                          : index === flightLog.waypoints.length - 1
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-100 text-slate-600"
                      }`}>
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{wp.name}</p>
                      <p className="text-xs text-muted-foreground">
                        纬度: {wp.lat} · 经度: {wp.lng} · 高度: {wp.alt}m
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {wp.time}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PIREP Tab */}
        <TabsContent value="pirep">
          <Card>
            <CardHeader>
              <CardTitle>飞行员报告 (PIREP)</CardTitle>
              <CardDescription>
                {flightLog.pirepSubmitted
                  ? `提交于 ${new Date(flightLog.pirep.submittedAt).toLocaleString("zh-CN")} by ${flightLog.pirep.submittedBy}`
                  : "尚未提交"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {flightLog.pirepSubmitted ? (
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs">报告内容</Label>
                    <p className="text-sm mt-1 p-3 bg-slate-50 rounded-lg">
                      {flightLog.pirep.content}
                    </p>
                  </div>

                  {flightLog.pirep.findings && flightLog.pirep.findings.length > 0 && (
                    <div>
                      <Label className="text-xs">发现记录</Label>
                      <div className="mt-2 space-y-2">
                        {flightLog.pirep.findings.map((finding: any, index: number) => (
                          <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                            <AlertTriangle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                              finding.severity === "minor" ? "text-yellow-500" : "text-red-500"
                            }`} />
                            <div className="flex-1">
                              <p className="font-medium">{finding.description}</p>
                              <p className="text-xs text-muted-foreground">
                                位置: {finding.location} · 严重程度: {finding.severity === "minor" ? "轻微" : "严重"}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>飞行员报告尚未提交</p>
                  <Button
                    className="mt-4"
                    onClick={() => setShowPirepDialog(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    创建飞行员报告
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>事件记录</CardTitle>
              <CardDescription>
                飞行过程中的关键事件
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {flightLog.events.map((event: any, index: number) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        event.type === "takeoff" || event.type === "landing"
                          ? "bg-blue-100"
                          : event.type === "observation"
                          ? "bg-yellow-100"
                          : "bg-slate-100"
                      }`}>
                        {event.type === "takeoff" && <Plane className="h-4 w-4 text-blue-600" />}
                        {event.type === "landing" && <Plane className="h-4 w-4 text-blue-600 rotate-45" />}
                        {event.type === "waypoint" && <MapPin className="h-4 w-4 text-slate-600" />}
                        {event.type === "observation" && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                      </div>
                      {index < flightLog.events.length - 1 && (
                        <div className="w-0.5 flex-1 bg-slate-200 my-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{event.description}</p>
                        <span className="text-xs text-muted-foreground">{event.time}</span>
                      </div>
                      {event.type === "observation" && (
                        <Badge variant="outline" className="text-xs">观察记录</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attachments Tab */}
        <TabsContent value="attachments">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>附件</CardTitle>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  上传附件
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {flightLog.attachments.map((att: any) => (
                  <div
                    key={att.id}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{att.name}</p>
                      <p className="text-xs text-muted-foreground">{att.size}</p>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* PIREP Dialog */}
      <Dialog open={showPirepDialog} onOpenChange={setShowPirepDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>提交飞行员报告 (PIREP)</DialogTitle>
            <DialogDescription>
              请详细记录飞行过程中的观察和发现
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="pirep-content">报告内容 *</Label>
              <textarea
                id="pirep-content"
                className="flex min-h-[150px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 resize-vertical"
                placeholder="描述飞行过程、天气条件、设备状态、发现的问题等..."
                value={pirepContent}
                onChange={(e) => setPirepContent(e.target.value)}
              />
            </div>
            <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
              <p className="font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                提示
              </p>
              <ul className="mt-2 space-y-1 text-xs">
                <li>• 记录任何异常或发现的问题</li>
                <li>• 说明天气条件和飞行环境</li>
                <li>• 报告设备状态或故障</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPirepDialog(false)}>
              取消
            </Button>
            <Button onClick={handlePirepSubmit} disabled={!pirepContent}>
              <FileText className="h-4 w-4 mr-2" />
              提交报告
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
