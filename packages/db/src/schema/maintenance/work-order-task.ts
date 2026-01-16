/**
 * Work Order Task Schema
 *
 * Individual tasks within a work order
 */

import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { workOrder } from "./work-order";

/**
 * Task status
 */
export const TaskStatusEnum = {
  PENDING: "PENDING",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  SKIPPED: "SKIPPED",
  FAILED: "FAILED",
} as const;

export type TaskStatus = (typeof TaskStatusEnum)[keyof typeof TaskStatusEnum];

/**
 * Work order tasks table
 *
 * Individual checklist items within a work order
 */
export const workOrderTask = sqliteTable("work_order_task", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  workOrderId: text("work_order_id")
    .notNull()
    .references(() => workOrder.id, { onDelete: "cascade" }),

  // Task details
  sequence: integer("sequence").notNull(), // Order within work order
  title: text("title").notNull(),
  description: text("description"),
  instructions: text("instructions"), // Step-by-step instructions

  // Status
  status: text("status").notNull().default("PENDING"),

  // RII (Required Inspection Item)
  isRii: integer("is_rii", { mode: "boolean" }).notNull().default(false),
  inspectedBy: text("inspected_by"), // Inspector who signed off

  // Timing
  startedAt: integer("started_at"),
  completedAt: integer("completed_at"),

  // Results
  result: text("result"), // Pass/Fail/Findings
  notes: text("notes"),
  photos: text("photos", { mode: "json" }), // URLs to photos

  // Required tools/parts
  requiredTools: text("required_tools", { mode: "json" }),
  requiredParts: text("required_parts", { mode: "json" }),

  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
  updatedAt: integer("updated_at").notNull().$defaultFn(() => Date.now()),
});

export type WorkOrderTask = typeof workOrderTask.$inferSelect;
export type NewWorkOrderTask = typeof workOrderTask.$inferInsert;
