/**
 * Fleet Schema
 *
 * Represents a fleet - a collection of aircraft owned/operated by an organization
 */

import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

/**
 * Fleets table
 *
 * A fleet groups aircraft together for management purposes
 */
export const fleet = sqliteTable("fleet", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  code: text("code").notNull().unique(), // Unique fleet code, e.g., "FLT-001"
  organization: text("organization").notNull(),
  description: text("description"),
  createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
  updatedAt: integer("updated_at").notNull().$defaultFn(() => Date.now()),
});

export type Fleet = typeof fleet.$inferSelect;
export type NewFleet = typeof fleet.$inferInsert;
