/**
 * Work Order Part Schema
 *
 * Parts consumed during work order execution
 */

import { pgTable, text, timestamp, uuid, integer } from "drizzle-orm/pg-core";
import { workOrder } from "./work-order.js";
import { component } from "../core/component.js";

/**
 * Work order parts table
 *
 * Tracks parts used/consumed during work order
 */
export const workOrderPart = pgTable("work_order_part", {
  id: uuid("id").primaryKey().defaultRandom(),
  workOrderId: uuid("work_order_id")
    .notNull()
    .references(() => workOrder.id, { onDelete: "cascade" }),

  // Part details
  componentId: uuid("component_id").references(() => component.id, { onDelete: "set null" }),
  partNumber: text("part_number").notNull(),
  partName: text("part_name").notNull(),
  quantity: integer("quantity").notNull(),
  unit: text("unit").notNull(), // e.g., "EA", "SET"

  // Installed on
  installedLocation: text("installed_location"), // Where installed (if applicable)

  // Removed parts (for replacements)
  removedComponentId: uuid("removed_component_id").references(() => component.id),
  removedSerialNumber: text("removed_serial_number"),

  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type WorkOrderPart = typeof workOrderPart.$inferSelect;
export type NewWorkOrderPart = typeof workOrderPart.$inferInsert;
