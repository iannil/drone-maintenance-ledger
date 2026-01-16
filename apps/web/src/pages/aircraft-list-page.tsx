import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Plane,
  Edit2,
  Trash2,
  MoreHorizontal,
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
import { AircraftStatusBadge } from "../components/common/status-badge";
import { fullAircraftService, fleetService, Aircraft, Fleet, AircraftStatus } from "../services/fleet.service";
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
import { api } from "../services/api";

/**
 * Map backend status to frontend status badge
 */
const STATUS_MAP: Record<AircraftStatus, "SERVICEABLE" | "MAINTENANCE" | "GROUNDED" | "RETIRED"> = {
  AVAILABLE: "SERVICEABLE",
  IN_MAINTENANCE: "MAINTENANCE",
  AOG: "GROUNDED",
  RETIRED: "RETIRED",
};

/**
 * Status display labels
 */
const STATUS_LABELS: Record<AircraftStatus, string> = {
  AVAILABLE: "可用",
  IN_MAINTENANCE: "维护中",
  AOG: "停飞",
  RETIRED: "退役",
};

/**
 * Aircraft list page with search and filtering
 */
export function AircraftListPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [fleetFilter, setFleetFilter] = useState<string>("all");
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [fleets, setFleets] = useState<Fleet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteAircraftId, setDeleteAircraftId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load aircraft and fleets
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [aircraftData, fleetData] = await Promise.all([
          fullAircraftService.list(),
          fleetService.list(),
        ]);
        setAircraft(aircraftData);
        setFleets(fleetData);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Create a map of fleet IDs to fleet names
  const fleetMap = useMemo(() => {
    const map = new Map<string, string>();
    fleets.forEach(f => map.set(f.id, f.name));
    return map;
  }, [fleets]);

  // Filter aircraft
  const filteredAircraft = useMemo(() => {
    return aircraft.filter((ac) => {
      const matchesSearch =
        ac.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ac.model.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || ac.status === statusFilter;
      const matchesFleet = fleetFilter === "all" || ac.fleetId === fleetFilter;

      return matchesSearch && matchesStatus && matchesFleet;
    });
  }, [aircraft, searchQuery, statusFilter, fleetFilter]);

  // Status counts
  const statusCounts = useMemo(() => {
    return aircraft.reduce(
      (acc, ac) => {
        acc[ac.status] = (acc[ac.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
  }, [aircraft]);

  const handleDelete = async () => {
    if (!deleteAircraftId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/aircraft/${deleteAircraftId}`);
      setAircraft(aircraft.filter(a => a.id !== deleteAircraftId));
      setDeleteAircraftId(null);
    } catch (error) {
      console.error("Failed to delete aircraft:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">飞机管理</h1>
          <p className="text-muted-foreground">
            管理所有飞机及其状态、飞行记录和维保信息
          </p>
        </div>
        <Button onClick={() => navigate("/aircraft/new")}>
          <Plus className="w-4 h-4 mr-2" />
          新建飞机
        </Button>
      </div>

      {/* Status Filter Bar */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={statusFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("all")}
        >
          全部 ({aircraft.length})
        </Button>
        <Button
          variant={statusFilter === "AVAILABLE" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("AVAILABLE")}
          className="data-[variant=default]:bg-green-600"
        >
          可用 ({statusCounts.AVAILABLE || 0})
        </Button>
        <Button
          variant={statusFilter === "IN_MAINTENANCE" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("IN_MAINTENANCE")}
          className="data-[variant=default]:bg-amber-600"
        >
          维护中 ({statusCounts.IN_MAINTENANCE || 0})
        </Button>
        <Button
          variant={statusFilter === "AOG" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("AOG")}
          className="data-[variant=default]:bg-red-600"
        >
          停飞 ({statusCounts.AOG || 0})
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索注册号或型号..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={fleetFilter}
              onChange={(e) => setFleetFilter(e.target.value)}
              className="h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="all">全部机队</option>
              {fleets.map((fleet) => (
                <option key={fleet.id} value={fleet.id}>
                  {fleet.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Aircraft Table */}
      <Card>
        <CardHeader>
          <CardTitle>飞机列表</CardTitle>
          <CardDescription>
            共 {filteredAircraft.length} 架飞机
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
                      注册号
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                      型号
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                      机队
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                      状态
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                      飞行小时
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                      起降循环
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
                  {filteredAircraft.map((ac) => (
                    <tr key={ac.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <Link
                          to={`/aircraft/${ac.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {ac.registrationNumber}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-sm">{ac.model}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {fleetMap.get(ac.fleetId) || "-"}
                      </td>
                      <td className="py-3 px-4">
                        <AircraftStatusBadge status={STATUS_MAP[ac.status]} />
                      </td>
                      <td className="py-3 px-4 text-sm">{ac.totalFlightHours}h</td>
                      <td className="py-3 px-4 text-sm">{ac.totalFlightCycles}</td>
                      <td className="py-3 px-4 text-sm">
                        <span className={ac.isAirworthy ? "text-green-600" : "text-red-600"}>
                          {ac.isAirworthy ? "适航" : "不适航"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/aircraft/${ac.id}`}>
                              <MoreHorizontal className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => navigate(`/aircraft/${ac.id}/edit`)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => setDeleteAircraftId(ac.id)}
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
          {!isLoading && filteredAircraft.length === 0 && (
            <div className="text-center py-12">
              <Plane className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">未找到飞机</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== "all" || fleetFilter !== "all"
                  ? "尝试调整搜索或筛选条件"
                  : "点击上方按钮创建第一架飞机"}
              </p>
              {!searchQuery && statusFilter === "all" && fleetFilter === "all" && (
                <Button onClick={() => navigate("/aircraft/new")}>
                  <Plus className="w-4 h-4 mr-2" />
                  新建飞机
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteAircraftId} onOpenChange={() => setDeleteAircraftId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除飞机？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作无法撤销。删除飞机后，相关的飞行记录和维保记录将被保留但失去关联。
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
