import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  Download,
  Plus,
  ArrowDown,
  ArrowUp,
  Undo,
  Eye,
  Calendar,
  User,
  Wrench,
  FileText,
  AlertCircle,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";

// 拆装操作类型
const REMOVAL_TYPES = {
  INSTALLATION: {
    label: "安装",
    description: "新件安装到飞机上",
    color: "bg-green-100 text-green-700",
    icon: ArrowDown,
  },
  REMOVAL: {
    label: "拆下",
    description: "从飞机上拆下",
    color: "bg-orange-100 text-orange-700",
    icon: ArrowUp,
  },
  REPLACEMENT: {
    label: "更换",
    description: "拆下旧件并安装新件",
    color: "bg-blue-100 text-blue-700",
    icon: Undo,
  },
};

// 拆下原因
const REMOVAL_REASONS = [
  { value: "SCHEDULED", label: "计划更换", description: "按计划定期更换" },
  { value: "FAILED", label: "故障更换", description: "零件故障需要更换" },
  { value: "DAMAGED", label: "损坏更换", description: "零件受损需要更换" },
  { value: "UPGRADE", label: "升级改装", description: "升级到新型号" },
  { value: "INSPECTION", label: "检查拆装", description: "检查需要暂时拆下" },
  { value: "OTHER", label: "其他原因", description: "其他特殊情况" },
];

// 零件状态
const PART_STATUS = {
  SERVICEABLE: { label: "可用", color: "bg-green-100 text-green-700" },
  REPAIRABLE: { label: "可修复", color: "bg-yellow-100 text-yellow-700" },
  SCRAPPED: { label: "报废", color: "bg-red-100 text-red-700" },
  QUARANTINE: { label: "待检", color: "bg-purple-100 text-purple-700" },
};

/**
 * 零部件拆装记录页面
 */
export function ComponentRemovalsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [reasonFilter, setReasonFilter] = useState<string>("all");
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  // 拆装记录列表
  const removalRecords = [
    {
      id: "rm-001",
      type: "REMOVAL" as const,
      componentId: "comp-001",
      componentSerial: "EM-2024-00156",
      componentName: "电机 AX-2814",
      aircraftId: "ac-001",
      aircraftRegistration: "B-7011U",
      reason: "FAILED",
      workOrderId: "wo-001",
      workOrderNumber: "WO-2026-0123",
      removalDate: "2026-01-15",
      removedBy: "张维修",
      flightHours: 125.5,
      flightCycles: 89,
      status: "REPAIRABLE",
      notes: "电机异响，需进一步检查",
      location: "仓库A-01",
      createdAt: "2026-01-15T10:30:00",
    },
    {
      id: "rm-002",
      type: "INSTALLATION" as const,
      componentId: "comp-002",
      componentSerial: "EM-2024-00200",
      componentName: "电机 AX-2814",
      aircraftId: "ac-001",
      aircraftRegistration: "B-7011U",
      reason: "SCHEDULED",
      workOrderId: "wo-001",
      workOrderNumber: "WO-2026-0123",
      removalDate: "2026-01-15",
      removedBy: "张维修",
      flightHours: 0,
      flightCycles: 0,
      status: "SERVICEABLE",
      notes: "新件安装",
      location: "已装机-B-7011U",
      createdAt: "2026-01-15T14:20:00",
    },
    {
      id: "rm-003",
      type: "REPLACEMENT" as const,
      componentId: "comp-003",
      componentSerial: "PR-2024-00089",
      componentName: "螺旋桨 29x9.5",
      aircraftId: "ac-002",
      aircraftRegistration: "B-7012U",
      reason: "SCHEDULED",
      workOrderId: "wo-002",
      workOrderNumber: "WO-2026-0118",
      removalDate: "2026-01-14",
      removedBy: "李维修",
      flightHours: 198,
      flightCycles: 156,
      status: "SERVICEABLE",
      notes: "达到200小时更换周期",
      location: "仓库B-05",
      createdAt: "2026-01-14T16:45:00",
    },
    {
      id: "rm-004",
      type: "REMOVAL" as const,
      componentId: "comp-004",
      componentSerial: "FC-2024-00123",
      componentName: "飞控控制器 V3",
      aircraftId: "ac-003",
      aircraftRegistration: "B-7013U",
      reason: "DAMAGED",
      workOrderId: "wo-003",
      workOrderNumber: "WO-2026-0125",
      removalDate: "2026-01-13",
      removedBy: "王维修",
      flightHours: 89.5,
      flightCycles: 67,
      status: "SCRAPPED",
      notes: "坠落撞击损坏，无法修复",
      location: "报废区",
      createdAt: "2026-01-13T09:15:00",
    },
    {
      id: "rm-005",
      type: "INSTALLATION" as const,
      componentId: "comp-005",
      componentSerial: "BT-2024-00345",
      componentName: "电池包 16000mAh",
      aircraftId: "ac-001",
      aircraftRegistration: "B-7011U",
      reason: "SCHEDULED",
      workOrderId: "wo-004",
      workOrderNumber: "WO-2026-0130",
      removalDate: "2026-01-12",
      removedBy: "张维修",
      flightHours: 0,
      flightCycles: 0,
      status: "SERVICEABLE",
      notes: "新电池安装",
      location: "已装机-B-7011U",
      createdAt: "2026-01-12T11:30:00",
    },
    {
      id: "rm-006",
      type: "REMOVAL" as const,
      componentId: "comp-006",
      componentSerial: "LG-2024-00078",
      componentName: "起落架前",
      aircraftId: "ac-002",
      aircraftRegistration: "B-7012U",
      reason: "INSPECTION",
      workOrderId: "wo-005",
      workOrderNumber: "WO-2026-0135",
      removalDate: "2026-01-11",
      removedBy: "李维修",
      flightHours: 234.5,
      flightCycles: 189,
      status: "QUARANTINE",
      notes: "检查发现轻微裂纹，待进一步评估",
      location: "待检区",
      createdAt: "2026-01-11T15:20:00",
    },
    {
      id: "rm-007",
      type: "REPLACEMENT" as const,
      componentId: "comp-007",
      componentSerial: "ES-2024-00234",
      componentName: "电调 40A",
      aircraftId: "ac-003",
      aircraftRegistration: "B-7013U",
      reason: "UPGRADE",
      workOrderId: "wo-006",
      workOrderNumber: "WO-2026-0140",
      removalDate: "2026-01-10",
      removedBy: "王维修",
      flightHours: 145,
      flightCycles: 112,
      status: "SERVICEABLE",
      notes: "升级到60A电调",
      location: "备件库-C",
      createdAt: "2026-01-10T13:50:00",
    },
  ];

  // 筛选记录
  const filteredRecords = removalRecords.filter((record) => {
    const matchesSearch =
      record.componentSerial.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.componentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.aircraftRegistration.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.workOrderNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === "all" || record.type === typeFilter;
    const matchesReason = reasonFilter === "all" || record.reason === reasonFilter;

    return matchesSearch && matchesType && matchesReason;
  });

  // 统计
  const stats = {
    total: removalRecords.length,
    installations: removalRecords.filter((r) => r.type === "INSTALLATION").length,
    removals: removalRecords.filter((r) => r.type === "REMOVAL").length,
    replacements: removalRecords.filter((r) => r.type === "REPLACEMENT").length,
  };

  // 查看详情
  const viewDetail = (record: typeof removalRecords[0]) => {
    setSelectedRecord(record);
    setShowDetailDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">零部件拆装记录</h1>
          <p className="text-muted-foreground">
            记录所有零部件的安装、拆下和更换操作
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            导出
          </Button>
          <Button onClick={() => setShowNewDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            新增记录
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              全部记录
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              安装
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.installations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              拆下
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.removals}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              更换
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.replacements}</div>
          </CardContent>
        </Card>
      </div>

      {/* Type Filter Bar */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={typeFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setTypeFilter("all")}
        >
          全部 ({stats.total})
        </Button>
        <Button
          variant={typeFilter === "INSTALLATION" ? "default" : "outline"}
          size="sm"
          onClick={() => setTypeFilter("INSTALLATION")}
        >
          安装 ({stats.installations})
        </Button>
        <Button
          variant={typeFilter === "REMOVAL" ? "default" : "outline"}
          size="sm"
          onClick={() => setTypeFilter("REMOVAL")}
        >
          拆下 ({stats.removals})
        </Button>
        <Button
          variant={typeFilter === "REPLACEMENT" ? "default" : "outline"}
          size="sm"
          onClick={() => setTypeFilter("REPLACEMENT")}
        >
          更换 ({stats.replacements})
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索零件序列号、名称、飞机号或工单号..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={reasonFilter}
              onChange={(e) => setReasonFilter(e.target.value)}
              className="h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="all">全部原因</option>
              {REMOVAL_REASONS.map((reason) => (
                <option key={reason.value} value={reason.value}>
                  {reason.label}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Records List */}
      <Card>
        <CardHeader>
          <CardTitle>拆装记录列表</CardTitle>
          <CardDescription>
            共 {filteredRecords.length} 条记录
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredRecords.map((record) => {
              const TypeIcon = REMOVAL_TYPES[record.type].icon;

              return (
                <div
                  key={record.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Type Icon */}
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        record.type === "INSTALLATION"
                          ? "bg-green-100"
                          : record.type === "REMOVAL"
                          ? "bg-orange-100"
                          : "bg-blue-100"
                      }`}>
                        <TypeIcon className={`h-5 w-5 ${
                          record.type === "INSTALLATION"
                            ? "text-green-600"
                            : record.type === "REMOVAL"
                            ? "text-orange-600"
                            : "text-blue-600"
                        }`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Link
                            to={`/components/${record.componentId}`}
                            className="font-medium text-slate-900 hover:text-primary"
                          >
                            {record.componentName}
                          </Link>
                          <span className="text-sm text-muted-foreground">
                            ({record.componentSerial})
                          </span>
                          <Badge className={REMOVAL_TYPES[record.type].color}>
                            {REMOVAL_TYPES[record.type].label}
                          </Badge>
                          <Badge className={PART_STATUS[record.status as keyof typeof PART_STATUS].color}>
                            {PART_STATUS[record.status as keyof typeof PART_STATUS].label}
                          </Badge>
                        </div>

                        {/* Details */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mb-2">
                          <span className="flex items-center gap-1">
                            <Wrench className="h-3.5 w-3.5" />
                            飞机:{" "}
                            <Link
                              to={`/aircraft/${record.aircraftId}`}
                              className="text-primary hover:underline"
                            >
                              {record.aircraftRegistration}
                            </Link>
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="h-3.5 w-3.5" />
                            工单:{" "}
                            <Link
                              to={`/work-orders/${record.workOrderId}`}
                              className="text-primary hover:underline"
                            >
                              {record.workOrderNumber}
                            </Link>
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {record.removalDate}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5" />
                            {record.removedBy}
                          </span>
                        </div>

                        {/* Usage Info */}
                        {record.type !== "INSTALLATION" && (
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>飞行小时: {record.flightHours}h</span>
                            <span>起降循环: {record.flightCycles}次</span>
                          </div>
                        )}

                        {/* Notes */}
                        {record.notes && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {record.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => viewDetail(record)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      详情
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredRecords.length === 0 && (
            <div className="text-center py-12">
              <Wrench className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">未找到拆装记录</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || typeFilter !== "all" || reasonFilter !== "all"
                  ? "尝试调整搜索或筛选条件"
                  : "点击上方按钮创建第一条拆装记录"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Record Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>新增拆装记录</DialogTitle>
            <DialogDescription>
              记录零部件的安装、拆下或更换操作
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">操作类型 *</Label>
                <Select>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="选择操作类型" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(REMOVAL_TYPES).map(([key, { label, description }]) => (
                      <SelectItem key={key} value={key}>
                        {label} - {description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="reason">原因 *</Label>
                <Select>
                  <SelectTrigger id="reason">
                    <SelectValue placeholder="选择原因" />
                  </SelectTrigger>
                  <SelectContent>
                    {REMOVAL_REASONS.map((reason) => (
                      <SelectItem key={reason.value} value={reason.value}>
                        {reason.label} - {reason.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="component">零部件 *</Label>
                <Input id="component" placeholder="扫描或选择零部件" />
              </div>
              <div>
                <Label htmlFor="aircraft">飞机 *</Label>
                <Select>
                  <SelectTrigger id="aircraft">
                    <SelectValue placeholder="选择飞机" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ac-001">B-7011U</SelectItem>
                    <SelectItem value="ac-002">B-7012U</SelectItem>
                    <SelectItem value="ac-003">B-7013U</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="workOrder">关联工单</Label>
                <Select>
                  <SelectTrigger id="workOrder">
                    <SelectValue placeholder="选择工单（可选）" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wo-001">WO-2026-0123</SelectItem>
                    <SelectItem value="wo-002">WO-2026-0118</SelectItem>
                    <SelectItem value="wo-003">WO-2026-0125</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">零件状态 *</Label>
                <Select>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="选择状态" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PART_STATUS).map(([key, { label }]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="location">存放位置</Label>
              <Input id="location" placeholder="如：仓库A-01" />
            </div>
            <div>
              <Label htmlFor="notes">备注</Label>
              <Textarea
                id="notes"
                placeholder="详细说明操作情况..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>
              取消
            </Button>
            <Button onClick={() => setShowNewDialog(false)}>
              保存记录
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>拆装记录详情</DialogTitle>
            <DialogDescription>
              记录ID: {selectedRecord?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">操作类型</Label>
                  <p className="font-medium">
                    <Badge className={REMOVAL_TYPES[selectedRecord.type].color}>
                      {REMOVAL_TYPES[selectedRecord.type].label}
                    </Badge>
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">操作原因</Label>
                  <p className="font-medium">
                    {REMOVAL_REASONS.find((r) => r.value === selectedRecord.reason)?.label}
                  </p>
                </div>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">零部件信息</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-muted-foreground">零部件名称</Label>
                    <p className="font-medium">{selectedRecord.componentName}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">序列号</Label>
                    <p className="font-medium">{selectedRecord.componentSerial}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">当前状态</Label>
                    <p className="font-medium">
                      <Badge className={PART_STATUS[selectedRecord.status as keyof typeof PART_STATUS].color}>
                        {PART_STATUS[selectedRecord.status as keyof typeof PART_STATUS].label}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">存放位置</Label>
                    <p className="font-medium">{selectedRecord.location}</p>
                  </div>
                </div>
              </div>
              {selectedRecord.type !== "INSTALLATION" && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">使用情况</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground">飞行小时</Label>
                      <p className="font-medium">{selectedRecord.flightHours} h</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">起降循环</Label>
                      <p className="font-medium">{selectedRecord.flightCycles} 次</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">操作信息</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-muted-foreground">飞机</Label>
                    <p className="font-medium">{selectedRecord.aircraftRegistration}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">工单</Label>
                    <p className="font-medium">{selectedRecord.workOrderNumber}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">操作日期</Label>
                    <p className="font-medium">{selectedRecord.removalDate}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">操作人员</Label>
                    <p className="font-medium">{selectedRecord.removedBy}</p>
                  </div>
                </div>
              </div>
              {selectedRecord.notes && (
                <div className="border-t pt-4">
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
