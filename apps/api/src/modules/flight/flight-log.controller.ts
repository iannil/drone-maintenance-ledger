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
  BadRequestException,
  Inject,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import {
  FlightLogService,
  CreateFlightLogDto,
  UpdateFlightLogDto,
} from "./flight-log.service";
import { Roles } from "../../common/decorators/roles.decorator";
import { RolesGuard } from "../../common/guards/roles.guard";

/**
 * Flight Log controller
 *
 * Handles flight log CRUD operations
 * Flight logs are the legal record of aircraft operation
 */
@Controller("flight-logs")
@UseGuards(AuthGuard("jwt"), RolesGuard)
export class FlightLogController {
  private flightLogService: FlightLogService;

  constructor(@Inject(FlightLogService) flightLogService: FlightLogService) {
    this.flightLogService = flightLogService;
  }

  /**
   * Get flight log by ID
   */
  @Get(":id")
  async getById(@Param("id") id: string) {
    return this.flightLogService.findById(id);
  }

  /**
   * List flight logs
   * Can filter by aircraft, pilot, or date range
   */
  @Get()
  async list(
    @Query("limit", new ParseIntPipe({ optional: true })) limit = 50,
    @Query("offset", new ParseIntPipe({ optional: true })) offset = 0,
    @Query("aircraftId") aircraftId?: string,
    @Query("pilotId") pilotId?: string,
    @Query("recent") recent?: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ) {
    if (recent === "true") {
      return this.flightLogService.getRecent(limit);
    }

    if (aircraftId) {
      return this.flightLogService.findByAircraft(aircraftId, limit, offset);
    }

    if (pilotId) {
      return this.flightLogService.findByPilot(pilotId, limit, offset);
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new BadRequestException("Invalid date format");
      }
      return this.flightLogService.findByDateRange(start, end);
    }

    // Default to recent logs if no filter
    return this.flightLogService.getRecent(limit);
  }

  /**
   * Get aircraft flight statistics
   */
  @Get("aircraft/:aircraftId/stats")
  async getAircraftStats(@Param("aircraftId") aircraftId: string) {
    return this.flightLogService.getAircraftStats(aircraftId);
  }

  /**
   * Create new flight log
   * Available to all authenticated users (pilots log flights)
   */
  @Post()
  async create(@Body() dto: CreateFlightLogDto) {
    return this.flightLogService.create(dto);
  }

  /**
   * Update flight log
   * Limited to admin/manager for corrections
   */
  @Put(":id")
  @Roles("ADMIN", "MANAGER")
  async update(@Param("id") id: string, @Body() dto: UpdateFlightLogDto) {
    return this.flightLogService.update(id, dto);
  }

  /**
   * Delete flight log (soft delete)
   * Limited to admin only - this is a legal record
   */
  @Delete(":id")
  @Roles("ADMIN")
  async delete(@Param("id") id: string) {
    await this.flightLogService.delete(id);
    return { success: true, message: "Flight log deleted" };
  }
}
