/**
 * Data Dashboard and Reports Page
 * 数据看板与报表页面
 */

import { useState, useEffect } from "react";
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
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { exportReport, type ReportType } from "../services/pdf-export.service";
import { statsService, DashboardStats, DueMaintenanceItem } from "../services/stats.service";
import { fullAircraftService, Aircraft } from "../services/fleet.service";

// Fleet status configuration
const AIRCRAFT_STATUS = {
  AVAILABLE: { label: "可用", color: "bg-blue-100 text-blue-700" },
  IN_MAINTENANCE: { label: "维保中", color: "bg-orange-100 text-orange-700" },
  AOG: { label: "停飞", color: "bg-red-100 text-red-700" },
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

interface DashboardMetrics {
  fleetHealth: {
    total: number;
    airborne: number;
    ready: number;
    maintenance: number;
    grounded: number;
    healthRate: number;
  };
  workOrders: {
    open: number;
    inProgress: number;
    pendingReview: number;
    completed: number;
    overdue: number;
  };
  maintenanceCompliance: {
    onTime: number;
    overdue: number;
    upcoming: number;
  };
  flightStats: {
    totalHours: number;
    totalFlights: number;
    avgFlightDuration: number;
    thisMonthHours: number;
  };
  inventory: {
    totalItems: number;
    lowStock: number;
    outOfStock: number;
    totalValue: number;
  };
  pireps: {
    open: number;
    investigating: number;
    resolved: number;
    critical: number;
  };
}

export function ReportsDataDashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "quarter" | "year">("month");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [upcomingMaintenance, setUpcomingMaintenance] = useState<DueMaintenanceItem[]>([]);
  const [fleetStatus, setFleetStatus] = useState<Aircraft[]>([]);
  const [alerts, setAlerts] = useState<{ id: string; type: string; message: string; severity: string; createdAt: string }[]>([]);

  // Load dashboard data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load dashboard stats
      const stats = await statsService.getDashboardStats();

      // Load due maintenance
      const dueMaintenance = await statsService.getDueMaintenanceItems(10);
      setUpcomingMaintenance(dueMaintenance);

      // Build alerts from critical maintenance items
      const criticalAlerts = dueMaintenance
        .filter((item) => item.status === "urgent")
        .map((item) => ({
          id: item.id,
          type: "MAINTENANCE",
          message: `${item.aircraft} ${item.component || item.type} 需要维护: ${item.dueIn}`,
          severity: "CRITICAL",
          createdAt: new Date().toISOString(),
        }));
      setAlerts(criticalAlerts);

      // Transform stats to metrics format
      const transformedMetrics: DashboardMetrics = {
        fleetHealth: {
          total: stats.totalAircraft,
          airborne: 0, // Not tracked in current stats
          ready: stats.aircraftByStatus.serviceable,
          maintenance: stats.aircraftByStatus.maintenance,
          grounded: stats.aircraftByStatus.grounded,
          healthRate: stats.totalAircraft > 0
            ? Math.round((stats.aircraftByStatus.serviceable / stats.totalAircraft) * 100 * 10) / 10
            : 0,
        },
        workOrders: {
          open: stats.workOrders.pending,
          inProgress: stats.workOrders.inProgress,
          pendingReview: 0, // Not tracked in current stats
          completed: stats.workOrders.completed,
          overdue: 0, // Not tracked in current stats
        },
        maintenanceCompliance: {
          onTime: 94.2, // Would need additional stats API
          overdue: 5.8,
          upcoming: dueMaintenance.length,
        },
        flightStats: {
          totalHours: stats.flight.totalHours,
          totalFlights: 0, // Not tracked in current stats
          avgFlightDuration: 0,
          thisMonthHours: stats.flight.last30DaysHours,
        },
        inventory: {
          totalItems: 0, // Would need inventory stats API
          lowStock: 0,
          outOfStock: 0,
          totalValue: 0,
        },
        pireps: {
          open: 0, // Would need pirep stats API
          investigating: 0,
          resolved: 0,
          critical: 0,
        },
      };

      // Load aircraft for fleet status table
      try {
        const aircraft = await fullAircraftService.list(10, 0);
        setFleetStatus(aircraft);
      } catch {
        console.warn("Failed to load fleet status");
      }

      setMetrics(transformedMetrics);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const handleExport = async (type: "pdf" | "excel" | "csv") => {
    if (type === "pdf") {
      setIsExporting(true);
      try {
        // Export fleet health report for PDF
        await exportReport("fleet-health");
      } catch (err) {
        console.error("Export error:", err);
        alert("导出失败，请重试");
      } finally {
        setIsExporting(false);
      }
    } else {
      // TODO: Implement Excel and CSV export
      console.log("Exporting report as", type);
      alert(`${type.toUpperCase()} 导出功能即将上线`);
    }
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

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {!isLoading && metrics && (
        <>
          {/* Critical Alerts */}
          {alerts.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold text-red-900">紧急警报</h3>
                <span className="bg-red-200 text-red-800 text-xs px-2 py-0.5 rounded-full">
                  {alerts.length}
                </span>
              </div>
              <div className="space-y-2">
                {alerts.map((alert) => {
                  const Icon = SEVERITY_CONFIG[alert.severity as keyof typeof SEVERITY_CONFIG]?.icon || AlertTriangle;
                  return (
                    <div key={alert.id} className="flex items-center justify-between bg-white rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${SEVERITY_CONFIG[alert.severity as keyof typeof SEVERITY_CONFIG]?.color || 'bg-slate-500'}`}>
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
                    <p className="text-2xl font-bold text-slate-900">{metrics.fleetHealth.healthRate}%</p>
                  </div>
                </div>
                <div className={`flex items-center gap-1 text-sm ${
                  metrics.fleetHealth.healthRate >= 90 ? "text-green-600" : "text-yellow-600"
                }`}>
                  <TrendingUp className="w-4 h-4" />
                  <span>-</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">飞行中</span>
                  <span className="font-medium text-green-600">{metrics.fleetHealth.airborne}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">可用</span>
                  <span className="font-medium text-blue-600">{metrics.fleetHealth.ready}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">维保中</span>
                  <span className="font-medium text-orange-600">{metrics.fleetHealth.maintenance}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">停飞</span>
                  <span className="font-medium text-red-600">{metrics.fleetHealth.grounded}</span>
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
                      {metrics.workOrders.open + metrics.workOrders.inProgress}
                </p>
              </div>
            </div>
            {metrics.workOrders.overdue > 0 && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                {metrics.workOrders.overdue} 逾期
              </span>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">待处理</span>
              <span className="font-medium">{metrics.workOrders.open}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">进行中</span>
              <span className="font-medium text-blue-600">{metrics.workOrders.inProgress}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">待审核</span>
              <span className="font-medium text-orange-600">{metrics.workOrders.pendingReview}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">本月完成</span>
              <span className="font-medium text-green-600">{metrics.workOrders.completed}</span>
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
                <p className="text-2xl font-bold text-slate-900">{metrics.maintenanceCompliance.onTime}%</p>
              </div>
            </div>
          </div>
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">按时完成</span>
              <span className="text-xs font-semibold text-slate-600">{metrics.maintenanceCompliance.onTime}%</span>
            </div>
            <div className="overflow-hidden h-2 text-xs flex rounded bg-slate-200">
              <div
                style={{ width: `${metrics.maintenanceCompliance.onTime}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
              />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">即将到期</span>
              <span className="font-medium text-orange-600">{metrics.maintenanceCompliance.upcoming}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">已逾期</span>
              <span className="font-medium text-red-600">{metrics.maintenanceCompliance.overdue}%</span>
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
                <p className="text-2xl font-bold text-slate-900">{metrics.flightStats.totalHours}h</p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">总飞行架次</span>
              <span className="font-medium">{metrics.flightStats.totalFlights}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">平均架次时长</span>
              <span className="font-medium">{metrics.flightStats.avgFlightDuration}h</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">本月飞行</span>
              <span className="font-medium text-cyan-600">{metrics.flightStats.thisMonthHours}h</span>
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
                <p className="text-2xl font-bold text-slate-900">{metrics.inventory.totalItems}</p>
              </div>
            </div>
            {(metrics.inventory.lowStock > 0 || metrics.inventory.outOfStock > 0) && (
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                {metrics.inventory.lowStock} 低库存
              </span>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">低库存</span>
              <span className="font-medium text-orange-600">{metrics.inventory.lowStock}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">缺货</span>
              <span className="font-medium text-red-600">{metrics.inventory.outOfStock}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">库存总值</span>
              <span className="font-medium">¥{(metrics.inventory.totalValue / 10000).toFixed(1)}万</span>
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
                <p className="text-2xl font-bold text-slate-900">{metrics.pireps.open + metrics.pireps.investigating}</p>
              </div>
            </div>
            {metrics.pireps.critical > 0 && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                {metrics.pireps.critical} 紧急
              </span>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">待处理</span>
              <span className="font-medium">{metrics.pireps.open}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">调查中</span>
              <span className="font-medium text-blue-600">{metrics.pireps.investigating}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">已解决</span>
              <span className="font-medium text-green-600">{metrics.pireps.resolved}</span>
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
              {fleetStatus.map((aircraft) => (
                <tr key={aircraft.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">
                    {aircraft.registrationNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                    {aircraft.model}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      AIRCRAFT_STATUS[aircraft.status as keyof typeof AIRCRAFT_STATUS]?.color || "bg-slate-100 text-slate-700"
                    }`}>
                      {AIRCRAFT_STATUS[aircraft.status as keyof typeof AIRCRAFT_STATUS]?.label || aircraft.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${aircraft.isAirworthy ? "bg-green-500" : "bg-red-500"}`}
                          style={{ width: aircraft.isAirworthy ? "100%" : "0%" }}
                        />
                      </div>
                      <span className="text-sm text-slate-600">{aircraft.isAirworthy ? "适航" : "不适航"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                    {aircraft.totalFlightHours}h
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
              {fleetStatus.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    暂无飞机数据
                  </td>
                </tr>
              )}
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
          {upcomingMaintenance.map((task) => (
            <div key={task.id} className="p-4 hover:bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-1 h-12 rounded-full ${
                  task.status === "urgent" ? "bg-red-500" :
                  task.status === "warning" ? "bg-orange-500" : "bg-slate-400"
                }`} />
                <div>
                  <p className="font-medium text-slate-900">{task.component || task.type}</p>
                  <p className="text-sm text-slate-500">
                    {task.aircraft} · {task.dueIn}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-1 rounded border ${
                  task.status === "urgent" ? "bg-red-100 text-red-700 border-red-300" :
                  task.status === "warning" ? "bg-orange-100 text-orange-700 border-orange-300" :
                  "bg-slate-100 text-slate-700 border-slate-300"
                }`}>
                  {task.status === "urgent" ? "紧急" : task.status === "warning" ? "预警" : "正常"}
                </span>
                <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">
                  {task.type}
                </span>
              </div>
            </div>
          ))}
          {upcomingMaintenance.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              暂无即将到期的维保任务
            </div>
          )}
        </div>
      </div>

      {/* Report Export Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">报告导出</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => handleExport("pdf")}
            disabled={isExporting}
            className="flex items-center justify-center gap-2 p-4 border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <Loader2 className="w-5 h-5 text-slate-600 animate-spin" />
            ) : (
              <Download className="w-5 h-5 text-slate-600" />
            )}
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
        </>
      )}
    </div>
  );
}
