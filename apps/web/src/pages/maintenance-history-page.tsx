import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  Calendar,
  Clock,
  CheckCircle2,
  Wrench,
  Plane,
  User,
  FileText,
  ChevronDown,
  Download,
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

// 工单状态
const WORK_ORDER_STATUS = {
  COMPLETED: { label: "已完成", color: "bg-green-100 text-green-700" },
  CANCELLED: { label: "已取消", color: "bg-red-100 text-red-700" },
};

// 工单类型
const WORK_ORDER_TYPES = {
  SCHEDULED: { label: "计划性", color: "bg-purple-50 text-purple-700" },
  UNSCHEDULED: { label: "非计划性", color: "bg-orange-50 text-orange-700" },
  EMERGENCY: { label: "紧急", color: "bg-red-50 text-red-700" },
};

// 维保类别
const MAINTENANCE_CATEGORIES = {
  ROUTINE: { label: "例行维保", color: "bg-blue-100 text-blue-700" },
  CORRECTIVE: { label: " corrective", color: "bg-orange-100 text-orange-700" },
  PREVENTIVE: { label: "预防性", color: "bg-green-100 text-green-700" },
  OVERHAUL: { label: "大修", color: "bg-purple-100 text-purple-700" },
  MODIFICATION: { label: "改装", color: "bg-cyan-100 text-cyan-700" },
};

// 时间范围选项
const TIME_RANGE_OPTIONS = [
  { value: "30days", label: "最近30天" },
  { value: "90days", label: "最近90天" },
  { value: "6months", label: "最近6个月" },
  { value: "1year", label: "最近1年" },
  { value: "custom", label: "自定义" },
];

/**
 * 维保历史页面
 */
export function MaintenanceHistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [timeRange, setTimeRange] = useState("90days");
  const [selectedAircraft, setSelectedAircraft] = useState<string>("all");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  // 飞机列表
  const aircraft = [
    { id: "all", registration: "全部飞机", model: "" },
    { id: "ac-001", registration: "B-7011U", model: "DJI M350 RTK" },
    { id: "ac-002", registration: "B-7012U", model: "Autel Evo II" },
    { id: "ac-003", registration: "B-7013U", model: "DJI Mavic 3" },
  ];

  // 维保历史记录
  const maintenanceRecords = [
    {
      id: "wo-001",
      workOrderNumber: "WO-2026-0110",
      title: "电机定期检查",
      description: "每50飞行小时检查电机状态，测试电机转速和温度",
      type: "SCHEDULED",
      category: "ROUTINE",
      status: "COMPLETED",
      aircraftId: "ac-001",
      aircraftRegistration: "B-7011U",
      completedAt: "2026-01-14",
      completedBy: "张维修",
      inspectedBy: "王检验",
      estimatedHours: 2,
      actualHours: 2.5,
      taskCount: 5,
      completedTasks: 5,
      partsUsed: [
        { name: "润滑脂", quantity: 1, unit: "支" },
        { name: "垫片", quantity: 4, unit: "个" },
      ],
      notes: "电机运转正常，无明显磨损",
    },
    {
      id: "wo-002",
      workOrderNumber: "WO-2026-0108",
      title: "螺旋桨更换",
      description: "更换4片螺旋桨，进行动平衡测试",
      type: "SCHEDULED",
      category: "PREVENTIVE",
      status: "COMPLETED",
      aircraftId: "ac-001",
      aircraftRegistration: "B-7011U",
      completedAt: "2026-01-12",
      completedBy: "李维修",
      inspectedBy: "王检验",
      estimatedHours: 3,
      actualHours: 3.5,
      taskCount: 8,
      completedTasks: 8,
      partsUsed: [
        { name: "螺旋桨 29x9.5", quantity: 4, unit: "片" },
      ],
      notes: "新螺旋桨动平衡测试通过",
    },
    {
      id: "wo-003",
      workOrderNumber: "WO-2026-0105",
      title: "GPS故障维修",
      description: "GPS模块无信号，检查并更换GPS模块",
      type: "UNSCHEDULED",
      category: "CORRECTIVE",
      status: "COMPLETED",
      aircraftId: "ac-002",
      aircraftRegistration: "B-7012U",
      completedAt: "2026-01-10",
      completedBy: "张维修",
      inspectedBy: "王检验",
      estimatedHours: 3,
      actualHours: 4,
      taskCount: 6,
      completedTasks: 6,
      partsUsed: [
        { name: "GPS模块", quantity: 1, unit: "个" },
      ],
      notes: "GPS天线损坏，已更换新模块",
    },
    {
      id: "wo-004",
      workOrderNumber: "WO-2026-0102",
      title: "电池包更换",
      description: "电池循环接近300次，更换电池包",
      type: "SCHEDULED",
      category: "ROUTINE",
      status: "COMPLETED",
      aircraftId: "ac-002",
      aircraftRegistration: "B-7012U",
      completedAt: "2026-01-08",
      completedBy: "李维修",
      inspectedBy: "王检验",
      estimatedHours: 1,
      actualHours: 1.2,
      taskCount: 3,
      completedTasks: 3,
      partsUsed: [
        { name: "电池包 16000mAh", quantity: 1, unit: "个" },
      ],
      notes: "电池性能正常退役",
    },
    {
      id: "wo-005",
      workOrderNumber: "WO-2026-0098",
      title: "180天日历检查",
      description: "每180天进行的全面检查，包括所有系统",
      type: "SCHEDULED",
      category: "ROUTINE",
      status: "COMPLETED",
      aircraftId: "ac-003",
      aircraftRegistration: "B-7013U",
      completedAt: "2026-01-05",
      completedBy: "张维修",
      inspectedBy: "王检验",
      estimatedHours: 8,
      actualHours: 9,
      taskCount: 20,
      completedTasks: 20,
      partsUsed: [
        { name: "紧固件套装", quantity: 1, unit: "套" },
        { name: "润滑脂", quantity: 2, unit: "支" },
      ],
      notes: "全面检查完成，所有系统正常",
    },
    {
      id: "wo-006",
      workOrderNumber: "WO-2025-0095",
      title: "飞控软件升级",
      description: "升级飞控固件到最新版本V3.2.1",
      type: "SCHEDULED",
      category: "MODIFICATION",
      status: "COMPLETED",
      aircraftId: "ac-001",
      aircraftRegistration: "B-7011U",
      completedAt: "2025-12-28",
      completedBy: "李维修",
      inspectedBy: "王检验",
      estimatedHours: 1.5,
      actualHours: 2,
      taskCount: 4,
      completedTasks: 4,
      partsUsed: [],
      notes: "固件升级成功，功能测试正常",
    },
    {
      id: "wo-007",
      workOrderNumber: "WO-2025-0092",
      title: "电机大修",
      description: "电机运行时间超过500小时，进行大修",
      type: "SCHEDULED",
      category: "OVERHAUL",
      status: "COMPLETED",
      aircraftId: "ac-002",
      aircraftRegistration: "B-7012U",
      completedAt: "2025-12-20",
      completedBy: "张维修",
      inspectedBy: "王检验",
      estimatedHours: 12,
      actualHours: 14,
      taskCount: 15,
      completedTasks: 15,
      partsUsed: [
        { name: "轴承套装", quantity: 2, unit: "套" },
        { name: "线圈", quantity: 1, unit: "个" },
        { name: "电机盖", quantity: 1, unit: "个" },
      ],
      notes: "电机大修完成，各项指标正常",
    },
    {
      id: "wo-008",
      workOrderNumber: "WO-2025-0088",
      title: "机架裂纹修复",
      description: "巡检发现机架有轻微裂纹，进行修复",
      type: "UNSCHEDULED",
      category: "CORRECTIVE",
      status: "CANCELLED",
      aircraftId: "ac-003",
      aircraftRegistration: "B-7013U",
      completedAt: "2025-12-15",
      completedBy: null,
      inspectedBy: null,
      estimatedHours: 4,
      actualHours: 0,
      taskCount: 5,
      completedTasks: 0,
      partsUsed: [],
      notes: "评估后决定更换整机架，取消单独修复",
    },
  ];

  // 筛选记录
  const filteredRecords = maintenanceRecords.filter((record) => {
    const matchesSearch =
      searchQuery === "" ||
      record.workOrderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.aircraftRegistration.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAircraft = selectedAircraft === "all" || record.aircraftId === selectedAircraft;
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(record.type);
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(record.category);

    return matchesSearch && matchesAircraft && matchesType && matchesCategory;
  });

  // 统计
  const stats = {
    total: filteredRecords.length,
    completed: filteredRecords.filter((r) => r.status === "COMPLETED").length,
    totalHours: filteredRecords.reduce((sum, r) => sum + (r.actualHours || 0), 0),
    partsUsed: filteredRecords.reduce((sum, r) => sum + r.partsUsed.length, 0),
  };

  // 查看详情
  const viewDetail = (record: typeof maintenanceRecords[0]) => {
    setSelectedRecord(record);
    setShowDetailDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">维保历史</h1>
          <p className="text-muted-foreground">
            历史维保记录查询和分析
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            导出记录
          </Button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索工单号、标题、飞机或描述..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_RANGE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              筛选
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 飞机筛选 */}
                <div>
                  <Label className="text-sm text-muted-foreground">飞机</Label>
                  <Select value={selectedAircraft} onValueChange={setSelectedAircraft}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="全部飞机" />
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

                {/* 类型筛选 */}
                <div>
                  <Label className="text-sm text-muted-foreground">工单类型</Label>
                  <div className="mt-1 border rounded-md p-2">
                    {Object.entries(WORK_ORDER_TYPES).map(([key, { label }]) => (
                      <div key={key} className="flex items-center space-x-2 py-1">
                        <Checkbox
                          id={`type-${key}`}
                          checked={selectedTypes.includes(key)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedTypes([...selectedTypes, key]);
                            } else {
                              setSelectedTypes(selectedTypes.filter((t) => t !== key));
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

                {/* 类别筛选 */}
                <div>
                  <Label className="text-sm text-muted-foreground">维保类别</Label>
                  <div className="mt-1 border rounded-md p-2">
                    {Object.entries(MAINTENANCE_CATEGORIES).map(([key, { label }]) => (
                      <div key={key} className="flex items-center space-x-2 py-1">
                        <Checkbox
                          id={`category-${key}`}
                          checked={selectedCategories.includes(key)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedCategories([...selectedCategories, key]);
                            } else {
                              setSelectedCategories(selectedCategories.filter((c) => c !== key));
                            }
                          }}
                        />
                        <Label htmlFor={`category-${key}`} className="text-sm cursor-pointer">
                          {label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              维保记录
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">条</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              已完成
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              总工时
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHours}</div>
            <p className="text-xs text-muted-foreground mt-1">小时</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              消耗零件
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.partsUsed}</div>
            <p className="text-xs text-muted-foreground mt-1">项</p>
          </CardContent>
        </Card>
      </div>

      {/* Records List */}
      <Card>
        <CardHeader>
          <CardTitle>维保记录</CardTitle>
          <CardDescription>
            共 {filteredRecords.length} 条记录
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredRecords.map((record) => (
              <div
                key={record.id}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => viewDetail(record)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Status Icon */}
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      record.status === "COMPLETED" ? "bg-green-100" : "bg-red-100"
                    }`}>
                      {record.status === "COMPLETED" ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <Wrench className="h-5 w-5 text-red-600" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-mono text-sm text-primary">
                          {record.workOrderNumber}
                        </span>
                        <Badge className={WORK_ORDER_STATUS[record.status as keyof typeof WORK_ORDER_STATUS].color}>
                          {WORK_ORDER_STATUS[record.status as keyof typeof WORK_ORDER_STATUS].label}
                        </Badge>
                        <Badge className={WORK_ORDER_TYPES[record.type as keyof typeof WORK_ORDER_TYPES].color}>
                          {WORK_ORDER_TYPES[record.type as keyof typeof WORK_ORDER_TYPES].label}
                        </Badge>
                        <Badge className={MAINTENANCE_CATEGORIES[record.category as keyof typeof MAINTENANCE_CATEGORIES].color}>
                          {MAINTENANCE_CATEGORIES[record.category as keyof typeof MAINTENANCE_CATEGORIES].label}
                        </Badge>
                      </div>

                      <h3 className="font-medium text-sm mb-1">{record.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                        {record.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Plane className="h-3.5 w-3.5" />
                          <Link
                            to={`/aircraft/${record.aircraftId}`}
                            className="text-primary hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {record.aircraftRegistration}
                          </Link>
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          完成于 {record.completedAt}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {record.actualHours || record.estimatedHours}h
                        </span>
                        {record.completedBy && (
                          <span className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5" />
                            {record.completedBy}
                          </span>
                        )}
                      </div>

                      {/* Parts Used */}
                      {record.partsUsed.length > 0 && (
                        <div className="mt-2 flex items-center gap-2">
                          <FileText className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            使用零件: {record.partsUsed.map((p) => p.name).join("、")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredRecords.length === 0 && (
            <div className="text-center py-12">
              <Wrench className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">未找到维保记录</h3>
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
            <DialogTitle>维保记录详情</DialogTitle>
            <DialogDescription>
              {selectedRecord?.workOrderNumber}
            </DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">工单标题</Label>
                  <p className="font-medium">{selectedRecord.title}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">状态</Label>
                  <p className="font-medium">
                    <Badge className={WORK_ORDER_STATUS[selectedRecord.status as keyof typeof WORK_ORDER_STATUS].color}>
                      {WORK_ORDER_STATUS[selectedRecord.status as keyof typeof WORK_ORDER_STATUS].label}
                    </Badge>
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">飞机</Label>
                  <p className="font-medium">{selectedRecord.aircraftRegistration}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">完成日期</Label>
                  <p className="font-medium">{selectedRecord.completedAt}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">执行人</Label>
                  <p className="font-medium">{selectedRecord.completedBy || "未执行"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">检验人</Label>
                  <p className="font-medium">{selectedRecord.inspectedBy || "未检验"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">预计工时</Label>
                  <p className="font-medium">{selectedRecord.estimatedHours} h</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">实际工时</Label>
                  <p className="font-medium">{selectedRecord.actualHours || selectedRecord.estimatedHours} h</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">描述</Label>
                <p className="text-sm mt-1">{selectedRecord.description}</p>
              </div>
              {selectedRecord.partsUsed.length > 0 && (
                <div>
                  <Label className="text-muted-foreground">使用零件</Label>
                  <div className="mt-2 space-y-1">
                    {selectedRecord.partsUsed.map((part: any, index: number) => (
                      <div key={index} className="text-sm flex items-center gap-2">
                        <span>•</span>
                        <span>{part.name}</span>
                        <Badge variant="outline">{part.quantity} {part.unit}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selectedRecord.notes && (
                <div>
                  <Label className="text-muted-foreground">备注</Label>
                  <p className="text-sm mt-1">{selectedRecord.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowDetailDialog(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
