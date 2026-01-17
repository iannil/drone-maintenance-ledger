/**
 * Inventory Movement Controller
 *
 * REST API endpoints for inventory movement management
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

import {
  InventoryMovementService,
  CreateMovementDto,
  UpdateMovementDto,
} from "./inventory-movement.service";
import { Roles } from "../../common/decorators/roles.decorator";
import { RolesGuard } from "../../common/guards/roles.guard";

// Swagger DTO classes
class CreateMovementSwaggerDto {
  @ApiProperty({ description: "库存项 ID" })
  inventoryItemId!: string;

  @ApiProperty({
    description: "移动类型",
    enum: ["IN", "OUT", "TRANSFER", "ADJUSTMENT", "RETURN"],
    example: "OUT",
  })
  type!: string;

  @ApiProperty({ description: "数量", example: 2 })
  quantity!: number;

  @ApiPropertyOptional({ description: "源仓库 ID" })
  sourceWarehouseId?: string;

  @ApiPropertyOptional({ description: "目标仓库 ID" })
  destinationWarehouseId?: string;

  @ApiPropertyOptional({ description: "关联工单 ID" })
  workOrderId?: string;

  @ApiPropertyOptional({ description: "关联采购订单 ID" })
  purchaseOrderId?: string;

  @ApiPropertyOptional({ description: "原因" })
  reason?: string;

  @ApiPropertyOptional({ description: "备注" })
  notes?: string;
}

class UpdateMovementSwaggerDto {
  @ApiPropertyOptional({ description: "数量" })
  quantity?: number;

  @ApiPropertyOptional({ description: "原因" })
  reason?: string;

  @ApiPropertyOptional({ description: "备注" })
  notes?: string;
}

class MovementResponseDto {
  @ApiProperty({ description: "移动记录 ID" })
  id!: string;

  @ApiProperty({ description: "移动编号" })
  movementNumber!: string;

  @ApiProperty({ description: "库存项 ID" })
  inventoryItemId!: string;

  @ApiProperty({ description: "移动类型" })
  type!: string;

  @ApiProperty({ description: "数量" })
  quantity!: number;

  @ApiProperty({ description: "状态" })
  status!: string;

  @ApiPropertyOptional({ description: "申请人 ID" })
  requestedBy?: string | null;

  @ApiPropertyOptional({ description: "审批人 ID" })
  approvedBy?: string | null;
}

class MovementStatsDto {
  @ApiProperty({ description: "入库总数" })
  totalIn!: number;

  @ApiProperty({ description: "出库总数" })
  totalOut!: number;

  @ApiProperty({ description: "调拨总数" })
  totalTransfer!: number;

  @ApiProperty({ description: "调整总数" })
  totalAdjustment!: number;
}

@ApiTags("库存移动 (Inventory Movement)")
@ApiBearerAuth()
@Controller("inventory/movements")
@UseGuards(AuthGuard("jwt"), RolesGuard)
export class InventoryMovementController {
  constructor(
    @Inject(InventoryMovementService)
    private readonly movementSvc: InventoryMovementService
  ) {}

  /**
   * Get pending movements
   * GET /api/inventory/movements/pending
   */
  @Get("pending")
  @ApiOperation({ summary: "获取待处理移动", description: "获取所有待审批/待完成的库存移动记录" })
  @ApiResponse({ status: 200, description: "获取成功", type: [MovementResponseDto] })
  async getPending() {
    return this.movementSvc.getPending();
  }

  /**
   * Get movement statistics
   * GET /api/inventory/movements/stats
   */
  @Get("stats")
  @ApiOperation({ summary: "获取移动统计", description: "获取库存移动统计数据" })
  @ApiQuery({ name: "startDate", required: false, description: "开始日期（时间戳）" })
  @ApiQuery({ name: "endDate", required: false, description: "结束日期（时间戳）" })
  @ApiQuery({ name: "warehouseId", required: false, description: "按仓库筛选" })
  @ApiResponse({ status: 200, description: "获取成功", type: MovementStatsDto })
  async getStats(
    @Query("startDate") startDateStr?: string,
    @Query("endDate") endDateStr?: string,
    @Query("warehouseId") warehouseId?: string
  ) {
    const startDate = startDateStr ? parseInt(startDateStr, 10) : undefined;
    const endDate = endDateStr ? parseInt(endDateStr, 10) : undefined;
    return this.movementSvc.getStats({ startDate, endDate, warehouseId });
  }

  /**
   * Search movements
   * GET /api/inventory/movements/search/:query
   */
  @Get("search/:query")
  @ApiOperation({ summary: "搜索移动记录", description: "按移动编号或物料号搜索" })
  @ApiParam({ name: "query", description: "搜索关键词" })
  @ApiQuery({ name: "limit", required: false, description: "数量限制", example: 50 })
  @ApiResponse({ status: 200, description: "搜索成功", type: [MovementResponseDto] })
  async search(
    @Param("query") query: string,
    @Query("limit") limitStr?: string
  ) {
    const limit = limitStr ? parseInt(limitStr, 10) : 50;
    return this.movementSvc.search(query, limit);
  }

  /**
   * Get movements for an inventory item
   * GET /api/inventory/movements/item/:inventoryItemId
   */
  @Get("item/:inventoryItemId")
  @ApiOperation({ summary: "获取库存项移动历史", description: "获取指定库存项的所有移动记录" })
  @ApiParam({ name: "inventoryItemId", description: "库存项 ID" })
  @ApiResponse({ status: 200, description: "获取成功", type: [MovementResponseDto] })
  async getByInventoryItem(@Param("inventoryItemId") inventoryItemId: string) {
    return this.movementSvc.getByInventoryItem(inventoryItemId);
  }

  /**
   * Get movement by ID
   * GET /api/inventory/movements/:id
   */
  @Get(":id")
  @ApiOperation({ summary: "获取移动记录详情", description: "根据 ID 获取库存移动记录详情" })
  @ApiParam({ name: "id", description: "移动记录 ID" })
  @ApiResponse({ status: 200, description: "获取成功", type: MovementResponseDto })
  @ApiResponse({ status: 404, description: "移动记录不存在" })
  async getById(@Param("id") id: string) {
    return this.movementSvc.findById(id);
  }

  /**
   * List movements
   * GET /api/inventory/movements
   */
  @Get()
  @ApiOperation({ summary: "获取移动记录列表", description: "获取库存移动记录列表，支持多种筛选条件" })
  @ApiQuery({ name: "limit", required: false, description: "每页数量", example: 50 })
  @ApiQuery({ name: "offset", required: false, description: "偏移量", example: 0 })
  @ApiQuery({ name: "type", required: false, description: "按类型筛选", enum: ["IN", "OUT", "TRANSFER", "ADJUSTMENT", "RETURN"] })
  @ApiQuery({ name: "status", required: false, description: "按状态筛选", enum: ["PENDING", "APPROVED", "COMPLETED", "CANCELLED"] })
  @ApiQuery({ name: "warehouseId", required: false, description: "按仓库筛选" })
  @ApiQuery({ name: "inventoryItemId", required: false, description: "按库存项筛选" })
  @ApiQuery({ name: "startDate", required: false, description: "开始日期（时间戳）" })
  @ApiQuery({ name: "endDate", required: false, description: "结束日期（时间戳）" })
  @ApiResponse({ status: 200, description: "获取成功", type: [MovementResponseDto] })
  async list(
    @Query("limit") limitStr?: string,
    @Query("offset") offsetStr?: string,
    @Query("type") type?: string,
    @Query("status") status?: string,
    @Query("warehouseId") warehouseId?: string,
    @Query("inventoryItemId") inventoryItemId?: string,
    @Query("startDate") startDateStr?: string,
    @Query("endDate") endDateStr?: string
  ) {
    const limit = limitStr ? parseInt(limitStr, 10) : 50;
    const offset = offsetStr ? parseInt(offsetStr, 10) : 0;
    const startDate = startDateStr ? parseInt(startDateStr, 10) : undefined;
    const endDate = endDateStr ? parseInt(endDateStr, 10) : undefined;
    return this.movementSvc.list({
      limit,
      offset,
      type,
      status,
      warehouseId,
      inventoryItemId,
      startDate,
      endDate,
    });
  }

  /**
   * Create new movement (admin/manager/storekeeper)
   * POST /api/inventory/movements
   */
  @Post()
  @Roles("ADMIN", "MANAGER", "STOREKEEPER")
  @ApiOperation({ summary: "创建移动记录", description: "创建新的库存移动记录（需要 ADMIN、MANAGER 或 STOREKEEPER 角色）" })
  @ApiBody({ type: CreateMovementSwaggerDto })
  @ApiResponse({ status: 201, description: "创建成功", type: MovementResponseDto })
  @ApiResponse({ status: 400, description: "请求参数错误" })
  @ApiResponse({ status: 404, description: "库存项不存在" })
  async create(@Body() dto: CreateMovementDto, @Request() req: any) {
    return this.movementSvc.create({
      ...dto,
      requestedBy: req.user?.id,
    });
  }

  /**
   * Update movement (admin/manager/storekeeper)
   * PUT /api/inventory/movements/:id
   */
  @Put(":id")
  @Roles("ADMIN", "MANAGER", "STOREKEEPER")
  @ApiOperation({ summary: "更新移动记录", description: "更新库存移动记录（仅限 PENDING 状态）" })
  @ApiParam({ name: "id", description: "移动记录 ID" })
  @ApiBody({ type: UpdateMovementSwaggerDto })
  @ApiResponse({ status: 200, description: "更新成功", type: MovementResponseDto })
  @ApiResponse({ status: 404, description: "移动记录不存在" })
  @ApiResponse({ status: 409, description: "非待处理状态，不可修改" })
  async update(@Param("id") id: string, @Body() dto: UpdateMovementDto) {
    return this.movementSvc.update(id, dto);
  }

  /**
   * Approve movement (admin/manager)
   * POST /api/inventory/movements/:id/approve
   */
  @Post(":id/approve")
  @Roles("ADMIN", "MANAGER")
  @ApiOperation({ summary: "审批移动", description: "审批库存移动记录（需要 ADMIN 或 MANAGER 角色）" })
  @ApiParam({ name: "id", description: "移动记录 ID" })
  @ApiResponse({ status: 200, description: "审批成功", type: MovementResponseDto })
  @ApiResponse({ status: 404, description: "移动记录不存在" })
  @ApiResponse({ status: 409, description: "状态不正确，无法审批" })
  async approve(@Param("id") id: string, @Request() req: any) {
    return this.movementSvc.approve(id, { approvedBy: req.user?.id });
  }

  /**
   * Complete movement (admin/manager/storekeeper)
   * POST /api/inventory/movements/:id/complete
   */
  @Post(":id/complete")
  @Roles("ADMIN", "MANAGER", "STOREKEEPER")
  @ApiOperation({ summary: "完成移动", description: "完成库存移动（实际执行库存变更）" })
  @ApiParam({ name: "id", description: "移动记录 ID" })
  @ApiResponse({ status: 200, description: "完成成功", type: MovementResponseDto })
  @ApiResponse({ status: 404, description: "移动记录不存在" })
  @ApiResponse({ status: 409, description: "状态不正确，无法完成" })
  async complete(@Param("id") id: string) {
    return this.movementSvc.complete(id);
  }

  /**
   * Cancel movement (admin/manager/storekeeper)
   * POST /api/inventory/movements/:id/cancel
   */
  @Post(":id/cancel")
  @Roles("ADMIN", "MANAGER", "STOREKEEPER")
  @ApiOperation({ summary: "取消移动", description: "取消库存移动记录" })
  @ApiParam({ name: "id", description: "移动记录 ID" })
  @ApiResponse({ status: 200, description: "取消成功", type: MovementResponseDto })
  @ApiResponse({ status: 404, description: "移动记录不存在" })
  @ApiResponse({ status: 409, description: "已完成的记录不可取消" })
  async cancel(@Param("id") id: string) {
    return this.movementSvc.cancel(id);
  }

  /**
   * Delete movement (admin only)
   * DELETE /api/inventory/movements/:id
   */
  @Delete(":id")
  @Roles("ADMIN")
  @ApiOperation({ summary: "删除移动记录", description: "删除库存移动记录（仅限 PENDING 状态，需要 ADMIN 角色）" })
  @ApiParam({ name: "id", description: "移动记录 ID" })
  @ApiResponse({ status: 200, description: "删除成功", schema: { example: { success: true } } })
  @ApiResponse({ status: 404, description: "移动记录不存在" })
  @ApiResponse({ status: 409, description: "非待处理状态，不可删除" })
  async delete(@Param("id") id: string) {
    await this.movementSvc.delete(id);
    return { success: true };
  }
}
