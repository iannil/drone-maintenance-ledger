/**
 * Maintenance Trigger Schema
 *
 * Defines individual maintenance triggers within a program
 */

import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { maintenanceProgram } from "./maintenance-program";

/**
 * Maintenance triggers table
 *
 * Each trigger defines when maintenance is due based on different metrics
 */
export const maintenanceTrigger = sqliteTable("maintenance_trigger", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  programId: text("program_id")
    .notNull()
    .references(() => maintenanceProgram.id, { onDelete: "cascade" }),

  // Trigger configuration
  type: text("type").notNull(),

  name: text("name").notNull(), // e.g., "50-Hour Inspection", "Annual Inspection"
  description: text("description"),

  // Interval/threshold
  intervalValue: integer("interval_value").notNull(), // e.g., 50 (hours), 180 (days), 500 (cycles)

  // Applicable to specific component types (optional)
  // If null, applies to entire aircraft
  applicableComponentType: text("applicable_component_type"), // e.g., "MOTOR", "BATTERY", "PROPELLER"
  applicableComponentLocation: text("applicable_component_location"), // e.g., "front-left" for specific motor

  // Priority for overdue items
  priority: text("priority")
    .notNull()
    .default("MEDIUM"),

  // Required inspection level
  requiredRole: text("required_role").notNull().default("INSPECTOR"),

  // RII (Required Inspection Item) flag
  // Requires dual inspection or inspector sign-off
  isRii: integer("is_rii", { mode: "boolean" }).notNull().default(false),

  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
  updatedAt: integer("updated_at").notNull().$defaultFn(() => Date.now()),
});

export type MaintenanceTrigger = typeof maintenanceTrigger.$inferSelect;
export type NewMaintenanceTrigger = typeof maintenanceTrigger.$inferInsert;
