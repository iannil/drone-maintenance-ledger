import { Injectable, NotFoundException } from "@nestjs/common";
import { eq, and, desc, sql, asc } from "drizzle-orm";

import type { WorkOrder, NewWorkOrder } from "@repo/db";
import { workOrder, aircraft } from "@repo/db";
import { db } from "@repo/db";

/**
 * Work Order repository
 *
 * Handles database operations for work orders
 */
@Injectable()
export class WorkOrderRepository {
  /**
   * Find work order by ID
   */
  async findById(id: string): Promise<WorkOrder | null> {
    const result = await db.select().from(workOrder).where(eq(workOrder.id, id));
    return result[0] || null;
  }

  /**
   * Find work order by order number
   */
  async findByOrderNumber(orderNumber: string): Promise<WorkOrder | null> {
    const result = await db.select().from(workOrder).where(eq(workOrder.orderNumber, orderNumber));
    return result[0] || null;
  }

  /**
   * Find work orders for an aircraft
   */
  async findByAircraft(aircraftId: string, limit: number = 50, offset: number = 0) {
    return db
      .select()
      .from(workOrder)
      .where(and(eq(workOrder.aircraftId, aircraftId), eq(workOrder.isActive, true)))
      .orderBy(desc(workOrder.createdAt))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Find work orders by status
   */
  async findByStatus(status: WorkOrder["status"], limit: number = 50, offset: number = 0) {
    return db
      .select()
      .from(workOrder)
      .where(and(eq(workOrder.status, status), eq(workOrder.isActive, true)))
      .orderBy(desc(workOrder.createdAt))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Find work orders by assignee
   */
  async findByAssignee(assigneeId: string, limit: number = 50, offset: number = 0) {
    return db
      .select()
      .from(workOrder)
      .where(and(eq(workOrder.assignedTo, assigneeId), eq(workOrder.isActive, true)))
      .orderBy(sql`CASE priority WHEN 'CRITICAL' THEN 1 WHEN 'HIGH' THEN 2 WHEN 'MEDIUM' THEN 3 ELSE 4 END`)
      .limit(limit)
      .offset(offset);
  }

  /**
   * Find open work orders
   */
  async findOpen(limit: number = 50, offset: number = 0) {
    return db
      .select()
      .from(workOrder)
      .where(
        and(
          sql`${workOrder.status} IN ('OPEN', 'IN_PROGRESS', 'PENDING_PARTS', 'PENDING_INSPECTION')`,
          eq(workOrder.isActive, true),
        ),
      )
      .orderBy(sql`CASE priority WHEN 'CRITICAL' THEN 1 WHEN 'HIGH' THEN 2 WHEN 'MEDIUM' THEN 3 ELSE 4 END`)
      .limit(limit)
      .offset(offset);
  }

  /**
   * Find recent work orders
   */
  async findRecent(limit: number = 20) {
    return db
      .select()
      .from(workOrder)
      .where(eq(workOrder.isActive, true))
      .orderBy(desc(workOrder.createdAt))
      .limit(limit);
  }

  /**
   * Generate next work order number
   * Format: WO-YYYY-XXXX (e.g., WO-2026-0001)
   */
  async generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();

    // Find the highest order number for this year
    const result = await db
      .select({ orderNumber: workOrder.orderNumber })
      .from(workOrder)
      .where(sql`${workOrder.orderNumber} LIKE 'WO-${year}-%'`)
      .orderBy(desc(workOrder.orderNumber))
      .limit(1);

    let nextNum = 1;
    if (result[0]) {
      const currentNum = parseInt(result[0].orderNumber.split("-")[2] || "0", 10);
      nextNum = currentNum + 1;
    }

    return `WO-${year}-${String(nextNum).padStart(4, "0")}`;
  }

  /**
   * Create new work order
   */
  async create(data: NewWorkOrder): Promise<WorkOrder> {
    const result = await db.insert(workOrder).values(data).returning();
    return result[0];
  }

  /**
   * Update work order
   */
  async update(id: string, data: Partial<NewWorkOrder>): Promise<WorkOrder> {
    const result = await db
      .update(workOrder)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(workOrder.id, id))
      .returning();

    if (!result[0]) {
      throw new NotFoundException(`Work order with id ${id} not found`);
    }

    return result[0];
  }

  /**
   * Update work order status
   */
  async updateStatus(id: string, status: WorkOrder["status"]) {
    const result = await db
      .update(workOrder)
      .set({ status, updatedAt: new Date() })
      .where(eq(workOrder.id, id))
      .returning();

    if (!result[0]) {
      throw new NotFoundException(`Work order with id ${id} not found`);
    }

    return result[0];
  }

  /**
   * Assign work order to a user
   */
  async assign(id: string, userId: string) {
    const result = await db
      .update(workOrder)
      .set({
        assignedTo: userId,
        assignedAt: new Date(),
        status: "OPEN",
        updatedAt: new Date(),
      })
      .where(eq(workOrder.id, id))
      .returning();

    if (!result[0]) {
      throw new NotFoundException(`Work order with id ${id} not found`);
    }

    return result[0];
  }

  /**
   * Mark work order as started
   */
  async start(id: string) {
    const result = await db
      .update(workOrder)
      .set({
        status: "IN_PROGRESS",
        actualStart: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(workOrder.id, id))
      .returning();

    if (!result[0]) {
      throw new NotFoundException(`Work order with id ${id} not found`);
    }

    return result[0];
  }

  /**
   * Mark work order as completed
   */
  async complete(id: string, completedBy: string, notes?: string) {
    const result = await db
      .update(workOrder)
      .set({
        status: "COMPLETED",
        completedBy,
        completedAt: new Date(),
        actualEnd: new Date(),
        completionNotes: notes || null,
        updatedAt: new Date(),
      })
      .where(eq(workOrder.id, id))
      .returning();

    if (!result[0]) {
      throw new NotFoundException(`Work order with id ${id} not found`);
    }

    return result[0];
  }

  /**
   * Release work order (aircraft returned to service)
   */
  async release(id: string, releasedBy: string) {
    const result = await db
      .update(workOrder)
      .set({
        status: "RELEASED",
        releasedBy,
        releasedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(workOrder.id, id))
      .returning();

    if (!result[0]) {
      throw new NotFoundException(`Work order with id ${id} not found`);
    }

    return result[0];
  }

  /**
   * Delete (soft delete) work order
   */
  async delete(id: string): Promise<void> {
    await db
      .update(workOrder)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(workOrder.id, id));
  }
}
