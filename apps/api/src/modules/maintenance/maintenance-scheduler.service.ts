/**
 * Maintenance Scheduler Service
 *
 * Handles scheduled maintenance operations:
 * - Status updates (SCHEDULED -> DUE -> OVERDUE)
 * - Automatic work order creation
 * - Alert generation
 */

import { Injectable, Logger, Inject } from "@nestjs/common";

import type { Aircraft, MaintenanceTrigger, MaintenanceSchedule, WorkOrder } from "@repo/db";

import { MaintenanceProgramRepository } from "./repositories/maintenance-program.repository";
import { MaintenanceTriggerRepository } from "./repositories/maintenance-trigger.repository";
import { MaintenanceScheduleRepository } from "./repositories/maintenance-schedule.repository";
import { WorkOrderRepository } from "./repositories/work-order.repository";
import { TriggerCalculationService, TriggerCalculationResult } from "./trigger-calculation.service";

// Import aircraft repository
import { AircraftRepository } from "../asset/repositories/aircraft.repository";

/**
 * Alert types
 */
export interface MaintenanceAlert {
  id: string;
  type: "WARNING" | "DUE" | "OVERDUE";
  aircraftId: string;
  aircraftRegistration: string;
  triggerId: string;
  triggerName: string;
  triggerType: string;
  scheduleId: string;
  message: string;
  dueDate: number | null;
  dueAtValue: number | null;
  currentValue: number;
  remainingValue: number;
  remainingDays: number | null;
  createdAt: number;
}

/**
 * Scheduler run result
 */
export interface SchedulerRunResult {
  timestamp: number;
  schedulesProcessed: number;
  statusUpdates: {
    toDue: number;
    toOverdue: number;
  };
  workOrdersCreated: number;
  alerts: MaintenanceAlert[];
  errors: string[];
}

@Injectable()
export class MaintenanceSchedulerService {
  private readonly logger = new Logger(MaintenanceSchedulerService.name);

  constructor(
    @Inject(MaintenanceProgramRepository)
    private readonly programRepo: MaintenanceProgramRepository,
    @Inject(MaintenanceTriggerRepository)
    private readonly triggerRepo: MaintenanceTriggerRepository,
    @Inject(MaintenanceScheduleRepository)
    private readonly scheduleRepo: MaintenanceScheduleRepository,
    @Inject(WorkOrderRepository)
    private readonly workOrderRepo: WorkOrderRepository,
    @Inject(AircraftRepository)
    private readonly aircraftRepo: AircraftRepository,
    @Inject(TriggerCalculationService)
    private readonly calcService: TriggerCalculationService
  ) {}

  /**
   * Run the scheduler - check all schedules and update statuses
   */
  async runScheduler(): Promise<SchedulerRunResult> {
    const result: SchedulerRunResult = {
      timestamp: Date.now(),
      schedulesProcessed: 0,
      statusUpdates: { toDue: 0, toOverdue: 0 },
      workOrdersCreated: 0,
      alerts: [],
      errors: [],
    };

    try {
      // Get all active aircraft
      const aircraft = await this.aircraftRepo.list(1000);

      for (const ac of aircraft) {
        try {
          const alerts = await this.processAircraftSchedules(ac, result);
          result.alerts.push(...alerts);
        } catch (error) {
          const errorMsg = `Error processing aircraft ${ac.registrationNumber}: ${error}`;
          this.logger.error(errorMsg);
          result.errors.push(errorMsg);
        }
      }

      this.logger.log(
        `Scheduler run completed: ${result.schedulesProcessed} schedules processed, ` +
        `${result.statusUpdates.toDue} to DUE, ${result.statusUpdates.toOverdue} to OVERDUE, ` +
        `${result.workOrdersCreated} work orders created, ${result.alerts.length} alerts`
      );
    } catch (error) {
      const errorMsg = `Scheduler run failed: ${error}`;
      this.logger.error(errorMsg);
      result.errors.push(errorMsg);
    }

    return result;
  }

  /**
   * Process schedules for a single aircraft
   */
  private async processAircraftSchedules(
    aircraft: Aircraft,
    result: SchedulerRunResult
  ): Promise<MaintenanceAlert[]> {
    const alerts: MaintenanceAlert[] = [];

    // Get schedules for this aircraft
    const schedules = await this.scheduleRepo.findByAircraftId(aircraft.id);
    result.schedulesProcessed += schedules.length;

    for (const schedule of schedules) {
      // Skip completed or skipped schedules
      if (schedule.status === "COMPLETED" || schedule.status === "SKIPPED") {
        continue;
      }

      // Get trigger details
      const trigger = await this.triggerRepo.findById(schedule.triggerId);
      if (!trigger || !trigger.isActive) {
        continue;
      }

      // Calculate current status
      const calcResult = this.calcService.calculateTrigger(trigger, {
        aircraft,
        lastCompletedAt: schedule.lastCompletedAt || undefined,
        lastCompletedAtValue: schedule.lastCompletedAtValue || undefined,
      });

      // Update schedule status if needed
      const newStatus = this.mapCalcStatusToScheduleStatus(calcResult.status, schedule.status);
      if (newStatus && newStatus !== schedule.status) {
        await this.scheduleRepo.update(schedule.id, {
          status: newStatus,
          dueDate: calcResult.dueDate,
          dueAtValue: calcResult.dueAtValue,
        });

        if (newStatus === "DUE") {
          result.statusUpdates.toDue++;
        } else if (newStatus === "OVERDUE") {
          result.statusUpdates.toOverdue++;
        }
      }

      // Generate alert if warning, due, or overdue
      if (calcResult.status !== "OK") {
        alerts.push(this.createAlert(aircraft, trigger, schedule, calcResult));
      }
    }

    return alerts;
  }

  /**
   * Map calculation status to schedule status
   */
  private mapCalcStatusToScheduleStatus(
    calcStatus: TriggerCalculationResult["status"],
    currentStatus: string
  ): string | null {
    // Don't downgrade status
    if (currentStatus === "IN_PROGRESS") return null;
    if (currentStatus === "OVERDUE" && calcStatus !== "OVERDUE") return null;
    if (currentStatus === "DUE" && calcStatus === "WARNING") return null;

    switch (calcStatus) {
      case "OVERDUE":
        return "OVERDUE";
      case "DUE":
        return "DUE";
      case "WARNING":
      case "OK":
        return currentStatus === "SCHEDULED" ? null : currentStatus;
      default:
        return null;
    }
  }

  /**
   * Create an alert from calculation result
   */
  private createAlert(
    aircraft: Aircraft,
    trigger: MaintenanceTrigger,
    schedule: MaintenanceSchedule,
    calcResult: TriggerCalculationResult
  ): MaintenanceAlert {
    let message = "";
    switch (calcResult.status) {
      case "OVERDUE":
        message = `维保已逾期: ${trigger.name}`;
        break;
      case "DUE":
        message = `维保已到期: ${trigger.name}`;
        break;
      case "WARNING":
        message = `维保即将到期: ${trigger.name} (剩余 ${calcResult.remainingDays || calcResult.remainingValue})`;
        break;
    }

    return {
      id: `${schedule.id}-${Date.now()}`,
      type: calcResult.status as "WARNING" | "DUE" | "OVERDUE",
      aircraftId: aircraft.id,
      aircraftRegistration: aircraft.registrationNumber,
      triggerId: trigger.id,
      triggerName: trigger.name,
      triggerType: trigger.type,
      scheduleId: schedule.id,
      message,
      dueDate: calcResult.dueDate,
      dueAtValue: calcResult.dueAtValue,
      currentValue: calcResult.currentValue,
      remainingValue: calcResult.remainingValue,
      remainingDays: calcResult.remainingDays,
      createdAt: Date.now(),
    };
  }

  /**
   * Create work orders for due/overdue schedules
   */
  async createWorkOrdersForDueSchedules(autoAssign: boolean = false): Promise<WorkOrder[]> {
    const createdOrders: WorkOrder[] = [];

    // Get due schedules without work orders
    const dueSchedules = await this.scheduleRepo.findDueWithoutWorkOrder();

    for (const schedule of dueSchedules) {
      try {
        const trigger = await this.triggerRepo.findById(schedule.triggerId);
        if (!trigger) continue;

        const aircraft = await this.aircraftRepo.findById(schedule.aircraftId);
        if (!aircraft) continue;

        // Generate work order number
        const orderNumber = await this.workOrderRepo.generateOrderNumber();

        // Create work order
        const workOrder = await this.workOrderRepo.create({
          orderNumber,
          title: `${trigger.name} - ${aircraft.registrationNumber}`,
          description: trigger.description || `${trigger.name} 定期维护`,
          type: "SCHEDULED",
          status: "PENDING",
          priority: trigger.priority as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
          aircraftId: aircraft.id,
          scheduleId: schedule.id,
        });

        // Update schedule with work order reference
        await this.scheduleRepo.update(schedule.id, {
          workOrderId: workOrder.id,
          status: "IN_PROGRESS",
        });

        createdOrders.push(workOrder);
        this.logger.log(`Created work order ${orderNumber} for schedule ${schedule.id}`);
      } catch (error) {
        this.logger.error(`Failed to create work order for schedule ${schedule.id}: ${error}`);
      }
    }

    return createdOrders;
  }

  /**
   * Initialize schedules for a new aircraft
   */
  async initializeAircraftSchedules(aircraftId: string): Promise<MaintenanceSchedule[]> {
    const aircraft = await this.aircraftRepo.findById(aircraftId);
    if (!aircraft) {
      throw new Error(`Aircraft ${aircraftId} not found`);
    }

    // Find default program for aircraft model
    const program = await this.programRepo.findDefaultForModel(aircraft.model);
    if (!program) {
      this.logger.warn(`No default maintenance program found for model ${aircraft.model}`);
      return [];
    }

    // Get triggers for the program
    const triggers = await this.triggerRepo.findByProgramId(program.id);
    if (triggers.length === 0) {
      return [];
    }

    // Create schedules for each trigger
    const schedules = await this.scheduleRepo.createMany(
      triggers.map((trigger) => {
        // Calculate initial due values
        const calcResult = this.calcService.calculateTrigger(trigger, {
          aircraft,
        });

        return {
          aircraftId,
          triggerId: trigger.id,
          status: calcResult.status === "OK" ? "SCHEDULED" : calcResult.status,
          dueDate: calcResult.dueDate,
          dueAtValue: calcResult.dueAtValue,
        };
      })
    );

    this.logger.log(
      `Initialized ${schedules.length} maintenance schedules for aircraft ${aircraft.registrationNumber}`
    );

    return schedules;
  }

  /**
   * Complete a maintenance schedule
   */
  async completeSchedule(
    scheduleId: string,
    completedAtValue?: number
  ): Promise<MaintenanceSchedule> {
    const schedule = await this.scheduleRepo.findById(scheduleId);
    if (!schedule) {
      throw new Error(`Schedule ${scheduleId} not found`);
    }

    const aircraft = await this.aircraftRepo.findById(schedule.aircraftId);
    if (!aircraft) {
      throw new Error(`Aircraft ${schedule.aircraftId} not found`);
    }

    const now = Date.now();

    // Determine completion value based on trigger type
    let actualCompletedAtValue = completedAtValue;
    if (!actualCompletedAtValue) {
      const trigger = await this.triggerRepo.findById(schedule.triggerId);
      if (trigger) {
        switch (trigger.type) {
          case "FLIGHT_HOURS":
            actualCompletedAtValue = aircraft.totalFlightHours;
            break;
          case "FLIGHT_CYCLES":
            actualCompletedAtValue = aircraft.totalFlightCycles;
            break;
        }
      }
    }

    // Update schedule to completed
    const updatedSchedule = await this.scheduleRepo.update(scheduleId, {
      status: "COMPLETED",
      lastCompletedAt: now,
      lastCompletedAtValue: actualCompletedAtValue,
    });

    // Create new schedule for next interval
    const trigger = await this.triggerRepo.findById(schedule.triggerId);
    if (trigger) {
      const calcResult = this.calcService.calculateTrigger(trigger, {
        aircraft,
        lastCompletedAt: now,
        lastCompletedAtValue: actualCompletedAtValue,
      });

      await this.scheduleRepo.create({
        aircraftId: schedule.aircraftId,
        triggerId: schedule.triggerId,
        status: "SCHEDULED",
        dueDate: calcResult.dueDate,
        dueAtValue: calcResult.dueAtValue,
        lastCompletedAt: now,
        lastCompletedAtValue: actualCompletedAtValue,
      });
    }

    return updatedSchedule;
  }

  /**
   * Get maintenance alerts for dashboard
   */
  async getAlerts(options: {
    aircraftId?: string;
    types?: ("WARNING" | "DUE" | "OVERDUE")[];
    limit?: number;
  } = {}): Promise<MaintenanceAlert[]> {
    const { aircraftId, types, limit = 50 } = options;
    const alerts: MaintenanceAlert[] = [];

    // Get relevant aircraft
    let aircraft: Aircraft[];
    if (aircraftId) {
      const ac = await this.aircraftRepo.findById(aircraftId);
      aircraft = ac ? [ac] : [];
    } else {
      aircraft = await this.aircraftRepo.list(100);
    }

    for (const ac of aircraft) {
      const schedules = await this.scheduleRepo.findByAircraftId(ac.id);

      for (const schedule of schedules) {
        if (schedule.status === "COMPLETED" || schedule.status === "SKIPPED") {
          continue;
        }

        const trigger = await this.triggerRepo.findById(schedule.triggerId);
        if (!trigger) continue;

        const calcResult = this.calcService.calculateTrigger(trigger, {
          aircraft: ac,
          lastCompletedAt: schedule.lastCompletedAt || undefined,
          lastCompletedAtValue: schedule.lastCompletedAtValue || undefined,
        });

        // Filter by types
        if (calcResult.status === "OK") continue;
        if (types && !types.includes(calcResult.status as any)) continue;

        alerts.push(this.createAlert(ac, trigger, schedule, calcResult));

        if (alerts.length >= limit) break;
      }

      if (alerts.length >= limit) break;
    }

    // Sort by urgency (OVERDUE first, then DUE, then WARNING)
    alerts.sort((a, b) => {
      const priority = { OVERDUE: 0, DUE: 1, WARNING: 2 };
      return priority[a.type] - priority[b.type];
    });

    return alerts.slice(0, limit);
  }
}
