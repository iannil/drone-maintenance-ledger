import { Injectable, NotFoundException } from "@nestjs/common";
import { eq, and, desc } from "drizzle-orm";

import type { WorkOrderTask, NewWorkOrderTask } from "@repo/db";
import { workOrderTask } from "@repo/db";
import { db } from "@repo/db";

/**
 * Work Order Task repository
 *
 * Handles database operations for work order tasks
 */
@Injectable()
export class WorkOrderTaskRepository {
  /**
   * Find task by ID
   */
  async findById(id: string): Promise<WorkOrderTask | null> {
    const result = await db.select().from(workOrderTask).where(eq(workOrderTask.id, id));
    return result[0] || null;
  }

  /**
   * Find tasks for a work order
   */
  async findByWorkOrder(workOrderId: string) {
    return db
      .select()
      .from(workOrderTask)
      .where(and(eq(workOrderTask.workOrderId, workOrderId), eq(workOrderTask.isActive, true)))
      .orderBy(workOrderTask.sequence);
  }

  /**
   * Find RII (Required Inspection Item) tasks for a work order
   */
  async findRiiTasks(workOrderId: string) {
    return db
      .select()
      .from(workOrderTask)
      .where(
        and(
          eq(workOrderTask.workOrderId, workOrderId),
          eq(workOrderTask.isRii, true),
          eq(workOrderTask.isActive, true),
        ),
      )
      .orderBy(workOrderTask.sequence);
  }

  /**
   * Create new task
   */
  async create(data: NewWorkOrderTask): Promise<WorkOrderTask> {
    const result = await db.insert(workOrderTask).values(data).returning();
    if (!result[0]) {
      throw new Error("Failed to create work order task");
    }
    return result[0];
  }

  /**
   * Create multiple tasks
   */
  async createMany(data: NewWorkOrderTask[]): Promise<WorkOrderTask[]> {
    const result = await db.insert(workOrderTask).values(data).returning();
    return result;
  }

  /**
   * Update task
   */
  async update(id: string, data: Partial<NewWorkOrderTask>): Promise<WorkOrderTask> {
    const result = await db
      .update(workOrderTask)
      .set({ ...data, updatedAt: Date.now() })
      .where(eq(workOrderTask.id, id))
      .returning();

    if (!result[0]) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }

    return result[0];
  }

  /**
   * Update task status
   */
  async updateStatus(id: string, status: WorkOrderTask["status"]) {
    const updateData: Partial<NewWorkOrderTask> = { status, updatedAt: Date.now() };

    if (status === "IN_PROGRESS" && !updateData.startedAt) {
      updateData.startedAt = Date.now();
    }
    if (status === "COMPLETED") {
      updateData.completedAt = Date.now();
    }

    const result = await db
      .update(workOrderTask)
      .set(updateData)
      .where(eq(workOrderTask.id, id))
      .returning();

    if (!result[0]) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }

    return result[0];
  }

  /**
   * Sign off RII task
   * Only inspector can sign off RII tasks
   */
  async signOffRii(id: string, inspectorId: string) {
    const result = await db
      .update(workOrderTask)
      .set({
        status: "COMPLETED",
        inspectedBy: inspectorId,
        completedAt: Date.now(),
        updatedAt: Date.now(),
      })
      .where(eq(workOrderTask.id, id))
      .returning();

    if (!result[0]) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }

    return result[0];
  }

  /**
   * Delete task (soft delete)
   */
  async delete(id: string): Promise<void> {
    await db
      .update(workOrderTask)
      .set({ isActive: false, updatedAt: Date.now() })
      .where(eq(workOrderTask.id, id));
  }

  /**
   * Delete all tasks for a work order
   */
  async deleteByWorkOrder(workOrderId: string): Promise<void> {
    await db
      .update(workOrderTask)
      .set({ isActive: false, updatedAt: Date.now() })
      .where(eq(workOrderTask.workOrderId, workOrderId));
  }
}
