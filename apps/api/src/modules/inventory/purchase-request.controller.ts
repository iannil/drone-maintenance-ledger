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
import type { Request as ExpressRequest } from "express";

import {
  PurchaseRequestService,
  CreatePurchaseRequestDto,
  UpdatePurchaseRequestDto,
  CreatePurchaseRequestItemDto,
} from "./purchase-request.service";
import { Roles } from "../../common/decorators/roles.decorator";
import { RolesGuard } from "../../common/guards/roles.guard";

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
  async getById(@Param("id") id: string) {
    return this.prSvc.findByIdWithItems(id);
  }

  /**
   * List purchase requests
   * GET /api/purchase-requests
   */
  @Get()
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
  async update(@Param("id") id: string, @Body() dto: UpdatePurchaseRequestDto) {
    return this.prSvc.update(id, dto);
  }

  /**
   * Submit purchase request for approval
   * POST /api/purchase-requests/:id/submit
   */
  @Post(":id/submit")
  async submit(@Param("id") id: string) {
    return this.prSvc.submit(id);
  }

  /**
   * Approve purchase request (manager/admin only)
   * POST /api/purchase-requests/:id/approve
   */
  @Post(":id/approve")
  @Roles("ADMIN", "MANAGER")
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
  async cancel(@Param("id") id: string) {
    return this.prSvc.cancel(id);
  }

  /**
   * Delete purchase request (only DRAFT)
   * DELETE /api/purchase-requests/:id
   */
  @Delete(":id")
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
  async removeItem(
    @Param("id") id: string,
    @Param("itemId") itemId: string
  ) {
    await this.prSvc.removeItem(id, itemId);
    return { success: true };
  }
}
