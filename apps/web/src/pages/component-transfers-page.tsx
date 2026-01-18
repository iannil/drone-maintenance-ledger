import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRightLeft,
  Plane,
  Wrench,
  Calendar,
  User,
  FileText,
  Search,
  Filter,
  Plus,
  Download,
  AlertCircle,
  Info,
  Loader2,
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
import { AircraftStatusBadge } from "../components/common/status-badge";
import { componentService, Component } from "../services/component.service";
import { fullAircraftService, Aircraft } from "../services/fleet.service";
import { workOrderService, WorkOrder } from "../services/work-order.service";

// Transfer types
const TRANSFER_TYPES = [
  { value: "INSTALLATION", label: "安装", description: "新件安装到飞机上", color: "bg-green-100 text-green-700" },
  { value: "REMOVAL", label: "拆下", description: "从飞机上拆下", color: "bg-orange-100 text-orange-700" },
  { value: "TRANSFER", label: "调拨", description: "在飞机之间转移", color: "bg-blue-100 text-blue-700" },
  { value: "REPAIR", label: "送修", description: "送出维修", color: "bg-purple-100 text-purple-700" },
  { value: "SCRAP", label: "报废", description: "零部件报废", color: "bg-red-100 text-red-700" },
  { value: "RETURN", label: "返厂", description: "返回厂家", color: "bg-gray-100 text-gray-700" },
];

// Transfer history record interface
// TODO: This interface should be moved to a service file once the transfer history API is implemented
interface TransferRecord {
  id: string;
  type: string;
  from: { type: string; id?: string; name: string; location?: string; position?: string };
  to: { type: string; id?: string; name: string; location?: string; position?: string };
  performedBy: string;
  performedAt: string;
  workOrderNumber?: string;
  notes?: string;
  flightHoursAtInstall: number;
  currentFlightHours: number;
}

interface NewTransfer {
  type: string;
  fromType: string;
  fromId: string;
  fromPosition: string;
  toType: string;
  toId: string;
  toPosition: string;
  workOrderId: string;
  notes: string;
  performedAt: string;
}

/**
 * Component transfer/lifecycle tracking page
 */
export function ComponentTransfersPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Loading states
  const [isLoadingComponent, setIsLoadingComponent] = useState(true);
  const [isLoadingAircraft, setIsLoadingAircraft] = useState(true);
  const [isLoadingWorkOrders, setIsLoadingWorkOrders] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [component, setComponent] = useState<Component | null>(null);
  const [aircraftList, setAircraftList] = useState<Aircraft[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  // TODO: Transfer history API needs to be implemented on the backend
  // For now, using an empty array as placeholder
  const [transferHistory, setTransferHistory] = useState<TransferRecord[]>([]);

  // UI states
  const [showNewTransferDialog, setShowNewTransferDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [newTransfer, setNewTransfer] = useState<NewTransfer>({
    type: "",
    fromType: "",
    fromId: "",
    fromPosition: "",
    toType: "",
    toId: "",
    toPosition: "",
    workOrderId: "",
    notes: "",
    performedAt: new Date().toISOString().slice(0, 16),
  });

  // Fetch component data
  useEffect(() => {
    async function fetchComponent() {
      if (!id) return;
      setIsLoadingComponent(true);
      setError(null);
      try {
        const data = await componentService.getById(id);
        setComponent(data);
      } catch (err) {
        console.error("Failed to fetch component:", err);
        setError("加载零部件信息失败");
      } finally {
        setIsLoadingComponent(false);
      }
    }
    fetchComponent();
  }, [id]);

  // Fetch aircraft list
  useEffect(() => {
    async function fetchAircraft() {
      setIsLoadingAircraft(true);
      try {
        const data = await fullAircraftService.list();
        setAircraftList(data);
      } catch (err) {
        console.error("Failed to fetch aircraft list:", err);
      } finally {
        setIsLoadingAircraft(false);
      }
    }
    fetchAircraft();
  }, []);

  // Fetch work orders
  useEffect(() => {
    async function fetchWorkOrders() {
      setIsLoadingWorkOrders(true);
      try {
        const data = await workOrderService.list();
        setWorkOrders(data);
      } catch (err) {
        console.error("Failed to fetch work orders:", err);
      } finally {
        setIsLoadingWorkOrders(false);
      }
    }
    fetchWorkOrders();
  }, []);

  // Derived loading state
  const isLoading = isLoadingComponent || isLoadingAircraft || isLoadingWorkOrders;

  // Filter history
  const filteredHistory = transferHistory.filter((transfer) => {
    const matchesSearch =
      transfer.workOrderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transfer.performedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transfer.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || transfer.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Get transfer type info
  const getTransferTypeInfo = (type: string) => {
    return TRANSFER_TYPES.find((t) => t.value === type) || {
      label: type,
      color: "bg-gray-100 text-gray-700",
    };
  };

  // Handle new transfer
  const handleNewTransfer = () => {
    console.log("Create new transfer:", newTransfer);
    // TODO: API call to create transfer
    setShowNewTransferDialog(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to={`/components/${id}`}>
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">零部件履历</h1>
          <p className="text-muted-foreground">
            追踪零部件的安装、拆下、转移等完整生命周期记录
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" disabled={isLoading}>
            <Download className="w-4 h-4 mr-2" />
            导出履历
          </Button>
          <Button onClick={() => setShowNewTransferDialog(true)} disabled={isLoading}>
            <Plus className="w-4 h-4 mr-2" />
            新增记录
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoadingComponent && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">加载中...</span>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && !isLoadingComponent && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <span className="ml-2 text-red-500">{error}</span>
          </CardContent>
        </Card>
      )}

      {/* Component Info Card */}
      {component && !isLoadingComponent && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>零部件信息</CardTitle>
                <CardDescription>当前追踪的零部件详情</CardDescription>
              </div>
              <Badge className="bg-green-100 text-green-700">
                {component.status === "IN_USE" ? "已安装" : "库存中"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">序列号</p>
                <p className="font-mono font-medium">{component.serialNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">件号</p>
                <p className="font-mono text-sm">{component.partNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">名称</p>
                <p className="font-medium">{component.model || component.type}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">制造商</p>
                <p className="font-medium">{component.manufacturer}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">生产日期</p>
                <p className="text-sm">
                  {component.manufacturedAt
                    ? new Date(component.manufacturedAt).toLocaleDateString("zh-CN")
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">累计飞行小时</p>
                <p className="font-medium">{component.totalFlightHours} h</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">累计起降循环</p>
                <p className="font-medium">{component.totalFlightCycles} 次</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">适航状态</p>
                <p className="text-sm">{component.isAirworthy ? "适航" : "不适航"}</p>
              </div>
            </div>

            {/* Current Location - Note: currentAircraft info not available from component API, would need separate query */}
            {/* TODO: Add current aircraft installation info when component installation API is available */}
          </CardContent>
        </Card>
      )}

      {/* Lifecycle Statistics */}
      {component && !isLoadingComponent && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                累计安装次数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {transferHistory.filter((t) => t.type === "INSTALLATION").length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                累计使用飞机
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {new Set(
                  transferHistory
                    .filter((t) => t.to.type === "AIRCRAFT")
                    .map((t) => t.to.id)
                ).size}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                总服役时长
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{component.totalFlightHours} h</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                历史记录
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{transferHistory.length}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Transfer History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>履历记录</CardTitle>
              <CardDescription>
                共 {filteredHistory.length} 条记录
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索工单号、执行人、备注..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="类型筛选" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                {TRANSFER_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200" />

            {/* Transfer items */}
            <div className="space-y-6">
              {filteredHistory.map((transfer, index) => {
                const typeInfo = getTransferTypeInfo(transfer.type);
                const isLatest = index === 0;

                return (
                  <div key={transfer.id} className="relative flex gap-4">
                    {/* Timeline dot */}
                    <div
                      className={`flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center ${
                        isLatest
                          ? "bg-primary text-primary-foreground z-10"
                          : "bg-white border-2 border-slate-300 z-10"
                      }`}
                    >
                      <ArrowRightLeft className="h-5 w-5" />
                    </div>

                    {/* Content */}
                    <div className={`flex-1 p-4 border rounded-lg ${isLatest ? "bg-primary/5 border-primary/20" : ""}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className={typeInfo.color}>
                            {typeInfo.label}
                          </Badge>
                          {isLatest && (
                            <Badge variant="outline" className="text-xs">
                              最新
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(transfer.performedAt).toLocaleString("zh-CN")}
                        </div>
                      </div>

                      {/* Transfer details */}
                      <div className="flex items-center gap-4 my-3">
                        <div className="flex-1 p-3 bg-slate-50 rounded">
                          <p className="text-xs text-muted-foreground mb-1">从</p>
                          <p className="font-medium">
                            {transfer.from.type === "AIRCRAFT" ? (
                              <Link
                                to={`/aircraft/${transfer.from.id}`}
                                className="text-primary hover:underline"
                              >
                                {transfer.from.name}
                              </Link>
                            ) : (
                              transfer.from.name
                            )}
                          </p>
                          {transfer.from.position && (
                            <p className="text-xs text-muted-foreground">{transfer.from.position}</p>
                          )}
                        </div>

                        <ArrowRightLeft className="h-5 w-5 text-muted-foreground flex-shrink-0" />

                        <div className="flex-1 p-3 bg-slate-50 rounded">
                          <p className="text-xs text-muted-foreground mb-1">到</p>
                          <p className="font-medium">
                            {transfer.to.type === "AIRCRAFT" ? (
                              <Link
                                to={`/aircraft/${transfer.to.id}`}
                                className="text-primary hover:underline"
                              >
                                {transfer.to.name}
                              </Link>
                            ) : (
                              transfer.to.name
                            )}
                          </p>
                          {transfer.to.position && (
                            <p className="text-xs text-muted-foreground">{transfer.to.position}</p>
                          )}
                        </div>
                      </div>

                      {/* Additional info */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{transfer.performedBy}</span>
                        </div>
                        {transfer.workOrderNumber && (
                          <div className="flex items-center gap-1">
                            <Wrench className="h-3 w-3" />
                            <Link
                              to="/work-orders"
                              className="text-primary hover:underline"
                            >
                              {transfer.workOrderNumber}
                            </Link>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            飞行: {transfer.flightHoursAtInstall}h → {transfer.currentFlightHours}h
                          </span>
                        </div>
                      </div>

                      {transfer.notes && (
                        <div className="mt-2 text-sm">
                          <span className="text-muted-foreground">备注: </span>
                          <span>{transfer.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* New Transfer Dialog */}
      <Dialog open={showNewTransferDialog} onOpenChange={setShowNewTransferDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>新增履历记录</DialogTitle>
            <DialogDescription>
              记录零部件的转移、安装、拆下等操作
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {/* Transfer Type */}
            <div>
              <Label htmlFor="transferType">操作类型 *</Label>
              <Select
                value={newTransfer.type}
                onValueChange={(value) => setNewTransfer({ ...newTransfer, type: value })}
              >
                <SelectTrigger id="transferType">
                  <SelectValue placeholder="选择操作类型" />
                </SelectTrigger>
                <SelectContent>
                  {TRANSFER_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {type.description}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* From */}
            <div>
              <Label>从 *</Label>
              <div className="grid grid-cols-2 gap-3 mt-1">
                <Select
                  value={newTransfer.fromType}
                  onValueChange={(value) => setNewTransfer({ ...newTransfer, fromType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="来源类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AIRCRAFT">飞机</SelectItem>
                    <SelectItem value="INVENTORY">库存</SelectItem>
                  </SelectContent>
                </Select>
                {newTransfer.fromType === "AIRCRAFT" ? (
                  <Select
                    value={newTransfer.fromId}
                    onValueChange={(value) => setNewTransfer({ ...newTransfer, fromId: value })}
                    disabled={isLoadingAircraft}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingAircraft ? "加载中..." : "选择飞机"} />
                    </SelectTrigger>
                    <SelectContent>
                      {aircraftList.map((ac) => (
                        <SelectItem key={ac.id} value={ac.id}>
                          {ac.registrationNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    placeholder="库位，如：A-01-01"
                    value={newTransfer.fromId}
                    onChange={(e) => setNewTransfer({ ...newTransfer, fromId: e.target.value })}
                  />
                )}
              </div>
              {newTransfer.fromType === "AIRCRAFT" && (
                <Input
                  placeholder="安装位置，如：左前电机"
                  value={newTransfer.fromPosition}
                  onChange={(e) => setNewTransfer({ ...newTransfer, fromPosition: e.target.value })}
                  className="mt-2"
                />
              )}
            </div>

            {/* To */}
            <div>
              <Label>到 *</Label>
              <div className="grid grid-cols-2 gap-3 mt-1">
                <Select
                  value={newTransfer.toType}
                  onValueChange={(value) => setNewTransfer({ ...newTransfer, toType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="目标类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AIRCRAFT">飞机</SelectItem>
                    <SelectItem value="INVENTORY">库存</SelectItem>
                  </SelectContent>
                </Select>
                {newTransfer.toType === "AIRCRAFT" ? (
                  <Select
                    value={newTransfer.toId}
                    onValueChange={(value) => setNewTransfer({ ...newTransfer, toId: value })}
                    disabled={isLoadingAircraft}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingAircraft ? "加载中..." : "选择飞机"} />
                    </SelectTrigger>
                    <SelectContent>
                      {aircraftList.map((ac) => (
                        <SelectItem key={ac.id} value={ac.id}>
                          {ac.registrationNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    placeholder="库位，如：A-01-01"
                    value={newTransfer.toId}
                    onChange={(e) => setNewTransfer({ ...newTransfer, toId: e.target.value })}
                  />
                )}
              </div>
              {newTransfer.toType === "AIRCRAFT" && (
                <Input
                  placeholder="安装位置，如：左前电机"
                  value={newTransfer.toPosition}
                  onChange={(e) => setNewTransfer({ ...newTransfer, toPosition: e.target.value })}
                  className="mt-2"
                />
              )}
            </div>

            {/* Work Order */}
            <div>
              <Label htmlFor="workOrder">关联工单</Label>
              <Select
                value={newTransfer.workOrderId}
                onValueChange={(value) => setNewTransfer({ ...newTransfer, workOrderId: value })}
                disabled={isLoadingWorkOrders}
              >
                <SelectTrigger id="workOrder">
                  <SelectValue placeholder={isLoadingWorkOrders ? "加载中..." : "选择工单（可选）"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">无关联</SelectItem>
                  {workOrders.map((wo) => (
                    <SelectItem key={wo.id} value={wo.id}>
                      {wo.orderNumber} - {wo.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Operation Time */}
            <div>
              <Label htmlFor="performedAt">操作时间</Label>
              <Input
                id="performedAt"
                type="datetime-local"
                value={newTransfer.performedAt}
                onChange={(e) => setNewTransfer({ ...newTransfer, performedAt: e.target.value })}
              />
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">备注说明</Label>
              <Textarea
                id="notes"
                placeholder="详细说明操作原因、发现的问题等..."
                value={newTransfer.notes}
                onChange={(e) => setNewTransfer({ ...newTransfer, notes: e.target.value })}
                rows={3}
              />
            </div>

            {/* Info alert */}
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded text-blue-800 text-sm">
              <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <p>
                此记录将成为零部件履历的一部分，用于追溯零部件的完整使用历史。
                确保信息准确完整。
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewTransferDialog(false)}>
              取消
            </Button>
            <Button onClick={handleNewTransfer} disabled={!newTransfer.type || !newTransfer.fromType || !newTransfer.toType}>
              <Plus className="h-4 w-4 mr-2" />
              添加记录
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
