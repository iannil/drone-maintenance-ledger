import { Injectable, NotFoundException } from "@nestjs/common";

import type { PilotReport } from "@repo/db";
import { PilotReportRepository } from "./repositories/pilot-report.repository";

/**
 * DTOs for pilot report operations
 */
export interface CreatePilotReportDto {
  aircraftId: string;
  flightLogId?: string;
  title: string;
  description: string;
  severity: PilotReport["severity"];
  affectedSystem?: string;
  affectedComponent?: string;
  isAog?: boolean;
}

export interface UpdatePilotReportDto {
  title?: string;
  description?: string;
  severity?: PilotReport["severity"];
  status?: PilotReport["status"];
  affectedSystem?: string;
  affectedComponent?: string;
  resolution?: string;
}

export interface UpdateStatusDto {
  status: PilotReport["status"];
  resolution?: string;
}

/**
 * Pilot Report (PIREP) service
 *
 * Handles pilot report business logic
 * PIREP is the primary way pilots report issues during/after flights
 */
@Injectable()
export class PilotReportService {
  constructor(private readonly pilotReportRepository: PilotReportRepository) {}

  /**
   * Find pilot report by ID
   */
  async findById(id: string): Promise<PilotReport | null> {
    return this.pilotReportRepository.findById(id);
  }

  /**
   * Find pilot reports for an aircraft
   */
  async findByAircraft(aircraftId: string, limit: number = 50, offset: number = 0) {
    return this.pilotReportRepository.findByAircraft(aircraftId, limit, offset);
  }

  /**
   * Find pilot reports by reporter
   */
  async findByReporter(reporterId: string, limit: number = 50, offset: number = 0) {
    return this.pilotReportRepository.findByReporter(reporterId, limit, offset);
  }

  /**
   * Find open (unresolved) pilot reports
   */
  async findOpen(limit: number = 50, offset: number = 0) {
    return this.pilotReportRepository.findOpen(limit, offset);
  }

  /**
   * Find AOG (Aircraft On Ground) reports
   * These are critical - aircraft cannot fly until resolved
   */
  async findAog() {
    return this.pilotReportRepository.findAog();
  }

  /**
   * Create new pilot report
   *
   * Automatically sets AOG flag for CRITICAL severity
   */
  async create(
    userId: string,
    dto: CreatePilotReportDto,
  ): Promise<PilotReport> {
    // For CRITICAL severity, automatically set AOG
    const isAog = dto.isAog || dto.severity === "CRITICAL";

    return this.pilotReportRepository.create({
      ...dto,
      reportedBy: userId,
      isAog,
      status: "OPEN",
    });
  }

  /**
   * Update pilot report
   */
  async update(id: string, dto: UpdatePilotReportDto): Promise<PilotReport> {
    const existing = await this.pilotReportRepository.findById(id);
    if (!existing) {
      throw new NotFoundException("Pilot report not found");
    }

    return this.pilotReportRepository.update(id, dto);
  }

  /**
   * Update pilot report status
   * Used by maintenance/inspection to track resolution progress
   */
  async updateStatus(
    id: string,
    userId: string,
    dto: UpdateStatusDto,
  ): Promise<PilotReport> {
    const existing = await this.pilotReportRepository.findById(id);
    if (!existing) {
      throw new NotFoundException("Pilot report not found");
    }

    // If resolving, clear AOG flag
    if (dto.status === "RESOLVED") {
      await this.pilotReportRepository.update(id, { isAog: false });
    }

    return this.pilotReportRepository.updateStatus(id, dto.status, userId);
  }

  /**
   * Link pilot report to work order
   * Called when a work order is created from a pilot report
   */
  async linkToWorkOrder(reportId: string, workOrderId: string): Promise<PilotReport> {
    return this.pilotReportRepository.linkToWorkOrder(reportId, workOrderId);
  }

  /**
   * Delete pilot report (soft delete)
   */
  async delete(id: string): Promise<void> {
    const existing = await this.pilotReportRepository.findById(id);
    if (!existing) {
      throw new NotFoundException("Pilot report not found");
    }

    await this.pilotReportRepository.delete(id);
  }
}

// Re-export types for convenience
export type { PilotReport };
