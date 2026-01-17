/**
 * Supplier Repository
 *
 * Database operations for supplier management
 */

import { Injectable } from "@nestjs/common";
import { eq, like, desc, sql } from "drizzle-orm";

import type { Supplier, NewSupplier } from "@repo/db";
import { supplier } from "@repo/db";
import { db } from "@repo/db";

@Injectable()
export class SupplierRepository {
  /**
   * Find supplier by ID
   */
  async findById(id: string): Promise<Supplier | null> {
    const result = await db.select().from(supplier).where(eq(supplier.id, id));
    return result[0] || null;
  }

  /**
   * Find supplier by code
   */
  async findByCode(code: string): Promise<Supplier | null> {
    const result = await db.select().from(supplier).where(eq(supplier.code, code));
    return result[0] || null;
  }

  /**
   * Create new supplier
   */
  async create(data: NewSupplier): Promise<Supplier> {
    const result = await db.insert(supplier).values(data).returning();
    if (!result[0]) {
      throw new Error("Failed to create supplier");
    }
    return result[0];
  }

  /**
   * Update supplier
   */
  async update(id: string, data: Partial<NewSupplier>): Promise<Supplier> {
    const result = await db
      .update(supplier)
      .set({ ...data, updatedAt: Date.now() })
      .where(eq(supplier.id, id))
      .returning();
    if (!result[0]) {
      throw new Error(`Supplier with id ${id} not found`);
    }
    return result[0];
  }

  /**
   * Delete supplier
   */
  async delete(id: string): Promise<void> {
    await db.delete(supplier).where(eq(supplier.id, id));
  }

  /**
   * List suppliers
   */
  async list(options: {
    limit?: number;
    offset?: number;
    status?: string;
    rating?: string;
  } = {}): Promise<Supplier[]> {
    const { limit = 50, offset = 0, status, rating } = options;

    let conditions: any[] = [];
    if (status) {
      conditions.push(eq(supplier.status, status));
    }
    if (rating) {
      conditions.push(eq(supplier.rating, rating));
    }

    let query = db.select().from(supplier);
    if (conditions.length > 0) {
      query = query.where(sql`${conditions.map((c, i) => i === 0 ? c : sql` AND ${c}`).reduce((a, b) => sql`${a}${b}`)}`) as typeof query;
    }

    return query
      .orderBy(desc(supplier.createdAt))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Search suppliers
   */
  async search(searchQuery: string, limit: number = 50): Promise<Supplier[]> {
    return db
      .select()
      .from(supplier)
      .where(
        sql`${supplier.name} LIKE ${`%${searchQuery}%`} OR ${supplier.code} LIKE ${`%${searchQuery}%`}`
      )
      .limit(limit);
  }

  /**
   * Count suppliers
   */
  async count(status?: string): Promise<number> {
    const result = await db.select().from(supplier);
    if (status) {
      return result.filter(s => s.status === status).length;
    }
    return result.length;
  }

  /**
   * Update supplier metrics
   */
  async updateMetrics(
    id: string,
    orderAmount: number
  ): Promise<Supplier> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error(`Supplier with id ${id} not found`);
    }

    return this.update(id, {
      totalOrders: (existing.totalOrders || 0) + 1,
      totalAmount: (existing.totalAmount || 0) + orderAmount,
    });
  }
}
