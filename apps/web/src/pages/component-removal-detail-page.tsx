/**
 * Component Removal Detail Page
 * 零部件拆装详情页面
 */

import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  User,
  Wrench,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Camera,
  Download,
  Printer,
  Edit,
  History,
} from "lucide-react";

// Mock data
const MOCK_REMOVAL = {
  id: "RM-2025-0142",
  componentId: "COMP-2024-0892",
  componentName: "电机 DJI M350",
  serialNumber: "SN-M350-0892",
  removalType: "REPAIR",
  reason: "异常噪音，需返厂检修",
  removalDate: "2025-01-10T14:30:00",
  aircraftFrom: {
    id: "AC-2024-0015",
    registration: "B-702A",
    model: "DJI Matrice 350 RTK",
    position: "前左电机",
  },
  aircraftTo: null, // If installed elsewhere
  removedBy: {
    id: "U-001",
    name: "张维修",
    role: "MECHANIC",
  },
  inspectedBy: {
    id: "U-002",
    name: "李检验",
    role: "INSPECTOR",
  },
  workOrderId: "WO-2025-0142",
  flightHoursAtRemoval: 342.5,
  cyclesAtRemoval: 128,
  status: "COMPLETED",
  remarks: "发现轴承磨损，建议更换整个电机模块",
  photos: [
    { id: "1", url: "/placeholder1.jpg", description: "拆卸前照片" },
    { id: "2", url: "/placeholder2.jpg", description: "拆卸后照片" },
    { id: "3", url: "/placeholder3.jpg", description: "故障部位特写" },
  ],
  documents: [
    { id: "1", name: "拆装记录单.pdf", type: "PDF", size: "245KB" },
    { id: "2", name: "检验报告.pdf", type: "PDF", size: "189KB" },
  ],
  createdAt: "2025-01-10T14:30:00",
  updatedAt: "2025-01-10T16:45:00",
};

const MOCK_COMPONENT_HISTORY = [
  {
    id: "1",
    date: "2024-03-15T10:00:00",
    type: "INSTALL",
    aircraft: "B-702A",
    position: "前左电机",
    performedBy: "王安装",
    flightHours: 0,
  },
  {
    id: "2",
    date: "2024-06-20T14:00:00",
    type: "INSPECTION",
    aircraft: "B-702A",
    position: "前左电机",
    performedBy: "李检验",
    flightHours: 89,
    result: "正常",
  },
  {
    id: "3",
    date: "2025-01-10T14:30:00",
    type: "REMOVAL",
    aircraft: "B-702A",
    position: "前左电机",
    performedBy: "张维修",
    flightHours: 342.5,
    reason: "异常噪音",
  },
];

const REMOVAL_TYPE_LABELS = {
  REPLACEMENT: { label: "更换", color: "bg-blue-100 text-blue-700" },
  REPAIR: { label: "维修", color: "bg-orange-100 text-orange-700" },
  INSPECTION: { label: "检查", color: "bg-purple-100 text-purple-700" },
  SCRAPPED: { label: "报废", color: "bg-red-100 text-red-700" },
  UPGRADE: { label: "升级", color: "bg-green-100 text-green-700" },
};

const STATUS_CONFIG = {
  PENDING: { label: "待处理", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  IN_PROGRESS: { label: "进行中", color: "bg-blue-100 text-blue-700", icon: Wrench },
  COMPLETED: { label: "已完成", color: "bg-green-100 text-green-700", icon: CheckCircle },
  CANCELLED: { label: "已取消", color: "bg-slate-100 text-slate-700", icon: XCircle },
};

export function ComponentRemovalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const removal = MOCK_REMOVAL;
  const statusConfig = STATUS_CONFIG[removal.status as keyof typeof STATUS_CONFIG];
  const StatusIcon = statusConfig.icon;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    console.log("Downloading removal record");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/components/removals"
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">拆装记录详情</h1>
              <span className={`px-2 py-1 text-sm font-medium rounded flex items-center gap-1 ${statusConfig.color}`}>
                <StatusIcon className="w-4 h-4" />
                {statusConfig.label}
              </span>
            </div>
            <p className="text-slate-500 mt-1">{removal.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to={`/work-orders/${removal.workOrderId}`}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            <FileText className="w-4 h-4" />
            <span>关联工单</span>
          </Link>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            <Printer className="w-4 h-4" />
            <span>打印</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Download className="w-4 h-4" />
            <span>导出</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Component Information */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">零部件信息</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-slate-500 mb-1">零部件名称</p>
                  <p className="font-medium text-slate-900">{removal.componentName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">序列号</p>
                  <p className="font-medium text-slate-900">{removal.serialNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">拆装类型</p>
                  <span className={`px-2 py-1 text-sm font-medium rounded ${
                    REMOVAL_TYPE_LABELS[removal.removalType as keyof typeof REMOVAL_TYPE_LABELS].color
                  }`}>
                    {REMOVAL_TYPE_LABELS[removal.removalType as keyof typeof REMOVAL_TYPE_LABELS].label}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">拆卸时飞行小时</p>
                  <p className="font-medium text-slate-900">{removal.flightHoursAtRemoval}h</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">拆卸时循环次数</p>
                  <p className="font-medium text-slate-900">{removal.cyclesAtRemoval}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">拆卸日期</p>
                  <p className="font-medium text-slate-900">
                    {new Date(removal.removalDate).toLocaleString("zh-CN")}
                  </p>
                </div>
              </div>
              {removal.reason && (
                <div className="mt-6">
                  <p className="text-sm text-slate-500 mb-2">拆卸原因</p>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                      <p className="text-slate-900">{removal.reason}</p>
                    </div>
                  </div>
                </div>
              )}
              {removal.remarks && (
                <div className="mt-4">
                  <p className="text-sm text-slate-500 mb-2">备注</p>
                  <p className="text-slate-700 bg-slate-50 rounded-lg p-3">{removal.remarks}</p>
                </div>
              )}
            </div>
          </div>

          {/* Aircraft Information */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">飞机信息</h2>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">✈️</span>
                  </div>
                  <div>
                    <Link
                      to={`/aircraft/${removal.aircraftFrom.id}`}
                      className="text-lg font-semibold text-blue-600 hover:text-blue-700"
                    >
                      {removal.aircraftFrom.registration}
                    </Link>
                    <p className="text-slate-500">{removal.aircraftFrom.model}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">安装位置</p>
                  <p className="font-medium text-slate-900">{removal.aircraftFrom.position}</p>
                </div>
              </div>
              {removal.aircraftTo && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <p className="text-sm text-slate-500 mb-2">安装至</p>
                  <Link
                    to={`/aircraft/${removal.aircraftTo.id}`}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {removal.aircraftTo.registration}
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Photos */}
          {removal.photos.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">现场照片</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-3 gap-4">
                  {removal.photos.map((photo, index) => (
                    <div
                      key={photo.id}
                      className="relative group cursor-pointer"
                      onClick={() => setSelectedPhoto(index)}
                    >
                      <div className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
                        <Camera className="w-12 h-12 text-slate-400" />
                      </div>
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm">查看</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-2 text-center">{photo.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Documents */}
          {removal.documents.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">相关文档</h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {removal.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-slate-400" />
                        <div>
                          <p className="font-medium text-slate-900">{doc.name}</p>
                          <p className="text-sm text-slate-500">{doc.type} · {doc.size}</p>
                        </div>
                      </div>
                      <button className="text-blue-600 hover:text-blue-700 text-sm">
                        下载
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Component History */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">零部件履历</h2>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
              >
                <History className="w-4 h-4" />
                {showHistory ? "收起" : "展开"}
              </button>
            </div>
            {showHistory && (
              <div className="p-6">
                <div className="space-y-4">
                  {MOCK_COMPONENT_HISTORY.map((record, index) => (
                    <div key={record.id} className="relative">
                      {index < MOCK_COMPONENT_HISTORY.length - 1 && (
                        <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-slate-200" />
                      )}
                      <div className="flex items-start gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          record.type === "REMOVAL" ? "bg-orange-100" :
                          record.type === "INSTALL" ? "bg-green-100" : "bg-blue-100"
                        }`}>
                          <div className={`w-3 h-3 rounded-full ${
                            record.type === "REMOVAL" ? "bg-orange-500" :
                            record.type === "INSTALL" ? "bg-green-500" : "bg-blue-500"
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-slate-900">
                              {record.type === "INSTALL" ? "安装" :
                               record.type === "REMOVAL" ? "拆卸" : "检查"}
                            </p>
                            <p className="text-sm text-slate-500">
                              {new Date(record.date).toLocaleString("zh-CN")}
                            </p>
                          </div>
                          <div className="mt-1 text-sm text-slate-600">
                            <span>{record.aircraft}</span>
                            <span className="mx-2">·</span>
                            <span>{record.position}</span>
                            <span className="mx-2">·</span>
                            <span>{record.performedBy}</span>
                          </div>
                          {record.result && (
                            <p className="text-sm text-slate-500 mt-1">结果: {record.result}</p>
                          )}
                          {record.reason && (
                            <p className="text-sm text-orange-600 mt-1">原因: {record.reason}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Personnel */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">相关人员</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">{removal.removedBy.name}</p>
                  <p className="text-sm text-slate-500">拆卸人员 · {removal.removedBy.role}</p>
                </div>
              </div>
              {removal.inspectedBy && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{removal.inspectedBy.name}</p>
                    <p className="text-sm text-slate-500">检验人员 · {removal.inspectedBy.role}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">时间线</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-slate-500">创建时间</p>
                <p className="font-medium text-slate-900">
                  {new Date(removal.createdAt).toLocaleString("zh-CN")}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">最后更新</p>
                <p className="font-medium text-slate-900">
                  {new Date(removal.updatedAt).toLocaleString("zh-CN")}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">快捷操作</h2>
            </div>
            <div className="p-6 space-y-3">
              <Link
                to={`/components/${removal.componentId}`}
                className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                <FileText className="w-5 h-5 text-slate-600" />
                <span>查看零部件详情</span>
              </Link>
              <Link
                to={`/aircraft/${removal.aircraftFrom.id}`}
                className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                <FileText className="w-5 h-5 text-slate-600" />
                <span>查看飞机详情</span>
              </Link>
              <Link
                to={`/work-orders/${removal.workOrderId}`}
                className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                <Wrench className="w-5 h-5 text-slate-600" />
                <span>查看关联工单</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Modal */}
      {selectedPhoto !== null && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 right-4 p-2 text-white hover:text-slate-300"
          >
            <XCircle className="w-8 h-8" />
          </button>
          <div className="max-w-4xl max-h-[90vh] p-4">
            <div className="bg-white rounded-lg p-4">
              <p className="text-center text-slate-700 mb-4">
                {removal.photos[selectedPhoto].description}
              </p>
              <div className="aspect-video bg-slate-100 rounded flex items-center justify-center">
                <Camera className="w-24 h-24 text-slate-400" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
