import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  Plus,
  Upload,
  Eye,
  Calendar,
  Plane,
  User,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";

// 证书状态
const CERTIFICATE_STATUS = {
  VALID: {
    label: "有效",
    color: "bg-green-100 text-green-700",
    icon: CheckCircle2,
  },
  EXPIRING_SOON: {
    label: "即将到期",
    color: "bg-yellow-100 text-yellow-700",
    icon: Clock,
  },
  EXPIRED: {
    label: "已过期",
    color: "bg-red-100 text-red-700",
    icon: AlertTriangle,
  },
  REVOKED: {
    label: "已吊销",
    color: "bg-slate-100 text-slate-700",
    icon: AlertTriangle,
  },
  PENDING: {
    label: "待审核",
    color: "bg-blue-100 text-blue-700",
    icon: Clock,
  },
};

// 证书类型
const CERTIFICATE_TYPES = {
  AIRWORTHINESS: {
    label: "适航证",
    description: "航空器适航证书",
    color: "bg-blue-50 text-blue-700",
  },
  REGISTRATION: {
    label: "登记证",
    description: "航空器国籍登记证",
    color: "bg-purple-50 text-purple-700",
  },
  RADIO_LICENSE: {
    label: "电台执照",
    description: "无线电台使用执照",
    color: "bg-cyan-50 text-cyan-700",
  },
  INSURANCE: {
    label: "保险单",
    description: "航空器保险证明",
    color: "bg-green-50 text-green-700",
  },
  MAINTENANCE: {
    label: "维保合格证",
    description: "维修工作合格证明",
    color: "bg-orange-50 text-orange-700",
  },
  RELEASE: {
    label: "放行证书",
    description: "维修放行证书",
    color: "bg-yellow-50 text-yellow-700",
  },
  OTHER: {
    label: "其他",
    description: "其他相关证书",
    color: "bg-slate-50 text-slate-700",
  },
};

/**
 * 适航证书管理页面
 */
export function AirworthinessPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedAircraft, setSelectedAircraft] = useState<string>("all");
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null);

  // 飞机列表
  const aircraft = [
    { id: "all", registration: "全部飞机" },
    { id: "ac-001", registration: "B-7011U", model: "DJI M350 RTK" },
    { id: "ac-002", registration: "B-7012U", model: "Autel Evo II" },
    { id: "ac-003", registration: "B-7013U", model: "DJI Mavic 3" },
  ];

  // 证书数据
  const certificates = [
    {
      id: "cert-001",
      certificateNumber: "AC-2024-00156",
      certificateType: "AIRWORTHINESS",
      aircraftId: "ac-001",
      aircraftRegistration: "B-7011U",
      issueDate: "2024-01-15",
      expiryDate: "2025-01-15",
      issuingAuthority: "中国民航局",
      status: "EXPIRING_SOON",
      documentUrl: "/documents/ac-2024-00156.pdf",
      notes: "需要年检续期",
      issuedBy: "局方检查员",
    },
    {
      id: "cert-002",
      certificateNumber: "RG-2024-00156",
      certificateType: "REGISTRATION",
      aircraftId: "ac-001",
      aircraftRegistration: "B-7011U",
      issueDate: "2024-01-15",
      expiryDate: "2029-01-15",
      issuingAuthority: "中国民航局",
      status: "VALID",
      documentUrl: "/documents/rg-2024-00156.pdf",
      notes: "长期有效",
      issuedBy: "登记机关",
    },
    {
      id: "cert-003",
      certificateNumber: "RD-2024-00156-A",
      certificateType: "RADIO_LICENSE",
      aircraftId: "ac-001",
      aircraftRegistration: "B-7011U",
      issueDate: "2024-01-15",
      expiryDate: "2026-01-15",
      issuingAuthority: "无线电管理委员会",
      status: "VALID",
      documentUrl: "/documents/rd-2024-00156-a.pdf",
      notes: "涵盖4个频段",
      issuedBy: "无线电管理部门",
    },
    {
      id: "cert-004",
      certificateNumber: "IN-2024-00089",
      certificateType: "INSURANCE",
      aircraftId: "ac-001",
      aircraftRegistration: "B-7011U",
      issueDate: "2024-08-01",
      expiryDate: "2025-08-01",
      issuingAuthority: "平安保险",
      status: "VALID",
      documentUrl: "/documents/in-2024-00089.pdf",
      notes: "保额500万元",
      issuedBy: "保险公司",
    },
    {
      id: "cert-005",
      certificateNumber: "AC-2024-00234",
      certificateType: "AIRWORTHINESS",
      aircraftId: "ac-002",
      aircraftRegistration: "B-7012U",
      issueDate: "2024-03-20",
      expiryDate: "2025-03-20",
      issuingAuthority: "中国民航局",
      status: "EXPIRING_SOON",
      documentUrl: "/documents/ac-2024-00234.pdf",
      notes: "需要年检续期",
      issuedBy: "局方检查员",
    },
    {
      id: "cert-006",
      certificateNumber: "RG-2024-00234",
      certificateType: "REGISTRATION",
      aircraftId: "ac-002",
      aircraftRegistration: "B-7012U",
      issueDate: "2024-03-20",
      expiryDate: "2029-03-20",
      issuingAuthority: "中国民航局",
      status: "VALID",
      documentUrl: "/documents/rg-2024-00234.pdf",
      notes: "长期有效",
      issuedBy: "登记机关",
    },
    {
      id: "cert-007",
      certificateNumber: "RD-2024-00234-A",
      certificateType: "RADIO_LICENSE",
      aircraftId: "ac-002",
      aircraftRegistration: "B-7012U",
      issueDate: "2024-03-20",
      expiryDate: "2026-03-20",
      issuingAuthority: "无线电管理委员会",
      status: "VALID",
      documentUrl: "/documents/rd-2024-00234-a.pdf",
      notes: "涵盖4个频段",
      issuedBy: "无线电管理部门",
    },
    {
      id: "cert-008",
      certificateNumber: "AC-2023-00012",
      certificateType: "AIRWORTHINESS",
      aircraftId: "ac-003",
      aircraftRegistration: "B-7013U",
      issueDate: "2023-11-01",
      expiryDate: "2024-11-01",
      issuingAuthority: "中国民航局",
      status: "EXPIRED",
      documentUrl: "/documents/ac-2023-00012.pdf",
      notes: "已过期，需要重新申请",
      issuedBy: "局方检查员",
    },
    {
      id: "cert-009",
      certificateNumber: "RG-2023-00012",
      certificateType: "REGISTRATION",
      aircraftId: "ac-003",
      aircraftRegistration: "B-7013U",
      issueDate: "2023-11-01",
      expiryDate: "2028-11-01",
      issuingAuthority: "中国民航局",
      status: "VALID",
      documentUrl: "/documents/rg-2023-00012.pdf",
      notes: "长期有效",
      issuedBy: "登记机关",
    },
    {
      id: "cert-010",
      certificateNumber: "WO-2026-0116-REL",
      certificateType: "RELEASE",
      aircraftId: "ac-001",
      aircraftRegistration: "B-7011U",
      issueDate: "2026-01-15",
      expiryDate: null,
      issuingAuthority: "内部检验",
      status: "VALID",
      documentUrl: "/documents/wo-2026-0116-rel.pdf",
      notes: "电机定期检查放行",
      issuedBy: "王检验",
    },
    {
      id: "cert-011",
      certificateNumber: "WO-2026-0118-REL",
      certificateType: "RELEASE",
      aircraftId: "ac-002",
      aircraftRegistration: "B-7012U",
      issueDate: "2026-01-14",
      expiryDate: null,
      issuingAuthority: "内部检验",
      status: "VALID",
      documentUrl: "/documents/wo-2026-0118-rel.pdf",
      notes: "螺旋桨更换放行",
      issuedBy: "王检验",
    },
    {
      id: "cert-012",
      certificateNumber: "AC-2025-00045-PEND",
      certificateType: "AIRWORTHINESS",
      aircraftId: "ac-003",
      aircraftRegistration: "B-7013U",
      issueDate: null,
      expiryDate: null,
      issuingAuthority: "中国民航局",
      status: "PENDING",
      documentUrl: null,
      notes: "新申请，待审核",
      issuedBy: null,
    },
  ];

  // 筛选证书
  const filteredCertificates = certificates.filter((cert) => {
    const matchesSearch =
      searchQuery === "" ||
      cert.certificateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.aircraftRegistration.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.issuingAuthority.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || cert.status === statusFilter;
    const matchesType = typeFilter === "all" || cert.certificateType === typeFilter;
    const matchesAircraft = selectedAircraft === "all" || cert.aircraftId === selectedAircraft;

    return matchesSearch && matchesStatus && matchesType && matchesAircraft;
  });

  // 统计
  const stats = {
    total: filteredCertificates.length,
    valid: filteredCertificates.filter((c) => c.status === "VALID").length,
    expiring: filteredCertificates.filter((c) => c.status === "EXPIRING_SOON").length,
    expired: filteredCertificates.filter((c) => c.status === "EXPIRED").length,
    pending: filteredCertificates.filter((c) => c.status === "PENDING").length,
  };

  // 计算到期天数
  const getDaysUntilExpiry = (expiryDate: string | null) => {
    if (!expiryDate) return null;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // 查看详情
  const viewDetail = (cert: typeof certificates[0]) => {
    setSelectedCertificate(cert);
    setShowDetailDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">适航证书</h1>
          <p className="text-muted-foreground">
            航空器相关证书和文件管理
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            上传证书
          </Button>
          <Button onClick={() => setShowUploadDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            新建证书
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              全部证书
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              有效
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.valid}</div>
          </CardContent>
        </Card>
        <Card className="border-yellow-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              即将到期
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.expiring}</div>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              已过期
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              待审核
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
          </CardContent>
        </Card>
      </div>

      {/* Status Filter Bar */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={statusFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("all")}
        >
          全部 ({stats.total})
        </Button>
        {Object.entries(CERTIFICATE_STATUS).map(([key, { label, color }]) => {
          const count = filteredCertificates.filter((c) => c.status === key).length;
          return (
            <Button
              key={key}
              variant={statusFilter === key ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(key)}
              className={statusFilter === key ? color : ""}
            >
              {label} ({count})
            </Button>
          );
        })}
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索证书号、飞机号或发证机关..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="all">全部类型</option>
              {Object.entries(CERTIFICATE_TYPES).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <select
              value={selectedAircraft}
              onChange={(e) => setSelectedAircraft(e.target.value)}
              className="h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              {aircraft.map((ac) => (
                <option key={ac.id} value={ac.id}>
                  {ac.registration}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Certificates List */}
      <Card>
        <CardHeader>
          <CardTitle>证书列表</CardTitle>
          <CardDescription>
            共 {filteredCertificates.length} 个证书
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    证书号
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    类型
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    飞机
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    发证机关
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    有效期
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    状态
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCertificates.map((cert) => {
                  const StatusIcon = CERTIFICATE_STATUS[cert.status as keyof typeof CERTIFICATE_STATUS].icon;
                  const daysUntilExpiry = getDaysUntilExpiry(cert.expiryDate);

                  return (
                    <tr key={cert.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="font-mono text-sm">{cert.certificateNumber}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={CERTIFICATE_TYPES[cert.certificateType as keyof typeof CERTIFICATE_TYPES].color}>
                          {CERTIFICATE_TYPES[cert.certificateType as keyof typeof CERTIFICATE_TYPES].label}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          to={`/aircraft/${cert.aircraftId}`}
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          <Plane className="h-3.5 w-3.5" />
                          {cert.aircraftRegistration}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-sm">{cert.issuingAuthority}</td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          {cert.issueDate ? (
                            <>
                              <div>生效: {cert.issueDate}</div>
                              {cert.expiryDate && (
                                <div className={`flex items-center gap-1 ${
                                  daysUntilExpiry !== null && daysUntilExpiry < 30 ? "text-orange-600" :
                                  daysUntilExpiry !== null && daysUntilExpiry < 0 ? "text-red-600" :
                                  "text-muted-foreground"
                                }`}>
                                  到期: {cert.expiryDate}
                                  {daysUntilExpiry !== null && (
                                    <span className="text-xs">
                                      ({daysUntilExpiry > 0 ? `${daysUntilExpiry}天后` : "已过期"})
                                    </span>
                                  )}
                                </div>
                              )}
                            </>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={CERTIFICATE_STATUS[cert.status as keyof typeof CERTIFICATE_STATUS].color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {CERTIFICATE_STATUS[cert.status as keyof typeof CERTIFICATE_STATUS].label}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => viewDetail(cert)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {cert.documentUrl && (
                            <Button variant="ghost" size="icon">
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredCertificates.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">未找到证书</h3>
              <p className="text-muted-foreground">
                尝试调整搜索或筛选条件
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新建证书</DialogTitle>
            <DialogDescription>
              添加新的适航证书或相关文件
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="certType">证书类型 *</Label>
              <Select>
                <SelectTrigger id="certType">
                  <SelectValue placeholder="选择证书类型" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CERTIFICATE_TYPES).map(([key, { label, description }]) => (
                    <SelectItem key={key} value={key}>
                      {label} - {description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="aircraft">关联飞机</Label>
              <Select>
                <SelectTrigger id="aircraft">
                  <SelectValue placeholder="选择飞机" />
                </SelectTrigger>
                <SelectContent>
                  {aircraft.filter(a => a.id !== "all").map((ac) => (
                    <SelectItem key={ac.id} value={ac.id}>
                      {ac.registration} - {ac.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="certNumber">证书编号 *</Label>
                <Input id="certNumber" placeholder="输入证书编号" />
              </div>
              <div>
                <Label htmlFor="issueDate">发证日期</Label>
                <Input id="issueDate" type="date" />
              </div>
            </div>
            <div>
              <Label htmlFor="expiryDate">到期日期</Label>
              <Input id="expiryDate" type="date" />
            </div>
            <div>
              <Label htmlFor="authority">发证机关 *</Label>
              <Input id="authority" placeholder="输入发证机关名称" />
            </div>
            <div>
              <Label htmlFor="file">证书文件</Label>
              <Input id="file" type="file" />
            </div>
            <div>
              <Label htmlFor="notes">备注</Label>
              <Textarea id="notes" placeholder="添加备注信息..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
              取消
            </Button>
            <Button onClick={() => setShowUploadDialog(false)}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>证书详情</DialogTitle>
            <DialogDescription>
              {selectedCertificate?.certificateNumber}
            </DialogDescription>
          </DialogHeader>
          {selectedCertificate && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">证书类型</Label>
                  <p className="font-medium">
                    {CERTIFICATE_TYPES[selectedCertificate.certificateType as keyof typeof CERTIFICATE_TYPES].label}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">状态</Label>
                  <p className="font-medium">
                    <Badge className={CERTIFICATE_STATUS[selectedCertificate.status as keyof typeof CERTIFICATE_STATUS].color}>
                      {CERTIFICATE_STATUS[selectedCertificate.status as keyof typeof CERTIFICATE_STATUS].label}
                    </Badge>
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">飞机</Label>
                  <p className="font-medium">{selectedCertificate.aircraftRegistration}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">发证机关</Label>
                  <p className="font-medium">{selectedCertificate.issuingAuthority}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">生效日期</Label>
                  <p className="font-medium">{selectedCertificate.issueDate || "未发证"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">到期日期</Label>
                  <p className="font-medium">{selectedCertificate.expiryDate || "永久有效"}</p>
                </div>
              </div>
              {selectedCertificate.issuedBy && (
                <div>
                  <Label className="text-muted-foreground">发证人/机构</Label>
                  <p className="font-medium flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {selectedCertificate.issuedBy}
                  </p>
                </div>
              )}
              {selectedCertificate.notes && (
                <div>
                  <Label className="text-muted-foreground">备注</Label>
                  <p className="text-sm mt-1">{selectedCertificate.notes}</p>
                </div>
              )}
              {selectedCertificate.documentUrl && (
                <div className="border-t pt-4">
                  <Button variant="outline" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    下载证书文件
                  </Button>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              关闭
            </Button>
            <Button>
              编辑证书
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
