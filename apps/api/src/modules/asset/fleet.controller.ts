import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  UseGuards,
  Request,
  Put,
  Delete,
  Query,
  ParseIntPipe,
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
  constructor(private readonly fleetService: FleetService) {}

  /**
   * Get fleet by ID
   */
  @Get(":id")
  async getById(@Param("id") id: string) {
    return this.fleetService.findById(id);
  }

  /**
   * List all fleets
   */
  @Get()
  async list(
    @Query("limit", new ParseIntPipe({ optional: true })) limit = 50,
    @Query("offset", new ParseIntPipe({ optional: true })) offset = 0,
  ) {
    return this.fleetService.list(limit, offset);
  }

  /**
   * Search fleets
   */
  @Get("search/:query")
  async search(@Param("query") query: string, @Query("limit", new ParseIntPipe({ optional: true })) limit = 50) {
    return this.fleetService.search(query, limit);
  }

  /**
   * Create new fleet (admin/manager only)
   */
  @Post()
  @Roles("ADMIN", "MANAGER")
  async create(@Body() dto: CreateFleetDto) {
    return this.fleetService.create(dto);
  }

  /**
   * Update fleet (admin/manager only)
   */
  @Put(":id")
  @Roles("ADMIN", "MANAGER")
  async update(@Param("id") id: string, @Body() dto: UpdateFleetDto) {
    return this.fleetService.update(id, dto);
  }

  /**
   * Delete fleet (admin only)
   */
  @Delete(":id")
  @Roles("ADMIN")
  async delete(@Param("id") id: string) {
    await this.fleetService.delete(id);
    return { success: true };
  }
}
