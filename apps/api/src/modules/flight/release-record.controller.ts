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
  ReleaseRecordService,
  CreateReleaseRecordDto,
  UpdateReleaseRecordDto,
  SignReleaseDto,
} from "./release-record.service";
import { Roles } from "../../common/decorators/roles.decorator";
import { RolesGuard } from "../../common/guards/roles.guard";

/**
 * Release Record controller
 *
 * Handles release record operations
 * This is a LEGALLY SIGNIFICANT document - aircraft release to service
 * Only INSPECTOR role can sign releases
 */
@Controller("release-records")
@UseGuards(AuthGuard("jwt"), RolesGuard)
export class ReleaseRecordController {
  constructor(private readonly releaseRecordService: ReleaseRecordService) {}

  /**
   * Get release record by ID
   */
  @Get(":id")
  async getById(@Param("id") id: string) {
    return this.releaseRecordService.findById(id);
  }

  /**
   * List release records
   * Can filter by aircraft or work order
   */
  @Get()
  async list(
    @Query("limit", new ParseIntPipe({ optional: true })) limit = 50,
    @Query("offset", new ParseIntPipe({ optional: true })) offset = 0,
    @Query("aircraftId") aircraftId?: string,
    @Query("workOrderId") workOrderId?: string,
    @Query("recent") recent?: string,
  ) {
    if (recent === "true") {
      return this.releaseRecordService.getRecent(limit);
    }

    if (aircraftId) {
      return this.releaseRecordService.findByAircraft(aircraftId, limit, offset);
    }

    if (workOrderId) {
      return this.releaseRecordService.findByWorkOrder(workOrderId);
    }

    // Default to recent releases
    return this.releaseRecordService.getRecent(limit);
  }

  /**
   * Get current release for an aircraft
   * This is the legal basis for whether the aircraft can fly
   */
  @Get("aircraft/:aircraftId/current")
  async getCurrentRelease(@Param("aircraftId") aircraftId: string) {
    return this.releaseRecordService.findCurrentRelease(aircraftId);
  }

  /**
   * Check if aircraft is released to service
   */
  @Get("aircraft/:aircraftId/status")
  async getReleaseStatus(@Param("aircraftId") aircraftId: string) {
    const isReleased = await this.releaseRecordService.isAircraftReleased(aircraftId);
    const release = await this.releaseRecordService.findCurrentRelease(aircraftId);
    return {
      isReleased,
      release: release || null,
    };
  }

  /**
   * Create new release record
   * Available to INSPECTOR and above
   */
  @Post()
  @Roles("ADMIN", "MANAGER", "INSPECTOR")
  async create(@Request() req, @Body() dto: CreateReleaseRecordDto) {
    return this.releaseRecordService.create(req.user.id, dto);
  }

  /**
   * Update release record
   * Only allowed if not yet signed
   */
  @Put(":id")
  @Roles("ADMIN", "MANAGER", "INSPECTOR")
  async update(@Param("id") id: string, @Body() dto: UpdateReleaseRecordDto) {
    return this.releaseRecordService.update(id, dto);
  }

  /**
   * Sign release record
   * This is the electronic signature action
   * Only INSPECTOR role can sign
   */
  @Post(":id/sign")
  @Roles("INSPECTOR", "ADMIN")
  async sign(@Param("id") id: string, @Body() dto: SignReleaseDto) {
    return this.releaseRecordService.sign(id, dto);
  }

  /**
   * Delete release record (soft delete)
   * Only unsigned releases can be deleted
   */
  @Delete(":id")
  @Roles("ADMIN")
  async delete(@Param("id") id: string) {
    await this.releaseRecordService.delete(id);
    return { success: true, message: "Release record deleted" };
  }
}
