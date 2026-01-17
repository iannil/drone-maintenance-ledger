/**
 * Purchase Order Controller
 *
 * REST API endpoints for purchase order management
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
  PurchaseOrderService,
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderDto,
  ReceiveGoodsDto,
} from "./purchase-order.service";
import { Roles } from "../../common/decorators/roles.decorator";
import { RolesGuard } from "../../common/guards/roles.guard";

// Swagger DTO classes
class CreatePurchaseOrderItemSwaggerDto {
  @ApiProperty({ description: "物料号", example: "PN-MOT-001" })
  partNumber!: string;

  @ApiProperty({ description: "物料名称", example: "电机" })
  partName!: string;

  @ApiProperty({ description: "数量", example: 5 })
  quantity!: number;

  @ApiPropertyOptional({ description: "单位", default: "个" })
  unit?: string;

  @ApiProperty({ description: "单价", example: 1500 })
  unitPrice!: number;

  @ApiPropertyOptional({ description: "备注" })
  notes?: string;
}

class CreatePurchaseOrderSwaggerDto {
  @ApiProperty({ description: "供应商 ID" })
  supplierId!: string;

  @ApiPropertyOptional({ description: "关联采购申请 ID" })
  purchaseRequestId?: string;

  @ApiPropertyOptional({ description: "期望交付日期（时间戳）" })
  expectedDeliveryDate?: number;

  @ApiPropertyOptional({ description: "收货仓库 ID" })
  deliveryWarehouseId?: string;

  @ApiPropertyOptional({ description: "收货地址" })
  deliveryAddress?: string;

  @ApiPropertyOptional({ description: "付款条款" })
  paymentTerms?: string;

  @ApiPropertyOptional({ description: "备注" })
  notes?: string;

  @ApiPropertyOptional({ description: "订单明细项", type: [CreatePurchaseOrderItemSwaggerDto] })
  items?: CreatePurchaseOrderItemSwaggerDto[];
}

class UpdatePurchaseOrderSwaggerDto {
  @ApiPropertyOptional({ description: "期望交付日期（时间戳）" })
  expectedDeliveryDate?: number;

  @ApiPropertyOptional({ description: "收货仓库 ID" })
  deliveryWarehouseId?: string;

  @ApiPropertyOptional({ description: "收货地址" })
  deliveryAddress?: string;

  @ApiPropertyOptional({ description: "付款条款" })
  paymentTerms?: string;

  @ApiPropertyOptional({ description: "备注" })
  notes?: string;
}

class ReceiveGoodsItemSwaggerDto {
  @ApiProperty({ description: "订单明细项 ID" })
  orderItemId!: string;

  @ApiProperty({ description: "收货数量", example: 5 })
  receivedQuantity!: number;

  @ApiPropertyOptional({ description: "批次号" })
  batchNumber?: string;

  @ApiPropertyOptional({ description: "备注" })
  notes?: string;
}

class ReceiveGoodsSwaggerDto {
  @ApiPropertyOptional({ description: "收货人 ID（默认为当前用户）" })
  receivedBy?: string;

  @ApiPropertyOptional({ description: "收货备注" })
  notes?: string;

  @ApiProperty({ description: "收货明细", type: [ReceiveGoodsItemSwaggerDto] })
  items!: ReceiveGoodsItemSwaggerDto[];
}

class PurchaseOrderResponseDto {
  @ApiProperty({ description: "采购订单 ID" })
  id!: string;

  @ApiProperty({ description: "订单编号" })
  orderNumber!: string;

  @ApiProperty({ description: "供应商 ID" })
  supplierId!: string;

  @ApiProperty({ description: "状态" })
  status!: string;

  @ApiProperty({ description: "总金额" })
  totalAmount!: number;

  @ApiPropertyOptional({ description: "期望交付日期" })
  expectedDeliveryDate?: number | null;

  @ApiPropertyOptional({ description: "创建人 ID" })
  createdBy?: string | null;

  @ApiPropertyOptional({ description: "审批人 ID" })
  approvedBy?: string | null;
}

@ApiTags("采购订单 (Purchase Order)")
@ApiBearerAuth()
@Controller("purchase-orders")
@UseGuards(AuthGuard("jwt"), RolesGuard)
export class PurchaseOrderController {
  constructor(
    @Inject(PurchaseOrderService)
    private readonly poSvc: PurchaseOrderService
  ) {}

  /**
   * Get purchase order by ID with details
   * GET /api/purchase-orders/:id
   */
  @Get(":id")
  @ApiOperation({ summary: "获取采购订单详情", description: "根据 ID 获取采购订单详细信息（含明细项）" })
  @ApiParam({ name: "id", description: "采购订单 ID" })
  @ApiResponse({ status: 200, description: "获取成功", type: PurchaseOrderResponseDto })
  @ApiResponse({ status: 404, description: "采购订单不存在" })
  async getById(@Param("id") id: string) {
    return this.poSvc.findByIdWithDetails(id);
  }

  /**
   * List purchase orders
   * GET /api/purchase-orders
   */
  @Get()
  @ApiOperation({ summary: "获取采购订单列表", description: "获取采购订单列表，支持多种筛选条件" })
  @ApiQuery({ name: "limit", required: false, description: "每页数量", example: 50 })
  @ApiQuery({ name: "offset", required: false, description: "偏移量", example: 0 })
  @ApiQuery({ name: "status", required: false, description: "按状态筛选", enum: ["DRAFT", "PENDING_APPROVAL", "APPROVED", "SENT", "CONFIRMED", "PARTIAL_RECEIVED", "RECEIVED", "COMPLETED", "CANCELLED"] })
  @ApiQuery({ name: "supplierId", required: false, description: "按供应商筛选" })
  @ApiResponse({ status: 200, description: "获取成功", type: [PurchaseOrderResponseDto] })
  async list(
    @Query("limit") limitStr?: string,
    @Query("offset") offsetStr?: string,
    @Query("status") status?: string,
    @Query("supplierId") supplierId?: string,
  ) {
    const limit = limitStr ? parseInt(limitStr, 10) : 50;
    const offset = offsetStr ? parseInt(offsetStr, 10) : 0;
    return this.poSvc.list({ limit, offset, status, supplierId });
  }

  /**
   * Create new purchase order (manager/admin only)
   * POST /api/purchase-orders
   */
  @Post()
  @Roles("ADMIN", "MANAGER")
  @ApiOperation({ summary: "创建采购订单", description: "创建新的采购订单（需要 ADMIN 或 MANAGER 角色）" })
  @ApiBody({ type: CreatePurchaseOrderSwaggerDto })
  @ApiResponse({ status: 201, description: "创建成功", type: PurchaseOrderResponseDto })
  @ApiResponse({ status: 400, description: "请求参数错误" })
  async create(
    @Body() dto: CreatePurchaseOrderDto,
    @Request() req: ExpressRequest & { user?: { id: string } }
  ) {
    return this.poSvc.create(dto, req.user?.id);
  }

  /**
   * Update purchase order
   * PUT /api/purchase-orders/:id
   */
  @Put(":id")
  @Roles("ADMIN", "MANAGER")
  @ApiOperation({ summary: "更新采购订单", description: "更新采购订单信息（仅限 DRAFT 状态）" })
  @ApiParam({ name: "id", description: "采购订单 ID" })
  @ApiBody({ type: UpdatePurchaseOrderSwaggerDto })
  @ApiResponse({ status: 200, description: "更新成功", type: PurchaseOrderResponseDto })
  @ApiResponse({ status: 404, description: "采购订单不存在" })
  @ApiResponse({ status: 409, description: "非草稿状态，不可修改" })
  async update(@Param("id") id: string, @Body() dto: UpdatePurchaseOrderDto) {
    return this.poSvc.update(id, dto);
  }

  /**
   * Submit for approval
   * POST /api/purchase-orders/:id/submit
   */
  @Post(":id/submit")
  @Roles("ADMIN", "MANAGER")
  @ApiOperation({ summary: "提交审批", description: "提交采购订单等待审批" })
  @ApiParam({ name: "id", description: "采购订单 ID" })
  @ApiResponse({ status: 200, description: "提交成功", type: PurchaseOrderResponseDto })
  @ApiResponse({ status: 404, description: "采购订单不存在" })
  @ApiResponse({ status: 409, description: "状态不正确，无法提交" })
  async submit(@Param("id") id: string) {
    return this.poSvc.submitForApproval(id);
  }

  /**
   * Approve purchase order (admin only)
   * POST /api/purchase-orders/:id/approve
   */
  @Post(":id/approve")
  @Roles("ADMIN")
  @ApiOperation({ summary: "审批通过", description: "审批通过采购订单（需要 ADMIN 角色）" })
  @ApiParam({ name: "id", description: "采购订单 ID" })
  @ApiResponse({ status: 200, description: "审批成功", type: PurchaseOrderResponseDto })
  @ApiResponse({ status: 404, description: "采购订单不存在" })
  @ApiResponse({ status: 409, description: "状态不正确，无法审批" })
  async approve(
    @Param("id") id: string,
    @Request() req: ExpressRequest & { user?: { id: string } }
  ) {
    return this.poSvc.approve(id, req.user!.id);
  }

  /**
   * Send to supplier
   * POST /api/purchase-orders/:id/send
   */
  @Post(":id/send")
  @Roles("ADMIN", "MANAGER")
  @ApiOperation({ summary: "发送给供应商", description: "将采购订单发送给供应商" })
  @ApiParam({ name: "id", description: "采购订单 ID" })
  @ApiResponse({ status: 200, description: "发送成功", type: PurchaseOrderResponseDto })
  @ApiResponse({ status: 404, description: "采购订单不存在" })
  @ApiResponse({ status: 409, description: "状态不正确，无法发送" })
  async sendToSupplier(@Param("id") id: string) {
    return this.poSvc.sendToSupplier(id);
  }

  /**
   * Mark as confirmed by supplier
   * POST /api/purchase-orders/:id/confirm
   */
  @Post(":id/confirm")
  @Roles("ADMIN", "MANAGER")
  @ApiOperation({ summary: "供应商确认", description: "标记采购订单已被供应商确认" })
  @ApiParam({ name: "id", description: "采购订单 ID" })
  @ApiResponse({ status: 200, description: "确认成功", type: PurchaseOrderResponseDto })
  @ApiResponse({ status: 404, description: "采购订单不存在" })
  @ApiResponse({ status: 409, description: "状态不正确，无法确认" })
  async confirm(@Param("id") id: string) {
    return this.poSvc.confirmBySupplier(id);
  }

  /**
   * Receive goods
   * POST /api/purchase-orders/:id/receive
   */
  @Post(":id/receive")
  @Roles("ADMIN", "MANAGER", "STOREKEEPER")
  @ApiOperation({ summary: "收货", description: "记录采购订单收货（可部分收货）" })
  @ApiParam({ name: "id", description: "采购订单 ID" })
  @ApiBody({ type: ReceiveGoodsSwaggerDto })
  @ApiResponse({ status: 200, description: "收货成功", type: PurchaseOrderResponseDto })
  @ApiResponse({ status: 404, description: "采购订单不存在" })
  @ApiResponse({ status: 409, description: "状态不正确，无法收货" })
  async receiveGoods(
    @Param("id") id: string,
    @Body() dto: ReceiveGoodsDto,
    @Request() req: ExpressRequest & { user?: { id: string } }
  ) {
    if (!dto.receivedBy && req.user) {
      dto.receivedBy = req.user.id;
    }
    return this.poSvc.receiveGoods(id, dto);
  }

  /**
   * Complete purchase order
   * POST /api/purchase-orders/:id/complete
   */
  @Post(":id/complete")
  @Roles("ADMIN", "MANAGER")
  @ApiOperation({ summary: "完成订单", description: "标记采购订单为已完成" })
  @ApiParam({ name: "id", description: "采购订单 ID" })
  @ApiResponse({ status: 200, description: "完成成功", type: PurchaseOrderResponseDto })
  @ApiResponse({ status: 404, description: "采购订单不存在" })
  @ApiResponse({ status: 409, description: "状态不正确，无法完成" })
  async complete(@Param("id") id: string) {
    return this.poSvc.complete(id);
  }

  /**
   * Cancel purchase order
   * POST /api/purchase-orders/:id/cancel
   */
  @Post(":id/cancel")
  @Roles("ADMIN", "MANAGER")
  @ApiOperation({ summary: "取消订单", description: "取消采购订单（已发货的订单不可取消）" })
  @ApiParam({ name: "id", description: "采购订单 ID" })
  @ApiResponse({ status: 200, description: "取消成功", type: PurchaseOrderResponseDto })
  @ApiResponse({ status: 404, description: "采购订单不存在" })
  @ApiResponse({ status: 409, description: "状态不正确，无法取消" })
  async cancel(@Param("id") id: string) {
    return this.poSvc.cancel(id);
  }

  /**
   * Delete purchase order (only DRAFT)
   * DELETE /api/purchase-orders/:id
   */
  @Delete(":id")
  @Roles("ADMIN")
  @ApiOperation({ summary: "删除采购订单", description: "删除采购订单（仅限 DRAFT 状态，需要 ADMIN 角色）" })
  @ApiParam({ name: "id", description: "采购订单 ID" })
  @ApiResponse({ status: 200, description: "删除成功", schema: { example: { success: true } } })
  @ApiResponse({ status: 404, description: "采购订单不存在" })
  @ApiResponse({ status: 409, description: "非草稿状态，不可删除" })
  async delete(@Param("id") id: string) {
    await this.poSvc.delete(id);
    return { success: true };
  }
}
