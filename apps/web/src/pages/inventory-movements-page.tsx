import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowUp,
  Search,
  Filter,
  Calendar,
  User,
  Package,
  FileText,
  Plus,
  Download,
  Undo,
  Eye,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";

// Movement types
const MOVEMENT_TYPES = {
  IN: { label: "入库", color: "bg-green-100 text-green-700", icon: ArrowDown },
  OUT: { label: "出库", color: "bg-orange-100 text-orange-700", icon: ArrowUp },
  TRANSFER: { label: "调拨", color: "bg-blue-100 text-blue-700", icon: Undo },
  ADJUSTMENT: { label: "调整", color: "bg-purple-100 text-purple-700", icon: Undo },
};

// Mock movement data
const MOCK_MOVEMENTS = [
  {
    id: "mov-001",
    type: "IN",
    partId: "part-001",
    partNumber: "MOTOR-350-01",
    partName: "电机组件",
    quantity: 5,
    unit: "个",
    from: "DJI官方",
    to: "主仓库-A区-A-01-01",
    reference: "PO-2026-0115",
    performedBy: "张三",
    performedAt: "2026-01-15T10:30:00",
    notes: "定期补货",
  },
  {
    id: "mov-002",
    type: "OUT",
    partId: "part-001",
    partNumber: "MOTOR-350-01",
    partName: "电机组件",
    quantity: 1,
    unit: "个",
    from: "主仓库-A区-A-01-01",
    to: "WO-2026-0116",
    reference: "WO-2026-0116",
    performedBy: "李四",
    performedAt: "2026-01-16T09:15:00",
    notes: "工单领用",
  },
  {
    id: "mov-003",
    type: "OUT",
    partId: "part-002",
    partNumber: "PROP-350-21",
    partName: "螺旋桨",
    quantity: 8,
    unit: "个",
    from: "主仓库-B区-B-03-01",
    to: "WO-2026-0115",
    reference: "WO-2026-0115",
    performedBy: "王五",
    performedAt: "2026-01-16T08:00:00",
    notes: "定期更换",
  },
  {
    id: "mov-004",
    type: "TRANSFER",
    partId: "part-003",
    partNumber: "BATT-TB65",
    partName: "智能飞行电池 TB65",
    quantity: 5,
    unit: "个",
    from: "主仓库-C区-C-01-01",
    to: "备用仓库-C区-C-01-02",
    reference: "TF-2026-0115",
    performedBy: "赵六",
    performedAt: "2026-01-14T15:00:00",
    notes: "仓库调拨",
  },
  {
    id: "mov-005",
    type: "IN",
    partId: "part-004",
    partNumber: "GPS-M300-01",
    partName: "GPS模块",
    quantity: 10,
    unit: "个",
    from: "配件供应商A",
    to: "主仓库-A区-A-05-01",
    reference: "PO-2026-0114",
    performedBy: "张三",
    performedAt: "2026-01-14T11:00:00",
    notes: "新采购入库",
  },
  {
    id: "mov-006",
    type: "ADJUSTMENT",
    partId: "part-002",
    partNumber: "PROP-350-21",
    partName: "螺旋桨",
    quantity: -2,
    unit: "个",
    from: "主仓库-B区-B-03-01",
    to: "盘点调整",
    reference: "INV-2026-0101",
    performedBy: "李四",
    performedAt: "2026-01-10T16:00:00",
    notes: "盘点发现破损",
  },
  {
    id: "mov-007",
    type: "OUT",
    partId: "part-003",
    partNumber: "BATT-TB65",
    partName: "智能飞行电池 TB65",
    quantity: 3,
    unit: "个",
    from: "主仓库-C区-C-01-01",
    to: "WO-2026-0114",
    reference: "WO-2026-0114",
    performedBy: "王五",
    performedAt: "2026-01-13T14:30:00",
    notes: "电池更换",
  },
];

// Mock parts
const MOCK_PARTS = [
  { id: "part-001", partNumber: "MOTOR-350-01", name: "电机组件", unit: "个" },
  { id: "part-002", partNumber: "PROP-350-21", name: "螺旋桨", unit: "个" },
  { id: "part-003", partNumber: "BATT-TB65", name: "智能飞行电池 TB65", unit: "个" },
  { id: "part-004", partNumber: "GPS-M300-01", name: "GPS模块", unit: "个" },
  { id: "part-005", partNumber: "FC-350-01", name: "主控板", unit: "个" },
];

type MovementType = "IN" | "OUT" | "TRANSFER" | "ADJUSTMENT" | "all";

interface NewMovement {
  type: MovementType;
  partId: string;
  quantity: number;
  from: string;
  to: string;
  reference: string;
  notes: string;
  performedAt: string;
}

/**
 * Inventory movements page for tracking stock in/out/transfer history
 */
export function InventoryMovementsPage() {
  const navigate = useNavigate();

  // State
  const [movements, setMovements] = useState(MOCK_MOVEMENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<MovementType>("all");
  const [showNewMovementDialog, setShowNewMovementDialog] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState<typeof MOCK_MOVEMENTS[0] | null>(null);
  const [newMovement, setNewMovement] = useState<NewMovement>({
    type: "IN",
    partId: "",
    quantity: 1,
    from: "",
    to: "主仓库",
    reference: "",
    notes: "",
    performedAt: new Date().toISOString().slice(0, 16),
  });

  // Filter movements
  const filteredMovements = useMemo(() => {
    return movements.filter((movement) => {
      const matchesSearch =
        movement.partNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        movement.partName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        movement.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        movement.performedBy.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === "all" || movement.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [movements, searchQuery, typeFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todayMovements = movements.filter((m) => m.performedAt.startsWith(today));
    const todayIn = todayMovements.filter((m) => m.type === "IN").reduce((sum, m) => sum + m.quantity, 0);
    const todayOut = todayMovements.filter((m) => m.type === "OUT").reduce((sum, m) => sum + Math.abs(m.quantity), 0);

    return { todayIn, todayOut, todayMovements: todayMovements.length };
  }, [movements]);

  // Get movement type info
  const getMovementTypeInfo = (type: MovementType) => {
    return MOVEMENT_TYPES[type as keyof typeof MOVEMENT_TYPES] || {
      label: type,
      color: "bg-gray-100 text-gray-700",
      icon: Package,
    };
  };

  // Handle new movement
  const handleNewMovement = () => {
    console.log("Create new movement:", newMovement);
    // TODO: API call to create movement
    const part = MOCK_PARTS.find((p) => p.id === newMovement.partId);
    if (part) {
      setMovements((prev) => [
        {
          id: `mov-${Date.now()}`,
          type: newMovement.type as any,
          partId: newMovement.partId,
          partNumber: part.partNumber,
          partName: part.name,
          quantity: Math.abs(newMovement.quantity),
          unit: part.unit,
          from: newMovement.from,
          to: newMovement.to,
          reference: newMovement.reference,
          performedBy: "当前用户",
          performedAt: newMovement.performedAt,
          notes: newMovement.notes,
        },
        ...prev,
      ]);
    }
    setShowNewMovementDialog(false);
    setNewMovement({
      type: "IN",
      partId: "",
      quantity: 1,
      from: "",
      to: "主仓库",
      reference: "",
      notes: "",
      performedAt: new Date().toISOString().slice(0, 16),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">出入库记录</h1>
          <p className="text-muted-foreground">
            追踪库存的入库、出库、调拨等所有变动记录
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            导出
          </Button>
          <Button onClick={() => setShowNewMovementDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            新增记录
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                今日入库
              </CardTitle>
              <ArrowDown className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.todayIn}</div>
            <p className="text-xs text-muted-foreground mt-1">件</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                今日出库
              </CardTitle>
              <ArrowUp className="h-4 w-4 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.todayOut}</div>
            <p className="text-xs text-muted-foreground mt-1">件</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                今日记录
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayMovements}</div>
            <p className="text-xs text-muted-foreground mt-1">条</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                总记录
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{movements.length}</div>
            <p className="text-xs text-muted-foreground mt-1">条</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索件号、配件名称、单号、操作人..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Type Filter */}
            <Select value={typeFilter} onValueChange={(v: MovementType) => setTypeFilter(v)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="类型筛选" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="IN">入库</SelectItem>
                <SelectItem value="OUT">出库</SelectItem>
                <SelectItem value="TRANSFER">调拨</SelectItem>
                <SelectItem value="ADJUSTMENT">调整</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {(searchQuery || typeFilter !== "all") && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchQuery("");
                  setTypeFilter("all");
                }}
              >
                清除筛选
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Movements Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>出入库记录</CardTitle>
              <CardDescription>
                共 {filteredMovements.length} 条记录
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    时间
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    类型
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    配件
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    来源
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                  目标
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">
                    数量
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    单号
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    操作人
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredMovements.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-muted-foreground">
                      {searchQuery || typeFilter !== "all"
                        ? "未找到匹配的记录"
                        : "暂无出入库记录"}
                    </td>
                  </tr>
                ) : (
                  filteredMovements.map((movement) => {
                    const typeInfo = getMovementTypeInfo(movement.type as MovementType);
                    const TypeIcon = typeInfo.icon;

                    return (
                      <tr key={movement.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <div>
                              <div>{new Date(movement.performedAt).toLocaleDateString("zh-CN")}</div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(movement.performedAt).toLocaleTimeString("zh-CN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={typeInfo.color}>
                            <TypeIcon className="h-3 w-3 mr-1" />
                            {typeInfo.label}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{movement.partName}</p>
                            <p className="text-xs text-muted-foreground font-mono">{movement.partNumber}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {movement.from}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {movement.to}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={`font-medium ${
                            movement.type === "IN"
                              ? "text-green-600"
                              : movement.type === "OUT"
                              ? "text-orange-600"
                              : "text-blue-600"
                          }`}>
                            {movement.type === "OUT" || movement.type === "ADJUSTMENT" ? "-" : "+"}
                            {movement.quantity}
                          </span>
                          <span className="text-muted-foreground text-xs ml-1">{movement.unit}</span>
                        </td>
                        <td className="py-3 px-4 text-sm font-mono">
                          {movement.reference && (
                            <Link
                              to="#"
                              className="text-primary hover:underline"
                            >
                              {movement.reference}
                            </Link>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3 text-muted-foreground" />
                            {movement.performedBy}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setSelectedMovement(movement)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* New Movement Dialog */}
      <Dialog open={showNewMovementDialog} onOpenChange={setShowNewMovementDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新增出入库记录</DialogTitle>
            <DialogDescription>
              记录入库、出库或调拨操作
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Movement Type */}
            <div>
              <Label htmlFor="movementType">操作类型 *</Label>
              <Select
                value={newMovement.type}
                onValueChange={(value: MovementType) => setNewMovement({ ...newMovement, type: value })}
              >
                <SelectTrigger id="movementType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IN">
                    <div className="flex items-center gap-2">
                      <ArrowDown className="h-4 w-4 text-green-600" />
                      入库
                    </div>
                  </SelectItem>
                  <SelectItem value="OUT">
                    <div className="flex items-center gap-2">
                      <ArrowUp className="h-4 w-4 text-orange-600" />
                      出库
                    </div>
                  </SelectItem>
                  <SelectItem value="TRANSFER">
                    <div className="flex items-center gap-2">
                      <Undo className="h-4 w-4 text-blue-600" />
                      调拨
                    </div>
                  </SelectItem>
                  <SelectItem value="ADJUSTMENT">
                    <div className="flex items-center gap-2">
                      <Undo className="h-4 w-4 text-purple-600" />
                      调整
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Part Selection */}
            <div>
              <Label htmlFor="part">配件 *</Label>
              <Select
                value={newMovement.partId}
                onValueChange={(value) => setNewMovement({ ...newMovement, partId: value })}
              >
                <SelectTrigger id="part">
                  <SelectValue placeholder="选择配件" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_PARTS.map((part) => (
                    <SelectItem key={part.id} value={part.id}>
                      <div>
                        <div className="font-medium">{part.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {part.partNumber}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quantity */}
            <div>
              <Label htmlFor="quantity">数量 *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={newMovement.quantity}
                onChange={(e) => setNewMovement({ ...newMovement, quantity: parseInt(e.target.value) || 1 })}
              />
            </div>

            {/* From */}
            <div>
              <Label htmlFor="from">
                {newMovement.type === "IN" ? "来源 *" : "出库位置 *"}
              </Label>
              <Input
                id="from"
                placeholder={newMovement.type === "IN" ? "例如：供应商名称" : "例如：主仓库-A-01-01"}
                value={newMovement.from}
                onChange={(e) => setNewMovement({ ...newMovement, from: e.target.value })}
              />
            </div>

            {/* To */}
            <div>
              <Label htmlFor="to">
                {newMovement.type === "OUT" ? "目标 *" : "入库位置 *"}
              </Label>
              <Input
                id="to"
                placeholder={newMovement.type === "OUT" ? "例如：工单号或使用人" : "例如：主仓库-A-01-01"}
                value={newMovement.to}
                onChange={(e) => setNewMovement({ ...newMovement, to: e.target.value })}
              />
            </div>

            {/* Reference */}
            <div>
              <Label htmlFor="reference">参考单号</Label>
              <Input
                id="reference"
                placeholder="例如：采购单号、工单号"
                value={newMovement.reference}
                onChange={(e) => setNewMovement({ ...newMovement, reference: e.target.value })}
              />
            </div>

            {/* Operation Time */}
            <div>
              <Label htmlFor="performedAt">操作时间</Label>
              <Input
                id="performedAt"
                type="datetime-local"
                value={newMovement.performedAt}
                onChange={(e) => setNewMovement({ ...newMovement, performedAt: e.target.value })}
              />
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">备注说明</Label>
              <Textarea
                id="notes"
                placeholder="详细说明操作原因..."
                value={newMovement.notes}
                onChange={(e) => setNewMovement({ ...newMovement, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewMovementDialog(false)}>
              取消
            </Button>
            <Button onClick={handleNewMovement} disabled={!newMovement.partId || !newMovement.from || !newMovement.to}>
              <Plus className="h-4 w-4 mr-2" />
              添加记录
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!selectedMovement} onOpenChange={() => setSelectedMovement(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>记录详情</DialogTitle>
          </DialogHeader>
          {selectedMovement && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge className={getMovementTypeInfo(selectedMovement.type as MovementType).color}>
                  {getMovementTypeInfo(selectedMovement.type as MovementType).label}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {new Date(selectedMovement.performedAt).toLocaleString("zh-CN")}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">配件名称</p>
                  <p className="font-medium">{selectedMovement.partName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">件号</p>
                  <p className="font-mono">{selectedMovement.partNumber}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">数量</p>
                  <p className="font-medium">
                    {selectedMovement.quantity} {selectedMovement.unit}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">参考单号</p>
                  <p className="font-mono">{selectedMovement.reference || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">来源</p>
                  <p className="font-medium">{selectedMovement.from}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">目标</p>
                  <p className="font-medium">{selectedMovement.to}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">操作人</p>
                  <p className="font-medium">{selectedMovement.performedBy}</p>
                </div>
              </div>

              {selectedMovement.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">备注</p>
                  <p className="text-sm mt-1">{selectedMovement.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setSelectedMovement(null)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
