/**
 * Maintenance Schedule Schema
 *
 * Links aircraft to maintenance programs and tracks due dates
 */

import { pgTable, text, timestamp, uuid, boolean, integer } from "drizzle-orm/pg-core";
import { aircraft } from "../core/aircraft.js";
import { maintenanceTrigger } from "./maintenance-trigger.js";

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
export const maintenanceSchedule = pgTable("maintenance_schedule", {
  id: uuid("id").primaryKey().defaultRandom(),
  aircraftId: uuid("aircraft_id")
    .notNull()
    .references(() => aircraft.id, { onDelete: "cascade" }),
  triggerId: uuid("trigger_id")
    .notNull()
    .references(() => maintenanceTrigger.id, { onDelete: "cascade" }),

  // Current status
  status: text("status", {
    enum: ["SCHEDULED", "DUE", "OVERDUE", "IN_PROGRESS", "COMPLETED", "SKIPPED"],
  }).notNull().default("SCHEDULED"),

  // Due date calculation
  dueDate: timestamp("due_date"), // When this maintenance is due
  dueAtValue: integer("due_at_value"), // The value that triggers due (e.g., 50 hours)

  // Last completed info
  lastCompletedAt: timestamp("last_completed_at"),
  lastCompletedAtValue: integer("last_completed_at_value"), // Value at last completion (e.g., 100 hours)

  // Assigned to
  assignedTo: uuid("assigned_to"), // User ID

  // Work order reference
  workOrderId: uuid("work_order_id"), // Link to work order when created

  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type MaintenanceSchedule = typeof maintenanceSchedule.$inferSelect;
export type NewMaintenanceSchedule = typeof maintenanceSchedule.$inferInsert;
