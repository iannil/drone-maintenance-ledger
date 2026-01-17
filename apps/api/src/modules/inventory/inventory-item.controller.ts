/**
 * Inventory Item Controller
 *
 * REST API endpoints for inventory management
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
  InventoryItemService,
  CreateInventoryItemDto,
  UpdateInventoryItemDto,
  AdjustInventoryDto,
} from "./inventory-item.service";
import { Roles } from "../../common/decorators/roles.decorator";
import { RolesGuard } from "../../common/guards/roles.guard";

// Swagger DTO classes
class CreateInventoryItemSwaggerDto {
  @ApiProperty({ description: "仓库 ID" })
  warehouseId!: string;

  @ApiProperty({ description: "物料号", example: "PN-MOT-001" })
  partNumber!: string;

  @ApiProperty({ description: "物料名称", example: "电机" })
  name!: string;

  @ApiPropertyOptional({ description: "描述" })
  description?: string;

  @ApiPropertyOptional({
    description: "分类",
    enum: ["CONSUMABLE", "EXPENDABLE", "ROTABLE", "REPAIRABLE"],
    example: "ROTABLE",
  })
  category?: string;

  @ApiProperty({ description: "数量", example: 10 })
  quantity!: number;

  @ApiPropertyOptional({ description: "单位", example: "个" })
  unit?: string;

  @ApiPropertyOptional({ description: "最小库存量", example: 5 })
  minQuantity?: number;

  @ApiPropertyOptional({ description: "最大库存量", example: 100 })
  maxQuantity?: number;

  @ApiPropertyOptional({ description: "存放位置", example: "A-01-02" })
  location?: string;

  @ApiPropertyOptional({ description: "批次号" })
  batchNumber?: string;

  @ApiPropertyOptional({ description: "过期时间（时间戳）" })
  expirationDate?: number;

  @ApiPropertyOptional({ description: "单价" })
  unitPrice?: number;
}

class UpdateInventoryItemSwaggerDto {
  @ApiPropertyOptional({ description: "物料名称" })
  name?: string;

  @ApiPropertyOptional({ description: "描述" })
  description?: string;

  @ApiPropertyOptional({
    description: "分类",
    enum: ["CONSUMABLE", "EXPENDABLE", "ROTABLE", "REPAIRABLE"],
  })
  category?: string;

  @ApiPropertyOptional({ description: "单位" })
  unit?: string;

  @ApiPropertyOptional({ description: "最小库存量" })
  minQuantity?: number;

  @ApiPropertyOptional({ description: "最大库存量" })
  maxQuantity?: number;

  @ApiPropertyOptional({ description: "存放位置" })
  location?: string;

  @ApiPropertyOptional({
    description: "状态",
    enum: ["ACTIVE", "INACTIVE", "QUARANTINE"],
  })
  status?: string;
}

class AdjustInventorySwaggerDto {
  @ApiProperty({ description: "调整数量（正数增加，负数减少）", example: -2 })
  quantity!: number;

  @ApiProperty({
    description: "调整原因",
    enum: ["CORRECTION", "DAMAGE", "LOSS", "FOUND", "TRANSFER", "OTHER"],
    example: "CORRECTION",
  })
  reason!: string;

  @ApiPropertyOptional({ description: "备注" })
  notes?: string;
}

class ReserveReleaseSwaggerDto {
  @ApiProperty({ description: "数量", example: 1 })
  quantity!: number;
}

class InventoryItemResponseDto {
  @ApiProperty({ description: "库存项 ID" })
  id!: string;

  @ApiProperty({ description: "仓库 ID" })
  warehouseId!: string;

  @ApiProperty({ description: "物料号" })
  partNumber!: string;

  @ApiProperty({ description: "物料名称" })
  name!: string;

  @ApiProperty({ description: "分类" })
  category!: string;

  @ApiProperty({ description: "数量" })
  quantity!: number;

  @ApiProperty({ description: "预留数量" })
  reservedQuantity!: number;

  @ApiProperty({ description: "可用数量" })
  availableQuantity!: number;

  @ApiProperty({ description: "最小库存量" })
  minQuantity!: number;

  @ApiProperty({ description: "状态" })
  status!: string;
}

class InventoryAlertDto {
  @ApiProperty({ description: "告警类型", enum: ["LOW_STOCK", "EXPIRING"] })
  type!: string;

  @ApiProperty({ description: "库存项 ID" })
  inventoryItemId!: string;

  @ApiProperty({ description: "物料号" })
  partNumber!: string;

  @ApiProperty({ description: "消息" })
  message!: string;
}

@ApiTags("库存 (Inventory)")
@ApiBearerAuth()
@Controller("inventory")
@UseGuards(AuthGuard("jwt"), RolesGuard)
export class InventoryItemController {
  constructor(
    @Inject(InventoryItemService)
    private readonly inventorySvc: InventoryItemService
  ) {}

  /**
   * Get inventory alerts (low stock and expiring)
   * GET /api/inventory/alerts
   */
  @Get("alerts")
  @ApiOperation({ summary: "获取库存告警", description: "获取低库存和即将过期的库存告警" })
  @ApiResponse({ status: 200, description: "获取成功", type: [InventoryAlertDto] })
  async getAlerts() {
    return this.inventorySvc.getAlerts();
  }

  /**
   * Search inventory items
   * GET /api/inventory/search/:query
   */
  @Get("search/:query")
  @ApiOperation({ summary: "搜索库存", description: "按物料号或名称搜索库存项" })
  @ApiParam({ name: "query", description: "搜索关键词" })
  @ApiQuery({ name: "limit", required: false, description: "数量限制", example: 50 })
  @ApiResponse({ status: 200, description: "搜索成功", type: [InventoryItemResponseDto] })
  async search(
    @Param("query") query: string,
    @Query("limit") limitStr?: string,
  ) {
    const limit = limitStr ? parseInt(limitStr, 10) : 50;
    return this.inventorySvc.search(query, limit);
  }

  /**
   * Get inventory item by ID
   * GET /api/inventory/:id
   */
  @Get(":id")
  @ApiOperation({ summary: "获取库存项详情", description: "根据 ID 获取库存项详细信息" })
  @ApiParam({ name: "id", description: "库存项 ID" })
  @ApiResponse({ status: 200, description: "获取成功", type: InventoryItemResponseDto })
  @ApiResponse({ status: 404, description: "库存项不存在" })
  async getById(@Param("id") id: string) {
    return this.inventorySvc.findById(id);
  }

  /**
   * List inventory items
   * GET /api/inventory
   */
  @Get()
  @ApiOperation({ summary: "获取库存列表", description: "获取库存项列表，支持多种筛选条件" })
  @ApiQuery({ name: "limit", required: false, description: "每页数量", example: 50 })
  @ApiQuery({ name: "offset", required: false, description: "偏移量", example: 0 })
  @ApiQuery({ name: "warehouseId", required: false, description: "按仓库筛选" })
  @ApiQuery({ name: "status", required: false, description: "按状态筛选", enum: ["ACTIVE", "INACTIVE", "QUARANTINE"] })
  @ApiQuery({ name: "category", required: false, description: "按分类筛选", enum: ["CONSUMABLE", "EXPENDABLE", "ROTABLE", "REPAIRABLE"] })
  @ApiQuery({ name: "lowStock", required: false, description: "仅显示低库存", enum: ["true", "false"] })
  @ApiResponse({ status: 200, description: "获取成功", type: [InventoryItemResponseDto] })
  async list(
    @Query("limit") limitStr?: string,
    @Query("offset") offsetStr?: string,
    @Query("warehouseId") warehouseId?: string,
    @Query("status") status?: string,
    @Query("category") category?: string,
    @Query("lowStock") lowStockStr?: string,
  ) {
    const limit = limitStr ? parseInt(limitStr, 10) : 50;
    const offset = offsetStr ? parseInt(offsetStr, 10) : 0;
    const lowStock = lowStockStr === "true";
    return this.inventorySvc.list({ limit, offset, warehouseId, status, category, lowStock });
  }

  /**
   * Create new inventory item (admin/manager/storekeeper)
   * POST /api/inventory
   */
  @Post()
  @Roles("ADMIN", "MANAGER", "STOREKEEPER")
  @ApiOperation({ summary: "创建库存项", description: "创建新的库存项（需要 ADMIN、MANAGER 或 STOREKEEPER 角色）" })
  @ApiBody({ type: CreateInventoryItemSwaggerDto })
  @ApiResponse({ status: 201, description: "创建成功", type: InventoryItemResponseDto })
  @ApiResponse({ status: 400, description: "请求参数错误" })
  async create(@Body() dto: CreateInventoryItemDto) {
    return this.inventorySvc.create(dto);
  }

  /**
   * Update inventory item (admin/manager/storekeeper)
   * PUT /api/inventory/:id
   */
  @Put(":id")
  @Roles("ADMIN", "MANAGER", "STOREKEEPER")
  @ApiOperation({ summary: "更新库存项", description: "更新库存项信息（需要 ADMIN、MANAGER 或 STOREKEEPER 角色）" })
  @ApiParam({ name: "id", description: "库存项 ID" })
  @ApiBody({ type: UpdateInventoryItemSwaggerDto })
  @ApiResponse({ status: 200, description: "更新成功", type: InventoryItemResponseDto })
  @ApiResponse({ status: 404, description: "库存项不存在" })
  async update(@Param("id") id: string, @Body() dto: UpdateInventoryItemDto) {
    return this.inventorySvc.update(id, dto);
  }

  /**
   * Adjust inventory quantity (admin/manager/storekeeper)
   * POST /api/inventory/:id/adjust
   */
  @Post(":id/adjust")
  @Roles("ADMIN", "MANAGER", "STOREKEEPER")
  @ApiOperation({ summary: "调整库存数量", description: "调整库存数量（盘点修正、报损等）" })
  @ApiParam({ name: "id", description: "库存项 ID" })
  @ApiBody({ type: AdjustInventorySwaggerDto })
  @ApiResponse({ status: 200, description: "调整成功", type: InventoryItemResponseDto })
  @ApiResponse({ status: 404, description: "库存项不存在" })
  async adjust(@Param("id") id: string, @Body() dto: AdjustInventoryDto) {
    return this.inventorySvc.adjustQuantity(id, dto);
  }

  /**
   * Reserve inventory for work order
   * POST /api/inventory/:id/reserve
   */
  @Post(":id/reserve")
  @Roles("ADMIN", "MANAGER", "MECHANIC")
  @ApiOperation({ summary: "预留库存", description: "为工单预留库存（预留后数量不可被其他工单使用）" })
  @ApiParam({ name: "id", description: "库存项 ID" })
  @ApiBody({ type: ReserveReleaseSwaggerDto })
  @ApiResponse({ status: 200, description: "预留成功", type: InventoryItemResponseDto })
  @ApiResponse({ status: 400, description: "库存不足" })
  @ApiResponse({ status: 404, description: "库存项不存在" })
  async reserve(@Param("id") id: string, @Body() body: { quantity: number }) {
    return this.inventorySvc.reserve(id, body.quantity);
  }

  /**
   * Release reserved inventory
   * POST /api/inventory/:id/release
   */
  @Post(":id/release")
  @Roles("ADMIN", "MANAGER", "MECHANIC")
  @ApiOperation({ summary: "释放预留", description: "释放预留的库存（取消工单或领料失败时调用）" })
  @ApiParam({ name: "id", description: "库存项 ID" })
  @ApiBody({ type: ReserveReleaseSwaggerDto })
  @ApiResponse({ status: 200, description: "释放成功", type: InventoryItemResponseDto })
  @ApiResponse({ status: 400, description: "预留数量不足" })
  @ApiResponse({ status: 404, description: "库存项不存在" })
  async release(@Param("id") id: string, @Body() body: { quantity: number }) {
    return this.inventorySvc.release(id, body.quantity);
  }

  /**
   * Delete inventory item (admin only)
   * DELETE /api/inventory/:id
   */
  @Delete(":id")
  @Roles("ADMIN")
  @ApiOperation({ summary: "删除库存项", description: "删除库存项（需要 ADMIN 角色，有库存余量时不可删除）" })
  @ApiParam({ name: "id", description: "库存项 ID" })
  @ApiResponse({ status: 200, description: "删除成功", schema: { example: { success: true } } })
  @ApiResponse({ status: 404, description: "库存项不存在" })
  @ApiResponse({ status: 409, description: "库存余量不为零，不可删除" })
  async delete(@Param("id") id: string) {
    await this.inventorySvc.delete(id);
    return { success: true };
  }
}
