/**
 * Inventory Item Service
 *
 * Business logic for inventory management
 */

import { Injectable, ConflictException, NotFoundException, BadRequestException, Inject } from "@nestjs/common";

import type { InventoryItem } from "@repo/db";
import { InventoryItemRepository } from "./repositories/inventory-item.repository";

/**
 * DTOs for inventory operations
 */
export interface CreateInventoryItemDto {
  partNumber: string;
  name: string;
  description?: string;
  category?: string;
  unit?: string;
  warehouseId?: string;
  location?: string;
  binNumber?: string;
  quantity?: number;
  minStock?: number;
  maxStock?: number;
  reorderPoint?: number;
  reorderQuantity?: number;
  unitCost?: number;
  batchNumber?: string;
  expiryDate?: number;
}

export interface UpdateInventoryItemDto {
  name?: string;
  description?: string;
  category?: string;
  unit?: string;
  warehouseId?: string;
  location?: string;
  binNumber?: string;
  minStock?: number;
  maxStock?: number;
  reorderPoint?: number;
  reorderQuantity?: number;
  unitCost?: number;
  status?: string;
}

export interface AdjustInventoryDto {
  quantity: number; // Positive for increase, negative for decrease
  reason: string;
  notes?: string;
}

export interface ListInventoryDto {
  limit?: number;
  offset?: number;
  warehouseId?: string;
  status?: string;
  category?: string;
  lowStock?: boolean;
}

@Injectable()
export class InventoryItemService {
  constructor(
    @Inject(InventoryItemRepository)
    private readonly inventoryRepo: InventoryItemRepository
  ) {}

  /**
   * Find inventory item by ID
   */
  async findById(id: string): Promise<InventoryItem | null> {
    return this.inventoryRepo.findById(id);
  }

  /**
   * Create new inventory item
   */
  async create(dto: CreateInventoryItemDto): Promise<InventoryItem> {
    // Check for duplicate part number in same warehouse
    if (dto.warehouseId) {
      const existing = await this.inventoryRepo.findByPartNumberAndWarehouse(
        dto.partNumber,
        dto.warehouseId
      );
      if (existing) {
        throw new ConflictException(
          "Inventory item with this part number already exists in this warehouse"
        );
      }
    }

    // Calculate total value if unit cost and quantity provided
    const totalValue = dto.unitCost && dto.quantity
      ? dto.unitCost * dto.quantity
      : undefined;

    return this.inventoryRepo.create({
      ...dto,
      totalValue,
    });
  }

  /**
   * Update inventory item
   */
  async update(id: string, dto: UpdateInventoryItemDto): Promise<InventoryItem> {
    const existing = await this.inventoryRepo.findById(id);
    if (!existing) {
      throw new NotFoundException("Inventory item not found");
    }

    return this.inventoryRepo.update(id, dto);
  }

  /**
   * Adjust inventory quantity
   */
  async adjustQuantity(id: string, dto: AdjustInventoryDto): Promise<InventoryItem> {
    const existing = await this.inventoryRepo.findById(id);
    if (!existing) {
      throw new NotFoundException("Inventory item not found");
    }

    // Validate adjustment won't result in negative quantity
    const newQuantity = existing.quantity + dto.quantity;
    if (newQuantity < 0) {
      throw new BadRequestException(
        `Cannot adjust quantity: would result in negative inventory (current: ${existing.quantity}, adjustment: ${dto.quantity})`
      );
    }

    // Update quantity and recalculate total value
    const totalValue = existing.unitCost
      ? existing.unitCost * newQuantity
      : undefined;

    return this.inventoryRepo.update(id, {
      quantity: newQuantity,
      availableQuantity: newQuantity - existing.reservedQuantity,
      totalValue,
    });
  }

  /**
   * Reserve inventory for a work order
   */
  async reserve(id: string, quantity: number): Promise<InventoryItem> {
    const existing = await this.inventoryRepo.findById(id);
    if (!existing) {
      throw new NotFoundException("Inventory item not found");
    }

    if (quantity > existing.availableQuantity) {
      throw new BadRequestException(
        `Insufficient available quantity: requested ${quantity}, available ${existing.availableQuantity}`
      );
    }

    return this.inventoryRepo.updateQuantity(id, 0, quantity);
  }

  /**
   * Release reserved inventory
   */
  async release(id: string, quantity: number): Promise<InventoryItem> {
    const existing = await this.inventoryRepo.findById(id);
    if (!existing) {
      throw new NotFoundException("Inventory item not found");
    }

    if (quantity > existing.reservedQuantity) {
      throw new BadRequestException(
        `Cannot release more than reserved: requested ${quantity}, reserved ${existing.reservedQuantity}`
      );
    }

    return this.inventoryRepo.updateQuantity(id, 0, -quantity);
  }

  /**
   * Delete inventory item
   */
  async delete(id: string): Promise<void> {
    const existing = await this.inventoryRepo.findById(id);
    if (!existing) {
      throw new NotFoundException("Inventory item not found");
    }

    if (existing.quantity > 0) {
      throw new BadRequestException(
        "Cannot delete inventory item with positive quantity"
      );
    }

    await this.inventoryRepo.delete(id);
  }

  /**
   * List inventory items
   */
  async list(options: ListInventoryDto = {}): Promise<{
    data: InventoryItem[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { limit = 50, offset = 0, ...filters } = options;
    const [data, total] = await Promise.all([
      this.inventoryRepo.list({ limit, offset, ...filters }),
      this.inventoryRepo.count(filters),
    ]);

    return { data, total, limit, offset };
  }

  /**
   * Search inventory items
   */
  async search(query: string, limit: number = 50): Promise<InventoryItem[]> {
    return this.inventoryRepo.search(query, limit);
  }

  /**
   * Get inventory alerts (low stock and expiring items)
   */
  async getAlerts(): Promise<{
    lowStock: InventoryItem[];
    expiring: InventoryItem[];
  }> {
    const [lowStock, expiring] = await Promise.all([
      this.inventoryRepo.getLowStockItems(),
      this.inventoryRepo.getExpiringItems(30),
    ]);

    return { lowStock, expiring };
  }
}
