import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Package,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Search,
  Filter,
  Bell,
  BellOff,
  Download,
  ArrowUp,
  ArrowDown,
  Warehouse,
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

// 预警级别
const ALERT_LEVELS = {
  CRITICAL: {
    label: "严重",
    color: "bg-red-100 text-red-700 border-red-200",
    icon: AlertCircle,
    description: "库存不足，急需补货",
  },
  WARNING: {
    label: "警告",
    color: "bg-orange-100 text-orange-700 border-orange-200",
    icon: AlertTriangle,
    description: "库存偏低，建议补货",
  },
  INFO: {
    label: "提示",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    icon: Bell,
    description: "接近预警线，请关注",
  },
  NORMAL: {
    label: "正常",
    color: "bg-green-100 text-green-700 border-green-200",
    icon: CheckCircle2,
    description: "库存充足",
  },
};

// 预警类型
const ALERT_TYPES = {
  LOW_STOCK: { label: "库存不足", color: "bg-red-50 text-red-700" },
  OVERSTOCK: { label: "库存过剩", color: "bg-blue-50 text-blue-700" },
  EXPIRING: { label: "即将过期", color: "bg-orange-50 text-orange-700" },
  EXPIRED: { label: "已过期", color: "bg-red-50 text-red-700" },
  SLOW_MOVING: { label: "周转缓慢", color: "bg-yellow-50 text-yellow-700" },
};

/**
 * 零部件库存预警页面
 */
export function InventoryAlertsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);

  // 预警数据
  const inventoryAlerts = [
    {
      id: "alert-001",
      partId: "part-001",
      partNumber: "EM-2814-001",
      partName: "电机 AX-2814",
      specification: "380KV",
      currentStock: 2,
      minStock: 5,
      maxStock: 20,
      reorderPoint: 5,
      reorderQuantity: 10,
      unit: "个",
      level: "CRITICAL",
      type: "LOW_STOCK",
      location: "仓库A-01",
      lastPurchase: "2025-12-15",
      lastUsage: "2026-01-14",
      avgMonthlyUsage: 8,
      trend: "down",
      trendValue: -15,
      suggestedAction: "立即采购",
      suppliers: ["供应商A", "供应商B"],
    },
    {
      id: "alert-002",
      partId: "part-002",
      partNumber: "PR-2995-002",
      partName: "螺旋桨 29x9.5",
      specification: "碳纤维",
      currentStock: 6,
      minStock: 8,
      maxStock: 30,
      reorderPoint: 8,
      reorderQuantity: 15,
      unit: "片",
      level: "WARNING",
      type: "LOW_STOCK",
      location: "仓库A-02",
      lastPurchase: "2025-12-20",
      lastUsage: "2026-01-15",
      avgMonthlyUsage: 12,
      trend: "down",
      trendValue: -8,
      suggestedAction: "建议补货",
      suppliers: ["供应商C"],
    },
    {
      id: "alert-003",
      partId: "part-003",
      partNumber: "BT-16000-001",
      partName: "电池包 16000mAh",
      specification: "LiPo 6S",
      currentStock: 0,
      minStock: 4,
      maxStock: 12,
      reorderPoint: 4,
      reorderQuantity: 6,
      unit: "个",
      level: "CRITICAL",
      type: "LOW_STOCK",
      location: "电池房",
      lastPurchase: "2025-12-10",
      lastUsage: "2026-01-15",
      avgMonthlyUsage: 6,
      trend: "down",
      trendValue: -20,
      suggestedAction: "紧急采购",
      suppliers: ["供应商A", "供应商D"],
    },
    {
      id: "alert-004",
      partId: "part-004",
      partNumber: "ES-40A-003",
      partName: "电调 40A",
      specification: "BLHeli-S",
      currentStock: 35,
      minStock: 4,
      maxStock: 15,
      reorderPoint: 5,
      reorderQuantity: 10,
      unit: "个",
      level: "WARNING",
      type: "OVERSTOCK",
      location: "仓库B-01",
      lastPurchase: "2025-11-15",
      lastUsage: "2026-01-10",
      avgMonthlyUsage: 3,
      trend: "up",
      trendValue: 200,
      suggestedAction: "控制采购",
      suppliers: ["供应商B"],
    },
    {
      id: "alert-005",
      partId: "part-005",
      partNumber: "GPS-MODULE-004",
      partName: "GPS模块",
      specification: "M8N",
      currentStock: 3,
      minStock: 3,
      maxStock: 10,
      reorderPoint: 4,
      reorderQuantity: 5,
      unit: "个",
      level: "INFO",
      type: "LOW_STOCK",
      location: "电子仓",
      lastPurchase: "2026-01-05",
      lastUsage: "2026-01-12",
      avgMonthlyUsage: 4,
      trend: "down",
      trendValue: -5,
      suggestedAction: "关注库存",
      suppliers: ["供应商E"],
    },
    {
      id: "alert-006",
      partId: "part-006",
      partNumber: "LG-FRONT-005",
      partName: "起落架前",
      specification: "折叠式",
      currentStock: 8,
      minStock: 2,
      maxStock: 8,
      reorderPoint: 3,
      reorderQuantity: 5,
      unit: "个",
      level: "WARNING",
      type: "SLOW_MOVING",
      location: "仓库B-03",
      lastPurchase: "2025-08-20",
      lastUsage: "2025-12-01",
      avgMonthlyUsage: 0.5,
      trend: "flat",
      trendValue: 0,
      suggestedAction: "减少备货",
      suppliers: ["供应商F"],
    },
    {
      id: "alert-007",
      partId: "part-007",
      partNumber: "FC-V3-006",
      partName: "飞控控制器 V3",
      specification: "Pixhawk 6C",
      currentStock: 2,
      minStock: 2,
      maxStock: 6,
      reorderPoint: 3,
      reorderQuantity: 3,
      unit: "个",
      level: "INFO",
      type: "LOW_STOCK",
      location: "电子仓",
      lastPurchase: "2025-11-10",
      lastUsage: "2026-01-08",
      avgMonthlyUsage: 2,
      trend: "down",
      trendValue: -10,
      suggestedAction: "关注库存",
      suppliers: ["供应商G"],
    },
    {
      id: "alert-008",
      partId: "part-008",
      partNumber: "CABLE-XT90-007",
      partName: "XT90连接线",
      specification: "12AWG",
      currentStock: 50,
      minStock: 10,
      maxStock: 30,
      reorderPoint: 15,
      reorderQuantity: 20,
      unit: "根",
      level: "WARNING",
      type: "OVERSTOCK",
      location: "配件区",
      lastPurchase: "2025-10-05",
      lastUsage: "2026-01-14",
      avgMonthlyUsage: 8,
      trend: "up",
      trendValue: 150,
      suggestedAction: "暂停采购",
      suppliers: ["供应商H"],
    },
  ];

  // 筛选预警
  const filteredAlerts = inventoryAlerts.filter((alert) => {
    const matchesSearch =
      searchQuery === "" ||
      alert.partName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.partNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLevel = levelFilter === "all" || alert.level === levelFilter;
    const matchesType = typeFilter === "all" || alert.type === typeFilter;

    return matchesSearch && matchesLevel && matchesType;
  });

  // 统计
  const stats = {
    total: filteredAlerts.length,
    critical: filteredAlerts.filter((a) => a.level === "CRITICAL").length,
    warning: filteredAlerts.filter((a) => a.level === "WARNING").length,
    info: filteredAlerts.filter((a) => a.level === "INFO").length,
  };

  // 查看详情
  const viewDetail = (alert: typeof inventoryAlerts[0]) => {
    setSelectedAlert(alert);
    setShowDetailDialog(true);
  };

  // 库存进度条
  const StockProgressBar = ({ current, min, max }: { current: number; min: number; max: number }) => {
    const percentage = Math.min((current / max) * 100, 100);
    const minPercentage = (min / max) * 100;

    return (
      <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="absolute h-full bg-slate-300 rounded-full"
          style={{ width: `${minPercentage}%` }}
        />
        <div
          className={`absolute h-full rounded-full ${
            current < min ? "bg-red-500" :
            current < min * 1.5 ? "bg-orange-500" :
            "bg-green-500"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  };

  // 趋势指示器
  const TrendIndicator = ({ trend, value }: { trend: string; value: number }) => {
    if (trend === "up") {
      return (
        <span className="flex items-center text-green-600 text-xs">
          <ArrowUp className="h-3 w-3 mr-1" />
          {value > 0 ? `+${value}%` : "0%"}
        </span>
      );
    } else if (trend === "down") {
      return (
        <span className="flex items-center text-red-600 text-xs">
          <ArrowDown className="h-3 w-3 mr-1" />
          {value}%
        </span>
      );
    }
    return (
      <span className="flex items-center text-muted-foreground text-xs">
        持平
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">库存预警</h1>
          <p className="text-muted-foreground">
            零部件库存异常预警和建议
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            导出报告
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Bell className="h-4 w-4" />
              全部预警
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              严重预警
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
          </CardContent>
        </Card>
        <Card className="border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              警告
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.warning}</div>
          </CardContent>
        </Card>
        <Card className="border-yellow-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Bell className="h-4 w-4 text-yellow-600" />
              提示
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.info}</div>
          </CardContent>
        </Card>
      </div>

      {/* Level Filter Bar */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={levelFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setLevelFilter("all")}
        >
          全部 ({stats.total})
        </Button>
        <Button
          variant={levelFilter === "CRITICAL" ? "default" : "outline"}
          size="sm"
          onClick={() => setLevelFilter("CRITICAL")}
          className={levelFilter === "CRITICAL" ? "bg-red-600 hover:bg-red-700" : ""}
        >
          严重 ({stats.critical})
        </Button>
        <Button
          variant={levelFilter === "WARNING" ? "default" : "outline"}
          size="sm"
          onClick={() => setLevelFilter("WARNING")}
          className={levelFilter === "WARNING" ? "bg-orange-600 hover:bg-orange-700" : ""}
        >
          警告 ({stats.warning})
        </Button>
        <Button
          variant={levelFilter === "INFO" ? "default" : "outline"}
          size="sm"
          onClick={() => setLevelFilter("INFO")}
          className={levelFilter === "INFO" ? "bg-yellow-600 hover:bg-yellow-700" : ""}
        >
          提示 ({stats.info})
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索零件名称或编号..."
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
              {Object.entries(ALERT_TYPES).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <Card>
        <CardHeader>
          <CardTitle>预警列表</CardTitle>
          <CardDescription>
            共 {filteredAlerts.length} 条预警
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAlerts.map((alert) => {
              const LevelIcon = ALERT_LEVELS[alert.level as keyof typeof ALERT_LEVELS].icon;

              return (
                <div
                  key={alert.id}
                  className={`border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                    alert.level === "CRITICAL" ? "border-red-200 bg-red-50/30" :
                    alert.level === "WARNING" ? "border-orange-200 bg-orange-50/30" :
                    ""
                  }`}
                  onClick={() => viewDetail(alert)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Level Icon */}
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        alert.level === "CRITICAL" ? "bg-red-100" :
                        alert.level === "WARNING" ? "bg-orange-100" :
                        "bg-yellow-100"
                      }`}>
                        <LevelIcon className={`h-5 w-5 ${
                          alert.level === "CRITICAL" ? "text-red-600" :
                          alert.level === "WARNING" ? "text-orange-600" :
                          "text-yellow-600"
                        }`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Link
                            to={`/inventory`}
                            className="font-medium hover:text-primary"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {alert.partName}
                          </Link>
                          <span className="text-sm text-muted-foreground">
                            ({alert.partNumber})
                          </span>
                          <Badge className={ALERT_LEVELS[alert.level as keyof typeof ALERT_LEVELS].color}>
                            {ALERT_LEVELS[alert.level as keyof typeof ALERT_LEVELS].label}
                          </Badge>
                          <Badge className={ALERT_TYPES[alert.type as keyof typeof ALERT_TYPES].color}>
                            {ALERT_TYPES[alert.type as keyof typeof ALERT_TYPES].label}
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground mb-2">
                          规格: {alert.specification} | 位置: {alert.location}
                        </p>

                        {/* Stock Progress */}
                        <div className="mb-2">
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                            <span>库存: {alert.currentStock} / {alert.maxStock} {alert.unit}</span>
                            <span>最小: {alert.minStock} {alert.unit}</span>
                          </div>
                          <StockProgressBar
                            current={alert.currentStock}
                            min={alert.minStock}
                            max={alert.maxStock}
                          />
                        </div>

                        {/* Details */}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            月均用量: {alert.avgMonthlyUsage} {alert.unit}
                          </span>
                          <TrendIndicator trend={alert.trend} value={alert.trendValue} />
                          <span className="flex items-center gap-1">
                            建议操作: <span className={`font-medium ${
                              alert.level === "CRITICAL" ? "text-red-600" :
                              alert.level === "WARNING" ? "text-orange-600" :
                              "text-yellow-600"
                            }`}>{alert.suggestedAction}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground mb-1">建议采购</p>
                      <p className="text-lg font-bold">{alert.reorderQuantity} {alert.unit}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredAlerts.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">暂无预警</h3>
              <p className="text-muted-foreground">
                所有零部件库存状态正常
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>库存预警详情</DialogTitle>
            <DialogDescription>
              {selectedAlert?.partName}
            </DialogDescription>
          </DialogHeader>
          {selectedAlert && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">零件编号</Label>
                  <p className="font-medium">{selectedAlert.partNumber}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">规格</Label>
                  <p className="font-medium">{selectedAlert.specification}</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label className="text-muted-foreground">当前库存</Label>
                  <p className="font-medium text-lg">{selectedAlert.currentStock} {selectedAlert.unit}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">最小库存</Label>
                  <p className="font-medium">{selectedAlert.minStock} {selectedAlert.unit}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">最大库存</Label>
                  <p className="font-medium">{selectedAlert.maxStock} {selectedAlert.unit}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">补货点</Label>
                  <p className="font-medium">{selectedAlert.reorderPoint} {selectedAlert.unit}</p>
                </div>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">库存分析</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-muted-foreground">存放位置</Label>
                    <p className="font-medium flex items-center gap-1">
                      <Warehouse className="h-3.5 w-3.5" />
                      {selectedAlert.location}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">预警级别</Label>
                    <p className="font-medium">
                      <Badge className={ALERT_LEVELS[selectedAlert.level as keyof typeof ALERT_LEVELS].color}>
                        {ALERT_LEVELS[selectedAlert.level as keyof typeof ALERT_LEVELS].label}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">月均用量</Label>
                    <p className="font-medium">{selectedAlert.avgMonthlyUsage} {selectedAlert.unit}/月</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">建议补货量</Label>
                    <p className="font-medium">{selectedAlert.reorderQuantity} {selectedAlert.unit}</p>
                  </div>
                </div>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">操作建议</h4>
                <p className="text-sm">{selectedAlert.suggestedAction}</p>
                <div className="mt-2">
                  <Label className="text-muted-foreground">供应商</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedAlert.suppliers.map((supplier: string, index: number) => (
                      <Badge key={index} variant="outline">{supplier}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              关闭
            </Button>
            <Button>
              创建采购申请
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
