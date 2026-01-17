/**
 * Warehouse Service
 *
 * Business logic for warehouse management
 */

import { Injectable, ConflictException, NotFoundException, Inject } from "@nestjs/common";

import type { Warehouse } from "@repo/db";
import { WarehouseRepository } from "./repositories/warehouse.repository";

/**
 * DTOs for warehouse operations
 */
export interface CreateWarehouseDto {
  code: string;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  province?: string;
  country?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  totalCapacity?: number;
}

export interface UpdateWarehouseDto {
  name?: string;
  description?: string;
  address?: string;
  city?: string;
  province?: string;
  country?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  status?: string;
  totalCapacity?: number;
  usedCapacity?: number;
}

export interface ListWarehousesDto {
  limit?: number;
  offset?: number;
  status?: string;
}

@Injectable()
export class WarehouseService {
  constructor(
    @Inject(WarehouseRepository)
    private readonly warehouseRepo: WarehouseRepository
  ) {}

  /**
   * Find warehouse by ID
   */
  async findById(id: string): Promise<Warehouse | null> {
    return this.warehouseRepo.findById(id);
  }

  /**
   * Create new warehouse
   */
  async create(dto: CreateWarehouseDto): Promise<Warehouse> {
    // Check if code already exists
    const existing = await this.warehouseRepo.findByCode(dto.code);
    if (existing) {
      throw new ConflictException("Warehouse code already exists");
    }

    return this.warehouseRepo.create(dto);
  }

  /**
   * Update warehouse
   */
  async update(id: string, dto: UpdateWarehouseDto): Promise<Warehouse> {
    const existing = await this.warehouseRepo.findById(id);
    if (!existing) {
      throw new NotFoundException("Warehouse not found");
    }

    return this.warehouseRepo.update(id, dto);
  }

  /**
   * Delete warehouse
   */
  async delete(id: string): Promise<void> {
    const existing = await this.warehouseRepo.findById(id);
    if (!existing) {
      throw new NotFoundException("Warehouse not found");
    }

    // TODO: Check if warehouse has inventory items before deletion
    await this.warehouseRepo.delete(id);
  }

  /**
   * List all warehouses
   */
  async list(options: ListWarehousesDto = {}): Promise<{
    data: Warehouse[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { limit = 50, offset = 0, status } = options;
    const [data, total] = await Promise.all([
      this.warehouseRepo.list({ limit, offset, status }),
      this.warehouseRepo.count(status),
    ]);

    return { data, total, limit, offset };
  }

  /**
   * Search warehouses
   */
  async search(query: string, limit: number = 50): Promise<Warehouse[]> {
    return this.warehouseRepo.search(query, limit);
  }
}
