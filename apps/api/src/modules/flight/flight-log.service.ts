import { Injectable, NotFoundException, ConflictException, Inject } from "@nestjs/common";

import type { FlightLog } from "@repo/db";
import { FlightLogRepository } from "./repositories/flight-log.repository";

/**
 * DTOs for flight log operations
 */
export interface CreateFlightLogDto {
  aircraftId: string;
  pilotId: string;
  copilotId?: string;
  flightDate: number;
  flightType: FlightLog["flightType"];
  departureLocation: string;
  departureTime?: number;
  arrivalLocation?: string;
  arrivalTime?: number;
  flightDuration: number; // minutes
  flightHours: number; // hours
  takeoffCycles?: number;
  landingCycles?: number;
  missionDescription?: string;
  payloadWeight?: number;
  preFlightCheckCompleted?: boolean;
  preFlightCheckBy?: string;
  postFlightNotes?: string;
  discrepancies?: string;
}

export interface UpdateFlightLogDto {
  flightDate?: number;
  flightType?: FlightLog["flightType"];
  departureLocation?: string;
  departureTime?: number;
  arrivalLocation?: string;
  arrivalTime?: number;
  flightDuration?: number;
  flightHours?: number;
  takeoffCycles?: number;
  landingCycles?: number;
  missionDescription?: string;
  payloadWeight?: number;
  postFlightNotes?: string;
  discrepancies?: string;
}

/**
 * Flight Log service
 *
 * Handles flight log business logic
 * Automatically updates aircraft and component lifecycle metrics
 */
@Injectable()
export class FlightLogService {
  private flightLogRepository: FlightLogRepository;

  constructor(@Inject(FlightLogRepository) flightLogRepository: FlightLogRepository) {
    this.flightLogRepository = flightLogRepository;
  }

  /**
   * Find flight log by ID
   */
  async findById(id: string): Promise<FlightLog | null> {
    return this.flightLogRepository.findById(id);
  }

  /**
   * Find flight logs for an aircraft
   */
  async findByAircraft(aircraftId: string, limit: number = 50, offset: number = 0) {
    return this.flightLogRepository.findByAircraft(aircraftId, limit, offset);
  }

  /**
   * Find flight logs by pilot
   */
  async findByPilot(pilotId: string, limit: number = 50, offset: number = 0) {
    return this.flightLogRepository.findByPilot(pilotId, limit, offset);
  }

  /**
   * Find flight logs by date range
   */
  async findByDateRange(startDate: Date, endDate: Date) {
    return this.flightLogRepository.findByDateRange(startDate, endDate);
  }

  /**
   * Get recent flight logs
   */
  async getRecent(limit: number = 20) {
    return this.flightLogRepository.findRecent(limit);
  }

  /**
   * Get aircraft flight statistics
   */
  async getAircraftStats(aircraftId: string) {
    return this.flightLogRepository.getAircraftStats(aircraftId);
  }

  /**
   * Create new flight log
   *
   * This operation:
   * 1. Records the flight log
   * 2. Updates aircraft total hours and cycles
   * 3. Updates all installed components' hours and cycles
   */
  async create(dto: CreateFlightLogDto): Promise<FlightLog> {
    // Get current aircraft stats before flight
    const statsBefore = await this.flightLogRepository.getAircraftStats(dto.aircraftId);

    // Create flight log with snapshot of before/after metrics
    const cycles = (dto.takeoffCycles || 1) + (dto.landingCycles || 1);
    const hoursAfter = (statsBefore.totalHours || 0) + dto.flightHours;
    const cyclesAfter = (statsBefore.totalCycles || 0) + cycles;

    const flightLog = await this.flightLogRepository.create({
      ...dto,
      takeoffCycles: dto.takeoffCycles || 1,
      landingCycles: dto.landingCycles || 1,
      aircraftHoursBefore: statsBefore.totalHours,
      aircraftHoursAfter: hoursAfter,
      aircraftCyclesBefore: statsBefore.totalCycles,
      aircraftCyclesAfter: cyclesAfter,
    });

    // Update aircraft and component lifecycle metrics
    await this.flightLogRepository.updateLifecycleMetrics(
      dto.aircraftId,
      dto.flightHours,
      cycles,
    );

    return flightLog;
  }

  /**
   * Update flight log
   *
   * Note: Updating flight hours/cycles after creation is complex
   * because lifecycle metrics have already been updated.
   * This should be done carefully, typically with an adjustment record.
   */
  async update(id: string, dto: UpdateFlightLogDto): Promise<FlightLog> {
    const existing = await this.flightLogRepository.findById(id);
    if (!existing) {
      throw new NotFoundException("Flight log not found");
    }

    // If changing flight hours or cycles, warn about complexity
    if (
      dto.flightHours !== undefined &&
      dto.flightHours !== existing.flightHours
    ) {
      // In production, this would require creating adjustment records
      // For now, we allow the update but don't adjust lifecycle metrics
      console.warn(
        `Flight hours changed from ${existing.flightHours} to ${dto.flightHours}. ` +
        "Lifecycle metrics not adjusted automatically.",
      );
    }

    return this.flightLogRepository.update(id, dto);
  }

  /**
   * Delete flight log (soft delete)
   *
   * Note: This does NOT reverse the lifecycle metric updates.
   * In production, flight logs should generally not be deleted.
   */
  async delete(id: string): Promise<void> {
    const existing = await this.flightLogRepository.findById(id);
    if (!existing) {
      throw new NotFoundException("Flight log not found");
    }

    await this.flightLogRepository.delete(id);
  }
}

// Re-export types for convenience
export type { FlightLog };
