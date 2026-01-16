/**
 * Flight Log Schema
 *
 * Records of aircraft flights - the "daily diary" of each aircraft
 */

import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { aircraft } from "../core/aircraft";
import { user } from "../core/user";

/**
 * Flight type enum
 */
export const FlightTypeEnum = {
  OPERATION: "OPERATION", // Normal operation
  TRAINING: "TRAINING", // Training flight
  TEST: "TEST", // Test flight
  FERRY: "FERRY", // Ferry flight
  DELIVERY: "DELIVERY", // Delivery flight
} as const;

export type FlightType = (typeof FlightTypeEnum)[keyof typeof FlightTypeEnum];

/**
 * Flight logs table
 *
 * Records all flights performed by aircraft
 * This is the legal record of aircraft operation
 */
export const flightLog = sqliteTable("flight_log", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),

  // Aircraft
  aircraftId: text("aircraft_id")
    .notNull()
    .references(() => aircraft.id, { onDelete: "restrict" }),

  // Flight details
  flightDate: integer("flight_date").notNull(),
  flightType: text("flight_type").notNull().default("OPERATION"),

  // Locations
  departureLocation: text("departure_location").notNull(),
  departureTime: integer("departure_time"),
  arrivalLocation: text("arrival_location"),
  arrivalTime: integer("arrival_time"),

  // Pilot info
  pilotId: text("pilot_id")
    .notNull()
    .references(() => user.id, { onDelete: "set null" }),
  copilotId: text("copilot_id").references(() => user.id, { onDelete: "set null" }),

  // Flight metrics
  flightDuration: integer("flight_duration").notNull(), // In minutes
  flightHours: integer("flight_hours").notNull(), // In hours (for maintenance tracking)
  takeoffCycles: integer("takeoff_cycles").notNull().default(1), // Usually 1 per flight
  landingCycles: integer("landing_cycles").notNull().default(1),

  // Mission/purpose
  missionDescription: text("mission_description"),
  payloadWeight: integer("payload_weight"), // kg

  // Pre-flight check
  preFlightCheckCompleted: integer("pre_flight_check_completed", { mode: "boolean" }).notNull().default(true),
  preFlightCheckBy: text("pre_flight_check_by").references(() => user.id),

  // Post-flight status
  postFlightNotes: text("post_flight_notes"),
  discrepancies: text("discrepancies"), // Any issues found

  // Automatic updates to aircraft totals
  aircraftHoursBefore: integer("aircraft_hours_before"),
  aircraftHoursAfter: integer("aircraft_hours_after"),
  aircraftCyclesBefore: integer("aircraft_cycles_before"),
  aircraftCyclesAfter: integer("aircraft_cycles_after"),

  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
  updatedAt: integer("updated_at").notNull().$defaultFn(() => Date.now()),
});

export type FlightLog = typeof flightLog.$inferSelect;
export type NewFlightLog = typeof flightLog.$inferInsert;
