/**
 * User Schema
 *
 * Represents system users with RBAC (Role-Based Access Control)
 */

import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

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
export const user = pgTable("user", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: Object.values(UserRoleEnum) })
    .notNull()
    .default(UserRoleEnum.PILOT),
  fullName: text("full_name"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
