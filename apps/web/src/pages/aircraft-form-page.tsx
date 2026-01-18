import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  ArrowLeft,
  Save,
  Plane,
  Calendar,
  Hash,
  Building2,
  MapPin,
  FileText,
  Loader2,
} from "lucide-react";

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
import { AircraftStatusBadge } from "../components/common/status-badge";
import {
  fullAircraftService,
  fleetService,
  Aircraft,
  AircraftStatus,
  Fleet,
} from "../services/fleet.service";

/**
 * Map backend status to frontend status badge
 */
const STATUS_MAP: Record<AircraftStatus, "SERVICEABLE" | "MAINTENANCE" | "GROUNDED" | "RETIRED"> = {
  AVAILABLE: "SERVICEABLE",
  IN_MAINTENANCE: "MAINTENANCE",
  AOG: "GROUNDED",
  RETIRED: "RETIRED",
};

/**
 * Map frontend status to backend status
 */
const REVERSE_STATUS_MAP: Record<"SERVICEABLE" | "MAINTENANCE" | "GROUNDED" | "RETIRED", AircraftStatus> = {
  SERVICEABLE: "AVAILABLE",
  MAINTENANCE: "IN_MAINTENANCE",
  GROUNDED: "AOG",
  RETIRED: "RETIRED",
};

type AircraftFormData = {
  registration: string;
  serialNumber: string;
  model: string;
  manufacturer: string;
  fleetId: string;
  status: "SERVICEABLE" | "MAINTENANCE" | "GROUNDED" | "RETIRED";
  baseLocation: string;
  productionDate: string;
  purchaseDate: string;
  remarks: string;
};

export function AircraftFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = id !== undefined && id !== "new";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fleets, setFleets] = useState<Fleet[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Initialize form with default values
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<AircraftFormData>({
    defaultValues: {
      registration: "",
      serialNumber: "",
      model: "",
      manufacturer: "DJI",
      fleetId: "",
      status: "SERVICEABLE",
      baseLocation: "",
      productionDate: "",
      purchaseDate: "",
      remarks: "",
    },
  });

  // Load fleets and aircraft data on mount
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setLoadError(null);

      try {
        // Load fleets for the dropdown
        const fleetsData = await fleetService.list();
        setFleets(fleetsData);

        // If editing, load the aircraft data
        if (isEditing && id) {
          const aircraft = await fullAircraftService.getById(id);
          reset({
            registration: aircraft.registrationNumber,
            serialNumber: aircraft.serialNumber,
            model: aircraft.model,
            manufacturer: aircraft.manufacturer,
            fleetId: aircraft.fleetId,
            status: STATUS_MAP[aircraft.status],
            baseLocation: "", // Not available in backend, user can fill
            productionDate: "", // Not available in backend, user can fill
            purchaseDate: "", // Not available in backend, user can fill
            remarks: "", // Not available in backend, user can fill
          });
        }
      } catch (err) {
        console.error("Failed to load data:", err);
        setLoadError(isEditing ? "无法加载飞机信息" : "无法加载机队列表");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [id, isEditing, reset]);

  const selectedStatus = watch("status");
  const selectedFleet = watch("fleetId");

  const onSubmit = async (data: AircraftFormData) => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Form submitted:", data);
    setIsSubmitting(false);

    // Navigate back to list or detail page
    if (isEditing) {
      navigate(`/aircraft/${id}`);
    } else {
      navigate("/aircraft");
    }
  };

  const handleCancel = () => {
    if (isEditing) {
      navigate(`/aircraft/${id}`);
    } else {
      navigate("/aircraft");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            <span className="ml-3 text-slate-500">加载中...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (loadError) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/aircraft")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-slate-900">
              {isEditing ? "编辑飞机" : "新增飞机"}
            </h1>
          </div>
          <Card>
            <CardContent className="py-12 text-center">
              <Plane className="mx-auto mb-4 h-12 w-12 text-slate-300" />
              <h3 className="mb-2 text-lg font-semibold">{loadError}</h3>
              <p className="mb-4 text-slate-500">请稍后重试或返回列表页面</p>
              <Button onClick={() => navigate("/aircraft")}>
                返回列表
              </Button>
            </CardContent>
          </Card>
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
            onClick={() => navigate("/aircraft")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Plane className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {isEditing ? "编辑飞机" : "新增飞机"}
              </h1>
              <p className="text-sm text-slate-500">
                {isEditing ? "修改飞机信息和状态" : "录入新的飞机到系统"}
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
                  飞机的识别信息和基本属性
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Registration Number */}
                <div className="grid gap-2">
                  <Label htmlFor="registration" className="required">
                    注册号 / 机身编号 *
                  </Label>
                  <Input
                    id="registration"
                    placeholder="例如: B-7011U"
                    {...register("registration", {
                      required: "注册号不能为空",
                      pattern: {
                        value: /^[A-Z0-9-]+$/,
                        message: "只能包含大写字母、数字和连字符",
                      },
                    })}
                  />
                  {errors.registration && (
                    <p className="text-sm text-red-500">
                      {errors.registration.message}
                    </p>
                  )}
                </div>

                {/* Serial Number */}
                <div className="grid gap-2">
                  <Label htmlFor="serialNumber" className="required">
                    序列号 (SN) *
                  </Label>
                  <Input
                    id="serialNumber"
                    placeholder="例如: SN-DJ001"
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

                {/* Model */}
                <div className="grid gap-2">
                  <Label htmlFor="model" className="required">
                    机型 *
                  </Label>
                  <Input
                    id="model"
                    placeholder="例如: DJI Matrice 350 RTK"
                    {...register("model", {
                      required: "机型不能为空",
                    })}
                  />
                  {errors.model && (
                    <p className="text-sm text-red-500">
                      {errors.model.message}
                    </p>
                  )}
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
              </CardContent>
            </Card>

            {/* Organization & Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-slate-500" />
                  组织与状态
                </CardTitle>
                <CardDescription>
                  飞机所属机队和当前状态
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Fleet */}
                <div className="grid gap-2">
                  <Label htmlFor="fleetId">所属机队</Label>
                  <Select
                    value={selectedFleet}
                    onValueChange={(value) => setValue("fleetId", value)}
                  >
                    <SelectTrigger id="fleetId">
                      <SelectValue placeholder="选择所属机队" />
                    </SelectTrigger>
                    <SelectContent>
                      {fleets.length > 0 ? (
                        fleets.map((fleet) => (
                          <SelectItem key={fleet.id} value={fleet.id}>
                            {fleet.name} ({fleet.code})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>
                          暂无可选机队
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

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
                      <SelectItem value="SERVICEABLE">
                        <div className="flex items-center gap-2">
                          <AircraftStatusBadge status="SERVICEABLE" />
                          <span className="text-sm">可用</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="MAINTENANCE">
                        <div className="flex items-center gap-2">
                          <AircraftStatusBadge status="MAINTENANCE" />
                          <span className="text-sm">维护中</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="GROUNDED">
                        <div className="flex items-center gap-2">
                          <AircraftStatusBadge status="GROUNDED" />
                          <span className="text-sm">停飞</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="RETIRED">
                        <div className="flex items-center gap-2">
                          <AircraftStatusBadge status="RETIRED" />
                          <span className="text-sm">退役</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Base Location */}
                <div className="grid gap-2">
                  <Label htmlFor="baseLocation" className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    基地位置
                  </Label>
                  <Input
                    id="baseLocation"
                    placeholder="例如: 上海基地"
                    {...register("baseLocation")}
                  />
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
                  生产日期和采购日期
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Production Date */}
                <div className="grid gap-2">
                  <Label htmlFor="productionDate">生产日期</Label>
                  <Input
                    id="productionDate"
                    type="date"
                    {...register("productionDate")}
                  />
                </div>

                {/* Purchase Date */}
                <div className="grid gap-2">
                  <Label htmlFor="purchaseDate">采购日期</Label                  >
                  <Input
                    id="purchaseDate"
                    type="date"
                    {...register("purchaseDate")}
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
