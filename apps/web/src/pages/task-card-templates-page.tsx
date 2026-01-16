/**
 * Task Card Templates Page
 * 工卡模板管理页面
 */

import { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Copy,
  Edit,
  Trash2,
  Eye,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Wrench,
  User,
  Calendar,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";

// Mock data
const MOCK_TEMPLATES = [
  {
    id: "TPL-001",
    name: "50小时检查",
    code: "CHK-50H",
    category: "定期检查",
    type: "FH",
    intervalValue: 50,
    intervalUnit: "飞行小时",
    estimatedDuration: 120,
    description: "每50飞行小时进行的例行检查，包括机体、动力系统、电池状态检查",
    steps: [
      { id: 1, title: "外观检查", description: "检查机体是否有裂纹、变形", required: true },
      { id: 2, title: "螺旋桨检查", description: "检查桨叶是否有损伤、平衡状态", required: true },
      { id: 3, title: "电机测试", description: "测试各电机运转状态，检查异响", required: true },
      { id: 4, title: "电池检查", description: "检查电池外观、电压、内阻", required: true },
      { id: 5, title: "云台校准", description: "校准云台，检查俯仰、横滚、航向", required: true },
      { id: 6, title: "GPS测试", description: "测试GPS定位精度和卫星数量", required: true },
    ],
    requiredSkills: ["MECHANIC"],
    requiredParts: [],
    requiresRII: false,
    isActive: true,
    version: "v2.1",
    lastModified: "2025-01-10T10:30:00",
    modifiedBy: "张工程师",
    usageCount: 156,
  },
  {
    id: "TPL-002",
    name: "桨叶更换",
    code: "RPL-PROP",
    category: "零部件更换",
    type: "LLP",
    intervalValue: 500,
    intervalUnit: "飞行小时",
    estimatedDuration: 60,
    description: "寿命件桨叶更换程序，包括拆卸、安装、平衡调试",
    steps: [
      { id: 1, title: "拆卸旧桨叶", description: "使用专用工具拆卸旧桨叶", required: true },
      { id: 2, title: "清洁安装座", description: "清洁电机轴和安装座", required: true },
      { id: 3, title: "安装新桨叶", description: "安装新桨叶并按规定力矩拧紧", required: true },
      { id: 4, title: "动平衡测试", description: "进行动平衡测试，确保平衡", required: true, isRII: true },
      { id: 5, title: "试飞验证", description: "进行试飞，验证振动水平", required: true },
    ],
    requiredSkills: ["MECHANIC", "INSPECTOR"],
    requiredParts: [{ partNumber: "PROP-M350-01", quantity: 1, name: "桨叶 M350" }],
    requiresRII: true,
    isActive: true,
    version: "v1.5",
    lastModified: "2025-01-08T14:20:00",
    modifiedBy: "李工程师",
    usageCount: 89,
  },
  {
    id: "TPL-003",
    name: "年检",
    code: "CHK-ANN",
    category: "定期检查",
    type: "CALENDAR",
    intervalValue: 365,
    intervalUnit: "天",
    estimatedDuration: 480,
    description: "年度全面检查，覆盖所有系统和安全关键项目",
    steps: [
      { id: 1, title: "机体结构检查", description: "全面检查机体结构完整性", required: true },
      { id: 2, title: "动力系统检查", description: "检查所有电机、电调、螺旋桨", required: true },
      { id: 3, title: "电池组检查", description: "检查所有电池组，进行容量测试", required: true },
      { id: 4, title: "航电系统检查", description: "检查飞控、GPS、遥控系统", required: true },
      { id: 5, title: "云台相机检查", description: "检查云台和相机功能", required: true },
      { id: 6, title: "通信系统检查", description: "检查图传、数传系统", required: true },
      { id: 7, title: "安全设备检查", description: "检查降落伞、返航保护等", required: true },
      { id: 8, title: "飞行测试", description: "进行完整功能测试飞行", required: true, isRII: true },
    ],
    requiredSkills: ["MECHANIC", "INSPECTOR"],
    requiredParts: [],
    requiresRII: true,
    isActive: true,
    version: "v3.0",
    lastModified: "2025-01-05T09:00:00",
    modifiedBy: "王主管",
    usageCount: 48,
  },
  {
    id: "TPL-004",
    name: "电池循环更换",
    code: "RPL-BATT",
    category: "零部件更换",
    type: "BATTERY",
    intervalValue: 300,
    intervalUnit: "循环次数",
    estimatedDuration: 30,
    description: "达到循环寿命上限的电池组更换程序",
    steps: [
      { id: 1, title: "电池状态确认", description: "确认电池已达到循环上限", required: true },
      { id: 2, title: "拆卸旧电池", description: "从飞机上拆卸旧电池", required: true },
      { id: 3, title: "安装新电池", description: "安装新电池并固定", required: true },
      { id: 4, title: "电池信息录入", description: "录入新电池序列号等信息", required: true },
    ],
    requiredSkills: ["MECHANIC"],
    requiredParts: [{ partNumber: "BATT-M350-01", quantity: 1, name: "电池组 M350" }],
    requiresRII: false,
    isActive: true,
    version: "v1.2",
    lastModified: "2024-12-20T11:30:00",
    modifiedBy: "张工程师",
    usageCount: 234,
  },
  {
    id: "TPL-005",
    name: "电机故障排查",
    code: "TRB-MOTOR",
    category: "故障排除",
    type: "ON_DEMAND",
    intervalValue: null,
    intervalUnit: null,
    estimatedDuration: 180,
    description: "电机故障诊断与排除标准程序",
    steps: [
      { id: 1, title: "故障确认", description: "确认故障现象和范围", required: true },
      { id: 2, title: "外观检查", description: "检查电机外观是否有明显损坏", required: true },
      { id: 3, title: "电气测试", description: "测试电机电阻、绝缘", required: true },
      { id: 4, title: "运转测试", description: "测试电机运转状态", required: true },
      { id: 5, title: "故障处理", description: "根据测试结果进行维修或更换", required: true },
    ],
    requiredSkills: ["MECHANIC"],
    requiredParts: [],
    requiresRII: false,
    isActive: true,
    version: "v1.8",
    lastModified: "2024-12-15T16:45:00",
    modifiedBy: "李工程师",
    usageCount: 67,
  },
];

const CATEGORY_OPTIONS = [
  { value: "ALL", label: "全部类别" },
  { value: "定期检查", label: "定期检查" },
  { value: "零部件更换", label: "零部件更换" },
  { value: "故障排除", label: "故障排除" },
  { value: "改装升级", label: "改装升级" },
];

const TYPE_OPTIONS = [
  { value: "ALL", label: "全部类型" },
  { value: "FH", label: "飞行小时" },
  { value: "FC", label: "起降循环" },
  { value: "CALENDAR", label: "日历日" },
  { value: "LLP", label: "寿命件" },
  { value: "BATTERY", label: "电池循环" },
  { value: "ON_DEMAND", label: "按需执行" },
];

export function TaskCardTemplatesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedType, setSelectedType] = useState("ALL");
  const [showInactive, setShowInactive] = useState(false);
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<typeof MOCK_TEMPLATES[0] | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const filteredTemplates = MOCK_TEMPLATES.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "ALL" || template.category === selectedCategory;
    const matchesType = selectedType === "ALL" || template.type === selectedType;
    const matchesActive = showInactive || template.isActive;
    return matchesSearch && matchesCategory && matchesType && matchesActive;
  });

  const handleDuplicate = (template: typeof MOCK_TEMPLATES[0]) => {
    console.log("Duplicating template:", template.id);
    // TODO: Implement duplicate functionality
  };

  const handleDelete = (template: typeof MOCK_TEMPLATES[0]) => {
    setSelectedTemplate(template);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    console.log("Deleting template:", selectedTemplate?.id);
    setShowDeleteDialog(false);
    setSelectedTemplate(null);
    // TODO: Implement delete functionality
  };

  const toggleExpand = (templateId: string) => {
    setExpandedTemplate(expandedTemplate === templateId ? null : templateId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">工卡模板管理</h1>
          <p className="text-slate-500 mt-1">管理和配置维修工卡模板</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          <span>新建模板</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="搜索模板名称或编号..."
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
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-slate-600">显示停用</span>
          </label>
        </div>
      </div>

      {/* Template List */}
      <div className="space-y-4">
        {filteredTemplates.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-500">没有找到匹配的模板</p>
          </div>
        ) : (
          filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden"
            >
              {/* Template Header */}
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => toggleExpand(template.id)}
                      className="p-1 hover:bg-slate-100 rounded mt-1"
                    >
                      {expandedTemplate === template.id ? (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      )}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-slate-900">{template.name}</h3>
                        <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded">
                          {template.code}
                        </span>
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                          {template.category}
                        </span>
                        {!template.isActive && (
                          <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-500 rounded">
                            已停用
                          </span>
                        )}
                        {template.requiresRII && (
                          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded">
                            必检项
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 mt-2">{template.description}</p>
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          预计 {template.estimatedDuration} 分钟
                        </span>
                        {template.intervalValue && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            每 {template.intervalValue} {template.intervalUnit}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          {template.steps.length} 个步骤
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          已使用 {template.usageCount} 次
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {template.requiredSkills.join(", ")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">{template.version}</span>
                    <button
                      onClick={() => console.log("View template:", template.id)}
                      className="p-2 hover:bg-slate-100 rounded-lg"
                      title="查看"
                    >
                      <Eye className="w-4 h-4 text-slate-600" />
                    </button>
                    <Link
                      to={`/templates/${template.id}/edit`}
                      className="p-2 hover:bg-slate-100 rounded-lg"
                      title="编辑"
                    >
                      <Edit className="w-4 h-4 text-slate-600" />
                    </Link>
                    <button
                      onClick={() => handleDuplicate(template)}
                      className="p-2 hover:bg-slate-100 rounded-lg"
                      title="复制"
                    >
                      <Copy className="w-4 h-4 text-slate-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(template)}
                      className="p-2 hover:bg-red-100 rounded-lg"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedTemplate === template.id && (
                <div className="border-t border-slate-200 bg-slate-50 p-6">
                  {/* Steps */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-slate-700 mb-3">工卡步骤</h4>
                    <div className="space-y-2">
                      {template.steps.map((step, index) => (
                        <div
                          key={step.id}
                          className={`bg-white rounded-lg p-4 border ${
                            step.isRII ? "border-red-300" : "border-slate-200"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                              step.isRII ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                            }`}>
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-slate-900">{step.title}</p>
                                {step.required && (
                                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                                    必需
                                  </span>
                                )}
                                {step.isRII && (
                                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    RII
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-slate-500 mt-1">{step.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Required Parts */}
                  {template.requiredParts.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-slate-700 mb-3">所需零部件</h4>
                      <div className="flex flex-wrap gap-2">
                        {template.requiredParts.map((part, index) => (
                          <span
                            key={index}
                            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm"
                          >
                            <span className="font-medium">{part.name}</span>
                            <span className="text-slate-500 mx-2">·</span>
                            <span className="text-slate-600">{part.partNumber}</span>
                            <span className="text-slate-500 mx-2">·</span>
                            <span className="text-blue-600">×{part.quantity}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500">最后修改</p>
                      <p className="text-slate-900">
                        {new Date(template.lastModified).toLocaleDateString("zh-CN")}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">修改人</p>
                      <p className="text-slate-900">{template.modifiedBy}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">使用次数</p>
                      <p className="text-slate-900">{template.usageCount} 次</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">确认删除</h3>
            </div>
            <p className="text-slate-600 mb-6">
              确定要删除工卡模板 <strong>{selectedTemplate.name}</strong> 吗？此操作不可撤销。
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
    </div>
  );
}
