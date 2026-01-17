/**
 * Purchase Order Repository
 *
 * Database operations for purchase order management
 */

import { Injectable } from "@nestjs/common";
import { eq, desc, and, sql } from "drizzle-orm";

import type {
  PurchaseOrder,
  NewPurchaseOrder,
  PurchaseOrderItem,
  NewPurchaseOrderItem,
  PurchaseReceipt,
  NewPurchaseReceipt,
  PurchaseReceiptItem,
  NewPurchaseReceiptItem,
} from "@repo/db";
import { purchaseOrder, purchaseOrderItem, purchaseReceipt, purchaseReceiptItem } from "@repo/db";
import { db } from "@repo/db";

@Injectable()
export class PurchaseOrderRepository {
  /**
   * Find purchase order by ID
   */
  async findById(id: string): Promise<PurchaseOrder | null> {
    const result = await db.select().from(purchaseOrder).where(eq(purchaseOrder.id, id));
    return result[0] || null;
  }

  /**
   * Find purchase order by number
   */
  async findByNumber(orderNumber: string): Promise<PurchaseOrder | null> {
    const result = await db.select().from(purchaseOrder).where(eq(purchaseOrder.orderNumber, orderNumber));
    return result[0] || null;
  }

  /**
   * Create new purchase order
   */
  async create(data: NewPurchaseOrder): Promise<PurchaseOrder> {
    const result = await db.insert(purchaseOrder).values(data).returning();
    if (!result[0]) {
      throw new Error("Failed to create purchase order");
    }
    return result[0];
  }

  /**
   * Update purchase order
   */
  async update(id: string, data: Partial<NewPurchaseOrder>): Promise<PurchaseOrder> {
    const result = await db
      .update(purchaseOrder)
      .set({ ...data, updatedAt: Date.now() })
      .where(eq(purchaseOrder.id, id))
      .returning();
    if (!result[0]) {
      throw new Error(`Purchase order with id ${id} not found`);
    }
    return result[0];
  }

  /**
   * Delete purchase order
   */
  async delete(id: string): Promise<void> {
    // Delete items first
    await db.delete(purchaseOrderItem).where(eq(purchaseOrderItem.purchaseOrderId, id));
    await db.delete(purchaseOrder).where(eq(purchaseOrder.id, id));
  }

  /**
   * List purchase orders
   */
  async list(options: {
    limit?: number;
    offset?: number;
    status?: string;
    supplierId?: string;
  } = {}): Promise<PurchaseOrder[]> {
    const { limit = 50, offset = 0, status, supplierId } = options;

    let conditions: any[] = [];
    if (status) {
      conditions.push(eq(purchaseOrder.status, status));
    }
    if (supplierId) {
      conditions.push(eq(purchaseOrder.supplierId, supplierId));
    }

    let query = db.select().from(purchaseOrder);
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    return query
      .orderBy(desc(purchaseOrder.createdAt))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Count purchase orders
   */
  async count(status?: string): Promise<number> {
    const result = await db.select().from(purchaseOrder);
    if (status) {
      return result.filter(po => po.status === status).length;
    }
    return result.length;
  }

  /**
   * Generate next order number
   */
  async generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `PO-${year}-`;

    const results = await db
      .select()
      .from(purchaseOrder)
      .where(sql`${purchaseOrder.orderNumber} LIKE ${prefix + '%'}`)
      .orderBy(desc(purchaseOrder.orderNumber))
      .limit(1);

    if (results.length === 0) {
      return `${prefix}0001`;
    }

    const lastNumber = results[0]!.orderNumber;
    const sequence = parseInt(lastNumber.slice(-4), 10) + 1;
    return `${prefix}${sequence.toString().padStart(4, '0')}`;
  }

  // ============ Purchase Order Items ============

  /**
   * Get items for a purchase order
   */
  async getItems(purchaseOrderId: string): Promise<PurchaseOrderItem[]> {
    return db
      .select()
      .from(purchaseOrderItem)
      .where(eq(purchaseOrderItem.purchaseOrderId, purchaseOrderId));
  }

  /**
   * Add item to purchase order
   */
  async addItem(data: NewPurchaseOrderItem): Promise<PurchaseOrderItem> {
    const result = await db.insert(purchaseOrderItem).values(data).returning();
    if (!result[0]) {
      throw new Error("Failed to add item to purchase order");
    }
    return result[0];
  }

  /**
   * Update purchase order item
   */
  async updateItem(itemId: string, data: Partial<NewPurchaseOrderItem>): Promise<PurchaseOrderItem> {
    const result = await db
      .update(purchaseOrderItem)
      .set({ ...data, updatedAt: Date.now() })
      .where(eq(purchaseOrderItem.id, itemId))
      .returning();
    if (!result[0]) {
      throw new Error(`Purchase order item with id ${itemId} not found`);
    }
    return result[0];
  }

  /**
   * Delete purchase order item
   */
  async deleteItem(itemId: string): Promise<void> {
    await db.delete(purchaseOrderItem).where(eq(purchaseOrderItem.id, itemId));
  }

  // ============ Purchase Receipts ============

  /**
   * Get receipts for a purchase order
   */
  async getReceipts(purchaseOrderId: string): Promise<PurchaseReceipt[]> {
    return db
      .select()
      .from(purchaseReceipt)
      .where(eq(purchaseReceipt.purchaseOrderId, purchaseOrderId));
  }

  /**
   * Find receipt by ID
   */
  async findReceiptById(id: string): Promise<PurchaseReceipt | null> {
    const result = await db.select().from(purchaseReceipt).where(eq(purchaseReceipt.id, id));
    return result[0] || null;
  }

  /**
   * Create purchase receipt
   */
  async createReceipt(data: NewPurchaseReceipt): Promise<PurchaseReceipt> {
    const result = await db.insert(purchaseReceipt).values(data).returning();
    if (!result[0]) {
      throw new Error("Failed to create purchase receipt");
    }
    return result[0];
  }

  /**
   * Generate receipt number
   */
  async generateReceiptNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `GR-${year}-`;

    const results = await db
      .select()
      .from(purchaseReceipt)
      .where(sql`${purchaseReceipt.receiptNumber} LIKE ${prefix + '%'}`)
      .orderBy(desc(purchaseReceipt.receiptNumber))
      .limit(1);

    if (results.length === 0) {
      return `${prefix}0001`;
    }

    const lastNumber = results[0]!.receiptNumber;
    const sequence = parseInt(lastNumber.slice(-4), 10) + 1;
    return `${prefix}${sequence.toString().padStart(4, '0')}`;
  }

  /**
   * Add receipt item
   */
  async addReceiptItem(data: NewPurchaseReceiptItem): Promise<PurchaseReceiptItem> {
    const result = await db.insert(purchaseReceiptItem).values(data).returning();
    if (!result[0]) {
      throw new Error("Failed to add receipt item");
    }
    return result[0];
  }

  /**
   * Get receipt items
   */
  async getReceiptItems(receiptId: string): Promise<PurchaseReceiptItem[]> {
    return db
      .select()
      .from(purchaseReceiptItem)
      .where(eq(purchaseReceiptItem.purchaseReceiptId, receiptId));
  }
}
