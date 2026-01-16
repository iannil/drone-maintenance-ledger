import { useState, useEffect } from "react";
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
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  flightLogService,
  FlightLog,
  FlightType,
  FLIGHT_TYPE_LABELS,
  FLIGHT_TYPE_COLORS,
} from "../services/flight-log.service";
import { fullAircraftService, Aircraft } from "../services/fleet.service";

/**
 * 飞行日志详情页
 */
export function FlightLogDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showPirepDialog, setShowPirepDialog] = useState(false);
  const [pirepContent, setPirepContent] = useState("");
  const [flightLog, setFlightLog] = useState<FlightLog | null>(null);
  const [aircraft, setAircraft] = useState<Aircraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadFlightLog();
    }
  }, [id]);

  const loadFlightLog = async () => {
    try {
      setLoading(true);
      setError(null);
      const logData = await flightLogService.getById(id!);
      setFlightLog(logData);

      // Load aircraft info
      if (logData.aircraftId) {
        try {
          const aircraftData = await fullAircraftService.getById(logData.aircraftId);
          setAircraft(aircraftData);
        } catch {
          // Aircraft may not exist, continue without it
        }
      }
    } catch (err) {
      console.error("Failed to load flight log:", err);
      setError("加载飞行记录失败");
    } finally {
      setLoading(false);
    }
  };

  // Format date from timestamp
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("zh-CN");
  };

  // Format time from timestamp
  const formatTime = (timestamp: number | null) => {
    if (!timestamp) return "-";
    return new Date(timestamp).toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format datetime from timestamp
  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("zh-CN");
  };

  const handlePirepSubmit = () => {
    console.log("Submit PIREP:", pirepContent);
    setShowPirepDialog(false);
    // TODO: Implement PIREP submission
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded" />
          <div className="flex-1">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-3 w-16" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-5 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error || !flightLog) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          {error || "飞行记录不存在"}
        </h3>
        <Button onClick={() => navigate("/flight-logs")}>返回飞行记录列表</Button>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold text-slate-900">
              飞行记录 #{flightLog.id.slice(0, 8)}
            </h1>
            <Badge
              className={
                FLIGHT_TYPE_COLORS[flightLog.flightType as FlightType] ||
                "bg-slate-50 text-slate-700"
              }
            >
              {FLIGHT_TYPE_LABELS[flightLog.flightType as FlightType] ||
                flightLog.flightType}
            </Badge>
            {flightLog.discrepancies && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                有异常
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {formatDate(flightLog.flightDate)} ·{" "}
            {aircraft?.registration || "未知飞机"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" title="打印">
            <Printer className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" title="导出">
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(`/flight-logs/${id}/edit`)}
          >
            <Edit2 className="h-4 w-4 mr-2" />
            编辑
          </Button>
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
            {aircraft ? (
              <>
                <Link
                  to={`/aircraft/${flightLog.aircraftId}`}
                  className="font-medium text-primary hover:underline"
                >
                  {aircraft.registration}
                </Link>
                <p className="text-xs text-muted-foreground">{aircraft.model}</p>
              </>
            ) : (
              <span className="text-muted-foreground">未知</span>
            )}
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
              <span className="font-medium">
                {flightLog.pilotId?.slice(0, 8) || "未知"}
              </span>
            </div>
            {flightLog.copilotId && (
              <p className="text-xs text-muted-foreground">
                副驾: {flightLog.copilotId.slice(0, 8)}
              </p>
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
            <p className="text-xs text-muted-foreground">
              {flightLog.flightDuration} 分钟
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              起降循环
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1">
              <Plane className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{flightLog.takeoffCycles} 次起飞</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {flightLog.landingCycles} 次降落
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              载荷重量
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {flightLog.payloadWeight ? `${flightLog.payloadWeight} kg` : "-"}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              起飞前检查
            </CardTitle>
          </CardHeader>
          <CardContent>
            {flightLog.preFlightCheckCompleted ? (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span className="font-medium">已完成</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-yellow-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">未完成</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="route">航线信息</TabsTrigger>
          <TabsTrigger value="metrics">飞机指标</TabsTrigger>
          <TabsTrigger value="notes">备注</TabsTrigger>
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
                    <p className="font-medium">{formatTime(flightLog.departureTime)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">降落时间</Label>
                    <p className="font-medium">{formatTime(flightLog.arrivalTime)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">起飞地点</Label>
                    <p className="font-medium">{flightLog.departureLocation}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">降落地点</Label>
                    <p className="font-medium">{flightLog.arrivalLocation || "-"}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">飞行类型</Label>
                  <Badge
                    className={`mt-1 ${
                      FLIGHT_TYPE_COLORS[flightLog.flightType as FlightType] ||
                      "bg-slate-50 text-slate-700"
                    }`}
                  >
                    {FLIGHT_TYPE_LABELS[flightLog.flightType as FlightType] ||
                      flightLog.flightType}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Mission Info */}
            <Card>
              <CardHeader>
                <CardTitle>任务信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-muted-foreground text-xs">任务描述</Label>
                  <p className="text-sm mt-1 p-3 bg-slate-50 rounded-lg">
                    {flightLog.missionDescription || "无任务描述"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">载荷重量</Label>
                  <p className="font-medium">
                    {flightLog.payloadWeight ? `${flightLog.payloadWeight} kg` : "未记录"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Route Tab */}
        <TabsContent value="route">
          <Card>
            <CardHeader>
              <CardTitle>航线信息</CardTitle>
              <CardDescription>起降地点和航线详情</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6 p-4 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                <div className="text-center text-muted-foreground">
                  <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>地图视图（待集成地图组件）</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Plane className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">起飞</p>
                    <p className="text-sm text-muted-foreground">
                      {flightLog.departureLocation}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatTime(flightLog.departureTime)}
                  </div>
                </div>

                {flightLog.arrivalLocation && (
                  <div className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Plane className="h-5 w-5 text-blue-600 rotate-45" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">降落</p>
                      <p className="text-sm text-muted-foreground">
                        {flightLog.arrivalLocation}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatTime(flightLog.arrivalTime)}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics">
          <Card>
            <CardHeader>
              <CardTitle>飞机指标变化</CardTitle>
              <CardDescription>本次飞行前后的飞机累计指标</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-4">飞行小时</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">飞行前</span>
                      <span className="font-medium">
                        {flightLog.aircraftHoursBefore ?? "-"} h
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">飞行后</span>
                      <span className="font-medium">
                        {flightLog.aircraftHoursAfter ?? "-"} h
                      </span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t">
                      <span className="text-muted-foreground">本次增加</span>
                      <span className="font-medium text-green-600">
                        +{flightLog.flightHours} h
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-4">起降循环</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">飞行前</span>
                      <span className="font-medium">
                        {flightLog.aircraftCyclesBefore ?? "-"} 次
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">飞行后</span>
                      <span className="font-medium">
                        {flightLog.aircraftCyclesAfter ?? "-"} 次
                      </span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t">
                      <span className="text-muted-foreground">本次增加</span>
                      <span className="font-medium text-green-600">
                        +{flightLog.takeoffCycles} 次
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle>备注与异常</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground text-xs">飞行后备注</Label>
                <p className="text-sm mt-1 p-3 bg-slate-50 rounded-lg">
                  {flightLog.postFlightNotes || "无备注"}
                </p>
              </div>

              {flightLog.discrepancies && (
                <div>
                  <Label className="text-muted-foreground text-xs flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    发现的异常
                  </Label>
                  <p className="text-sm mt-1 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    {flightLog.discrepancies}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>创建时间</span>
                  <span>{formatDateTime(flightLog.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
                  <span>更新时间</span>
                  <span>{formatDateTime(flightLog.updatedAt)}</span>
                </div>
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
            <DialogDescription>请详细记录飞行过程中的观察和发现</DialogDescription>
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
