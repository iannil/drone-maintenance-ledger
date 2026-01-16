import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Package,
  Edit2,
  Trash2,
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
import { Skeleton } from "../components/ui/skeleton";
import { ComponentStatusBadge } from "../components/common/status-badge";
import {
  componentService,
  Component,
  ComponentType,
  ComponentStatus,
  COMPONENT_TYPE_LABELS,
  COMPONENT_STATUS_LABELS,
  STATUS_DISPLAY_MAP,
} from "../services/component.service";
import { fullAircraftService, Aircraft } from "../services/fleet.service";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";

/**
 * Component list page with search and filtering
 */
export function ComponentListPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [components, setComponents] = useState<Component[]>([]);
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteComponentId, setDeleteComponentId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load components and aircraft
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [componentData, aircraftData] = await Promise.all([
          componentService.list(),
          fullAircraftService.list(),
        ]);
        setComponents(componentData);
        setAircraft(aircraftData);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Create a map of aircraft IDs to registration numbers
  const aircraftMap = useMemo(() => {
    const map = new Map<string, string>();
    aircraft.forEach(ac => map.set(ac.id, ac.registrationNumber));
    return map;
  }, [aircraft]);

  // Component types for filter dropdown
  const componentTypes: ComponentType[] = [
    "MOTOR",
    "PROPELLER",
    "BATTERY",
    "ESC",
    "FLIGHT_CONTROLLER",
    "GPS",
    "CAMERA",
    "GIMBAL",
    "LANDING_GEAR",
    "OTHER",
  ];

  // Filter components
  const filteredComponents = useMemo(() => {
    return components.filter((comp) => {
      const matchesSearch =
        comp.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.partNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (comp.model?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        comp.manufacturer.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || comp.status === statusFilter;
      const matchesType = typeFilter === "all" || comp.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [components, searchQuery, statusFilter, typeFilter]);

  // Status counts
  const statusCounts = useMemo(() => {
    return components.reduce(
      (acc, comp) => {
        acc[comp.status] = (acc[comp.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
  }, [components]);

  const handleDelete = async () => {
    if (!deleteComponentId) return;
    setIsDeleting(true);
    try {
      await componentService.delete(deleteComponentId);
      setComponents(components.filter(c => c.id !== deleteComponentId));
      setDeleteComponentId(null);
    } catch (error) {
      console.error("Failed to delete component:", error);
    } finally {
      setIsDeleting(false);
    }
  };

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
        <Button onClick={() => navigate("/components/new")}>
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
          variant={statusFilter === "NEW" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("NEW")}
          className="data-[variant=default]:bg-component-in-stock-bg data-[variant=default]:text-component-in-stock"
        >
          全新 ({statusCounts.NEW || 0})
        </Button>
        <Button
          variant={statusFilter === "IN_USE" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("IN_USE")}
          className="data-[variant=default]:bg-component-installed-bg data-[variant=default]:text-component-installed"
        >
          使用中 ({statusCounts.IN_USE || 0})
        </Button>
        <Button
          variant={statusFilter === "REPAIR" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("REPAIR")}
          className="data-[variant=default]:bg-component-removed-bg data-[variant=default]:text-component-removed"
        >
          维修中 ({statusCounts.REPAIR || 0})
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
                placeholder="搜索序列号、料号、型号或制造商..."
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
                  {COMPONENT_TYPE_LABELS[type]}
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
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                      序列号
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                      料号
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
                      飞行小时
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                      适航状态
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
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/components/${comp.id}`}
                            className="font-medium text-primary hover:underline font-mono"
                          >
                            {comp.serialNumber}
                          </Link>
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
                      <td className="py-3 px-4 text-sm font-mono">
                        {comp.partNumber}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {COMPONENT_TYPE_LABELS[comp.type as ComponentType]}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {comp.model || "-"}
                      </td>
                      <td className="py-3 px-4">
                        <ComponentStatusBadge
                          status={STATUS_DISPLAY_MAP[comp.status]}
                          label={COMPONENT_STATUS_LABELS[comp.status]}
                        />
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <div>
                          <span>{comp.totalFlightHours}h</span>
                          {comp.type === "BATTERY" && comp.batteryCycles > 0 && (
                            <span className="text-muted-foreground ml-1">
                              ({comp.batteryCycles} 循环)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span className={comp.isAirworthy ? "text-green-600" : "text-red-600"}>
                          {comp.isAirworthy ? "适航" : "不适航"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/components/${comp.id}/edit`)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => setDeleteComponentId(comp.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredComponents.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">未找到零部件</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                  ? "尝试调整搜索或筛选条件"
                  : "点击上方按钮创建第一个零部件"}
              </p>
              {!searchQuery && statusFilter === "all" && typeFilter === "all" && (
                <Button onClick={() => navigate("/components/new")}>
                  <Plus className="w-4 h-4 mr-2" />
                  新建零部件
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteComponentId} onOpenChange={() => setDeleteComponentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除零部件？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作无法撤销。删除零部件后，相关的安装记录和维保记录将被保留但失去关联。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
