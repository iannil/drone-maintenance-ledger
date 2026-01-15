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
  ParseIntPipe,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import { AircraftService, CreateAircraftDto, UpdateAircraftDto } from "./aircraft.service";
import { Roles } from "../../common/decorators/roles.decorator";
import { RolesGuard } from "../../common/guards/roles.guard";

/**
 * Aircraft controller
 *
 * Handles aircraft CRUD operations
 */
@Controller("aircraft")
@UseGuards(AuthGuard("jwt"), RolesGuard)
export class AircraftController {
  constructor(private readonly aircraftService: AircraftService) {}

  /**
   * Get aircraft by ID
   */
  @Get(":id")
  async getById(@Param("id") id: string) {
    return this.aircraftService.findById(id);
  }

  /**
   * List all aircraft
   */
  @Get()
  async list(
    @Query("limit", new ParseIntPipe({ optional: true })) limit = 50,
    @Query("offset", new ParseIntPipe({ optional: true })) offset = 0,
    @Query("fleetId") fleetId?: string,
  ) {
    if (fleetId) {
      return this.aircraftService.findByFleet(fleetId, limit, offset);
    }
    return this.aircraftService.list(limit, offset);
  }

  /**
   * Get status counts
   */
  @Get("status/counts")
  async getStatusCounts(@Query("fleetId") fleetId?: string) {
    return this.aircraftService.getStatusCounts(fleetId);
  }

  /**
   * Create new aircraft
   */
  @Post()
  @Roles("ADMIN", "MANAGER")
  async create(@Body() dto: CreateAircraftDto) {
    return this.aircraftService.create(dto);
  }

  /**
   * Update aircraft
   */
  @Put(":id")
  @Roles("ADMIN", "MANAGER")
  async update(@Param("id") id: string, @Body() dto: UpdateAircraftDto) {
    return this.aircraftService.update(id, dto);
  }

  /**
   * Update aircraft status
   */
  @Put(":id/status")
  @Roles("ADMIN", "MANAGER", "INSPECTOR")
  async updateStatus(
    @Param("id") id: string,
    @Body() body: { status: Aircraft["status"]; isAirworthy?: boolean },
  ) {
    return this.aircraftService.updateStatus(id, body.status, body.isAirworthy);
  }

  /**
   * Delete aircraft
   */
  @Delete(":id")
  @Roles("ADMIN")
  async delete(@Param("id") id: string) {
    await this.aircraftService.delete(id);
    return { success: true };
  }
}
