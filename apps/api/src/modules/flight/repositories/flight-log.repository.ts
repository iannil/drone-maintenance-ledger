import { Injectable, NotFoundException } from "@nestjs/common";
import { eq, and, desc, sql, asc } from "drizzle-orm";

import type { FlightLog, NewFlightLog } from "@repo/db";
import { flightLog, aircraft, component, componentInstallation } from "@repo/db";
import { db } from "@repo/db";

/**
 * Flight Log repository
 *
 * Handles database operations for flight logs
 */
@Injectable()
export class FlightLogRepository {
  /**
   * Find flight log by ID
   */
  async findById(id: string): Promise<FlightLog | null> {
    const result = await db.select().from(flightLog).where(eq(flightLog.id, id));
    return result[0] || null;
  }

  /**
   * Find flight logs for an aircraft
   */
  async findByAircraft(aircraftId: string, limit: number = 50, offset: number = 0) {
    return db
      .select()
      .from(flightLog)
      .where(eq(flightLog.aircraftId, aircraftId))
      .orderBy(desc(flightLog.flightDate))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Find flight logs by pilot
   */
  async findByPilot(pilotId: string, limit: number = 50, offset: number = 0) {
    return db
      .select()
      .from(flightLog)
      .where(eq(flightLog.pilotId, pilotId))
      .orderBy(desc(flightLog.flightDate))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Find flight logs by date range
   */
  async findByDateRange(startDate: Date, endDate: Date) {
    return db
      .select()
      .from(flightLog)
      .where(
        and(
          sql`${flightLog.flightDate} >= ${startDate}`,
          sql`${flightLog.flightDate} <= ${endDate}`,
        ),
      )
      .orderBy(desc(flightLog.flightDate));
  }

  /**
   * Get recent flight logs across all aircraft
   */
  async findRecent(limit: number = 20) {
    return db
      .select()
      .from(flightLog)
      .where(eq(flightLog.isActive, true))
      .orderBy(desc(flightLog.createdAt))
      .limit(limit);
  }

  /**
   * Create new flight log
   */
  async create(data: NewFlightLog): Promise<FlightLog> {
    const result = await db.insert(flightLog).values(data).returning();
    if (!result[0]) {
      throw new Error("Failed to create flight log");
    }
    return result[0];
  }

  /**
   * Update flight log
   */
  async update(id: string, data: Partial<NewFlightLog>): Promise<FlightLog> {
    const result = await db
      .update(flightLog)
      .set({ ...data, updatedAt: Date.now() })
      .where(eq(flightLog.id, id))
      .returning();

    if (!result[0]) {
      throw new NotFoundException(`Flight log with id ${id} not found`);
    }

    return result[0];
  }

  /**
   * Delete (soft delete) flight log
   */
  async delete(id: string): Promise<void> {
    await db
      .update(flightLog)
      .set({ isActive: false, updatedAt: Date.now() })
      .where(eq(flightLog.id, id));
  }

  /**
   * Get flight statistics for an aircraft
   */
  async getAircraftStats(aircraftId: string) {
    const result = await db
      .select({
        totalFlights: sql<number>`count(*)`,
        totalHours: sql<number>`sum(flight_hours)`,
        totalCycles: sql<number>`sum(takeoff_cycles)`,
        lastFlightDate: sql<Date>`max(flight_date)`,
      })
      .from(flightLog)
      .where(and(eq(flightLog.aircraftId, aircraftId), eq(flightLog.isActive, true)));

    return result[0] || { totalFlights: 0, totalHours: 0, totalCycles: 0, lastFlightDate: null };
  }

  /**
   * Update aircraft lifecycle metrics after a flight
   *
   * This is called after flight log creation to update:
   * 1. Aircraft total hours and cycles
   * 2. Installed components' hours and cycles
   */
  async updateLifecycleMetrics(aircraftId: string, flightHours: number, cycles: number) {
    // Update aircraft totals
    await db
      .update(aircraft)
      .set({
        totalFlightHours: sql`${aircraft.totalFlightHours} + ${flightHours}`,
        totalFlightCycles: sql`${aircraft.totalFlightCycles} + ${cycles}`,
        updatedAt: Date.now(),
      })
      .where(eq(aircraft.id, aircraftId));

    // Update all installed components
    const installedComponents = await db
      .select({ id: component.id })
      .from(component)
      .innerJoin(
        componentInstallation,
        and(
          eq(componentInstallation.componentId, component.id),
          eq(componentInstallation.aircraftId, aircraftId),
          sql`${componentInstallation.removedAt} IS NULL`,
        ),
      );

    for (const comp of installedComponents) {
      await db
        .update(component)
        .set({
          totalFlightHours: sql`${component.totalFlightHours} + ${flightHours}`,
          totalFlightCycles: sql`${component.totalFlightCycles} + ${cycles}`,
          updatedAt: Date.now(),
        })
        .where(eq(component.id, comp.id));
    }
  }
}
