import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Plane,
  Wrench,
  Filter,
  Plus,
  CalendarDays,
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
import { Dialog, DialogContent } from "../components/ui/dialog";

// 优先级颜色
const PRIORITY_COLORS = {
  CRITICAL: "bg-red-500",
  HIGH: "bg-orange-500",
  MEDIUM: "bg-yellow-500",
  LOW: "bg-slate-400",
};

// 状态颜色
const STATUS_COLORS = {
  PENDING: "border-slate-300 bg-slate-50",
  IN_PROGRESS: "border-blue-300 bg-blue-50",
  INSPECTION_REQUIRED: "border-yellow-300 bg-yellow-50",
  COMPLETED: "border-green-300 bg-green-50",
};

/**
 * 维保任务日历页面
 */
export function MaintenanceCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 16)); // 2026年1月16日
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const [selectedAircraft, setSelectedAircraft] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  // 飞机列表
  const aircraft = [
    { id: "all", registration: "全部飞机" },
    { id: "ac-001", registration: "B-7011U", model: "DJI M350 RTK" },
    { id: "ac-002", registration: "B-7012U", model: "Autel Evo II" },
    { id: "ac-003", registration: "B-7013U", model: "DJI Mavic 3" },
  ];

  // Mock 维保任务数据
  const maintenanceTasks = [
    {
      id: "wo-001",
      workOrderNumber: "WO-2026-0116",
      title: "电机定期检查",
      aircraftRegistration: "B-7011U",
      aircraftId: "ac-001",
      date: "2026-01-16",
      startTime: "09:00",
      endTime: "11:00",
      priority: "HIGH",
      status: "IN_PROGRESS",
      type: "SCHEDULED",
      estimatedHours: 2,
    },
    {
      id: "wo-002",
      workOrderNumber: "WO-2026-0117",
      title: "螺旋桨更换",
      aircraftRegistration: "B-7011U",
      aircraftId: "ac-001",
      date: "2026-01-17",
      startTime: "14:00",
      endTime: "17:00",
      priority: "MEDIUM",
      status: "PENDING",
      type: "SCHEDULED",
      estimatedHours: 3,
    },
    {
      id: "wo-003",
      workOrderNumber: "WO-2026-0118",
      title: "180天日历检查",
      aircraftRegistration: "B-7012U",
      aircraftId: "ac-002",
      date: "2026-01-18",
      startTime: "08:00",
      endTime: "16:00",
      priority: "HIGH",
      status: "PENDING",
      type: "SCHEDULED",
      estimatedHours: 8,
    },
    {
      id: "wo-004",
      workOrderNumber: "WO-2026-0119",
      title: "GPS故障维修",
      aircraftRegistration: "B-7012U",
      aircraftId: "ac-002",
      date: "2026-01-19",
      startTime: "10:00",
      endTime: "14:00",
      priority: "CRITICAL",
      status: "PENDING",
      type: "UNSCHEDULED",
      estimatedHours: 4,
    },
    {
      id: "wo-005",
      workOrderNumber: "WO-2026-0120",
      title: "电池包更换",
      aircraftRegistration: "B-7013U",
      aircraftId: "ac-003",
      date: "2026-01-20",
      startTime: "09:00",
      endTime: "10:00",
      priority: "MEDIUM",
      status: "PENDING",
      type: "SCHEDULED",
      estimatedHours: 1,
    },
    {
      id: "wo-006",
      workOrderNumber: "WO-2026-0121",
      title: "飞控校准",
      aircraftRegistration: "B-7013U",
      aircraftId: "ac-003",
      date: "2026-01-21",
      startTime: "13:00",
      endTime: "15:00",
      priority: "LOW",
      status: "PENDING",
      type: "SCHEDULED",
      estimatedHours: 2,
    },
    {
      id: "wo-007",
      workOrderNumber: "WO-2026-0122",
      title: "机架紧固检查",
      aircraftRegistration: "B-7011U",
      aircraftId: "ac-001",
      date: "2026-01-22",
      startTime: "10:00",
      endTime: "12:00",
      priority: "LOW",
      status: "PENDING",
      type: "SCHEDULED",
      estimatedHours: 2,
    },
    {
      id: "wo-008",
      workOrderNumber: "WO-2026-0115",
      title: "电机大修",
      aircraftRegistration: "B-7012U",
      aircraftId: "ac-002",
      date: "2026-01-15",
      startTime: "08:00",
      endTime: "18:00",
      priority: "HIGH",
      status: "COMPLETED",
      type: "SCHEDULED",
      estimatedHours: 10,
    },
    {
      id: "wo-009",
      workOrderNumber: "WO-2026-0123",
      title: "图传检查",
      aircraftRegistration: "B-7013U",
      aircraftId: "ac-003",
      date: "2026-01-23",
      startTime: "14:00",
      endTime: "16:00",
      priority: "MEDIUM",
      status: "PENDING",
      type: "SCHEDULED",
      estimatedHours: 2,
    },
    {
      id: "wo-010",
      workOrderNumber: "WO-2026-0124",
      title: "云台校准",
      aircraftRegistration: "B-7011U",
      aircraftId: "ac-001",
      date: "2026-01-24",
      startTime: "10:00",
      endTime: "11:00",
      priority: "LOW",
      status: "PENDING",
      type: "SCHEDULED",
      estimatedHours: 1,
    },
  ];

  // 筛选任务
  const filteredTasks = maintenanceTasks.filter((task) => {
    return selectedAircraft === "all" || task.aircraftId === selectedAircraft;
  });

  // 按日期分组任务
  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return filteredTasks.filter((task) => task.date === dateStr);
  };

  // 生成日历
  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDay.getDay(); // 0-6
    const daysInMonth = lastDay.getDate();

    const calendar = [];
    let week = [];

    // 填充月初空白
    for (let i = 0; i < startDayOfWeek; i++) {
      week.push(null);
    }

    // 填充日期
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      week.push(date);

      if (week.length === 7) {
        calendar.push(week);
        week = [];
      }
    }

    // 填充月末空白
    while (week.length < 7) {
      week.push(null);
    }
    if (week.some((d) => d !== null)) {
      calendar.push(week);
    }

    return calendar;
  };

  // 导航到上一个月
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // 导航到下一个月
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // 回到今天
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // 获取月份名称
  const monthNames = [
    "一月", "二月", "三月", "四月", "五月", "六月",
    "七月", "八月", "九月", "十月", "十一月", "十二月"
  ];

  // 星期标题
  const weekDays = ["日", "一", "二", "三", "四", "五", "六"];

  // 统计
  const stats = {
    total: filteredTasks.filter((t) => t.status !== "COMPLETED").length,
    critical: filteredTasks.filter((t) => t.priority === "CRITICAL" && t.status !== "COMPLETED").length,
    thisMonth: filteredTasks.filter((t) => {
      const taskDate = new Date(t.date);
      return taskDate.getMonth() === currentDate.getMonth() && taskDate.getFullYear() === currentDate.getFullYear();
    }).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">维保日历</h1>
          <p className="text-muted-foreground">
            维保计划日历视图
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={goToToday}>
            <CalendarDays className="w-4 h-4 mr-2" />
            今天
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            新建任务
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              本月任务
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisMonth}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              待处理
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              紧急任务
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Plane className="h-4 w-4 text-muted-foreground" />
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
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">优先级:</span>
              <div className="flex items-center gap-1">
                <div className={`h-3 w-3 rounded-full ${PRIORITY_COLORS.CRITICAL}`} />
                <span className="text-xs">紧急</span>
              </div>
              <div className="flex items-center gap-1">
                <div className={`h-3 w-3 rounded-full ${PRIORITY_COLORS.HIGH}`} />
                <span className="text-xs">高</span>
              </div>
              <div className="flex items-center gap-1">
                <div className={`h-3 w-3 rounded-full ${PRIORITY_COLORS.MEDIUM}`} />
                <span className="text-xs">中</span>
              </div>
              <div className="flex items-center gap-1">
                <div className={`h-3 w-3 rounded-full ${PRIORITY_COLORS.LOW}`} />
                <span className="text-xs">低</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold">
                {currentDate.getFullYear()}年 {monthNames[currentDate.getMonth()]}
              </h2>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Week Days */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {generateCalendar().flat().map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="h-32 bg-slate-50/50" />;
              }

              const tasks = getTasksForDate(date);
              const isToday = date.toDateString() === new Date().toDateString();
              const isCurrentMonth = date.getMonth() === currentDate.getMonth();

              return (
                <div
                  key={index}
                  className={`h-32 border rounded-lg p-2 overflow-hidden ${
                    isToday ? "border-blue-500 bg-blue-50/30" : "border-slate-200"
                  } ${!isCurrentMonth ? "opacity-50" : ""}`}
                >
                  <div className={`text-sm font-medium mb-1 ${isToday ? "text-blue-600" : ""}`}>
                    {date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {tasks.slice(0, 3).map((task) => (
                      <div
                        key={task.id}
                        className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 truncate border ${
                          STATUS_COLORS[task.status as keyof typeof STATUS_COLORS]
                        }`}
                        onClick={() => setSelectedTask(task)}
                      >
                        <div className="flex items-center gap-1">
                          <div className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS]}`} />
                          <span className="truncate flex-1">{task.aircraftRegistration}</span>
                        </div>
                      </div>
                    ))}
                    {tasks.length > 3 && (
                      <div className="text-xs text-muted-foreground text-center">
                        +{tasks.length - 3} 更多
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>即将到期</CardTitle>
          <CardDescription>
            未来7天内的维保任务
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredTasks
              .filter((t) => t.status !== "COMPLETED")
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .slice(0, 5)
              .map((task) => (
                <Link
                  key={task.id}
                  to={`/work-orders/${task.id}`}
                  className="block hover:bg-muted/50 rounded-lg p-3 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS]}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{task.title}</span>
                        <Badge variant="outline" className="text-xs">{task.aircraftRegistration}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CalendarIcon className="h-3 w-3" />
                        <span>{task.date}</span>
                        <Clock className="h-3 w-3" />
                        <span>{task.startTime} - {task.endTime}</span>
                        <span>·</span>
                        <span>{task.estimatedHours} 小时</span>
                      </div>
                    </div>
                    {task.priority === "CRITICAL" && (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </Link>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Task Detail Dialog */}
      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent>
          {selectedTask && (
            <>
              <div className="flex items-center gap-2 mb-4">
                <div className={`h-3 w-3 rounded-full ${PRIORITY_COLORS[selectedTask.priority as keyof typeof PRIORITY_COLORS]}`} />
                <Badge className={
                  selectedTask.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                  selectedTask.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-700" :
                  "bg-slate-100 text-slate-700"
                }>
                  {selectedTask.status === "COMPLETED" ? "已完成" :
                   selectedTask.status === "IN_PROGRESS" ? "进行中" : "待处理"}
                </Badge>
              </div>
              <h3 className="text-lg font-semibold mb-2">{selectedTask.title}</h3>
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  工单号: <span className="font-mono">{selectedTask.workOrderNumber}</span>
                </p>
                <p className="text-muted-foreground">
                  飞机: <Link to={`/aircraft/${selectedTask.aircraftId}`} className="text-primary hover:underline">{selectedTask.aircraftRegistration}</Link>
                </p>
                <p className="text-muted-foreground">
                  日期: {selectedTask.date} {selectedTask.startTime} - {selectedTask.endTime}
                </p>
                <p className="text-muted-foreground">
                  预计工时: {selectedTask.estimatedHours} 小时
                </p>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setSelectedTask(null)}>
                  关闭
                </Button>
                <Button asChild>
                  <Link to={`/work-orders/${selectedTask.id}`}>查看详情</Link>
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
