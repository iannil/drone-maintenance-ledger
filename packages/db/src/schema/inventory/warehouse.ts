/**
 * Warehouse Schema
 *
 * Represents a warehouse/storage location for components and parts
 */

import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Warehouse status
 */
export const WarehouseStatusEnum = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  MAINTENANCE: "MAINTENANCE",
} as const;

export type WarehouseStatus = (typeof WarehouseStatusEnum)[keyof typeof WarehouseStatusEnum];

/**
 * Warehouses table
 */
export const warehouse = sqliteTable("warehouse", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  code: text("code").notNull().unique(), // Warehouse code (e.g., "WH-001")
  name: text("name").notNull(),
  description: text("description"),

  // Location
  address: text("address"),
  city: text("city"),
  province: text("province"),
  country: text("country").default("中国"),

  // Contact
  contactPerson: text("contact_person"),
  contactPhone: text("contact_phone"),
  contactEmail: text("contact_email"),

  // Status
  status: text("status").notNull().default(WarehouseStatusEnum.ACTIVE),

  // Capacity
  totalCapacity: integer("total_capacity"), // Total storage capacity
  usedCapacity: integer("used_capacity").default(0), // Current used capacity

  // Timestamps
  createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
  updatedAt: integer("updated_at").notNull().$defaultFn(() => Date.now()),
});

export type Warehouse = typeof warehouse.$inferSelect;
export type NewWarehouse = typeof warehouse.$inferInsert;
