/**
 * Release Record Schema
 *
 * Records aircraft release to service after maintenance
 * This is a legally significant document
 */

import { pgTable, text, timestamp, uuid, boolean } from "drizzle-orm/pg-core";
import { aircraft } from "../core/aircraft.js";
import { user } from "../core/user.js";

/**
 * Release status
 */
export const ReleaseStatusEnum = {
  GROUNDED: "GROUNDED", // Not released, aircraft grounded
  CONDITIONAL: "CONDITIONAL", // Released with conditions
  FULL: "FULL", // Fully released for service
} as const;

export type ReleaseStatus = (typeof ReleaseStatusEnum)[keyof typeof ReleaseStatusEnum];

/**
 * Release records table
 *
 * Records authorization for aircraft to return to service
 */
export const releaseRecord = pgTable("release_record", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Aircraft
  aircraftId: uuid("aircraft_id")
    .notNull()
    .references(() => aircraft.id, { onDelete: "restrict" }),

  // Associated work order (if applicable)
  workOrderId: uuid("work_order_id"),

  // Release details
  releaseStatus: text("release_status", {
    enum: ["GROUNDED", "CONDITIONAL", "FULL"],
  }).notNull().default("FULL"),

  // Authorizing personnel
  releasedBy: uuid("released_by")
    .notNull()
    .references(() => user.id, { onDelete: "set null" }),
  releaseCertificateNumber: text("release_certificate_number"), // Form 1 or equivalent

  // Conditions (if conditional release)
  conditions: text("conditions"),

  // Scope of work performed
  workDescription: text("work_description").notNull(),

  // Limitations
  limitations: text("limitations"), // Any operational limitations

  // Signature (electronic signature hash)
  signatureHash: text("signature_hash"),

  // Validity
  isValid: boolean("is_valid").notNull().default(true),
  supersededBy: uuid("superseded_by"), // If this release is superseded by another

  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type ReleaseRecord = typeof releaseRecord.$inferSelect;
export type NewReleaseRecord = typeof releaseRecord.$inferInsert;
