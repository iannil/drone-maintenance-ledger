import { useState } from "react";
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

// Mock fleets data
const MOCK_FLEETS = [
  { id: "fleet-001", name: "巡检机队A", code: "INSP-A" },
  { id: "fleet-002", name: "物流机队B", code: "LOGI-B" },
  { id: "fleet-003", name: "应急机队C", code: "EMER-C" },
];

// Mock aircraft data for editing
const MOCK_AIRCRAFT: Record<string, AircraftFormData> = {
  "edit-001": {
    registration: "B-7011U",
    serialNumber: "SN-DJ001",
    model: "DJI Matrice 350 RTK",
    manufacturer: "DJI",
    fleetId: "fleet-001",
    status: "SERVICEABLE",
    baseLocation: "上海基地",
    productionDate: "2023-06-15",
    purchaseDate: "2023-07-20",
    remarks: "主力巡检无人机，设备状态良好",
  },
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

  // Initialize form with mock data if editing
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<AircraftFormData>({
    defaultValues: isEditing && id ? MOCK_AIRCRAFT[id] : {
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
                      {MOCK_FLEETS.map((fleet) => (
                        <SelectItem key={fleet.id} value={fleet.id}>
                          {fleet.name} ({fleet.code})
                        </SelectItem>
                      ))}
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
