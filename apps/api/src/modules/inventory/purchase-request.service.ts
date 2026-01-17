/**
 * Purchase Request Service
 *
 * Business logic for purchase request management
 */

import { Injectable, NotFoundException, BadRequestException, Inject } from "@nestjs/common";

import type { PurchaseRequest, PurchaseRequestItem } from "@repo/db";
import { PurchaseRequestRepository } from "./repositories/purchase-request.repository";

/**
 * DTOs for purchase request operations
 */
export interface CreatePurchaseRequestDto {
  title: string;
  description?: string;
  priority?: string;
  requesterId?: string;
  department?: string;
  requiredDate?: number;
  budgetCode?: string;
  referenceType?: string;
  referenceId?: string;
  referenceNumber?: string;
  notes?: string;
  items?: CreatePurchaseRequestItemDto[];
}

export interface CreatePurchaseRequestItemDto {
  partNumber: string;
  name: string;
  description?: string;
  specification?: string;
  quantity: number;
  unit?: string;
  estimatedUnitPrice?: number;
  preferredSupplierId?: string;
  preferredSupplierName?: string;
  notes?: string;
}

export interface UpdatePurchaseRequestDto {
  title?: string;
  description?: string;
  priority?: string;
  requiredDate?: number;
  budgetCode?: string;
  notes?: string;
}

export interface ListPurchaseRequestsDto {
  limit?: number;
  offset?: number;
  status?: string;
  requesterId?: string;
  priority?: string;
}

@Injectable()
export class PurchaseRequestService {
  constructor(
    @Inject(PurchaseRequestRepository)
    private readonly prRepo: PurchaseRequestRepository
  ) {}

  /**
   * Find purchase request by ID
   */
  async findById(id: string): Promise<PurchaseRequest | null> {
    return this.prRepo.findById(id);
  }

  /**
   * Get purchase request with items
   */
  async findByIdWithItems(id: string): Promise<{
    request: PurchaseRequest;
    items: PurchaseRequestItem[];
  } | null> {
    const request = await this.prRepo.findById(id);
    if (!request) {
      return null;
    }
    const items = await this.prRepo.getItems(id);
    return { request, items };
  }

  /**
   * Create new purchase request
   */
  async create(dto: CreatePurchaseRequestDto): Promise<PurchaseRequest> {
    const requestNumber = await this.prRepo.generateRequestNumber();

    // Calculate estimated total from items
    let estimatedTotal = 0;
    if (dto.items) {
      estimatedTotal = dto.items.reduce((sum, item) => {
        const itemTotal = (item.estimatedUnitPrice || 0) * item.quantity;
        return sum + itemTotal;
      }, 0);
    }

    const request = await this.prRepo.create({
      requestNumber,
      title: dto.title,
      description: dto.description,
      priority: dto.priority || "NORMAL",
      requesterId: dto.requesterId,
      department: dto.department,
      requiredDate: dto.requiredDate,
      budgetCode: dto.budgetCode,
      referenceType: dto.referenceType,
      referenceId: dto.referenceId,
      referenceNumber: dto.referenceNumber,
      notes: dto.notes,
      estimatedTotal,
    });

    // Add items
    if (dto.items && dto.items.length > 0) {
      for (const item of dto.items) {
        await this.prRepo.addItem({
          purchaseRequestId: request.id,
          partNumber: item.partNumber,
          name: item.name,
          description: item.description,
          specification: item.specification,
          quantity: item.quantity,
          unit: item.unit || "个",
          estimatedUnitPrice: item.estimatedUnitPrice,
          estimatedTotal: (item.estimatedUnitPrice || 0) * item.quantity,
          preferredSupplierId: item.preferredSupplierId,
          preferredSupplierName: item.preferredSupplierName,
          notes: item.notes,
        });
      }
    }

    return request;
  }

  /**
   * Update purchase request
   */
  async update(id: string, dto: UpdatePurchaseRequestDto): Promise<PurchaseRequest> {
    const existing = await this.prRepo.findById(id);
    if (!existing) {
      throw new NotFoundException("Purchase request not found");
    }

    // Cannot update if not in DRAFT status
    if (existing.status !== "DRAFT") {
      throw new BadRequestException("Cannot update purchase request that is not in DRAFT status");
    }

    return this.prRepo.update(id, dto);
  }

  /**
   * Submit purchase request for approval
   */
  async submit(id: string): Promise<PurchaseRequest> {
    const existing = await this.prRepo.findById(id);
    if (!existing) {
      throw new NotFoundException("Purchase request not found");
    }

    if (existing.status !== "DRAFT") {
      throw new BadRequestException("Only DRAFT requests can be submitted");
    }

    // Verify there are items
    const items = await this.prRepo.getItems(id);
    if (items.length === 0) {
      throw new BadRequestException("Cannot submit empty purchase request");
    }

    return this.prRepo.update(id, {
      status: "SUBMITTED",
      submittedAt: Date.now(),
    });
  }

  /**
   * Approve purchase request
   */
  async approve(id: string, approverId: string): Promise<PurchaseRequest> {
    const existing = await this.prRepo.findById(id);
    if (!existing) {
      throw new NotFoundException("Purchase request not found");
    }

    if (existing.status !== "SUBMITTED") {
      throw new BadRequestException("Only SUBMITTED requests can be approved");
    }

    return this.prRepo.update(id, {
      status: "APPROVED",
      approvedBy: approverId,
      approvedAt: Date.now(),
    });
  }

  /**
   * Reject purchase request
   */
  async reject(id: string, rejectorId: string, reason: string): Promise<PurchaseRequest> {
    const existing = await this.prRepo.findById(id);
    if (!existing) {
      throw new NotFoundException("Purchase request not found");
    }

    if (existing.status !== "SUBMITTED") {
      throw new BadRequestException("Only SUBMITTED requests can be rejected");
    }

    return this.prRepo.update(id, {
      status: "REJECTED",
      rejectedBy: rejectorId,
      rejectedAt: Date.now(),
      rejectionReason: reason,
    });
  }

  /**
   * Cancel purchase request
   */
  async cancel(id: string): Promise<PurchaseRequest> {
    const existing = await this.prRepo.findById(id);
    if (!existing) {
      throw new NotFoundException("Purchase request not found");
    }

    if (existing.status === "ORDERED" || existing.status === "CANCELLED") {
      throw new BadRequestException("Cannot cancel this purchase request");
    }

    return this.prRepo.update(id, {
      status: "CANCELLED",
    });
  }

  /**
   * Delete purchase request (only DRAFT)
   */
  async delete(id: string): Promise<void> {
    const existing = await this.prRepo.findById(id);
    if (!existing) {
      throw new NotFoundException("Purchase request not found");
    }

    if (existing.status !== "DRAFT") {
      throw new BadRequestException("Only DRAFT requests can be deleted");
    }

    await this.prRepo.delete(id);
  }

  /**
   * List purchase requests
   */
  async list(options: ListPurchaseRequestsDto = {}): Promise<{
    data: PurchaseRequest[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { limit = 50, offset = 0, ...filters } = options;
    const [data, total] = await Promise.all([
      this.prRepo.list({ limit, offset, ...filters }),
      this.prRepo.count(filters.status),
    ]);

    return { data, total, limit, offset };
  }

  // ============ Item Operations ============

  /**
   * Add item to purchase request
   */
  async addItem(requestId: string, dto: CreatePurchaseRequestItemDto): Promise<PurchaseRequestItem> {
    const request = await this.prRepo.findById(requestId);
    if (!request) {
      throw new NotFoundException("Purchase request not found");
    }

    if (request.status !== "DRAFT") {
      throw new BadRequestException("Cannot add items to non-DRAFT request");
    }

    const item = await this.prRepo.addItem({
      purchaseRequestId: requestId,
      partNumber: dto.partNumber,
      name: dto.name,
      description: dto.description,
      specification: dto.specification,
      quantity: dto.quantity,
      unit: dto.unit || "个",
      estimatedUnitPrice: dto.estimatedUnitPrice,
      estimatedTotal: (dto.estimatedUnitPrice || 0) * dto.quantity,
      preferredSupplierId: dto.preferredSupplierId,
      preferredSupplierName: dto.preferredSupplierName,
      notes: dto.notes,
    });

    // Update estimated total
    await this.updateEstimatedTotal(requestId);

    return item;
  }

  /**
   * Remove item from purchase request
   */
  async removeItem(requestId: string, itemId: string): Promise<void> {
    const request = await this.prRepo.findById(requestId);
    if (!request) {
      throw new NotFoundException("Purchase request not found");
    }

    if (request.status !== "DRAFT") {
      throw new BadRequestException("Cannot remove items from non-DRAFT request");
    }

    await this.prRepo.deleteItem(itemId);

    // Update estimated total
    await this.updateEstimatedTotal(requestId);
  }

  /**
   * Update estimated total based on items
   */
  private async updateEstimatedTotal(requestId: string): Promise<void> {
    const items = await this.prRepo.getItems(requestId);
    const estimatedTotal = items.reduce((sum, item) => sum + (item.estimatedTotal || 0), 0);
    await this.prRepo.update(requestId, { estimatedTotal });
  }
}
