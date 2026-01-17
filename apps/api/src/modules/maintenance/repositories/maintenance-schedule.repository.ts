/**
 * Maintenance Schedule Repository
 *
 * Database operations for maintenance schedules
 */

import { Injectable } from "@nestjs/common";
import { eq, and, desc, lte, inArray, isNull, sql } from "drizzle-orm";

import type { MaintenanceSchedule, NewMaintenanceSchedule } from "@repo/db";
import { maintenanceSchedule } from "@repo/db";
import { db } from "@repo/db";

@Injectable()
export class MaintenanceScheduleRepository {
  /**
   * Find schedule by ID
   */
  async findById(id: string): Promise<MaintenanceSchedule | null> {
    const result = await db.select().from(maintenanceSchedule).where(eq(maintenanceSchedule.id, id));
    return result[0] || null;
  }

  /**
   * Find schedule by aircraft and trigger
   */
  async findByAircraftAndTrigger(
    aircraftId: string,
    triggerId: string
  ): Promise<MaintenanceSchedule | null> {
    const result = await db
      .select()
      .from(maintenanceSchedule)
      .where(
        and(
          eq(maintenanceSchedule.aircraftId, aircraftId),
          eq(maintenanceSchedule.triggerId, triggerId),
          eq(maintenanceSchedule.isActive, true)
        )
      );
    return result[0] || null;
  }

  /**
   * Find schedules for an aircraft
   */
  async findByAircraftId(aircraftId: string): Promise<MaintenanceSchedule[]> {
    return db
      .select()
      .from(maintenanceSchedule)
      .where(
        and(
          eq(maintenanceSchedule.aircraftId, aircraftId),
          eq(maintenanceSchedule.isActive, true)
        )
      )
      .orderBy(maintenanceSchedule.dueDate);
  }

  /**
   * Find due or overdue schedules
   */
  async findDueOrOverdue(): Promise<MaintenanceSchedule[]> {
    const now = Date.now();
    return db
      .select()
      .from(maintenanceSchedule)
      .where(
        and(
          eq(maintenanceSchedule.isActive, true),
          inArray(maintenanceSchedule.status, ["DUE", "OVERDUE"])
        )
      )
      .orderBy(maintenanceSchedule.dueDate);
  }

  /**
   * Find schedules due within N days
   */
  async findDueWithinDays(days: number): Promise<MaintenanceSchedule[]> {
    const futureDate = Date.now() + days * 24 * 60 * 60 * 1000;
    return db
      .select()
      .from(maintenanceSchedule)
      .where(
        and(
          eq(maintenanceSchedule.isActive, true),
          eq(maintenanceSchedule.status, "SCHEDULED"),
          lte(maintenanceSchedule.dueDate, futureDate)
        )
      )
      .orderBy(maintenanceSchedule.dueDate);
  }

  /**
   * Find schedules without work orders that are due
   */
  async findDueWithoutWorkOrder(): Promise<MaintenanceSchedule[]> {
    return db
      .select()
      .from(maintenanceSchedule)
      .where(
        and(
          eq(maintenanceSchedule.isActive, true),
          inArray(maintenanceSchedule.status, ["DUE", "OVERDUE"]),
          isNull(maintenanceSchedule.workOrderId)
        )
      )
      .orderBy(maintenanceSchedule.dueDate);
  }

  /**
   * Create new schedule
   */
  async create(data: NewMaintenanceSchedule): Promise<MaintenanceSchedule> {
    const result = await db.insert(maintenanceSchedule).values(data).returning();
    if (!result[0]) {
      throw new Error("Failed to create maintenance schedule");
    }
    return result[0];
  }

  /**
   * Create multiple schedules
   */
  async createMany(data: NewMaintenanceSchedule[]): Promise<MaintenanceSchedule[]> {
    if (data.length === 0) return [];
    const result = await db.insert(maintenanceSchedule).values(data).returning();
    return result;
  }

  /**
   * Update schedule
   */
  async update(id: string, data: Partial<NewMaintenanceSchedule>): Promise<MaintenanceSchedule> {
    const result = await db
      .update(maintenanceSchedule)
      .set({ ...data, updatedAt: Date.now() })
      .where(eq(maintenanceSchedule.id, id))
      .returning();
    if (!result[0]) {
      throw new Error(`Maintenance schedule with id ${id} not found`);
    }
    return result[0];
  }

  /**
   * Update status for multiple schedules
   */
  async updateStatusBatch(ids: string[], status: string): Promise<void> {
    if (ids.length === 0) return;
    await db
      .update(maintenanceSchedule)
      .set({ status, updatedAt: Date.now() })
      .where(inArray(maintenanceSchedule.id, ids));
  }

  /**
   * Delete schedule
   */
  async delete(id: string): Promise<void> {
    await db.delete(maintenanceSchedule).where(eq(maintenanceSchedule.id, id));
  }

  /**
   * Delete schedules for an aircraft
   */
  async deleteByAircraftId(aircraftId: string): Promise<void> {
    await db.delete(maintenanceSchedule).where(eq(maintenanceSchedule.aircraftId, aircraftId));
  }

  /**
   * List all schedules
   */
  async list(options: {
    limit?: number;
    offset?: number;
    aircraftId?: string;
    status?: string;
    isActive?: boolean;
  } = {}): Promise<MaintenanceSchedule[]> {
    const { limit = 50, offset = 0, aircraftId, status, isActive } = options;

    let conditions: any[] = [];
    if (aircraftId) {
      conditions.push(eq(maintenanceSchedule.aircraftId, aircraftId));
    }
    if (status) {
      conditions.push(eq(maintenanceSchedule.status, status));
    }
    if (isActive !== undefined) {
      conditions.push(eq(maintenanceSchedule.isActive, isActive));
    }

    let query = db.select().from(maintenanceSchedule);
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    return query
      .orderBy(maintenanceSchedule.dueDate)
      .limit(limit)
      .offset(offset);
  }

  /**
   * Count schedules by status
   */
  async countByStatus(): Promise<Record<string, number>> {
    const result = await db.select().from(maintenanceSchedule).where(eq(maintenanceSchedule.isActive, true));

    const counts: Record<string, number> = {
      SCHEDULED: 0,
      DUE: 0,
      OVERDUE: 0,
      IN_PROGRESS: 0,
      COMPLETED: 0,
    };

    for (const schedule of result) {
      const status = schedule.status;
      if (status in counts) {
        counts[status] = (counts[status] ?? 0) + 1;
      }
    }

    return counts;
  }
}
