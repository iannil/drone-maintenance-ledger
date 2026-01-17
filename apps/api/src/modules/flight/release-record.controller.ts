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
  ReleaseRecordService,
  CreateReleaseRecordDto,
  UpdateReleaseRecordDto,
  SignReleaseDto,
} from "./release-record.service";
import { Roles } from "../../common/decorators/roles.decorator";
import { RolesGuard } from "../../common/guards/roles.guard";

// Swagger DTO classes
class CreateReleaseRecordSwaggerDto {
  @ApiProperty({ description: "飞行器 ID" })
  aircraftId!: string;

  @ApiPropertyOptional({ description: "关联工单 ID" })
  workOrderId?: string;

  @ApiProperty({
    description: "放行状态",
    enum: ["RELEASED", "CONDITIONAL", "NOT_RELEASED"],
    example: "RELEASED",
  })
  releaseStatus!: string;

  @ApiProperty({ description: "工作描述", example: "完成 50 小时定检，更换 1 号电机" })
  workDescription!: string;

  @ApiPropertyOptional({ description: "放行证书编号" })
  releaseCertificateNumber?: string;

  @ApiPropertyOptional({ description: "放行条件" })
  conditions?: string;

  @ApiPropertyOptional({ description: "使用限制" })
  limitations?: string;
}

class UpdateReleaseRecordSwaggerDto {
  @ApiPropertyOptional({
    description: "放行状态",
    enum: ["RELEASED", "CONDITIONAL", "NOT_RELEASED"],
  })
  releaseStatus?: string;

  @ApiPropertyOptional({ description: "工作描述" })
  workDescription?: string;

  @ApiPropertyOptional({ description: "放行条件" })
  conditions?: string;

  @ApiPropertyOptional({ description: "使用限制" })
  limitations?: string;

  @ApiPropertyOptional({ description: "解决方案" })
  resolution?: string;
}

class SignReleaseSwaggerDto {
  @ApiProperty({ description: "电子签名哈希值" })
  signatureHash!: string;
}

class ReleaseRecordResponseDto {
  @ApiProperty({ description: "放行记录 ID" })
  id!: string;

  @ApiProperty({ description: "飞行器 ID" })
  aircraftId!: string;

  @ApiPropertyOptional({ description: "关联工单 ID" })
  workOrderId?: string | null;

  @ApiProperty({ description: "放行状态" })
  releaseStatus!: string;

  @ApiProperty({ description: "工作描述" })
  workDescription!: string;

  @ApiProperty({ description: "放行人 ID" })
  releasedBy!: string;

  @ApiPropertyOptional({ description: "电子签名哈希值" })
  signatureHash?: string | null;

  @ApiPropertyOptional({ description: "签名时间" })
  signedAt?: number | null;
}

class ReleaseStatusResponseDto {
  @ApiProperty({ description: "是否已放行" })
  isReleased!: boolean;

  @ApiPropertyOptional({ description: "当前放行记录", type: ReleaseRecordResponseDto })
  release?: ReleaseRecordResponseDto | null;
}

/**
 * Release Record controller
 *
 * Handles release record operations
 * This is a LEGALLY SIGNIFICANT document - aircraft release to service
 * Only INSPECTOR role can sign releases
 */
@ApiTags("适航放行 (Release Record)")
@ApiBearerAuth()
@Controller("release-records")
@UseGuards(AuthGuard("jwt"), RolesGuard)
export class ReleaseRecordController {
  private releaseRecordService: ReleaseRecordService;

  constructor(@Inject(ReleaseRecordService) releaseRecordService: ReleaseRecordService) {
    this.releaseRecordService = releaseRecordService;
  }

  /**
   * Get release record by ID
   */
  @Get(":id")
  @ApiOperation({ summary: "获取放行记录详情", description: "根据 ID 获取放行记录详细信息" })
  @ApiParam({ name: "id", description: "放行记录 ID" })
  @ApiResponse({ status: 200, description: "获取成功", type: ReleaseRecordResponseDto })
  @ApiResponse({ status: 404, description: "放行记录不存在" })
  async getById(@Param("id") id: string) {
    return this.releaseRecordService.findById(id);
  }

  /**
   * List release records
   * Can filter by aircraft or work order
   */
  @Get()
  @ApiOperation({ summary: "获取放行记录列表", description: "获取放行记录，支持按飞行器或工单筛选" })
  @ApiQuery({ name: "limit", required: false, description: "每页数量", example: 50 })
  @ApiQuery({ name: "offset", required: false, description: "偏移量", example: 0 })
  @ApiQuery({ name: "aircraftId", required: false, description: "按飞行器筛选" })
  @ApiQuery({ name: "workOrderId", required: false, description: "按工单筛选" })
  @ApiQuery({ name: "recent", required: false, description: "获取最近记录", enum: ["true", "false"] })
  @ApiResponse({ status: 200, description: "获取成功", type: [ReleaseRecordResponseDto] })
  async list(
    @Query("limit", new ParseIntPipe({ optional: true })) limit = 50,
    @Query("offset", new ParseIntPipe({ optional: true })) offset = 0,
    @Query("aircraftId") aircraftId?: string,
    @Query("workOrderId") workOrderId?: string,
    @Query("recent") recent?: string,
  ) {
    if (recent === "true") {
      return this.releaseRecordService.getRecent(limit);
    }

    if (aircraftId) {
      return this.releaseRecordService.findByAircraft(aircraftId, limit, offset);
    }

    if (workOrderId) {
      return this.releaseRecordService.findByWorkOrder(workOrderId);
    }

    // Default to recent releases
    return this.releaseRecordService.getRecent(limit);
  }

  /**
   * Get current release for an aircraft
   * This is the legal basis for whether the aircraft can fly
   */
  @Get("aircraft/:aircraftId/current")
  @ApiOperation({ summary: "获取当前有效放行", description: "获取飞行器当前有效的放行记录（飞行的法律依据）" })
  @ApiParam({ name: "aircraftId", description: "飞行器 ID" })
  @ApiResponse({ status: 200, description: "获取成功", type: ReleaseRecordResponseDto })
  async getCurrentRelease(@Param("aircraftId") aircraftId: string) {
    return this.releaseRecordService.findCurrentRelease(aircraftId);
  }

  /**
   * Check if aircraft is released to service
   */
  @Get("aircraft/:aircraftId/status")
  @ApiOperation({ summary: "检查适航放行状态", description: "检查飞行器是否已获得有效的适航放行" })
  @ApiParam({ name: "aircraftId", description: "飞行器 ID" })
  @ApiResponse({ status: 200, description: "获取成功", type: ReleaseStatusResponseDto })
  async getReleaseStatus(@Param("aircraftId") aircraftId: string) {
    const isReleased = await this.releaseRecordService.isAircraftReleased(aircraftId);
    const release = await this.releaseRecordService.findCurrentRelease(aircraftId);
    return {
      isReleased,
      release: release || null,
    };
  }

  /**
   * Create new release record
   * Available to INSPECTOR and above
   */
  @Post()
  @Roles("ADMIN", "MANAGER", "INSPECTOR")
  @ApiOperation({
    summary: "创建放行记录",
    description: "创建新的放行记录（需要 INSPECTOR 及以上角色）。新记录会替代之前的有效放行。",
  })
  @ApiBody({ type: CreateReleaseRecordSwaggerDto })
  @ApiResponse({ status: 201, description: "创建成功", type: ReleaseRecordResponseDto })
  @ApiResponse({ status: 400, description: "请求参数错误" })
  async create(@Request() req: ExpressRequest & { user?: { id: string } }, @Body() dto: CreateReleaseRecordDto) {
    return this.releaseRecordService.create(req.user!.id, dto);
  }

  /**
   * Update release record
   * Only allowed if not yet signed
   */
  @Put(":id")
  @Roles("ADMIN", "MANAGER", "INSPECTOR")
  @ApiOperation({ summary: "更新放行记录", description: "更新放行记录（仅限未签名的记录可修改）" })
  @ApiParam({ name: "id", description: "放行记录 ID" })
  @ApiBody({ type: UpdateReleaseRecordSwaggerDto })
  @ApiResponse({ status: 200, description: "更新成功", type: ReleaseRecordResponseDto })
  @ApiResponse({ status: 403, description: "已签名的记录不可修改" })
  @ApiResponse({ status: 404, description: "放行记录不存在" })
  async update(@Param("id") id: string, @Body() dto: UpdateReleaseRecordDto) {
    return this.releaseRecordService.update(id, dto);
  }

  /**
   * Sign release record
   * This is the electronic signature action
   * Only INSPECTOR role can sign
   */
  @Post(":id/sign")
  @Roles("INSPECTOR", "ADMIN")
  @ApiOperation({
    summary: "签署放行记录",
    description: "对放行记录进行电子签名。签名后记录不可修改，飞行器获得适航放行。仅 INSPECTOR 角色可签署。",
  })
  @ApiParam({ name: "id", description: "放行记录 ID" })
  @ApiBody({ type: SignReleaseSwaggerDto })
  @ApiResponse({ status: 200, description: "签署成功", type: ReleaseRecordResponseDto })
  @ApiResponse({ status: 403, description: "记录已签署" })
  @ApiResponse({ status: 404, description: "放行记录不存在" })
  async sign(@Param("id") id: string, @Body() dto: SignReleaseDto) {
    return this.releaseRecordService.sign(id, dto);
  }

  /**
   * Delete release record (soft delete)
   * Only unsigned releases can be deleted
   */
  @Delete(":id")
  @Roles("ADMIN")
  @ApiOperation({ summary: "删除放行记录", description: "删除放行记录（仅限未签名的记录，需要 ADMIN 角色）" })
  @ApiParam({ name: "id", description: "放行记录 ID" })
  @ApiResponse({ status: 200, description: "删除成功", schema: { example: { success: true, message: "Release record deleted" } } })
  @ApiResponse({ status: 403, description: "已签名的记录不可删除" })
  @ApiResponse({ status: 404, description: "放行记录不存在" })
  async delete(@Param("id") id: string) {
    await this.releaseRecordService.delete(id);
    return { success: true, message: "Release record deleted" };
  }
}
