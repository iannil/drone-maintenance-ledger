import { Injectable } from "@nestjs/common";
import { eq, like } from "drizzle-orm";

import type { Fleet, NewFleet } from "@repo/db";
import { fleet } from "@repo/db";
import { db } from "@repo/db";

/**
 * Fleet repository
 *
 * Handles database operations for fleets
 */
@Injectable()
export class FleetRepository {
  /**
   * Find fleet by ID
   */
  async findById(id: string): Promise<Fleet | null> {
    const result = await db.select().from(fleet).where(eq(fleet.id, id));
    return result[0] || null;
  }

  /**
   * Find fleet by code
   */
  async findByCode(code: string): Promise<Fleet | null> {
    const result = await db.select().from(fleet).where(eq(fleet.code, code));
    return result[0] || null;
  }

  /**
   * Create new fleet
   */
  async create(data: NewFleet): Promise<Fleet> {
    const result = await db.insert(fleet).values(data).returning();
    if (!result[0]) {
      throw new Error("Failed to create fleet");
    }
    return result[0];
  }

  /**
   * Update fleet
   */
  async update(id: string, data: Partial<NewFleet>): Promise<Fleet> {
    const result = await db
      .update(fleet)
      .set({ ...data, updatedAt: Date.now() })
      .where(eq(fleet.id, id))
      .returning();
    if (!result[0]) {
      throw new Error(`Fleet with id ${id} not found`);
    }
    return result[0];
  }

  /**
   * Delete fleet
   */
  async delete(id: string): Promise<void> {
    await db.delete(fleet).where(eq(fleet.id, id));
  }

  /**
   * List all fleets
   */
  async list(limit: number = 50, offset: number = 0): Promise<Fleet[]> {
    return db.select().from(fleet).limit(limit).offset(offset);
  }

  /**
   * Search fleets by name or code
   */
  async search(query: string, limit: number = 50): Promise<Fleet[]> {
    return db
      .select()
      .from(fleet)
      .where(like(fleet.name, `%${query}%`))
      .limit(limit);
  }
}
