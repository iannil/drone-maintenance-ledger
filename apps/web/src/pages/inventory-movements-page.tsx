import { useState, useMemo, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowUp,
  Search,
  Calendar,
  User,
  Package,
  FileText,
  Plus,
  Download,
  Undo,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
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
import { Skeleton } from "../components/ui/skeleton";
import {
  inventoryMovementService,
  inventoryService,
  InventoryMovement,
  MovementType,
  MovementStatus,
  CreateMovementDto,
  InventoryItem,
} from "../services/inventory.service";

// Movement type display info
const MOVEMENT_TYPES: Record<MovementType, { label: string; color: string; icon: typeof ArrowDown }> = {
  RECEIPT: { label: "入库", color: "bg-green-100 text-green-700", icon: ArrowDown },
  ISSUE: { label: "出库", color: "bg-orange-100 text-orange-700", icon: ArrowUp },
  TRANSFER: { label: "调拨", color: "bg-blue-100 text-blue-700", icon: Undo },
  ADJUSTMENT: { label: "调整", color: "bg-purple-100 text-purple-700", icon: Undo },
  RETURN: { label: "退料", color: "bg-cyan-100 text-cyan-700", icon: ArrowDown },
  SCRAP: { label: "报废", color: "bg-red-100 text-red-700", icon: XCircle },
  COUNT: { label: "盘点", color: "bg-gray-100 text-gray-700", icon: FileText },
};

// Status display info
const STATUS_INFO: Record<MovementStatus, { label: string; color: string; icon: typeof Clock }> = {
  PENDING: { label: "待审批", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  APPROVED: { label: "已审批", color: "bg-blue-100 text-blue-700", icon: CheckCircle },
  COMPLETED: { label: "已完成", color: "bg-green-100 text-green-700", icon: CheckCircle },
  CANCELLED: { label: "已取消", color: "bg-gray-100 text-gray-700", icon: XCircle },
};

type FilterType = MovementType | "all";

interface NewMovementForm {
  type: MovementType;
  partNumber: string;
  partName: string;
  inventoryItemId: string;
  quantity: number;
  unit: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  fromLocation: string;
  toLocation: string;
  referenceNumber: string;
  reason: string;
  notes: string;
}

/**
 * Inventory movements page for tracking stock in/out/transfer history
 */
export function InventoryMovementsPage() {
  const navigate = useNavigate();

  // State
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");
  const [statusFilter, setStatusFilter] = useState<MovementStatus | "all">("all");
  const [showNewMovementDialog, setShowNewMovementDialog] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState<InventoryMovement | null>(null);
  const [newMovement, setNewMovement] = useState<NewMovementForm>({
    type: "RECEIPT",
    partNumber: "",
    partName: "",
    inventoryItemId: "",
    quantity: 1,
    unit: "个",
    fromWarehouseId: "",
    toWarehouseId: "",
    fromLocation: "",
    toLocation: "",
    referenceNumber: "",
    reason: "",
    notes: "",
  });

  // Load movements
  const loadMovements = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await inventoryMovementService.list({
        limit: 100,
        type: typeFilter === "all" ? undefined : typeFilter,
        status: statusFilter === "all" ? undefined : statusFilter,
      });
      setMovements(result.data);
      setTotal(result.total);
    } catch (err) {
      console.error("Failed to load movements:", err);
      setError("加载出入库记录失败");
    } finally {
      setIsLoading(false);
    }
  };

  // Load inventory items for selection
  const loadInventoryItems = async () => {
    try {
      const result = await inventoryService.list({ limit: 100 });
      setInventoryItems(result.data);
    } catch (err) {
      console.error("Failed to load inventory items:", err);
    }
  };

  useEffect(() => {
    loadMovements();
    loadInventoryItems();
  }, [typeFilter, statusFilter]);

  // Filter movements by search (client-side filtering for quick search)
  const filteredMovements = useMemo(() => {
    if (!searchQuery) return movements;
    const query = searchQuery.toLowerCase();
    return movements.filter((movement) =>
      movement.partNumber.toLowerCase().includes(query) ||
      movement.partName?.toLowerCase().includes(query) ||
      movement.movementNumber.toLowerCase().includes(query) ||
      movement.referenceNumber?.toLowerCase().includes(query)
    );
  }, [movements, searchQuery]);

  // Calculate statistics
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayMs = today.getTime();
    const tomorrowMs = todayMs + 24 * 60 * 60 * 1000;

    const todayMovements = movements.filter(
      (m) => m.movementDate >= todayMs && m.movementDate < tomorrowMs
    );

    const todayIn = todayMovements
      .filter((m) => m.type === "RECEIPT" || m.type === "RETURN")
      .reduce((sum, m) => sum + m.quantity, 0);

    const todayOut = todayMovements
      .filter((m) => m.type === "ISSUE" || m.type === "SCRAP")
      .reduce((sum, m) => sum + m.quantity, 0);

    return { todayIn, todayOut, todayMovements: todayMovements.length };
  }, [movements]);

  // Get movement type info
  const getMovementTypeInfo = (type: MovementType) => {
    return MOVEMENT_TYPES[type] || {
      label: type,
      color: "bg-gray-100 text-gray-700",
      icon: Package,
    };
  };

  // Get status info
  const getStatusInfo = (status: MovementStatus) => {
    return STATUS_INFO[status] || {
      label: status,
      color: "bg-gray-100 text-gray-700",
      icon: Clock,
    };
  };

  // Handle inventory item selection
  const handleItemSelect = (itemId: string) => {
    const item = inventoryItems.find((i) => i.id === itemId);
    if (item) {
      setNewMovement({
        ...newMovement,
        inventoryItemId: itemId,
        partNumber: item.partNumber,
        partName: item.name,
        unit: item.unit,
      });
    }
  };

  // Handle new movement creation
  const handleNewMovement = async () => {
    setIsCreating(true);
    try {
      const dto: CreateMovementDto = {
        type: newMovement.type,
        partNumber: newMovement.partNumber,
        partName: newMovement.partName || undefined,
        inventoryItemId: newMovement.inventoryItemId || undefined,
        quantity: newMovement.quantity,
        unit: newMovement.unit,
        fromWarehouseId: newMovement.fromWarehouseId || undefined,
        toWarehouseId: newMovement.toWarehouseId || undefined,
        fromLocation: newMovement.fromLocation || undefined,
        toLocation: newMovement.toLocation || undefined,
        referenceNumber: newMovement.referenceNumber || undefined,
        reason: newMovement.reason || undefined,
        notes: newMovement.notes || undefined,
      };

      await inventoryMovementService.create(dto);
      setShowNewMovementDialog(false);
      setNewMovement({
        type: "RECEIPT",
        partNumber: "",
        partName: "",
        inventoryItemId: "",
        quantity: 1,
        unit: "个",
        fromWarehouseId: "",
        toWarehouseId: "",
        fromLocation: "",
        toLocation: "",
        referenceNumber: "",
        reason: "",
        notes: "",
      });
      loadMovements();
    } catch (err) {
      console.error("Failed to create movement:", err);
      setError("创建记录失败");
    } finally {
      setIsCreating(false);
    }
  };

  // Handle approve
  const handleApprove = async (id: string) => {
    try {
      await inventoryMovementService.approve(id);
      loadMovements();
    } catch (err) {
      console.error("Failed to approve:", err);
    }
  };

  // Handle complete
  const handleComplete = async (id: string) => {
    try {
      await inventoryMovementService.complete(id);
      loadMovements();
    } catch (err) {
      console.error("Failed to complete:", err);
    }
  };

  // Handle cancel
  const handleCancel = async (id: string) => {
    try {
      await inventoryMovementService.cancel(id);
      loadMovements();
    } catch (err) {
      console.error("Failed to cancel:", err);
    }
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
          <Button variant="outline" onClick={loadMovements}>
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </Button>
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

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="text-red-700">{error}</span>
          <Button variant="ghost" size="sm" onClick={() => setError(null)}>
            关闭
          </Button>
        </div>
      )}

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
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600">{stats.todayIn}</div>
                <p className="text-xs text-muted-foreground mt-1">件</p>
              </>
            )}
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
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-orange-600">{stats.todayOut}</div>
                <p className="text-xs text-muted-foreground mt-1">件</p>
              </>
            )}
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
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.todayMovements}</div>
                <p className="text-xs text-muted-foreground mt-1">条</p>
              </>
            )}
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
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{total}</div>
                <p className="text-xs text-muted-foreground mt-1">条</p>
              </>
            )}
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
                placeholder="搜索件号、配件名称、单号..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Type Filter */}
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as FilterType)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="类型筛选" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="RECEIPT">入库</SelectItem>
                <SelectItem value="ISSUE">出库</SelectItem>
                <SelectItem value="TRANSFER">调拨</SelectItem>
                <SelectItem value="ADJUSTMENT">调整</SelectItem>
                <SelectItem value="RETURN">退料</SelectItem>
                <SelectItem value="SCRAP">报废</SelectItem>
                <SelectItem value="COUNT">盘点</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as MovementStatus | "all")}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="状态筛选" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="PENDING">待审批</SelectItem>
                <SelectItem value="APPROVED">已审批</SelectItem>
                <SelectItem value="COMPLETED">已完成</SelectItem>
                <SelectItem value="CANCELLED">已取消</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {(searchQuery || typeFilter !== "all" || statusFilter !== "all") && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchQuery("");
                  setTypeFilter("all");
                  setStatusFilter("all");
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
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                      单号
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                      时间
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                      类型
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                      状态
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                      配件
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">
                      数量
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                      参考单号
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMovements.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-muted-foreground">
                        {searchQuery || typeFilter !== "all" || statusFilter !== "all"
                          ? "未找到匹配的记录"
                          : "暂无出入库记录"}
                      </td>
                    </tr>
                  ) : (
                    filteredMovements.map((movement) => {
                      const typeInfo = getMovementTypeInfo(movement.type);
                      const statusInfo = getStatusInfo(movement.status);
                      const TypeIcon = typeInfo.icon;

                      return (
                        <tr key={movement.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4 text-sm font-mono">
                            {movement.movementNumber}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <div>
                                <div>{new Date(movement.movementDate).toLocaleDateString("zh-CN")}</div>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(movement.movementDate).toLocaleTimeString("zh-CN", {
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
                            <Badge className={statusInfo.color}>
                              {statusInfo.label}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{movement.partName || "-"}</p>
                              <p className="text-xs text-muted-foreground font-mono">{movement.partNumber}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className={`font-medium ${
                              movement.type === "RECEIPT" || movement.type === "RETURN"
                                ? "text-green-600"
                                : movement.type === "ISSUE" || movement.type === "SCRAP"
                                ? "text-orange-600"
                                : "text-blue-600"
                            }`}>
                              {movement.type === "ISSUE" || movement.type === "SCRAP" ? "-" : "+"}
                              {movement.quantity}
                            </span>
                            <span className="text-muted-foreground text-xs ml-1">{movement.unit}</span>
                          </td>
                          <td className="py-3 px-4 text-sm font-mono">
                            {movement.referenceNumber || "-"}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {movement.status === "PENDING" && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleApprove(movement.id)}
                                    title="审批"
                                  >
                                    <CheckCircle className="h-4 w-4 text-blue-500" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCancel(movement.id)}
                                    title="取消"
                                  >
                                    <XCircle className="h-4 w-4 text-red-500" />
                                  </Button>
                                </>
                              )}
                              {movement.status === "APPROVED" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleComplete(movement.id)}
                                  title="完成"
                                >
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setSelectedMovement(movement)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Movement Dialog */}
      <Dialog open={showNewMovementDialog} onOpenChange={setShowNewMovementDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>新增出入库记录</DialogTitle>
            <DialogDescription>
              记录入库、出库或调拨操作
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
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
                  <SelectItem value="RECEIPT">
                    <div className="flex items-center gap-2">
                      <ArrowDown className="h-4 w-4 text-green-600" />
                      入库
                    </div>
                  </SelectItem>
                  <SelectItem value="ISSUE">
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
                  <SelectItem value="RETURN">
                    <div className="flex items-center gap-2">
                      <ArrowDown className="h-4 w-4 text-cyan-600" />
                      退料
                    </div>
                  </SelectItem>
                  <SelectItem value="SCRAP">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      报废
                    </div>
                  </SelectItem>
                  <SelectItem value="COUNT">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-600" />
                      盘点
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Part Selection */}
            <div>
              <Label htmlFor="part">选择库存项</Label>
              <Select
                value={newMovement.inventoryItemId}
                onValueChange={handleItemSelect}
              >
                <SelectTrigger id="part">
                  <SelectValue placeholder="选择库存项（可选）" />
                </SelectTrigger>
                <SelectContent>
                  {inventoryItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.partNumber} · 库存: {item.availableQuantity}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Part Number (manual input) */}
            <div>
              <Label htmlFor="partNumber">件号 *</Label>
              <Input
                id="partNumber"
                placeholder="输入件号"
                value={newMovement.partNumber}
                onChange={(e) => setNewMovement({ ...newMovement, partNumber: e.target.value })}
              />
            </div>

            {/* Part Name */}
            <div>
              <Label htmlFor="partName">配件名称</Label>
              <Input
                id="partName"
                placeholder="输入配件名称"
                value={newMovement.partName}
                onChange={(e) => setNewMovement({ ...newMovement, partName: e.target.value })}
              />
            </div>

            {/* Quantity */}
            <div className="grid grid-cols-2 gap-4">
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
              <div>
                <Label htmlFor="unit">单位</Label>
                <Input
                  id="unit"
                  placeholder="个"
                  value={newMovement.unit}
                  onChange={(e) => setNewMovement({ ...newMovement, unit: e.target.value })}
                />
              </div>
            </div>

            {/* Location fields */}
            {(newMovement.type === "ISSUE" || newMovement.type === "TRANSFER" || newMovement.type === "SCRAP") && (
              <div>
                <Label htmlFor="fromLocation">出库位置</Label>
                <Input
                  id="fromLocation"
                  placeholder="例如：主仓库-A-01-01"
                  value={newMovement.fromLocation}
                  onChange={(e) => setNewMovement({ ...newMovement, fromLocation: e.target.value })}
                />
              </div>
            )}

            {(newMovement.type === "RECEIPT" || newMovement.type === "TRANSFER" || newMovement.type === "RETURN") && (
              <div>
                <Label htmlFor="toLocation">入库位置</Label>
                <Input
                  id="toLocation"
                  placeholder="例如：主仓库-A-01-01"
                  value={newMovement.toLocation}
                  onChange={(e) => setNewMovement({ ...newMovement, toLocation: e.target.value })}
                />
              </div>
            )}

            {/* Reference */}
            <div>
              <Label htmlFor="reference">参考单号</Label>
              <Input
                id="reference"
                placeholder="例如：采购单号、工单号"
                value={newMovement.referenceNumber}
                onChange={(e) => setNewMovement({ ...newMovement, referenceNumber: e.target.value })}
              />
            </div>

            {/* Reason */}
            <div>
              <Label htmlFor="reason">原因</Label>
              <Input
                id="reason"
                placeholder="操作原因"
                value={newMovement.reason}
                onChange={(e) => setNewMovement({ ...newMovement, reason: e.target.value })}
              />
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">备注说明</Label>
              <Textarea
                id="notes"
                placeholder="详细说明..."
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
            <Button
              onClick={handleNewMovement}
              disabled={!newMovement.partNumber || newMovement.quantity < 1 || isCreating}
            >
              {isCreating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  创建中...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  添加记录
                </>
              )}
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
                <Badge className={getMovementTypeInfo(selectedMovement.type).color}>
                  {getMovementTypeInfo(selectedMovement.type).label}
                </Badge>
                <Badge className={getStatusInfo(selectedMovement.status).color}>
                  {getStatusInfo(selectedMovement.status).label}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">单号</p>
                  <p className="font-mono">{selectedMovement.movementNumber}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">时间</p>
                  <p>{new Date(selectedMovement.movementDate).toLocaleString("zh-CN")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">配件名称</p>
                  <p className="font-medium">{selectedMovement.partName || "-"}</p>
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
                  <p className="font-mono">{selectedMovement.referenceNumber || "-"}</p>
                </div>
                {selectedMovement.fromLocation && (
                  <div>
                    <p className="text-muted-foreground">出库位置</p>
                    <p>{selectedMovement.fromLocation}</p>
                  </div>
                )}
                {selectedMovement.toLocation && (
                  <div>
                    <p className="text-muted-foreground">入库位置</p>
                    <p>{selectedMovement.toLocation}</p>
                  </div>
                )}
              </div>

              {selectedMovement.reason && (
                <div>
                  <p className="text-sm text-muted-foreground">原因</p>
                  <p className="text-sm mt-1">{selectedMovement.reason}</p>
                </div>
              )}

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
