import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  AlertTriangle,
  Clock,
  TrendingUp,
  CheckCircle2,
  MoreHorizontal,
  BarChart3,
  Wrench,
  Plane,
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
import { Progress } from "../components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";

// 寿命件状态
const LLP_STATUS = {
  GOOD: {
    label: "良好",
    color: "bg-green-100 text-green-700",
    progressColor: "bg-green-500",
  },
  WARNING: {
    label: "预警",
    color: "bg-yellow-100 text-yellow-700",
    progressColor: "bg-yellow-500",
  },
  CRITICAL: {
    label: "临界",
    color: "bg-orange-100 text-orange-700",
    progressColor: "bg-orange-500",
  },
  EXPIRED: {
    label: "已过期",
    color: "bg-red-100 text-red-700",
    progressColor: "bg-red-500",
  },
  RETIRED: {
    label: "已报废",
    color: "bg-slate-100 text-slate-700",
    progressColor: "bg-slate-500",
  },
};

// 寿命件类型
const LLP_TYPES = {
  ROTOR_BLADE: { label: "桨叶", unit: "飞行小时", typicalLife: 500 },
  MOTOR: { label: "电机", unit: "飞行小时", typicalLife: 1000 },
  ESC: { label: "电调", unit: "飞行小时", typicalLife: 800 },
  BATTERY: { label: "电池", unit: "循环次数", typicalLife: 300 },
  SERVO: { label: "舵机", unit: "循环次数", typicalLife: 500 },
  GIMBAL: { label: "云台", unit: "飞行小时", typicalLife: 600 },
  LANDING_GEAR: { label: "起落架", unit: "起降次数", typicalLife: 1000 },
};

/**
 * 零部件寿命件追踪页面
 */
export function LlpTrackingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedAircraft, setSelectedAircraft] = useState<string>("all");
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedPart, setSelectedPart] = useState<any>(null);

  // 飞机列表
  const aircraft = [
    { id: "all", registration: "全部飞机" },
    { id: "ac-001", registration: "B-7011U", model: "DJI M350 RTK" },
    { id: "ac-002", registration: "B-7012U", model: "Autel Evo II" },
    { id: "ac-003", registration: "B-7013U", model: "DJI Mavic 3" },
  ];

  // 寿命件数据
  const llpParts = [
    {
      id: "llp-001",
      partNumber: "RB-2995-001",
      partName: "螺旋桨桨叶",
      partType: "ROTOR_BLADE",
      serialNumber: "RB-2024-00156",
      aircraftId: "ac-001",
      aircraftRegistration: "B-7011U",
      position: "M1",
      installDate: "2024-08-15",
      flightHours: 198,
      cycles: 156,
      maxLife: 500,
      remainingHours: 302,
      status: "GOOD",
      manufacturer: "DJI",
      batchNumber: "BATCH-2024-08",
      notes: "无明显磨损",
    },
    {
      id: "llp-002",
      partNumber: "RB-2995-002",
      partName: "螺旋桨桨叶",
      partType: "ROTOR_BLADE",
      serialNumber: "RB-2024-00157",
      aircraftId: "ac-001",
      aircraftRegistration: "B-7011U",
      position: "M2",
      installDate: "2024-08-15",
      flightHours: 198,
      cycles: 156,
      maxLife: 500,
      remainingHours: 302,
      status: "GOOD",
      manufacturer: "DJI",
      batchNumber: "BATCH-2024-08",
      notes: "无明显磨损",
    },
    {
      id: "llp-003",
      partNumber: "RB-2995-003",
      partName: "螺旋桨桨叶",
      partType: "ROTOR_BLADE",
      serialNumber: "RB-2024-00158",
      aircraftId: "ac-001",
      aircraftRegistration: "B-7011U",
      position: "M3",
      installDate: "2024-08-15",
      flightHours: 198,
      cycles: 156,
      maxLife: 500,
      remainingHours: 302,
      status: "GOOD",
      manufacturer: "DJI",
      batchNumber: "BATCH-2024-08",
      notes: "无明显磨损",
    },
    {
      id: "llp-004",
      partNumber: "RB-2995-004",
      partName: "螺旋桨桨叶",
      partType: "ROTOR_BLADE",
      serialNumber: "RB-2024-00159",
      aircraftId: "ac-001",
      aircraftRegistration: "B-7011U",
      position: "M4",
      installDate: "2024-08-15",
      flightHours: 198,
      cycles: 156,
      maxLife: 500,
      remainingHours: 302,
      status: "GOOD",
      manufacturer: "DJI",
      batchNumber: "BATCH-2024-08",
      notes: "无明显磨损",
    },
    {
      id: "llp-005",
      partNumber: "EM-2814-003",
      partName: "电机 AX-2814",
      partType: "MOTOR",
      serialNumber: "EM-2024-00245",
      aircraftId: "ac-002",
      aircraftRegistration: "B-7012U",
      position: "M1",
      installDate: "2024-06-01",
      flightHours: 425,
      cycles: 312,
      maxLife: 1000,
      remainingHours: 575,
      status: "GOOD",
      manufacturer: "DJI",
      batchNumber: "BATCH-2024-06",
      notes: "运转正常，定期润滑",
    },
    {
      id: "llp-006",
      partNumber: "EM-2814-004",
      partName: "电机 AX-2814",
      partType: "MOTOR",
      serialNumber: "EM-2024-00246",
      aircraftId: "ac-002",
      aircraftRegistration: "B-7012U",
      position: "M2",
      installDate: "2024-06-01",
      flightHours: 425,
      cycles: 312,
      maxLife: 1000,
      remainingHours: 575,
      status: "GOOD",
      manufacturer: "DJI",
      batchNumber: "BATCH-2024-06",
      notes: "运转正常，定期润滑",
    },
    {
      id: "llp-007",
      partNumber: "EM-2814-005",
      partName: "电机 AX-2814",
      partType: "MOTOR",
      serialNumber: "EM-2024-00247",
      aircraftId: "ac-002",
      aircraftRegistration: "B-7012U",
      position: "M3",
      installDate: "2024-06-01",
      flightHours: 425,
      cycles: 312,
      maxLife: 1000,
      remainingHours: 575,
      status: "GOOD",
      manufacturer: "DJI",
      batchNumber: "BATCH-2024-06",
      notes: "运转正常，定期润滑",
    },
    {
      id: "llp-008",
      partNumber: "EM-2814-006",
      partName: "电机 AX-2814",
      partType: "MOTOR",
      serialNumber: "EM-2024-00248",
      aircraftId: "ac-002",
      aircraftRegistration: "B-7012U",
      position: "M4",
      installDate: "2024-06-01",
      flightHours: 425,
      cycles: 312,
      maxLife: 1000,
      remainingHours: 575,
      status: "GOOD",
      manufacturer: "DJI",
      batchNumber: "BATCH-2024-06",
      notes: "运转正常，定期润滑",
    },
    {
      id: "llp-009",
      partNumber: "BT-16000-012",
      partName: "电池包 16000mAh",
      partType: "BATTERY",
      serialNumber: "BT-2024-00345",
      aircraftId: "ac-003",
      aircraftRegistration: "B-7013U",
      position: "BATT1",
      installDate: "2024-10-01",
      flightHours: 45,
      cycles: 285,
      maxLife: 300,
      remainingCycles: 15,
      status: "WARNING",
      manufacturer: "DJI",
      batchNumber: "BATCH-2024-10",
      notes: "容量下降至85%，建议更换",
    },
    {
      id: "llp-010",
      partNumber: "BT-16000-013",
      partName: "电池包 16000mAh",
      partType: "BATTERY",
      serialNumber: "BT-2024-00346",
      aircraftId: "ac-003",
      aircraftRegistration: "B-7013U",
      position: "BATT2",
      installDate: "2024-10-01",
      flightHours: 45,
      cycles: 288,
      maxLife: 300,
      remainingCycles: 12,
      status: "WARNING",
      manufacturer: "DJI",
      batchNumber: "BATCH-2024-10",
      notes: "容量下降至83%，建议更换",
    },
    {
      id: "llp-011",
      partNumber: "BT-16000-014",
      partName: "电池包 16000mAh",
      partType: "BATTERY",
      serialNumber: "BT-2024-00347",
      aircraftId: "ac-001",
      aircraftRegistration: "B-7011U",
      position: "BATT1",
      installDate: "2024-03-15",
      flightHours: 125,
      cycles: 315,
      maxLife: 300,
      remainingCycles: -15,
      status: "EXPIRED",
      manufacturer: "DJI",
      batchNumber: "BATCH-2024-03",
      notes: "已超过使用寿命，需立即更换",
    },
    {
      id: "llp-012",
      partNumber: "ESC-40A-008",
      partName: "电调 40A",
      partType: "ESC",
      serialNumber: "ESC-2024-00123",
      aircraftId: "ac-003",
      aircraftRegistration: "B-7013U",
      position: "ESC1",
      installDate: "2024-05-20",
      flightHours: 680,
      cycles: 520,
      maxLife: 800,
      remainingHours: 120,
      status: "WARNING",
      manufacturer: " Hobbywing",
      batchNumber: "BATCH-2024-05",
      notes: "温度略高，建议检查",
    },
    {
      id: "llp-013",
      partNumber: "LG-FOLD-005",
      partName: "折叠起落架",
      partType: "LANDING_GEAR",
      serialNumber: "LG-2024-00089",
      aircraftId: "ac-003",
      aircraftRegistration: "B-7013U",
      position: "FRONT",
      installDate: "2024-01-10",
      flightHours: 890,
      cycles: 750,
      maxLife: 1000,
      remainingCycles: 250,
      status: "GOOD",
      manufacturer: "DJI",
      batchNumber: "BATCH-2024-01",
      notes: "定期检查，无异常",
    },
  ];

  // 筛选零部件
  const filteredParts = llpParts.filter((part) => {
    const matchesSearch =
      searchQuery === "" ||
      part.partName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      part.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      part.partNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      part.aircraftRegistration.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || part.status === statusFilter;
    const matchesType = typeFilter === "all" || part.partType === typeFilter;
    const matchesAircraft = selectedAircraft === "all" || part.aircraftId === selectedAircraft;

    return matchesSearch && matchesStatus && matchesType && matchesAircraft;
  });

  // 统计
  const stats = {
    total: filteredParts.length,
    good: filteredParts.filter((p) => p.status === "GOOD").length,
    warning: filteredParts.filter((p) => p.status === "WARNING").length,
    critical: filteredParts.filter((p) => p.status === "CRITICAL").length,
    expired: filteredParts.filter((p) => p.status === "EXPIRED").length,
  };

  // 计算使用百分比
  const getUsagePercentage = (part: typeof llpParts[0]) => {
    if (part.partType === "BATTERY" || part.partType === "SERVO" || part.partType === "LANDING_GEAR") {
      return ((part.cycles / part.maxLife) * 100);
    }
    return ((part.flightHours / part.maxLife) * 100);
  };

  // 查看详情
  const viewDetail = (part: typeof llpParts[0]) => {
    setSelectedPart(part);
    setShowDetailDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">寿命件追踪</h1>
          <p className="text-muted-foreground">
            有使用寿命限制的零部件追踪和管理
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <BarChart3 className="w-4 h-4 mr-2" />
            使用分析
          </Button>
          <Button>
            记录更换
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              全部部件
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              良好
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.good}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              预警
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.warning}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              临界
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.critical}</div>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              已过期
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
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
          全部 ({stats.total})
        </Button>
        <Button
          variant={statusFilter === "EXPIRED" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("EXPIRED")}
          className={statusFilter === "EXPIRED" ? "bg-red-600 hover:bg-red-700" : ""}
        >
          已过期 ({stats.expired})
        </Button>
        <Button
          variant={statusFilter === "CRITICAL" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("CRITICAL")}
          className={statusFilter === "CRITICAL" ? "bg-orange-600 hover:bg-orange-700" : ""}
        >
          临界 ({stats.critical})
        </Button>
        <Button
          variant={statusFilter === "WARNING" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("WARNING")}
          className={statusFilter === "WARNING" ? "bg-yellow-600 hover:bg-yellow-700" : ""}
        >
          预警 ({stats.warning})
        </Button>
        <Button
          variant={statusFilter === "GOOD" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("GOOD")}
          className={statusFilter === "GOOD" ? "bg-green-600 hover:bg-green-700" : ""}
        >
          良好 ({stats.good})
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索零部件名称、序列号或飞机号..."
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
              {Object.entries(LLP_TYPES).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <select
              value={selectedAircraft}
              onChange={(e) => setSelectedAircraft(e.target.value)}
              className="h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              {aircraft.map((ac) => (
                <option key={ac.id} value={ac.id}>
                  {ac.registration}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Parts List */}
      <Card>
        <CardHeader>
          <CardTitle>寿命件列表</CardTitle>
          <CardDescription>
            共 {filteredParts.length} 个部件
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredParts.map((part) => {
              const usagePercent = getUsagePercentage(part);
              const partTypeInfo = LLP_TYPES[part.partType as keyof typeof LLP_TYPES];
              const statusInfo = LLP_STATUS[part.status as keyof typeof LLP_STATUS];

              return (
                <div
                  key={part.id}
                  className={`border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                    part.status === "EXPIRED" ? "border-red-300 bg-red-50/30" :
                    part.status === "WARNING" ? "border-yellow-300 bg-yellow-50/30" :
                    ""
                  }`}
                  onClick={() => viewDetail(part)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Status Icon */}
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        part.status === "EXPIRED" ? "bg-red-100" :
                        part.status === "WARNING" ? "bg-yellow-100" :
                        part.status === "CRITICAL" ? "bg-orange-100" :
                        "bg-green-100"
                      }`}>
                        {part.status === "EXPIRED" ? (
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                        ) : part.status === "WARNING" ? (
                          <Clock className="h-5 w-5 text-yellow-600" />
                        ) : part.status === "CRITICAL" ? (
                          <AlertTriangle className="h-5 w-5 text-orange-600" />
                        ) : (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Link
                            to={`/components/${part.id}`}
                            className="font-medium hover:text-primary"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {part.partName}
                          </Link>
                          <span className="text-sm text-muted-foreground">
                            ({part.serialNumber})
                          </span>
                          <Badge className={statusInfo.color}>
                            {statusInfo.label}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {partTypeInfo.label}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-2">
                          <span className="flex items-center gap-1">
                            <Plane className="h-3.5 w-3.5" />
                            <Link
                              to={`/aircraft/${part.aircraftId}`}
                              className="text-primary hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {part.aircraftRegistration}
                            </Link>
                            <span className="text-muted-foreground">位置: {part.position}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Wrench className="h-3.5 w-3.5" />
                            安装于 {part.installDate}
                          </span>
                        </div>

                        {/* Usage Progress */}
                        <div className="mb-1">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-muted-foreground">
                              已使用: {part.partType === "BATTERY" || part.partType === "SERVO" || part.partType === "LANDING_GEAR"
                                ? `${part.cycles} / ${part.maxLife} ${partTypeInfo.unit}`
                                : `${part.flightHours} / ${part.maxLife} ${partTypeInfo.unit}`}
                            </span>
                            <span className="font-medium">{usagePercent.toFixed(1)}%</span>
                          </div>
                          <Progress
                            value={Math.min(usagePercent, 100)}
                            className="h-2"
                          />
                        </div>

                        {/* Remaining Info */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            剩余: {
                              part.partType === "BATTERY" || part.partType === "SERVO" || part.partType === "LANDING_GEAR"
                                ? part.remainingCycles
                                : part.remainingHours
                            } {partTypeInfo.unit}
                          </span>
                          {part.notes && (
                            <span className="text-muted-foreground truncate max-w-[200px]">{part.notes}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredParts.length === 0 && (
            <div className="text-center py-12">
              <Wrench className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">未找到寿命件</h3>
              <p className="text-muted-foreground">
                尝试调整搜索或筛选条件
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>寿命件详情</DialogTitle>
            <DialogDescription>
              {selectedPart?.serialNumber}
            </DialogDescription>
          </DialogHeader>
          {selectedPart && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">零部件名称</Label>
                  <p className="font-medium">{selectedPart.partName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">零部件编号</Label>
                  <p className="font-medium">{selectedPart.partNumber}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">序列号</Label>
                  <p className="font-medium">{selectedPart.serialNumber}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">状态</Label>
                  <p className="font-medium">
                    <Badge className={LLP_STATUS[selectedPart.status as keyof typeof LLP_STATUS].color}>
                      {LLP_STATUS[selectedPart.status as keyof typeof LLP_STATUS].label}
                    </Badge>
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">飞机</Label>
                  <p className="font-medium">
                    {selectedPart.aircraftRegistration} (位置: {selectedPart.position})
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">安装日期</Label>
                  <p className="font-medium">{selectedPart.installDate}</p>
                </div>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">使用情况</h4>
                <div className="space-y-3">
                  {selectedPart.partType === "BATTERY" || selectedPart.partType === "SERVO" || selectedPart.partType === "LANDING_GEAR" ? (
                    <>
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-muted-foreground">循环次数</span>
                          <span className="font-medium">{selectedPart.cycles} / {selectedPart.maxLife}</span>
                        </div>
                        <Progress
                          value={(selectedPart.cycles / selectedPart.maxLife) * 100}
                          className="h-2"
                        />
                      </div>
                      <div className="text-sm text-muted-foreground">
                        剩余: {selectedPart.remainingCycles > 0 ? selectedPart.remainingCycles : 0} 循环
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-muted-foreground">飞行小时</span>
                          <span className="font-medium">{selectedPart.flightHours} / {selectedPart.maxLife}</span>
                        </div>
                        <Progress
                          value={(selectedPart.flightHours / selectedPart.maxLife) * 100}
                          className="h-2"
                        />
                      </div>
                      <div className="text-sm text-muted-foreground">
                        剩余: {selectedPart.remainingHours > 0 ? selectedPart.remainingHours : 0} 小时
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">制造商</Label>
                  <p className="font-medium">{selectedPart.manufacturer}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">批次号</Label>
                  <p className="font-medium">{selectedPart.batchNumber}</p>
                </div>
              </div>
              {selectedPart.notes && (
                <div>
                  <Label className="text-muted-foreground">备注</Label>
                  <p className="text-sm mt-1">{selectedPart.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              关闭
            </Button>
            <Button>
              记录更换
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
