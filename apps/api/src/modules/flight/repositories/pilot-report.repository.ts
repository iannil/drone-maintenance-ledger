import { Injectable, NotFoundException } from "@nestjs/common";
import { eq, and, desc, asc, sql } from "drizzle-orm";

import type { PilotReport, NewPilotReport } from "@repo/db";
import { pilotReport } from "@repo/db";
import { db } from "@repo/db";

/**
 * Pilot Report (PIREP) repository
 *
 * Handles database operations for pilot reports
 */
@Injectable()
export class PilotReportRepository {
  /**
   * Find pilot report by ID
   */
  async findById(id: string): Promise<PilotReport | null> {
    const result = await db.select().from(pilotReport).where(eq(pilotReport.id, id));
    return result[0] || null;
  }

  /**
   * Find pilot reports for an aircraft
   */
  async findByAircraft(aircraftId: string, limit: number = 50, offset: number = 0) {
    return db
      .select()
      .from(pilotReport)
      .where(eq(pilotReport.aircraftId, aircraftId))
      .orderBy(desc(pilotReport.createdAt))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Find pilot reports by reporter
   */
  async findByReporter(reporterId: string, limit: number = 50, offset: number = 0) {
    return db
      .select()
      .from(pilotReport)
      .where(eq(pilotReport.reportedBy, reporterId))
      .orderBy(desc(pilotReport.createdAt))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Find open pilot reports (unresolved)
   */
  async findOpen(limit: number = 50, offset: number = 0) {
    return db
      .select()
      .from(pilotReport)
      .where(
        and(
          eq(pilotReport.isActive, true),
          sql`${pilotReport.status} IN ('OPEN', 'ACKNOWLEDGED', 'INVESTIGATING')`,
        ),
      )
      .orderBy(sql`CASE severity WHEN 'CRITICAL' THEN 1 WHEN 'HIGH' THEN 2 WHEN 'MEDIUM' THEN 3 ELSE 4 END`)
      .limit(limit)
      .offset(offset);
  }

  /**
   * Find AOG (Aircraft On Ground) reports
   */
  async findAog() {
    return db
      .select()
      .from(pilotReport)
      .where(and(eq(pilotReport.isAog, true), eq(pilotReport.isActive, true)))
      .orderBy(desc(pilotReport.createdAt));
  }

  /**
   * Create new pilot report
   */
  async create(data: NewPilotReport): Promise<PilotReport> {
    const result = await db.insert(pilotReport).values(data).returning();
    if (!result[0]) {
      throw new Error("Failed to create pilot report");
    }
    return result[0];
  }

  /**
   * Update pilot report
   */
  async update(id: string, data: Partial<NewPilotReport>): Promise<PilotReport> {
    const result = await db
      .update(pilotReport)
      .set({ ...data, updatedAt: Date.now() })
      .where(eq(pilotReport.id, id))
      .returning();

    if (!result[0]) {
      throw new NotFoundException(`Pilot report with id ${id} not found`);
    }

    return result[0];
  }

  /**
   * Update pilot report status
   */
  async updateStatus(id: string, status: PilotReport["status"], resolvedBy?: string) {
    const updateData: Partial<NewPilotReport> = {
      status,
      updatedAt: Date.now(),
    };

    if (status === "RESOLVED" && resolvedBy) {
      updateData.resolvedAt = Date.now();
      updateData.resolvedBy = resolvedBy;
    }

    const result = await db
      .update(pilotReport)
      .set(updateData)
      .where(eq(pilotReport.id, id))
      .returning();

    if (!result[0]) {
      throw new NotFoundException(`Pilot report with id ${id} not found`);
    }

    return result[0];
  }

  /**
   * Link pilot report to work order
   */
  async linkToWorkOrder(reportId: string, workOrderId: string) {
    const result = await db
      .update(pilotReport)
      .set({
        workOrderId,
        status: "WORK_ORDER_CREATED",
        updatedAt: Date.now(),
      })
      .where(eq(pilotReport.id, reportId))
      .returning();

    if (!result[0]) {
      throw new NotFoundException(`Pilot report with id ${reportId} not found`);
    }

    return result[0];
  }

  /**
   * Delete (soft delete) pilot report
   */
  async delete(id: string): Promise<void> {
    await db
      .update(pilotReport)
      .set({ isActive: false, updatedAt: Date.now() })
      .where(eq(pilotReport.id, id));
  }
}
