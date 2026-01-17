/**
 * Purchase Request Repository
 *
 * Database operations for purchase request management
 */

import { Injectable } from "@nestjs/common";
import { eq, desc, and, sql } from "drizzle-orm";

import type { PurchaseRequest, NewPurchaseRequest, PurchaseRequestItem, NewPurchaseRequestItem } from "@repo/db";
import { purchaseRequest, purchaseRequestItem } from "@repo/db";
import { db } from "@repo/db";

@Injectable()
export class PurchaseRequestRepository {
  /**
   * Find purchase request by ID
   */
  async findById(id: string): Promise<PurchaseRequest | null> {
    const result = await db.select().from(purchaseRequest).where(eq(purchaseRequest.id, id));
    return result[0] || null;
  }

  /**
   * Find purchase request by number
   */
  async findByNumber(requestNumber: string): Promise<PurchaseRequest | null> {
    const result = await db.select().from(purchaseRequest).where(eq(purchaseRequest.requestNumber, requestNumber));
    return result[0] || null;
  }

  /**
   * Create new purchase request
   */
  async create(data: NewPurchaseRequest): Promise<PurchaseRequest> {
    const result = await db.insert(purchaseRequest).values(data).returning();
    if (!result[0]) {
      throw new Error("Failed to create purchase request");
    }
    return result[0];
  }

  /**
   * Update purchase request
   */
  async update(id: string, data: Partial<NewPurchaseRequest>): Promise<PurchaseRequest> {
    const result = await db
      .update(purchaseRequest)
      .set({ ...data, updatedAt: Date.now() })
      .where(eq(purchaseRequest.id, id))
      .returning();
    if (!result[0]) {
      throw new Error(`Purchase request with id ${id} not found`);
    }
    return result[0];
  }

  /**
   * Delete purchase request
   */
  async delete(id: string): Promise<void> {
    // Delete items first
    await db.delete(purchaseRequestItem).where(eq(purchaseRequestItem.purchaseRequestId, id));
    await db.delete(purchaseRequest).where(eq(purchaseRequest.id, id));
  }

  /**
   * List purchase requests
   */
  async list(options: {
    limit?: number;
    offset?: number;
    status?: string;
    requesterId?: string;
    priority?: string;
  } = {}): Promise<PurchaseRequest[]> {
    const { limit = 50, offset = 0, status, requesterId, priority } = options;

    let conditions: any[] = [];
    if (status) {
      conditions.push(eq(purchaseRequest.status, status));
    }
    if (requesterId) {
      conditions.push(eq(purchaseRequest.requesterId, requesterId));
    }
    if (priority) {
      conditions.push(eq(purchaseRequest.priority, priority));
    }

    let query = db.select().from(purchaseRequest);
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    return query
      .orderBy(desc(purchaseRequest.createdAt))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Count purchase requests
   */
  async count(status?: string): Promise<number> {
    const result = await db.select().from(purchaseRequest);
    if (status) {
      return result.filter(pr => pr.status === status).length;
    }
    return result.length;
  }

  /**
   * Generate next request number
   */
  async generateRequestNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `PR-${year}-`;

    // Get last request number of this year
    const results = await db
      .select()
      .from(purchaseRequest)
      .where(sql`${purchaseRequest.requestNumber} LIKE ${prefix + '%'}`)
      .orderBy(desc(purchaseRequest.requestNumber))
      .limit(1);

    if (results.length === 0) {
      return `${prefix}0001`;
    }

    const lastNumber = results[0]!.requestNumber;
    const sequence = parseInt(lastNumber.slice(-4), 10) + 1;
    return `${prefix}${sequence.toString().padStart(4, '0')}`;
  }

  // ============ Purchase Request Items ============

  /**
   * Get items for a purchase request
   */
  async getItems(purchaseRequestId: string): Promise<PurchaseRequestItem[]> {
    return db
      .select()
      .from(purchaseRequestItem)
      .where(eq(purchaseRequestItem.purchaseRequestId, purchaseRequestId));
  }

  /**
   * Add item to purchase request
   */
  async addItem(data: NewPurchaseRequestItem): Promise<PurchaseRequestItem> {
    const result = await db.insert(purchaseRequestItem).values(data).returning();
    if (!result[0]) {
      throw new Error("Failed to add item to purchase request");
    }
    return result[0];
  }

  /**
   * Update purchase request item
   */
  async updateItem(itemId: string, data: Partial<NewPurchaseRequestItem>): Promise<PurchaseRequestItem> {
    const result = await db
      .update(purchaseRequestItem)
      .set({ ...data, updatedAt: Date.now() })
      .where(eq(purchaseRequestItem.id, itemId))
      .returning();
    if (!result[0]) {
      throw new Error(`Purchase request item with id ${itemId} not found`);
    }
    return result[0];
  }

  /**
   * Delete purchase request item
   */
  async deleteItem(itemId: string): Promise<void> {
    await db.delete(purchaseRequestItem).where(eq(purchaseRequestItem.id, itemId));
  }
}
