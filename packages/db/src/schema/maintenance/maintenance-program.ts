/**
 * Maintenance Program Schema
 *
 * Defines maintenance programs for aircraft models
 */

import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Maintenance trigger types
 */
export const MaintenanceTriggerTypeEnum = {
  CALENDAR_DAYS: "CALENDAR_DAYS", // Every N days
  FLIGHT_HOURS: "FLIGHT_HOURS", // Every N flight hours
  FLIGHT_CYCLES: "FLIGHT_CYCLES", // Every N takeoff/landing cycles
  BATTERY_CYCLES: "BATTERY_CYCLES", // Every N battery charge cycles (for batteries)
  CALENDAR_DATE: "CALENDAR_DATE", // Specific date (yearly inspection)
} as const;

export type MaintenanceTriggerType =
  (typeof MaintenanceTriggerTypeEnum)[keyof typeof MaintenanceTriggerTypeEnum];

/**
 * Maintenance programs table
 *
 * Defines maintenance requirements for specific aircraft models
 */
export const maintenanceProgram = sqliteTable("maintenance_program", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  aircraftModel: text("aircraft_model").notNull(), // e.g., "DJI Matrice 300 RTK"
  isDefault: integer("is_default", { mode: "boolean" }).notNull().default(false), // Default program for this model
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
  updatedAt: integer("updated_at").notNull().$defaultFn(() => Date.now()),
});

export type MaintenanceProgram = typeof maintenanceProgram.$inferSelect;
export type NewMaintenanceProgram = typeof maintenanceProgram.$inferInsert;
