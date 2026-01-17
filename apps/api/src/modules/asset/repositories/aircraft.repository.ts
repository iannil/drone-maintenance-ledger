import { Injectable, NotFoundException } from "@nestjs/common";
import { eq, and, sql } from "drizzle-orm";

import type { Aircraft, NewAircraft } from "@repo/db";
import { aircraft } from "@repo/db";
import { db } from "@repo/db";

/**
 * Aircraft repository
 *
 * Handles database operations for aircraft
 */
@Injectable()
export class AircraftRepository {
  /**
   * Find aircraft by ID with BOM (bill of materials)
   */
  async findById(id: string): Promise<Aircraft | null> {
    const result = await db.select().from(aircraft).where(eq(aircraft.id, id));
    return result[0] || null;
  }

  /**
   * Find aircraft by registration number
   */
  async findByRegistration(registrationNumber: string): Promise<Aircraft | null> {
    const result = await db.select().from(aircraft).where(eq(aircraft.registrationNumber, registrationNumber));
    return result[0] || null;
  }

  /**
   * Find aircraft by serial number
   */
  async findBySerialNumber(serialNumber: string): Promise<Aircraft | null> {
    const result = await db.select().from(aircraft).where(eq(aircraft.serialNumber, serialNumber));
    return result[0] || null;
  }

  /**
   * List aircraft by fleet
   */
  async findByFleet(fleetId: string, limit: number = 50, offset: number = 0): Promise<Aircraft[]> {
    return db
      .select()
      .from(aircraft)
      .where(eq(aircraft.fleetId, fleetId))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Create new aircraft
   */
  async create(data: NewAircraft): Promise<Aircraft> {
    const result = await db.insert(aircraft).values(data).returning();
    if (!result[0]) {
      throw new Error("Failed to create aircraft");
    }
    return result[0];
  }

  /**
   * Update aircraft
   */
  async update(id: string, data: Partial<NewAircraft>): Promise<Aircraft> {
    const result = await db
      .update(aircraft)
      .set({ ...data, updatedAt: Date.now() })
      .where(eq(aircraft.id, id))
      .returning();

    if (!result[0]) {
      throw new NotFoundException(`Aircraft with id ${id} not found`);
    }

    return result[0];
  }

  /**
   * Update aircraft flight metrics (called after flight log entry)
   */
  async updateFlightMetrics(
    id: string,
    flightHours: number,
    flightCycles: number,
  ): Promise<Aircraft> {
    const result = await db
      .update(aircraft)
      .set({
        totalFlightHours: sql`${aircraft.totalFlightHours} + ${flightHours}`,
        totalFlightCycles: sql`${aircraft.totalFlightCycles} + ${flightCycles}`,
        updatedAt: Date.now(),
      })
      .where(eq(aircraft.id, id))
      .returning();

    if (!result[0]) {
      throw new NotFoundException(`Aircraft with id ${id} not found`);
    }

    return result[0];
  }

  /**
   * Update aircraft status
   */
  async updateStatus(id: string, status: Aircraft["status"], isAirworthy?: boolean): Promise<Aircraft> {
    const result = await db
      .update(aircraft)
      .set({
        status,
        ...(isAirworthy !== undefined && { isAirworthy }),
        updatedAt: Date.now(),
      })
      .where(eq(aircraft.id, id))
      .returning();

    if (!result[0]) {
      throw new NotFoundException(`Aircraft with id ${id} not found`);
    }

    return result[0];
  }

  /**
   * Delete aircraft
   */
  async delete(id: string): Promise<void> {
    await db.delete(aircraft).where(eq(aircraft.id, id));
  }

  /**
   * List all aircraft
   */
  async list(limit: number = 50, offset: number = 0): Promise<Aircraft[]> {
    return db.select().from(aircraft).limit(limit).offset(offset);
  }

  /**
   * Count aircraft by status
   */
  async countByStatus(fleetId?: string): Promise<Record<string, number>> {
    const conditions = fleetId ? eq(aircraft.fleetId, fleetId) : undefined;

    const result = await db
      .select({
        status: aircraft.status,
        count: sql<number>`count(*)`.as("count"),
      })
      .from(aircraft)
      .where(conditions)
      .groupBy(aircraft.status);

    return result.reduce((acc, row) => {
      acc[row.status] = Number(row.count);
      return acc;
    }, {} as Record<string, number>);
  }
}
