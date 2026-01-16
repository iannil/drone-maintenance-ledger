/**
 * Aircraft Schema
 *
 * Represents an individual aircraft/drone with its airworthiness status
 */

import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { fleet } from "./fleet";

/**
 * Aircraft status enum
 */
export const AircraftStatusEnum = {
  AVAILABLE: "AVAILABLE", // Available for flight
  IN_MAINTENANCE: "IN_MAINTENANCE", // Under maintenance
  AOG: "AOG", // Aircraft on Ground - unavailable due to maintenance issues
  RETIRED: "RETIRED", // Permanently out of service
} as const;

export type AircraftStatus = (typeof AircraftStatusEnum)[keyof typeof AircraftStatusEnum];

/**
 * Aircraft table
 *
 * Stores individual aircraft records with their registration and status
 */
export const aircraft = sqliteTable("aircraft", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  fleetId: text("fleet_id")
    .notNull()
    .references(() => fleet.id, { onDelete: "restrict" }),
  registrationNumber: text("registration_number").notNull().unique(), // e.g., "B-1234"
  serialNumber: text("serial_number").notNull(), // Manufacturer serial number
  model: text("model").notNull(), // e.g., "DJI Matrice 300 RTK"
  manufacturer: text("manufacturer").notNull(),
  status: text("status")
    .notNull()
    .default(AircraftStatusEnum.AVAILABLE),
  // Flight metrics
  totalFlightHours: integer("total_flight_hours").notNull().default(0),
  totalFlightCycles: integer("total_flight_cycles").notNull().default(0),
  // Airworthiness
  isAirworthy: integer("is_airworthy", { mode: "boolean" }).notNull().default(true),
  lastInspectionAt: integer("last_inspection_at"),
  nextInspectionDue: integer("next_inspection_due"),
  createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
  updatedAt: integer("updated_at").notNull().$defaultFn(() => Date.now()),
});

export type Aircraft = typeof aircraft.$inferSelect;
export type NewAircraft = typeof aircraft.$inferInsert;
