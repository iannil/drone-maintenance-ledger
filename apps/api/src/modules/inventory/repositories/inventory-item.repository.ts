/**
 * Inventory Item Repository
 *
 * Database operations for inventory item management
 */

import { Injectable } from "@nestjs/common";
import { eq, like, and, desc, lt, lte, sql } from "drizzle-orm";

import type { InventoryItem, NewInventoryItem } from "@repo/db";
import { inventoryItem } from "@repo/db";
import { db } from "@repo/db";

@Injectable()
export class InventoryItemRepository {
  /**
   * Find inventory item by ID
   */
  async findById(id: string): Promise<InventoryItem | null> {
    const result = await db.select().from(inventoryItem).where(eq(inventoryItem.id, id));
    return result[0] || null;
  }

  /**
   * Find inventory item by part number and warehouse
   */
  async findByPartNumberAndWarehouse(
    partNumber: string,
    warehouseId: string
  ): Promise<InventoryItem | null> {
    const result = await db
      .select()
      .from(inventoryItem)
      .where(
        and(
          eq(inventoryItem.partNumber, partNumber),
          eq(inventoryItem.warehouseId, warehouseId)
        )
      );
    return result[0] || null;
  }

  /**
   * Create new inventory item
   */
  async create(data: NewInventoryItem): Promise<InventoryItem> {
    // Calculate availableQuantity
    const availableQuantity = (data.quantity || 0) - (data.reservedQuantity || 0);
    const result = await db
      .insert(inventoryItem)
      .values({ ...data, availableQuantity })
      .returning();
    if (!result[0]) {
      throw new Error("Failed to create inventory item");
    }
    return result[0];
  }

  /**
   * Update inventory item
   */
  async update(id: string, data: Partial<NewInventoryItem>): Promise<InventoryItem> {
    const result = await db
      .update(inventoryItem)
      .set({ ...data, updatedAt: Date.now() })
      .where(eq(inventoryItem.id, id))
      .returning();
    if (!result[0]) {
      throw new Error(`Inventory item with id ${id} not found`);
    }
    return result[0];
  }

  /**
   * Update quantity
   */
  async updateQuantity(
    id: string,
    quantityChange: number,
    reservedChange: number = 0
  ): Promise<InventoryItem> {
    const item = await this.findById(id);
    if (!item) {
      throw new Error(`Inventory item with id ${id} not found`);
    }

    const newQuantity = item.quantity + quantityChange;
    const newReserved = item.reservedQuantity + reservedChange;
    const newAvailable = newQuantity - newReserved;

    return this.update(id, {
      quantity: newQuantity,
      reservedQuantity: newReserved,
      availableQuantity: newAvailable,
    });
  }

  /**
   * Delete inventory item
   */
  async delete(id: string): Promise<void> {
    await db.delete(inventoryItem).where(eq(inventoryItem.id, id));
  }

  /**
   * List inventory items
   */
  async list(options: {
    limit?: number;
    offset?: number;
    warehouseId?: string;
    status?: string;
    category?: string;
    lowStock?: boolean;
  } = {}): Promise<InventoryItem[]> {
    const { limit = 50, offset = 0, warehouseId, status, category, lowStock } = options;

    let query = db.select().from(inventoryItem);

    const conditions: any[] = [];
    if (warehouseId) {
      conditions.push(eq(inventoryItem.warehouseId, warehouseId));
    }
    if (status) {
      conditions.push(eq(inventoryItem.status, status));
    }
    if (category) {
      conditions.push(eq(inventoryItem.category, category));
    }
    if (lowStock) {
      // Items where available quantity is at or below reorder point
      conditions.push(
        sql`${inventoryItem.availableQuantity} <= ${inventoryItem.reorderPoint}`
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    return query
      .orderBy(desc(inventoryItem.updatedAt))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Search inventory items
   */
  async search(searchQuery: string, limit: number = 50): Promise<InventoryItem[]> {
    return db
      .select()
      .from(inventoryItem)
      .where(
        sql`${inventoryItem.name} LIKE ${`%${searchQuery}%`} OR ${inventoryItem.partNumber} LIKE ${`%${searchQuery}%`}`
      )
      .limit(limit);
  }

  /**
   * Get low stock alerts
   */
  async getLowStockItems(): Promise<InventoryItem[]> {
    return db
      .select()
      .from(inventoryItem)
      .where(
        sql`${inventoryItem.availableQuantity} <= ${inventoryItem.reorderPoint} AND ${inventoryItem.reorderPoint} > 0`
      );
  }

  /**
   * Get expiring items
   */
  async getExpiringItems(daysAhead: number = 30): Promise<InventoryItem[]> {
    const futureDate = Date.now() + daysAhead * 24 * 60 * 60 * 1000;
    return db
      .select()
      .from(inventoryItem)
      .where(
        and(
          sql`${inventoryItem.expiryDate} IS NOT NULL`,
          lte(inventoryItem.expiryDate, futureDate)
        )
      );
  }

  /**
   * Count inventory items
   */
  async count(options: {
    warehouseId?: string;
    status?: string;
    category?: string;
  } = {}): Promise<number> {
    const result = await db.select().from(inventoryItem);
    let filtered = result;

    if (options.warehouseId) {
      filtered = filtered.filter(i => i.warehouseId === options.warehouseId);
    }
    if (options.status) {
      filtered = filtered.filter(i => i.status === options.status);
    }
    if (options.category) {
      filtered = filtered.filter(i => i.category === options.category);
    }

    return filtered.length;
  }
}
