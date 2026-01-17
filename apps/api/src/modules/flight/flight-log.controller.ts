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
  BadRequestException,
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
  FlightLogService,
  CreateFlightLogDto,
  UpdateFlightLogDto,
} from "./flight-log.service";
import { Roles } from "../../common/decorators/roles.decorator";
import { RolesGuard } from "../../common/guards/roles.guard";

// Swagger DTO classes
class CreateFlightLogSwaggerDto {
  @ApiProperty({ description: "飞行器 ID" })
  aircraftId!: string;

  @ApiProperty({ description: "机长 ID" })
  pilotId!: string;

  @ApiPropertyOptional({ description: "副驾驶 ID" })
  copilotId?: string;

  @ApiProperty({ description: "飞行日期（时间戳）", example: 1704067200000 })
  flightDate!: number;

  @ApiProperty({
    description: "飞行类型",
    enum: ["TRAINING", "MISSION", "TEST", "FERRY", "MAINTENANCE"],
    example: "MISSION",
  })
  flightType!: string;

  @ApiProperty({ description: "起飞地点", example: "北京基地" })
  departureLocation!: string;

  @ApiPropertyOptional({ description: "起飞时间（时间戳）" })
  departureTime?: number;

  @ApiPropertyOptional({ description: "降落地点" })
  arrivalLocation?: string;

  @ApiPropertyOptional({ description: "降落时间（时间戳）" })
  arrivalTime?: number;

  @ApiProperty({ description: "飞行时长（分钟）", example: 45 })
  flightDuration!: number;

  @ApiProperty({ description: "飞行小时数", example: 0.75 })
  flightHours!: number;

  @ApiPropertyOptional({ description: "起飞次数", default: 1 })
  takeoffCycles?: number;

  @ApiPropertyOptional({ description: "降落次数", default: 1 })
  landingCycles?: number;

  @ApiPropertyOptional({ description: "任务描述" })
  missionDescription?: string;

  @ApiPropertyOptional({ description: "载荷重量（kg）" })
  payloadWeight?: number;

  @ApiPropertyOptional({ description: "飞前检查是否完成" })
  preFlightCheckCompleted?: boolean;

  @ApiPropertyOptional({ description: "飞前检查人员 ID" })
  preFlightCheckBy?: string;

  @ApiPropertyOptional({ description: "飞后备注" })
  postFlightNotes?: string;

  @ApiPropertyOptional({ description: "异常情况记录" })
  discrepancies?: string;
}

class UpdateFlightLogSwaggerDto {
  @ApiPropertyOptional({ description: "飞行日期（时间戳）" })
  flightDate?: number;

  @ApiPropertyOptional({
    description: "飞行类型",
    enum: ["TRAINING", "MISSION", "TEST", "FERRY", "MAINTENANCE"],
  })
  flightType?: string;

  @ApiPropertyOptional({ description: "起飞地点" })
  departureLocation?: string;

  @ApiPropertyOptional({ description: "起飞时间（时间戳）" })
  departureTime?: number;

  @ApiPropertyOptional({ description: "降落地点" })
  arrivalLocation?: string;

  @ApiPropertyOptional({ description: "降落时间（时间戳）" })
  arrivalTime?: number;

  @ApiPropertyOptional({ description: "飞行时长（分钟）" })
  flightDuration?: number;

  @ApiPropertyOptional({ description: "飞行小时数" })
  flightHours?: number;

  @ApiPropertyOptional({ description: "飞后备注" })
  postFlightNotes?: string;

  @ApiPropertyOptional({ description: "异常情况记录" })
  discrepancies?: string;
}

class FlightLogResponseDto {
  @ApiProperty({ description: "飞行记录 ID" })
  id!: string;

  @ApiProperty({ description: "飞行器 ID" })
  aircraftId!: string;

  @ApiProperty({ description: "机长 ID" })
  pilotId!: string;

  @ApiProperty({ description: "飞行日期" })
  flightDate!: number;

  @ApiProperty({ description: "飞行类型" })
  flightType!: string;

  @ApiProperty({ description: "起飞地点" })
  departureLocation!: string;

  @ApiProperty({ description: "飞行时长（分钟）" })
  flightDuration!: number;

  @ApiProperty({ description: "飞行小时数" })
  flightHours!: number;

  @ApiProperty({ description: "起飞次数" })
  takeoffCycles!: number;

  @ApiProperty({ description: "降落次数" })
  landingCycles!: number;
}

class AircraftStatsResponseDto {
  @ApiProperty({ description: "总飞行小时数" })
  totalHours!: number;

  @ApiProperty({ description: "总循环次数" })
  totalCycles!: number;

  @ApiProperty({ description: "飞行记录数" })
  flightCount!: number;
}

/**
 * Flight Log controller
 *
 * Handles flight log CRUD operations
 * Flight logs are the legal record of aircraft operation
 */
@ApiTags("飞行记录 (Flight Log)")
@ApiBearerAuth()
@Controller("flight-logs")
@UseGuards(AuthGuard("jwt"), RolesGuard)
export class FlightLogController {
  private flightLogService: FlightLogService;

  constructor(@Inject(FlightLogService) flightLogService: FlightLogService) {
    this.flightLogService = flightLogService;
  }

  /**
   * Get flight log by ID
   */
  @Get(":id")
  @ApiOperation({ summary: "获取飞行记录详情", description: "根据 ID 获取飞行记录详细信息" })
  @ApiParam({ name: "id", description: "飞行记录 ID" })
  @ApiResponse({ status: 200, description: "获取成功", type: FlightLogResponseDto })
  @ApiResponse({ status: 404, description: "飞行记录不存在" })
  async getById(@Param("id") id: string) {
    return this.flightLogService.findById(id);
  }

  /**
   * List flight logs
   * Can filter by aircraft, pilot, or date range
   */
  @Get()
  @ApiOperation({ summary: "获取飞行记录列表", description: "获取飞行记录，支持多种筛选条件" })
  @ApiQuery({ name: "limit", required: false, description: "每页数量", example: 50 })
  @ApiQuery({ name: "offset", required: false, description: "偏移量", example: 0 })
  @ApiQuery({ name: "aircraftId", required: false, description: "按飞行器筛选" })
  @ApiQuery({ name: "pilotId", required: false, description: "按机长筛选" })
  @ApiQuery({ name: "recent", required: false, description: "获取最近记录", enum: ["true", "false"] })
  @ApiQuery({ name: "startDate", required: false, description: "起始日期 (ISO 8601)" })
  @ApiQuery({ name: "endDate", required: false, description: "结束日期 (ISO 8601)" })
  @ApiResponse({ status: 200, description: "获取成功", type: [FlightLogResponseDto] })
  async list(
    @Query("limit", new ParseIntPipe({ optional: true })) limit = 50,
    @Query("offset", new ParseIntPipe({ optional: true })) offset = 0,
    @Query("aircraftId") aircraftId?: string,
    @Query("pilotId") pilotId?: string,
    @Query("recent") recent?: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ) {
    if (recent === "true") {
      return this.flightLogService.getRecent(limit);
    }

    if (aircraftId) {
      return this.flightLogService.findByAircraft(aircraftId, limit, offset);
    }

    if (pilotId) {
      return this.flightLogService.findByPilot(pilotId, limit, offset);
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new BadRequestException("Invalid date format");
      }
      return this.flightLogService.findByDateRange(start, end);
    }

    // Default to recent logs if no filter
    return this.flightLogService.getRecent(limit);
  }

  /**
   * Get aircraft flight statistics
   */
  @Get("aircraft/:aircraftId/stats")
  @ApiOperation({ summary: "获取飞行器统计数据", description: "获取飞行器的累计飞行小时、循环次数等统计信息" })
  @ApiParam({ name: "aircraftId", description: "飞行器 ID" })
  @ApiResponse({ status: 200, description: "获取成功", type: AircraftStatsResponseDto })
  async getAircraftStats(@Param("aircraftId") aircraftId: string) {
    return this.flightLogService.getAircraftStats(aircraftId);
  }

  /**
   * Create new flight log
   * Available to all authenticated users (pilots log flights)
   */
  @Post()
  @ApiOperation({
    summary: "创建飞行记录",
    description: "记录一次飞行。系统会自动更新飞行器和已安装部件的累计飞行小时和循环次数。",
  })
  @ApiBody({ type: CreateFlightLogSwaggerDto })
  @ApiResponse({ status: 201, description: "创建成功", type: FlightLogResponseDto })
  @ApiResponse({ status: 400, description: "请求参数错误" })
  async create(@Body() dto: CreateFlightLogDto) {
    return this.flightLogService.create(dto);
  }

  /**
   * Update flight log
   * Limited to admin/manager for corrections
   */
  @Put(":id")
  @Roles("ADMIN", "MANAGER")
  @ApiOperation({
    summary: "更新飞行记录",
    description: "更新飞行记录（需要 ADMIN 或 MANAGER 角色）。注意：修改飞行小时数后不会自动调整累计数据。",
  })
  @ApiParam({ name: "id", description: "飞行记录 ID" })
  @ApiBody({ type: UpdateFlightLogSwaggerDto })
  @ApiResponse({ status: 200, description: "更新成功", type: FlightLogResponseDto })
  @ApiResponse({ status: 404, description: "飞行记录不存在" })
  async update(@Param("id") id: string, @Body() dto: UpdateFlightLogDto) {
    return this.flightLogService.update(id, dto);
  }

  /**
   * Delete flight log (soft delete)
   * Limited to admin only - this is a legal record
   */
  @Delete(":id")
  @Roles("ADMIN")
  @ApiOperation({ summary: "删除飞行记录", description: "删除飞行记录（需要 ADMIN 角色）。这是法律记录，请谨慎操作。" })
  @ApiParam({ name: "id", description: "飞行记录 ID" })
  @ApiResponse({ status: 200, description: "删除成功", schema: { example: { success: true, message: "Flight log deleted" } } })
  @ApiResponse({ status: 404, description: "飞行记录不存在" })
  async delete(@Param("id") id: string) {
    await this.flightLogService.delete(id);
    return { success: true, message: "Flight log deleted" };
  }
}
