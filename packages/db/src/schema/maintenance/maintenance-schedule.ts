/**
 * Maintenance Schedule Schema
 *
 * Links aircraft to maintenance programs and tracks due dates
 */

import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { aircraft } from "../core/aircraft";
import { maintenanceTrigger } from "./maintenance-trigger";

/**
 * Maintenance status enum
 */
export const MaintenanceStatusEnum = {
  SCHEDULED: "SCHEDULED", // Upcoming maintenance
  DUE: "DUE", // Due now
  OVERDUE: "OVERDUE", // Past due
  IN_PROGRESS: "IN_PROGRESS", // Currently being worked on
  COMPLETED: "COMPLETED", // Completed
  SKIPPED: "SKIPPED", // Skipped (with reason)
} as const;

export type MaintenanceStatus = (typeof MaintenanceStatusEnum)[keyof typeof MaintenanceStatusEnum];

/**
 * Maintenance schedules table
 *
 * Tracks when maintenance is due for specific aircraft/trigger combinations
 */
export const maintenanceSchedule = sqliteTable("maintenance_schedule", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  aircraftId: text("aircraft_id")
    .notNull()
    .references(() => aircraft.id, { onDelete: "cascade" }),
  triggerId: text("trigger_id")
    .notNull()
    .references(() => maintenanceTrigger.id, { onDelete: "cascade" }),

  // Current status
  status: text("status").notNull().default("SCHEDULED"),

  // Due date calculation
  dueDate: integer("due_date"), // When this maintenance is due
  dueAtValue: integer("due_at_value"), // The value that triggers due (e.g., 50 hours)

  // Last completed info
  lastCompletedAt: integer("last_completed_at"),
  lastCompletedAtValue: integer("last_completed_at_value"), // Value at last completion (e.g., 100 hours)

  // Assigned to
  assignedTo: text("assigned_to"), // User ID

  // Work order reference
  workOrderId: text("work_order_id"), // Link to work order when created

  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
  updatedAt: integer("updated_at").notNull().$defaultFn(() => Date.now()),
});

export type MaintenanceSchedule = typeof maintenanceSchedule.$inferSelect;
export type NewMaintenanceSchedule = typeof maintenanceSchedule.$inferInsert;
