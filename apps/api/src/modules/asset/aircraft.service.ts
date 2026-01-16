import { Injectable, ConflictException, NotFoundException, Inject } from "@nestjs/common";

import type { Aircraft } from "@repo/db";
import { AircraftRepository } from "./repositories/aircraft.repository";

/**
 * DTOs for aircraft operations
 */
export interface CreateAircraftDto {
  fleetId: string;
  registrationNumber: string;
  serialNumber: string;
  model: string;
  manufacturer: string;
  status?: Aircraft["status"];
}

export interface UpdateAircraftDto {
  fleetId?: string;
  registrationNumber?: string;
  serialNumber?: string;
  model?: string;
  manufacturer?: string;
  status?: Aircraft["status"];
  isAirworthy?: boolean;
}

/**
 * Aircraft service
 *
 * Handles aircraft business logic
 */
@Injectable()
export class AircraftService {
  private aircraftRepo: AircraftRepository;

  constructor(@Inject(AircraftRepository) aircraftRepository: AircraftRepository) {
    this.aircraftRepo = aircraftRepository;
  }

  /**
   * Find aircraft by ID
   */
  async findById(id: string): Promise<Aircraft | null> {
    return this.aircraftRepo.findById(id);
  }

  /**
   * Find aircraft by registration number
   */
  async findByRegistration(registrationNumber: string): Promise<Aircraft | null> {
    return this.aircraftRepo.findByRegistration(registrationNumber);
  }

  /**
   * List aircraft by fleet
   */
  async findByFleet(fleetId: string, limit: number = 50, offset: number = 0): Promise<Aircraft[]> {
    return this.aircraftRepo.findByFleet(fleetId, limit, offset);
  }

  /**
   * Create new aircraft
   */
  async create(dto: CreateAircraftDto): Promise<Aircraft> {
    // Check if registration number already exists
    const existing = await this.aircraftRepo.findByRegistration(dto.registrationNumber);
    if (existing) {
      throw new ConflictException("Registration number already exists");
    }

    // Check if serial number already exists
    const existingSerial = await this.aircraftRepo.findBySerialNumber(dto.serialNumber);
    if (existingSerial) {
      throw new ConflictException("Serial number already exists");
    }

    return this.aircraftRepo.create({
      ...dto,
      status: dto.status ?? "AVAILABLE",
      isAirworthy: true,
      totalFlightHours: 0,
      totalFlightCycles: 0,
    });
  }

  /**
   * Update aircraft
   */
  async update(id: string, dto: UpdateAircraftDto): Promise<Aircraft> {
    const existing = await this.aircraftRepo.findById(id);
    if (!existing) {
      throw new NotFoundException("Aircraft not found");
    }

    // Check registration uniqueness if changing
    if (dto.registrationNumber && dto.registrationNumber !== existing.registrationNumber) {
      const existingReg = await this.aircraftRepo.findByRegistration(dto.registrationNumber);
      if (existingReg) {
        throw new ConflictException("Registration number already exists");
      }
    }

    return this.aircraftRepo.update(id, dto);
  }

  /**
   * Update aircraft flight metrics
   */
  async addFlightMetrics(id: string, flightHours: number, flightCycles: number): Promise<Aircraft> {
    return this.aircraftRepo.updateFlightMetrics(id, flightHours, flightCycles);
  }

  /**
   * Update aircraft status
   */
  async updateStatus(id: string, status: Aircraft["status"], isAirworthy?: boolean): Promise<Aircraft> {
    return this.aircraftRepo.updateStatus(id, status, isAirworthy);
  }

  /**
   * Delete aircraft
   */
  async delete(id: string): Promise<void> {
    const existing = await this.aircraftRepo.findById(id);
    if (!existing) {
      throw new NotFoundException("Aircraft not found");
    }

    await this.aircraftRepo.delete(id);
  }

  /**
   * List all aircraft
   */
  async list(limit: number = 50, offset: number = 0): Promise<Aircraft[]> {
    return this.aircraftRepo.list(limit, offset);
  }

  /**
   * Get aircraft status counts
   */
  async getStatusCounts(fleetId?: string): Promise<Record<string, number>> {
    return this.aircraftRepo.countByStatus(fleetId);
  }
}
