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
  InventoryItemService,
  CreateInventoryItemDto,
  UpdateInventoryItemDto,
  AdjustInventoryDto,
} from "./inventory-item.service";
import { Roles } from "../../common/decorators/roles.decorator";
import { RolesGuard } from "../../common/guards/roles.guard";

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
  async getAlerts() {
    return this.inventorySvc.getAlerts();
  }

  /**
   * Search inventory items
   * GET /api/inventory/search/:query
   */
  @Get("search/:query")
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
  async getById(@Param("id") id: string) {
    return this.inventorySvc.findById(id);
  }

  /**
   * List inventory items
   * GET /api/inventory
   */
  @Get()
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
  async create(@Body() dto: CreateInventoryItemDto) {
    return this.inventorySvc.create(dto);
  }

  /**
   * Update inventory item (admin/manager/storekeeper)
   * PUT /api/inventory/:id
   */
  @Put(":id")
  @Roles("ADMIN", "MANAGER", "STOREKEEPER")
  async update(@Param("id") id: string, @Body() dto: UpdateInventoryItemDto) {
    return this.inventorySvc.update(id, dto);
  }

  /**
   * Adjust inventory quantity (admin/manager/storekeeper)
   * POST /api/inventory/:id/adjust
   */
  @Post(":id/adjust")
  @Roles("ADMIN", "MANAGER", "STOREKEEPER")
  async adjust(@Param("id") id: string, @Body() dto: AdjustInventoryDto) {
    return this.inventorySvc.adjustQuantity(id, dto);
  }

  /**
   * Reserve inventory for work order
   * POST /api/inventory/:id/reserve
   */
  @Post(":id/reserve")
  @Roles("ADMIN", "MANAGER", "MECHANIC")
  async reserve(@Param("id") id: string, @Body() body: { quantity: number }) {
    return this.inventorySvc.reserve(id, body.quantity);
  }

  /**
   * Release reserved inventory
   * POST /api/inventory/:id/release
   */
  @Post(":id/release")
  @Roles("ADMIN", "MANAGER", "MECHANIC")
  async release(@Param("id") id: string, @Body() body: { quantity: number }) {
    return this.inventorySvc.release(id, body.quantity);
  }

  /**
   * Delete inventory item (admin only)
   * DELETE /api/inventory/:id
   */
  @Delete(":id")
  @Roles("ADMIN")
  async delete(@Param("id") id: string) {
    await this.inventorySvc.delete(id);
    return { success: true };
  }
}
