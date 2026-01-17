/**
 * Purchase Request Controller
 *
 * REST API endpoints for purchase request management
 */

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
  Request,
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
  PurchaseRequestService,
  CreatePurchaseRequestDto,
  UpdatePurchaseRequestDto,
  CreatePurchaseRequestItemDto,
} from "./purchase-request.service";
import { Roles } from "../../common/decorators/roles.decorator";
import { RolesGuard } from "../../common/guards/roles.guard";

// Swagger DTO classes
class CreatePurchaseRequestSwaggerDto {
  @ApiPropertyOptional({ description: "申请人 ID（默认为当前用户）" })
  requesterId?: string;

  @ApiProperty({ description: "申请标题", example: "维修工单零件采购" })
  title!: string;

  @ApiPropertyOptional({ description: "描述" })
  description?: string;

  @ApiPropertyOptional({
    description: "优先级",
    enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
    default: "MEDIUM",
  })
  priority?: string;

  @ApiPropertyOptional({ description: "期望交付日期（时间戳）" })
  requiredDate?: number;

  @ApiPropertyOptional({ description: "关联工单 ID" })
  workOrderId?: string;

  @ApiPropertyOptional({ description: "备注" })
  notes?: string;
}

class UpdatePurchaseRequestSwaggerDto {
  @ApiPropertyOptional({ description: "申请标题" })
  title?: string;

  @ApiPropertyOptional({ description: "描述" })
  description?: string;

  @ApiPropertyOptional({
    description: "优先级",
    enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
  })
  priority?: string;

  @ApiPropertyOptional({ description: "期望交付日期（时间戳）" })
  requiredDate?: number;

  @ApiPropertyOptional({ description: "备注" })
  notes?: string;
}

class CreatePurchaseRequestItemSwaggerDto {
  @ApiProperty({ description: "物料号", example: "PN-MOT-001" })
  partNumber!: string;

  @ApiProperty({ description: "物料名称", example: "电机" })
  partName!: string;

  @ApiProperty({ description: "数量", example: 2 })
  quantity!: number;

  @ApiPropertyOptional({ description: "单位", default: "个" })
  unit?: string;

  @ApiPropertyOptional({ description: "预估单价" })
  estimatedUnitPrice?: number;

  @ApiPropertyOptional({ description: "备注" })
  notes?: string;
}

class RejectSwaggerDto {
  @ApiProperty({ description: "拒绝原因", example: "预算超支" })
  reason!: string;
}

class PurchaseRequestResponseDto {
  @ApiProperty({ description: "采购申请 ID" })
  id!: string;

  @ApiProperty({ description: "申请编号" })
  requestNumber!: string;

  @ApiProperty({ description: "申请人 ID" })
  requesterId!: string;

  @ApiProperty({ description: "申请标题" })
  title!: string;

  @ApiProperty({ description: "状态" })
  status!: string;

  @ApiProperty({ description: "优先级" })
  priority!: string;

  @ApiPropertyOptional({ description: "审批人 ID" })
  approvedBy?: string | null;

  @ApiPropertyOptional({ description: "审批时间" })
  approvedAt?: number | null;
}

class PurchaseRequestItemResponseDto {
  @ApiProperty({ description: "明细项 ID" })
  id!: string;

  @ApiProperty({ description: "采购申请 ID" })
  purchaseRequestId!: string;

  @ApiProperty({ description: "物料号" })
  partNumber!: string;

  @ApiProperty({ description: "物料名称" })
  partName!: string;

  @ApiProperty({ description: "数量" })
  quantity!: number;

  @ApiProperty({ description: "单位" })
  unit!: string;
}

@ApiTags("采购申请 (Purchase Request)")
@ApiBearerAuth()
@Controller("purchase-requests")
@UseGuards(AuthGuard("jwt"), RolesGuard)
export class PurchaseRequestController {
  constructor(
    @Inject(PurchaseRequestService)
    private readonly prSvc: PurchaseRequestService
  ) {}

  /**
   * Get purchase request by ID with items
   * GET /api/purchase-requests/:id
   */
  @Get(":id")
  @ApiOperation({ summary: "获取采购申请详情", description: "根据 ID 获取采购申请详细信息（含明细项）" })
  @ApiParam({ name: "id", description: "采购申请 ID" })
  @ApiResponse({ status: 200, description: "获取成功", type: PurchaseRequestResponseDto })
  @ApiResponse({ status: 404, description: "采购申请不存在" })
  async getById(@Param("id") id: string) {
    return this.prSvc.findByIdWithItems(id);
  }

  /**
   * List purchase requests
   * GET /api/purchase-requests
   */
  @Get()
  @ApiOperation({ summary: "获取采购申请列表", description: "获取采购申请列表，支持多种筛选条件" })
  @ApiQuery({ name: "limit", required: false, description: "每页数量", example: 50 })
  @ApiQuery({ name: "offset", required: false, description: "偏移量", example: 0 })
  @ApiQuery({ name: "status", required: false, description: "按状态筛选", enum: ["DRAFT", "SUBMITTED", "APPROVED", "REJECTED", "CANCELLED", "ORDERED"] })
  @ApiQuery({ name: "requesterId", required: false, description: "按申请人筛选" })
  @ApiQuery({ name: "priority", required: false, description: "按优先级筛选", enum: ["LOW", "MEDIUM", "HIGH", "URGENT"] })
  @ApiResponse({ status: 200, description: "获取成功", type: [PurchaseRequestResponseDto] })
  async list(
    @Query("limit") limitStr?: string,
    @Query("offset") offsetStr?: string,
    @Query("status") status?: string,
    @Query("requesterId") requesterId?: string,
    @Query("priority") priority?: string,
  ) {
    const limit = limitStr ? parseInt(limitStr, 10) : 50;
    const offset = offsetStr ? parseInt(offsetStr, 10) : 0;
    return this.prSvc.list({ limit, offset, status, requesterId, priority });
  }

  /**
   * Create new purchase request
   * POST /api/purchase-requests
   */
  @Post()
  @ApiOperation({ summary: "创建采购申请", description: "创建新的采购申请（申请人默认为当前用户）" })
  @ApiBody({ type: CreatePurchaseRequestSwaggerDto })
  @ApiResponse({ status: 201, description: "创建成功", type: PurchaseRequestResponseDto })
  @ApiResponse({ status: 400, description: "请求参数错误" })
  async create(
    @Body() dto: CreatePurchaseRequestDto,
    @Request() req: ExpressRequest & { user?: { id: string } }
  ) {
    // Set requester from current user if not provided
    if (!dto.requesterId && req.user) {
      dto.requesterId = req.user.id;
    }
    return this.prSvc.create(dto);
  }

  /**
   * Update purchase request
   * PUT /api/purchase-requests/:id
   */
  @Put(":id")
  @ApiOperation({ summary: "更新采购申请", description: "更新采购申请信息（仅限 DRAFT 状态）" })
  @ApiParam({ name: "id", description: "采购申请 ID" })
  @ApiBody({ type: UpdatePurchaseRequestSwaggerDto })
  @ApiResponse({ status: 200, description: "更新成功", type: PurchaseRequestResponseDto })
  @ApiResponse({ status: 404, description: "采购申请不存在" })
  @ApiResponse({ status: 409, description: "非草稿状态，不可修改" })
  async update(@Param("id") id: string, @Body() dto: UpdatePurchaseRequestDto) {
    return this.prSvc.update(id, dto);
  }

  /**
   * Submit purchase request for approval
   * POST /api/purchase-requests/:id/submit
   */
  @Post(":id/submit")
  @ApiOperation({ summary: "提交采购申请", description: "提交采购申请等待审批" })
  @ApiParam({ name: "id", description: "采购申请 ID" })
  @ApiResponse({ status: 200, description: "提交成功", type: PurchaseRequestResponseDto })
  @ApiResponse({ status: 404, description: "采购申请不存在" })
  @ApiResponse({ status: 409, description: "状态不正确，无法提交" })
  async submit(@Param("id") id: string) {
    return this.prSvc.submit(id);
  }

  /**
   * Approve purchase request (manager/admin only)
   * POST /api/purchase-requests/:id/approve
   */
  @Post(":id/approve")
  @Roles("ADMIN", "MANAGER")
  @ApiOperation({ summary: "审批通过", description: "审批通过采购申请（需要 ADMIN 或 MANAGER 角色）" })
  @ApiParam({ name: "id", description: "采购申请 ID" })
  @ApiResponse({ status: 200, description: "审批成功", type: PurchaseRequestResponseDto })
  @ApiResponse({ status: 404, description: "采购申请不存在" })
  @ApiResponse({ status: 409, description: "状态不正确，无法审批" })
  async approve(
    @Param("id") id: string,
    @Request() req: ExpressRequest & { user?: { id: string } }
  ) {
    return this.prSvc.approve(id, req.user!.id);
  }

  /**
   * Reject purchase request (manager/admin only)
   * POST /api/purchase-requests/:id/reject
   */
  @Post(":id/reject")
  @Roles("ADMIN", "MANAGER")
  @ApiOperation({ summary: "驳回采购申请", description: "驳回采购申请（需要 ADMIN 或 MANAGER 角色）" })
  @ApiParam({ name: "id", description: "采购申请 ID" })
  @ApiBody({ type: RejectSwaggerDto })
  @ApiResponse({ status: 200, description: "驳回成功", type: PurchaseRequestResponseDto })
  @ApiResponse({ status: 404, description: "采购申请不存在" })
  @ApiResponse({ status: 409, description: "状态不正确，无法驳回" })
  async reject(
    @Param("id") id: string,
    @Body() body: { reason: string },
    @Request() req: ExpressRequest & { user?: { id: string } }
  ) {
    return this.prSvc.reject(id, req.user!.id, body.reason);
  }

  /**
   * Cancel purchase request
   * POST /api/purchase-requests/:id/cancel
   */
  @Post(":id/cancel")
  @ApiOperation({ summary: "取消采购申请", description: "取消采购申请（仅限 DRAFT 或 SUBMITTED 状态）" })
  @ApiParam({ name: "id", description: "采购申请 ID" })
  @ApiResponse({ status: 200, description: "取消成功", type: PurchaseRequestResponseDto })
  @ApiResponse({ status: 404, description: "采购申请不存在" })
  @ApiResponse({ status: 409, description: "状态不正确，无法取消" })
  async cancel(@Param("id") id: string) {
    return this.prSvc.cancel(id);
  }

  /**
   * Delete purchase request (only DRAFT)
   * DELETE /api/purchase-requests/:id
   */
  @Delete(":id")
  @ApiOperation({ summary: "删除采购申请", description: "删除采购申请（仅限 DRAFT 状态）" })
  @ApiParam({ name: "id", description: "采购申请 ID" })
  @ApiResponse({ status: 200, description: "删除成功", schema: { example: { success: true } } })
  @ApiResponse({ status: 404, description: "采购申请不存在" })
  @ApiResponse({ status: 409, description: "非草稿状态，不可删除" })
  async delete(@Param("id") id: string) {
    await this.prSvc.delete(id);
    return { success: true };
  }

  // ============ Item Operations ============

  /**
   * Add item to purchase request
   * POST /api/purchase-requests/:id/items
   */
  @Post(":id/items")
  @ApiOperation({ summary: "添加明细项", description: "向采购申请添加物料明细项" })
  @ApiParam({ name: "id", description: "采购申请 ID" })
  @ApiBody({ type: CreatePurchaseRequestItemSwaggerDto })
  @ApiResponse({ status: 201, description: "添加成功", type: PurchaseRequestItemResponseDto })
  @ApiResponse({ status: 404, description: "采购申请不存在" })
  @ApiResponse({ status: 409, description: "非草稿状态，不可添加" })
  async addItem(
    @Param("id") id: string,
    @Body() dto: CreatePurchaseRequestItemDto
  ) {
    return this.prSvc.addItem(id, dto);
  }

  /**
   * Remove item from purchase request
   * DELETE /api/purchase-requests/:id/items/:itemId
   */
  @Delete(":id/items/:itemId")
  @ApiOperation({ summary: "删除明细项", description: "从采购申请删除物料明细项" })
  @ApiParam({ name: "id", description: "采购申请 ID" })
  @ApiParam({ name: "itemId", description: "明细项 ID" })
  @ApiResponse({ status: 200, description: "删除成功", schema: { example: { success: true } } })
  @ApiResponse({ status: 404, description: "采购申请或明细项不存在" })
  @ApiResponse({ status: 409, description: "非草稿状态，不可删除" })
  async removeItem(
    @Param("id") id: string,
    @Param("itemId") itemId: string
  ) {
    await this.prSvc.removeItem(id, itemId);
    return { success: true };
  }
}
