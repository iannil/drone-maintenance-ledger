/**
 * Suppliers Page
 * 供应商管理页面
 */

import { useState, useEffect } from "react";
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
  Loader2,
} from "lucide-react";

// TODO: 后端 API 尚未实现，需要创建 supplierService 并连接后端接口
// TODO: Backend API not implemented yet, need to create supplierService and connect to backend endpoints

/** Supplier type definition */
interface Supplier {
  id: string;
  name: string;
  code: string;
  type: string;
  status: string;
  contact: {
    primary: string;
    phone: string;
    email: string;
  };
  address: {
    country: string;
    province: string;
    city: string;
    street: string;
    postalCode: string;
  };
  categories: string[];
  paymentTerms: string;
  deliveryTerms: string;
  taxId: string;
  rating: number;
  totalOrders: number;
  totalAmount: number;
  lastOrderDate: string;
  notes: string;
  createdAt: string;
}

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
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "rating" | "orders">("name");

  // TODO: 后端 API 实现后，替换为真实的 API 调用
  // TODO: Replace with real API call after backend implementation
  useEffect(() => {
    const fetchSuppliers = async () => {
      setLoading(true);
      try {
        // TODO: 替换为 supplierService.getAll() 调用
        // Simulating API call delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        // Return empty array until backend API is implemented
        setSuppliers([]);
      } catch (error) {
        console.error("Failed to fetch suppliers:", error);
        setSuppliers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

  const filteredSuppliers = [...suppliers]
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

  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setShowFormDialog(true);
  };

  const handleDelete = (supplier: Supplier) => {
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
              <p className="text-2xl font-bold text-slate-900">{suppliers.length}</p>
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
                {suppliers.filter((s) => s.status === "ACTIVE").length}
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
                {suppliers.reduce((sum, s) => sum + s.totalOrders, 0)}
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
                {suppliers.length > 0
                  ? (suppliers.reduce((sum, s) => sum + s.rating, 0) / suppliers.length).toFixed(1)
                  : "-"}
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
      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Loader2 className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
          <p className="text-slate-500">加载供应商数据中...</p>
        </div>
      ) : suppliers.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Building className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-slate-700 mb-2">暂无供应商数据</p>
          <p className="text-slate-500 mb-4">请点击"新增供应商"按钮添加第一个供应商</p>
          <button
            onClick={handleNewSupplier}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>新增供应商</span>
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredSuppliers.map((supplier) => {
              const statusConfig = STATUS_CONFIG[supplier.status as keyof typeof STATUS_CONFIG];
              const StatusIcon = statusConfig?.icon || CheckCircle;
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
                      {typeConfig && (
                        <span className={`px-2 py-1 text-xs font-medium rounded ${typeConfig.color}`}>
                          {typeConfig.label}
                        </span>
                      )}
                      {statusConfig && (
                        <span className={`px-2 py-1 text-xs font-medium rounded flex items-center gap-1 ${statusConfig.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig.label}
                        </span>
                      )}
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

          {filteredSuppliers.length === 0 && suppliers.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <Building className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500">没有找到匹配的供应商</p>
            </div>
          )}
        </>
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
