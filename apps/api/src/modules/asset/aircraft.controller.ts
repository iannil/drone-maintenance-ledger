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

import { AircraftService, CreateAircraftDto, UpdateAircraftDto } from "./aircraft.service";
import { Roles } from "../../common/decorators/roles.decorator";
import { RolesGuard } from "../../common/guards/roles.guard";
import type { Aircraft } from "@repo/db";

/**
 * Aircraft controller
 *
 * Handles aircraft CRUD operations
 */
@Controller("aircraft")
@UseGuards(AuthGuard("jwt"), RolesGuard)
export class AircraftController {
  private aircraftSvc: AircraftService;

  constructor(@Inject(AircraftService) aircraftService: AircraftService) {
    this.aircraftSvc = aircraftService;
  }

  /**
   * Get aircraft by ID
   */
  @Get(":id")
  async getById(@Param("id") id: string) {
    return this.aircraftSvc.findById(id);
  }

  /**
   * List all aircraft
   */
  @Get()
  async list(
    @Query("limit") limitStr?: string,
    @Query("offset") offsetStr?: string,
    @Query("fleetId") fleetId?: string,
  ) {
    const limit = limitStr ? parseInt(limitStr, 10) : 50;
    const offset = offsetStr ? parseInt(offsetStr, 10) : 0;
    if (fleetId) {
      return this.aircraftSvc.findByFleet(fleetId, limit, offset);
    }
    return this.aircraftSvc.list(limit, offset);
  }

  /**
   * Get status counts
   */
  @Get("status/counts")
  async getStatusCounts(@Query("fleetId") fleetId?: string) {
    return this.aircraftSvc.getStatusCounts(fleetId);
  }

  /**
   * Create new aircraft
   */
  @Post()
  @Roles("ADMIN", "MANAGER")
  async create(@Body() dto: CreateAircraftDto) {
    return this.aircraftSvc.create(dto);
  }

  /**
   * Update aircraft
   */
  @Put(":id")
  @Roles("ADMIN", "MANAGER")
  async update(@Param("id") id: string, @Body() dto: UpdateAircraftDto) {
    return this.aircraftSvc.update(id, dto);
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
    return this.aircraftSvc.updateStatus(id, body.status, body.isAirworthy);
  }

  /**
   * Delete aircraft
   */
  @Delete(":id")
  @Roles("ADMIN")
  async delete(@Param("id") id: string) {
    await this.aircraftSvc.delete(id);
    return { success: true };
  }
}
