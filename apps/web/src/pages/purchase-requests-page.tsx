/**
 * Purchase Requests Page
 * 采购申请页面
 */

import { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  FileText,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ShoppingCart,
} from "lucide-react";
import { Link } from "react-router-dom";

// Mock data
const MOCK_REQUESTS = [
  {
    id: "PR-2025-0189",
    title: "桨叶 M350 批量采购",
    requestDate: "2025-01-15T10:30:00",
    requiredDate: "2025-01-30T00:00:00",
    status: "PENDING_APPROVAL",
    priority: "HIGH",
    requestType: "STOCK",
    requestedBy: {
      id: "U-001",
      name: "李采购",
      department: "采购部",
    },
    items: [
      {
        id: "1",
        partNumber: "PROP-M350-01",
        name: "桨叶 M350",
        quantity: 50,
        unitPrice: 350,
        estimatedPrice: 17500,
        supplier: "大疆创新科技有限公司",
        reason: "库存不足，需补充安全库存",
      },
    ],
    totalEstimated: 17500,
    currency: "CNY",
    justification: "当前库存低于安全库存水平，急需补充以保证日常维修需求",
    approvedBy: null,
    approvedAt: null,
    rejectionReason: null,
    purchaseOrderId: null,
    attachments: [
      { id: "1", name: "库存报表.pdf", type: "PDF", size: "128KB" },
    ],
    createdAt: "2025-01-15T10:30:00",
    updatedAt: "2025-01-15T10:30:00",
  },
  {
    id: "PR-2025-0188",
    title: "电池组紧急采购",
    requestDate: "2025-01-14T14:20:00",
    requiredDate: "2025-01-20T00:00:00",
    status: "APPROVED",
    priority: "URGENT",
    requestType: "URGENT",
    requestedBy: {
      id: "U-002",
      name: "张维修",
      department: "维修部",
    },
    items: [
      {
        id: "1",
        partNumber: "BATT-M350-01",
        name: "电池组 M350",
        quantity: 10,
        unitPrice: 2800,
        estimatedPrice: 28000,
        supplier: "蓝天电池科技有限公司",
        reason: "多块电池达到循环寿命上限",
      },
    ],
    totalEstimated: 28000,
    currency: "CNY",
    justification: "10块电池已达到300次循环上限，无法继续使用，影响飞行任务",
    approvedBy: {
      id: "U-003",
      name: "王主管",
      role: "MANAGER",
    },
    approvedAt: "2025-01-14T16:00:00",
    rejectionReason: null,
    purchaseOrderId: "PO-2025-0141",
    attachments: [],
    createdAt: "2025-01-14T14:20:00",
    updatedAt: "2025-01-14T16:00:00",
  },
  {
    id: "PR-2025-0187",
    title: "云台相机年度采购计划",
    requestDate: "2025-01-12T09:15:00",
    requiredDate: "2025-02-28T00:00:00",
    status: "PURCHASED",
    priority: "NORMAL",
    requestType: "PLANNED",
    requestedBy: {
      id: "U-004",
      name: "赵计划",
      department: "计划部",
    },
    items: [
      {
        id: "1",
        partNumber: "GIMBAL-Z30",
        name: "云台 Z30",
        quantity: 3,
        unitPrice: 8500,
        estimatedPrice: 25500,
        supplier: "雷霆航空器材有限公司",
        reason: "年度设备更新计划",
      },
      {
        id: "2",
        partNumber: "CAM-Z30",
        name: "相机模组 Z30",
        quantity: 2,
        unitPrice: 12000,
        estimatedPrice: 24000,
        supplier: "雷霆航空器材有限公司",
        reason: "年度设备更新计划",
      },
    ],
    totalEstimated: 49500,
    currency: "CNY",
    justification: "根据2025年设备更新计划，需采购5台新设备替换老旧设备",
    approvedBy: {
      id: "U-003",
      name: "王主管",
      role: "MANAGER",
    },
    approvedAt: "2025-01-12T14:30:00",
    rejectionReason: null,
    purchaseOrderId: "PO-2025-0140",
    attachments: [
      { id: "1", name: "采购计划.pdf", type: "PDF", size: "256KB" },
      { id: "2", name: "设备清单.xlsx", type: "Excel", size: "45KB" },
    ],
    createdAt: "2025-01-12T09:15:00",
    updatedAt: "2025-01-13T10:00:00",
  },
  {
    id: "PR-2025-0186",
    title: "维修工具补充",
    requestDate: "2025-01-10T11:00:00",
    requiredDate: "2025-01-25T00:00:00",
    status: "REJECTED",
    priority: "LOW",
    requestType: "STOCK",
    requestedBy: {
      id: "U-005",
      name: "孙工",
      department: "维修部",
    },
    items: [
      {
        id: "1",
        partNumber: "TOOL-SET-01",
        name: "维修工具套装",
        quantity: 2,
        unitPrice: 1500,
        estimatedPrice: 3000,
        supplier: "通用五金店",
        reason: "补充工具库存",
      },
    ],
    totalEstimated: 3000,
    currency: "CNY",
    justification: "现有工具损坏，需要补充",
    approvedBy: {
      id: "U-003",
      name: "王主管",
      role: "MANAGER",
    },
    approvedAt: "2025-01-10T15:30:00",
    rejectionReason: "现有工具库存充足，暂不采购。请先申请工具维修。",
    purchaseOrderId: null,
    attachments: [],
    createdAt: "2025-01-10T11:00:00",
    updatedAt: "2025-01-10T15:30:00",
  },
  {
    id: "PR-2025-0185",
    title: "电机故障件采购",
    requestDate: "2025-01-08T16:45:00",
    requiredDate: "2025-01-18T00:00:00",
    status: "COMPLETED",
    priority: "HIGH",
    requestType: "REPAIR",
    requestedBy: {
      id: "U-002",
      name: "张维修",
      department: "维修部",
    },
    items: [
      {
        id: "1",
        partNumber: "MOTOR-M350-01",
        name: "电机 M350",
        quantity: 3,
        unitPrice: 1200,
        estimatedPrice: 3600,
        supplier: "大疆创新科技有限公司",
        reason: "更换故障电机",
      },
    ],
    totalEstimated: 3600,
    currency: "CNY",
    justification: "3台电机在维修中发现故障，需要更换",
    approvedBy: {
      id: "U-003",
      name: "王主管",
      role: "MANAGER",
    },
    approvedAt: "2025-01-08T17:30:00",
    rejectionReason: null,
    purchaseOrderId: "PO-2025-0138",
    attachments: [],
    createdAt: "2025-01-08T16:45:00",
    updatedAt: "2025-01-15T10:00:00",
  },
];

const STATUS_CONFIG = {
  DRAFT: {
    label: "草稿",
    color: "bg-slate-100 text-slate-700",
    icon: FileText,
    description: "申请草稿，尚未提交",
  },
  PENDING_APPROVAL: {
    label: "待审批",
    color: "bg-yellow-100 text-yellow-700",
    icon: Clock,
    description: "等待审批",
  },
  APPROVED: {
    label: "已批准",
    color: "bg-green-100 text-green-700",
    icon: CheckCircle,
    description: "已批准，等待采购",
  },
  REJECTED: {
    label: "已拒绝",
    color: "bg-red-100 text-red-700",
    icon: XCircle,
    description: "申请被拒绝",
  },
  PURCHASED: {
    label: "已采购",
    color: "bg-blue-100 text-blue-700",
    icon: ShoppingCart,
    description: "已生成采购订单",
  },
  COMPLETED: {
    label: "已完成",
    color: "bg-purple-100 text-purple-700",
    icon: CheckCircle,
    description: "采购完成，已入库",
  },
  CANCELLED: {
    label: "已取消",
    color: "bg-slate-100 text-slate-700",
    icon: XCircle,
    description: "申请已取消",
  },
};

const PRIORITY_CONFIG = {
  LOW: { label: "低", color: "bg-slate-100 text-slate-700" },
  NORMAL: { label: "普通", color: "bg-blue-100 text-blue-700" },
  HIGH: { label: "高", color: "bg-orange-100 text-orange-700" },
  URGENT: { label: "紧急", color: "bg-red-100 text-red-700" },
};

const REQUEST_TYPE_CONFIG = {
  STOCK: { label: "补库", color: "bg-blue-100 text-blue-700" },
  URGENT: { label: "紧急", color: "bg-red-100 text-red-700" },
  PLANNED: { label: "计划", color: "bg-purple-100 text-purple-700" },
  REPAIR: { label: "维修", color: "bg-orange-100 text-orange-700" },
};

export function PurchaseRequestsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedPriority, setSelectedPriority] = useState("ALL");
  const [selectedRequest, setSelectedRequest] = useState<typeof MOCK_REQUESTS[0] | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showNewRequestDialog, setShowNewRequestDialog] = useState(false);

  const filteredRequests = MOCK_REQUESTS.filter((request) => {
    const matchesSearch =
      request.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.requestedBy.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "ALL" || request.status === selectedStatus;
    const matchesPriority = selectedPriority === "ALL" || request.priority === selectedPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleViewDetail = (request: typeof MOCK_REQUESTS[0]) => {
    setSelectedRequest(request);
    setShowDetailDialog(true);
  };

  const handleApprove = (request: typeof MOCK_REQUESTS[0]) => {
    setSelectedRequest(request);
    setShowApprovalDialog(true);
  };

  const handleReject = (request: typeof MOCK_REQUESTS[0]) => {
    setSelectedRequest(request);
    // TODO: Implement reject with reason
    console.log("Reject request:", request.id);
  };

  const confirmApproval = () => {
    console.log("Approving request:", selectedRequest?.id);
    setShowApprovalDialog(false);
    setSelectedRequest(null);
    // TODO: Implement approve functionality
  };

  const getStatusConfig = (status: keyof typeof STATUS_CONFIG) => STATUS_CONFIG[status];
  const getPriorityConfig = (priority: keyof typeof PRIORITY_CONFIG) => PRIORITY_CONFIG[priority];
  const getRequestTypeConfig = (type: keyof typeof REQUEST_TYPE_CONFIG) => REQUEST_TYPE_CONFIG[type];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">采购申请</h1>
          <p className="text-slate-500 mt-1">管理和审批采购申请</p>
        </div>
        <button
          onClick={() => setShowNewRequestDialog(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>新建申请</span>
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
              <p className="text-sm text-slate-500">待审批</p>
              <p className="text-xl font-bold text-slate-900">
                {MOCK_REQUESTS.filter((r) => r.status === "PENDING_APPROVAL").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">已批准</p>
              <p className="text-xl font-bold text-slate-900">
                {MOCK_REQUESTS.filter((r) => r.status === "APPROVED").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">已采购</p>
              <p className="text-xl font-bold text-slate-900">
                {MOCK_REQUESTS.filter((r) => r.status === "PURCHASED").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">已拒绝</p>
              <p className="text-xl font-bold text-slate-900">
                {MOCK_REQUESTS.filter((r) => r.status === "REJECTED").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">本月申请</p>
              <p className="text-xl font-bold text-slate-900">
                {MOCK_REQUESTS.filter(
                  (r) => new Date(r.requestDate).getMonth() === new Date().getMonth()
                ).length}
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
                placeholder="搜索申请号或标题..."
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
            <option value="DRAFT">草稿</option>
            <option value="PENDING_APPROVAL">待审批</option>
            <option value="APPROVED">已批准</option>
            <option value="PURCHASED">已采购</option>
            <option value="COMPLETED">已完成</option>
            <option value="REJECTED">已拒绝</option>
          </select>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">全部优先级</option>
            <option value="LOW">低</option>
            <option value="NORMAL">普通</option>
            <option value="HIGH">高</option>
            <option value="URGENT">紧急</option>
          </select>
        </div>
      </div>

      {/* Request List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  申请号
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  标题
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  申请人
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  申请日期
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  预计金额
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  状态
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
              {filteredRequests.map((request) => {
                const statusConfig = getStatusConfig(request.status as keyof typeof STATUS_CONFIG);
                const StatusIcon = statusConfig.icon;
                const priorityConfig = getPriorityConfig(request.priority as keyof typeof PRIORITY_CONFIG);
                const typeConfig = getRequestTypeConfig(request.requestType as keyof typeof REQUEST_TYPE_CONFIG);

                return (
                  <tr key={request.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-slate-900">{request.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900">{request.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded ${typeConfig.color}`}>
                            {typeConfig.label}
                          </span>
                          <span className="text-xs text-slate-500">
                            {request.items.length} 项物品
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-sm text-slate-900">{request.requestedBy.name}</p>
                          <p className="text-xs text-slate-500">{request.requestedBy.department}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {new Date(request.requestDate).toLocaleDateString("zh-CN")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-medium text-slate-900">
                        ¥{request.totalEstimated.toLocaleString()}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded flex items-center gap-1 ${statusConfig.color}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${priorityConfig.color}`}
                      >
                        {priorityConfig.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleViewDetail(request)}
                          className="p-1.5 hover:bg-slate-100 rounded"
                          title="查看详情"
                        >
                          <Eye className="w-4 h-4 text-slate-600" />
                        </button>
                        {request.status === "PENDING_APPROVAL" && (
                          <>
                            <button
                              onClick={() => handleApprove(request)}
                              className="p-1.5 hover:bg-green-100 rounded"
                              title="批准"
                            >
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </button>
                            <button
                              onClick={() => handleReject(request)}
                              className="p-1.5 hover:bg-red-100 rounded"
                              title="拒绝"
                            >
                              <XCircle className="w-4 h-4 text-red-600" />
                            </button>
                          </>
                        )}
                        {request.purchaseOrderId && (
                          <Link
                            to={`/purchase-orders/${request.purchaseOrderId}`}
                            className="p-1.5 hover:bg-blue-100 rounded"
                            title="查看采购订单"
                          >
                            <ShoppingCart className="w-4 h-4 text-blue-600" />
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredRequests.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-500">没有找到匹配的采购申请</p>
        </div>
      )}

      {/* Detail Dialog */}
      {showDetailDialog && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900">{selectedRequest.title}</h2>
              <button
                onClick={() => setShowDetailDialog(false)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Header Info */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-slate-500">申请号</p>
                  <p className="font-medium text-slate-900">{selectedRequest.id}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">申请日期</p>
                  <p className="font-medium text-slate-900">
                    {new Date(selectedRequest.requestDate).toLocaleDateString("zh-CN")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">需求日期</p>
                  <p className="font-medium text-slate-900">
                    {new Date(selectedRequest.requiredDate).toLocaleDateString("zh-CN")}
                  </p>
                </div>
              </div>

              {/* Requester */}
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{selectedRequest.requestedBy.name}</p>
                    <p className="text-sm text-slate-500">{selectedRequest.requestedBy.department}</p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-3">采购物品</h3>
                <div className="bg-slate-50 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">物料编号</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">名称</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">数量</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">单价</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">小计</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {selectedRequest.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3 text-sm text-slate-900">{item.partNumber}</td>
                          <td className="px-4 py-3 text-sm text-slate-900">{item.name}</td>
                          <td className="px-4 py-3 text-sm text-right text-slate-900">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-right text-slate-900">¥{item.unitPrice}</td>
                          <td className="px-4 py-3 text-sm text-right text-slate-900">
                            ¥{item.estimatedPrice.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end mt-3">
                  <div className="text-lg font-bold text-slate-900">
                    总计: ¥{selectedRequest.totalEstimated.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Justification */}
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-3">申请理由</h3>
                <p className="text-slate-700 bg-slate-50 rounded-lg p-4">{selectedRequest.justification}</p>
              </div>

              {/* Approval Status */}
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-3">审批状态</h3>
                {selectedRequest.approvedBy ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-900">已批准</p>
                        <p className="text-sm text-green-700">
                          审批人: {selectedRequest.approvedBy.name} ·{" "}
                          {new Date(selectedRequest.approvedAt!).toLocaleString("zh-CN")}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : selectedRequest.rejectionReason ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-900">已拒绝</p>
                        <p className="text-sm text-red-700 mt-1">{selectedRequest.rejectionReason}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-yellow-600" />
                      <p className="font-medium text-yellow-900">等待审批</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Attachments */}
              {selectedRequest.attachments.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-3">附件</h3>
                  <div className="space-y-2">
                    {selectedRequest.attachments.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between bg-slate-50 rounded-lg p-3"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-slate-400" />
                          <div>
                            <p className="text-sm font-medium text-slate-900">{file.name}</p>
                            <p className="text-xs text-slate-500">{file.type} · {file.size}</p>
                          </div>
                        </div>
                        <button className="text-sm text-blue-600 hover:text-blue-700">下载</button>
                      </div>
                    ))}
                  </div>
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
              {selectedRequest.status === "PENDING_APPROVAL" && (
                <>
                  <button
                    onClick={() => {
                      setShowDetailDialog(false);
                      handleApprove(selectedRequest);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    批准
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Approval Dialog */}
      {showApprovalDialog && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold text-slate-900">批准采购申请</h3>
            </div>
            <p className="text-slate-600 mb-4">
              确定批准采购申请 <strong>{selectedRequest.id}</strong> 吗？
            </p>
            <div className="bg-slate-50 rounded-lg p-4 mb-6">
              <p className="font-medium text-slate-900">{selectedRequest.title}</p>
              <p className="text-sm text-slate-500 mt-1">
                预计金额: ¥{selectedRequest.totalEstimated.toLocaleString()}
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowApprovalDialog(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                取消
              </button>
              <button
                onClick={confirmApproval}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                确认批准
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Request Dialog (placeholder) */}
      {showNewRequestDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">新建采购申请</h3>
            <p className="text-slate-600 mb-6">表单内容待实现...</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowNewRequestDialog(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                取消
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                提交申请
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
