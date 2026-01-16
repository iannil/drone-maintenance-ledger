import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Wings, Edit2, Trash2, MoreHorizontal } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

/**
 * Fleet list page with search and filtering
 */
export function FleetListPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data - TODO: Replace with API call
  const fleets = [
    {
      id: "fleet-001",
      name: "巡检机队A",
      code: "INSP-A",
      organization: "华东巡检公司",
      aircraftCount: 5,
      serviceable: 4,
      maintenance: 1,
      grounded: 0,
      description: "负责电力巡检任务",
    },
    {
      id: "fleet-002",
      name: "物流机队B",
      code: "LOG-B",
      organization: "顺丰速运",
      aircraftCount: 8,
      serviceable: 6,
      maintenance: 1,
      grounded: 1,
      description: "城市间快速物流配送",
    },
    {
      id: "fleet-003",
      name: "测绘机队C",
      code: "SURV-C",
      organization: "国家测绘局",
      aircraftCount: 3,
      serviceable: 2,
      maintenance: 1,
      grounded: 0,
      description: "地形测绘和测量任务",
    },
  ];

  const filteredFleets = fleets.filter(
    (fleet) =>
      fleet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fleet.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusCount = (fleet: typeof fleets[0]) => {
    if (fleet.grounded > 0) return "error";
    if (fleet.maintenance > 0) return "warning";
    return "success";
  };

  const getStatusBadge = (fleet: typeof fleets[0]) => {
    if (fleet.grounded > 0)
      return <Badge variant="destructive">{fleet.grounded} 停飞</Badge>;
    if (fleet.maintenance > 0)
      return <Badge variant="secondary">{fleet.maintenance} 维护中</Badge>;
    return <Badge className="bg-serviceable text-serviceable">全部可用</Badge>;
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
        <Button>
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
                placeholder="搜索机队名称或编号..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fleet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFleets.map((fleet) => (
          <Card key={fleet.id} className="group hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Wings className="w-6 h-6 text-primary" />
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
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {fleet.description}
              </p>

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
                <div className="flex items-center gap-2 text-xs pt-2 border-t">
                  <span className="text-serviceable">{fleet.serviceable} 可用</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-maintenance">{fleet.maintenance} 维护</span>
                  {fleet.grounded > 0 && (
                    <>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-grounded">{fleet.grounded} 停飞</span>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4 pt-4 border-t">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link to={`/fleets/${fleet.id}`}>查看详情</Link>
                </Button>
                <Button variant="ghost" size="icon">
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredFleets.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Wings className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">未找到机队</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? "尝试调整搜索条件" : "点击上方按钮创建第一个机队"}
            </p>
            {!searchQuery && (
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                新建机队
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
