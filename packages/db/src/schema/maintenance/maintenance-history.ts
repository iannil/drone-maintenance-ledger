/**
 * Maintenance History Schema
 *
 * Records completed maintenance actions
 */

import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { aircraft } from "../core/aircraft";
import { user } from "../core/user";

/**
 * Maintenance history table
 *
 * Permanent record of all completed maintenance actions
 */
export const maintenanceHistory = sqliteTable("maintenance_history", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  aircraftId: text("aircraft_id")
    .notNull()
    .references(() => aircraft.id, { onDelete: "cascade" }),

  // What was done
  triggerId: text("trigger_id"), // Reference to trigger if applicable
  description: text("description").notNull(),
  workPerformed: text("work_performed").notNull(),

  // Who performed it
  performedBy: text("performed_by")
    .notNull()
    .references(() => user.id, { onDelete: "set null" }),
  inspectedBy: text("inspected_by")
    .references(() => user.id, { onDelete: "set null" }), // Inspector sign-off

  // Timing
  performedAt: integer("performed_at").notNull(),
  aircraftHoursAtPerform: integer("aircraft_hours_at_perform"), // Aircraft hours at completion
  aircraftCyclesAtPerform: integer("aircraft_cycles_at_perform"), // Aircraft cycles at completion

  // Parts replaced
  partsReplaced: text("parts_replaced", { mode: "json" }),

  // Findings and discrepancies
  findings: text("findings"),
  discrepancies: text("discrepancies"),

  // Next due calculation (for reference)
  nextDueDate: integer("next_due_date"),

  createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
});

export type MaintenanceHistory = typeof maintenanceHistory.$inferSelect;
export type NewMaintenanceHistory = typeof maintenanceHistory.$inferInsert;
