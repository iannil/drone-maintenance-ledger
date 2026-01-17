import { Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

import type { User, NewUser } from "@repo/db";
import { db, user } from "@repo/db";

/**
 * User repository
 *
 * Handles database operations for users
 */
@Injectable()
export class UserRepository {
  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    const result = await db.select().from(user).where(eq(user.id, id));
    return result[0] || null;
  }

  /**
   * Find user by username
   */
  async findByUsername(username: string): Promise<User | null> {
    const result = await db.select().from(user).where(eq(user.username, username));
    return result[0] || null;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    const result = await db.select().from(user).where(eq(user.email, email));
    return result[0] || null;
  }

  /**
   * Create new user with password hashing
   */
  async create(data: Omit<NewUser, "passwordHash"> & { password: string }): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const result = await db
      .insert(user)
      .values({
        username: data.username,
        email: data.email,
        passwordHash: hashedPassword,
        role: data.role ?? "PILOT",
        fullName: data.fullName ?? null,
        isActive: data.isActive ?? true,
      })
      .returning();

    if (!result[0]) {
      throw new Error("Failed to create user");
    }
    return result[0];
  }

  /**
   * Verify password
   */
  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Update user
   */
  async update(id: string, data: Partial<NewUser>): Promise<User> {
    const result = await db.update(user).set(data).where(eq(user.id, id)).returning();
    if (!result[0]) {
      throw new Error(`User with id ${id} not found`);
    }
    return result[0];
  }

  /**
   * Delete user
   */
  async delete(id: string): Promise<void> {
    await db.delete(user).where(eq(user.id, id));
  }

  /**
   * List all users (paginated)
   */
  async list(limit: number = 50, offset: number = 0): Promise<User[]> {
    return db.select().from(user).limit(limit).offset(offset);
  }
}
