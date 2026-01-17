/**
 * Warehouse Controller
 *
 * REST API endpoints for warehouse management
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

import { WarehouseService, CreateWarehouseDto, UpdateWarehouseDto } from "./warehouse.service";
import { Roles } from "../../common/decorators/roles.decorator";
import { RolesGuard } from "../../common/guards/roles.guard";

@Controller("warehouses")
@UseGuards(AuthGuard("jwt"), RolesGuard)
export class WarehouseController {
  constructor(
    @Inject(WarehouseService)
    private readonly warehouseSvc: WarehouseService
  ) {}

  /**
   * Get warehouse by ID
   * GET /api/warehouses/:id
   */
  @Get(":id")
  async getById(@Param("id") id: string) {
    return this.warehouseSvc.findById(id);
  }

  /**
   * List all warehouses
   * GET /api/warehouses
   */
  @Get()
  async list(
    @Query("limit") limitStr?: string,
    @Query("offset") offsetStr?: string,
    @Query("status") status?: string,
  ) {
    const limit = limitStr ? parseInt(limitStr, 10) : 50;
    const offset = offsetStr ? parseInt(offsetStr, 10) : 0;
    return this.warehouseSvc.list({ limit, offset, status });
  }

  /**
   * Search warehouses
   * GET /api/warehouses/search/:query
   */
  @Get("search/:query")
  async search(
    @Param("query") query: string,
    @Query("limit") limitStr?: string,
  ) {
    const limit = limitStr ? parseInt(limitStr, 10) : 50;
    return this.warehouseSvc.search(query, limit);
  }

  /**
   * Create new warehouse (admin/manager only)
   * POST /api/warehouses
   */
  @Post()
  @Roles("ADMIN", "MANAGER")
  async create(@Body() dto: CreateWarehouseDto) {
    return this.warehouseSvc.create(dto);
  }

  /**
   * Update warehouse (admin/manager only)
   * PUT /api/warehouses/:id
   */
  @Put(":id")
  @Roles("ADMIN", "MANAGER")
  async update(@Param("id") id: string, @Body() dto: UpdateWarehouseDto) {
    return this.warehouseSvc.update(id, dto);
  }

  /**
   * Delete warehouse (admin only)
   * DELETE /api/warehouses/:id
   */
  @Delete(":id")
  @Roles("ADMIN")
  async delete(@Param("id") id: string) {
    await this.warehouseSvc.delete(id);
    return { success: true };
  }
}
