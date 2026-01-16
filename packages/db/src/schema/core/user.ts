/**
 * User Schema
 *
 * Represents system users with RBAC (Role-Based Access Control)
 */

import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * User roles for RBAC
 */
export const UserRoleEnum = {
  PILOT: "PILOT",
  MECHANIC: "MECHANIC",
  INSPECTOR: "INSPECTOR",
  MANAGER: "MANAGER",
  ADMIN: "ADMIN",
} as const;

export type UserRole = (typeof UserRoleEnum)[keyof typeof UserRoleEnum];

/**
 * Users table
 *
 * Stores user accounts with their role and permissions
 */
export const user = sqliteTable("user", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role")
    .notNull()
    .default(UserRoleEnum.PILOT),
  fullName: text("full_name"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
  updatedAt: integer("updated_at").notNull().$defaultFn(() => Date.now()),
});

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
