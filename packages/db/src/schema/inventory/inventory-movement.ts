/**
 * Inventory Movement Schema
 *
 * Tracks all inventory movements (receipts, issues, transfers, adjustments)
 */

import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { warehouse } from "./warehouse";
import { inventoryItem } from "./inventory-item";
import { user } from "../core/user";

/**
 * Movement types
 */
export const MovementTypeEnum = {
  RECEIPT: "RECEIPT",           // 入库 - Receiving from purchase
  ISSUE: "ISSUE",               // 出库 - Issue to work order
  TRANSFER: "TRANSFER",         // 调拨 - Transfer between warehouses
  ADJUSTMENT: "ADJUSTMENT",     // 调整 - Inventory adjustment
  RETURN: "RETURN",             // 退料 - Return from work order
  SCRAP: "SCRAP",               // 报废 - Scrap/disposal
  COUNT: "COUNT",               // 盘点 - Physical count adjustment
} as const;

export type MovementType = (typeof MovementTypeEnum)[keyof typeof MovementTypeEnum];

/**
 * Movement status
 */
export const MovementStatusEnum = {
  PENDING: "PENDING",     // Pending approval
  APPROVED: "APPROVED",   // Approved
  COMPLETED: "COMPLETED", // Completed
  CANCELLED: "CANCELLED", // Cancelled
} as const;

export type MovementStatus = (typeof MovementStatusEnum)[keyof typeof MovementStatusEnum];

/**
 * Inventory movements table
 */
export const inventoryMovement = sqliteTable("inventory_movement", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  movementNumber: text("movement_number").notNull().unique(), // Movement reference number

  // Type and status
  type: text("type").notNull(),
  status: text("status").notNull().default(MovementStatusEnum.PENDING),

  // Item reference
  inventoryItemId: text("inventory_item_id").references(() => inventoryItem.id),
  partNumber: text("part_number").notNull(),
  partName: text("part_name"),

  // Quantity
  quantity: integer("quantity").notNull(),
  unit: text("unit").notNull().default("个"),

  // Source and destination
  fromWarehouseId: text("from_warehouse_id").references(() => warehouse.id),
  toWarehouseId: text("to_warehouse_id").references(() => warehouse.id),
  fromLocation: text("from_location"),
  toLocation: text("to_location"),

  // Reference documents
  referenceType: text("reference_type"), // PO, WO, etc.
  referenceId: text("reference_id"),
  referenceNumber: text("reference_number"),

  // Cost tracking
  unitCost: integer("unit_cost"), // Unit cost in cents
  totalCost: integer("total_cost"), // Total cost in cents

  // Tracking
  batchNumber: text("batch_number"),
  serialNumbers: text("serial_numbers"), // JSON array

  // Reason and notes
  reason: text("reason"),
  notes: text("notes"),

  // Approval
  requestedBy: text("requested_by").references(() => user.id),
  approvedBy: text("approved_by").references(() => user.id),
  approvedAt: integer("approved_at"),

  // Timestamps
  movementDate: integer("movement_date").notNull().$defaultFn(() => Date.now()),
  createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
  updatedAt: integer("updated_at").notNull().$defaultFn(() => Date.now()),
});

export type InventoryMovement = typeof inventoryMovement.$inferSelect;
export type NewInventoryMovement = typeof inventoryMovement.$inferInsert;
