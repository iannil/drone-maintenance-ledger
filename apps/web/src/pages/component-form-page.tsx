import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  ArrowLeft,
  Save,
  Package,
  Calendar,
  Hash,
  Wrench,
  MapPin,
  FileText,
  Clock,
  Loader2,
} from "lucide-react";

import { componentService, Component } from "../services/component.service";
import { fullAircraftService, Aircraft } from "../services/fleet.service";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { ComponentStatusBadge } from "../components/common/status-badge";
import { AircraftStatusBadge } from "../components/common/status-badge";

// Component types
const COMPONENT_TYPES = [
  { value: "MOTOR", label: "电机" },
  { value: "PROPELLER", label: "螺旋桨" },
  { value: "BATTERY", label: "电池" },
  { value: "ESC", label: "电调" },
  { value: "FLIGHT_CONTROLLER", label: "飞控" },
  { value: "GPS", label: "GPS模块" },
  { value: "CAMERA", label: "相机" },
  { value: "GIMBAL", label: "云台" },
  { value: "LANDING_GEAR", label: "起落架" },
  { value: "OTHER", label: "其他" },
];

// Install position options
const INSTALL_POSITIONS = [
  "左前",
  "右前",
  "左后",
  "右后",
  "顶部",
  "底部",
  "前部",
  "后部",
  "左侧",
  "右侧",
  "内部",
  "外部",
];

// Map backend status to form status
const mapBackendStatusToFormStatus = (status: string): "IN_STOCK" | "INSTALLED" | "REMOVED" | "SCRAPPED" => {
  switch (status) {
    case "NEW":
      return "IN_STOCK";
    case "IN_USE":
      return "INSTALLED";
    case "REPAIR":
      return "REMOVED";
    case "SCRAPPED":
    case "LOST":
      return "SCRAPPED";
    default:
      return "IN_STOCK";
  }
};

// Map form status to backend status
const mapFormStatusToBackendStatus = (status: string): string => {
  switch (status) {
    case "IN_STOCK":
      return "NEW";
    case "INSTALLED":
      return "IN_USE";
    case "REMOVED":
      return "REPAIR";
    case "SCRAPPED":
      return "SCRAPPED";
    default:
      return "NEW";
  }
};

// Map backend aircraft status to display status
const mapAircraftStatus = (status: string): "RETIRED" | "SERVICEABLE" | "MAINTENANCE" | "GROUNDED" => {
  switch (status) {
    case "AVAILABLE":
      return "SERVICEABLE";
    case "IN_MAINTENANCE":
      return "MAINTENANCE";
    case "AOG":
      return "GROUNDED";
    case "RETIRED":
      return "RETIRED";
    default:
      return "SERVICEABLE";
  }
};

type ComponentFormData = {
  serialNumber: string;
  name: string;
  type: string;
  manufacturer: string;
  model: string;
  status: "IN_STOCK" | "INSTALLED" | "REMOVED" | "SCRAPPED";
  currentAircraftId: string;
  installPosition: string;
  installDate: string;
  productionDate: string;
  purchaseDate: string;
  warrantyExpiry: string;
  flightHoursLimit: number;
  currentFlightHours: number;
  cycleLimit: number;
  currentCycles: number;
  remarks: string;
};

export function ComponentFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = id !== undefined && id !== "new";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [aircraftList, setAircraftList] = useState<Aircraft[]>([]);
  const [componentData, setComponentData] = useState<Component | null>(null);

  // Initialize form with default values
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<ComponentFormData>({
    defaultValues: {
      serialNumber: "",
      name: "",
      type: "OTHER",
      manufacturer: "DJI",
      model: "",
      status: "IN_STOCK",
      currentAircraftId: "",
      installPosition: "",
      installDate: "",
      productionDate: "",
      purchaseDate: "",
      warrantyExpiry: "",
      flightHoursLimit: 0,
      currentFlightHours: 0,
      cycleLimit: 0,
      currentCycles: 0,
      remarks: "",
    },
  });

  // Load aircraft list and component data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Load aircraft list
        const aircraft = await fullAircraftService.list();
        setAircraftList(aircraft);

        // Load component data if editing
        if (isEditing && id) {
          const component = await componentService.getById(id);
          setComponentData(component);

          // Format dates from timestamps
          const formatDate = (timestamp: number | null): string => {
            if (!timestamp) return "";
            return new Date(timestamp).toISOString().split("T")[0];
          };

          // Reset form with component data
          reset({
            serialNumber: component.serialNumber,
            name: component.description || component.partNumber,
            type: component.type,
            manufacturer: component.manufacturer,
            model: component.model || "",
            status: mapBackendStatusToFormStatus(component.status),
            currentAircraftId: "",
            installPosition: "",
            installDate: "",
            productionDate: formatDate(component.manufacturedAt),
            purchaseDate: formatDate(component.purchasedAt),
            warrantyExpiry: "",
            flightHoursLimit: component.maxFlightHours || 0,
            currentFlightHours: component.totalFlightHours,
            cycleLimit: component.maxCycles || 0,
            currentCycles: component.totalFlightCycles,
            remarks: "",
          });
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, isEditing, reset]);

  const selectedStatus = watch("status");
  const selectedType = watch("type");
  const selectedAircraft = watch("currentAircraftId");

  const onSubmit = async (data: ComponentFormData) => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Form submitted:", data);
    setIsSubmitting(false);

    // Navigate back to list or detail page
    if (isEditing) {
      navigate(`/components/${id}`);
    } else {
      navigate("/components");
    }
  };

  const handleCancel = () => {
    if (isEditing) {
      navigate(`/components/${id}`);
    } else {
      navigate("/components");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-sm text-slate-500">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/components")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
              <Package className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {isEditing ? "编辑零部件" : "新增零部件"}
              </h1>
              <p className="text-sm text-slate-500">
                {isEditing ? "修改零部件信息和履历" : "录入新的零部件到系统"}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5 text-slate-500" />
                  基本信息
                </CardTitle>
                <CardDescription>
                  零部件的识别信息和基本属性
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Serial Number */}
                <div className="grid gap-2">
                  <Label htmlFor="serialNumber" className="required">
                    序列号 (SN) *
                  </Label>
                  <Input
                    id="serialNumber"
                    placeholder="例如: SN-M001"
                    {...register("serialNumber", {
                      required: "序列号不能为空",
                    })}
                  />
                  {errors.serialNumber && (
                    <p className="text-sm text-red-500">
                      {errors.serialNumber.message}
                    </p>
                  )}
                </div>

                {/* Component Name */}
                <div className="grid gap-2">
                  <Label htmlFor="name" className="required">
                    零部件名称 *
                  </Label>
                  <Input
                    id="name"
                    placeholder="例如: DJI 350 RTK 电机"
                    {...register("name", {
                      required: "零部件名称不能为空",
                    })}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Component Type */}
                <div className="grid gap-2">
                  <Label htmlFor="type" className="required">
                    零部件类型 *
                  </Label>
                  <Select
                    value={selectedType}
                    onValueChange={(value) => setValue("type", value)}
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="选择零部件类型" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPONENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Manufacturer */}
                <div className="grid gap-2">
                  <Label htmlFor="manufacturer">制造商</Label>
                  <Input
                    id="manufacturer"
                    placeholder="例如: DJI"
                    {...register("manufacturer")}
                  />
                </div>

                {/* Model */}
                <div className="grid gap-2">
                  <Label htmlFor="model">型号</Label>
                  <Input
                    id="model"
                    placeholder="例如: 350 RTK Motor"
                    {...register("model")}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Status & Installation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-slate-500" />
                  状态与装机
                </CardTitle>
                <CardDescription>
                  零部件当前状态和装机信息
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status */}
                <div className="grid gap-2">
                  <Label htmlFor="status">状态</Label>
                  <Select
                    value={selectedStatus}
                    onValueChange={(value: any) => setValue("status", value)}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="选择状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IN_STOCK">
                        <div className="flex items-center gap-2">
                          <ComponentStatusBadge status="IN_STOCK" />
                          <span className="text-sm">在库</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="INSTALLED">
                        <div className="flex items-center gap-2">
                          <ComponentStatusBadge status="INSTALLED" />
                          <span className="text-sm">已装机</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="REMOVED">
                        <div className="flex items-center gap-2">
                          <ComponentStatusBadge status="REMOVED" />
                          <span className="text-sm">已拆下</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="SCRAPPED">
                        <div className="flex items-center gap-2">
                          <ComponentStatusBadge status="SCRAPPED" />
                          <span className="text-sm">已报废</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Installation Information - shown when INSTALLED */}
                {selectedStatus === "INSTALLED" && (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="currentAircraftId">装机飞机</Label>
                      <Select
                        value={selectedAircraft}
                        onValueChange={(value) => setValue("currentAircraftId", value)}
                      >
                        <SelectTrigger id="currentAircraftId">
                          <SelectValue placeholder="选择装机飞机" />
                        </SelectTrigger>
                        <SelectContent>
                          {aircraftList.map((aircraft) => (
                            <SelectItem key={aircraft.id} value={aircraft.id}>
                              <div className="flex items-center gap-2">
                                <span>{aircraft.registrationNumber}</span>
                                <AircraftStatusBadge status={mapAircraftStatus(aircraft.status)} />
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="installPosition" className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        装机位置
                      </Label>
                      <Select
                        value={watch("installPosition")}
                        onValueChange={(value) => setValue("installPosition", value)}
                      >
                        <SelectTrigger id="installPosition">
                          <SelectValue placeholder="选择装机位置" />
                        </SelectTrigger>
                        <SelectContent>
                          {INSTALL_POSITIONS.map((pos) => (
                            <SelectItem key={pos} value={pos}>
                              {pos}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="installDate">装机日期</Label>
                      <Input
                        id="installDate"
                        type="date"
                        {...register("installDate")}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Usage Limits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-slate-500" />
                  使用限制与寿命
                </CardTitle>
                <CardDescription>
                  零部件的使用寿命限制和当前使用情况
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Flight Hours */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="flightHoursLimit">飞行小时限制</Label>
                    <Input
                      id="flightHoursLimit"
                      type="number"
                      min="0"
                      step="0.1"
                      {...register("flightHoursLimit", { valueAsNumber: true })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="currentFlightHours">当前飞行小时</Label>
                    <Input
                      id="currentFlightHours"
                      type="number"
                      min="0"
                      step="0.1"
                      {...register("currentFlightHours", { valueAsNumber: true })}
                    />
                  </div>
                </div>

                {/* Cycles */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="cycleLimit">循环次数限制</Label>
                    <Input
                      id="cycleLimit"
                      type="number"
                      min="0"
                      {...register("cycleLimit", { valueAsNumber: true })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="currentCycles">当前循环次数</Label>
                    <Input
                      id="currentCycles"
                      type="number"
                      min="0"
                      {...register("currentCycles", { valueAsNumber: true })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Date Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-slate-500" />
                  日期信息
                </CardTitle>
                <CardDescription>
                  生产、采购和质保日期
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="productionDate">生产日期</Label>
                  <Input
                    id="productionDate"
                    type="date"
                    {...register("productionDate")}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="purchaseDate">采购日期</Label>
                  <Input
                    id="purchaseDate"
                    type="date"
                    {...register("purchaseDate")}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="warrantyExpiry">质保到期日</Label>
                  <Input
                    id="warrantyExpiry"
                    type="date"
                    {...register("warrantyExpiry")}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Remarks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-slate-500" />
                  备注
                </CardTitle>
                <CardDescription>
                  其他需要记录的信息
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  <Label htmlFor="remarks">备注说明</Label>
                  <textarea
                    id="remarks"
                    className="flex min-h-[100px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-vertical"
                    placeholder="输入备注信息..."
                    {...register("remarks")}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={!isDirty || isSubmitting}
              >
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting ? "保存中..." : "保存"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
