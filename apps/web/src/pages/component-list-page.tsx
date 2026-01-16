import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Package,
  Edit2,
  Trash2,
  QrCode,
  Filter,
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
import { ComponentStatusBadge } from "../components/common/status-badge";

/**
 * Component list page with search and filtering
 */
export function ComponentListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [aircraftFilter, setAircraftFilter] = useState<string>("all");

  // Mock data - TODO: Replace with API call
  const aircraft = [
    { id: "ac-001", registration: "B-7011U" },
    { id: "ac-002", registration: "B-7012U" },
    { id: "ac-003", registration: "B-7013U" },
    { id: "ac-004", registration: "B-7021U" },
  ];

  const components = [
    {
      id: "comp-001",
      name: "电机 #1",
      serialNumber: "SN-M001",
      type: "MOTOR",
      manufacturer: "DJI",
      model: "M350 Motor",
      status: "INSTALLED" as const,
      currentAircraftId: "ac-001",
      currentAircraftReg: "B-7011U",
      location: "左前",
      totalFlightHours: 125.5,
      installDate: "2024-03-20",
      dueMaintenance: "50h 后",
    },
    {
      id: "comp-002",
      name: "电机 #2",
      serialNumber: "SN-M002",
      type: "MOTOR",
      manufacturer: "DJI",
      model: "M350 Motor",
      status: "INSTALLED" as const,
      currentAircraftId: "ac-001",
      currentAircraftReg: "B-7011U",
      location: "右前",
      totalFlightHours: 125.5,
      installDate: "2024-03-20",
      dueMaintenance: "50h 后",
    },
    {
      id: "comp-003",
      name: "电机 #3",
      serialNumber: "SN-M003",
      type: "MOTOR",
      manufacturer: "DJI",
      model: "M350 Motor",
      status: "INSTALLED" as const,
      currentAircraftId: "ac-001",
      currentAircraftReg: "B-7011U",
      location: "左后",
      totalFlightHours: 85.2,
      installDate: "2024-05-10",
      dueMaintenance: "正常",
    },
    {
      id: "comp-004",
      name: "电机 #4",
      serialNumber: "SN-M004",
      type: "MOTOR",
      manufacturer: "DJI",
      model: "M350 Motor",
      status: "INSTALLED" as const,
      currentAircraftId: "ac-001",
      currentAircraftReg: "B-7011U",
      location: "右后",
      totalFlightHours: 85.2,
      installDate: "2024-05-10",
      dueMaintenance: "正常",
    },
    {
      id: "comp-005",
      name: "主控模块",
      serialNumber: "SN-FC-001",
      type: "FLIGHT_CONTROLLER",
      manufacturer: "DJI",
      model: "M350 FC",
      status: "INSTALLED" as const,
      currentAircraftId: "ac-001",
      currentAircraftReg: "B-7011U",
      location: "机身内部",
      totalFlightHours: 125.5,
      installDate: "2024-03-15",
      dueMaintenance: "正常",
    },
    {
      id: "comp-006",
      name: "电池包 #1",
      serialNumber: "SN-B001",
      type: "BATTERY",
      manufacturer: "DJI",
      model: "TB65",
      status: "INSTALLED" as const,
      currentAircraftId: "ac-001",
      currentAircraftReg: "B-7011U",
      location: "电池仓1",
      totalFlightHours: 45.0,
      batteryCycles: 28,
      installDate: "2025-12-01",
      dueMaintenance: "需更换",
    },
    {
      id: "comp-007",
      name: "桨叶组",
      serialNumber: "SN-P001",
      type: "PROPELLER",
      manufacturer: "DJI",
      model: "M350 Prop",
      status: "REMOVED" as const,
      currentAircraftId: null,
      currentAircraftReg: null,
      location: "仓库A-01",
      totalFlightHours: 156.8,
      installDate: null,
      removeDate: "2025-12-15",
      removeReason: "定期更换",
      dueMaintenance: "可继续使用",
    },
    {
      id: "comp-008",
      name: "电机备用",
      serialNumber: "SN-M005",
      type: "MOTOR",
      manufacturer: "DJI",
      model: "M350 Motor",
      status: "IN_STOCK" as const,
      currentAircraftId: null,
      currentAircraftReg: null,
      location: "仓库B-05",
      totalFlightHours: 0,
      installDate: null,
      dueMaintenance: "正常",
    },
    {
      id: "comp-009",
      name: "电池包 #2",
      serialNumber: "SN-B002",
      type: "BATTERY",
      manufacturer: "DJI",
      model: "TB65",
      status: "IN_STOCK" as const,
      currentAircraftId: null,
      currentAircraftReg: null,
      location: "充电间",
      totalFlightHours: 234.5,
      batteryCycles: 198,
      installDate: null,
      dueMaintenance: "需更换",
    },
    {
      id: "comp-010",
      name: "报废电机",
      serialNumber: "SN-M999",
      type: "MOTOR",
      manufacturer: "DJI",
      model: "M350 Motor",
      status: "SCRAPPED" as const,
      currentAircraftId: null,
      currentAircraftReg: null,
      location: "报废区",
      totalFlightHours: 512.3,
      installDate: null,
      scrapDate: "2025-11-20",
      scrapReason: "达到寿命上限",
      dueMaintenance: "-",
    },
  ];

  // Component types
  const componentTypes = Array.from(new Set(components.map((c) => c.type)));

  // Filter components
  const filteredComponents = components.filter((comp) => {
    const matchesSearch =
      comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.model.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || comp.status === statusFilter;
    const matchesType = typeFilter === "all" || comp.type === typeFilter;
    const matchesAircraft =
      aircraftFilter === "all" ||
      (aircraftFilter === "installed" && comp.status === "INSTALLED") ||
      comp.currentAircraftId === aircraftFilter;

    return matchesSearch && matchesStatus && matchesType && matchesAircraft;
  });

  // Status counts
  const statusCounts = components.reduce(
    (acc, comp) => {
      acc[comp.status] = (acc[comp.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">零部件管理</h1>
          <p className="text-muted-foreground">
            管理所有零部件的履历、状态和维保信息
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          新建零部件
        </Button>
      </div>

      {/* Status Filter Bar */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={statusFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("all")}
        >
          全部 ({components.length})
        </Button>
        <Button
          variant={statusFilter === "INSTALLED" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("INSTALLED")}
          className="data-[variant=default]:bg-component-installed-bg data-[variant=default]:text-component-installed"
        >
          已装机 ({statusCounts.INSTALLED || 0})
        </Button>
        <Button
          variant={statusFilter === "IN_STOCK" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("IN_STOCK")}
          className="data-[variant=default]:bg-component-in-stock-bg data-[variant=default]:text-component-in-stock"
        >
          在库 ({statusCounts.IN_STOCK || 0})
        </Button>
        <Button
          variant={statusFilter === "REMOVED" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("REMOVED")}
          className="data-[variant=default]:bg-component-removed-bg data-[variant=default]:text-component-removed"
        >
          已拆下 ({statusCounts.REMOVED || 0})
        </Button>
        <Button
          variant={statusFilter === "SCRAPPED" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("SCRAPPED")}
          className="data-[variant=default]:bg-component-scrapped-bg data-[variant=default]:text-component-scrapped"
        >
          已报废 ({statusCounts.SCRAPPED || 0})
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索名称、序列号或型号..."
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
              {componentTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <select
              value={aircraftFilter}
              onChange={(e) => setAircraftFilter(e.target.value)}
              className="h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="all">全部飞机</option>
              <option value="installed">已装机</option>
              {aircraft.map((ac) => (
                <option key={ac.id} value={ac.id}>
                  {ac.registration}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Components Table */}
      <Card>
        <CardHeader>
          <CardTitle>零部件列表</CardTitle>
          <CardDescription>
            共 {filteredComponents.length} 个零部件
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    名称
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    序列号
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    类型
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    型号
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    状态
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    当前位置
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    飞行小时
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredComponents.map((comp) => (
                  <tr key={comp.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <Link
                        to={`/components/${comp.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {comp.name}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono">{comp.serialNumber}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          title="查看二维码"
                        >
                          <QrCode className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">{comp.type}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {comp.model}
                    </td>
                    <td className="py-3 px-4">
                      <ComponentStatusBadge status={comp.status} />
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {comp.currentAircraftReg ? (
                        <Link
                          to={`/aircraft/${comp.currentAircraftId}`}
                          className="text-primary hover:underline"
                        >
                          {comp.currentAircraftReg} ({comp.location})
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">{comp.location}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <div>
                        <span>{comp.totalFlightHours}h</span>
                        {comp.batteryCycles && (
                          <span className="text-muted-foreground ml-1">
                            ({comp.batteryCycles} 循环)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredComponents.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">未找到零部件</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ||
                statusFilter !== "all" ||
                typeFilter !== "all" ||
                aircraftFilter !== "all"
                  ? "尝试调整搜索或筛选条件"
                  : "点击上方按钮创建第一个零部件"}
              </p>
              {!searchQuery &&
                statusFilter === "all" &&
                typeFilter === "all" &&
                aircraftFilter === "all" && (
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    新建零部件
                  </Button>
                )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
