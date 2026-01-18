/**
 * Purchase Orders Page
 * 采购订单管理页面
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  FileText,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Calendar,
  DollarSign,
  Download,
  Printer,
  ChevronDown,
  Loader2,
} from "lucide-react";

// TODO: Import purchase service when API is implemented
// import { purchaseService } from "@/services/purchase.service";

// Types for purchase orders
// TODO: Move to shared types when API is implemented
interface PurchaseOrderItem {
  id: string;
  partNumber: string;
  name: string;
  quantity: number;
  unitPrice: number;
  receivedQuantity: number;
}

interface ShippingAddress {
  name: string;
  contact: string;
  phone: string;
  address: string;
}

interface Supplier {
  id: string;
  name: string;
  code: string;
}

interface PurchaseOrder {
  id: string;
  supplier: Supplier;
  orderDate: string;
  expectedDeliveryDate: string;
  actualDeliveryDate: string | null;
  status: string;
  priority: string;
  paymentStatus: string;
  paymentTerms: string;
  shippingAddress: ShippingAddress;
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  notes: string;
  internalReference: string;
  requestedBy: string;
  approvedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

const STATUS_CONFIG = {
  PENDING: {
    label: "待确认",
    color: "bg-yellow-100 text-yellow-700",
    icon: Clock,
    description: "等待供应商确认",
  },
  CONFIRMED: {
    label: "已确认",
    color: "bg-blue-100 text-blue-700",
    icon: CheckCircle,
    description: "供应商已确认订单",
  },
  SHIPPED: {
    label: "已发货",
    color: "bg-purple-100 text-purple-700",
    icon: Truck,
    description: "商品已发出",
  },
  PARTIALLY_RECEIVED: {
    label: "部分收货",
    color: "bg-orange-100 text-orange-700",
    icon: Package,
    description: "部分商品已收货",
  },
  RECEIVED: {
    label: "已收货",
    color: "bg-green-100 text-green-700",
    icon: CheckCircle,
    description: "全部商品已收货",
  },
  CANCELLED: {
    label: "已取消",
    color: "bg-slate-100 text-slate-700",
    icon: XCircle,
    description: "订单已取消",
  },
};

const PAYMENT_STATUS_CONFIG = {
  PENDING: { label: "待付款", color: "bg-yellow-100 text-yellow-700" },
  PARTIALLY_PAID: { label: "部分付款", color: "bg-blue-100 text-blue-700" },
  PAID: { label: "已付款", color: "bg-green-100 text-green-700" },
  OVERDUE: { label: "逾期", color: "bg-red-100 text-red-700" },
  CANCELLED: { label: "已取消", color: "bg-slate-100 text-slate-700" },
};

const PRIORITY_CONFIG = {
  LOW: { label: "低", color: "bg-slate-100 text-slate-700" },
  NORMAL: { label: "普通", color: "bg-blue-100 text-blue-700" },
  HIGH: { label: "高", color: "bg-orange-100 text-orange-700" },
  URGENT: { label: "紧急", color: "bg-red-100 text-red-700" },
};

export function PurchaseOrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("ALL");
  const [selectedSupplier, setSelectedSupplier] = useState("ALL");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [showNewOrderDialog, setShowNewOrderDialog] = useState(false);

  // Loading and data states
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  // TODO: Implement purchase service API to fetch orders
  // Fetch orders on component mount
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call when purchase service is implemented
        // const response = await purchaseService.getPurchaseOrders();
        // setOrders(response.data);
        // const suppliersResponse = await purchaseService.getSuppliers();
        // setSuppliers(suppliersResponse.data);

        // Simulate API delay then set empty data
        await new Promise((resolve) => setTimeout(resolve, 500));
        setOrders([]);
        setSuppliers([]);
      } catch (error) {
        console.error("Failed to fetch purchase orders:", error);
        setOrders([]);
        setSuppliers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.internalReference.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "ALL" || order.status === selectedStatus;
    const matchesPaymentStatus =
      selectedPaymentStatus === "ALL" || order.paymentStatus === selectedPaymentStatus;
    const matchesSupplier = selectedSupplier === "ALL" || order.supplier.id === selectedSupplier;
    return matchesSearch && matchesStatus && matchesPaymentStatus && matchesSupplier;
  });

  // Calculate stats from orders
  const pendingCount = orders.filter((o) => o.status === "PENDING").length;
  const confirmedCount = orders.filter((o) => o.status === "CONFIRMED" || o.status === "SHIPPED").length;
  const partiallyReceivedCount = orders.filter((o) => o.status === "PARTIALLY_RECEIVED").length;
  const receivedCount = orders.filter((o) => o.status === "RECEIVED").length;
  const monthlyTotal = orders
    .filter((o) => new Date(o.orderDate).getMonth() === new Date().getMonth())
    .reduce((sum, o) => sum + o.total, 0);

  const handlePrint = (order: PurchaseOrder) => {
    window.print();
  };

  const handleExport = (order: PurchaseOrder) => {
    console.log("Exporting order:", order.id);
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  // Loading state UI
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-slate-500">加载采购订单数据...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">采购订单管理</h1>
          <p className="text-slate-500 mt-1">管理所有采购订单和收货记录</p>
        </div>
        <button
          onClick={() => setShowNewOrderDialog(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>新建订单</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">待确认</p>
              <p className="text-xl font-bold text-slate-900">{pendingCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">已确认</p>
              <p className="text-xl font-bold text-slate-900">{confirmedCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Package className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">部分收货</p>
              <p className="text-xl font-bold text-slate-900">{partiallyReceivedCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">已收货</p>
              <p className="text-xl font-bold text-slate-900">{receivedCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">本月采购</p>
              <p className="text-xl font-bold text-slate-900">
                ¥{(monthlyTotal / 10000).toFixed(1)}万
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
                placeholder="搜索订单号、供应商或申请单号..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">全部状态</option>
            <option value="PENDING">待确认</option>
            <option value="CONFIRMED">已确认</option>
            <option value="SHIPPED">已发货</option>
            <option value="PARTIALLY_RECEIVED">部分收货</option>
            <option value="RECEIVED">已收货</option>
            <option value="CANCELLED">已取消</option>
          </select>
          <select
            value={selectedPaymentStatus}
            onChange={(e) => setSelectedPaymentStatus(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">全部付款状态</option>
            <option value="PENDING">待付款</option>
            <option value="PARTIALLY_PAID">部分付款</option>
            <option value="PAID">已付款</option>
            <option value="OVERDUE">逾期</option>
          </select>
          <select
            value={selectedSupplier}
            onChange={(e) => setSelectedSupplier(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">全部供应商</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Empty State - shown when no orders exist */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-slate-700 mb-2">暂无采购订单数据</p>
          <p className="text-slate-500 mb-6">点击"新建订单"按钮创建第一个采购订单</p>
          <button
            onClick={() => setShowNewOrderDialog(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>新建订单</span>
          </button>
        </div>
      ) : (
        <>
          {/* Order List */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      订单号
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      供应商
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      订单日期
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      金额
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      订单状态
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      付款状态
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      优先级
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredOrders.map((order) => {
                    const statusConfig = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG];
                    const StatusIcon = statusConfig?.icon || Clock;
                    const paymentConfig =
                      PAYMENT_STATUS_CONFIG[order.paymentStatus as keyof typeof PAYMENT_STATUS_CONFIG];
                    const priorityConfig = PRIORITY_CONFIG[order.priority as keyof typeof PRIORITY_CONFIG];
                    const isExpanded = expandedOrder === order.id;

                    return (
                      <>
                        <tr key={order.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => toggleExpand(order.id)}
                              className="flex items-center gap-2 text-left"
                            >
                              <ChevronDown
                                className={`w-4 h-4 text-slate-400 transition-transform ${
                                  isExpanded ? "rotate-180" : ""
                                }`}
                              />
                              <span className="font-medium text-slate-900">{order.id}</span>
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <p className="text-sm font-medium text-slate-900">{order.supplier.name}</p>
                              <p className="text-xs text-slate-500">{order.supplier.code}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                            {new Date(order.orderDate).toLocaleDateString("zh-CN")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-sm font-medium text-slate-900">
                              ¥{order.total.toLocaleString()}
                            </p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {statusConfig && (
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded flex items-center gap-1 ${statusConfig.color}`}
                              >
                                <StatusIcon className="w-3 h-3" />
                                {statusConfig.label}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {paymentConfig && (
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded ${paymentConfig.color}`}
                              >
                                {paymentConfig.label}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {priorityConfig && (
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded ${priorityConfig.color}`}
                              >
                                {priorityConfig.label}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => console.log("View order:", order.id)}
                                className="p-1.5 hover:bg-slate-100 rounded"
                                title="查看"
                              >
                                <Eye className="w-4 h-4 text-slate-600" />
                              </button>
                              <button
                                onClick={() => console.log("Edit order:", order.id)}
                                className="p-1.5 hover:bg-slate-100 rounded"
                                title="编辑"
                              >
                                <Edit className="w-4 h-4 text-slate-600" />
                              </button>
                              <button
                                onClick={() => handlePrint(order)}
                                className="p-1.5 hover:bg-slate-100 rounded"
                                title="打印"
                              >
                                <Printer className="w-4 h-4 text-slate-600" />
                              </button>
                              <button
                                onClick={() => handleExport(order)}
                                className="p-1.5 hover:bg-slate-100 rounded"
                                title="导出"
                              >
                                <Download className="w-4 h-4 text-slate-600" />
                              </button>
                            </div>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr>
                            <td colSpan={8} className="px-6 py-4 bg-slate-50">
                              <div className="space-y-4">
                                {/* Order Info */}
                                <div className="grid grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <p className="text-slate-500">内部申请单</p>
                                    <p className="font-medium text-slate-900">{order.internalReference}</p>
                                  </div>
                                  <div>
                                    <p className="text-slate-500">申请人</p>
                                    <p className="font-medium text-slate-900">{order.requestedBy}</p>
                                  </div>
                                  <div>
                                    <p className="text-slate-500">审批人</p>
                                    <p className="font-medium text-slate-900">
                                      {order.approvedBy || "待审批"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-slate-500">付款条件</p>
                                    <p className="font-medium text-slate-900">{order.paymentTerms}</p>
                                  </div>
                                </div>

                                {/* Delivery Info */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm text-slate-500 mb-2">交货信息</p>
                                    <div className="bg-white rounded-lg p-3 border border-slate-200">
                                      <p className="text-sm">
                                        <span className="text-slate-500">预计交货: </span>
                                        <span className="font-medium">
                                          {new Date(order.expectedDeliveryDate).toLocaleDateString("zh-CN")}
                                        </span>
                                      </p>
                                      {order.actualDeliveryDate && (
                                        <p className="text-sm">
                                          <span className="text-slate-500">实际交货: </span>
                                          <span className="font-medium">
                                            {new Date(order.actualDeliveryDate).toLocaleDateString("zh-CN")}
                                          </span>
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-sm text-slate-500 mb-2">收货地址</p>
                                    <div className="bg-white rounded-lg p-3 border border-slate-200">
                                      <p className="font-medium text-slate-900">{order.shippingAddress.name}</p>
                                      <p className="text-sm text-slate-600">{order.shippingAddress.address}</p>
                                      <p className="text-sm text-slate-600">
                                        {order.shippingAddress.contact} · {order.shippingAddress.phone}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Line Items */}
                                <div>
                                  <p className="text-sm text-slate-500 mb-2">订单明细</p>
                                  <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                                    <table className="w-full">
                                      <thead className="bg-slate-50">
                                        <tr>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">
                                            物料编号
                                          </th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">
                                            名称
                                          </th>
                                          <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">
                                            数量
                                          </th>
                                          <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">
                                            单价
                                          </th>
                                          <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">
                                            已收货
                                          </th>
                                          <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">
                                            小计
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-200">
                                        {order.items.map((item) => (
                                          <tr key={item.id}>
                                            <td className="px-4 py-2 text-sm text-slate-900">
                                              {item.partNumber}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-slate-900">
                                              {item.name}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-right text-slate-900">
                                              {item.quantity}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-right text-slate-900">
                                              ¥{item.unitPrice}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-right">
                                              <span
                                                className={
                                                  item.receivedQuantity === item.quantity
                                                    ? "text-green-600"
                                                    : item.receivedQuantity > 0
                                                    ? "text-orange-600"
                                                    : "text-slate-400"
                                                }
                                              >
                                                {item.receivedQuantity}/{item.quantity}
                                              </span>
                                            </td>
                                            <td className="px-4 py-2 text-sm text-right text-slate-900">
                                              ¥{(item.quantity * item.unitPrice).toLocaleString()}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>

                                {/* Totals */}
                                <div className="flex justify-end">
                                  <div className="text-sm space-y-1">
                                    <div className="flex justify-between gap-8">
                                      <span className="text-slate-500">小计</span>
                                      <span className="font-medium">¥{order.subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between gap-8">
                                      <span className="text-slate-500">税额</span>
                                      <span className="font-medium">¥{order.tax.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between gap-8">
                                      <span className="text-slate-500">运费</span>
                                      <span className="font-medium">
                                        ¥{order.shipping.toLocaleString()}
                                      </span>
                                    </div>
                                    <div className="flex justify-between gap-8 pt-2 border-t border-slate-200">
                                      <span className="font-medium text-slate-900">总计</span>
                                      <span className="font-bold text-slate-900 text-lg">
                                        ¥{order.total.toLocaleString()}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Notes */}
                                {order.notes && (
                                  <div>
                                    <p className="text-sm text-slate-500 mb-1">备注</p>
                                    <p className="text-sm text-slate-700 bg-white rounded-lg p-3 border border-slate-200">
                                      {order.notes}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* No matching orders after filter */}
          {filteredOrders.length === 0 && orders.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500">没有找到匹配的订单</p>
            </div>
          )}
        </>
      )}

      {/* New Order Dialog (placeholder) */}
      {showNewOrderDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">新建采购订单</h3>
            <p className="text-slate-600 mb-6">表单内容待实现...</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowNewOrderDialog(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                取消
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                创建订单
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
