/**
 * Supplier Service
 *
 * Business logic for supplier management
 */

import { Injectable, ConflictException, NotFoundException, Inject } from "@nestjs/common";

import type { Supplier } from "@repo/db";
import { SupplierRepository } from "./repositories/supplier.repository";

/**
 * DTOs for supplier operations
 */
export interface CreateSupplierDto {
  code: string;
  name: string;
  shortName?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  website?: string;
  address?: string;
  city?: string;
  province?: string;
  country?: string;
  postalCode?: string;
  businessLicense?: string;
  taxId?: string;
  bankName?: string;
  bankAccount?: string;
  categories?: string;
  mainProducts?: string;
  paymentTerms?: string;
  creditLimit?: number;
  leadTimeDays?: number;
  notes?: string;
}

export interface UpdateSupplierDto {
  name?: string;
  shortName?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  website?: string;
  address?: string;
  city?: string;
  province?: string;
  country?: string;
  postalCode?: string;
  businessLicense?: string;
  taxId?: string;
  bankName?: string;
  bankAccount?: string;
  categories?: string;
  mainProducts?: string;
  status?: string;
  rating?: string;
  paymentTerms?: string;
  creditLimit?: number;
  leadTimeDays?: number;
  onTimeDeliveryRate?: number;
  qualityScore?: number;
  notes?: string;
}

export interface ListSuppliersDto {
  limit?: number;
  offset?: number;
  status?: string;
  rating?: string;
}

@Injectable()
export class SupplierService {
  constructor(
    @Inject(SupplierRepository)
    private readonly supplierRepo: SupplierRepository
  ) {}

  /**
   * Find supplier by ID
   */
  async findById(id: string): Promise<Supplier | null> {
    return this.supplierRepo.findById(id);
  }

  /**
   * Create new supplier
   */
  async create(dto: CreateSupplierDto): Promise<Supplier> {
    // Check if code already exists
    const existing = await this.supplierRepo.findByCode(dto.code);
    if (existing) {
      throw new ConflictException("Supplier code already exists");
    }

    return this.supplierRepo.create(dto);
  }

  /**
   * Update supplier
   */
  async update(id: string, dto: UpdateSupplierDto): Promise<Supplier> {
    const existing = await this.supplierRepo.findById(id);
    if (!existing) {
      throw new NotFoundException("Supplier not found");
    }

    return this.supplierRepo.update(id, dto);
  }

  /**
   * Delete supplier
   */
  async delete(id: string): Promise<void> {
    const existing = await this.supplierRepo.findById(id);
    if (!existing) {
      throw new NotFoundException("Supplier not found");
    }

    // TODO: Check if supplier has active orders before deletion
    await this.supplierRepo.delete(id);
  }

  /**
   * List suppliers
   */
  async list(options: ListSuppliersDto = {}): Promise<{
    data: Supplier[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { limit = 50, offset = 0, status, rating } = options;
    const [data, total] = await Promise.all([
      this.supplierRepo.list({ limit, offset, status, rating }),
      this.supplierRepo.count(status),
    ]);

    return { data, total, limit, offset };
  }

  /**
   * Search suppliers
   */
  async search(query: string, limit: number = 50): Promise<Supplier[]> {
    return this.supplierRepo.search(query, limit);
  }
}
