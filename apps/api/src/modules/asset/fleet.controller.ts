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

import { FleetService, CreateFleetDto, UpdateFleetDto } from "./fleet.service";
import { Roles } from "../../common/decorators/roles.decorator";
import { RolesGuard } from "../../common/guards/roles.guard";

/**
 * Fleet controller
 *
 * Handles fleet CRUD operations
 */
@Controller("fleets")
@UseGuards(AuthGuard("jwt"), RolesGuard)
export class FleetController {
  private fleetSvc: FleetService;

  constructor(@Inject(FleetService) fleetService: FleetService) {
    this.fleetSvc = fleetService;
  }

  /**
   * Get fleet by ID
   */
  @Get(":id")
  async getById(@Param("id") id: string) {
    return this.fleetSvc.findById(id);
  }

  /**
   * List all fleets
   */
  @Get()
  async list(
    @Query("limit") limitStr?: string,
    @Query("offset") offsetStr?: string,
  ) {
    const limit = limitStr ? parseInt(limitStr, 10) : 50;
    const offset = offsetStr ? parseInt(offsetStr, 10) : 0;
    return this.fleetSvc.list(limit, offset);
  }

  /**
   * Search fleets
   */
  @Get("search/:query")
  async search(@Param("query") query: string, @Query("limit") limitStr?: string) {
    const limit = limitStr ? parseInt(limitStr, 10) : 50;
    return this.fleetSvc.search(query, limit);
  }

  /**
   * Create new fleet (admin/manager only)
   */
  @Post()
  @Roles("ADMIN", "MANAGER")
  async create(@Body() dto: CreateFleetDto) {
    return this.fleetSvc.create(dto);
  }

  /**
   * Update fleet (admin/manager only)
   */
  @Put(":id")
  @Roles("ADMIN", "MANAGER")
  async update(@Param("id") id: string, @Body() dto: UpdateFleetDto) {
    return this.fleetSvc.update(id, dto);
  }

  /**
   * Delete fleet (admin only)
   */
  @Delete(":id")
  @Roles("ADMIN")
  async delete(@Param("id") id: string) {
    await this.fleetSvc.delete(id);
    return { success: true };
  }
}
