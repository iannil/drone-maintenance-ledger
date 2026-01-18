/**
 * Fault Heatmap Component
 *
 * Visualizes fault data across different dimensions
 */

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { AlertTriangle, Activity, TrendingUp, Plane } from "lucide-react";
import { statsService, FaultHeatmapData } from "../../services/stats.service";

// Color palettes
const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: "#ef4444",
  HIGH: "#f97316",
  MEDIUM: "#eab308",
  LOW: "#22c55e",
};

const SYSTEM_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f59e0b",
  "#6366f1",
  "#84cc16",
  "#06b6d4",
];

interface FaultHeatmapProps {
  days?: number;
}

export function FaultHeatmap({ days = 365 }: FaultHeatmapProps) {
  const [data, setData] = useState<FaultHeatmapData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError(null);
      try {
        const result = await statsService.getFaultHeatmap(days);
        setData(result);
      } catch (err) {
        console.error("Failed to load fault heatmap data:", err);
        setError("Failed to load fault data");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [days]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>故障分析</CardTitle>
          <CardDescription>加载中...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>故障分析</CardTitle>
          <CardDescription>{error || "暂无数据"}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <AlertTriangle className="w-8 h-8 mr-2" />
            <span>无法加载故障数据</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Format severity data for pie chart
  const severityData = data.bySeverity.map((item) => ({
    name: getSeverityLabel(item.severity),
    value: item.count,
    fill: SEVERITY_COLORS[item.severity] || "#94a3b8",
  }));

  // Format month data for line chart
  const monthData = data.byMonth.map((item) => ({
    month: formatMonth(item.month),
    count: item.count,
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              故障分析热力图
            </CardTitle>
            <CardDescription>过去 {days} 天的故障统计</CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-500" />
              总计 {data.totalFaults}
            </Badge>
            <Badge variant="outline" className="gap-1 text-amber-600 border-amber-300">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              开放 {data.openFaults}
            </Badge>
            <Badge variant="outline" className="gap-1 text-red-600 border-red-300">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              严重 {data.criticalFaults}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="system" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="system">按系统</TabsTrigger>
            <TabsTrigger value="model">按机型</TabsTrigger>
            <TabsTrigger value="severity">按严重度</TabsTrigger>
            <TabsTrigger value="trend">趋势</TabsTrigger>
          </TabsList>

          {/* By System */}
          <TabsContent value="system" className="space-y-4">
            <div className="h-80">
              {data.bySystem.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  暂无系统故障数据
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.bySystem}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="system" type="category" width={70} />
                    <Tooltip
                      formatter={(value: number) => [`${value} 次`, "故障数"]}
                      labelFormatter={(label) => `系统: ${label}`}
                    />
                    <Bar dataKey="faultCount" name="故障数">
                      {data.bySystem.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={SYSTEM_COLORS[index % SYSTEM_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </TabsContent>

          {/* By Aircraft Model */}
          <TabsContent value="model" className="space-y-4">
            <div className="h-80">
              {data.byAircraftModel.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  暂无机型故障数据
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.byAircraftModel}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="model" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => [`${value} 次`, "故障数"]}
                      labelFormatter={(label) => `机型: ${label}`}
                    />
                    <Bar dataKey="faultCount" name="故障数" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </TabsContent>

          {/* By Severity */}
          <TabsContent value="severity" className="space-y-4">
            <div className="h-80">
              {severityData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  暂无严重度数据
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={severityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {severityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${value} 次`, "故障数"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </TabsContent>

          {/* Trend */}
          <TabsContent value="trend" className="space-y-4">
            <div className="h-80">
              {monthData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  暂无趋势数据
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={monthData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => [`${value} 次`, "故障数"]}
                      labelFormatter={(label) => `月份: ${label}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: "#3b82f6" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

/**
 * Helper: Get severity label in Chinese
 */
function getSeverityLabel(severity: string): string {
  const labels: Record<string, string> = {
    CRITICAL: "严重",
    HIGH: "高",
    MEDIUM: "中",
    LOW: "低",
  };
  return labels[severity] || severity;
}

/**
 * Helper: Format month string (YYYY-MM) to display format
 */
function formatMonth(monthStr: string): string {
  const [year, month] = monthStr.split("-");
  return `${year}/${month}`;
}
