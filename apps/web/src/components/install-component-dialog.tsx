import { useState } from "react";
import {
  Plus,
  Wrench,
  Save,
  X,
  MapPin,
  User,
  Calendar,
  FileText,
  AlertCircle,
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
import { AircraftStatusBadge } from "./common/status-badge";

// Mock aircraft data
const MOCK_AIRCRAFT = [
  { id: "ac-001", registration: "B-7011U", status: "SERVICEABLE", model: "DJI Matrice 350 RTK" },
  { id: "ac-002", registration: "B-7012U", status: "SERVICEABLE", model: "DJI Matrice 350 RTK" },
  { id: "ac-003", registration: "B-7013U", status: "MAINTENANCE", model: "DJI Matrice 300 RTK" },
  { id: "ac-004", registration: "B-7014U", status: "GROUNDED", model: "DJI Matrice 350 RTK" },
];

// Install position options based on component type
const POSITION_OPTIONS_BY_TYPE: Record<string, string[]> = {
  MOTOR: ["左前", "右前", "左后", "右后"],
  PROPELLER: ["左前", "右前", "左后", "右后"],
  BATTERY: ["电池槽1", "电池槽2", "电池槽3", "电池槽4"],
  FLIGHT_CONTROLLER: ["内部"],
  GPS: ["顶部", "内部"],
  CAMERA: ["底部", "前部"],
  GIMBAL: ["底部"],
  ANTENNA: ["顶部", "底部"],
  FRAME: ["主体"],
  LANDING_GEAR: ["前部", "后部"],
  OTHER: ["内部", "外部", "顶部", "底部", "前部", "后部", "左侧", "右侧"],
};

interface InstallComponentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  component?: {
    id: string;
    serialNumber: string;
    name: string;
    type: string;
  };
  onConfirm?: (data: InstallData) => void;
}

export interface InstallData {
  aircraftId: string;
  position: string;
  installDate: string;
  technician: string;
  reason: string;
}

export function InstallComponentDialog({
  open,
  onOpenChange,
  component,
  onConfirm,
}: InstallComponentDialogProps) {
  const [aircraftId, setAircraftId] = useState("");
  const [position, setPosition] = useState("");
  const [installDate, setInstallDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [technician, setTechnician] = useState("");
  const [reason, setReason] = useState("新件装机");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const positionOptions = component
    ? POSITION_OPTIONS_BY_TYPE[component.type] || POSITION_OPTIONS_BY_TYPE.OTHER
    : POSITION_OPTIONS_BY_TYPE.OTHER;

  const selectedAircraft = MOCK_AIRCRAFT.find((a) => a.id === aircraftId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!aircraftId || !position || !installDate || !technician) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const installData: InstallData = {
      aircraftId,
      position,
      installDate,
      technician,
      reason,
    };

    onConfirm?.(installData);

    // Reset form
    setAircraftId("");
    setPosition("");
    setInstallDate(new Date().toISOString().split("T")[0]);
    setTechnician("");
    setReason("新件装机");
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
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
              <Wrench className="h-4 w-4 text-green-600" />
            </div>
            <DialogTitle>零部件装机</DialogTitle>
          </div>
          <DialogDescription>
            {component
              ? `将零部件 ${component.serialNumber} (${component.name}) 装机到飞机`
              : "选择要装机的零部件和目标飞机"}
          </DialogDescription>
        </DialogHeader>

        {component && (
          <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
              <span className="text-lg font-semibold text-indigo-600">
                {component.name.charAt(0)}
              </span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-slate-900">{component.name}</p>
              <p className="text-sm text-slate-500">SN: {component.serialNumber}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Aircraft Selection */}
            <div className="grid gap-2">
              <Label htmlFor="aircraft" className="required">
                装机飞机 *
              </Label>
              <Select value={aircraftId} onValueChange={setAircraftId}>
                <SelectTrigger id="aircraft">
                  <SelectValue placeholder="选择目标飞机" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_AIRCRAFT.map((aircraft) => (
                    <SelectItem key={aircraft.id} value={aircraft.id}>
                      <div className="flex items-center gap-2">
                        <span>{aircraft.registration}</span>
                        <span className="text-xs text-slate-500">
                          {aircraft.model}
                        </span>
                        <AircraftStatusBadge status={aircraft.status as "RETIRED" | "SERVICEABLE" | "MAINTENANCE" | "GROUNDED"} />
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Position Selection */}
            <div className="grid gap-2">
              <Label htmlFor="position" className="flex items-center gap-1 required">
                <MapPin className="h-4 w-4 text-slate-400" />
                装机位置 *
              </Label>
              <Select value={position} onValueChange={setPosition}>
                <SelectTrigger id="position">
                  <SelectValue placeholder="选择装机位置" />
                </SelectTrigger>
                <SelectContent>
                  {positionOptions.map((pos) => (
                    <SelectItem key={pos} value={pos}>
                      {pos}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Install Date */}
            <div className="grid gap-2">
              <Label htmlFor="installDate" className="flex items-center gap-1 required">
                <Calendar className="h-4 w-4 text-slate-400" />
                装机日期 *
              </Label>
              <Input
                id="installDate"
                type="date"
                value={installDate}
                onChange={(e) => setInstallDate(e.target.value)}
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

            {/* Reason */}
            <div className="grid gap-2">
              <Label htmlFor="reason" className="flex items-center gap-1">
                <FileText className="h-4 w-4 text-slate-400" />
                原因
              </Label>
              <Input
                id="reason"
                placeholder="输入装机原因"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            {/* Warning if aircraft is grounded */}
            {selectedAircraft?.status === "GROUNDED" && (
              <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-amber-800">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">注意</p>
                  <p>
                    所选飞机当前处于停飞状态。装机操作不会自动改变飞机状态。
                  </p>
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
              disabled={!aircraftId || !position || !installDate || !technician || isSubmitting}
            >
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? "处理中..." : "确认装机"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Hook to manage install dialog state
 */
export function useInstallDialog() {
  const [open, setOpen] = useState(false);
  const [component, setComponent] = useState<
    InstallComponentDialogProps["component"]
  >(undefined);

  const openDialog = (comp?: InstallComponentDialogProps["component"]) => {
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
