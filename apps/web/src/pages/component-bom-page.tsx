/**
 * Component BOM (Bill of Materials) Page
 * 零部件BOM页面
 */

import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Box,
  Package,
  AlertTriangle,
  Info,
  Download,
  Printer,
  RefreshCw,
} from "lucide-react";

// Mock data for aircraft BOM
const MOCK_AIRCRAFT_BOM = {
  id: "BOM-AC-001",
  aircraftId: "AC-2024-0015",
  aircraft: {
    registration: "B-702A",
    model: "DJI Matrice 350 RTK",
    serialNumber: "SN-M350-0015",
  },
  version: "v2.3",
  lastUpdated: "2025-01-10T14:30:00",
  tree: [
    {
      id: "assy-001",
      partNumber: "ASSY-M350-MAIN",
      name: "主机身总成",
      quantity: 1,
      unit: "套",
      category: "结构",
      level: 1,
      isExpandable: true,
      isExpanded: true,
      children: [
        {
          id: "part-001",
          partNumber: "BODY-M350-01",
          name: "机身框架",
          quantity: 1,
          unit: "件",
          category: "结构",
          level: 2,
          isExpandable: false,
          installedSn: "SN-BODY-015",
          installedDate: "2024-03-15",
          status: "INSTALLED",
        },
        {
          id: "part-002",
          partNumber: "COVER-M350-TOP",
          name: "上壳盖",
          quantity: 1,
          unit: "件",
          category: "结构",
          level: 2,
          isExpandable: false,
          installedSn: "SN-COV-015",
          installedDate: "2024-03-15",
          status: "INSTALLED",
        },
        {
          id: "assy-002",
          partNumber: "ASSY-M350-ARM",
          name: "机臂总成",
          quantity: 4,
          unit: "套",
          category: "结构",
          level: 2,
          isExpandable: true,
          isExpanded: false,
          children: [
            {
              id: "part-003",
              partNumber: "ARM-M350-01",
              name: "机臂折叠组件",
              quantity: 1,
              unit: "件",
              category: "结构",
              level: 3,
              isExpandable: false,
              installedSn: "SN-ARM-060",
              installedDate: "2024-03-15",
              status: "INSTALLED",
            },
          ],
        },
      ],
    },
    {
      id: "assy-003",
      partNumber: "ASSY-M350-POWER",
      name: "动力系统",
      quantity: 1,
      unit: "套",
      category: "动力",
      level: 1,
      isExpandable: true,
      isExpanded: true,
      children: [
        {
          id: "assy-004",
          partNumber: "ASSY-M350-MOTOR",
          name: "电机总成",
          quantity: 4,
          unit: "套",
          category: "动力",
          level: 2,
          isExpandable: true,
          isExpanded: false,
          children: [
            {
              id: "part-004",
              partNumber: "MOTOR-M350-01",
              name: "无刷电机 M350",
              quantity: 1,
              unit: "台",
              category: "动力",
              level: 3,
              isExpandable: false,
              installedSn: "SN-MOT-042",
              installedDate: "2024-03-15",
              status: "INSTALLED",
              isLlp: true,
              lifeLimit: 1000,
              lifeUnit: "飞行小时",
              currentUsage: 342,
            },
            {
              id: "part-005",
              partNumber: "ESC-M350-01",
              name: "电调 M350",
              quantity: 1,
              unit: "台",
              category: "动力",
              level: 3,
              isExpandable: false,
              installedSn: "SN-ESC-042",
              installedDate: "2024-03-15",
              status: "INSTALLED",
            },
          ],
        },
        {
          id: "assy-005",
          partNumber: "ASSY-M350-PROP",
          name: "螺旋桨总成",
          quantity: 4,
          unit: "套",
          category: "动力",
          level: 2,
          isExpandable: true,
          isExpanded: false,
          children: [
            {
              id: "part-006",
              partNumber: "PROP-M350-01",
              name: "桨叶 M350",
              quantity: 2,
              unit: "片",
              category: "动力",
              level: 3,
              isExpandable: false,
              installedSn: "SN-PROP-156",
              installedDate: "2024-12-20",
              status: "INSTALLED",
              isLlp: true,
              lifeLimit: 500,
              lifeUnit: "飞行小时",
              currentUsage: 89,
            },
          ],
        },
      ],
    },
    {
      id: "assy-006",
      partNumber: "ASSY-M350-BATT",
      name: "电池系统",
      quantity: 1,
      unit: "套",
      category: "电源",
      level: 1,
      isExpandable: true,
      isExpanded: false,
      children: [
        {
          id: "part-007",
          partNumber: "BATT-M350-01",
          name: "智能电池箱 M350",
          quantity: 1,
          unit: "件",
          category: "电源",
          level: 2,
          isExpandable: false,
          installedSn: "SN-BATT-BOX-015",
          installedDate: "2024-03-15",
          status: "INSTALLED",
        },
        {
          id: "part-008",
          partNumber: "BATT-M350-CELL",
          name: "电池组 M350",
          quantity: 2,
          unit: "块",
          category: "电源",
          level: 2,
          isExpandable: false,
          installedSn: "SN-BATT-089, SN-BATT-090",
          installedDate: "2024-12-01",
          status: "INSTALLED",
          isLlp: true,
          lifeLimit: 300,
          lifeUnit: "循环次数",
          currentUsage: 45,
        },
      ],
    },
    {
      id: "assy-007",
      partNumber: "ASSY-M350-AVIONICS",
      name: "航电系统",
      quantity: 1,
      unit: "套",
      category: "航电",
      level: 1,
      isExpandable: true,
      isExpanded: false,
      children: [
        {
          id: "part-009",
          partNumber: "FC-M350-01",
          name: "飞控单元",
          quantity: 1,
          unit: "件",
          category: "航电",
          level: 2,
          isExpandable: false,
          installedSn: "SN-FC-015",
          installedDate: "2024-03-15",
          status: "INSTALLED",
        },
        {
          id: "part-010",
          partNumber: "GPS-M350-01",
          name: "GPS模块",
          quantity: 1,
          unit: "件",
          category: "航电",
          level: 2,
          isExpandable: false,
          installedSn: "SN-GPS-015",
          installedDate: "2024-03-15",
          status: "INSTALLED",
        },
        {
          id: "part-011",
          partNumber: "RC-M350-01",
          name: "遥控接收模块",
          quantity: 1,
          unit: "件",
          category: "航电",
          level: 2,
          isExpandable: false,
          installedSn: "SN-RC-015",
          installedDate: "2024-03-15",
          status: "INSTALLED",
        },
      ],
    },
    {
      id: "assy-008",
      partNumber: "ASSY-M350-GIMBAL",
      name: "云台相机系统",
      quantity: 1,
      unit: "套",
      category: "任务载荷",
      level: 1,
      isExpandable: true,
      isExpanded: false,
      children: [
        {
          id: "part-012",
          partNumber: "GIMBAL-Z30",
          name: "云台 Z30",
          quantity: 1,
          unit: "件",
          category: "任务载荷",
          level: 2,
          isExpandable: false,
          installedSn: "SN-GIM-008",
          installedDate: "2024-05-20",
          status: "INSTALLED",
        },
        {
          id: "part-013",
          partNumber: "CAM-Z30",
          name: "相机模组 Z30",
          quantity: 1,
          unit: "件",
          category: "任务载荷",
          level: 2,
          isExpandable: false,
          installedSn: "SN-CAM-008",
          installedDate: "2024-05-20",
          status: "INSTALLED",
        },
      ],
    },
  ],
};

const STATUS_CONFIG = {
  INSTALLED: { label: "已安装", color: "bg-green-100 text-green-700" },
  REPLACED: { label: "已更换", color: "bg-blue-100 text-blue-700" },
  MISSING: { label: "缺失", color: "bg-red-100 text-red-700" },
  PENDING: { label: "待安装", color: "bg-yellow-100 text-yellow-700" },
};

const CATEGORY_COLORS = {
  结构: "bg-slate-100 text-slate-700",
  动力: "bg-blue-100 text-blue-700",
  电源: "bg-green-100 text-green-700",
  航电: "bg-purple-100 text-purple-700",
  "任务载荷": "bg-orange-100 text-orange-700",
  通信: "bg-cyan-100 text-cyan-700",
};

interface BOMNode {
  id: string;
  partNumber: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  level: number;
  isExpandable: boolean;
  isExpanded?: boolean;
  children?: BOMNode[];
  installedSn?: string;
  installedDate?: string;
  status?: string;
  isLlp?: boolean;
  lifeLimit?: number;
  lifeUnit?: string;
  currentUsage?: number;
}

export function ComponentBomPage() {
  const { aircraftId } = useParams<{ aircraftId: string }>();
  const [bomData, setBomData] = useState<{ id: string; aircraftId: string; aircraft: { registration: string; model: string; serialNumber: string }; version: string; lastUpdated: string; tree: BOMNode[] }>(MOCK_AIRCRAFT_BOM as any);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [showLlpOnly, setShowLlpOnly] = useState(false);

  const toggleNode = (nodeId: string) => {
    const toggleNodeRecursive = (nodes: BOMNode[]): BOMNode[] => {
      return nodes.map((node) => {
        if (node.id === nodeId) {
          return { ...node, isExpanded: !node.isExpanded };
        }
        if (node.children) {
          return { ...node, children: toggleNodeRecursive(node.children) };
        }
        return node;
      });
    };
    setBomData({
      ...bomData,
      tree: toggleNodeRecursive(bomData.tree),
    });
  };

  const expandAll = () => {
    const expandAllRecursive = (nodes: BOMNode[]): BOMNode[] => {
      return nodes.map((node) => ({
        ...node,
        isExpanded: node.isExpandable ? true : node.isExpanded,
        children: node.children ? expandAllRecursive(node.children) : node.children,
      }));
    };
    setBomData({
      ...bomData,
      tree: expandAllRecursive(bomData.tree),
    });
  };

  const collapseAll = () => {
    const collapseAllRecursive = (nodes: BOMNode[]): BOMNode[] => {
      return nodes.map((node) => ({
        ...node,
        isExpanded: node.isExpandable ? false : node.isExpanded,
        children: node.children ? collapseAllRecursive(node.children) : node.children,
      }));
    };
    setBomData({
      ...bomData,
      tree: collapseAllRecursive(bomData.tree),
    });
  };

  const flattenVisibleNodes = (nodes: BOMNode[], parentExpanded = true): BOMNode[] => {
    let result: BOMNode[] = [];
    for (const node of nodes) {
      const isVisible = parentExpanded;
      if (isVisible) {
        result.push(node);
      }
      if (node.children) {
        result = result.concat(
          flattenVisibleNodes(node.children, parentExpanded && (node.isExpanded || false))
        );
      }
    }
    return result;
  };

  const visibleNodes = flattenVisibleNodes(bomData.tree).filter((node) => {
    const matchesSearch =
      searchQuery === "" ||
      node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.partNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "ALL" || node.category === selectedCategory;
    const matchesLlp = !showLlpOnly || node.isLlp;
    return matchesSearch && matchesCategory && matchesLlp;
  });

  const handleExport = () => {
    console.log("Exporting BOM");
  };

  const handlePrint = () => {
    window.print();
  };

  const getLlpStatus = (node: BOMNode) => {
    if (!node.isLlp || !node.lifeLimit || !node.currentUsage) return null;
    const percentage = (node.currentUsage / node.lifeLimit) * 100;
    if (percentage >= 90) return { color: "text-red-600", label: "临界" };
    if (percentage >= 75) return { color: "text-orange-600", label: "预警" };
    return { color: "text-green-600", label: "正常" };
  };

  const categories = Array.from(new Set(flattenVisibleNodes(bomData.tree).map((n) => n.category)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">零部件BOM</h1>
            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
              {bomData.version}
            </span>
          </div>
          <p className="text-slate-500 mt-1">
            {bomData.aircraft.registration} · {bomData.aircraft.model}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={expandAll}
            className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-sm"
          >
            全部展开
          </button>
          <button
            onClick={collapseAll}
            className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-sm"
          >
            全部收起
          </button>
          <button
            onClick={handlePrint}
            className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50"
            title="打印"
          >
            <Printer className="w-4 h-4" />
          </button>
          <button
            onClick={handleExport}
            className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50"
            title="导出"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Aircraft Info Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
              <span className="text-3xl">✈️</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{bomData.aircraft.registration}</h3>
              <p className="text-slate-500">{bomData.aircraft.model}</p>
              <p className="text-sm text-slate-400 mt-1">S/N: {bomData.aircraft.serialNumber}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">最后更新</p>
            <p className="font-medium text-slate-900">
              {new Date(bomData.lastUpdated).toLocaleString("zh-CN")}
            </p>
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
                placeholder="搜索零部件..."
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
            <option value="ALL">全部类别</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showLlpOnly}
              onChange={(e) => setShowLlpOnly(e.target.checked)}
              className="w-4 h-4 text-orange-600 border-slate-300 rounded focus:ring-orange-500"
            />
            <span className="text-sm text-slate-600">仅显示寿命件</span>
          </label>
        </div>
      </div>

      {/* BOM Tree */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Table Header */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200">
          <div className="grid grid-cols-12 gap-4 text-xs font-medium text-slate-500 uppercase">
            <div className="col-span-4">零部件</div>
            <div className="col-span-1">数量</div>
            <div className="col-span-2">类别</div>
            <div className="col-span-2">序列号</div>
            <div className="col-span-2">寿命状态</div>
            <div className="col-span-1">操作</div>
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-slate-200">
          {visibleNodes.map((node) => {
            const llpStatus = getLlpStatus(node);
            const categoryColor = CATEGORY_COLORS[node.category as keyof typeof CATEGORY_COLORS] || "bg-slate-100 text-slate-700";

            return (
              <div key={node.id} className="px-6 py-3 hover:bg-slate-50">
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Name Column */}
                  <div className="col-span-4">
                    <div className="flex items-center gap-2">
                      <div style={{ paddingLeft: `${(node.level - 1) * 20}px` }}>
                        {node.isExpandable && (
                          <button
                            onClick={() => toggleNode(node.id)}
                            className="p-0.5 hover:bg-slate-200 rounded"
                          >
                            {node.isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-slate-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-slate-400" />
                            )}
                          </button>
                        )}
                        {!node.isExpandable && node.level > 1 && (
                          <span className="w-5 inline-block" />
                        )}
                      </div>
                      <div>
                        {node.children ? (
                          <div className="flex items-center gap-2">
                            <Box className="w-4 h-4 text-blue-500" />
                            <span className="font-medium text-slate-900">{node.name}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-900">{node.name}</span>
                            {node.isLlp && (
                              <span title="寿命件"><AlertTriangle className="w-3 h-3 text-orange-500" /></span>
                            )}
                          </div>
                        )}
                        <p className="text-xs text-slate-500 mt-0.5">{node.partNumber}</p>
                      </div>
                    </div>
                  </div>

                  {/* Quantity Column */}
                  <div className="col-span-1">
                    <span className="text-sm text-slate-900">
                      {node.quantity} {node.unit}
                    </span>
                  </div>

                  {/* Category Column */}
                  <div className="col-span-2">
                    <span className={`px-2 py-1 text-xs rounded ${categoryColor}`}>
                      {node.category}
                    </span>
                  </div>

                  {/* Serial Number Column */}
                  <div className="col-span-2">
                    {node.installedSn ? (
                      <div>
                        <p className="text-sm text-slate-900 font-mono">{node.installedSn}</p>
                        {node.installedDate && (
                          <p className="text-xs text-slate-500">
                            {new Date(node.installedDate).toLocaleDateString("zh-CN")}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400">-</span>
                    )}
                  </div>

                  {/* Life Status Column */}
                  <div className="col-span-2">
                    {node.isLlp ? (
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                llpStatus?.color === "text-red-600"
                                  ? "bg-red-500"
                                  : llpStatus?.color === "text-orange-600"
                                  ? "bg-orange-500"
                                  : "bg-green-500"
                              }`}
                              style={{
                                width: `${((node.currentUsage || 0) / (node.lifeLimit || 1)) * 100}%`,
                              }}
                            />
                          </div>
                          <span className={`text-xs font-medium ${llpStatus?.color || ""}`}>
                            {llpStatus?.label || ""}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {node.currentUsage} / {node.lifeLimit} {node.lifeUnit}
                        </p>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400">-</span>
                    )}
                  </div>

                  {/* Actions Column */}
                  <div className="col-span-1">
                    <div className="flex items-center gap-1">
                      <Link
                        to={`/components/${node.id}`}
                        className="p-1.5 hover:bg-slate-100 rounded"
                        title="查看详情"
                      >
                        <Info className="w-4 h-4 text-slate-400 hover:text-blue-600" />
                      </Link>
                      {node.children === undefined && (
                        <button className="p-1.5 hover:bg-slate-100 rounded" title="编辑">
                          <Edit className="w-4 h-4 text-slate-400 hover:text-blue-600" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">BOM汇总</h3>
        <div className="grid grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-slate-500">总零部件数</p>
            <p className="text-2xl font-bold text-slate-900">
              {flattenVisibleNodes(bomData.tree).filter((n) => !n.children).length}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500">寿命件数量</p>
            <p className="text-2xl font-bold text-orange-600">
              {flattenVisibleNodes(bomData.tree).filter((n) => n.isLlp).length}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500">临界寿命件</p>
            <p className="text-2xl font-bold text-red-600">
              {flattenVisibleNodes(bomData.tree).filter(
                (n) => n.isLlp && n.lifeLimit && n.currentUsage && (n.currentUsage / n.lifeLimit) >= 0.9
              ).length}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500">预警寿命件</p>
            <p className="text-2xl font-bold text-yellow-600">
              {flattenVisibleNodes(bomData.tree).filter(
                (n) =>
                  n.isLlp &&
                  n.lifeLimit &&
                  n.currentUsage &&
                  (n.currentUsage / n.lifeLimit) >= 0.75 &&
                  (n.currentUsage / n.lifeLimit) < 0.9
              ).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
