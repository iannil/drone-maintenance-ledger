/**
 * Maintenance Program Schema
 *
 * Defines maintenance programs for aircraft models
 */

import { pgTable, text, timestamp, uuid, boolean, jsonb } from "drizzle-orm/pg-core";

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
export const maintenanceProgram = pgTable("maintenance_program", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  aircraftModel: text("aircraft_model").notNull(), // e.g., "DJI Matrice 300 RTK"
  isDefault: boolean("is_default").notNull().default(false), // Default program for this model
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type MaintenanceProgram = typeof maintenanceProgram.$inferSelect;
export type NewMaintenanceProgram = typeof maintenanceProgram.$inferInsert;
