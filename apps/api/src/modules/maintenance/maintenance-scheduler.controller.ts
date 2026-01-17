/**
 * Maintenance Scheduler Controller
 *
 * API endpoints for maintenance scheduling operations
 */

import { Controller, Get, Post, Body, Param, Query, HttpException, HttpStatus } from "@nestjs/common";

import { MaintenanceSchedulerService, MaintenanceAlert, SchedulerRunResult } from "./maintenance-scheduler.service";
import { TriggerCalculationService, TriggerCalculationResult } from "./trigger-calculation.service";
import { MaintenanceProgramRepository } from "./repositories/maintenance-program.repository";
import { MaintenanceTriggerRepository } from "./repositories/maintenance-trigger.repository";
import { MaintenanceScheduleRepository } from "./repositories/maintenance-schedule.repository";

import type { MaintenanceProgram, MaintenanceTrigger, MaintenanceSchedule, NewMaintenanceProgram, NewMaintenanceTrigger } from "@repo/db";

@Controller("maintenance-scheduler")
export class MaintenanceSchedulerController {
  constructor(
    private readonly schedulerService: MaintenanceSchedulerService,
    private readonly calcService: TriggerCalculationService,
    private readonly programRepo: MaintenanceProgramRepository,
    private readonly triggerRepo: MaintenanceTriggerRepository,
    private readonly scheduleRepo: MaintenanceScheduleRepository
  ) {}

  // ==================== Scheduler Operations ====================

  /**
   * Run the scheduler to check and update all maintenance schedules
   */
  @Post("run")
  async runScheduler(): Promise<SchedulerRunResult> {
    return this.schedulerService.runScheduler();
  }

  /**
   * Create work orders for all due schedules
   */
  @Post("create-work-orders")
  async createWorkOrders(
    @Body() body: { autoAssign?: boolean }
  ): Promise<{ created: number; workOrders: any[] }> {
    const workOrders = await this.schedulerService.createWorkOrdersForDueSchedules(body.autoAssign);
    return {
      created: workOrders.length,
      workOrders,
    };
  }

  /**
   * Get maintenance alerts for dashboard
   */
  @Get("alerts")
  async getAlerts(
    @Query("aircraftId") aircraftId?: string,
    @Query("types") types?: string,
    @Query("limit") limit?: string
  ): Promise<MaintenanceAlert[]> {
    const typeArray = types
      ? (types.split(",") as ("WARNING" | "DUE" | "OVERDUE")[])
      : undefined;

    return this.schedulerService.getAlerts({
      aircraftId,
      types: typeArray,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  /**
   * Initialize schedules for an aircraft
   */
  @Post("aircraft/:aircraftId/initialize")
  async initializeAircraftSchedules(
    @Param("aircraftId") aircraftId: string
  ): Promise<{ created: number; schedules: MaintenanceSchedule[] }> {
    const schedules = await this.schedulerService.initializeAircraftSchedules(aircraftId);
    return {
      created: schedules.length,
      schedules,
    };
  }

  /**
   * Complete a maintenance schedule
   */
  @Post("schedules/:scheduleId/complete")
  async completeSchedule(
    @Param("scheduleId") scheduleId: string,
    @Body() body: { completedAtValue?: number }
  ): Promise<MaintenanceSchedule> {
    return this.schedulerService.completeSchedule(scheduleId, body.completedAtValue);
  }

  // ==================== Maintenance Programs ====================

  /**
   * List maintenance programs
   */
  @Get("programs")
  async listPrograms(
    @Query("limit") limit?: string,
    @Query("offset") offset?: string,
    @Query("aircraftModel") aircraftModel?: string,
    @Query("isActive") isActive?: string
  ): Promise<MaintenanceProgram[]> {
    return this.programRepo.list({
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
      aircraftModel,
      isActive: isActive ? isActive === "true" : undefined,
    });
  }

  /**
   * Get a maintenance program by ID
   */
  @Get("programs/:id")
  async getProgram(@Param("id") id: string): Promise<MaintenanceProgram> {
    const program = await this.programRepo.findById(id);
    if (!program) {
      throw new HttpException("Maintenance program not found", HttpStatus.NOT_FOUND);
    }
    return program;
  }

  /**
   * Create a maintenance program
   */
  @Post("programs")
  async createProgram(@Body() data: NewMaintenanceProgram): Promise<MaintenanceProgram> {
    return this.programRepo.create(data);
  }

  /**
   * Get default program for aircraft model
   */
  @Get("programs/default/:aircraftModel")
  async getDefaultProgram(
    @Param("aircraftModel") aircraftModel: string
  ): Promise<MaintenanceProgram | null> {
    return this.programRepo.findDefaultForModel(aircraftModel);
  }

  // ==================== Maintenance Triggers ====================

  /**
   * List maintenance triggers
   */
  @Get("triggers")
  async listTriggers(
    @Query("limit") limit?: string,
    @Query("offset") offset?: string,
    @Query("programId") programId?: string,
    @Query("type") type?: string,
    @Query("isActive") isActive?: string
  ): Promise<MaintenanceTrigger[]> {
    return this.triggerRepo.list({
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
      programId,
      type,
      isActive: isActive ? isActive === "true" : undefined,
    });
  }

  /**
   * Get a maintenance trigger by ID
   */
  @Get("triggers/:id")
  async getTrigger(@Param("id") id: string): Promise<MaintenanceTrigger> {
    const trigger = await this.triggerRepo.findById(id);
    if (!trigger) {
      throw new HttpException("Maintenance trigger not found", HttpStatus.NOT_FOUND);
    }
    return trigger;
  }

  /**
   * Create a maintenance trigger
   */
  @Post("triggers")
  async createTrigger(@Body() data: NewMaintenanceTrigger): Promise<MaintenanceTrigger> {
    return this.triggerRepo.create(data);
  }

  /**
   * Get triggers for a program
   */
  @Get("programs/:programId/triggers")
  async getProgramTriggers(@Param("programId") programId: string): Promise<MaintenanceTrigger[]> {
    return this.triggerRepo.findByProgramId(programId);
  }

  // ==================== Maintenance Schedules ====================

  /**
   * List maintenance schedules
   */
  @Get("schedules")
  async listSchedules(
    @Query("limit") limit?: string,
    @Query("offset") offset?: string,
    @Query("aircraftId") aircraftId?: string,
    @Query("status") status?: string,
    @Query("isActive") isActive?: string
  ): Promise<MaintenanceSchedule[]> {
    return this.scheduleRepo.list({
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
      aircraftId,
      status,
      isActive: isActive ? isActive === "true" : undefined,
    });
  }

  /**
   * Get a maintenance schedule by ID
   */
  @Get("schedules/:id")
  async getSchedule(@Param("id") id: string): Promise<MaintenanceSchedule> {
    const schedule = await this.scheduleRepo.findById(id);
    if (!schedule) {
      throw new HttpException("Maintenance schedule not found", HttpStatus.NOT_FOUND);
    }
    return schedule;
  }

  /**
   * Get schedules for an aircraft
   */
  @Get("aircraft/:aircraftId/schedules")
  async getAircraftSchedules(@Param("aircraftId") aircraftId: string): Promise<MaintenanceSchedule[]> {
    return this.scheduleRepo.findByAircraftId(aircraftId);
  }

  /**
   * Get due or overdue schedules
   */
  @Get("schedules/status/due-overdue")
  async getDueOrOverdueSchedules(): Promise<MaintenanceSchedule[]> {
    return this.scheduleRepo.findDueOrOverdue();
  }

  /**
   * Get schedules due within N days
   */
  @Get("schedules/due-within/:days")
  async getSchedulesDueWithinDays(@Param("days") days: string): Promise<MaintenanceSchedule[]> {
    return this.scheduleRepo.findDueWithinDays(parseInt(days, 10));
  }

  /**
   * Get schedule status counts
   */
  @Get("schedules/counts")
  async getScheduleCounts(): Promise<Record<string, number>> {
    return this.scheduleRepo.countByStatus();
  }

  // ==================== Calculation Preview ====================

  /**
   * Preview trigger calculation for an aircraft
   * Useful for seeing when maintenance will be due without modifying data
   */
  @Post("calculate-preview")
  async calculatePreview(
    @Body() body: {
      triggerId: string;
      aircraft: {
        totalFlightHours: number;
        totalFlightCycles: number;
      };
      lastCompletedAt?: number;
      lastCompletedAtValue?: number;
    }
  ): Promise<TriggerCalculationResult> {
    const trigger = await this.triggerRepo.findById(body.triggerId);
    if (!trigger) {
      throw new HttpException("Trigger not found", HttpStatus.NOT_FOUND);
    }

    return this.calcService.calculateTrigger(trigger, {
      aircraft: body.aircraft as any,
      lastCompletedAt: body.lastCompletedAt,
      lastCompletedAtValue: body.lastCompletedAtValue,
    });
  }
}
