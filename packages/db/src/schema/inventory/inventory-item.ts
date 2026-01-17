/**
 * Inventory Item Schema
 *
 * Represents inventory records for components and parts
 */

import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { warehouse } from "./warehouse";

/**
 * Inventory status
 */
export const InventoryStatusEnum = {
  AVAILABLE: "AVAILABLE",     // Available for use
  RESERVED: "RESERVED",       // Reserved for a work order
  QUARANTINE: "QUARANTINE",   // Under inspection/quarantine
  DAMAGED: "DAMAGED",         // Damaged, needs repair
  EXPIRED: "EXPIRED",         // Shelf life expired
} as const;

export type InventoryStatus = (typeof InventoryStatusEnum)[keyof typeof InventoryStatusEnum];

/**
 * Inventory items table
 */
export const inventoryItem = sqliteTable("inventory_item", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),

  // Item identification
  partNumber: text("part_number").notNull(), // Part number
  name: text("name").notNull(),
  description: text("description"),
  category: text("category"), // Category/classification
  unit: text("unit").notNull().default("个"), // Unit of measure (个, 套, 件, etc.)

  // Location
  warehouseId: text("warehouse_id").references(() => warehouse.id),
  location: text("location"), // Specific location within warehouse (e.g., "A-1-3")
  binNumber: text("bin_number"), // Bin/shelf number

  // Quantity
  quantity: integer("quantity").notNull().default(0),
  reservedQuantity: integer("reserved_quantity").notNull().default(0),
  availableQuantity: integer("available_quantity").notNull().default(0),

  // Thresholds
  minStock: integer("min_stock").default(0), // Minimum stock level (reorder point)
  maxStock: integer("max_stock"), // Maximum stock level
  reorderPoint: integer("reorder_point"), // When to trigger reorder
  reorderQuantity: integer("reorder_quantity"), // Quantity to reorder

  // Pricing
  unitCost: integer("unit_cost"), // Unit cost in cents
  totalValue: integer("total_value"), // Total value in cents

  // Tracking
  batchNumber: text("batch_number"),
  serialNumbers: text("serial_numbers"), // JSON array of serial numbers for tracked items
  expiryDate: integer("expiry_date"), // Shelf life expiry date

  // Status
  status: text("status").notNull().default(InventoryStatusEnum.AVAILABLE),

  // Timestamps
  lastCountDate: integer("last_count_date"), // Last physical count date
  createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
  updatedAt: integer("updated_at").notNull().$defaultFn(() => Date.now()),
});

export type InventoryItem = typeof inventoryItem.$inferSelect;
export type NewInventoryItem = typeof inventoryItem.$inferInsert;
