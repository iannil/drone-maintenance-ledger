/**
 * Warehouses Management Page
 * 仓库管理页面
 */

import { useState } from "react";
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
} from "lucide-react";

// Mock data
const MOCK_WAREHOUSES = [
  {
    id: "WH-001",
    name: "北京主仓库",
    code: "BJ-MAIN",
    type: "MAIN",
    status: "ACTIVE",
    address: {
      country: "中国",
      province: "北京市",
      city: "北京市",
      district: "顺义区",
      street: "空港工业区A区12号",
      postalCode: "101300",
    },
    contact: {
      manager: "王仓库",
      phone: "010-12345678",
      email: "bj-main@example.com",
    },
    capacity: {
      total: 5000,
      used: 3245,
      unit: "件",
    },
    stats: {
      totalItems: 3245,
      totalValue: 1250000,
      lowStockItems: 23,
      incomingOrders: 12,
      outgoingOrders: 8,
    },
    operatingHours: {
      weekdays: "08:00 - 18:00",
      saturday: "09:00 - 14:00",
      sunday: "休息",
    },
    features: ["温控", "安防监控", "消防系统", "叉车"],
    notes: "总部主仓库，存储高价值零部件",
    createdAt: "2023-01-15T00:00:00",
    updatedAt: "2025-01-15T10:30:00",
  },
  {
    id: "WH-002",
    name: "上海分仓库",
    code: "SH-01",
    type: "BRANCH",
    status: "ACTIVE",
    address: {
      country: "中国",
      province: "上海市",
      city: "上海市",
      district: "浦东新区",
      street: "张江高科园区88号",
      postalCode: "201203",
    },
    contact: {
      manager: "李仓库",
      phone: "021-87654321",
      email: "sh-01@example.com",
    },
    capacity: {
      total: 2000,
      used: 1567,
      unit: "件",
    },
    stats: {
      totalItems: 1567,
      totalValue: 680000,
      lowStockItems: 8,
      incomingOrders: 5,
      outgoingOrders: 3,
    },
    operatingHours: {
      weekdays: "08:30 - 17:30",
      saturday: "休息",
      sunday: "休息",
    },
    features: ["安防监控", "消防系统"],
    notes: "华东地区分仓库",
    createdAt: "2023-06-20T00:00:00",
    updatedAt: "2025-01-14T14:20:00",
  },
  {
    id: "WH-003",
    name: "深圳机场临时仓",
    code: "SZ-TEMP",
    type: "TEMPORARY",
    status: "ACTIVE",
    address: {
      country: "中国",
      province: "广东省",
      city: "深圳市",
      district: "宝安区",
      street: "机场路货运站C区",
      postalCode: "518128",
    },
    contact: {
      manager: "张仓库",
      phone: "0755-23456789",
      email: "sz-temp@example.com",
    },
    capacity: {
      total: 500,
      used: 234,
      unit: "件",
    },
    stats: {
      totalItems: 234,
      totalValue: 120000,
      lowStockItems: 2,
      incomingOrders: 3,
      outgoingOrders: 5,
    },
    operatingHours: {
      weekdays: "24小时",
      saturday: "24小时",
      sunday: "24小时",
    },
    features: ["快速周转"],
    notes: "机场临时仓库，用于快速中转",
    createdAt: "2024-03-10T00:00:00",
    updatedAt: "2025-01-15T09:00:00",
  },
  {
    id: "WH-004",
    name: "成都维修站仓库",
    code: "CD-MRO",
    type: "SPECIALIZED",
    status: "ACTIVE",
    address: {
      country: "中国",
      province: "四川省",
      city: "成都市",
      district: "双流区",
      street: "航空港大道168号",
      postalCode: "610200",
    },
    contact: {
      manager: "赵仓库",
      phone: "028-34567890",
      email: "cd-mro@example.com",
    },
    capacity: {
      total: 1000,
      used: 876,
      unit: "件",
    },
    stats: {
      totalItems: 876,
      totalValue: 450000,
      lowStockItems: 12,
      incomingOrders: 8,
      outgoingOrders: 15,
    },
    operatingHours: {
      weekdays: "07:00 - 20:00",
      saturday: "08:00 - 18:00",
      sunday: "08:00 - 14:00",
    },
    features: ["维修配件专用", "快速调拨", "温控"],
    notes: "维修站专用仓库，存储维修常用件",
    createdAt: "2023-09-05T00:00:00",
    updatedAt: "2025-01-15T11:45:00",
  },
  {
    id: "WH-005",
    name: "广州仓库（已关闭）",
    code: "GZ-01",
    type: "BRANCH",
    status: "INACTIVE",
    address: {
      country: "中国",
      province: "广东省",
      city: "广州市",
      district: "白云区",
      street: "机场路88号",
      postalCode: "510400",
    },
    contact: {
      manager: "周仓库",
      phone: "020-45678901",
      email: "gz-01@example.com",
    },
    capacity: {
      total: 1500,
      used: 0,
      unit: "件",
    },
    stats: {
      totalItems: 0,
      totalValue: 0,
      lowStockItems: 0,
      incomingOrders: 0,
      outgoingOrders: 0,
    },
    operatingHours: {
      weekdays: "08:00 - 18:00",
      saturday: "休息",
      sunday: "休息",
    },
    features: [],
    notes: "已于2024年12月关闭，业务合并至深圳仓库",
    createdAt: "2023-04-15T00:00:00",
    updatedAt: "2024-12-01T00:00:00",
  },
];

const WAREHOUSE_TYPE_LABELS = {
  MAIN: { label: "主仓库", color: "bg-blue-100 text-blue-700", description: "总部主仓库" },
  BRANCH: { label: "分仓库", color: "bg-green-100 text-green-700", description: "地区分仓库" },
  TEMPORARY: { label: "临时仓", color: "bg-orange-100 text-orange-700", description: "临时/中转仓库" },
  SPECIALIZED: { label: "专用仓", color: "bg-purple-100 text-purple-700", description: "专用仓库" },
};

const STATUS_CONFIG = {
  ACTIVE: { label: "运营中", color: "bg-green-100 text-green-700" },
  INACTIVE: { label: "已关闭", color: "bg-slate-100 text-slate-700" },
  MAINTENANCE: { label: "维护中", color: "bg-yellow-100 text-yellow-700" },
};

export function WarehousesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ACTIVE");
  const [selectedWarehouse, setSelectedWarehouse] = useState<typeof MOCK_WAREHOUSES[0] | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const filteredWarehouses = MOCK_WAREHOUSES.filter((warehouse) => {
    const matchesSearch =
      warehouse.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      warehouse.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      warehouse.address.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "ALL" || warehouse.type === selectedType;
    const matchesStatus = selectedStatus === "ALL" || warehouse.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleViewDetail = (warehouse: typeof MOCK_WAREHOUSES[0]) => {
    setSelectedWarehouse(warehouse);
    setShowDetailDialog(true);
  };

  const handleEdit = (warehouse: typeof MOCK_WAREHOUSES[0]) => {
    console.log("Edit warehouse:", warehouse.id);
    // TODO: Implement edit functionality
  };

  const handleDelete = (warehouse: typeof MOCK_WAREHOUSES[0]) => {
    setSelectedWarehouse(warehouse);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    console.log("Deleting warehouse:", selectedWarehouse?.id);
    setShowDeleteDialog(false);
    setSelectedWarehouse(null);
    // TODO: Implement delete functionality
  };

  const getCapacityPercentage = (warehouse: typeof MOCK_WAREHOUSES[0]) => {
    return Math.round((warehouse.capacity.used / warehouse.capacity.total) * 100);
  };

  const getCapacityColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">仓库管理</h1>
          <p className="text-slate-500 mt-1">管理仓库信息和库存分布</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          <span>新建仓库</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">仓库总数</p>
              <p className="text-2xl font-bold text-slate-900">
                {MOCK_WAREHOUSES.filter((w) => w.status === "ACTIVE").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Package className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">库存总量</p>
              <p className="text-2xl font-bold text-slate-900">
                {MOCK_WAREHOUSES.reduce((sum, w) => sum + w.stats.totalItems, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">库存总值</p>
              <p className="text-2xl font-bold text-slate-900">
                ¥{(MOCK_WAREHOUSES.reduce((sum, w) => sum + w.stats.totalValue, 0) / 10000).toFixed(1)}万
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">低库存预警</p>
              <p className="text-2xl font-bold text-slate-900">
                {MOCK_WAREHOUSES.reduce((sum, w) => sum + w.stats.lowStockItems, 0)}
              </p>
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
              <input
                type="text"
                placeholder="搜索仓库名称或编号..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">全部类型</option>
            <option value="MAIN">主仓库</option>
            <option value="BRANCH">分仓库</option>
            <option value="TEMPORARY">临时仓</option>
            <option value="SPECIALIZED">专用仓</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">全部状态</option>
            <option value="ACTIVE">运营中</option>
            <option value="INACTIVE">已关闭</option>
            <option value="MAINTENANCE">维护中</option>
          </select>
        </div>
      </div>

      {/* Warehouse Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredWarehouses.map((warehouse) => {
          const typeConfig = WAREHOUSE_TYPE_LABELS[warehouse.type as keyof typeof WAREHOUSE_TYPE_LABELS];
          const statusConfig = STATUS_CONFIG[warehouse.status as keyof typeof STATUS_CONFIG];
          const capacityPercentage = getCapacityPercentage(warehouse);
          const capacityColor = getCapacityColor(capacityPercentage);

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
                        <span className={`px-2 py-1 text-xs font-medium rounded ${typeConfig.color}`}>
                          {typeConfig.label}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">{warehouse.code}</p>
                    </div>
                  </div>
                  <button className="p-1 hover:bg-slate-100 rounded">
                    <MoreVertical className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                {/* Address */}
                <div className="flex items-start gap-2 mt-4 text-sm text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                  <span>
                    {warehouse.address.country} {warehouse.address.province} {warehouse.address.city}
                    {warehouse.address.district} {warehouse.address.street}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Contact */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-500">负责人:</span>
                    <span className="font-medium text-slate-900">{warehouse.contact.manager}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">{warehouse.contact.phone}</span>
                  </div>
                </div>

                {/* Capacity Bar */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-500">库容使用</span>
                    <span className="font-medium text-slate-900">
                      {warehouse.capacity.used} / {warehouse.capacity.total} {warehouse.capacity.unit}
                      ({capacityPercentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${capacityColor} transition-all`}
                      style={{ width: `${capacityPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-lg font-bold text-slate-900">{warehouse.stats.totalItems}</p>
                    <p className="text-xs text-slate-500">库存件数</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-lg font-bold text-slate-900">
                      ¥{(warehouse.stats.totalValue / 10000).toFixed(1)}万
                    </p>
                    <p className="text-xs text-slate-500">库存价值</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-lg font-bold text-blue-600">{warehouse.stats.incomingOrders}</p>
                    <p className="text-xs text-slate-500">入库中</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3">
                    <p className="text-lg font-bold text-orange-600">{warehouse.stats.outgoingOrders}</p>
                    <p className="text-xs text-slate-500">出库中</p>
                  </div>
                </div>

                {/* Features */}
                {warehouse.features.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {warehouse.features.map((feature) => (
                      <span
                        key={feature}
                        className="px-2 py-1 text-xs bg-slate-100 text-slate-700 rounded"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                )}

                {/* Low Stock Alert */}
                {warehouse.stats.lowStockItems > 0 && (
                  <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    <span className="text-sm text-orange-700">
                      有 {warehouse.stats.lowStockItems} 种商品库存不足
                    </span>
                  </div>
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
                  {warehouse.status !== "INACTIVE" && (
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

      {filteredWarehouses.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Building className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-500">没有找到匹配的仓库</p>
        </div>
      )}

      {/* Detail Dialog */}
      {showDetailDialog && selectedWarehouse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900">{selectedWarehouse.name}</h2>
              <button
                onClick={() => setShowDetailDialog(false)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                ×
              </button>
            </div>

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
                    <p className="text-slate-500">仓库类型</p>
                    <p className="font-medium text-slate-900">
                      {WAREHOUSE_TYPE_LABELS[selectedWarehouse.type as keyof typeof WAREHOUSE_TYPE_LABELS].label}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">负责人</p>
                    <p className="font-medium text-slate-900">{selectedWarehouse.contact.manager}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">联系电话</p>
                    <p className="font-medium text-slate-900">{selectedWarehouse.contact.phone}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">邮箱</p>
                    <p className="font-medium text-slate-900">{selectedWarehouse.contact.email}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">邮政编码</p>
                    <p className="font-medium text-slate-900">{selectedWarehouse.address.postalCode}</p>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-3">地址</h3>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-slate-900">
                    {selectedWarehouse.address.country} {selectedWarehouse.address.province}{" "}
                    {selectedWarehouse.address.city} {selectedWarehouse.address.district}
                  </p>
                  <p className="text-slate-600 mt-1">{selectedWarehouse.address.street}</p>
                </div>
              </div>

              {/* Operating Hours */}
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-3">营业时间</h3>
                <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">周一至周五</span>
                    <span className="font-medium text-slate-900">{selectedWarehouse.operatingHours.weekdays}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">周六</span>
                    <span className="font-medium text-slate-900">{selectedWarehouse.operatingHours.saturday}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">周日</span>
                    <span className="font-medium text-slate-900">{selectedWarehouse.operatingHours.sunday}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedWarehouse.notes && (
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-3">备注</h3>
                  <p className="text-slate-700 bg-slate-50 rounded-lg p-4">{selectedWarehouse.notes}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowDetailDialog(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                关闭
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                编辑
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && selectedWarehouse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">确认删除</h3>
            <p className="text-slate-600 mb-6">
              确定要删除仓库 <strong>{selectedWarehouse.name}</strong> 吗？此操作不可撤销。
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                取消
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
