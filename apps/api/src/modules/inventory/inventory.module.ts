/**
 * Inventory Module
 *
 * Handles inventory, warehouse, supplier, and procurement management
 */

import { Module } from "@nestjs/common";

// Repositories
import { WarehouseRepository } from "./repositories/warehouse.repository";
import { InventoryItemRepository } from "./repositories/inventory-item.repository";
import { InventoryMovementRepository } from "./repositories/inventory-movement.repository";
import { SupplierRepository } from "./repositories/supplier.repository";
import { PurchaseRequestRepository } from "./repositories/purchase-request.repository";
import { PurchaseOrderRepository } from "./repositories/purchase-order.repository";

// Services
import { WarehouseService } from "./warehouse.service";
import { InventoryItemService } from "./inventory-item.service";
import { InventoryMovementService } from "./inventory-movement.service";
import { SupplierService } from "./supplier.service";
import { PurchaseRequestService } from "./purchase-request.service";
import { PurchaseOrderService } from "./purchase-order.service";

// Controllers
import { WarehouseController } from "./warehouse.controller";
import { InventoryItemController } from "./inventory-item.controller";
import { InventoryMovementController } from "./inventory-movement.controller";
import { SupplierController } from "./supplier.controller";
import { PurchaseRequestController } from "./purchase-request.controller";
import { PurchaseOrderController } from "./purchase-order.controller";

@Module({
  controllers: [
    WarehouseController,
    InventoryItemController,
    InventoryMovementController,
    SupplierController,
    PurchaseRequestController,
    PurchaseOrderController,
  ],
  providers: [
    // Repositories
    WarehouseRepository,
    InventoryItemRepository,
    InventoryMovementRepository,
    SupplierRepository,
    PurchaseRequestRepository,
    PurchaseOrderRepository,
    // Services
    WarehouseService,
    InventoryItemService,
    InventoryMovementService,
    SupplierService,
    PurchaseRequestService,
    PurchaseOrderService,
  ],
  exports: [
    // Export services for use in other modules
    WarehouseService,
    InventoryItemService,
    InventoryMovementService,
    SupplierService,
    PurchaseRequestService,
    PurchaseOrderService,
  ],
})
export class InventoryModule {}
