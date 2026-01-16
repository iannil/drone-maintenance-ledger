/**
 * Release Record Schema
 *
 * Records aircraft release to service after maintenance
 * This is a legally significant document
 */

import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { aircraft } from "../core/aircraft";
import { user } from "../core/user";

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
export const releaseRecord = sqliteTable("release_record", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),

  // Aircraft
  aircraftId: text("aircraft_id")
    .notNull()
    .references(() => aircraft.id, { onDelete: "restrict" }),

  // Associated work order (if applicable)
  workOrderId: text("work_order_id"),

  // Release details
  releaseStatus: text("release_status").notNull().default("FULL"),

  // Authorizing personnel
  releasedBy: text("released_by")
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
  isValid: integer("is_valid", { mode: "boolean" }).notNull().default(true),
  supersededBy: text("superseded_by"), // If this release is superseded by another

  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
  updatedAt: integer("updated_at").notNull().$defaultFn(() => Date.now()),
});

export type ReleaseRecord = typeof releaseRecord.$inferSelect;
export type NewReleaseRecord = typeof releaseRecord.$inferInsert;
