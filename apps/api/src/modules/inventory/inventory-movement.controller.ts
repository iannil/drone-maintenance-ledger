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
  InventoryMovementService,
  CreateMovementDto,
  UpdateMovementDto,
} from "./inventory-movement.service";
import { Roles } from "../../common/decorators/roles.decorator";
import { RolesGuard } from "../../common/guards/roles.guard";

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
  async getPending() {
    return this.movementSvc.getPending();
  }

  /**
   * Get movement statistics
   * GET /api/inventory/movements/stats
   */
  @Get("stats")
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
  async getByInventoryItem(@Param("inventoryItemId") inventoryItemId: string) {
    return this.movementSvc.getByInventoryItem(inventoryItemId);
  }

  /**
   * Get movement by ID
   * GET /api/inventory/movements/:id
   */
  @Get(":id")
  async getById(@Param("id") id: string) {
    return this.movementSvc.findById(id);
  }

  /**
   * List movements
   * GET /api/inventory/movements
   */
  @Get()
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
  async update(@Param("id") id: string, @Body() dto: UpdateMovementDto) {
    return this.movementSvc.update(id, dto);
  }

  /**
   * Approve movement (admin/manager)
   * POST /api/inventory/movements/:id/approve
   */
  @Post(":id/approve")
  @Roles("ADMIN", "MANAGER")
  async approve(@Param("id") id: string, @Request() req: any) {
    return this.movementSvc.approve(id, { approvedBy: req.user?.id });
  }

  /**
   * Complete movement (admin/manager/storekeeper)
   * POST /api/inventory/movements/:id/complete
   */
  @Post(":id/complete")
  @Roles("ADMIN", "MANAGER", "STOREKEEPER")
  async complete(@Param("id") id: string) {
    return this.movementSvc.complete(id);
  }

  /**
   * Cancel movement (admin/manager/storekeeper)
   * POST /api/inventory/movements/:id/cancel
   */
  @Post(":id/cancel")
  @Roles("ADMIN", "MANAGER", "STOREKEEPER")
  async cancel(@Param("id") id: string) {
    return this.movementSvc.cancel(id);
  }

  /**
   * Delete movement (admin only)
   * DELETE /api/inventory/movements/:id
   */
  @Delete(":id")
  @Roles("ADMIN")
  async delete(@Param("id") id: string) {
    await this.movementSvc.delete(id);
    return { success: true };
  }
}
