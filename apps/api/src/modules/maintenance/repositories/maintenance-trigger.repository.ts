/**
 * Maintenance Trigger Repository
 *
 * Database operations for maintenance triggers
 */

import { Injectable } from "@nestjs/common";
import { eq, and, desc } from "drizzle-orm";

import type { MaintenanceTrigger, NewMaintenanceTrigger } from "@repo/db";
import { maintenanceTrigger } from "@repo/db";
import { db } from "@repo/db";

@Injectable()
export class MaintenanceTriggerRepository {
  /**
   * Find trigger by ID
   */
  async findById(id: string): Promise<MaintenanceTrigger | null> {
    const result = await db.select().from(maintenanceTrigger).where(eq(maintenanceTrigger.id, id));
    return result[0] || null;
  }

  /**
   * Find triggers for a program
   */
  async findByProgramId(programId: string): Promise<MaintenanceTrigger[]> {
    return db
      .select()
      .from(maintenanceTrigger)
      .where(
        and(
          eq(maintenanceTrigger.programId, programId),
          eq(maintenanceTrigger.isActive, true)
        )
      )
      .orderBy(desc(maintenanceTrigger.priority));
  }

  /**
   * Find active triggers by type
   */
  async findByType(type: string): Promise<MaintenanceTrigger[]> {
    return db
      .select()
      .from(maintenanceTrigger)
      .where(
        and(
          eq(maintenanceTrigger.type, type),
          eq(maintenanceTrigger.isActive, true)
        )
      );
  }

  /**
   * Create new trigger
   */
  async create(data: NewMaintenanceTrigger): Promise<MaintenanceTrigger> {
    const result = await db.insert(maintenanceTrigger).values(data).returning();
    if (!result[0]) {
      throw new Error("Failed to create maintenance trigger");
    }
    return result[0];
  }

  /**
   * Create multiple triggers
   */
  async createMany(data: NewMaintenanceTrigger[]): Promise<MaintenanceTrigger[]> {
    if (data.length === 0) return [];
    const result = await db.insert(maintenanceTrigger).values(data).returning();
    return result;
  }

  /**
   * Update trigger
   */
  async update(id: string, data: Partial<NewMaintenanceTrigger>): Promise<MaintenanceTrigger> {
    const result = await db
      .update(maintenanceTrigger)
      .set({ ...data, updatedAt: Date.now() })
      .where(eq(maintenanceTrigger.id, id))
      .returning();
    if (!result[0]) {
      throw new Error(`Maintenance trigger with id ${id} not found`);
    }
    return result[0];
  }

  /**
   * Delete trigger
   */
  async delete(id: string): Promise<void> {
    await db.delete(maintenanceTrigger).where(eq(maintenanceTrigger.id, id));
  }

  /**
   * Delete all triggers for a program
   */
  async deleteByProgramId(programId: string): Promise<void> {
    await db.delete(maintenanceTrigger).where(eq(maintenanceTrigger.programId, programId));
  }

  /**
   * List all triggers
   */
  async list(options: {
    limit?: number;
    offset?: number;
    programId?: string;
    type?: string;
    isActive?: boolean;
  } = {}): Promise<MaintenanceTrigger[]> {
    const { limit = 50, offset = 0, programId, type, isActive } = options;

    let conditions: any[] = [];
    if (programId) {
      conditions.push(eq(maintenanceTrigger.programId, programId));
    }
    if (type) {
      conditions.push(eq(maintenanceTrigger.type, type));
    }
    if (isActive !== undefined) {
      conditions.push(eq(maintenanceTrigger.isActive, isActive));
    }

    let query = db.select().from(maintenanceTrigger);
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    return query
      .orderBy(desc(maintenanceTrigger.createdAt))
      .limit(limit)
      .offset(offset);
  }
}
