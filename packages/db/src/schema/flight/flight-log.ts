/**
 * Flight Log Schema
 *
 * Records of aircraft flights - the "daily diary" of each aircraft
 */

import { pgTable, text, timestamp, uuid, integer, boolean } from "drizzle-orm/pg-core";
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
export const flightLog = pgTable("flight_log", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Aircraft
  aircraftId: uuid("aircraft_id")
    .notNull()
    .references(() => aircraft.id, { onDelete: "restrict" }),

  // Flight details
  flightDate: timestamp("flight_date").notNull(),
  flightType: text("flight_type", {
    enum: ["OPERATION", "TRAINING", "TEST", "FERRY", "DELIVERY"],
  }).notNull().default("OPERATION"),

  // Locations
  departureLocation: text("departure_location").notNull(),
  departureTime: timestamp("departure_time"),
  arrivalLocation: text("arrival_location"),
  arrivalTime: timestamp("arrival_time"),

  // Pilot info
  pilotId: uuid("pilot_id")
    .notNull()
    .references(() => user.id, { onDelete: "set null" }),
  copilotId: uuid("copilot_id").references(() => user.id, { onDelete: "set null" }),

  // Flight metrics
  flightDuration: integer("flight_duration").notNull(), // In minutes
  flightHours: integer("flight_hours").notNull(), // In hours (for maintenance tracking)
  takeoffCycles: integer("takeoff_cycles").notNull().default(1), // Usually 1 per flight
  landingCycles: integer("landing_cycles").notNull().default(1),

  // Mission/purpose
  missionDescription: text("mission_description"),
  payloadWeight: integer("payload_weight"), // kg

  // Pre-flight check
  preFlightCheckCompleted: boolean("pre_flight_check_completed").notNull().default(true),
  preFlightCheckBy: uuid("pre_flight_check_by").references(() => user.id),

  // Post-flight status
  postFlightNotes: text("post_flight_notes"),
  discrepancies: text("discrepancies"), // Any issues found

  // Automatic updates to aircraft totals
  aircraftHoursBefore: integer("aircraft_hours_before"),
  aircraftHoursAfter: integer("aircraft_hours_after"),
  aircraftCyclesBefore: integer("aircraft_cycles_before"),
  aircraftCyclesAfter: integer("aircraft_cycles_after"),

  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type FlightLog = typeof flightLog.$inferSelect;
export type NewFlightLog = typeof flightLog.$inferInsert;
