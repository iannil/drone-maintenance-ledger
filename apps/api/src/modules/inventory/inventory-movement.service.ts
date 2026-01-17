/**
 * Inventory Movement Service
 *
 * Business logic for inventory movements (receipts, issues, transfers, etc.)
 */

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from "@nestjs/common";

import type { InventoryMovement } from "@repo/db";
import { MovementTypeEnum, MovementStatusEnum } from "@repo/db";
import { InventoryMovementRepository } from "./repositories/inventory-movement.repository";
import { InventoryItemRepository } from "./repositories/inventory-item.repository";

/**
 * DTOs for movement operations
 */
export interface CreateMovementDto {
  type: string;
  partNumber: string;
  partName?: string;
  inventoryItemId?: string;
  quantity: number;
  unit?: string;
  fromWarehouseId?: string;
  toWarehouseId?: string;
  fromLocation?: string;
  toLocation?: string;
  referenceType?: string;
  referenceId?: string;
  referenceNumber?: string;
  unitCost?: number;
  batchNumber?: string;
  serialNumbers?: string[];
  reason?: string;
  notes?: string;
  requestedBy?: string;
}

export interface UpdateMovementDto {
  quantity?: number;
  fromWarehouseId?: string;
  toWarehouseId?: string;
  fromLocation?: string;
  toLocation?: string;
  referenceType?: string;
  referenceId?: string;
  referenceNumber?: string;
  unitCost?: number;
  batchNumber?: string;
  serialNumbers?: string[];
  reason?: string;
  notes?: string;
}

export interface ApproveMovementDto {
  approvedBy: string;
}

export interface ListMovementsDto {
  limit?: number;
  offset?: number;
  type?: string;
  status?: string;
  warehouseId?: string;
  inventoryItemId?: string;
  startDate?: number;
  endDate?: number;
}

@Injectable()
export class InventoryMovementService {
  constructor(
    @Inject(InventoryMovementRepository)
    private readonly movementRepo: InventoryMovementRepository,
    @Inject(InventoryItemRepository)
    private readonly inventoryRepo: InventoryItemRepository
  ) {}

  /**
   * Find movement by ID
   */
  async findById(id: string): Promise<InventoryMovement | null> {
    return this.movementRepo.findById(id);
  }

  /**
   * Create new movement
   */
  async create(dto: CreateMovementDto): Promise<InventoryMovement> {
    // Validate movement type
    if (!Object.values(MovementTypeEnum).includes(dto.type as any)) {
      throw new BadRequestException(`Invalid movement type: ${dto.type}`);
    }

    // Validate warehouse requirements based on type
    if (dto.type === MovementTypeEnum.TRANSFER) {
      if (!dto.fromWarehouseId || !dto.toWarehouseId) {
        throw new BadRequestException("Transfer requires both source and destination warehouses");
      }
      if (dto.fromWarehouseId === dto.toWarehouseId) {
        throw new BadRequestException("Source and destination warehouses must be different");
      }
    }

    if (dto.type === MovementTypeEnum.RECEIPT && !dto.toWarehouseId) {
      throw new BadRequestException("Receipt requires destination warehouse");
    }

    if (dto.type === MovementTypeEnum.ISSUE && !dto.fromWarehouseId) {
      throw new BadRequestException("Issue requires source warehouse");
    }

    // Generate movement number
    const movementNumber = await this.movementRepo.generateMovementNumber(dto.type);

    // Calculate total cost
    const totalCost = dto.unitCost ? dto.unitCost * dto.quantity : undefined;

    return this.movementRepo.create({
      movementNumber,
      type: dto.type,
      status: MovementStatusEnum.PENDING,
      inventoryItemId: dto.inventoryItemId || null,
      partNumber: dto.partNumber,
      partName: dto.partName || null,
      quantity: dto.quantity,
      unit: dto.unit || "个",
      fromWarehouseId: dto.fromWarehouseId || null,
      toWarehouseId: dto.toWarehouseId || null,
      fromLocation: dto.fromLocation || null,
      toLocation: dto.toLocation || null,
      referenceType: dto.referenceType || null,
      referenceId: dto.referenceId || null,
      referenceNumber: dto.referenceNumber || null,
      unitCost: dto.unitCost || null,
      totalCost: totalCost || null,
      batchNumber: dto.batchNumber || null,
      serialNumbers: dto.serialNumbers ? JSON.stringify(dto.serialNumbers) : null,
      reason: dto.reason || null,
      notes: dto.notes || null,
      requestedBy: dto.requestedBy || null,
    });
  }

  /**
   * Update movement (only allowed for PENDING movements)
   */
  async update(id: string, dto: UpdateMovementDto): Promise<InventoryMovement> {
    const existing = await this.movementRepo.findById(id);
    if (!existing) {
      throw new NotFoundException("Movement not found");
    }

    if (existing.status !== MovementStatusEnum.PENDING) {
      throw new BadRequestException("Can only update pending movements");
    }

    // Recalculate total cost if needed
    let totalCost = existing.totalCost;
    if (dto.unitCost !== undefined || dto.quantity !== undefined) {
      const unitCost = dto.unitCost ?? existing.unitCost;
      const quantity = dto.quantity ?? existing.quantity;
      totalCost = unitCost ? unitCost * quantity : null;
    }

    return this.movementRepo.update(id, {
      ...dto,
      totalCost,
      serialNumbers: dto.serialNumbers ? JSON.stringify(dto.serialNumbers) : undefined,
    });
  }

  /**
   * Approve movement
   */
  async approve(id: string, dto: ApproveMovementDto): Promise<InventoryMovement> {
    const existing = await this.movementRepo.findById(id);
    if (!existing) {
      throw new NotFoundException("Movement not found");
    }

    if (existing.status !== MovementStatusEnum.PENDING) {
      throw new BadRequestException("Can only approve pending movements");
    }

    return this.movementRepo.update(id, {
      status: MovementStatusEnum.APPROVED,
      approvedBy: dto.approvedBy,
      approvedAt: Date.now(),
    });
  }

  /**
   * Complete movement and update inventory
   */
  async complete(id: string): Promise<InventoryMovement> {
    const existing = await this.movementRepo.findById(id);
    if (!existing) {
      throw new NotFoundException("Movement not found");
    }

    if (existing.status !== MovementStatusEnum.APPROVED) {
      throw new BadRequestException("Can only complete approved movements");
    }

    // Update inventory based on movement type
    if (existing.inventoryItemId) {
      const inventoryItem = await this.inventoryRepo.findById(existing.inventoryItemId);
      if (inventoryItem) {
        switch (existing.type) {
          case MovementTypeEnum.RECEIPT:
          case MovementTypeEnum.RETURN:
            // Increase inventory
            await this.inventoryRepo.updateQuantity(
              existing.inventoryItemId,
              existing.quantity,
              0
            );
            break;

          case MovementTypeEnum.ISSUE:
          case MovementTypeEnum.SCRAP:
            // Decrease inventory
            if (inventoryItem.availableQuantity < existing.quantity) {
              throw new BadRequestException(
                `Insufficient inventory: available ${inventoryItem.availableQuantity}, requested ${existing.quantity}`
              );
            }
            await this.inventoryRepo.updateQuantity(
              existing.inventoryItemId,
              -existing.quantity,
              0
            );
            break;

          case MovementTypeEnum.ADJUSTMENT:
          case MovementTypeEnum.COUNT:
            // Set to specific quantity (quantity field represents the difference)
            await this.inventoryRepo.updateQuantity(
              existing.inventoryItemId,
              existing.quantity,
              0
            );
            break;

          case MovementTypeEnum.TRANSFER:
            // Transfer is handled via separate from/to inventory items
            break;
        }
      }
    }

    return this.movementRepo.update(id, {
      status: MovementStatusEnum.COMPLETED,
    });
  }

  /**
   * Cancel movement
   */
  async cancel(id: string): Promise<InventoryMovement> {
    const existing = await this.movementRepo.findById(id);
    if (!existing) {
      throw new NotFoundException("Movement not found");
    }

    if (existing.status === MovementStatusEnum.COMPLETED) {
      throw new BadRequestException("Cannot cancel completed movements");
    }

    return this.movementRepo.update(id, {
      status: MovementStatusEnum.CANCELLED,
    });
  }

  /**
   * Delete movement (only allowed for PENDING or CANCELLED)
   */
  async delete(id: string): Promise<void> {
    const existing = await this.movementRepo.findById(id);
    if (!existing) {
      throw new NotFoundException("Movement not found");
    }

    if (
      existing.status !== MovementStatusEnum.PENDING &&
      existing.status !== MovementStatusEnum.CANCELLED
    ) {
      throw new BadRequestException("Can only delete pending or cancelled movements");
    }

    await this.movementRepo.delete(id);
  }

  /**
   * List movements
   */
  async list(options: ListMovementsDto = {}): Promise<{
    data: InventoryMovement[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { limit = 50, offset = 0, ...filters } = options;
    const [data, total] = await Promise.all([
      this.movementRepo.list({ limit, offset, ...filters }),
      this.movementRepo.count(filters),
    ]);

    return { data, total, limit, offset };
  }

  /**
   * Search movements
   */
  async search(query: string, limit: number = 50): Promise<InventoryMovement[]> {
    return this.movementRepo.search(query, limit);
  }

  /**
   * Get movements for an inventory item
   */
  async getByInventoryItem(inventoryItemId: string): Promise<InventoryMovement[]> {
    return this.movementRepo.getByInventoryItem(inventoryItemId);
  }

  /**
   * Get pending movements
   */
  async getPending(): Promise<InventoryMovement[]> {
    return this.movementRepo.getPending();
  }

  /**
   * Get movement statistics
   */
  async getStats(options: {
    startDate?: number;
    endDate?: number;
    warehouseId?: string;
  } = {}): Promise<{
    total: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
  }> {
    const movements = await this.movementRepo.list({
      ...options,
      limit: 10000,
    });

    const byType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};

    for (const movement of movements) {
      byType[movement.type] = (byType[movement.type] || 0) + 1;
      byStatus[movement.status] = (byStatus[movement.status] || 0) + 1;
    }

    return {
      total: movements.length,
      byType,
      byStatus,
    };
  }
}
