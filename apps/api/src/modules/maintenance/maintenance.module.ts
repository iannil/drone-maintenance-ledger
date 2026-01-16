import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { WorkOrderController } from "./work-order.controller";
import { WorkOrderService } from "./work-order.service";
import { WorkOrderRepository } from "./repositories/work-order.repository";
import { WorkOrderTaskRepository } from "./repositories/work-order-task.repository";
import { WorkOrderPartRepository } from "./repositories/work-order-part.repository";

/**
 * Maintenance Module
 *
 * Handles maintenance execution operations:
 * - Work orders (maintenance work management)
 * - Work order tasks (checklist items)
 * - Work order parts (parts consumption)
 */
@Module({
  imports: [ConfigModule],
  controllers: [WorkOrderController],
  providers: [
    // Service
    WorkOrderService,
    // Repositories
    WorkOrderRepository,
    WorkOrderTaskRepository,
    WorkOrderPartRepository,
  ],
  exports: [WorkOrderService],
})
export class MaintenanceModule {}
