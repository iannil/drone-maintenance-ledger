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
  Request,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import {
  PilotReportService,
  CreatePilotReportDto,
  UpdatePilotReportDto,
  UpdateStatusDto,
} from "./pilot-report.service";
import { Roles } from "../../common/decorators/roles.decorator";
import { RolesGuard } from "../../common/guards/roles.guard";

/**
 * Pilot Report (PIREP) controller
 *
 * Handles pilot report operations
 * PIREP is how pilots report issues discovered during/after flights
 */
@Controller("pilot-reports")
@UseGuards(AuthGuard("jwt"), RolesGuard)
export class PilotReportController {
  constructor(private readonly pilotReportService: PilotReportService) {}

  /**
   * Get pilot report by ID
   */
  @Get(":id")
  async getById(@Param("id") id: string) {
    return this.pilotReportService.findById(id);
  }

  /**
   * List pilot reports
   * Can filter by aircraft, reporter, or status
   */
  @Get()
  async list(
    @Query("limit", new ParseIntPipe({ optional: true })) limit = 50,
    @Query("offset", new ParseIntPipe({ optional: true })) offset = 0,
    @Query("aircraftId") aircraftId?: string,
    @Query("reporterId") reporterId?: string,
    @Query("open") open?: string,
    @Query("aog") aog?: string,
  ) {
    if (aog === "true") {
      return this.pilotReportService.findAog();
    }

    if (open === "true") {
      return this.pilotReportService.findOpen(limit, offset);
    }

    if (aircraftId) {
      return this.pilotReportService.findByAircraft(aircraftId, limit, offset);
    }

    if (reporterId) {
      return this.pilotReportService.findByReporter(reporterId, limit, offset);
    }

    // Default to open reports
    return this.pilotReportService.findOpen(limit, offset);
  }

  /**
   * Create new pilot report
   * Available to all authenticated users
   */
  @Post()
  async create(@Request() req, @Body() dto: CreatePilotReportDto) {
    return this.pilotReportService.create(req.user.id, dto);
  }

  /**
   * Update pilot report
   */
  @Put(":id")
  @Roles("ADMIN", "MANAGER", "MECHANIC", "INSPECTOR")
  async update(@Param("id") id: string, @Body() dto: UpdatePilotReportDto) {
    return this.pilotReportService.update(id, dto);
  }

  /**
   * Update pilot report status
   * Used by maintenance/inspection to track resolution
   */
  @Put(":id/status")
  @Roles("ADMIN", "MANAGER", "MECHANIC", "INSPECTOR")
  async updateStatus(@Request() req, @Param("id") id: string, @Body() dto: UpdateStatusDto) {
    return this.pilotReportService.updateStatus(id, req.user.id, dto);
  }

  /**
   * Link pilot report to work order
   * Called when a work order is created from a pilot report
   */
  @Post(":id/link-work-order")
  @Roles("ADMIN", "MANAGER", "MECHANIC")
  async linkToWorkOrder(
    @Param("id") id: string,
    @Body() body: { workOrderId: string },
  ) {
    return this.pilotReportService.linkToWorkOrder(id, body.workOrderId);
  }

  /**
   * Delete pilot report (soft delete)
   */
  @Delete(":id")
  @Roles("ADMIN", "MANAGER")
  async delete(@Param("id") id: string) {
    await this.pilotReportService.delete(id);
    return { success: true, message: "Pilot report deleted" };
  }
}
