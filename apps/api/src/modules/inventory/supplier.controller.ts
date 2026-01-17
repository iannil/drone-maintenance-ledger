/**
 * Supplier Controller
 *
 * REST API endpoints for supplier management
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

import { SupplierService, CreateSupplierDto, UpdateSupplierDto } from "./supplier.service";
import { Roles } from "../../common/decorators/roles.decorator";
import { RolesGuard } from "../../common/guards/roles.guard";

@Controller("suppliers")
@UseGuards(AuthGuard("jwt"), RolesGuard)
export class SupplierController {
  constructor(
    @Inject(SupplierService)
    private readonly supplierSvc: SupplierService
  ) {}

  /**
   * Search suppliers
   * GET /api/suppliers/search/:query
   */
  @Get("search/:query")
  async search(
    @Param("query") query: string,
    @Query("limit") limitStr?: string,
  ) {
    const limit = limitStr ? parseInt(limitStr, 10) : 50;
    return this.supplierSvc.search(query, limit);
  }

  /**
   * Get supplier by ID
   * GET /api/suppliers/:id
   */
  @Get(":id")
  async getById(@Param("id") id: string) {
    return this.supplierSvc.findById(id);
  }

  /**
   * List all suppliers
   * GET /api/suppliers
   */
  @Get()
  async list(
    @Query("limit") limitStr?: string,
    @Query("offset") offsetStr?: string,
    @Query("status") status?: string,
    @Query("rating") rating?: string,
  ) {
    const limit = limitStr ? parseInt(limitStr, 10) : 50;
    const offset = offsetStr ? parseInt(offsetStr, 10) : 0;
    return this.supplierSvc.list({ limit, offset, status, rating });
  }

  /**
   * Create new supplier (admin/manager only)
   * POST /api/suppliers
   */
  @Post()
  @Roles("ADMIN", "MANAGER")
  async create(@Body() dto: CreateSupplierDto) {
    return this.supplierSvc.create(dto);
  }

  /**
   * Update supplier (admin/manager only)
   * PUT /api/suppliers/:id
   */
  @Put(":id")
  @Roles("ADMIN", "MANAGER")
  async update(@Param("id") id: string, @Body() dto: UpdateSupplierDto) {
    return this.supplierSvc.update(id, dto);
  }

  /**
   * Delete supplier (admin only)
   * DELETE /api/suppliers/:id
   */
  @Delete(":id")
  @Roles("ADMIN")
  async delete(@Param("id") id: string) {
    await this.supplierSvc.delete(id);
    return { success: true };
  }
}
