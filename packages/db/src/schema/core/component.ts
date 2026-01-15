/**
 * Component Schema
 *
 * Represents a component/part with decoupled history tracking
 * This is the CORE of the "component history follows component" principle
 */

import { pgTable, text, timestamp, uuid, integer, boolean } from "drizzle-orm/pg-core";

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
export const component = pgTable("component", {
  id: uuid("id").primaryKey().defaultRandom(),
  serialNumber: text("serial_number").notNull().unique(), // Component serial number (unique ID)
  partNumber: text("part_number").notNull(), // Manufacturer part number
  type: text("type", { enum: Object.values(ComponentTypeEnum) }).notNull(),
  manufacturer: text("manufacturer").notNull(),
  model: text("model"),
  description: text("description"),

  // Cumulative lifecycle data - FOLLOWS THE COMPONENT
  totalFlightHours: integer("total_flight_hours").notNull().default(0),
  totalFlightCycles: integer("total_flight_cycles").notNull().default(0),
  batteryCycles: integer("battery_cycles").notNull().default(0), // For batteries only

  // Life Limited Parts (LLP) tracking
  isLifeLimited: boolean("is_life_limited").notNull().default(false),
  maxFlightHours: integer("max_flight_hours"), // Maximum hours before mandatory replacement
  maxCycles: integer("max_cycles"), // Maximum cycles before mandatory replacement

  // Status
  status: text("status", { enum: Object.values(ComponentStatusEnum) })
    .notNull()
    .default(ComponentStatusEnum.NEW),
  isAirworthy: boolean("is_airworthy").notNull().default(true),

  // Timestamps
  manufacturedAt: timestamp("manufactured_at"),
  purchasedAt: timestamp("purchased_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Component = typeof component.$inferSelect;
export type NewComponent = typeof component.$inferInsert;
