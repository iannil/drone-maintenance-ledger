/**
 * Maintenance History Schema
 *
 * Records completed maintenance actions
 */

import { pgTable, text, timestamp, uuid, jsonb } from "drizzle-orm/pg-core";
import { aircraft } from "../core/aircraft.js";
import { user } from "../core/user.js";

/**
 * Maintenance history table
 *
 * Permanent record of all completed maintenance actions
 */
export const maintenanceHistory = pgTable("maintenance_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  aircraftId: uuid("aircraft_id")
    .notNull()
    .references(() => aircraft.id, { onDelete: "cascade" }),

  // What was done
  triggerId: uuid("trigger_id"), // Reference to trigger if applicable
  description: text("description").notNull(),
  workPerformed: text("work_performed").notNull(),

  // Who performed it
  performedBy: uuid("performed_by")
    .notNull()
    .references(() => user.id, { onDelete: "set null" }),
  inspectedBy: uuid("inspected_by")
    .references(() => user.id, { onDelete: "set null" }), // Inspector sign-off

  // Timing
  performedAt: timestamp("performed_at").notNull(),
  aircraftHoursAtPerform: integer("aircraft_hours_at_perform"), // Aircraft hours at completion
  aircraftCyclesAtPerform: integer("aircraft_cycles_at_perform"), // Aircraft cycles at completion

  // Parts replaced
  partsReplaced: jsonb("parts_replaced").$type<{
    componentId: string;
    partNumber: string;
    quantity: number;
  }[]>(),

  // Findings and discrepancies
  findings: text("findings"),
  discrepancies: text("discrepancies"),

  // Next due calculation (for reference)
  nextDueDate: timestamp("next_due_date"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type MaintenanceHistory = typeof maintenanceHistory.$inferSelect;
export type NewMaintenanceHistory = typeof maintenanceHistory.$inferInsert;
