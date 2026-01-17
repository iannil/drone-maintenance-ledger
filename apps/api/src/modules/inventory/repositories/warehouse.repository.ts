/**
 * Warehouse Repository
 *
 * Database operations for warehouse management
 */

import { Injectable } from "@nestjs/common";
import { eq, like, and, desc } from "drizzle-orm";

import type { Warehouse, NewWarehouse } from "@repo/db";
import { warehouse } from "@repo/db";
import { db } from "@repo/db";

@Injectable()
export class WarehouseRepository {
  /**
   * Find warehouse by ID
   */
  async findById(id: string): Promise<Warehouse | null> {
    const result = await db.select().from(warehouse).where(eq(warehouse.id, id));
    return result[0] || null;
  }

  /**
   * Find warehouse by code
   */
  async findByCode(code: string): Promise<Warehouse | null> {
    const result = await db.select().from(warehouse).where(eq(warehouse.code, code));
    return result[0] || null;
  }

  /**
   * Create new warehouse
   */
  async create(data: NewWarehouse): Promise<Warehouse> {
    const result = await db.insert(warehouse).values(data).returning();
    if (!result[0]) {
      throw new Error("Failed to create warehouse");
    }
    return result[0];
  }

  /**
   * Update warehouse
   */
  async update(id: string, data: Partial<NewWarehouse>): Promise<Warehouse> {
    const result = await db
      .update(warehouse)
      .set({ ...data, updatedAt: Date.now() })
      .where(eq(warehouse.id, id))
      .returning();
    if (!result[0]) {
      throw new Error(`Warehouse with id ${id} not found`);
    }
    return result[0];
  }

  /**
   * Delete warehouse
   */
  async delete(id: string): Promise<void> {
    await db.delete(warehouse).where(eq(warehouse.id, id));
  }

  /**
   * List all warehouses
   */
  async list(options: {
    limit?: number;
    offset?: number;
    status?: string;
  } = {}): Promise<Warehouse[]> {
    const { limit = 50, offset = 0, status } = options;

    let query = db.select().from(warehouse);

    if (status) {
      query = query.where(eq(warehouse.status, status)) as typeof query;
    }

    return query
      .orderBy(desc(warehouse.createdAt))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Search warehouses
   */
  async search(query: string, limit: number = 50): Promise<Warehouse[]> {
    return db
      .select()
      .from(warehouse)
      .where(like(warehouse.name, `%${query}%`))
      .limit(limit);
  }

  /**
   * Count warehouses
   */
  async count(status?: string): Promise<number> {
    const result = await db.select().from(warehouse);
    if (status) {
      return result.filter(w => w.status === status).length;
    }
    return result.length;
  }
}
