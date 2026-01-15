/**
 * Work Order Task Schema
 *
 * Individual tasks within a work order
 */

import { pgTable, text, timestamp, uuid, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { workOrder } from "./work-order.js";

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
export const workOrderTask = pgTable("work_order_task", {
  id: uuid("id").primaryKey().defaultRandom(),
  workOrderId: uuid("work_order_id")
    .notNull()
    .references(() => workOrder.id, { onDelete: "cascade" }),

  // Task details
  sequence: integer("sequence").notNull(), // Order within work order
  title: text("title").notNull(),
  description: text("description"),
  instructions: text("instructions"), // Step-by-step instructions

  // Status
  status: text("status", {
    enum: ["PENDING", "IN_PROGRESS", "COMPLETED", "SKIPPED", "FAILED"],
  }).notNull().default("PENDING"),

  // RII (Required Inspection Item)
  isRii: boolean("is_rii").notNull().default(false),
  inspectedBy: uuid("inspected_by"), // Inspector who signed off

  // Timing
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),

  // Results
  result: text("result"), // Pass/Fail/Findings
  notes: text("notes"),
  photos: jsonb("photos").$type<string[]>(), // URLs to photos

  // Required tools/parts
  requiredTools: jsonb("required_tools").$type<string[]>(),
  requiredParts: jsonb("required_parts").$type<{
    partNumber: string;
    quantity: number;
  }[]>(),

  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type WorkOrderTask = typeof workOrderTask.$inferSelect;
export type NewWorkOrderTask = typeof workOrderTask.$inferInsert;
