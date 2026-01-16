import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Plane,
  Clock,
  MapPin,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Calendar,
  Download,
  User,
  ArrowUp,
  ArrowDown,
  Minus,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

// 时间范围选项
const TIME_RANGES = [
  { value: "7days", label: "最近7天" },
  { value: "30days", label: "最近30天" },
  { value: "90days", label: "最近90天" },
  { value: "thisYear", label: "今年" },
  { value: "lastYear", label: "去年" },
  { value: "all", label: "全部" },
];

// 任务类型
const MISSION_TYPES = {
  TRAINING: { label: "训练飞行", color: "bg-blue-500" },
  PATROL: { label: "巡逻任务", color: "bg-green-500" },
  SURVEY: { label: "测绘任务", color: "bg-purple-500" },
  DELIVERY: { label: "物流配送", color: "bg-orange-500" },
  INSPECTION: { label: "巡检任务", color: "bg-cyan-500" },
  AERIAL_PHOTO: { label: "航拍", color: "bg-pink-500" },
  EMERGENCY: { label: "应急任务", color: "bg-red-500" },
};

/**
 * 飞行统计页面
 */
export function FlightStatsPage() {
  const [timeRange, setTimeRange] = useState("30days");
  const [selectedAircraft, setSelectedAircraft] = useState<string>("all");

  // 飞机列表
  const aircraft = [
    { id: "all", registration: "全部飞机", model: "" },
    { id: "ac-001", registration: "B-7011U", model: "DJI M350 RTK" },
    { id: "ac-002", registration: "B-7012U", model: "Autel Evo II" },
    { id: "ac-003", registration: "B-7013U", model: "DJI Mavic 3" },
  ];

  // 汇总统计数据
  const summaryStats = {
    totalFlights: 156,
    totalHours: 128.5,
    totalDistance: 1856.3,
    avgFlightDuration: 49.4,
    changeFlights: 12, // +12%
    changeHours: 8, // +8%
    changeDistance: 15, // +15%
  };

  // 飞机飞行统计
  const aircraftStats = [
    {
      id: "ac-001",
      registration: "B-7011U",
      model: "DJI M350 RTK",
      flights: 68,
      hours: 56.8,
      distance: 823.5,
      avgDuration: 50.1,
      change: 5,
    },
    {
      id: "ac-002",
      registration: "B-7012U",
      model: "Autel Evo II",
      flights: 52,
      hours: 42.3,
      distance: 612.8,
      avgDuration: 48.8,
      change: -3,
    },
    {
      id: "ac-003",
      registration: "B-7013U",
      model: "DJI Mavic 3",
      flights: 36,
      hours: 29.4,
      distance: 420.0,
      avgDuration: 49.0,
      change: 10,
    },
  ];

  // 飞手飞行统计
  const pilotStats = [
    {
      id: "p-001",
      name: "张三",
      flights: 72,
      hours: 58.5,
      distance: 856.2,
      avgDuration: 48.8,
    },
    {
      id: "p-002",
      name: "李四",
      flights: 45,
      hours: 38.2,
      distance: 523.8,
      avgDuration: 50.9,
    },
    {
      id: "p-003",
      name: "王五",
      flights: 28,
      hours: 23.1,
      distance: 312.5,
      avgDuration: 49.5,
    },
    {
      id: "p-004",
      name: "赵六",
      flights: 11,
      hours: 8.7,
      distance: 163.8,
      avgDuration: 47.5,
    },
  ];

  // 任务类型分布
  const missionTypeStats = [
    { type: "PATROL", count: 48, hours: 38.5, percentage: 31 },
    { type: "INSPECTION", count: 36, hours: 29.2, percentage: 23 },
    { type: "SURVEY", count: 28, hours: 24.8, percentage: 18 },
    { type: "TRAINING", count: 22, hours: 17.5, percentage: 14 },
    { type: "AERIAL_PHOTO", count: 12, hours: 9.8, percentage: 8 },
    { type: "DELIVERY", count: 8, hours: 6.2, percentage: 5 },
    { type: "EMERGENCY", count: 2, hours: 2.5, percentage: 1 },
  ];

  // 热门起降地点
  const topLocations = [
    { name: "基地A", flights: 45, percentage: 29 },
    { name: "测区B", flights: 32, percentage: 21 },
    { name: "基站C", flights: 28, percentage: 18 },
    { name: "训练场", flights: 24, percentage: 15 },
    { name: "景区D", flights: 15, percentage: 10 },
    { name: "其他", flights: 12, percentage: 7 },
  ];

  // 趋势数据（按周）
  const weeklyTrends = [
    { week: "第1周", flights: 28, hours: 22.5 },
    { week: "第2周", flights: 35, hours: 28.8 },
    { week: "第3周", flights: 42, hours: 35.2 },
    { week: "第4周", flights: 51, hours: 42.0 },
  ];

  // 变化指示器
  const ChangeIndicator = ({ value }: { value: number }) => {
    if (value > 0) {
      return (
        <span className="flex items-center text-green-600 text-sm">
          <ArrowUp className="h-3 w-3 mr-1" />
          {value}%
        </span>
      );
    } else if (value < 0) {
      return (
        <span className="flex items-center text-red-600 text-sm">
          <ArrowDown className="h-3 w-3 mr-1" />
          {Math.abs(value)}%
        </span>
      );
    }
    return (
      <span className="flex items-center text-muted-foreground text-sm">
        <Minus className="h-3 w-3 mr-1" />
        0%
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">飞行统计</h1>
          <p className="text-muted-foreground">
            飞行活动数据分析和趋势
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            导出报告
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">时间范围:</span>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_RANGES.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">飞机:</span>
              <Select value={selectedAircraft} onValueChange={setSelectedAircraft}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {aircraft.map((ac) => (
                    <SelectItem key={ac.id} value={ac.id}>
                      {ac.registration} {ac.model && `- ${ac.model}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Plane className="h-4 w-4" />
              总飞行次数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold">{summaryStats.totalFlights}</div>
              <ChangeIndicator value={summaryStats.changeFlights} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              架次
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              总飞行时长
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold">{summaryStats.totalHours}</div>
              <ChangeIndicator value={summaryStats.changeHours} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              小时
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              总飞行里程
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold">{summaryStats.totalDistance}</div>
              <ChangeIndicator value={summaryStats.changeDistance} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              公里
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              平均飞行时长
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.avgFlightDuration}</div>
            <p className="text-xs text-muted-foreground mt-1">
              分钟/架次
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Aircraft Stats */}
      <Card>
        <CardHeader>
          <CardTitle>飞机飞行统计</CardTitle>
          <CardDescription>
            各飞机的飞行活动统计
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {aircraftStats.map((stat) => (
              <div key={stat.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Link
                      to={`/aircraft/${stat.id}`}
                      className="font-medium hover:text-primary"
                    >
                      {stat.registration}
                    </Link>
                    <span className="text-sm text-muted-foreground">{stat.model}</span>
                  </div>
                  <ChangeIndicator value={stat.change} />
                </div>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">飞行次数</p>
                    <p className="font-medium">{stat.flights} 次</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">飞行时长</p>
                    <p className="font-medium">{stat.hours} h</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">飞行里程</p>
                    <p className="font-medium">{stat.distance} km</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">平均时长</p>
                    <p className="font-medium">{stat.avgDuration} min</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pilot Stats */}
      <Card>
        <CardHeader>
          <CardTitle>飞手飞行统计</CardTitle>
          <CardDescription>
            飞手飞行活动排名
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    排名
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    飞手
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">
                    飞行次数
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">
                    飞行时长
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">
                    飞行里程
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">
                    平均时长
                  </th>
                </tr>
              </thead>
              <tbody>
                {pilotStats.map((pilot, index) => (
                  <tr key={pilot.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                        index === 0 ? "bg-yellow-100 text-yellow-700" :
                        index === 1 ? "bg-slate-100 text-slate-700" :
                        index === 2 ? "bg-orange-100 text-orange-700" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{pilot.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-medium">{pilot.flights}</td>
                    <td className="py-3 px-4 text-right font-medium">{pilot.hours} h</td>
                    <td className="py-3 px-4 text-right font-medium">{pilot.distance} km</td>
                    <td className="py-3 px-4 text-right text-muted-foreground">{pilot.avgDuration} min</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Mission Types and Locations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mission Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>任务类型分布</CardTitle>
            <CardDescription>
              各类型任务的飞行次数和时长
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {missionTypeStats.map((stat) => (
                <div key={stat.type} className="flex items-center gap-3">
                  <div
                    className={`h-3 w-3 rounded-full ${MISSION_TYPES[stat.type as keyof typeof MISSION_TYPES].color}`}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">{MISSION_TYPES[stat.type as keyof typeof MISSION_TYPES].label}</span>
                      <span className="text-sm text-muted-foreground">{stat.count}次 / {stat.hours}h</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${MISSION_TYPES[stat.type as keyof typeof MISSION_TYPES].color} rounded-full`}
                        style={{ width: `${stat.percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground w-10 text-right">{stat.percentage}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Locations */}
        <Card>
          <CardHeader>
            <CardTitle>热门起降地点</CardTitle>
            <CardDescription>
              飞行活动最频繁的地点
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topLocations.map((location, index) => (
                <div key={location.name} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-medium ${
                    index === 0 ? "bg-yellow-100 text-yellow-700" :
                    index === 1 ? "bg-slate-100 text-slate-700" :
                    index === 2 ? "bg-orange-100 text-orange-700" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">{location.name}</span>
                      <span className="text-sm text-muted-foreground">{location.flights}次</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${location.percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground w-10 text-right">{location.percentage}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Trends */}
      <Card>
        <CardHeader>
          <CardTitle>周趋势</CardTitle>
          <CardDescription>
            按周统计的飞行活动趋势
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {weeklyTrends.map((week, index) => {
              const maxFlights = Math.max(...weeklyTrends.map((w) => w.flights));
              const maxHours = Math.max(...weeklyTrends.map((w) => w.hours));
              const flightsWidth = (week.flights / maxFlights) * 100;
              const hoursWidth = (week.hours / maxHours) * 100;

              return (
                <div key={week.week} className="border-b last:border-0 pb-4 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{week.week}</span>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{week.flights} 次</span>
                      <span>{week.hours} h</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-8">架次</span>
                      <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${flightsWidth}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-8">时长</span>
                      <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${hoursWidth}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
