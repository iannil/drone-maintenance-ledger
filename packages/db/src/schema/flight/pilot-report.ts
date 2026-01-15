/**
 * Pilot Report (PIREP) Schema
 *
 * Pilot reports of issues/defects discovered during flight
 */

import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { aircraft } from "../core/aircraft.js";
import { user } from "../core/user.js";

/**
 * PIREP severity levels
 */
export const PirepSeverityEnum = {
  LOW: "LOW", // Minor issue, can be deferred
  MEDIUM: "MEDIUM", // Should be fixed soon
  HIGH: "HIGH", // Should be fixed before next flight
  CRITICAL: "CRITICAL", // AOG - Aircraft On Ground, immediate attention required
} as const;

export type PirepSeverity = (typeof PirepSeverityEnum)[keyof typeof PirepSeverityEnum];

/**
 * PIREP status
 */
export const PirepStatusEnum = {
  OPEN: "OPEN", // Just reported
  ACKNOWLEDGED: "ACKNOWLEDGED", // Acknowledged by maintenance
  INVESTIGATING: "INVESTIGATING", // Under investigation
  WORK_ORDER_CREATED: "WORK_ORDER_CREATED", // Work order created
  RESOLVED: "RESOLVED", // Issue resolved
  CANCELLED: "CANCELLED", // False alarm
} as const;

export type PirepStatus = (typeof PirepStatusEnum)[keyof typeof PirepStatusEnum];

/**
 * Pilot reports table
 *
 * Records issues reported by pilots during/after flights
 */
export const pilotReport = pgTable("pilot_report", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Aircraft and flight
  aircraftId: uuid("aircraft_id")
    .notNull()
    .references(() => aircraft.id, { onDelete: "restrict" }),
  flightLogId: uuid("flight_log_id"), // Associated flight log if applicable

  // Reporter
  reportedBy: uuid("reported_by")
    .notNull()
    .references(() => user.id, { onDelete: "set null" }),

  // Issue details
  title: text("title").notNull(),
  description: text("description").notNull(),
  severity: text("severity", {
    enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
  }).notNull(),

  // Status tracking
  status: text("status", {
    enum: ["OPEN", "ACKNOWLEDGED", "INVESTIGATING", "WORK_ORDER_CREATED", "RESOLVED", "CANCELLED"],
  }).notNull().default("OPEN"),

  // AOG flag
  isAog: boolean("is_aog").notNull().default(false), // Aircraft On Ground

  // Affected system/component
  affectedSystem: text("affected_system"), // e.g., "POWER", "COMMUNICATION", "NAVIGATION"
  affectedComponent: text("affected_component"), // Specific component

  // Resolution
  workOrderId: uuid("work_order_id"), // Link to work order if created
  resolution: text("resolution"),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: uuid("resolved_by").references(() => user.id),

  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type PilotReport = typeof pilotReport.$inferSelect;
export type NewPilotReport = typeof pilotReport.$inferInsert;
