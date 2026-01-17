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
import type { Request as ExpressRequest } from "express";

import {
  PurchaseOrderService,
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderDto,
  ReceiveGoodsDto,
} from "./purchase-order.service";
import { Roles } from "../../common/decorators/roles.decorator";
import { RolesGuard } from "../../common/guards/roles.guard";

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
  async getById(@Param("id") id: string) {
    return this.poSvc.findByIdWithDetails(id);
  }

  /**
   * List purchase orders
   * GET /api/purchase-orders
   */
  @Get()
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
  async update(@Param("id") id: string, @Body() dto: UpdatePurchaseOrderDto) {
    return this.poSvc.update(id, dto);
  }

  /**
   * Submit for approval
   * POST /api/purchase-orders/:id/submit
   */
  @Post(":id/submit")
  @Roles("ADMIN", "MANAGER")
  async submit(@Param("id") id: string) {
    return this.poSvc.submitForApproval(id);
  }

  /**
   * Approve purchase order (admin only)
   * POST /api/purchase-orders/:id/approve
   */
  @Post(":id/approve")
  @Roles("ADMIN")
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
  async sendToSupplier(@Param("id") id: string) {
    return this.poSvc.sendToSupplier(id);
  }

  /**
   * Mark as confirmed by supplier
   * POST /api/purchase-orders/:id/confirm
   */
  @Post(":id/confirm")
  @Roles("ADMIN", "MANAGER")
  async confirm(@Param("id") id: string) {
    return this.poSvc.confirmBySupplier(id);
  }

  /**
   * Receive goods
   * POST /api/purchase-orders/:id/receive
   */
  @Post(":id/receive")
  @Roles("ADMIN", "MANAGER", "STOREKEEPER")
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
  async complete(@Param("id") id: string) {
    return this.poSvc.complete(id);
  }

  /**
   * Cancel purchase order
   * POST /api/purchase-orders/:id/cancel
   */
  @Post(":id/cancel")
  @Roles("ADMIN", "MANAGER")
  async cancel(@Param("id") id: string) {
    return this.poSvc.cancel(id);
  }

  /**
   * Delete purchase order (only DRAFT)
   * DELETE /api/purchase-orders/:id
   */
  @Delete(":id")
  @Roles("ADMIN")
  async delete(@Param("id") id: string) {
    await this.poSvc.delete(id);
    return { success: true };
  }
}
