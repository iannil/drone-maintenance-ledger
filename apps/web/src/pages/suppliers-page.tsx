/**
 * Suppliers Page
 * 供应商管理页面
 */

import { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Building,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  Star,
} from "lucide-react";

// Mock data
const MOCK_SUPPLIERS = [
  {
    id: "SUP-001",
    name: "大疆创新科技有限公司",
    code: "DJISUP",
    type: "MANUFACTURER",
    status: "ACTIVE",
    contact: {
      primary: "张经理",
      phone: "0755-12345678",
      email: "zhang@dji.com",
    },
    address: {
      country: "中国",
      province: "广东省",
      city: "深圳市",
      street: "南山区仙茶大厦",
      postalCode: "518057",
    },
    categories: ["无人机整机", "零部件", "售后服务"],
    paymentTerms: "月结30天",
    deliveryTerms: "FOB 深圳",
    taxId: "91440300123456789X",
    rating: 5,
    totalOrders: 156,
    totalAmount: 8500000,
    lastOrderDate: "2025-01-10T10:30:00",
    notes: "授权一级经销商，提供原厂保修",
    createdAt: "2023-01-15T00:00:00",
  },
  {
    id: "SUP-002",
    name: "雷霆航空器材有限公司",
    code: "THAVI",
    type: "DISTRIBUTOR",
    status: "ACTIVE",
    contact: {
      primary: "李主管",
      phone: "021-87654321",
      email: "li@thunder-aviation.com",
    },
    address: {
      country: "中国",
      province: "上海市",
      city: "上海市",
      street: "浦东新区张江高科",
      postalCode: "201203",
    },
    categories: ["零部件", "维修服务"],
    paymentTerms: "货到付款",
    deliveryTerms: "EXW 上海",
    taxId: "91310000987654321Y",
    rating: 4,
    totalOrders: 89,
    totalAmount: 2100000,
    lastOrderDate: "2025-01-08T14:20:00",
    notes: "反应迅速，质量可靠",
    createdAt: "2023-03-20T00:00:00",
  },
  {
    id: "SUP-003",
    name: "蓝天电池科技有限公司",
    code: "SKYBATT",
    type: "SPECIALIST",
    status: "ACTIVE",
    contact: {
      primary: "王工",
      phone: "0571-23456789",
      email: "wang@skybattery.com",
    },
    address: {
      country: "中国",
      province: "浙江省",
      city: "杭州市",
      street: "滨江区物联网街",
      postalCode: "310051",
    },
    categories: ["电池", "充电设备"],
    paymentTerms: "月结45天",
    deliveryTerms: "CIF 杭州",
    taxId: "91330100112233445Z",
    rating: 4,
    totalOrders: 234,
    totalAmount: 3200000,
    lastOrderDate: "2025-01-12T09:15:00",
    notes: "专业电池供应商，提供定制化解决方案",
    createdAt: "2022-11-10T00:00:00",
  },
  {
    id: "SUP-004",
    name: "迅腾物流科技有限公司",
    code: "SENTLOG",
    type: "SERVICE",
    status: "ACTIVE",
    contact: {
      primary: "赵经理",
      phone: "010-56789012",
      email: "zhao@sentlog.com",
    },
    address: {
      country: "中国",
      province: "北京市",
      city: "北京市",
      street: "朝阳区望京SOHO",
      postalCode: "100102",
    },
    categories: ["物流服务", "仓储服务"],
    paymentTerms: "月结30天",
    deliveryTerms: "DDP",
    taxId: "91110000998877665A",
    rating: 3,
    totalOrders: 45,
    totalAmount: 450000,
    lastOrderDate: "2025-01-05T16:30:00",
    notes: "提供专业物流服务",
    createdAt: "2024-01-05T00:00:00",
  },
  {
    id: "SUP-005",
    name: "亚太航空材料有限公司",
    code: "APAVMAT",
    type: "DISTRIBUTOR",
    status: "INACTIVE",
    contact: {
      primary: "陈经理",
      phone: "852-23456789",
      email: "chan@ap-aviation.com",
    },
    address: {
      country: "中国香港",
      province: "香港",
      city: "香港",
      street: "九龙观塘工业区",
      postalCode: "00000",
    },
    categories: ["复合材料", "航空材料"],
    paymentTerms: "T/T 50%预付",
    deliveryTerms: "CIF 香港",
    taxId: "HK12345678",
    rating: 2,
    totalOrders: 12,
    totalAmount: 180000,
    lastOrderDate: "2024-10-15T11:00:00",
    notes: "合作暂停",
    createdAt: "2023-06-15T00:00:00",
  },
];

const SUPPLIER_TYPE_LABELS = {
  MANUFACTURER: { label: "制造商", color: "bg-blue-100 text-blue-700" },
  DISTRIBUTOR: { label: "分销商", color: "bg-green-100 text-green-700" },
  SPECIALIST: { label: "专业供应商", color: "bg-purple-100 text-purple-700" },
  SERVICE: { label: "服务商", color: "bg-orange-100 text-orange-700" },
};

const STATUS_CONFIG = {
  ACTIVE: { label: "合作中", color: "bg-green-100 text-green-700", icon: CheckCircle },
  INACTIVE: { label: "已停用", color: "bg-slate-100 text-slate-700", icon: XCircle },
  SUSPENDED: { label: "暂停合作", color: "bg-yellow-100 text-yellow-700", icon: Clock },
};

const CATEGORY_OPTIONS = [
  { value: "ALL", label: "全部类别" },
  { value: "无人机整机", label: "无人机整机" },
  { value: "零部件", label: "零部件" },
  { value: "电池", label: "电池" },
  { value: "复合材料", label: "复合材料" },
  { value: "维修服务", label: "维修服务" },
  { value: "物流服务", label: "物流服务" },
];

export function SuppliersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<typeof MOCK_SUPPLIERS[0] | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "rating" | "orders">("name");

  const filteredSuppliers = [...MOCK_SUPPLIERS]
    .filter((supplier) => {
      const matchesSearch =
        supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supplier.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supplier.contact.primary.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "ALL" || supplier.categories.includes(selectedCategory);
      const matchesStatus = selectedStatus === "ALL" || supplier.status === selectedStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "orders") return b.totalOrders - a.totalOrders;
      return 0;
    });

  const handleEdit = (supplier: typeof MOCK_SUPPLIERS[0]) => {
    setSelectedSupplier(supplier);
    setShowFormDialog(true);
  };

  const handleDelete = (supplier: typeof MOCK_SUPPLIERS[0]) => {
    setSelectedSupplier(supplier);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    console.log("Deleting supplier:", selectedSupplier?.id);
    setShowDeleteDialog(false);
    setSelectedSupplier(null);
    // TODO: Implement delete functionality
  };

  const handleNewSupplier = () => {
    setSelectedSupplier(null);
    setShowFormDialog(true);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">供应商管理</h1>
          <p className="text-slate-500 mt-1">管理供应商信息和合作关系</p>
        </div>
        <button
          onClick={handleNewSupplier}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>新增供应商</span>
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
              <p className="text-sm text-slate-500">供应商总数</p>
              <p className="text-2xl font-bold text-slate-900">{MOCK_SUPPLIERS.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">合作中</p>
              <p className="text-2xl font-bold text-slate-900">
                {MOCK_SUPPLIERS.filter((s) => s.status === "ACTIVE").length}
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
              <p className="text-sm text-slate-500">总订单数</p>
              <p className="text-2xl font-bold text-slate-900">
                {MOCK_SUPPLIERS.reduce((sum, s) => sum + s.totalOrders, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Star className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">平均评分</p>
              <p className="text-2xl font-bold text-slate-900">
                {(MOCK_SUPPLIERS.reduce((sum, s) => sum + s.rating, 0) / MOCK_SUPPLIERS.length).toFixed(1)}
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
                placeholder="搜索供应商名称、编号或联系人..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">全部状态</option>
            <option value="ACTIVE">合作中</option>
            <option value="INACTIVE">已停用</option>
            <option value="SUSPENDED">暂停合作</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="name">按名称排序</option>
            <option value="rating">按评分排序</option>
            <option value="orders">按订单数排序</option>
          </select>
        </div>
      </div>

      {/* Supplier List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredSuppliers.map((supplier) => {
          const statusConfig = STATUS_CONFIG[supplier.status as keyof typeof STATUS_CONFIG];
          const StatusIcon = statusConfig.icon;
          const typeConfig = SUPPLIER_TYPE_LABELS[supplier.type as keyof typeof SUPPLIER_TYPE_LABELS];

          return (
            <div key={supplier.id} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{supplier.name}</h3>
                    <p className="text-sm text-slate-500">{supplier.code}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    typeConfig.color
                  }`}>
                    {typeConfig.label}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded flex items-center gap-1 ${
                    statusConfig.color
                  }`}>
                    <StatusIcon className="w-3 h-3" />
                    {statusConfig.label}
                  </span>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                {renderStars(supplier.rating)}
                <span className="ml-2 text-sm text-slate-500">({supplier.rating}.0)</span>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center gap-2 text-slate-600">
                  <User className="w-4 h-4 text-slate-400" />
                  <span>联系人: {supplier.contact.primary}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>{supplier.contact.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>{supplier.contact.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>
                    {supplier.address.city} {supplier.address.province} {supplier.address.country}
                  </span>
                </div>
              </div>

              {/* Categories */}
              <div className="flex flex-wrap gap-2 mb-4">
                {supplier.categories.map((category) => (
                  <span
                    key={category}
                    className="px-2 py-1 text-xs bg-slate-100 text-slate-700 rounded"
                  >
                    {category}
                  </span>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <p className="text-slate-500">订单数量</p>
                  <p className="font-medium text-slate-900">{supplier.totalOrders}</p>
                </div>
                <div>
                  <p className="text-slate-500">采购金额</p>
                  <p className="font-medium text-slate-900">¥{(supplier.totalAmount / 10000).toFixed(1)}万</p>
                </div>
              </div>

              {/* Notes */}
              {supplier.notes && (
                <div className="bg-slate-50 rounded-lg p-3 mb-4">
                  <p className="text-sm text-slate-600">{supplier.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <span className="text-xs text-slate-500">
                  最后订单: {new Date(supplier.lastOrderDate).toLocaleDateString("zh-CN")}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(supplier)}
                    className="p-2 hover:bg-slate-100 rounded-lg"
                    title="编辑"
                  >
                    <Edit className="w-4 h-4 text-slate-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(supplier)}
                    className="p-2 hover:bg-red-100 rounded-lg"
                    title="删除"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredSuppliers.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Building className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-500">没有找到匹配的供应商</p>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && selectedSupplier && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">确认删除</h3>
            <p className="text-slate-600 mb-6">
              确定要删除供应商 <strong>{selectedSupplier.name}</strong> 吗？此操作不可撤销。
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

      {/* Form Dialog (placeholder) */}
      {showFormDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              {selectedSupplier ? "编辑供应商" : "新增供应商"}
            </h3>
            <p className="text-slate-600 mb-6">表单内容待实现...</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowFormDialog(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                取消
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Import User icon for contact info
function User({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
