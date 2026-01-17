/**
 * Warehouses Management Page
 * 仓库管理页面
 */

import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Search,
  MapPin,
  Package,
  Edit,
  Trash2,
  Building,
  Phone,
  User,
  AlertTriangle,
  TrendingUp,
  MoreVertical,
  Eye,
  Loader2,
} from "lucide-react";
import { warehouseService, Warehouse, CreateWarehouseDto, UpdateWarehouseDto } from "../services/warehouse.service";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
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

const STATUS_CONFIG = {
  active: { label: "运营中", color: "bg-green-100 text-green-700" },
  inactive: { label: "已关闭", color: "bg-slate-100 text-slate-700" },
  maintenance: { label: "维护中", color: "bg-yellow-100 text-yellow-700" },
};

export function WarehousesPage() {
  // Data state
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("active");

  // Dialog state
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreateWarehouseDto>({
    code: "",
    name: "",
    description: "",
    address: "",
    contactPerson: "",
    contactPhone: "",
  });

  // Load warehouses
  useEffect(() => {
    loadWarehouses();
  }, []);

  const loadWarehouses = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await warehouseService.list();
      setWarehouses(data);
    } catch (err) {
      console.error("Failed to load warehouses:", err);
      setError("加载仓库数据失败");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter warehouses
  const filteredWarehouses = useMemo(() => {
    return warehouses.filter((warehouse) => {
      const matchesSearch =
        warehouse.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        warehouse.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (warehouse.address?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      const matchesStatus = selectedStatus === "ALL" || warehouse.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [warehouses, searchQuery, selectedStatus]);

  // Statistics
  const stats = useMemo(() => ({
    total: warehouses.filter((w) => w.status === "active").length,
    totalAll: warehouses.length,
    inactive: warehouses.filter((w) => w.status === "inactive").length,
  }), [warehouses]);

  const handleViewDetail = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setShowDetailDialog(true);
  };

  const handleEdit = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setFormData({
      code: warehouse.code,
      name: warehouse.name,
      description: warehouse.description || "",
      address: warehouse.address || "",
      contactPerson: warehouse.contactPerson || "",
      contactPhone: warehouse.contactPhone || "",
    });
    setShowEditDialog(true);
  };

  const handleDelete = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedWarehouse) return;

    setIsSubmitting(true);
    try {
      await warehouseService.delete(selectedWarehouse.id);
      setWarehouses((prev) => prev.filter((w) => w.id !== selectedWarehouse.id));
      setShowDeleteDialog(false);
      setSelectedWarehouse(null);
    } catch (err) {
      console.error("Failed to delete warehouse:", err);
      alert("删除仓库失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateSubmit = async () => {
    setIsSubmitting(true);
    try {
      const created = await warehouseService.create(formData);
      setWarehouses((prev) => [...prev, created]);
      setShowCreateDialog(false);
      setFormData({ code: "", name: "", description: "", address: "", contactPerson: "", contactPhone: "" });
    } catch (err) {
      console.error("Failed to create warehouse:", err);
      alert("创建仓库失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedWarehouse) return;

    setIsSubmitting(true);
    try {
      const updated = await warehouseService.update(selectedWarehouse.id, formData as UpdateWarehouseDto);
      setWarehouses((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
      setShowEditDialog(false);
      setSelectedWarehouse(null);
    } catch (err) {
      console.error("Failed to update warehouse:", err);
      alert("更新仓库失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCreateDialog = () => {
    setFormData({ code: "", name: "", description: "", address: "", contactPerson: "", contactPhone: "" });
    setShowCreateDialog(true);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-medium text-slate-900">{error}</p>
          <Button className="mt-4" onClick={loadWarehouses}>
            重试
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">仓库管理</h1>
          <p className="text-slate-500 mt-1">管理仓库信息和库存分布</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="w-4 h-4 mr-2" />
          新建仓库
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">运营中仓库</p>
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              )}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Package className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">仓库总数</p>
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <p className="text-2xl font-bold text-slate-900">{stats.totalAll}</p>
              )}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <Building className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">已关闭</p>
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <p className="text-2xl font-bold text-slate-900">{stats.inactive}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="搜索仓库名称或编号..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">全部状态</option>
            <option value="active">运营中</option>
            <option value="inactive">已关闭</option>
            <option value="maintenance">维护中</option>
          </select>
        </div>
      </div>

      {/* Warehouse Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredWarehouses.map((warehouse) => {
            const statusConfig = STATUS_CONFIG[warehouse.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.active;

            return (
              <div key={warehouse.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="p-6 border-b border-slate-200">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Building className="w-7 h-7 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-slate-900">{warehouse.name}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">{warehouse.code}</p>
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  {warehouse.address && (
                    <div className="flex items-start gap-2 mt-4 text-sm text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                      <span>{warehouse.address}</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  {/* Contact */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-500">负责人:</span>
                      <span className="font-medium text-slate-900">{warehouse.contactPerson || "-"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">{warehouse.contactPhone || "-"}</span>
                    </div>
                  </div>

                  {/* Description */}
                  {warehouse.description && (
                    <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                      {warehouse.description}
                    </p>
                  )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    最后更新: {new Date(warehouse.updatedAt).toLocaleDateString("zh-CN")}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewDetail(warehouse)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Eye className="w-4 h-4" />
                      详情
                    </button>
                    <button
                      onClick={() => handleEdit(warehouse)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                      编辑
                    </button>
                    {warehouse.status !== "inactive" && (
                      <button
                        onClick={() => handleDelete(warehouse)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                        删除
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!isLoading && filteredWarehouses.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Building className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-500">没有找到匹配的仓库</p>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedWarehouse?.name}</DialogTitle>
            <DialogDescription>仓库详情</DialogDescription>
          </DialogHeader>
          {selectedWarehouse && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-3">基本信息</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">仓库编号</p>
                    <p className="font-medium text-slate-900">{selectedWarehouse.code}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">状态</p>
                    <p className="font-medium text-slate-900">
                      {STATUS_CONFIG[selectedWarehouse.status as keyof typeof STATUS_CONFIG]?.label || selectedWarehouse.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">负责人</p>
                    <p className="font-medium text-slate-900">{selectedWarehouse.contactPerson || "-"}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">联系电话</p>
                    <p className="font-medium text-slate-900">{selectedWarehouse.contactPhone || "-"}</p>
                  </div>
                </div>
              </div>

              {/* Address */}
              {selectedWarehouse.address && (
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-3">地址</h3>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-slate-900">{selectedWarehouse.address}</p>
                  </div>
                </div>
              )}

              {/* Description */}
              {selectedWarehouse.description && (
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-3">备注</h3>
                  <p className="text-slate-700 bg-slate-50 rounded-lg p-4">{selectedWarehouse.description}</p>
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
              if (selectedWarehouse) handleEdit(selectedWarehouse);
            }}>
              编辑
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog || showEditDialog} onOpenChange={(open) => {
        if (!open) {
          setShowCreateDialog(false);
          setShowEditDialog(false);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{showCreateDialog ? "新建仓库" : "编辑仓库"}</DialogTitle>
            <DialogDescription>
              {showCreateDialog ? "创建新的仓库" : `编辑仓库 ${selectedWarehouse?.name}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="code">仓库编号 *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="例如：WH-001"
                />
              </div>
              <div>
                <Label htmlFor="name">仓库名称 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例如：北京主仓库"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address">地址</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="仓库地址"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactPerson">负责人</Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  placeholder="负责人姓名"
                />
              </div>
              <div>
                <Label htmlFor="contactPhone">联系电话</Label>
                <Input
                  id="contactPhone"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  placeholder="联系电话"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">备注说明</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="仓库描述或备注"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCreateDialog(false);
              setShowEditDialog(false);
            }}>
              取消
            </Button>
            <Button
              onClick={showCreateDialog ? handleCreateSubmit : handleEditSubmit}
              disabled={isSubmitting || !formData.code || !formData.name}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  处理中...
                </>
              ) : (
                showCreateDialog ? "创建" : "保存"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除仓库 <strong>{selectedWarehouse?.name}</strong> 吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  删除中...
                </>
              ) : (
                "删除"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
