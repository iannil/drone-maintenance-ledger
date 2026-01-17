/**
 * Maintenance Program Repository
 *
 * Database operations for maintenance programs
 */

import { Injectable } from "@nestjs/common";
import { eq, like, desc, and } from "drizzle-orm";

import type { MaintenanceProgram, NewMaintenanceProgram } from "@repo/db";
import { maintenanceProgram } from "@repo/db";
import { db } from "@repo/db";

@Injectable()
export class MaintenanceProgramRepository {
  /**
   * Find program by ID
   */
  async findById(id: string): Promise<MaintenanceProgram | null> {
    const result = await db.select().from(maintenanceProgram).where(eq(maintenanceProgram.id, id));
    return result[0] || null;
  }

  /**
   * Find default program for aircraft model
   */
  async findDefaultForModel(aircraftModel: string): Promise<MaintenanceProgram | null> {
    const result = await db
      .select()
      .from(maintenanceProgram)
      .where(
        and(
          eq(maintenanceProgram.aircraftModel, aircraftModel),
          eq(maintenanceProgram.isDefault, true),
          eq(maintenanceProgram.isActive, true)
        )
      );
    return result[0] || null;
  }

  /**
   * Find programs for aircraft model
   */
  async findByAircraftModel(aircraftModel: string): Promise<MaintenanceProgram[]> {
    return db
      .select()
      .from(maintenanceProgram)
      .where(
        and(
          eq(maintenanceProgram.aircraftModel, aircraftModel),
          eq(maintenanceProgram.isActive, true)
        )
      );
  }

  /**
   * Create new program
   */
  async create(data: NewMaintenanceProgram): Promise<MaintenanceProgram> {
    const result = await db.insert(maintenanceProgram).values(data).returning();
    if (!result[0]) {
      throw new Error("Failed to create maintenance program");
    }
    return result[0];
  }

  /**
   * Update program
   */
  async update(id: string, data: Partial<NewMaintenanceProgram>): Promise<MaintenanceProgram> {
    const result = await db
      .update(maintenanceProgram)
      .set({ ...data, updatedAt: Date.now() })
      .where(eq(maintenanceProgram.id, id))
      .returning();
    if (!result[0]) {
      throw new Error(`Maintenance program with id ${id} not found`);
    }
    return result[0];
  }

  /**
   * Delete program
   */
  async delete(id: string): Promise<void> {
    await db.delete(maintenanceProgram).where(eq(maintenanceProgram.id, id));
  }

  /**
   * List all programs
   */
  async list(options: {
    limit?: number;
    offset?: number;
    aircraftModel?: string;
    isActive?: boolean;
  } = {}): Promise<MaintenanceProgram[]> {
    const { limit = 50, offset = 0, aircraftModel, isActive } = options;

    let conditions: any[] = [];
    if (aircraftModel) {
      conditions.push(eq(maintenanceProgram.aircraftModel, aircraftModel));
    }
    if (isActive !== undefined) {
      conditions.push(eq(maintenanceProgram.isActive, isActive));
    }

    let query = db.select().from(maintenanceProgram);
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    return query
      .orderBy(desc(maintenanceProgram.createdAt))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Count programs
   */
  async count(isActive?: boolean): Promise<number> {
    const result = await db.select().from(maintenanceProgram);
    if (isActive !== undefined) {
      return result.filter(p => p.isActive === isActive).length;
    }
    return result.length;
  }
}
