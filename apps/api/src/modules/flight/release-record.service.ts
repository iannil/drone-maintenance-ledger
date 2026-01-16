import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";

import type { ReleaseRecord } from "@repo/db";
import { ReleaseRecordRepository } from "./repositories/release-record.repository";

/**
 * DTOs for release record operations
 */
export interface CreateReleaseRecordDto {
  aircraftId: string;
  workOrderId?: string;
  releaseStatus: ReleaseRecord["releaseStatus"];
  workDescription: string;
  releaseCertificateNumber?: string;
  conditions?: string;
  limitations?: string;
}

export interface UpdateReleaseRecordDto {
  releaseStatus?: ReleaseRecord["releaseStatus"];
  workDescription?: string;
  conditions?: string;
  limitations?: string;
  resolution?: string;
}

export interface SignReleaseDto {
  signatureHash: string;
}

/**
 * Release Record service
 *
 * Handles release record business logic
 * This is a LEGALLY SIGNIFICANT document - aircraft release to service
 *
 * Only INSPECTOR role can sign release records
 */
@Injectable()
export class ReleaseRecordService {
  constructor(private readonly releaseRecordRepository: ReleaseRecordRepository) {}

  /**
   * Find release record by ID
   */
  async findById(id: string): Promise<ReleaseRecord | null> {
    return this.releaseRecordRepository.findById(id);
  }

  /**
   * Find release records for an aircraft
   */
  async findByAircraft(aircraftId: string, limit: number = 50, offset: number = 0) {
    return this.releaseRecordRepository.findByAircraft(aircraftId, limit, offset);
  }

  /**
   * Find current valid release for an aircraft
   * This is the legal basis for whether the aircraft can fly
   */
  async findCurrentRelease(aircraftId: string): Promise<ReleaseRecord | null> {
    return this.releaseRecordRepository.findCurrentRelease(aircraftId);
  }

  /**
   * Find release records by work order
   */
  async findByWorkOrder(workOrderId: string) {
    return this.releaseRecordRepository.findByWorkOrder(workOrderId);
  }

  /**
   * Find recent release records
   */
  async getRecent(limit: number = 20) {
    return this.releaseRecordRepository.findRecent(limit);
  }

  /**
   * Create new release record
   *
   * Note: Release records are created unsigned.
   * They must be signed by an INSPECTOR to be valid.
   */
  async create(
    userId: string,
    dto: CreateReleaseRecordDto,
  ): Promise<ReleaseRecord> {
    // If this is a new release for an aircraft, supersede any existing release
    const currentRelease = await this.releaseRecordRepository.findCurrentRelease(dto.aircraftId);

    const newRelease = await this.releaseRecordRepository.create({
      ...dto,
      releasedBy: userId,
    });

    // Supersede the old release
    if (currentRelease) {
      await this.releaseRecordRepository.supersede(currentRelease.id, newRelease.id);
    }

    return newRelease;
  }

  /**
   * Update release record
   *
   * Only allowed if the record is not yet signed
   */
  async update(id: string, dto: UpdateReleaseRecordDto): Promise<ReleaseRecord> {
    const existing = await this.releaseRecordRepository.findById(id);
    if (!existing) {
      throw new NotFoundException("Release record not found");
    }

    // Cannot modify a signed release
    if (existing.signatureHash) {
      throw new ForbiddenException("Cannot modify a signed release record");
    }

    return this.releaseRecordRepository.update(id, dto);
  }

  /**
   * Sign release record
   *
   * This is the electronic signature action.
   * After signing, the release cannot be modified.
   * Only INSPECTOR role should be allowed to call this.
   */
  async sign(id: string, dto: SignReleaseDto): Promise<ReleaseRecord> {
    const existing = await this.releaseRecordRepository.findById(id);
    if (!existing) {
      throw new NotFoundException("Release record not found");
    }

    // Check if already signed
    if (existing.signatureHash) {
      throw new ForbiddenException("Release record is already signed");
    }

    return this.releaseRecordRepository.addSignature(id, dto.signatureHash);
  }

  /**
   * Delete release record (soft delete)
   *
   * WARNING: This is dangerous for legal reasons.
   * Only unsigned releases should be deletable.
   */
  async delete(id: string): Promise<void> {
    const existing = await this.releaseRecordRepository.findById(id);
    if (!existing) {
      throw new NotFoundException("Release record not found");
    }

    // Cannot delete a signed release
    if (existing.signatureHash) {
      throw new ForbiddenException("Cannot delete a signed release record");
    }

    await this.releaseRecordRepository.delete(id);
  }

  /**
   * Check if aircraft is released to service
   */
  async isAircraftReleased(aircraftId: string): Promise<boolean> {
    const release = await this.releaseRecordRepository.findCurrentRelease(aircraftId);
    return release !== null && release.signatureHash !== null;
  }
}

// Re-export types for convenience
export type { ReleaseRecord };
