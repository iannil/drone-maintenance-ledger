import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Calendar,
  Clock,
  MapPin,
  Plane,
  User,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  Download,
  X,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";
import { Label } from "../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

// 飞行任务类型
const MISSION_TYPES = {
  TRAINING: { label: "训练飞行", color: "bg-blue-100 text-blue-700" },
  PATROL: { label: "巡逻任务", color: "bg-green-100 text-green-700" },
  SURVEY: { label: "测绘任务", color: "bg-purple-100 text-purple-700" },
  DELIVERY: { label: "物流配送", color: "bg-orange-100 text-orange-700" },
  INSPECTION: { label: "巡检任务", color: "bg-cyan-100 text-cyan-700" },
  AERIAL_PHOTO: { label: "航拍", color: "bg-pink-100 text-pink-700" },
  EMERGENCY: { label: "应急任务", color: "bg-red-100 text-red-700" },
  OTHER: { label: "其他", color: "bg-slate-100 text-slate-700" },
};

// 飞行状态
const FLIGHT_STATUS = {
  COMPLETED: { label: "已完成", color: "bg-green-100 text-green-700" },
  IN_PROGRESS: { label: "进行中", color: "bg-blue-100 text-blue-700" },
  CANCELLED: { label: "已取消", color: "bg-slate-100 text-slate-700" },
  ABORTED: { label: "中断", color: "bg-red-100 text-red-700" },
};

// 日期范围选项
const DATE_RANGE_OPTIONS = [
  { value: "today", label: "今天" },
  { value: "yesterday", label: "昨天" },
  { value: "last7days", label: "最近7天" },
  { value: "last30days", label: "最近30天" },
  { value: "thisMonth", label: "本月" },
  { value: "lastMonth", label: "上月" },
  { value: "custom", label: "自定义" },
];

/**
 * 飞行记录搜索页面
 */
export function FlightLogSearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [selectedAircraft, setSelectedAircraft] = useState<string>("all");
  const [selectedPilots, setSelectedPilots] = useState<string[]>([]);
  const [selectedMissionTypes, setSelectedMissionTypes] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [minDuration, setMinDuration] = useState("");
  const [maxDuration, setMaxDuration] = useState("");
  const [sortBy, setSortBy] = useState<string>("date-desc");

  // 飞机列表
  const aircraft = [
    { id: "ac-001", registration: "B-7011U", model: "DJI M350 RTK" },
    { id: "ac-002", registration: "B-7012U", model: "Autel Evo II" },
    { id: "ac-003", registration: "B-7013U", model: "DJI Mavic 3" },
  ];

  // 飞手列表
  const pilots = [
    { id: "p-001", name: "张三" },
    { id: "p-002", name: "李四" },
    { id: "p-003", name: "王五" },
    { id: "p-004", name: "赵六" },
  ];

  // Mock 飞行记录
  const flightLogs = [
    {
      id: "fl-001",
      date: "2026-01-15",
      time: "10:30",
      aircraftId: "ac-001",
      aircraftRegistration: "B-7011U",
      pilotId: "p-001",
      pilotName: "张三",
      copilotId: "p-002",
      copilotName: "李四",
      missionType: "PATROL",
      takeoffLocation: "基地A",
      landingLocation: "基地A",
      duration: 45,
      flightDistance: 12.5,
      maxAltitude: 120,
      batteryStart: 98,
      batteryEnd: 35,
      status: "COMPLETED",
      notes: "常规巡逻任务，飞行正常",
      hasPirep: false,
    },
    {
      id: "fl-002",
      date: "2026-01-15",
      time: "14:20",
      aircraftId: "ac-002",
      aircraftRegistration: "B-7012U",
      pilotId: "p-003",
      pilotName: "王五",
      copilotId: null,
      copilotName: null,
      missionType: "SURVEY",
      takeoffLocation: "测区B",
      landingLocation: "测区B",
      duration: 38,
      flightDistance: 8.3,
      maxAltitude: 150,
      batteryStart: 95,
      batteryEnd: 28,
      status: "COMPLETED",
      notes: "区域测绘任务",
      hasPirep: false,
    },
    {
      id: "fl-003",
      date: "2026-01-14",
      time: "09:15",
      aircraftId: "ac-001",
      aircraftRegistration: "B-7011U",
      pilotId: "p-001",
      pilotName: "张三",
      copilotId: null,
      copilotName: null,
      missionType: "INSPECTION",
      takeoffLocation: "基站C",
      landingLocation: "基站C",
      duration: 52,
      flightDistance: 15.8,
      maxAltitude: 80,
      batteryStart: 100,
      batteryEnd: 42,
      status: "COMPLETED",
      notes: "输电线路巡检",
      hasPirep: true,
      pirepSeverity: "LOW",
    },
    {
      id: "fl-004",
      date: "2026-01-14",
      time: "16:45",
      aircraftId: "ac-003",
      aircraftRegistration: "B-7013U",
      pilotId: "p-004",
      pilotName: "赵六",
      copilotId: "p-002",
      copilotName: "李四",
      missionType: "TRAINING",
      takeoffLocation: "训练场",
      landingLocation: "训练场",
      duration: 28,
      flightDistance: 5.2,
      maxAltitude: 60,
      batteryStart: 92,
      batteryEnd: 55,
      status: "COMPLETED",
      notes: "新飞手训练",
      hasPirep: false,
    },
    {
      id: "fl-005",
      date: "2026-01-13",
      time: "11:30",
      aircraftId: "ac-002",
      aircraftRegistration: "B-7012U",
      pilotId: "p-003",
      pilotName: "王五",
      copilotId: null,
      copilotName: null,
      missionType: "AERIAL_PHOTO",
      takeoffLocation: "景区D",
      landingLocation: "景区D",
      duration: 35,
      flightDistance: 9.7,
      maxAltitude: 110,
      batteryStart: 96,
      batteryEnd: 30,
      status: "COMPLETED",
      notes: "景区航拍任务",
      hasPirep: false,
    },
    {
      id: "fl-006",
      date: "2026-01-13",
      time: "15:10",
      aircraftId: "ac-001",
      aircraftRegistration: "B-7011U",
      pilotId: "p-001",
      pilotName: "张三",
      copilotId: "p-004",
      copilotName: "赵六",
      missionType: "EMERGENCY",
      takeoffLocation: "基地A",
      landingLocation: "基地A",
      duration: 42,
      flightDistance: 11.2,
      maxAltitude: 100,
      batteryStart: 99,
      batteryEnd: 38,
      status: "COMPLETED",
      notes: "应急搜救任务",
      hasPirep: false,
    },
    {
      id: "fl-007",
      date: "2026-01-12",
      time: "10:00",
      aircraftId: "ac-003",
      aircraftRegistration: "B-7013U",
      pilotId: "p-002",
      pilotName: "李四",
      copilotId: null,
      copilotName: null,
      missionType: "DELIVERY",
      takeoffLocation: "配送中心",
      landingLocation: "配送点E",
      duration: 22,
      flightDistance: 6.8,
      maxAltitude: 70,
      batteryStart: 94,
      batteryEnd: 48,
      status: "ABORTED",
      notes: "货物配送，中途因风力过大中断返航",
      hasPirep: true,
      pirepSeverity: "MEDIUM",
    },
  ];

  // 筛选记录
  const filteredLogs = flightLogs.filter((log) => {
    // 搜索匹配
    const matchesSearch =
      searchQuery === "" ||
      log.aircraftRegistration.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.pilotName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.takeoffLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.landingLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.notes.toLowerCase().includes(searchQuery.toLowerCase());

    // 飞机筛选
    const matchesAircraft = selectedAircraft === "all" || log.aircraftId === selectedAircraft;

    // 飞手筛选
    const matchesPilot =
      selectedPilots.length === 0 ||
      selectedPilots.includes(log.pilotId) ||
      (log.copilotId && selectedPilots.includes(log.copilotId));

    // 任务类型筛选
    const matchesMissionType =
      selectedMissionTypes.length === 0 || selectedMissionTypes.includes(log.missionType);

    // 状态筛选
    const matchesStatus = selectedStatus === "all" || log.status === selectedStatus;

    // 时长筛选
    let matchesDuration = true;
    if (minDuration) {
      matchesDuration = matchesDuration && log.duration >= parseInt(minDuration);
    }
    if (maxDuration) {
      matchesDuration = matchesDuration && log.duration <= parseInt(maxDuration);
    }

    return (
      matchesSearch &&
      matchesAircraft &&
      matchesPilot &&
      matchesMissionType &&
      matchesStatus &&
      matchesDuration
    );
  });

  // 排序
  const sortedLogs = [...filteredLogs].sort((a, b) => {
    switch (sortBy) {
      case "date-desc":
        return new Date(b.date + " " + b.time).getTime() - new Date(a.date + " " + a.time).getTime();
      case "date-asc":
        return new Date(a.date + " " + a.time).getTime() - new Date(b.date + " " + b.time).getTime();
      case "duration-desc":
        return b.duration - a.duration;
      case "duration-asc":
        return a.duration - b.duration;
      default:
        return 0;
    }
  });

  // 统计
  const stats = {
    total: filteredLogs.length,
    totalDuration: filteredLogs.reduce((sum, log) => sum + log.duration, 0),
    totalDistance: filteredLogs.reduce((sum, log) => sum + log.flightDistance, 0),
    withPirep: filteredLogs.filter((log) => log.hasPirep).length,
  };

  // 清空筛选
  const clearFilters = () => {
    setDateRange("all");
    setSelectedAircraft("all");
    setSelectedPilots([]);
    setSelectedMissionTypes([]);
    setSelectedStatus("all");
    setMinDuration("");
    setMaxDuration("");
  };

  // 活跃筛选数量
  const activeFiltersCount =
    (selectedAircraft !== "all" ? 1 : 0) +
    selectedPilots.length +
    selectedMissionTypes.length +
    (selectedStatus !== "all" ? 1 : 0) +
    (minDuration ? 1 : 0) +
    (maxDuration ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">飞行记录搜索</h1>
          <p className="text-muted-foreground">
            按条件搜索和筛选飞行记录
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            导出
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索飞机号、飞手、起降地点或备注..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="relative"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              高级筛选
              {activeFiltersCount > 0 && (
                <Badge className="ml-2 h-5 px-1.5 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 日期范围 */}
                <div>
                  <Label className="text-sm text-muted-foreground">日期范围</Label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部</SelectItem>
                      {DATE_RANGE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 飞机 */}
                <div>
                  <Label className="text-sm text-muted-foreground">飞机</Label>
                  <Select value={selectedAircraft} onValueChange={setSelectedAircraft}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="全部飞机" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部飞机</SelectItem>
                      {aircraft.map((ac) => (
                        <SelectItem key={ac.id} value={ac.id}>
                          {ac.registration} - {ac.model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 状态 */}
                <div>
                  <Label className="text-sm text-muted-foreground">飞行状态</Label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="全部状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部状态</SelectItem>
                      {Object.entries(FLIGHT_STATUS).map(([key, { label }]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 飞手多选 */}
                <div>
                  <Label className="text-sm text-muted-foreground">飞手</Label>
                  <div className="mt-1 border rounded-md p-2 max-h-32 overflow-y-auto">
                    {pilots.map((pilot) => (
                      <div key={pilot.id} className="flex items-center space-x-2 py-1">
                        <Checkbox
                          id={`pilot-${pilot.id}`}
                          checked={selectedPilots.includes(pilot.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedPilots([...selectedPilots, pilot.id]);
                            } else {
                              setSelectedPilots(selectedPilots.filter((id) => id !== pilot.id));
                            }
                          }}
                        />
                        <Label htmlFor={`pilot-${pilot.id}`} className="text-sm cursor-pointer">
                          {pilot.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 任务类型多选 */}
                <div>
                  <Label className="text-sm text-muted-foreground">任务类型</Label>
                  <div className="mt-1 border rounded-md p-2 max-h-32 overflow-y-auto">
                    {Object.entries(MISSION_TYPES).map(([key, { label }]) => (
                      <div key={key} className="flex items-center space-x-2 py-1">
                        <Checkbox
                          id={`type-${key}`}
                          checked={selectedMissionTypes.includes(key)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedMissionTypes([...selectedMissionTypes, key]);
                            } else {
                              setSelectedMissionTypes(selectedMissionTypes.filter((t) => t !== key));
                            }
                          }}
                        />
                        <Label htmlFor={`type-${key}`} className="text-sm cursor-pointer">
                          {label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 飞行时长 */}
                <div>
                  <Label className="text-sm text-muted-foreground">飞行时长（分钟）</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Input
                      placeholder="最小"
                      type="number"
                      value={minDuration}
                      onChange={(e) => setMinDuration(e.target.value)}
                    />
                    <span className="text-muted-foreground">-</span>
                    <Input
                      placeholder="最大"
                      type="number"
                      value={maxDuration}
                      onChange={(e) => setMaxDuration(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex items-center justify-between pt-2">
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-1" />
                  清空筛选
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          找到 <span className="font-medium text-foreground">{filteredLogs.length}</span> 条记录
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-sm">排序:</Label>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="h-8 w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">最新优先</SelectItem>
              <SelectItem value="date-asc">最早优先</SelectItem>
              <SelectItem value="duration-desc">时长降序</SelectItem>
              <SelectItem value="duration-asc">时长升序</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              飞行次数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              总时长
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDuration} min</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              总里程
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDistance.toFixed(1)} km</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              故障报告
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.withPirep}</div>
          </CardContent>
        </Card>
      </div>

      {/* Flight Logs List */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {sortedLogs.map((log) => (
              <Link
                key={log.id}
                to={`/flight-logs/${log.id}`}
                className="block hover:bg-muted/50 transition-colors"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Date */}
                      <div className="text-center min-w-[60px]">
                        <div className="text-2xl font-bold text-slate-900">
                          {new Date(log.date).getDate()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(log.date).toLocaleDateString("zh-CN", { month: "short" })}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={MISSION_TYPES[log.missionType as keyof typeof MISSION_TYPES].color}>
                            {MISSION_TYPES[log.missionType as keyof typeof MISSION_TYPES].label}
                          </Badge>
                          <Badge className={FLIGHT_STATUS[log.status as keyof typeof FLIGHT_STATUS].color}>
                            {FLIGHT_STATUS[log.status as keyof typeof FLIGHT_STATUS].label}
                          </Badge>
                          {log.hasPirep && (
                            <Badge variant="outline" className="text-red-600 border-red-600">
                              有故障报告
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <span className="flex items-center gap-1">
                            <Plane className="h-3.5 w-3.5" />
                            <Link
                              to={`/aircraft/${log.aircraftId}`}
                              className="text-primary hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {log.aircraftRegistration}
                            </Link>
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5" />
                            {log.pilotName}
                            {log.copilotName && ` + ${log.copilotName}`}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {log.date} {log.time}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            {log.takeoffLocation} → {log.landingLocation}
                          </span>
                          <span className="text-muted-foreground">
                            {log.duration}分钟 · {log.flightDistance}km
                          </span>
                        </div>

                        {log.notes && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-1">
                            {log.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Battery Indicator */}
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">电量</div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{log.batteryEnd}%</span>
                        <span className="text-muted-foreground">/ {log.batteryStart}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Empty State */}
          {sortedLogs.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">未找到匹配的飞行记录</h3>
              <p className="text-muted-foreground">
                尝试调整搜索条件或清空筛选器
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
