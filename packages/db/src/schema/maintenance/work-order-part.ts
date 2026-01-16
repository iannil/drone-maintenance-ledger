/**
 * Work Order Part Schema
 *
 * Parts consumed during work order execution
 */

import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { workOrder } from "./work-order";
import { component } from "../core/component";

/**
 * Work order parts table
 *
 * Tracks parts used/consumed during work order
 */
export const workOrderPart = sqliteTable("work_order_part", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  workOrderId: text("work_order_id")
    .notNull()
    .references(() => workOrder.id, { onDelete: "cascade" }),

  // Part details
  componentId: text("component_id").references(() => component.id, { onDelete: "set null" }),
  partNumber: text("part_number").notNull(),
  partName: text("part_name").notNull(),
  quantity: integer("quantity").notNull(),
  unit: text("unit").notNull(), // e.g., "EA", "SET"

  // Installed on
  installedLocation: text("installed_location"), // Where installed (if applicable)

  // Removed parts (for replacements)
  removedComponentId: text("removed_component_id").references(() => component.id),
  removedSerialNumber: text("removed_serial_number"),

  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
});

export type WorkOrderPart = typeof workOrderPart.$inferSelect;
export type NewWorkOrderPart = typeof workOrderPart.$inferInsert;
