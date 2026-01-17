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

import { AircraftService, CreateAircraftDto, UpdateAircraftDto } from "./aircraft.service";
import { Roles } from "../../common/decorators/roles.decorator";
import { RolesGuard } from "../../common/guards/roles.guard";
import type { Aircraft } from "@repo/db";

// Swagger DTO classes
class CreateAircraftSwaggerDto {
  @ApiProperty({ description: "所属机队 ID" })
  fleetId!: string;

  @ApiProperty({ description: "注册号", example: "B-0001" })
  registrationNumber!: string;

  @ApiProperty({ description: "序列号", example: "SN-2024-001" })
  serialNumber!: string;

  @ApiProperty({ description: "型号", example: "M300 RTK" })
  model!: string;

  @ApiProperty({ description: "制造商", example: "DJI" })
  manufacturer!: string;

  @ApiPropertyOptional({
    description: "状态",
    enum: ["AVAILABLE", "IN_FLIGHT", "MAINTENANCE", "GROUNDED"],
  })
  status?: string;
}

class UpdateAircraftSwaggerDto {
  @ApiPropertyOptional({ description: "所属机队 ID" })
  fleetId?: string;

  @ApiPropertyOptional({ description: "注册号" })
  registrationNumber?: string;

  @ApiPropertyOptional({ description: "序列号" })
  serialNumber?: string;

  @ApiPropertyOptional({ description: "型号" })
  model?: string;

  @ApiPropertyOptional({ description: "制造商" })
  manufacturer?: string;

  @ApiPropertyOptional({
    description: "状态",
    enum: ["AVAILABLE", "IN_FLIGHT", "MAINTENANCE", "GROUNDED"],
  })
  status?: string;

  @ApiPropertyOptional({ description: "是否适航" })
  isAirworthy?: boolean;
}

class UpdateStatusSwaggerDto {
  @ApiProperty({
    description: "飞行器状态",
    enum: ["AVAILABLE", "IN_FLIGHT", "MAINTENANCE", "GROUNDED"],
  })
  status!: string;

  @ApiPropertyOptional({ description: "是否适航" })
  isAirworthy?: boolean;
}

class AircraftResponseDto {
  @ApiProperty({ description: "飞行器 ID" })
  id!: string;

  @ApiProperty({ description: "机队 ID" })
  fleetId!: string;

  @ApiProperty({ description: "注册号" })
  registrationNumber!: string;

  @ApiProperty({ description: "序列号" })
  serialNumber!: string;

  @ApiProperty({ description: "型号" })
  model!: string;

  @ApiProperty({ description: "制造商" })
  manufacturer!: string;

  @ApiProperty({ description: "状态" })
  status!: string;

  @ApiProperty({ description: "是否适航" })
  isAirworthy!: boolean;

  @ApiProperty({ description: "总飞行小时数" })
  totalFlightHours!: number;

  @ApiProperty({ description: "总起降循环数" })
  totalFlightCycles!: number;
}

/**
 * Aircraft controller
 *
 * Handles aircraft CRUD operations
 */
@ApiTags("飞行器 (Aircraft)")
@ApiBearerAuth()
@Controller("aircraft")
@UseGuards(AuthGuard("jwt"), RolesGuard)
export class AircraftController {
  private aircraftSvc: AircraftService;

  constructor(@Inject(AircraftService) aircraftService: AircraftService) {
    this.aircraftSvc = aircraftService;
  }

  /**
   * Get aircraft by ID
   */
  @Get(":id")
  @ApiOperation({ summary: "获取飞行器详情", description: "根据 ID 获取飞行器详细信息" })
  @ApiParam({ name: "id", description: "飞行器 ID" })
  @ApiResponse({ status: 200, description: "获取成功", type: AircraftResponseDto })
  @ApiResponse({ status: 404, description: "飞行器不存在" })
  async getById(@Param("id") id: string) {
    return this.aircraftSvc.findById(id);
  }

  /**
   * List all aircraft
   */
  @Get()
  @ApiOperation({ summary: "获取飞行器列表", description: "获取所有飞行器，支持分页和按机队筛选" })
  @ApiQuery({ name: "limit", required: false, description: "每页数量", example: 50 })
  @ApiQuery({ name: "offset", required: false, description: "偏移量", example: 0 })
  @ApiQuery({ name: "fleetId", required: false, description: "机队 ID 筛选" })
  @ApiResponse({ status: 200, description: "获取成功", type: [AircraftResponseDto] })
  async list(
    @Query("limit") limitStr?: string,
    @Query("offset") offsetStr?: string,
    @Query("fleetId") fleetId?: string,
  ) {
    const limit = limitStr ? parseInt(limitStr, 10) : 50;
    const offset = offsetStr ? parseInt(offsetStr, 10) : 0;
    if (fleetId) {
      return this.aircraftSvc.findByFleet(fleetId, limit, offset);
    }
    return this.aircraftSvc.list(limit, offset);
  }

  /**
   * Get status counts
   */
  @Get("status/counts")
  @ApiOperation({ summary: "获取状态统计", description: "获取各状态飞行器数量统计" })
  @ApiQuery({ name: "fleetId", required: false, description: "机队 ID 筛选" })
  @ApiResponse({
    status: 200,
    description: "获取成功",
    schema: {
      type: "object",
      additionalProperties: { type: "number" },
      example: { AVAILABLE: 10, IN_FLIGHT: 3, MAINTENANCE: 2, GROUNDED: 1 },
    },
  })
  async getStatusCounts(@Query("fleetId") fleetId?: string) {
    return this.aircraftSvc.getStatusCounts(fleetId);
  }

  /**
   * Create new aircraft
   */
  @Post()
  @Roles("ADMIN", "MANAGER")
  @ApiOperation({ summary: "创建飞行器", description: "添加新飞行器到机队（需要 ADMIN 或 MANAGER 角色）" })
  @ApiBody({ type: CreateAircraftSwaggerDto })
  @ApiResponse({ status: 201, description: "创建成功", type: AircraftResponseDto })
  @ApiResponse({ status: 400, description: "请求参数错误" })
  @ApiResponse({ status: 409, description: "注册号或序列号已存在" })
  async create(@Body() dto: CreateAircraftDto) {
    return this.aircraftSvc.create(dto);
  }

  /**
   * Update aircraft
   */
  @Put(":id")
  @Roles("ADMIN", "MANAGER")
  @ApiOperation({ summary: "更新飞行器信息", description: "更新飞行器基本信息（需要 ADMIN 或 MANAGER 角色）" })
  @ApiParam({ name: "id", description: "飞行器 ID" })
  @ApiBody({ type: UpdateAircraftSwaggerDto })
  @ApiResponse({ status: 200, description: "更新成功", type: AircraftResponseDto })
  @ApiResponse({ status: 404, description: "飞行器不存在" })
  @ApiResponse({ status: 409, description: "注册号已被使用" })
  async update(@Param("id") id: string, @Body() dto: UpdateAircraftDto) {
    return this.aircraftSvc.update(id, dto);
  }

  /**
   * Update aircraft status
   */
  @Put(":id/status")
  @Roles("ADMIN", "MANAGER", "INSPECTOR")
  @ApiOperation({ summary: "更新飞行器状态", description: "更新飞行器状态和适航性（需要 ADMIN、MANAGER 或 INSPECTOR 角色）" })
  @ApiParam({ name: "id", description: "飞行器 ID" })
  @ApiBody({ type: UpdateStatusSwaggerDto })
  @ApiResponse({ status: 200, description: "更新成功", type: AircraftResponseDto })
  @ApiResponse({ status: 404, description: "飞行器不存在" })
  async updateStatus(
    @Param("id") id: string,
    @Body() body: { status: Aircraft["status"]; isAirworthy?: boolean },
  ) {
    return this.aircraftSvc.updateStatus(id, body.status, body.isAirworthy);
  }

  /**
   * Delete aircraft
   */
  @Delete(":id")
  @Roles("ADMIN")
  @ApiOperation({ summary: "删除飞行器", description: "永久删除飞行器记录（需要 ADMIN 角色）" })
  @ApiParam({ name: "id", description: "飞行器 ID" })
  @ApiResponse({ status: 200, description: "删除成功", schema: { example: { success: true } } })
  @ApiResponse({ status: 404, description: "飞行器不存在" })
  async delete(@Param("id") id: string) {
    await this.aircraftSvc.delete(id);
    return { success: true };
  }
}
