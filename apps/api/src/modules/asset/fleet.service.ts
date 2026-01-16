import { Injectable, ConflictException, NotFoundException, Inject } from "@nestjs/common";

import type { Fleet } from "@repo/db";
import { FleetRepository } from "./repositories/fleet.repository";

/**
 * DTOs for fleet operations
 */
export interface CreateFleetDto {
  name: string;
  code: string;
  organization: string;
  description?: string;
}

export interface UpdateFleetDto {
  name?: string;
  code?: string;
  organization?: string;
  description?: string;
}

/**
 * Fleet service
 *
 * Handles fleet business logic
 */
@Injectable()
export class FleetService {
  private fleetRepo: FleetRepository;

  constructor(@Inject(FleetRepository) fleetRepository: FleetRepository) {
    this.fleetRepo = fleetRepository;
  }

  /**
   * Find fleet by ID
   */
  async findById(id: string): Promise<Fleet | null> {
    return this.fleetRepo.findById(id);
  }

  /**
   * Find fleet by code
   */
  async findByCode(code: string): Promise<Fleet | null> {
    return this.fleetRepo.findByCode(code);
  }

  /**
   * Create new fleet
   */
  async create(dto: CreateFleetDto): Promise<Fleet> {
    // Check if code already exists
    const existing = await this.fleetRepo.findByCode(dto.code);
    if (existing) {
      throw new ConflictException("Fleet code already exists");
    }

    return this.fleetRepo.create(dto);
  }

  /**
   * Update fleet
   */
  async update(id: string, dto: UpdateFleetDto): Promise<Fleet> {
    const existing = await this.fleetRepo.findById(id);
    if (!existing) {
      throw new NotFoundException("Fleet not found");
    }

    // Check code uniqueness if changing code
    if (dto.code && dto.code !== existing.code) {
      const existingByCode = await this.fleetRepo.findByCode(dto.code);
      if (existingByCode) {
        throw new ConflictException("Fleet code already exists");
      }
    }

    return this.fleetRepo.update(id, dto);
  }

  /**
   * Delete fleet
   */
  async delete(id: string): Promise<void> {
    const existing = await this.fleetRepo.findById(id);
    if (!existing) {
      throw new NotFoundException("Fleet not found");
    }

    await this.fleetRepo.delete(id);
  }

  /**
   * List all fleets
   */
  async list(limit: number = 50, offset: number = 0): Promise<Fleet[]> {
    return this.fleetRepo.list(limit, offset);
  }

  /**
   * Search fleets
   */
  async search(query: string, limit: number = 50): Promise<Fleet[]> {
    return this.fleetRepo.search(query, limit);
  }
}
