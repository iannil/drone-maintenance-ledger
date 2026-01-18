/**
 * Task Card Templates Page
 * 工卡模板管理页面
 */

import { useState, useEffect } from "react";
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
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";

// Type definitions
interface TaskCardStep {
  id: number;
  title: string;
  description: string;
  required: boolean;
  isRII?: boolean;
}

interface RequiredPart {
  partNumber: string;
  quantity: number;
  name: string;
}

interface TaskCardTemplate {
  id: string;
  name: string;
  code: string;
  category: string;
  type: string;
  intervalValue: number | null;
  intervalUnit: string | null;
  estimatedDuration: number;
  description: string;
  steps: TaskCardStep[];
  requiredSkills: string[];
  requiredParts: RequiredPart[];
  requiresRII: boolean;
  isActive: boolean;
  version: string;
  lastModified: string;
  modifiedBy: string;
  usageCount: number;
}

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
  const [templates, setTemplates] = useState<TaskCardTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedType, setSelectedType] = useState("ALL");
  const [showInactive, setShowInactive] = useState(false);
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TaskCardTemplate | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    // TODO: Replace with actual API call
    // Example: taskCardTemplateService.getTemplates().then(setTemplates)
    const loadTemplates = async () => {
      setLoading(true);
      try {
        // Simulate API loading delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        // TODO: Fetch templates from API
        setTemplates([]);
      } catch (error) {
        console.error("Failed to load task card templates:", error);
      } finally {
        setLoading(false);
      }
    };
    loadTemplates();
  }, []);

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "ALL" || template.category === selectedCategory;
    const matchesType = selectedType === "ALL" || template.type === selectedType;
    const matchesActive = showInactive || template.isActive;
    return matchesSearch && matchesCategory && matchesType && matchesActive;
  });

  const handleDuplicate = (template: TaskCardTemplate) => {
    console.log("Duplicating template:", template.id);
    // TODO: Implement duplicate functionality
  };

  const handleDelete = (template: TaskCardTemplate) => {
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
        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <Loader2 className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
            <p className="text-slate-500">加载中...</p>
          </div>
        ) : templates.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-500">暂无任务卡模板</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
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
