import { useState, useMemo, useEffect } from "react";
import {
  Package,
  Search,
  Plus,
  Edit2,
  AlertTriangle,
  ArrowUpDown,
  Warehouse,
  BarChart3,
  Download,
  Upload,
  QrCode,
  Loader2,
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
import {
  inventoryService,
  InventoryItem,
  AdjustInventoryDto,
} from "../services/inventory.service";

type SortField = "partNumber" | "name" | "availableQuantity" | "quantity" | "unitCost";
type SortOrder = "asc" | "desc";
type CategoryFilter = "all" | string;
type StockFilter = "all" | "low" | "out" | "normal";

/**
 * Inventory management page
 */
export function InventoryPage() {
  // Data state
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [sortField, setSortField] = useState<SortField>("partNumber");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // Dialog state
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showAdjustDialog, setShowAdjustDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [adjustment, setAdjustment] = useState({ type: "in" as "in" | "out", quantity: 1, reason: "" });
  const [isAdjusting, setIsAdjusting] = useState(false);

  // Load inventory data
  useEffect(() => {
    loadInventoryData();
  }, []);

  const loadInventoryData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await inventoryService.list({ limit: 500 });
      setInventoryItems(response.data);
    } catch (err) {
      console.error("Failed to load inventory:", err);
      setError("加载库存数据失败");
    } finally {
      setIsLoading(false);
    }
  };

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(inventoryItems.map((item) => item.category).filter(Boolean));
    return Array.from(cats) as string[];
  }, [inventoryItems]);

  // Filter and sort inventory
  const filteredInventory = useMemo(() => {
    let filtered = [...inventoryItems];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.partNumber.toLowerCase().includes(query) ||
          item.name.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((item) => item.category === categoryFilter);
    }

    // Stock status filter
    if (stockFilter === "low") {
      filtered = filtered.filter(
        (item) => item.availableQuantity > 0 && item.availableQuantity <= item.minStock
      );
    } else if (stockFilter === "out") {
      filtered = filtered.filter((item) => item.availableQuantity === 0);
    } else if (stockFilter === "normal") {
      filtered = filtered.filter((item) => item.availableQuantity > item.minStock);
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal: string | number = a[sortField] ?? "";
      let bVal: string | number = b[sortField] ?? "";

      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [inventoryItems, searchQuery, categoryFilter, stockFilter, sortField, sortOrder]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalItems = inventoryItems.length;
    const lowStockItems = inventoryItems.filter(
      (item) => item.availableQuantity > 0 && item.availableQuantity <= item.minStock
    ).length;
    const outOfStockItems = inventoryItems.filter(
      (item) => item.availableQuantity === 0
    ).length;
    const totalValue = inventoryItems.reduce(
      (sum, item) => sum + (item.totalValue || 0),
      0
    );

    return { totalItems, lowStockItems, outOfStockItems, totalValue };
  }, [inventoryItems]);

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Get stock status
  const getStockStatus = (item: InventoryItem) => {
    if (item.availableQuantity === 0) {
      return { label: "缺货", color: "bg-red-100 text-red-700", icon: AlertTriangle };
    }
    if (item.availableQuantity <= item.minStock) {
      return { label: "库存不足", color: "bg-yellow-100 text-yellow-700", icon: AlertTriangle };
    }
    return { label: "正常", color: "bg-green-100 text-green-700", icon: Package };
  };

  // Open detail dialog
  const openDetailDialog = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowDetailDialog(true);
  };

  // Open adjustment dialog
  const openAdjustDialog = (item: InventoryItem) => {
    setSelectedItem(item);
    setAdjustment({ type: "in", quantity: 1, reason: "" });
    setShowAdjustDialog(true);
  };

  // Handle stock adjustment
  const handleAdjustment = async () => {
    if (!selectedItem || !adjustment.reason) return;

    setIsAdjusting(true);
    try {
      const dto: AdjustInventoryDto = {
        quantity: adjustment.type === "in" ? adjustment.quantity : -adjustment.quantity,
        reason: adjustment.reason,
      };
      const updated = await inventoryService.adjust(selectedItem.id, dto);

      // Update local state
      setInventoryItems((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );

      setShowAdjustDialog(false);
    } catch (err) {
      console.error("Failed to adjust inventory:", err);
      alert("库存调整失败");
    } finally {
      setIsAdjusting(false);
    }
  };

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadInventoryData();
      return;
    }

    setIsLoading(true);
    try {
      const results = await inventoryService.search(searchQuery);
      setInventoryItems(results);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-medium text-slate-900">{error}</p>
          <Button className="mt-4" onClick={loadInventoryData}>
            重试
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">库存管理</h1>
          <p className="text-muted-foreground">
            管理备件库存、出入库记录和库存预警
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            导入
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            导出
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            新增配件
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                配件种类
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.totalItems}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  共计 {inventoryItems.reduce((s, i) => s + i.quantity, 0)} 件
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                库存不足
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <div className="text-2xl font-bold text-yellow-600">{stats.lowStockItems}</div>
                <p className="text-xs text-muted-foreground mt-1">低于最低库存量</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                缺货
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <div className="text-2xl font-bold text-red-600">{stats.outOfStockItems}</div>
                <p className="text-xs text-muted-foreground mt-1">需要立即补货</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                库存总值
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  ¥{(stats.totalValue / 10000).toFixed(1)}万
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  总价值 ¥{stats.totalValue.toLocaleString()}
                </p>
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
                placeholder="搜索件号、配件名称..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="分类筛选" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部分类</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Stock Filter */}
            <Select value={stockFilter} onValueChange={(v: StockFilter) => setStockFilter(v)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="库存状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="normal">库存正常</SelectItem>
                <SelectItem value="low">库存不足</SelectItem>
                <SelectItem value="out">缺货</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {(searchQuery || categoryFilter !== "all" || stockFilter !== "all") && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("all");
                  setStockFilter("all");
                  loadInventoryData();
                }}
              >
                清除筛选
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>配件列表</CardTitle>
              <CardDescription>
                共 {filteredInventory.length} 条记录
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                      <button
                        className="flex items-center gap-1 hover:text-foreground"
                        onClick={() => handleSort("partNumber")}
                      >
                        件号
                        {sortField === "partNumber" && (
                          <ArrowUpDown className="h-3 w-3" />
                        )}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                      <button
                        className="flex items-center gap-1 hover:text-foreground"
                        onClick={() => handleSort("name")}
                      >
                        配件名称
                        {sortField === "name" && (
                          <ArrowUpDown className="h-3 w-3" />
                        )}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                      分类
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                      位置
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">
                      <button
                        className="flex items-center gap-1 hover:text-foreground ml-auto"
                        onClick={() => handleSort("availableQuantity")}
                      >
                        可用库存
                        {sortField === "availableQuantity" && (
                          <ArrowUpDown className="h-3 w-3" />
                        )}
                      </button>
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">
                      单价
                    </th>
                    <th className="text-center py-3 px-4 font-medium text-sm text-muted-foreground">
                      状态
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-muted-foreground">
                        {searchQuery || categoryFilter !== "all" || stockFilter !== "all"
                          ? "未找到匹配的配件"
                          : "暂无配件数据"}
                      </td>
                    </tr>
                  ) : (
                    filteredInventory.map((item) => {
                      const stockStatus = getStockStatus(item);
                      const StatusIcon = stockStatus.icon;

                      return (
                        <tr
                          key={item.id}
                          className="border-b hover:bg-muted/50 cursor-pointer"
                          onClick={() => openDetailDialog(item)}
                        >
                          <td className="py-3 px-4">
                            <span className="font-mono text-sm">{item.partNumber}</span>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{item.name}</p>
                              {item.description && (
                                <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm">{item.category || "-"}</td>
                          <td className="py-3 px-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Warehouse className="h-3 w-3 text-muted-foreground" />
                              {item.location || item.binNumber || "-"}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className="font-medium">{item.availableQuantity}</span>
                              <span className="text-muted-foreground">/ {item.quantity}</span>
                              <span className="text-muted-foreground text-xs">{item.unit}</span>
                            </div>
                            {item.reservedQuantity > 0 && (
                              <p className="text-xs text-amber-600 text-right">
                                已预留 {item.reservedQuantity}
                              </p>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right font-medium">
                            {item.unitCost ? `¥${item.unitCost.toLocaleString()}` : "-"}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge className={stockStatus.color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {stockStatus.label}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openAdjustDialog(item);
                                }}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // TODO: Open QR code
                                }}
                              >
                                <QrCode className="h-4 w-4" />
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

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>配件详情</DialogTitle>
            <DialogDescription>
              {selectedItem?.partNumber} - {selectedItem?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">件号</p>
                  <p className="font-mono font-medium">{selectedItem.partNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">配件名称</p>
                  <p className="font-medium">{selectedItem.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">分类</p>
                  <p className="font-medium">{selectedItem.category || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">单位</p>
                  <p className="font-medium">{selectedItem.unit}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">单价</p>
                  <p className="font-medium">
                    {selectedItem.unitCost ? `¥${selectedItem.unitCost.toLocaleString()}` : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">批次号</p>
                  <p className="font-medium">{selectedItem.batchNumber || "-"}</p>
                </div>
              </div>

              {/* Stock Info */}
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm font-medium mb-3">库存信息</p>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">总库存</p>
                    <p className="font-medium">{selectedItem.quantity} {selectedItem.unit}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">可用</p>
                    <p className="font-medium text-green-600">{selectedItem.availableQuantity} {selectedItem.unit}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">已预留</p>
                    <p className="font-medium text-amber-600">{selectedItem.reservedQuantity} {selectedItem.unit}</p>
                  </div>
                </div>
              </div>

              {/* Location Info */}
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm font-medium mb-3">存储位置</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">位置</p>
                    <p className="font-medium">{selectedItem.location || "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">货位号</p>
                    <p className="font-medium">{selectedItem.binNumber || "-"}</p>
                  </div>
                </div>
              </div>

              {/* Stock Thresholds */}
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">最低库存</p>
                  <p className="font-medium">{selectedItem.minStock}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">最高库存</p>
                  <p className="font-medium">{selectedItem.maxStock || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">补货点</p>
                  <p className="font-medium">{selectedItem.reorderPoint}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">补货量</p>
                  <p className="font-medium">{selectedItem.reorderQuantity}</p>
                </div>
              </div>

              {/* Description */}
              {selectedItem.description && (
                <div>
                  <p className="text-sm font-medium mb-2">描述</p>
                  <p className="text-sm text-muted-foreground">{selectedItem.description}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              关闭
            </Button>
            <Button onClick={() => {
              setShowDetailDialog(false);
              if (selectedItem) openAdjustDialog(selectedItem);
            }}>
              调整库存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Adjustment Dialog */}
      <Dialog open={showAdjustDialog} onOpenChange={setShowAdjustDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>调整库存</DialogTitle>
            <DialogDescription>
              {selectedItem?.name} - 当前库存: {selectedItem?.availableQuantity}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">调整类型</p>
              <div className="flex gap-2">
                <Button
                  variant={adjustment.type === "in" ? "default" : "outline"}
                  onClick={() => setAdjustment({ ...adjustment, type: "in" })}
                  className="flex-1"
                >
                  入库
                </Button>
                <Button
                  variant={adjustment.type === "out" ? "default" : "outline"}
                  onClick={() => setAdjustment({ ...adjustment, type: "out" })}
                  className="flex-1"
                >
                  出库
                </Button>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">数量</p>
              <Input
                type="number"
                min="1"
                value={adjustment.quantity}
                onChange={(e) => setAdjustment({ ...adjustment, quantity: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">原因说明</p>
              <Input
                placeholder="例如：新采购入库 / 工单领用"
                value={adjustment.reason}
                onChange={(e) => setAdjustment({ ...adjustment, reason: e.target.value })}
              />
            </div>
            {selectedItem && adjustment.type === "out" && adjustment.quantity > selectedItem.availableQuantity && (
              <div className="flex items-start gap-2 p-3 bg-red-50 rounded text-red-800 text-sm">
                <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>
                  出库数量超过可用库存！当前可用: {selectedItem.availableQuantity}
                </span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdjustDialog(false)}>
              取消
            </Button>
            <Button
              onClick={handleAdjustment}
              disabled={
                isAdjusting ||
                !adjustment.reason ||
                (adjustment.type === "out" && selectedItem && adjustment.quantity > selectedItem.availableQuantity)
              }
            >
              {isAdjusting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  处理中...
                </>
              ) : (
                "确认调整"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
