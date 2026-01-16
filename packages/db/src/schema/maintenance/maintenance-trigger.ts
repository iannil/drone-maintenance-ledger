/**
 * Maintenance Trigger Schema
 *
 * Defines individual maintenance triggers within a program
 */

import { pgTable, text, timestamp, uuid, integer, jsonb, boolean } from "drizzle-orm/pg-core";
import { maintenanceProgram } from "./maintenance-program";

/**
 * Maintenance triggers table
 *
 * Each trigger defines when maintenance is due based on different metrics
 */
export const maintenanceTrigger = pgTable("maintenance_trigger", {
  id: uuid("id").primaryKey().defaultRandom(),
  programId: uuid("program_id")
    .notNull()
    .references(() => maintenanceProgram.id, { onDelete: "cascade" }),

  // Trigger configuration
  type: text("type", {
    enum: [
      "CALENDAR_DAYS",
      "FLIGHT_HOURS",
      "FLIGHT_CYCLES",
      "BATTERY_CYCLES",
      "CALENDAR_DATE",
    ],
  }).notNull(),

  name: text("name").notNull(), // e.g., "50-Hour Inspection", "Annual Inspection"
  description: text("description"),

  // Interval/threshold
  intervalValue: integer("interval_value").notNull(), // e.g., 50 (hours), 180 (days), 500 (cycles)

  // Applicable to specific component types (optional)
  // If null, applies to entire aircraft
  applicableComponentType: text("applicable_component_type"), // e.g., "MOTOR", "BATTERY", "PROPELLER"
  applicableComponentLocation: text("applicable_component_location"), // e.g., "front-left" for specific motor

  // Priority for overdue items
  priority: text("priority", { enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] })
    .notNull()
    .default("MEDIUM"),

  // Required inspection level
  requiredRole: text("required_role", {
    enum: ["MECHANIC", "INSPECTOR", "MANAGER"],
  }).notNull().default("INSPECTOR"),

  // RII (Required Inspection Item) flag
  // Requires dual inspection or inspector sign-off
  isRii: boolean("is_rii").notNull().default(false),

  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type MaintenanceTrigger = typeof maintenanceTrigger.$inferSelect;
export type NewMaintenanceTrigger = typeof maintenanceTrigger.$inferInsert;
