/**
 * Data Dashboard and Reports Page
 * 数据看板与报表页面
 */

import { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  Calendar,
  Filter,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";

// Mock data
const MOCK_METRICS = {
  fleetHealth: {
    total: 48,
    airborne: 12,
    ready: 28,
    maintenance: 6,
    grounded: 2,
    healthRate: 93.8,
  },
  workOrders: {
    open: 23,
    inProgress: 15,
    pendingReview: 8,
    completed: 156,
    overdue: 3,
  },
  maintenanceCompliance: {
    onTime: 94.2,
    overdue: 5.8,
    upcoming: 18,
  },
  flightStats: {
    totalHours: 12450,
    totalFlights: 3420,
    avgFlightDuration: 3.64,
    thisMonthHours: 892,
  },
  inventory: {
    totalItems: 1250,
    lowStock: 23,
    outOfStock: 5,
    totalValue: 2850000,
  },
  pireps: {
    open: 8,
    investigating: 12,
    resolved: 145,
    critical: 2,
  },
};

const MOCK_FLEET_STATUS = [
  { id: "1", registration: "B-701A", model: "DJI Matrice 300", status: "AIRBORNE", healthRate: 98, flightHours: 245 },
  { id: "2", registration: "B-701B", model: "DJI Matrice 300", status: "READY", healthRate: 95, flightHours: 312 },
  { id: "3", registration: "B-702A", model: "DJI Matrice 350", status: "MAINTENANCE", healthRate: 72, flightHours: 189 },
  { id: "4", registration: "B-703A", model: "Autel Dragonfish", status: "GROUNDED", healthRate: 45, flightHours: 156 },
  { id: "5", registration: "B-704A", model: "DJI Matrice 300", status: "READY", healthRate: 92, flightHours: 278 },
];

const MOCK_UPCOMING_MAINTENANCE = [
  { id: "1", aircraft: "B-701A", task: "50小时检查", dueDate: "2025-01-18", priority: "HIGH", type: "FH" },
  { id: "2", aircraft: "B-702A", task: "桨叶更换", dueDate: "2025-01-20", priority: "CRITICAL", type: "LLP" },
  { id: "3", aircraft: "B-703A", task: "年检", dueDate: "2025-01-25", priority: "MEDIUM", type: "CALENDAR" },
  { id: "4", aircraft: "B-705A", task: "电池循环更换", dueDate: "2025-01-28", priority: "HIGH", type: "BATTERY" },
  { id: "5", aircraft: "B-706A", task: "200次循环检查", dueDate: "2025-02-01", priority: "MEDIUM", type: "FC" },
];

const MOCK_CRITICAL_ALERTS = [
  { id: "1", type: "LLP", message: "B-702A 桨叶已超过建议寿命", severity: "CRITICAL", createdAt: "2025-01-15T10:30:00" },
  { id: "2", type: "WORK_ORDER", message: "工单 WO-2025-0142 已逾期3天", severity: "HIGH", createdAt: "2025-01-15T09:15:00" },
  { id: "3", type: "INVENTORY", message: "电机 DJI-M350 已低于安全库存", severity: "MEDIUM", createdAt: "2025-01-15T08:00:00" },
  { id: "4", type: "AIRWORTHINESS", message: "B-703A 适航证将于30天后到期", severity: "MEDIUM", createdAt: "2025-01-14T16:45:00" },
];

const AIRCRAFT_STATUS = {
  AIRBORNE: { label: "飞行中", color: "bg-green-500 text-white" },
  READY: { label: "可用", color: "bg-blue-100 text-blue-700" },
  MAINTENANCE: { label: "维保中", color: "bg-orange-100 text-orange-700" },
  GROUNDED: { label: "停飞", color: "bg-red-100 text-red-700" },
  RETIRED: { label: "退役", color: "bg-slate-100 text-slate-700" },
};

const PRIORITY_CONFIG = {
  CRITICAL: { label: "紧急", color: "bg-red-100 text-red-700 border-red-300" },
  HIGH: { label: "高", color: "bg-orange-100 text-orange-700 border-orange-300" },
  MEDIUM: { label: "中", color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
  LOW: { label: "低", color: "bg-slate-100 text-slate-700 border-slate-300" },
};

const SEVERITY_CONFIG = {
  CRITICAL: { color: "bg-red-500", icon: AlertTriangle },
  HIGH: { color: "bg-orange-500", icon: AlertTriangle },
  MEDIUM: { color: "bg-yellow-500", icon: Clock },
  LOW: { color: "bg-blue-500", icon: CheckCircle },
};

export function ReportsDataDashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "quarter" | "year">("month");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const handleExport = (type: "pdf" | "excel" | "csv") => {
    console.log("Exporting report as", type);
    // TODO: Implement export functionality
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("zh-CN");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">数据看板</h1>
          <p className="text-slate-500 mt-1">实时监控机队状态与运营指标</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">本周</option>
            <option value="month">本月</option>
            <option value="quarter">本季度</option>
            <option value="year">本年</option>
          </select>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
            title="刷新数据"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
          <div className="relative">
            <button className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">
              <Download className="w-4 h-4" />
              <span className="text-sm">导出报告</span>
            </button>
          </div>
        </div>
      </div>

      {/* Critical Alerts */}
      {MOCK_CRITICAL_ALERTS.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-red-900">紧急警报</h3>
            <span className="bg-red-200 text-red-800 text-xs px-2 py-0.5 rounded-full">
              {MOCK_CRITICAL_ALERTS.length}
            </span>
          </div>
          <div className="space-y-2">
            {MOCK_CRITICAL_ALERTS.map((alert) => {
              const Icon = SEVERITY_CONFIG[alert.severity as keyof typeof SEVERITY_CONFIG].icon;
              return (
                <div key={alert.id} className="flex items-center justify-between bg-white rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${SEVERITY_CONFIG[alert.severity as keyof typeof SEVERITY_CONFIG].color}`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{alert.message}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(alert.createdAt).toLocaleString("zh-CN")}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">
                    {alert.type}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Fleet Health */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">机队健康率</p>
                <p className="text-2xl font-bold text-slate-900">{MOCK_METRICS.fleetHealth.healthRate}%</p>
              </div>
            </div>
            <div className={`flex items-center gap-1 text-sm ${
              MOCK_METRICS.fleetHealth.healthRate >= 90 ? "text-green-600" : "text-yellow-600"
            }`}>
              <TrendingUp className="w-4 h-4" />
              <span>+2.3%</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">飞行中</span>
              <span className="font-medium text-green-600">{MOCK_METRICS.fleetHealth.airborne}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">可用</span>
              <span className="font-medium text-blue-600">{MOCK_METRICS.fleetHealth.ready}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">维保中</span>
              <span className="font-medium text-orange-600">{MOCK_METRICS.fleetHealth.maintenance}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">停飞</span>
              <span className="font-medium text-red-600">{MOCK_METRICS.fleetHealth.grounded}</span>
            </div>
          </div>
          <Link to="/fleets" className="mt-4 block text-center text-sm text-blue-600 hover:text-blue-700">
            查看详情 →
          </Link>
        </div>

        {/* Work Orders */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">工单状态</p>
                <p className="text-2xl font-bold text-slate-900">
                  {MOCK_METRICS.workOrders.open + MOCK_METRICS.workOrders.inProgress}
                </p>
              </div>
            </div>
            {MOCK_METRICS.workOrders.overdue > 0 && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                {MOCK_METRICS.workOrders.overdue} 逾期
              </span>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">待处理</span>
              <span className="font-medium">{MOCK_METRICS.workOrders.open}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">进行中</span>
              <span className="font-medium text-blue-600">{MOCK_METRICS.workOrders.inProgress}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">待审核</span>
              <span className="font-medium text-orange-600">{MOCK_METRICS.workOrders.pendingReview}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">本月完成</span>
              <span className="font-medium text-green-600">{MOCK_METRICS.workOrders.completed}</span>
            </div>
          </div>
          <Link to="/work-orders" className="mt-4 block text-center text-sm text-blue-600 hover:text-blue-700">
            查看工单 →
          </Link>
        </div>

        {/* Maintenance Compliance */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">维保合规率</p>
                <p className="text-2xl font-bold text-slate-900">{MOCK_METRICS.maintenanceCompliance.onTime}%</p>
              </div>
            </div>
          </div>
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">按时完成</span>
              <span className="text-xs font-semibold text-slate-600">{MOCK_METRICS.maintenanceCompliance.onTime}%</span>
            </div>
            <div className="overflow-hidden h-2 text-xs flex rounded bg-slate-200">
              <div
                style={{ width: `${MOCK_METRICS.maintenanceCompliance.onTime}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
              />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">即将到期</span>
              <span className="font-medium text-orange-600">{MOCK_METRICS.maintenanceCompliance.upcoming}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">已逾期</span>
              <span className="font-medium text-red-600">{MOCK_METRICS.maintenanceCompliance.overdue}%</span>
            </div>
          </div>
          <Link to="/maintenance/calendar" className="mt-4 block text-center text-sm text-blue-600 hover:text-blue-700">
            查看日历 →
          </Link>
        </div>

        {/* Flight Statistics */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">飞行统计</p>
                <p className="text-2xl font-bold text-slate-900">{MOCK_METRICS.flightStats.totalHours}h</p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">总飞行架次</span>
              <span className="font-medium">{MOCK_METRICS.flightStats.totalFlights}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">平均架次时长</span>
              <span className="font-medium">{MOCK_METRICS.flightStats.avgFlightDuration}h</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">本月飞行</span>
              <span className="font-medium text-cyan-600">{MOCK_METRICS.flightStats.thisMonthHours}h</span>
            </div>
          </div>
          <Link to="/analytics/flight-stats" className="mt-4 block text-center text-sm text-blue-600 hover:text-blue-700">
            查看统计 →
          </Link>
        </div>

        {/* Inventory Status */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Filter className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">库存状态</p>
                <p className="text-2xl font-bold text-slate-900">{MOCK_METRICS.inventory.totalItems}</p>
              </div>
            </div>
            {(MOCK_METRICS.inventory.lowStock > 0 || MOCK_METRICS.inventory.outOfStock > 0) && (
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                {MOCK_METRICS.inventory.lowStock} 低库存
              </span>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">低库存</span>
              <span className="font-medium text-orange-600">{MOCK_METRICS.inventory.lowStock}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">缺货</span>
              <span className="font-medium text-red-600">{MOCK_METRICS.inventory.outOfStock}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">库存总值</span>
              <span className="font-medium">¥{(MOCK_METRICS.inventory.totalValue / 10000).toFixed(1)}万</span>
            </div>
          </div>
          <Link to="/inventory/alerts" className="mt-4 block text-center text-sm text-blue-600 hover:text-blue-700">
            查看库存 →
          </Link>
        </div>

        {/* PIREP Status */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">故障报告</p>
                <p className="text-2xl font-bold text-slate-900">{MOCK_METRICS.pireps.open + MOCK_METRICS.pireps.investigating}</p>
              </div>
            </div>
            {MOCK_METRICS.pireps.critical > 0 && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                {MOCK_METRICS.pireps.critical} 紧急
              </span>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">待处理</span>
              <span className="font-medium">{MOCK_METRICS.pireps.open}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">调查中</span>
              <span className="font-medium text-blue-600">{MOCK_METRICS.pireps.investigating}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">已解决</span>
              <span className="font-medium text-green-600">{MOCK_METRICS.pireps.resolved}</span>
            </div>
          </div>
          <Link to="/pirep" className="mt-4 block text-center text-sm text-blue-600 hover:text-blue-700">
            查看报告 →
          </Link>
        </div>
      </div>

      {/* Fleet Status Table */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">机队状态概览</h2>
            <Link to="/fleets" className="text-sm text-blue-600 hover:text-blue-700">
              查看全部 →
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  注册号
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  型号
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  健康率
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  飞行小时
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {MOCK_FLEET_STATUS.map((aircraft) => (
                <tr key={aircraft.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">
                    {aircraft.registration}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                    {aircraft.model}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      AIRCRAFT_STATUS[aircraft.status as keyof typeof AIRCRAFT_STATUS].color
                    }`}>
                      {AIRCRAFT_STATUS[aircraft.status as keyof typeof AIRCRAFT_STATUS].label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            aircraft.healthRate >= 80 ? "bg-green-500" :
                            aircraft.healthRate >= 60 ? "bg-yellow-500" : "bg-red-500"
                          }`}
                          style={{ width: `${aircraft.healthRate}%` }}
                        />
                      </div>
                      <span className="text-sm text-slate-600">{aircraft.healthRate}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                    {aircraft.flightHours}h
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      to={`/aircraft/${aircraft.id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      详情
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upcoming Maintenance */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">即将到期的维保任务</h2>
            <Link to="/maintenance/calendar" className="text-sm text-blue-600 hover:text-blue-700">
              查看日历 →
            </Link>
          </div>
        </div>
        <div className="divide-y divide-slate-200">
          {MOCK_UPCOMING_MAINTENANCE.map((task) => (
            <div key={task.id} className="p-4 hover:bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-1 h-12 rounded-full ${
                  task.priority === "CRITICAL" ? "bg-red-500" :
                  task.priority === "HIGH" ? "bg-orange-500" :
                  task.priority === "MEDIUM" ? "bg-yellow-500" : "bg-slate-400"
                }`} />
                <div>
                  <p className="font-medium text-slate-900">{task.task}</p>
                  <p className="text-sm text-slate-500">
                    {task.aircraft} · {formatDate(task.dueDate)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-1 rounded border ${
                  PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG].color
                }`}>
                  {PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG].label}
                </span>
                <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">
                  {task.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Report Export Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">报告导出</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => handleExport("pdf")}
            className="flex items-center justify-center gap-2 p-4 border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-blue-300 transition-colors"
          >
            <Download className="w-5 h-5 text-slate-600" />
            <div className="text-left">
              <p className="font-medium text-slate-900">综合报告</p>
              <p className="text-sm text-slate-500">PDF 格式</p>
            </div>
          </button>
          <button
            onClick={() => handleExport("excel")}
            className="flex items-center justify-center gap-2 p-4 border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-blue-300 transition-colors"
          >
            <Download className="w-5 h-5 text-slate-600" />
            <div className="text-left">
              <p className="font-medium text-slate-900">飞行数据</p>
              <p className="text-sm text-slate-500">Excel 格式</p>
            </div>
          </button>
          <button
            onClick={() => handleExport("csv")}
            className="flex items-center justify-center gap-2 p-4 border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-blue-300 transition-colors"
          >
            <Download className="w-5 h-5 text-slate-600" />
            <div className="text-left">
              <p className="font-medium text-slate-900">维保记录</p>
              <p className="text-sm text-slate-500">CSV 格式</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
