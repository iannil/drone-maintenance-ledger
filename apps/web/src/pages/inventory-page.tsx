import { useState, useMemo } from "react";
import {
  Package,
  Search,
  Filter,
  Plus,
  Edit2,
  AlertTriangle,
  ArrowUpDown,
  Warehouse,
  BarChart3,
  Download,
  Upload,
  QrCode,
  Eye,
} from "lucide-react";
import { Link } from "react-router-dom";
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

// Mock inventory data
const MOCK_INVENTORY = [
  {
    id: "inv-001",
    partId: "part-001",
    partNumber: "MOTOR-350-01",
    partName: "电机组件",
    category: "动力系统",
    manufacturer: "DJI",
    specifications: { voltage: "48V", maxCurrent: "30A", weight: "280g" },
    unit: "个",
    totalQuantity: 8,
    availableQuantity: 5,
    reservedQuantity: 2,
    minimumStock: 3,
    locations: [
      { warehouse: "主仓库", area: "A区", position: "A-01-01", quantity: 3 },
      { warehouse: "主仓库", area: "A区", position: "A-01-02", quantity: 2 },
    ],
    unitCost: 2800,
    lastRestockDate: "2025-12-15",
    lastRestockSupplier: "DJI官方授权",
    compatibleAircraft: ["DJI M350 RTK", "DJI M300 RTK"],
  },
  {
    id: "inv-002",
    partId: "part-002",
    partNumber: "PROP-350-21",
    partName: "螺旋桨",
    category: "动力系统",
    manufacturer: "DJI",
    specifications: { length: "21英寸", material: "碳纤维", weight: "45g" },
    unit: "个",
    totalQuantity: 48,
    availableQuantity: 40,
    reservedQuantity: 8,
    minimumStock: 16,
    locations: [
      { warehouse: "主仓库", area: "B区", position: "B-03-01", quantity: 24 },
      { warehouse: "主仓库", area: "B区", position: "B-03-02", quantity: 16 },
      { warehouse: "备用仓库", area: "C区", position: "C-01-01", quantity: 8 },
    ],
    unitCost: 180,
    lastRestockDate: "2025-12-20",
    lastRestockSupplier: "DJI官方授权",
    compatibleAircraft: ["DJI M350 RTK"],
  },
  {
    id: "inv-003",
    partId: "part-003",
    partNumber: "BATT-TB65",
    partName: "智能飞行电池 TB65",
    category: "电源系统",
    manufacturer: "DJI",
    specifications: { capacity: "4920mAh", voltage: "51.8V", cells: 12 },
    unit: "个",
    totalQuantity: 15,
    availableQuantity: 10,
    reservedQuantity: 5,
    minimumStock: 6,
    locations: [
      { warehouse: "主仓库", area: "C区", position: "C-01-01", quantity: 10 },
      { warehouse: "备用仓库", area: "C区", position: "C-01-02", quantity: 5 },
    ],
    unitCost: 3200,
    lastRestockDate: "2025-11-10",
    lastRestockSupplier: "DJI官方授权",
    compatibleAircraft: ["DJI M350 RTK"],
  },
  {
    id: "inv-004",
    partId: "part-004",
    partNumber: "GPS-M300-01",
    partName: "GPS模块",
    category: "导航系统",
    manufacturer: "DJI",
    specifications: { gnss: "GPS+GLONASS+BeiDou", accuracy: "RTK 1cm+1ppm" },
    unit: "个",
    totalQuantity: 2,
    availableQuantity: 0,
    reservedQuantity: 2,
    minimumStock: 2,
    locations: [
      { warehouse: "主仓库", area: "A区", position: "A-05-01", quantity: 0 },
    ],
    unitCost: 1500,
    lastRestockDate: "2025-08-15",
    lastRestockSupplier: "DJI官方授权",
    compatibleAircraft: ["DJI M300 RTK", "DJI M350 RTK"],
  },
  {
    id: "inv-005",
    partId: "part-005",
    partNumber: "FC-350-01",
    partName: "主控板",
    category: "控制系统",
    manufacturer: "DJI",
    specifications: { imu: "双IMU", processor: "ARM Cortex" },
    unit: "个",
    totalQuantity: 3,
    availableQuantity: 1,
    reservedQuantity: 2,
    minimumStock: 1,
    locations: [
      { warehouse: "主仓库", area: "A区", position: "A-02-01", quantity: 1 },
    ],
    unitCost: 5800,
    lastRestockDate: "2025-09-20",
    lastRestockSupplier: "DJI官方授权",
    compatibleAircraft: ["DJI M350 RTK"],
  },
  {
    id: "inv-006",
    partId: "part-006",
    partNumber: "GIMBAL-Z30",
    partName: "云台相机 Z30",
    category: "任务载荷",
    manufacturer: "DJI",
    specifications: { zoom: "30x光学", sensor: "1/2.3\" CMOS", resolution: "4K" },
    unit: "个",
    totalQuantity: 4,
    availableQuantity: 3,
    reservedQuantity: 1,
    minimumStock: 1,
    locations: [
      { warehouse: "主仓库", area: "D区", position: "D-01-01", quantity: 3 },
    ],
    unitCost: 12000,
    lastRestockDate: "2025-10-05",
    lastRestockSupplier: "DJI官方授权",
    compatibleAircraft: ["DJI M300 RTK", "DJI M350 RTK"],
  },
  {
    id: "inv-007",
    partId: "part-007",
    partNumber: "CABLE-PWR-EXT",
    partName: "电源延长线",
    category: "线缆配件",
    manufacturer: "第三方",
    specifications: { length: "30cm", gauge: "18AWG" },
    unit: "根",
    totalQuantity: 20,
    availableQuantity: 18,
    reservedQuantity: 2,
    minimumStock: 5,
    locations: [
      { warehouse: "主仓库", area: "E区", position: "E-01-01", quantity: 20 },
    ],
    unitCost: 45,
    lastRestockDate: "2025-12-01",
    lastRestockSupplier: "配件供应商A",
    compatibleAircraft: ["通用"],
  },
];

type SortField = "partNumber" | "partName" | "availableQuantity" | "totalQuantity" | "unitCost";
type SortOrder = "asc" | "desc";
type CategoryFilter = "all" | string;
type StockFilter = "all" | "low" | "out" | "normal";

/**
 * Inventory management page
 */
export function InventoryPage() {
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [sortField, setSortField] = useState<SortField>("partNumber");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // Dialog state
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showAdjustDialog, setShowAdjustDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<typeof MOCK_INVENTORY[0] | null>(null);
  const [adjustment, setAdjustment] = useState({ type: "in" as "in" | "out", quantity: 1, reason: "" });

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(MOCK_INVENTORY.map((item) => item.category));
    return Array.from(cats);
  }, []);

  // Filter and sort inventory
  const filteredInventory = useMemo(() => {
    let filtered = [...MOCK_INVENTORY];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.partNumber.toLowerCase().includes(query) ||
          item.partName.toLowerCase().includes(query) ||
          item.manufacturer.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((item) => item.category === categoryFilter);
    }

    // Stock status filter
    if (stockFilter === "low") {
      filtered = filtered.filter(
        (item) => item.availableQuantity > 0 && item.availableQuantity <= item.minimumStock
      );
    } else if (stockFilter === "out") {
      filtered = filtered.filter((item) => item.availableQuantity === 0);
    } else if (stockFilter === "normal") {
      filtered = filtered.filter((item) => item.availableQuantity > item.minimumStock);
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [searchQuery, categoryFilter, stockFilter, sortField, sortOrder]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalItems = MOCK_INVENTORY.length;
    const lowStockItems = MOCK_INVENTORY.filter(
      (item) => item.availableQuantity > 0 && item.availableQuantity <= item.minimumStock
    ).length;
    const outOfStockItems = MOCK_INVENTORY.filter(
      (item) => item.availableQuantity === 0
    ).length;
    const totalValue = MOCK_INVENTORY.reduce(
      (sum, item) => sum + item.totalQuantity * item.unitCost,
      0
    );

    return { totalItems, lowStockItems, outOfStockItems, totalValue };
  }, []);

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
  const getStockStatus = (item: typeof MOCK_INVENTORY[0]) => {
    if (item.availableQuantity === 0) {
      return { label: "缺货", color: "bg-red-100 text-red-700", icon: AlertTriangle };
    }
    if (item.availableQuantity <= item.minimumStock) {
      return { label: "库存不足", color: "bg-yellow-100 text-yellow-700", icon: AlertTriangle };
    }
    return { label: "正常", color: "bg-green-100 text-green-700", icon: Package };
  };

  // Open detail dialog
  const openDetailDialog = (item: typeof MOCK_INVENTORY[0]) => {
    setSelectedItem(item);
    setShowDetailDialog(true);
  };

  // Open adjustment dialog
  const openAdjustDialog = (item: typeof MOCK_INVENTORY[0]) => {
    setSelectedItem(item);
    setAdjustment({ type: "in", quantity: 1, reason: "" });
    setShowAdjustDialog(true);
  };

  // Handle stock adjustment
  const handleAdjustment = () => {
    console.log("Adjust stock:", selectedItem, adjustment);
    // TODO: API call to adjust stock
    setShowAdjustDialog(false);
  };

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
            <div className="text-2xl font-bold">{stats.totalItems}</div>
            <p className="text-xs text-muted-foreground mt-1">共计 {MOCK_INVENTORY.reduce((s, i) => s + i.totalQuantity, 0)} 件</p>
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
            <div className="text-2xl font-bold text-yellow-600">{stats.lowStockItems}</div>
            <p className="text-xs text-muted-foreground mt-1">低于最低库存量</p>
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
            <div className="text-2xl font-bold text-red-600">{stats.outOfStockItems}</div>
            <p className="text-xs text-muted-foreground mt-1">需要立即补货</p>
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
            <div className="text-2xl font-bold">
              ¥{(stats.totalValue / 10000).toFixed(1)}万
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              总价值 ¥{stats.totalValue.toLocaleString()}
            </p>
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
                placeholder="搜索件号、配件名称或制造商..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
                      onClick={() => handleSort("partName")}
                    >
                      配件名称
                      {sortField === "partName" && (
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
                            <p className="font-medium">{item.partName}</p>
                            <p className="text-xs text-muted-foreground">{item.manufacturer}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">{item.category}</td>
                        <td className="py-3 px-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Warehouse className="h-3 w-3 text-muted-foreground" />
                            {item.locations[0]?.position || "-"}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="font-medium">{item.availableQuantity}</span>
                            <span className="text-muted-foreground">/ {item.totalQuantity}</span>
                            <span className="text-muted-foreground text-xs">{item.unit}</span>
                          </div>
                          {item.reservedQuantity > 0 && (
                            <p className="text-xs text-amber-600 text-right">
                              已预留 {item.reservedQuantity}
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-medium">
                          ¥{item.unitCost.toLocaleString()}
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
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>配件详情</DialogTitle>
            <DialogDescription>
              {selectedItem?.partNumber} - {selectedItem?.partName}
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
                  <p className="font-medium">{selectedItem.partName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">分类</p>
                  <p className="font-medium">{selectedItem.category}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">制造商</p>
                  <p className="font-medium">{selectedItem.manufacturer}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">单价</p>
                  <p className="font-medium">¥{selectedItem.unitCost.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">单位</p>
                  <p className="font-medium">{selectedItem.unit}</p>
                </div>
              </div>

              {/* Stock Info */}
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm font-medium mb-3">库存信息</p>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">总库存</p>
                    <p className="font-medium">{selectedItem.totalQuantity} {selectedItem.unit}</p>
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

              {/* Locations */}
              <div>
                <p className="text-sm font-medium mb-2">存储位置</p>
                <div className="space-y-2">
                  {selectedItem.locations.map((loc, i) => (
                    <div key={i} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <Warehouse className="h-4 w-4 text-muted-foreground" />
                        <span>{loc.warehouse}</span>
                        <span className="text-muted-foreground">·</span>
                        <span>{loc.area}</span>
                        <span className="text-muted-foreground">·</span>
                        <span className="font-mono">{loc.position}</span>
                      </div>
                      <span className="font-medium">{loc.quantity} {selectedItem.unit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Specifications */}
              <div>
                <p className="text-sm font-medium mb-2">技术规格</p>
                <div className="p-3 bg-slate-50 rounded text-sm space-y-1">
                  {Object.entries(selectedItem.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-muted-foreground">{key}:</span>
                      <span>{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compatible Aircraft */}
              <div>
                <p className="text-sm font-medium mb-2">适用机型</p>
                <div className="flex flex-wrap gap-2">
                  {selectedItem.compatibleAircraft.map((aircraft, i) => (
                    <Badge key={i} variant="outline">
                      {aircraft}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Restock Info */}
              <div className="text-xs text-muted-foreground">
                <p>上次补货: {selectedItem.lastRestockDate}</p>
                <p>供应商: {selectedItem.lastRestockSupplier}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              关闭
            </Button>
            <Button onClick={() => {
              setShowDetailDialog(false);
              openAdjustDialog(selectedItem!);
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
              {selectedItem?.partName} - 当前库存: {selectedItem?.availableQuantity}
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
              disabled={!adjustment.reason || (adjustment.type === "out" && selectedItem && adjustment.quantity > selectedItem.availableQuantity)}
            >
              确认调整
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
