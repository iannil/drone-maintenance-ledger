/**
 * Inventory Movement Repository
 *
 * Database operations for inventory movement records
 */

import { Injectable } from "@nestjs/common";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";

import type { InventoryMovement, NewInventoryMovement } from "@repo/db";
import { inventoryMovement } from "@repo/db";
import { db } from "@repo/db";

@Injectable()
export class InventoryMovementRepository {
  /**
   * Find movement by ID
   */
  async findById(id: string): Promise<InventoryMovement | null> {
    const result = await db.select().from(inventoryMovement).where(eq(inventoryMovement.id, id));
    return result[0] || null;
  }

  /**
   * Find movement by number
   */
  async findByNumber(movementNumber: string): Promise<InventoryMovement | null> {
    const result = await db
      .select()
      .from(inventoryMovement)
      .where(eq(inventoryMovement.movementNumber, movementNumber));
    return result[0] || null;
  }

  /**
   * Create new movement
   */
  async create(data: NewInventoryMovement): Promise<InventoryMovement> {
    const result = await db
      .insert(inventoryMovement)
      .values(data)
      .returning();
    if (!result[0]) {
      throw new Error("Failed to create inventory movement");
    }
    return result[0];
  }

  /**
   * Update movement
   */
  async update(id: string, data: Partial<NewInventoryMovement>): Promise<InventoryMovement> {
    const result = await db
      .update(inventoryMovement)
      .set({ ...data, updatedAt: Date.now() })
      .where(eq(inventoryMovement.id, id))
      .returning();
    if (!result[0]) {
      throw new Error(`Inventory movement with id ${id} not found`);
    }
    return result[0];
  }

  /**
   * Delete movement
   */
  async delete(id: string): Promise<void> {
    await db.delete(inventoryMovement).where(eq(inventoryMovement.id, id));
  }

  /**
   * List movements with filters
   */
  async list(options: {
    limit?: number;
    offset?: number;
    type?: string;
    status?: string;
    warehouseId?: string;
    inventoryItemId?: string;
    startDate?: number;
    endDate?: number;
  } = {}): Promise<InventoryMovement[]> {
    const {
      limit = 50,
      offset = 0,
      type,
      status,
      warehouseId,
      inventoryItemId,
      startDate,
      endDate,
    } = options;

    let query = db.select().from(inventoryMovement);

    const conditions: any[] = [];
    if (type) {
      conditions.push(eq(inventoryMovement.type, type));
    }
    if (status) {
      conditions.push(eq(inventoryMovement.status, status));
    }
    if (warehouseId) {
      conditions.push(
        sql`(${inventoryMovement.fromWarehouseId} = ${warehouseId} OR ${inventoryMovement.toWarehouseId} = ${warehouseId})`
      );
    }
    if (inventoryItemId) {
      conditions.push(eq(inventoryMovement.inventoryItemId, inventoryItemId));
    }
    if (startDate) {
      conditions.push(gte(inventoryMovement.movementDate, startDate));
    }
    if (endDate) {
      conditions.push(lte(inventoryMovement.movementDate, endDate));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    return query
      .orderBy(desc(inventoryMovement.movementDate))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Search movements
   */
  async search(searchQuery: string, limit: number = 50): Promise<InventoryMovement[]> {
    return db
      .select()
      .from(inventoryMovement)
      .where(
        sql`${inventoryMovement.movementNumber} LIKE ${`%${searchQuery}%`}
        OR ${inventoryMovement.partNumber} LIKE ${`%${searchQuery}%`}
        OR ${inventoryMovement.partName} LIKE ${`%${searchQuery}%`}
        OR ${inventoryMovement.referenceNumber} LIKE ${`%${searchQuery}%`}`
      )
      .orderBy(desc(inventoryMovement.movementDate))
      .limit(limit);
  }

  /**
   * Count movements
   */
  async count(options: {
    type?: string;
    status?: string;
    warehouseId?: string;
    startDate?: number;
    endDate?: number;
  } = {}): Promise<number> {
    const { type, status, warehouseId, startDate, endDate } = options;

    const conditions: any[] = [];
    if (type) {
      conditions.push(eq(inventoryMovement.type, type));
    }
    if (status) {
      conditions.push(eq(inventoryMovement.status, status));
    }
    if (warehouseId) {
      conditions.push(
        sql`(${inventoryMovement.fromWarehouseId} = ${warehouseId} OR ${inventoryMovement.toWarehouseId} = ${warehouseId})`
      );
    }
    if (startDate) {
      conditions.push(gte(inventoryMovement.movementDate, startDate));
    }
    if (endDate) {
      conditions.push(lte(inventoryMovement.movementDate, endDate));
    }

    let query = db.select({ count: sql<number>`count(*)` }).from(inventoryMovement);
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    const result = await query;
    return Number(result[0]?.count || 0);
  }

  /**
   * Get movements by inventory item
   */
  async getByInventoryItem(inventoryItemId: string, limit: number = 50): Promise<InventoryMovement[]> {
    return db
      .select()
      .from(inventoryMovement)
      .where(eq(inventoryMovement.inventoryItemId, inventoryItemId))
      .orderBy(desc(inventoryMovement.movementDate))
      .limit(limit);
  }

  /**
   * Get pending movements
   */
  async getPending(): Promise<InventoryMovement[]> {
    return db
      .select()
      .from(inventoryMovement)
      .where(eq(inventoryMovement.status, "PENDING"))
      .orderBy(desc(inventoryMovement.createdAt));
  }

  /**
   * Generate movement number
   */
  async generateMovementNumber(type: string): Promise<string> {
    const prefix = type.substring(0, 3).toUpperCase();
    const date = new Date();
    const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;

    // Get count for today
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const endOfDay = startOfDay + 24 * 60 * 60 * 1000;

    const count = await this.count({
      type,
      startDate: startOfDay,
      endDate: endOfDay,
    });

    return `${prefix}-${dateStr}-${String(count + 1).padStart(4, "0")}`;
  }
}
