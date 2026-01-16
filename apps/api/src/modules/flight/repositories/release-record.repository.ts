import { Injectable, NotFoundException } from "@nestjs/common";
import { eq, and, desc } from "drizzle-orm";

import type { ReleaseRecord, NewReleaseRecord } from "@repo/db";
import { releaseRecord } from "@repo/db";
import { db } from "@repo/db";

/**
 * Release Record repository
 *
 * Handles database operations for release records
 * This is a legally significant document - aircraft release to service
 */
@Injectable()
export class ReleaseRecordRepository {
  /**
   * Find release record by ID
   */
  async findById(id: string): Promise<ReleaseRecord | null> {
    const result = await db.select().from(releaseRecord).where(eq(releaseRecord.id, id));
    return result[0] || null;
  }

  /**
   * Find release records for an aircraft
   */
  async findByAircraft(aircraftId: string, limit: number = 50, offset: number = 0) {
    return db
      .select()
      .from(releaseRecord)
      .where(and(eq(releaseRecord.aircraftId, aircraftId), eq(releaseRecord.isActive, true)))
      .orderBy(desc(releaseRecord.createdAt))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Find current valid release for an aircraft
   * Returns the most recent valid release
   */
  async findCurrentRelease(aircraftId: string): Promise<ReleaseRecord | null> {
    const result = await db
      .select()
      .from(releaseRecord)
      .where(
        and(
          eq(releaseRecord.aircraftId, aircraftId),
          eq(releaseRecord.isValid, true),
          eq(releaseRecord.isActive, true),
          sql`${releaseRecord.supersededBy} IS NULL`,
        ),
      )
      .orderBy(desc(releaseRecord.createdAt))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Find release records by work order
   */
  async findByWorkOrder(workOrderId: string) {
    return db
      .select()
      .from(releaseRecord)
      .where(eq(releaseRecord.workOrderId, workOrderId))
      .orderBy(desc(releaseRecord.createdAt));
  }

  /**
   * Find recent release records
   */
  async findRecent(limit: number = 20) {
    return db
      .select()
      .from(releaseRecord)
      .where(eq(releaseRecord.isActive, true))
      .orderBy(desc(releaseRecord.createdAt))
      .limit(limit);
  }

  /**
   * Create new release record
   */
  async create(data: NewReleaseRecord): Promise<ReleaseRecord> {
    const result = await db.insert(releaseRecord).values(data).returning();
    return result[0];
  }

  /**
   * Update release record
   */
  async update(id: string, data: Partial<NewReleaseRecord>): Promise<ReleaseRecord> {
    const result = await db
      .update(releaseRecord)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(releaseRecord.id, id))
      .returning();

    if (!result[0]) {
      throw new NotFoundException(`Release record with id ${id} not found`);
    }

    return result[0];
  }

  /**
   * Supersede a release record
   * Marks the old release as superseded by a new one
   */
  async supersede(oldReleaseId: string, newReleaseId: string) {
    const result = await db
      .update(releaseRecord)
      .set({
        supersededBy: newReleaseId,
        isValid: false,
        updatedAt: new Date(),
      })
      .where(eq(releaseRecord.id, oldReleaseId))
      .returning();

    if (!result[0]) {
      throw new NotFoundException(`Release record with id ${oldReleaseId} not found`);
    }

    return result[0];
  }

  /**
   * Add electronic signature to release record
   */
  async addSignature(id: string, signatureHash: string) {
    const result = await db
      .update(releaseRecord)
      .set({
        signatureHash,
        updatedAt: new Date(),
      })
      .where(eq(releaseRecord.id, id))
      .returning();

    if (!result[0]) {
      throw new NotFoundException(`Release record with id ${id} not found`);
    }

    return result[0];
  }

  /**
   * Delete (soft delete) release record
   * Note: This is dangerous - release records should generally not be deleted
   */
  async delete(id: string): Promise<void> {
    await db
      .update(releaseRecord)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(releaseRecord.id, id));
  }
}
