import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

// Work Order
import { WorkOrderController } from "./work-order.controller";
import { WorkOrderService } from "./work-order.service";
import { WorkOrderRepository } from "./repositories/work-order.repository";
import { WorkOrderTaskRepository } from "./repositories/work-order-task.repository";
import { WorkOrderPartRepository } from "./repositories/work-order-part.repository";

// Maintenance Scheduler
import { MaintenanceSchedulerController } from "./maintenance-scheduler.controller";
import { MaintenanceSchedulerService } from "./maintenance-scheduler.service";
import { TriggerCalculationService } from "./trigger-calculation.service";
import { MaintenanceProgramRepository } from "./repositories/maintenance-program.repository";
import { MaintenanceTriggerRepository } from "./repositories/maintenance-trigger.repository";
import { MaintenanceScheduleRepository } from "./repositories/maintenance-schedule.repository";

// Import Asset module for AircraftRepository
import { AssetModule } from "../asset/asset.module";

/**
 * Maintenance Module
 *
 * Handles maintenance execution operations:
 * - Work orders (maintenance work management)
 * - Work order tasks (checklist items)
 * - Work order parts (parts consumption)
 * - Maintenance programs (maintenance plan definitions)
 * - Maintenance triggers (calendar/flight hours/cycles)
 * - Maintenance schedules (per-aircraft maintenance tracking)
 * - Scheduler service (automatic status updates, work order creation)
 */
@Module({
  imports: [ConfigModule, AssetModule],
  controllers: [WorkOrderController, MaintenanceSchedulerController],
  providers: [
    // Services
    WorkOrderService,
    MaintenanceSchedulerService,
    TriggerCalculationService,
    // Work Order Repositories
    WorkOrderRepository,
    WorkOrderTaskRepository,
    WorkOrderPartRepository,
    // Maintenance Scheduler Repositories
    MaintenanceProgramRepository,
    MaintenanceTriggerRepository,
    MaintenanceScheduleRepository,
  ],
  exports: [
    WorkOrderService,
    MaintenanceSchedulerService,
    TriggerCalculationService,
    WorkOrderRepository,
    MaintenanceProgramRepository,
    MaintenanceTriggerRepository,
    MaintenanceScheduleRepository,
  ],
})
export class MaintenanceModule {}
