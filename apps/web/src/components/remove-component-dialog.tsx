import { useState } from "react";
import {
  WrenchOff,
  Save,
  X,
  User,
  Calendar,
  FileText,
  AlertTriangle,
  ArrowRightFromLeft,
} from "lucide-react";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import { AircraftStatusBadge } from "./common/status-badge";

// Removal reason options
const REMOVAL_REASONS = [
  { value: "maintenance", label: "定期维护", description: "按计划进行的维护性拆下" },
  { value: "failure", label: "故障更换", description: "零部件故障需要更换" },
  { value: "damage", label: "损坏拆下", description: "零部件损坏需要维修或更换" },
  { value: "upgrade", label: "升级更换", description: "升级到新版本零部件" },
  { value: "inspection", label: "检查拆下", description: "需要进一步检查" },
  { value: "end_of_life", label: "寿命到期", description: "达到使用寿命限制" },
  { value: "other", label: "其他原因", description: "其他原因" },
];

// New status after removal
const NEW_STATUS_OPTIONS = [
  { value: "IN_STOCK", label: "在库", description: "可继续使用的备件", color: "bg-blue-500" },
  { value: "REMOVED", label: "已拆下", description: "待处理的零部件", color: "bg-slate-500" },
  { value: "SCRAPPED", label: "已报废", description: "不可再使用的零部件", color: "bg-red-500" },
];

interface RemoveComponentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  component?: {
    id: string;
    serialNumber: string;
    name: string;
    type: string;
    currentAircraft?: {
      id: string;
      registration: string;
      status: string;
    };
    currentPosition?: string;
    currentFlightHours?: number;
    flightHoursLimit?: number;
  };
  onConfirm?: (data: RemoveData) => void;
}

export interface RemoveData {
  reason: string;
  newStatus: "IN_STOCK" | "REMOVED" | "SCRAPPED";
  removeDate: string;
  technician: string;
  notes: string;
}

export function RemoveComponentDialog({
  open,
  onOpenChange,
  component,
  onConfirm,
}: RemoveComponentDialogProps) {
  const [reason, setReason] = useState("");
  const [newStatus, setNewStatus] = useState<"IN_STOCK" | "REMOVED" | "SCRAPPED">("IN_STOCK");
  const [removeDate, setRemoveDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [technician, setTechnician] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedReason = REMOVAL_REASONS.find((r) => r.value === reason);

  // Calculate remaining flight hours
  const remainingHours = component?.flightHoursLimit && component?.currentFlightHours
    ? component.flightHoursLimit - component.currentFlightHours
    : null;

  const isNearEndOfLife = remainingHours !== null && remainingHours < 50;
  const isEndOfLife = remainingHours !== null && remainingHours <= 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason || !removeDate || !technician) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const removeData: RemoveData = {
      reason,
      newStatus,
      removeDate,
      technician,
      notes,
    };

    onConfirm?.(removeData);

    // Reset form
    setReason("");
    setNewStatus("IN_STOCK");
    setRemoveDate(new Date().toISOString().split("T")[0]);
    setTechnician("");
    setNotes("");
    setIsSubmitting(false);
    onOpenChange(false);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100">
              <WrenchOff className="h-4 w-4 text-orange-600" />
            </div>
            <DialogTitle>零部件拆下</DialogTitle>
          </div>
          <DialogDescription>
            {component
              ? `将零部件 ${component.serialNumber} 从飞机上拆下`
              : "选择要拆下的零部件"}
          </DialogDescription>
        </DialogHeader>

        {component && (
          <>
            {/* Component Info */}
            <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
                <ArrowRightFromLeft className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-900">{component.name}</p>
                <p className="text-sm text-slate-500">SN: {component.serialNumber}</p>
              </div>
            </div>

            {/* Current Installation Info */}
            {component.currentAircraft && (
              <div className="rounded-lg bg-amber-50 p-3">
                <p className="mb-2 text-xs font-semibold text-amber-800">当前装机信息</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">飞机:</span>
                  <div className="flex items-center gap-2">
                    <span>{component.currentAircraft.registration}</span>
                    <AircraftStatusBadge status={component.currentAircraft.status as any} />
                  </div>
                </div>
                {component.currentPosition && (
                  <div className="mt-1 flex items-center justify-between text-sm">
                    <span className="text-slate-700">位置:</span>
                    <span>{component.currentPosition}</span>
                  </div>
                )}
                {component.currentFlightHours !== undefined && component.flightHoursLimit && (
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-slate-700">使用时长:</span>
                    <div className="flex items-center gap-2">
                      <span>
                        {component.currentFlightHours} / {component.flightHoursLimit} 小时
                      </span>
                      {isEndOfLife && (
                        <Badge variant="destructive" className="text-xs">
                          已到期
                        </Badge>
                      )}
                      {isNearEndOfLife && !isEndOfLife && (
                        <Badge variant="outline" className="border-amber-500 text-amber-700 text-xs">
                          接近寿命
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* End of Life Warning */}
            {isEndOfLife && (
              <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-red-800">
                <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">寿命已到期</p>
                  <p>该零部件已达到飞行小时限制，建议设置为"已报废"状态。</p>
                </div>
              </div>
            )}
          </>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Removal Reason */}
            <div className="grid gap-2">
              <Label htmlFor="reason" className="required">
                拆下原因 *
              </Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger id="reason">
                  <SelectValue placeholder="选择拆下原因" />
                </SelectTrigger>
                <SelectContent>
                  {REMOVAL_REASONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      <div>
                        <p className="font-medium">{r.label}</p>
                        <p className="text-xs text-slate-500">{r.description}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedReason && (
                <p className="text-xs text-slate-500">{selectedReason.description}</p>
              )}
            </div>

            {/* New Status */}
            <div className="grid gap-2">
              <Label htmlFor="newStatus" className="required">
                拆下后状态 *
              </Label>
              <Select
                value={newStatus}
                onValueChange={(value: any) => setNewStatus(value)}
              >
                <SelectTrigger id="newStatus">
                  <SelectValue placeholder="选择拆下后状态" />
                </SelectTrigger>
                <SelectContent>
                  {NEW_STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${status.color}`} />
                        <span>{status.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">
                {NEW_STATUS_OPTIONS.find((s) => s.value === newStatus)?.description}
              </p>
            </div>

            {/* Remove Date */}
            <div className="grid gap-2">
              <Label htmlFor="removeDate" className="flex items-center gap-1 required">
                <Calendar className="h-4 w-4 text-slate-400" />
                拆下日期 *
              </Label>
              <Input
                id="removeDate"
                type="date"
                value={removeDate}
                onChange={(e) => setRemoveDate(e.target.value)}
              />
            </div>

            {/* Technician */}
            <div className="grid gap-2">
              <Label htmlFor="technician" className="flex items-center gap-1 required">
                <User className="h-4 w-4 text-slate-400" />
                技术员 *
              </Label>
              <Input
                id="technician"
                placeholder="输入技术员姓名"
                value={technician}
                onChange={(e) => setTechnician(e.target.value)}
              />
            </div>

            {/* Notes */}
            <div className="grid gap-2">
              <Label htmlFor="notes" className="flex items-center gap-1">
                <FileText className="h-4 w-4 text-slate-400" />
                备注
              </Label>
              <textarea
                id="notes"
                className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-vertical"
                placeholder="输入备注信息（可选）"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Warning for scrapping */}
            {newStatus === "SCRAPPED" && (
              <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-red-800">
                <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">警告</p>
                  <p>设置为"已报废"后，该零部件将不能再次装机。此操作不可撤销。</p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              <X className="mr-2 h-4 w-4" />
              取消
            </Button>
            <Button
              type="submit"
              variant={newStatus === "SCRAPPED" ? "destructive" : "default"}
              disabled={!reason || !removeDate || !technician || isSubmitting}
            >
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? "处理中..." : newStatus === "SCRAPPED" ? "确认报废" : "确认拆下"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Hook to manage remove dialog state
 */
export function useRemoveDialog() {
  const [open, setOpen] = useState(false);
  const [component, setComponent] = useState<
    RemoveComponentDialogProps["component"]
  >(undefined);

  const openDialog = (comp?: RemoveComponentDialogProps["component"]) => {
    setComponent(comp);
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
    setComponent(undefined);
  };

  return {
    open,
    component,
    openDialog,
    closeDialog,
    setOpen,
  };
}
