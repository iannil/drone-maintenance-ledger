/**
 * Component Schema
 *
 * Represents a component/part with decoupled history tracking
 * This is the CORE of the "component history follows component" principle
 */

import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Component types
 */
export const ComponentTypeEnum = {
  MOTOR: "MOTOR",
  PROPELLER: "PROPELLER",
  BATTERY: "BATTERY",
  ESC: "ESC", // Electronic Speed Controller
  FLIGHT_CONTROLLER: "FLIGHT_CONTROLLER",
  GPS: "GPS",
  CAMERA: "CAMERA",
  GIMBAL: "GIMBAL",
  LANDING_GEAR: "LANDING_GEAR",
  OTHER: "OTHER",
} as const;

export type ComponentType = (typeof ComponentTypeEnum)[keyof typeof ComponentTypeEnum];

/**
 * Component status
 */
export const ComponentStatusEnum = {
  NEW: "NEW",
  IN_USE: "IN_USE",
  REPAIR: "REPAIR",
  SCRAPPED: "SCRAPPED",
  LOST: "LOST",
} as const;

export type ComponentStatus = (typeof ComponentStatusEnum)[keyof typeof ComponentStatusEnum];

/**
 * Components table
 *
 * IMPORTANT: Component history follows the component, not the aircraft.
 * When a component is moved between aircraft, its cumulative values (totalFlightHours, etc.)
 * must transfer with it. This is aviation industry standard.
 */
export const component = sqliteTable("component", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  serialNumber: text("serial_number").notNull().unique(), // Component serial number (unique ID)
  partNumber: text("part_number").notNull(), // Manufacturer part number
  type: text("type").notNull(),
  manufacturer: text("manufacturer").notNull(),
  model: text("model"),
  description: text("description"),

  // Cumulative lifecycle data - FOLLOWS THE COMPONENT
  totalFlightHours: integer("total_flight_hours").notNull().default(0),
  totalFlightCycles: integer("total_flight_cycles").notNull().default(0),
  batteryCycles: integer("battery_cycles").notNull().default(0), // For batteries only

  // Life Limited Parts (LLP) tracking
  isLifeLimited: integer("is_life_limited", { mode: "boolean" }).notNull().default(false),
  maxFlightHours: integer("max_flight_hours"), // Maximum hours before mandatory replacement
  maxCycles: integer("max_cycles"), // Maximum cycles before mandatory replacement

  // Status
  status: text("status")
    .notNull()
    .default(ComponentStatusEnum.NEW),
  isAirworthy: integer("is_airworthy", { mode: "boolean" }).notNull().default(true),

  // Timestamps
  manufacturedAt: integer("manufactured_at"),
  purchasedAt: integer("purchased_at"),
  createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
  updatedAt: integer("updated_at").notNull().$defaultFn(() => Date.now()),
});

export type Component = typeof component.$inferSelect;
export type NewComponent = typeof component.$inferInsert;
