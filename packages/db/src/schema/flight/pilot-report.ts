/**
 * Pilot Report (PIREP) Schema
 *
 * Pilot reports of issues/defects discovered during flight
 */

import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { aircraft } from "../core/aircraft";
import { user } from "../core/user";

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
export const pilotReport = sqliteTable("pilot_report", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),

  // Aircraft and flight
  aircraftId: text("aircraft_id")
    .notNull()
    .references(() => aircraft.id, { onDelete: "restrict" }),
  flightLogId: text("flight_log_id"), // Associated flight log if applicable

  // Reporter
  reportedBy: text("reported_by")
    .notNull()
    .references(() => user.id, { onDelete: "set null" }),

  // Issue details
  title: text("title").notNull(),
  description: text("description").notNull(),
  severity: text("severity").notNull(),

  // Status tracking
  status: text("status").notNull().default("OPEN"),

  // AOG flag
  isAog: integer("is_aog", { mode: "boolean" }).notNull().default(false), // Aircraft On Ground

  // Affected system/component
  affectedSystem: text("affected_system"), // e.g., "POWER", "COMMUNICATION", "NAVIGATION"
  affectedComponent: text("affected_component"), // Specific component

  // Resolution
  workOrderId: text("work_order_id"), // Link to work order if created
  resolution: text("resolution"),
  resolvedAt: integer("resolved_at"),
  resolvedBy: text("resolved_by").references(() => user.id),

  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
  updatedAt: integer("updated_at").notNull().$defaultFn(() => Date.now()),
});

export type PilotReport = typeof pilotReport.$inferSelect;
export type NewPilotReport = typeof pilotReport.$inferInsert;
