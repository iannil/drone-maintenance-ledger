import { Injectable, NotFoundException } from "@nestjs/common";
import { eq, and, desc } from "drizzle-orm";

import type { WorkOrderPart, NewWorkOrderPart } from "@repo/db";
import { workOrderPart } from "@repo/db";
import { db } from "@repo/db";

/**
 * Work Order Part repository
 *
 * Handles database operations for work order parts
 */
@Injectable()
export class WorkOrderPartRepository {
  /**
   * Find part by ID
   */
  async findById(id: string): Promise<WorkOrderPart | null> {
    const result = await db.select().from(workOrderPart).where(eq(workOrderPart.id, id));
    return result[0] || null;
  }

  /**
   * Find parts for a work order
   */
  async findByWorkOrder(workOrderId: string) {
    return db
      .select()
      .from(workOrderPart)
      .where(and(eq(workOrderPart.workOrderId, workOrderId), eq(workOrderPart.isActive, true)))
      .orderBy(desc(workOrderPart.createdAt));
  }

  /**
   * Create new part record
   */
  async create(data: NewWorkOrderPart): Promise<WorkOrderPart> {
    const result = await db.insert(workOrderPart).values(data).returning();
    return result[0];
  }

  /**
   * Create multiple part records
   */
  async createMany(data: NewWorkOrderPart[]): Promise<WorkOrderPart[]> {
    const result = await db.insert(workOrderPart).values(data).returning();
    return result;
  }

  /**
   * Update part record
   */
  async update(id: string, data: Partial<NewWorkOrderPart>): Promise<WorkOrderPart> {
    const result = await db
      .update(workOrderPart)
      .set(data)
      .where(eq(workOrderPart.id, id))
      .returning();

    if (!result[0]) {
      throw new NotFoundException(`Work order part with id ${id} not found`);
    }

    return result[0];
  }

  /**
   * Delete part record (soft delete)
   */
  async delete(id: string): Promise<void> {
    await db
      .update(workOrderPart)
      .set({ isActive: false })
      .where(eq(workOrderPart.id, id));
  }

  /**
   * Delete all parts for a work order
   */
  async deleteByWorkOrder(workOrderId: string): Promise<void> {
    await db
      .update(workOrderPart)
      .set({ isActive: false })
      .where(eq(workOrderPart.workOrderId, workOrderId));
  }
}
