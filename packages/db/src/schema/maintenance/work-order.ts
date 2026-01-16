/**
 * Work Order Schema
 *
 * Manages maintenance work orders
 */

import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { aircraft } from "../core/aircraft";
import { user } from "../core/user";

/**
 * Work order types
 */
export const WorkOrderTypeEnum = {
  SCHEDULED: "SCHEDULED", // Routine scheduled maintenance
  INSPECTION: "INSPECTION", // Inspection
  REPAIR: "REPAIR", // Unscheduled repair
  MODIFICATION: "MODIFICATION", // Modification/upgrade
  EMERGENCY: "EMERGENCY", // Emergency repair
} as const;

export type WorkOrderType = (typeof WorkOrderTypeEnum)[keyof typeof WorkOrderTypeEnum];

/**
 * Work order status
 */
export const WorkOrderStatusEnum = {
  DRAFT: "DRAFT", // Not yet submitted
  OPEN: "OPEN", // Open and assigned
  IN_PROGRESS: "IN_PROGRESS", // Work in progress
  PENDING_PARTS: "PENDING_PARTS", // Waiting for parts
  PENDING_INSPECTION: "PENDING_INSPECTION", // Waiting for inspection
  COMPLETED: "COMPLETED", // Work done, pending sign-off
  RELEASED: "RELEASED", // Signed off and aircraft released
  CANCELLED: "CANCELLED", // Cancelled
} as const;

export type WorkOrderStatus = (typeof WorkOrderStatusEnum)[keyof typeof WorkOrderStatusEnum];

/**
 * Work order priority
 */
export const WorkOrderPriorityEnum = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL",
} as const;

export type WorkOrderPriority = (typeof WorkOrderPriorityEnum)[keyof typeof WorkOrderPriorityEnum];

/**
 * Work orders table
 *
 * Main work order management
 */
export const workOrder = sqliteTable("work_order", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderNumber: text("order_number").notNull().unique(), // Human-readable WO number

  // Aircraft
  aircraftId: text("aircraft_id")
    .notNull()
    .references(() => aircraft.id, { onDelete: "restrict" }),

  // Type and status
  type: text("type").notNull(),
  status: text("status").notNull().default("DRAFT"),
  priority: text("priority")
    .notNull()
    .default("MEDIUM"),

  // Description
  title: text("title").notNull(),
  description: text("description"),
  reason: text("reason"), // Why this work is needed (for repairs)

  // Assignment
  assignedTo: text("assigned_to").references(() => user.id, { onDelete: "set null" }),
  assignedAt: integer("assigned_at"),

  // Scheduling
  scheduledStart: integer("scheduled_start"),
  scheduledEnd: integer("scheduled_end"),
  actualStart: integer("actual_start"),
  actualEnd: integer("actual_end"),

  // Aircraft status at work order creation
  aircraftHours: integer("aircraft_hours"), // Aircraft hours at WO creation
  aircraftCycles: integer("aircraft_cycles"), // Aircraft cycles at WO creation

  // Sign-off
  completedBy: text("completed_by").references(() => user.id, { onDelete: "set null" }),
  completedAt: integer("completed_at"),
  releasedBy: text("released_by").references(() => user.id, { onDelete: "set null" }),
  releasedAt: integer("released_at"),

  // Notes
  completionNotes: text("completion_notes"),
  discrepancies: text("discrepancies"),

  // Linked maintenance schedule (if applicable)
  scheduleId: text("schedule_id"),

  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
  updatedAt: integer("updated_at").notNull().$defaultFn(() => Date.now()),
});

export type WorkOrder = typeof workOrder.$inferSelect;
export type NewWorkOrder = typeof workOrder.$inferInsert;
