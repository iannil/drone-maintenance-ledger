/**
 * Reliability Analysis Page
 * 可靠性分析页面
 */

import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  BarChart3,
  PieChart,
  Calendar,
  Download,
  Filter,
  Info,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Minus,
  Loader2,
} from "lucide-react";
import { statsService, ReliabilityData } from "../services/stats.service";

const TREND_ICONS = {
  UP: { icon: ArrowUp, color: "text-green-600", bg: "bg-green-100" },
  DOWN: { icon: ArrowDown, color: "text-red-600", bg: "bg-red-100" },
  STABLE: { icon: Minus, color: "text-slate-600", bg: "bg-slate-100" },
};

const RELIABILITY_LEVEL = (value: number) => {
  if (value >= 99) return { label: "优秀", color: "bg-green-500" };
  if (value >= 97) return { label: "良好", color: "bg-blue-500" };
  if (value >= 95) return { label: "一般", color: "bg-yellow-500" };
  return { label: "较差", color: "bg-red-500" };
};

const PERIOD_DAYS: Record<string, number> = {
  "3m": 90,
  "6m": 180,
  "12m": 365,
  "all": 730,
};

// Default empty data structure
const EMPTY_RELIABILITY_DATA: ReliabilityData = {
  summary: {
    overallReliability: 0,
    previousPeriod: 0,
    totalFlightHours: 0,
    totalFlights: 0,
    incidents: 0,
    avgIncidentsPer100Hours: 0,
    mtbf: 0,
    mttr: 0,
  },
  componentReliability: [],
  systemReliability: [],
  incidentsByMonth: [],
  topFailureCauses: [],
};

export function ReliabilityAnalysisPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<"3m" | "6m" | "12m" | "all">("6m");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [expandedComponent, setExpandedComponent] = useState<string | null>(null);
  const [reliabilityData, setReliabilityData] = useState<ReliabilityData>(EMPTY_RELIABILITY_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data when period changes
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await statsService.getReliabilityData(PERIOD_DAYS[selectedPeriod]);
        setReliabilityData(data);
      } catch (err) {
        console.error("Failed to load reliability data:", err);
        setError("加载数据失败");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [selectedPeriod]);

  const toggleComponent = (componentId: string) => {
    setExpandedComponent(expandedComponent === componentId ? null : componentId);
  };

  const handleExport = () => {
    console.log("Exporting reliability report");
  };

  const categories = Array.from(
    new Set(reliabilityData.componentReliability.map((c) => c.category))
  );

  const filteredComponents = reliabilityData.componentReliability.filter((c) => {
    return selectedCategory === "ALL" || c.category === selectedCategory;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        <AlertTriangle className="w-6 h-6 mr-2" />
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">可靠性分析</h1>
          <p className="text-slate-500 mt-1">分析零部件和系统的可靠性指标</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="3m">近3个月</option>
            <option value="6m">近6个月</option>
            <option value="12m">近12个月</option>
            <option value="all">全部</option>
          </select>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            <Download className="w-4 h-4" />
            <span>导出报告</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Reliability */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex items-center gap-1">
              {reliabilityData.summary.overallReliability > reliabilityData.summary.previousPeriod ? (
                <ArrowUp className="w-4 h-4 text-green-600" />
              ) : (
                <ArrowDown className="w-4 h-4 text-red-600" />
              )}
            </div>
          </div>
          <p className="text-sm text-slate-500">整体可靠性</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">
            {reliabilityData.summary.overallReliability}%
          </p>
          <p className="text-xs text-slate-500 mt-2">
            上期: {reliabilityData.summary.previousPeriod}%
          </p>
        </div>

        {/* MTBF */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="p-2 bg-green-100 rounded-lg mb-4 w-fit">
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-sm text-slate-500">平均故障间隔 (MTBF)</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">
            {reliabilityData.summary.mtbf}
            <span className="text-lg text-slate-500 ml-1">小时</span>
          </p>
        </div>

        {/* MTTR */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="p-2 bg-orange-100 rounded-lg mb-4 w-fit">
            <TrendingDown className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-sm text-slate-500">平均修复时间 (MTTR)</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">
            {reliabilityData.summary.mttr}
            <span className="text-lg text-slate-500 ml-1">小时</span>
          </p>
        </div>

        {/* Incidents */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="p-2 bg-red-100 rounded-lg mb-4 w-fit">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-sm text-slate-500">故障事件</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">
            {reliabilityData.summary.incidents}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            每100小时 {reliabilityData.summary.avgIncidentsPer100Hours} 次
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incidents by Month */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">月度故障趋势</h3>
          <div className="space-y-3">
            {reliabilityData.incidentsByMonth.map((item) => {
              const maxIncidents = Math.max(...reliabilityData.incidentsByMonth.map((i) => i.incidents));
              const barWidth = (item.incidents / maxIncidents) * 100;
              const rate = ((item.incidents / item.flights) * 100).toFixed(2);

              return (
                <div key={item.month}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-600">{item.month}</span>
                    <span className="text-slate-900">
                      {item.incidents} 次 / {item.flights} 架次 ({rate}%)
                    </span>
                  </div>
                  <div className="w-full h-6 bg-slate-100 rounded-lg overflow-hidden">
                    <div
                      className={`h-full ${item.incidents > 3 ? "bg-red-500" : item.incidents > 2 ? "bg-yellow-500" : "bg-green-500"}`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Failure Causes */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">故障原因分布</h3>
          <div className="space-y-3">
            {reliabilityData.topFailureCauses.map((cause, index) => (
              <div key={index}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-600">{cause.cause}</span>
                  <span className="text-slate-900">
                    {cause.count} 次 ({cause.percentage}%)
                  </span>
                </div>
                <div className="w-full h-6 bg-slate-100 rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${cause.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Reliability */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">系统可靠性</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {reliabilityData.systemReliability.map((system) => {
            const TrendIcon = TREND_ICONS[system.trend as keyof typeof TREND_ICONS].icon;
            const trendColor = TREND_ICONS[system.trend as keyof typeof TREND_ICONS].color;
            const reliabilityColor = RELIABILITY_LEVEL(system.reliability).color;

            return (
              <div key={system.system} className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-slate-600">{system.system}</p>
                  <div className={`p-1 rounded ${trendColor}`}>
                    <TrendIcon className="w-3 h-3" />
                  </div>
                </div>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-2xl font-bold text-slate-900">{system.reliability}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className={`h-full ${reliabilityColor}`} style={{ width: `${system.reliability}%` }} />
                </div>
                <p className="text-xs text-slate-500 mt-2">{system.incidents} 次故障</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Component Reliability */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">零部件可靠性</h3>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">全部类别</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                  零部件
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                  在役数量
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                  故障次数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                  MTBF (小时)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                  可用率
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                  趋势
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredComponents.map((component) => {
                const TrendIcon = TREND_ICONS[component.trend as keyof typeof TREND_ICONS].icon;
                const trendColor = TREND_ICONS[component.trend as keyof typeof TREND_ICONS].color;
                const trendBg = TREND_ICONS[component.trend as keyof typeof TREND_ICONS].bg;
                const isExpanded = expandedComponent === component.id;

                return (
                  <>
                    <tr key={component.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-900">{component.component}</p>
                          <p className="text-sm text-slate-500">{component.partNumber}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900">{component.totalInstalled}</td>
                      <td className="px-6 py-4 text-sm text-slate-900">{component.failures}</td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-slate-900">
                          {component.mtbf === 9999 ? ">9999" : component.mtbf}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${RELIABILITY_LEVEL(component.availability).color}`}
                              style={{ width: `${component.availability}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-slate-900">
                            {component.availability}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded ${trendBg}`}>
                            <TrendIcon className={`w-3 h-3 ${trendColor}`} />
                          </div>
                          <span className={`text-sm font-medium ${component.change > 0 ? "text-green-600" : component.change < 0 ? "text-red-600" : "text-slate-600"}`}>
                            {component.change > 0 ? "+" : ""}
                            {component.change}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleComponent(component.id)}
                          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronDown className="w-4 h-4" />
                              收起
                            </>
                          ) : (
                            <>
                              <Info className="w-4 h-4" />
                              详情
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                    {isExpanded && component.topFailureModes.length > 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 bg-slate-50">
                          <div className="space-y-4">
                            <h4 className="text-sm font-medium text-slate-700">主要故障模式</h4>
                            <div className="grid grid-cols-2 gap-4">
                              {component.topFailureModes.map((mode) => (
                                <div
                                  key={mode.mode}
                                  className="bg-white rounded-lg p-4 border border-slate-200"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-slate-900">{mode.mode}</span>
                                    <span className="text-sm text-slate-500">
                                      {mode.count} 次 ({mode.percentage}%)
                                    </span>
                                  </div>
                                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-orange-500"
                                      style={{ width: `${mode.percentage}%` }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
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

      {/* Recommendations */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">改进建议</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <p className="font-medium text-red-900">桨叶故障率上升</p>
              <p className="text-sm text-red-700 mt-1">
                桨叶故障率较上期上升1.2%，主要原因为裂纹问题。建议加强桨叶检查频率，考虑更换供应商。
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <Info className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-900">电池容量衰减</p>
              <p className="text-sm text-yellow-700 mt-1">
                电池故障主要集中在容量衰减问题，建议优化充电管理策略，避免过充过放。
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium text-green-900">航电系统可靠性提升</p>
              <p className="text-sm text-green-700 mt-1">
                航电系统可靠性持续上升，本期仅2次故障，建议继续保持当前的维护策略。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
