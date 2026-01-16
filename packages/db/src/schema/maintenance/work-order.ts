/**
 * Work Order Schema
 *
 * Manages maintenance work orders
 */

import { pgTable, text, timestamp, uuid, integer, boolean, jsonb } from "drizzle-orm/pg-core";
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
export const workOrder = pgTable("work_order", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderNumber: text("order_number").notNull().unique(), // Human-readable WO number

  // Aircraft
  aircraftId: uuid("aircraft_id")
    .notNull()
    .references(() => aircraft.id, { onDelete: "restrict" }),

  // Type and status
  type: text("type", {
    enum: ["SCHEDULED", "INSPECTION", "REPAIR", "MODIFICATION", "EMERGENCY"],
  }).notNull(),
  status: text("status", {
    enum: ["DRAFT", "OPEN", "IN_PROGRESS", "PENDING_PARTS", "PENDING_INSPECTION", "COMPLETED", "RELEASED", "CANCELLED"],
  }).notNull().default("DRAFT"),
  priority: text("priority", { enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] })
    .notNull()
    .default("MEDIUM"),

  // Description
  title: text("title").notNull(),
  description: text("description"),
  reason: text("reason"), // Why this work is needed (for repairs)

  // Assignment
  assignedTo: uuid("assigned_to").references(() => user.id, { onDelete: "set null" }),
  assignedAt: timestamp("assigned_at"),

  // Scheduling
  scheduledStart: timestamp("scheduled_start"),
  scheduledEnd: timestamp("scheduled_end"),
  actualStart: timestamp("actual_start"),
  actualEnd: timestamp("actual_end"),

  // Aircraft status at work order creation
  aircraftHours: integer("aircraft_hours"), // Aircraft hours at WO creation
  aircraftCycles: integer("aircraft_cycles"), // Aircraft cycles at WO creation

  // Sign-off
  completedBy: uuid("completed_by").references(() => user.id, { onDelete: "set null" }),
  completedAt: timestamp("completed_at"),
  releasedBy: uuid("released_by").references(() => user.id, { onDelete: "set null" }),
  releasedAt: timestamp("released_at"),

  // Notes
  completionNotes: text("completion_notes"),
  discrepancies: text("discrepancies"),

  // Linked maintenance schedule (if applicable)
  scheduleId: uuid("schedule_id"),

  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type WorkOrder = typeof workOrder.$inferSelect;
export type NewWorkOrder = typeof workOrder.$inferInsert;
