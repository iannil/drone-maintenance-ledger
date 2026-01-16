import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, Plane, Edit2, Trash2, MoreHorizontal, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { fleetService, aircraftService, Fleet } from "../services/fleet.service";
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
 * Fleet with stats for display
 */
interface FleetWithStats extends Fleet {
  aircraftCount: number;
  serviceable: number;
  maintenance: number;
  grounded: number;
}

/**
 * Fleet list page with search and filtering
 */
export function FleetListPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [fleets, setFleets] = useState<FleetWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteFleetId, setDeleteFleetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load fleets with their aircraft counts
  useEffect(() => {
    async function loadFleets() {
      setIsLoading(true);
      try {
        const fleetList = await fleetService.list();

        // Load status counts for each fleet in parallel
        const fleetsWithStats = await Promise.all(
          fleetList.map(async (fleet) => {
            try {
              const statusCounts = await aircraftService.getStatusCounts(fleet.id);
              const total = statusCounts.serviceable + statusCounts.maintenance +
                           statusCounts.grounded + statusCounts.retired;
              return {
                ...fleet,
                aircraftCount: total,
                serviceable: statusCounts.serviceable,
                maintenance: statusCounts.maintenance,
                grounded: statusCounts.grounded,
              };
            } catch {
              // If status counts fail, return fleet with zero counts
              return {
                ...fleet,
                aircraftCount: 0,
                serviceable: 0,
                maintenance: 0,
                grounded: 0,
              };
            }
          })
        );

        setFleets(fleetsWithStats);
      } catch (error) {
        console.error("Failed to load fleets:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadFleets();
  }, []);

  // Filter fleets by search query
  const filteredFleets = useMemo(() => {
    if (!searchQuery.trim()) return fleets;
    const query = searchQuery.toLowerCase();
    return fleets.filter(
      (fleet) =>
        fleet.name.toLowerCase().includes(query) ||
        fleet.code.toLowerCase().includes(query) ||
        fleet.organization.toLowerCase().includes(query)
    );
  }, [fleets, searchQuery]);

  const getStatusBadge = (fleet: FleetWithStats) => {
    if (fleet.grounded > 0)
      return <Badge variant="destructive">{fleet.grounded} 停飞</Badge>;
    if (fleet.maintenance > 0)
      return <Badge variant="secondary">{fleet.maintenance} 维护中</Badge>;
    if (fleet.aircraftCount === 0)
      return <Badge variant="outline">无飞机</Badge>;
    return <Badge className="bg-green-100 text-green-700">全部可用</Badge>;
  };

  const handleDelete = async () => {
    if (!deleteFleetId) return;
    setIsDeleting(true);
    try {
      await fleetService.delete(deleteFleetId);
      setFleets(fleets.filter(f => f.id !== deleteFleetId));
      setDeleteFleetId(null);
    } catch (error) {
      console.error("Failed to delete fleet:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">机队管理</h1>
          <p className="text-muted-foreground">
            管理所有机队及其所属飞机
          </p>
        </div>
        <Button onClick={() => navigate("/fleets/new")}>
          <Plus className="w-4 h-4 mr-2" />
          新建机队
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索机队名称、编号或单位..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Fleet Cards Grid */}
      {!isLoading && filteredFleets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFleets.map((fleet) => (
            <Card key={fleet.id} className="group hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Plane className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{fleet.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {fleet.code}
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {fleet.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {fleet.description}
                  </p>
                )}

                <div className="space-y-3">
                  {/* Organization */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">所属单位</span>
                    <span className="font-medium">{fleet.organization}</span>
                  </div>

                  {/* Aircraft Count */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">飞机数量</span>
                    <span className="font-medium">{fleet.aircraftCount} 架</span>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">状态</span>
                    {getStatusBadge(fleet)}
                  </div>

                  {/* Status Breakdown */}
                  {fleet.aircraftCount > 0 && (
                    <div className="flex items-center gap-2 text-xs pt-2 border-t">
                      <span className="text-green-600">{fleet.serviceable} 可用</span>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-amber-600">{fleet.maintenance} 维护</span>
                      {fleet.grounded > 0 && (
                        <>
                          <span className="text-muted-foreground">·</span>
                          <span className="text-red-600">{fleet.grounded} 停飞</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link to={`/fleets/${fleet.id}`}>查看详情</Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(`/fleets/${fleet.id}/edit`);
                    }}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.preventDefault();
                      setDeleteFleetId(fleet.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredFleets.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Plane className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">未找到机队</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? "尝试调整搜索条件" : "点击上方按钮创建第一个机队"}
            </p>
            {!searchQuery && (
              <Button onClick={() => navigate("/fleets/new")}>
                <Plus className="w-4 h-4 mr-2" />
                新建机队
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteFleetId} onOpenChange={() => setDeleteFleetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除机队？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作无法撤销。删除机队后，关联的飞机将失去所属机队。
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
