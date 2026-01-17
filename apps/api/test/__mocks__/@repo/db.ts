/**
 * Mock for @repo/db module
 *
 * This provides mock types and schemas for testing without the actual database connection
 */

// Mock user roles
export const UserRoleEnum = {
  PILOT: 'PILOT',
  MECHANIC: 'MECHANIC',
  INSPECTOR: 'INSPECTOR',
  MANAGER: 'MANAGER',
  ADMIN: 'ADMIN',
} as const;

export type UserRole = (typeof UserRoleEnum)[keyof typeof UserRoleEnum];

// Mock User type
export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  fullName: string | null;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface NewUser {
  id?: string;
  username: string;
  email: string;
  passwordHash: string;
  role?: UserRole;
  fullName?: string | null;
  isActive?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

// Mock table schemas (minimal implementation for testing)
export const user = {
  id: { name: 'id' },
  username: { name: 'username' },
  email: { name: 'email' },
  passwordHash: { name: 'password_hash' },
  role: { name: 'role' },
  fullName: { name: 'full_name' },
  isActive: { name: 'is_active' },
  createdAt: { name: 'created_at' },
  updatedAt: { name: 'updated_at' },
};

export const fleet = {
  id: { name: 'id' },
  name: { name: 'name' },
  description: { name: 'description' },
  createdAt: { name: 'created_at' },
  updatedAt: { name: 'updated_at' },
};

export const aircraft = {
  id: { name: 'id' },
  registrationNumber: { name: 'registration_number' },
  serialNumber: { name: 'serial_number' },
  model: { name: 'model' },
  manufacturer: { name: 'manufacturer' },
  fleetId: { name: 'fleet_id' },
  totalFlightHours: { name: 'total_flight_hours' },
  totalCycles: { name: 'total_cycles' },
  status: { name: 'status' },
  createdAt: { name: 'created_at' },
  updatedAt: { name: 'updated_at' },
};

export const component = {
  id: { name: 'id' },
  partNumber: { name: 'part_number' },
  serialNumber: { name: 'serial_number' },
  name: { name: 'name' },
  description: { name: 'description' },
  category: { name: 'category' },
  totalHours: { name: 'total_hours' },
  totalCycles: { name: 'total_cycles' },
  status: { name: 'status' },
  createdAt: { name: 'created_at' },
  updatedAt: { name: 'updated_at' },
};

export const workOrder = {
  id: { name: 'id' },
  orderNumber: { name: 'order_number' },
  aircraftId: { name: 'aircraft_id' },
  status: { name: 'status' },
  priority: { name: 'priority' },
  description: { name: 'description' },
  createdAt: { name: 'created_at' },
  updatedAt: { name: 'updated_at' },
};

export const workOrderTask = {
  id: { name: 'id' },
  workOrderId: { name: 'work_order_id' },
  taskNumber: { name: 'task_number' },
  description: { name: 'description' },
  status: { name: 'status' },
  createdAt: { name: 'created_at' },
  updatedAt: { name: 'updated_at' },
};

export const workOrderPart = {
  id: { name: 'id' },
  workOrderId: { name: 'work_order_id' },
  componentId: { name: 'component_id' },
  quantity: { name: 'quantity' },
  createdAt: { name: 'created_at' },
};

export const flightLog = {
  id: { name: 'id' },
  aircraftId: { name: 'aircraft_id' },
  flightNumber: { name: 'flight_number' },
  pilotId: { name: 'pilot_id' },
  duration: { name: 'duration' },
  cycles: { name: 'cycles' },
  createdAt: { name: 'created_at' },
};

export const pilotReport = {
  id: { name: 'id' },
  flightLogId: { name: 'flight_log_id' },
  reportType: { name: 'report_type' },
  description: { name: 'description' },
  createdAt: { name: 'created_at' },
};

export const releaseRecord = {
  id: { name: 'id' },
  workOrderId: { name: 'work_order_id' },
  releaseType: { name: 'release_type' },
  releasedById: { name: 'released_by_id' },
  createdAt: { name: 'created_at' },
};

export const maintenanceProgram = {
  id: { name: 'id' },
  name: { name: 'name' },
  description: { name: 'description' },
  createdAt: { name: 'created_at' },
};

export const maintenanceTrigger = {
  id: { name: 'id' },
  programId: { name: 'program_id' },
  triggerType: { name: 'trigger_type' },
  intervalValue: { name: 'interval_value' },
  createdAt: { name: 'created_at' },
};

export const maintenanceSchedule = {
  id: { name: 'id' },
  programId: { name: 'program_id' },
  aircraftId: { name: 'aircraft_id' },
  dueDate: { name: 'due_date' },
  status: { name: 'status' },
  createdAt: { name: 'created_at' },
};

export const maintenanceHistory = {
  id: { name: 'id' },
  componentId: { name: 'component_id' },
  description: { name: 'description' },
  createdAt: { name: 'created_at' },
};

export const componentInstallation = {
  id: { name: 'id' },
  componentId: { name: 'component_id' },
  aircraftId: { name: 'aircraft_id' },
  installedAt: { name: 'installed_at' },
  removedAt: { name: 'removed_at' },
};

// Inventory schemas
export const warehouse = {
  id: { name: 'id' },
  name: { name: 'name' },
  location: { name: 'location' },
  createdAt: { name: 'created_at' },
};

export const inventoryItem = {
  id: { name: 'id' },
  partNumber: { name: 'part_number' },
  warehouseId: { name: 'warehouse_id' },
  quantity: { name: 'quantity' },
  minQuantity: { name: 'min_quantity' },
  createdAt: { name: 'created_at' },
};

export const inventoryMovement = {
  id: { name: 'id' },
  itemId: { name: 'item_id' },
  movementType: { name: 'movement_type' },
  quantity: { name: 'quantity' },
  createdAt: { name: 'created_at' },
};

export const supplier = {
  id: { name: 'id' },
  name: { name: 'name' },
  contactInfo: { name: 'contact_info' },
  createdAt: { name: 'created_at' },
};

export const purchaseRequest = {
  id: { name: 'id' },
  supplierId: { name: 'supplier_id' },
  status: { name: 'status' },
  createdAt: { name: 'created_at' },
};

export const purchaseOrder = {
  id: { name: 'id' },
  requestId: { name: 'request_id' },
  status: { name: 'status' },
  createdAt: { name: 'created_at' },
};

// Mock database client
export const db = {
  select: jest.fn().mockReturnThis(),
  from: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  offset: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  values: jest.fn().mockReturnThis(),
  returning: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  execute: jest.fn(),
  get: jest.fn(),
  all: jest.fn(),
  run: jest.fn(),
};

// Export types that might be imported
export type Fleet = {
  id: string;
  name: string;
  description: string | null;
  createdAt: number;
  updatedAt: number;
};

export type Aircraft = {
  id: string;
  registrationNumber: string;
  serialNumber: string;
  model: string;
  manufacturer: string;
  fleetId: string | null;
  totalFlightHours: number;
  totalCycles: number;
  status: string;
  createdAt: number;
  updatedAt: number;
};

export type Component = {
  id: string;
  partNumber: string;
  serialNumber: string;
  name: string;
  description: string | null;
  category: string;
  totalHours: number;
  totalCycles: number;
  status: string;
  createdAt: number;
  updatedAt: number;
};

export type WorkOrder = {
  id: string;
  orderNumber: string;
  aircraftId: string;
  status: string;
  priority: string;
  description: string | null;
  createdAt: number;
  updatedAt: number;
};

export type FlightLog = {
  id: string;
  aircraftId: string;
  flightNumber: string;
  pilotId: string;
  duration: number;
  cycles: number;
  createdAt: number;
};

export type MaintenanceProgram = {
  id: string;
  name: string;
  description: string | null;
  createdAt: number;
};

export type MaintenanceSchedule = {
  id: string;
  programId: string;
  aircraftId: string;
  dueDate: number;
  status: string;
  createdAt: number;
};

export type InventoryItem = {
  id: string;
  partNumber: string;
  warehouseId: string;
  quantity: number;
  minQuantity: number;
  createdAt: number;
};

export type Warehouse = {
  id: string;
  name: string;
  location: string | null;
  createdAt: number;
};

// Movement type enum
export const MovementTypeEnum = {
  RECEIPT: 'RECEIPT',
  ISSUE: 'ISSUE',
  TRANSFER: 'TRANSFER',
  ADJUSTMENT: 'ADJUSTMENT',
  RETURN: 'RETURN',
  SCRAP: 'SCRAP',
  COUNT: 'COUNT',
} as const;

export type MovementType = (typeof MovementTypeEnum)[keyof typeof MovementTypeEnum];

// Movement status enum
export const MovementStatusEnum = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type MovementStatus = (typeof MovementStatusEnum)[keyof typeof MovementStatusEnum];

// Inventory item type (full)
export type InventoryItemFull = {
  id: string;
  partNumber: string;
  name: string;
  description: string | null;
  category: string | null;
  unit: string;
  warehouseId: string | null;
  location: string | null;
  binNumber: string | null;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  minStock: number | null;
  maxStock: number | null;
  reorderPoint: number | null;
  reorderQuantity: number | null;
  unitCost: number | null;
  totalValue: number | null;
  batchNumber: string | null;
  serialNumbers: string | null;
  expiryDate: number | null;
  status: string;
  lastCountDate: number | null;
  createdAt: number;
  updatedAt: number;
};

// Inventory movement type
export type InventoryMovement = {
  id: string;
  movementNumber: string;
  type: string;
  status: string;
  inventoryItemId: string | null;
  partNumber: string;
  partName: string | null;
  quantity: number;
  unit: string;
  fromWarehouseId: string | null;
  toWarehouseId: string | null;
  fromLocation: string | null;
  toLocation: string | null;
  referenceType: string | null;
  referenceId: string | null;
  referenceNumber: string | null;
  unitCost: number | null;
  totalCost: number | null;
  batchNumber: string | null;
  serialNumbers: string | null;
  reason: string | null;
  notes: string | null;
  requestedBy: string | null;
  approvedBy: string | null;
  approvedAt: number | null;
  movementDate: number;
  createdAt: number;
  updatedAt: number;
};
