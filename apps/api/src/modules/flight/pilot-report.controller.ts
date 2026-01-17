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
  Request,
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
import type { Request as ExpressRequest } from "express";

import {
  PilotReportService,
  CreatePilotReportDto,
  UpdatePilotReportDto,
  UpdateStatusDto,
} from "./pilot-report.service";
import { Roles } from "../../common/decorators/roles.decorator";
import { RolesGuard } from "../../common/guards/roles.guard";

// Swagger DTO classes
class CreatePilotReportSwaggerDto {
  @ApiProperty({ description: "飞行器 ID" })
  aircraftId!: string;

  @ApiPropertyOptional({ description: "关联的飞行记录 ID" })
  flightLogId?: string;

  @ApiProperty({ description: "报告标题", example: "电机异响" })
  title!: string;

  @ApiProperty({ description: "详细描述", example: "飞行结束后发现 1 号电机有异常噪音" })
  description!: string;

  @ApiProperty({
    description: "严重程度",
    enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
    example: "MEDIUM",
  })
  severity!: string;

  @ApiPropertyOptional({ description: "受影响系统", example: "动力系统" })
  affectedSystem?: string;

  @ApiPropertyOptional({ description: "受影响部件", example: "1 号电机" })
  affectedComponent?: string;

  @ApiPropertyOptional({ description: "是否 AOG（飞机停飞）", default: false })
  isAog?: boolean;
}

class UpdatePilotReportSwaggerDto {
  @ApiPropertyOptional({ description: "报告标题" })
  title?: string;

  @ApiPropertyOptional({ description: "详细描述" })
  description?: string;

  @ApiPropertyOptional({
    description: "严重程度",
    enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
  })
  severity?: string;

  @ApiPropertyOptional({
    description: "状态",
    enum: ["OPEN", "IN_PROGRESS", "DEFERRED", "RESOLVED", "CLOSED"],
  })
  status?: string;

  @ApiPropertyOptional({ description: "受影响系统" })
  affectedSystem?: string;

  @ApiPropertyOptional({ description: "受影响部件" })
  affectedComponent?: string;

  @ApiPropertyOptional({ description: "解决方案" })
  resolution?: string;
}

class UpdateStatusSwaggerDto {
  @ApiProperty({
    description: "状态",
    enum: ["OPEN", "IN_PROGRESS", "DEFERRED", "RESOLVED", "CLOSED"],
  })
  status!: string;

  @ApiPropertyOptional({ description: "解决方案" })
  resolution?: string;
}

class LinkWorkOrderSwaggerDto {
  @ApiProperty({ description: "工单 ID" })
  workOrderId!: string;
}

class PilotReportResponseDto {
  @ApiProperty({ description: "报告 ID" })
  id!: string;

  @ApiProperty({ description: "飞行器 ID" })
  aircraftId!: string;

  @ApiProperty({ description: "报告人 ID" })
  reportedBy!: string;

  @ApiProperty({ description: "报告标题" })
  title!: string;

  @ApiProperty({ description: "详细描述" })
  description!: string;

  @ApiProperty({ description: "严重程度" })
  severity!: string;

  @ApiProperty({ description: "状态" })
  status!: string;

  @ApiProperty({ description: "是否 AOG" })
  isAog!: boolean;

  @ApiPropertyOptional({ description: "关联工单 ID" })
  workOrderId?: string | null;
}

/**
 * Pilot Report (PIREP) controller
 *
 * Handles pilot report operations
 * PIREP is how pilots report issues discovered during/after flights
 */
@ApiTags("故障报告 (PIREP)")
@ApiBearerAuth()
@Controller("pilot-reports")
@UseGuards(AuthGuard("jwt"), RolesGuard)
export class PilotReportController {
  private pilotReportService: PilotReportService;

  constructor(@Inject(PilotReportService) pilotReportService: PilotReportService) {
    this.pilotReportService = pilotReportService;
  }

  /**
   * Get pilot report by ID
   */
  @Get(":id")
  @ApiOperation({ summary: "获取故障报告详情", description: "根据 ID 获取故障报告详细信息" })
  @ApiParam({ name: "id", description: "故障报告 ID" })
  @ApiResponse({ status: 200, description: "获取成功", type: PilotReportResponseDto })
  @ApiResponse({ status: 404, description: "故障报告不存在" })
  async getById(@Param("id") id: string) {
    return this.pilotReportService.findById(id);
  }

  /**
   * List pilot reports
   * Can filter by aircraft, reporter, or status
   */
  @Get()
  @ApiOperation({ summary: "获取故障报告列表", description: "获取故障报告，支持多种筛选条件" })
  @ApiQuery({ name: "limit", required: false, description: "每页数量", example: 50 })
  @ApiQuery({ name: "offset", required: false, description: "偏移量", example: 0 })
  @ApiQuery({ name: "aircraftId", required: false, description: "按飞行器筛选" })
  @ApiQuery({ name: "reporterId", required: false, description: "按报告人筛选" })
  @ApiQuery({ name: "open", required: false, description: "仅获取未解决的报告", enum: ["true", "false"] })
  @ApiQuery({ name: "aog", required: false, description: "仅获取 AOG 报告", enum: ["true", "false"] })
  @ApiResponse({ status: 200, description: "获取成功", type: [PilotReportResponseDto] })
  async list(
    @Query("limit", new ParseIntPipe({ optional: true })) limit = 50,
    @Query("offset", new ParseIntPipe({ optional: true })) offset = 0,
    @Query("aircraftId") aircraftId?: string,
    @Query("reporterId") reporterId?: string,
    @Query("open") open?: string,
    @Query("aog") aog?: string,
  ) {
    if (aog === "true") {
      return this.pilotReportService.findAog();
    }

    if (open === "true") {
      return this.pilotReportService.findOpen(limit, offset);
    }

    if (aircraftId) {
      return this.pilotReportService.findByAircraft(aircraftId, limit, offset);
    }

    if (reporterId) {
      return this.pilotReportService.findByReporter(reporterId, limit, offset);
    }

    // Default to open reports
    return this.pilotReportService.findOpen(limit, offset);
  }

  /**
   * Create new pilot report
   * Available to all authenticated users
   */
  @Post()
  @ApiOperation({
    summary: "创建故障报告",
    description: "提交飞行中发现的问题。CRITICAL 严重程度会自动设置 AOG 标志。",
  })
  @ApiBody({ type: CreatePilotReportSwaggerDto })
  @ApiResponse({ status: 201, description: "创建成功", type: PilotReportResponseDto })
  @ApiResponse({ status: 400, description: "请求参数错误" })
  async create(@Request() req: ExpressRequest & { user?: { id: string } }, @Body() dto: CreatePilotReportDto) {
    return this.pilotReportService.create(req.user!.id, dto);
  }

  /**
   * Update pilot report
   */
  @Put(":id")
  @Roles("ADMIN", "MANAGER", "MECHANIC", "INSPECTOR")
  @ApiOperation({ summary: "更新故障报告", description: "更新故障报告信息（需要相应角色权限）" })
  @ApiParam({ name: "id", description: "故障报告 ID" })
  @ApiBody({ type: UpdatePilotReportSwaggerDto })
  @ApiResponse({ status: 200, description: "更新成功", type: PilotReportResponseDto })
  @ApiResponse({ status: 404, description: "故障报告不存在" })
  async update(@Param("id") id: string, @Body() dto: UpdatePilotReportDto) {
    return this.pilotReportService.update(id, dto);
  }

  /**
   * Update pilot report status
   * Used by maintenance/inspection to track resolution
   */
  @Put(":id/status")
  @Roles("ADMIN", "MANAGER", "MECHANIC", "INSPECTOR")
  @ApiOperation({ summary: "更新报告状态", description: "更新故障报告处理状态（解决后会自动清除 AOG 标志）" })
  @ApiParam({ name: "id", description: "故障报告 ID" })
  @ApiBody({ type: UpdateStatusSwaggerDto })
  @ApiResponse({ status: 200, description: "更新成功", type: PilotReportResponseDto })
  @ApiResponse({ status: 404, description: "故障报告不存在" })
  async updateStatus(@Request() req: ExpressRequest & { user?: { id: string } }, @Param("id") id: string, @Body() dto: UpdateStatusDto) {
    return this.pilotReportService.updateStatus(id, req.user!.id, dto);
  }

  /**
   * Link pilot report to work order
   * Called when a work order is created from a pilot report
   */
  @Post(":id/link-work-order")
  @Roles("ADMIN", "MANAGER", "MECHANIC")
  @ApiOperation({ summary: "关联工单", description: "将故障报告与维修工单关联" })
  @ApiParam({ name: "id", description: "故障报告 ID" })
  @ApiBody({ type: LinkWorkOrderSwaggerDto })
  @ApiResponse({ status: 200, description: "关联成功", type: PilotReportResponseDto })
  @ApiResponse({ status: 404, description: "故障报告或工单不存在" })
  async linkToWorkOrder(
    @Param("id") id: string,
    @Body() body: { workOrderId: string },
  ) {
    return this.pilotReportService.linkToWorkOrder(id, body.workOrderId);
  }

  /**
   * Delete pilot report (soft delete)
   */
  @Delete(":id")
  @Roles("ADMIN", "MANAGER")
  @ApiOperation({ summary: "删除故障报告", description: "删除故障报告（需要 ADMIN 或 MANAGER 角色）" })
  @ApiParam({ name: "id", description: "故障报告 ID" })
  @ApiResponse({ status: 200, description: "删除成功", schema: { example: { success: true, message: "Pilot report deleted" } } })
  @ApiResponse({ status: 404, description: "故障报告不存在" })
  async delete(@Param("id") id: string) {
    await this.pilotReportService.delete(id);
    return { success: true, message: "Pilot report deleted" };
  }
}
