/**
 * Fleet Schema
 *
 * Represents a fleet - a collection of aircraft owned/operated by an organization
 */

import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * Fleets table
 *
 * A fleet groups aircraft together for management purposes
 */
export const fleet = pgTable("fleet", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(), // Unique fleet code, e.g., "FLT-001"
  organization: text("organization").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Fleet = typeof fleet.$inferSelect;
export type NewFleet = typeof fleet.$inferInsert;
