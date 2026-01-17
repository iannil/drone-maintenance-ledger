import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  UseGuards,
  Put,
  Delete,
  Query,
  ParseIntPipe,
  Inject,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiProperty,
  ApiPropertyOptional,
} from "@nestjs/swagger";

import {
  ComponentService,
  CreateComponentDto,
  UpdateComponentDto,
  InstallComponentDto,
  RemoveComponentDto,
} from "./component.service";
import { Roles } from "../../common/decorators/roles.decorator";
import { RolesGuard } from "../../common/guards/roles.guard";

// Swagger DTO classes
class CreateComponentSwaggerDto {
  @ApiProperty({ description: "序列号", example: "SN-MOTOR-001" })
  serialNumber!: string;

  @ApiProperty({ description: "部件号", example: "PN-MOT-001" })
  partNumber!: string;

  @ApiProperty({
    description: "部件类型",
    enum: ["MOTOR", "ESC", "PROPELLER", "BATTERY", "CAMERA", "GIMBAL", "GPS", "FRAME", "CONTROLLER", "OTHER"],
    example: "MOTOR",
  })
  type!: string;

  @ApiProperty({ description: "制造商", example: "T-Motor" })
  manufacturer!: string;

  @ApiPropertyOptional({ description: "型号", example: "U13 KV100" })
  model?: string;

  @ApiPropertyOptional({ description: "描述" })
  description?: string;

  @ApiPropertyOptional({ description: "是否为寿命件", default: false })
  isLifeLimited?: boolean;

  @ApiPropertyOptional({ description: "最大飞行小时数" })
  maxFlightHours?: number;

  @ApiPropertyOptional({ description: "最大循环次数" })
  maxCycles?: number;

  @ApiPropertyOptional({ description: "生产日期（时间戳）" })
  manufacturedAt?: number;

  @ApiPropertyOptional({ description: "采购日期（时间戳）" })
  purchasedAt?: number;
}

class UpdateComponentSwaggerDto {
  @ApiPropertyOptional({ description: "部件号" })
  partNumber?: string;

  @ApiPropertyOptional({
    description: "部件类型",
    enum: ["MOTOR", "ESC", "PROPELLER", "BATTERY", "CAMERA", "GIMBAL", "GPS", "FRAME", "CONTROLLER", "OTHER"],
  })
  type?: string;

  @ApiPropertyOptional({ description: "制造商" })
  manufacturer?: string;

  @ApiPropertyOptional({ description: "型号" })
  model?: string;

  @ApiPropertyOptional({ description: "描述" })
  description?: string;

  @ApiPropertyOptional({ description: "是否为寿命件" })
  isLifeLimited?: boolean;

  @ApiPropertyOptional({ description: "最大飞行小时数" })
  maxFlightHours?: number;

  @ApiPropertyOptional({ description: "最大循环次数" })
  maxCycles?: number;

  @ApiPropertyOptional({
    description: "状态",
    enum: ["NEW", "IN_USE", "REMOVED", "SCRAPPED", "OVERHAULED"],
  })
  status?: string;

  @ApiPropertyOptional({ description: "是否适航" })
  isAirworthy?: boolean;
}

class InstallComponentSwaggerDto {
  @ApiProperty({ description: "部件 ID" })
  componentId!: string;

  @ApiProperty({ description: "飞行器 ID" })
  aircraftId!: string;

  @ApiProperty({ description: "安装位置", example: "前左电机" })
  location!: string;

  @ApiPropertyOptional({ description: "安装备注" })
  installNotes?: string;
}

class RemoveComponentSwaggerDto {
  @ApiProperty({ description: "部件 ID" })
  componentId!: string;

  @ApiPropertyOptional({ description: "拆卸备注" })
  removeNotes?: string;
}

class ComponentResponseDto {
  @ApiProperty({ description: "部件 ID" })
  id!: string;

  @ApiProperty({ description: "序列号" })
  serialNumber!: string;

  @ApiProperty({ description: "部件号" })
  partNumber!: string;

  @ApiProperty({ description: "部件类型" })
  type!: string;

  @ApiProperty({ description: "制造商" })
  manufacturer!: string;

  @ApiPropertyOptional({ description: "型号" })
  model?: string | null;

  @ApiProperty({ description: "状态" })
  status!: string;

  @ApiProperty({ description: "是否适航" })
  isAirworthy!: boolean;

  @ApiProperty({ description: "是否为寿命件" })
  isLifeLimited!: boolean;

  @ApiProperty({ description: "总飞行小时数" })
  totalFlightHours!: number;

  @ApiProperty({ description: "总循环次数" })
  totalFlightCycles!: number;
}

class InstallResultDto {
  @ApiProperty({ description: "部件 ID" })
  componentId!: string;

  @ApiProperty({ description: "飞行器 ID" })
  aircraftId!: string;

  @ApiProperty({ description: "安装位置" })
  location!: string;

  @ApiProperty({ description: "结果消息" })
  message!: string;
}

class RemoveResultDto {
  @ApiProperty({ description: "部件 ID" })
  componentId!: string;

  @ApiProperty({ description: "结果消息" })
  message!: string;

  @ApiPropertyOptional({ description: "之前安装的飞行器 ID" })
  previousAircraftId?: string | null;
}

/**
 * Component controller
 *
 * Handles component CRUD and installation operations
 */
@ApiTags("部件 (Component)")
@ApiBearerAuth()
@Controller("components")
@UseGuards(AuthGuard("jwt"), RolesGuard)
export class ComponentController {
  private componentService: ComponentService;

  constructor(@Inject(ComponentService) componentService: ComponentService) {
    this.componentService = componentService;
  }

  /**
   * Get component by ID
   */
  @Get(":id")
  @ApiOperation({ summary: "获取部件详情", description: "根据 ID 获取部件详细信息" })
  @ApiParam({ name: "id", description: "部件 ID" })
  @ApiResponse({ status: 200, description: "获取成功", type: ComponentResponseDto })
  @ApiResponse({ status: 404, description: "部件不存在" })
  async getById(@Param("id") id: string) {
    return this.componentService.findById(id);
  }

  /**
   * Get component by serial number
   */
  @Get("serial/:serialNumber")
  @ApiOperation({ summary: "按序列号查询部件", description: "根据序列号获取部件详细信息（包含安装历史）" })
  @ApiParam({ name: "serialNumber", description: "部件序列号" })
  @ApiResponse({ status: 200, description: "获取成功", type: ComponentResponseDto })
  @ApiResponse({ status: 404, description: "部件不存在" })
  async getBySerial(@Param("serialNumber") serialNumber: string) {
    return this.componentService.findBySerialNumber(serialNumber);
  }

  /**
   * List all components
   */
  @Get()
  @ApiOperation({ summary: "获取部件列表", description: "获取所有部件，支持分页和按飞行器筛选" })
  @ApiQuery({ name: "limit", required: false, description: "每页数量", example: 50 })
  @ApiQuery({ name: "offset", required: false, description: "偏移量", example: 0 })
  @ApiQuery({ name: "aircraftId", required: false, description: "按飞行器筛选已安装部件" })
  @ApiResponse({ status: 200, description: "获取成功", type: [ComponentResponseDto] })
  async list(
    @Query("limit", new ParseIntPipe({ optional: true })) limit = 50,
    @Query("offset", new ParseIntPipe({ optional: true })) offset = 0,
    @Query("aircraftId") aircraftId?: string,
  ) {
    if (aircraftId) {
      return this.componentService.findInstalledOnAircraft(aircraftId);
    }
    return this.componentService.list(limit, offset);
  }

  /**
   * Get components due for maintenance
   */
  @Get("maintenance/due")
  @ApiOperation({ summary: "获取待保养部件", description: "获取即将到达维保周期的部件列表" })
  @ApiResponse({ status: 200, description: "获取成功", type: [ComponentResponseDto] })
  async getDueForMaintenance() {
    return this.componentService.findDueForMaintenance();
  }

  /**
   * Create new component
   */
  @Post()
  @Roles("ADMIN", "MANAGER", "MECHANIC")
  @ApiOperation({ summary: "创建部件", description: "添加新部件（需要 ADMIN、MANAGER 或 MECHANIC 角色）" })
  @ApiBody({ type: CreateComponentSwaggerDto })
  @ApiResponse({ status: 201, description: "创建成功", type: ComponentResponseDto })
  @ApiResponse({ status: 400, description: "请求参数错误" })
  @ApiResponse({ status: 409, description: "序列号已存在" })
  async create(@Body() dto: CreateComponentDto) {
    return this.componentService.create(dto);
  }

  /**
   * Install component on aircraft
   */
  @Post("install")
  @Roles("ADMIN", "MANAGER", "MECHANIC")
  @ApiOperation({
    summary: "安装部件",
    description: "将部件安装到飞行器上。部件履历将跟随部件转移。如果部件当前已安装在其他飞行器上，会自动先拆卸。",
  })
  @ApiBody({ type: InstallComponentSwaggerDto })
  @ApiResponse({ status: 200, description: "安装成功", type: InstallResultDto })
  @ApiResponse({ status: 404, description: "部件或飞行器不存在" })
  @ApiResponse({ status: 409, description: "部件不可用（不适航或超寿）" })
  async install(@Body() dto: InstallComponentDto) {
    return this.componentService.install(dto);
  }

  /**
   * Remove component from aircraft
   */
  @Post("remove")
  @Roles("ADMIN", "MANAGER", "MECHANIC")
  @ApiOperation({ summary: "拆卸部件", description: "从飞行器上拆卸部件" })
  @ApiBody({ type: RemoveComponentSwaggerDto })
  @ApiResponse({ status: 200, description: "拆卸成功", type: RemoveResultDto })
  @ApiResponse({ status: 404, description: "部件不存在" })
  @ApiResponse({ status: 409, description: "部件当前未安装" })
  async remove(@Body() dto: RemoveComponentDto) {
    return this.componentService.remove(dto);
  }

  /**
   * Update component
   */
  @Put(":id")
  @Roles("ADMIN", "MANAGER", "MECHANIC")
  @ApiOperation({ summary: "更新部件信息", description: "更新部件基本信息（需要 ADMIN、MANAGER 或 MECHANIC 角色）" })
  @ApiParam({ name: "id", description: "部件 ID" })
  @ApiBody({ type: UpdateComponentSwaggerDto })
  @ApiResponse({ status: 200, description: "更新成功", type: ComponentResponseDto })
  @ApiResponse({ status: 404, description: "部件不存在" })
  async update(@Param("id") id: string, @Body() dto: UpdateComponentDto) {
    return this.componentService.update(id, dto);
  }

  /**
   * Delete component
   */
  @Delete(":id")
  @Roles("ADMIN", "MANAGER")
  @ApiOperation({ summary: "删除部件", description: "永久删除部件记录（需要 ADMIN 或 MANAGER 角色）" })
  @ApiParam({ name: "id", description: "部件 ID" })
  @ApiResponse({ status: 200, description: "删除成功", schema: { example: { success: true } } })
  @ApiResponse({ status: 404, description: "部件不存在" })
  async delete(@Param("id") id: string) {
    await this.componentService.delete(id);
    return { success: true };
  }
}
