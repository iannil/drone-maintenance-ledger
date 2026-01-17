/**
 * Purchase Order Service
 *
 * Business logic for purchase order management
 */

import { Injectable, NotFoundException, BadRequestException, Inject } from "@nestjs/common";

import type { PurchaseOrder, PurchaseOrderItem, PurchaseReceipt } from "@repo/db";
import { PurchaseOrderRepository } from "./repositories/purchase-order.repository";
import { PurchaseRequestRepository } from "./repositories/purchase-request.repository";

/**
 * DTOs for purchase order operations
 */
export interface CreatePurchaseOrderDto {
  title: string;
  supplierId?: string;
  supplierName?: string;
  supplierContact?: string;
  warehouseId?: string;
  deliveryAddress?: string;
  purchaseRequestId?: string;
  expectedDeliveryDate?: number;
  paymentTerms?: string;
  shippingMethod?: string;
  notes?: string;
  termsAndConditions?: string;
  items?: CreatePurchaseOrderItemDto[];
}

export interface CreatePurchaseOrderItemDto {
  partNumber: string;
  name: string;
  description?: string;
  specification?: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
  taxRate?: number;
  notes?: string;
}

export interface UpdatePurchaseOrderDto {
  title?: string;
  supplierId?: string;
  supplierName?: string;
  supplierContact?: string;
  warehouseId?: string;
  deliveryAddress?: string;
  expectedDeliveryDate?: number;
  paymentTerms?: string;
  shippingMethod?: string;
  notes?: string;
  termsAndConditions?: string;
}

export interface ReceiveGoodsDto {
  warehouseId?: string;
  receivedBy?: string;
  inspectedBy?: string;
  inspectionNotes?: string;
  notes?: string;
  items: ReceiveGoodsItemDto[];
}

export interface ReceiveGoodsItemDto {
  purchaseOrderItemId: string;
  partNumber: string;
  name: string;
  receivedQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity?: number;
  unit?: string;
  batchNumber?: string;
  serialNumbers?: string;
  location?: string;
  binNumber?: string;
  qualityStatus?: string;
  rejectionReason?: string;
  notes?: string;
}

export interface ListPurchaseOrdersDto {
  limit?: number;
  offset?: number;
  status?: string;
  supplierId?: string;
}

@Injectable()
export class PurchaseOrderService {
  constructor(
    @Inject(PurchaseOrderRepository)
    private readonly poRepo: PurchaseOrderRepository,
    @Inject(PurchaseRequestRepository)
    private readonly prRepo: PurchaseRequestRepository
  ) {}

  /**
   * Find purchase order by ID
   */
  async findById(id: string): Promise<PurchaseOrder | null> {
    return this.poRepo.findById(id);
  }

  /**
   * Get purchase order with items and receipts
   */
  async findByIdWithDetails(id: string): Promise<{
    order: PurchaseOrder;
    items: PurchaseOrderItem[];
    receipts: PurchaseReceipt[];
  } | null> {
    const order = await this.poRepo.findById(id);
    if (!order) {
      return null;
    }
    const [items, receipts] = await Promise.all([
      this.poRepo.getItems(id),
      this.poRepo.getReceipts(id),
    ]);
    return { order, items, receipts };
  }

  /**
   * Create new purchase order
   */
  async create(dto: CreatePurchaseOrderDto, createdById?: string): Promise<PurchaseOrder> {
    const orderNumber = await this.poRepo.generateOrderNumber();

    // Calculate totals from items
    let subtotal = 0;
    let taxAmount = 0;
    if (dto.items) {
      for (const item of dto.items) {
        const itemTotal = item.unitPrice * item.quantity;
        subtotal += itemTotal;
        if (item.taxRate) {
          taxAmount += itemTotal * (item.taxRate / 10000); // taxRate is percentage * 100
        }
      }
    }

    const order = await this.poRepo.create({
      orderNumber,
      title: dto.title,
      supplierId: dto.supplierId,
      supplierName: dto.supplierName,
      supplierContact: dto.supplierContact,
      warehouseId: dto.warehouseId,
      deliveryAddress: dto.deliveryAddress,
      purchaseRequestId: dto.purchaseRequestId,
      createdBy: createdById,
      expectedDeliveryDate: dto.expectedDeliveryDate,
      paymentTerms: dto.paymentTerms,
      shippingMethod: dto.shippingMethod,
      notes: dto.notes,
      termsAndConditions: dto.termsAndConditions,
      subtotal,
      taxAmount,
      totalAmount: subtotal + taxAmount,
    });

    // Add items
    if (dto.items && dto.items.length > 0) {
      for (const item of dto.items) {
        await this.poRepo.addItem({
          purchaseOrderId: order.id,
          partNumber: item.partNumber,
          name: item.name,
          description: item.description,
          specification: item.specification,
          quantity: item.quantity,
          unit: item.unit || "个",
          unitPrice: item.unitPrice,
          taxRate: item.taxRate || 0,
          totalPrice: item.unitPrice * item.quantity,
          notes: item.notes,
        });
      }
    }

    // Update purchase request status if linked
    if (dto.purchaseRequestId) {
      await this.prRepo.update(dto.purchaseRequestId, { status: "ORDERED" });
    }

    return order;
  }

  /**
   * Update purchase order
   */
  async update(id: string, dto: UpdatePurchaseOrderDto): Promise<PurchaseOrder> {
    const existing = await this.poRepo.findById(id);
    if (!existing) {
      throw new NotFoundException("Purchase order not found");
    }

    if (existing.status !== "DRAFT") {
      throw new BadRequestException("Cannot update purchase order that is not in DRAFT status");
    }

    return this.poRepo.update(id, dto);
  }

  /**
   * Submit for approval
   */
  async submitForApproval(id: string): Promise<PurchaseOrder> {
    const existing = await this.poRepo.findById(id);
    if (!existing) {
      throw new NotFoundException("Purchase order not found");
    }

    if (existing.status !== "DRAFT") {
      throw new BadRequestException("Only DRAFT orders can be submitted");
    }

    const items = await this.poRepo.getItems(id);
    if (items.length === 0) {
      throw new BadRequestException("Cannot submit empty purchase order");
    }

    return this.poRepo.update(id, { status: "PENDING_APPROVAL" });
  }

  /**
   * Approve purchase order
   */
  async approve(id: string, approverId: string): Promise<PurchaseOrder> {
    const existing = await this.poRepo.findById(id);
    if (!existing) {
      throw new NotFoundException("Purchase order not found");
    }

    if (existing.status !== "PENDING_APPROVAL") {
      throw new BadRequestException("Only PENDING_APPROVAL orders can be approved");
    }

    return this.poRepo.update(id, {
      status: "APPROVED",
      approvedBy: approverId,
      approvedAt: Date.now(),
    });
  }

  /**
   * Send to supplier
   */
  async sendToSupplier(id: string): Promise<PurchaseOrder> {
    const existing = await this.poRepo.findById(id);
    if (!existing) {
      throw new NotFoundException("Purchase order not found");
    }

    if (existing.status !== "APPROVED") {
      throw new BadRequestException("Only APPROVED orders can be sent");
    }

    return this.poRepo.update(id, {
      status: "SENT",
      orderDate: Date.now(),
    });
  }

  /**
   * Mark as confirmed by supplier
   */
  async confirmBySupplier(id: string): Promise<PurchaseOrder> {
    const existing = await this.poRepo.findById(id);
    if (!existing) {
      throw new NotFoundException("Purchase order not found");
    }

    if (existing.status !== "SENT") {
      throw new BadRequestException("Only SENT orders can be confirmed");
    }

    return this.poRepo.update(id, { status: "CONFIRMED" });
  }

  /**
   * Receive goods
   */
  async receiveGoods(id: string, dto: ReceiveGoodsDto): Promise<PurchaseReceipt> {
    const order = await this.poRepo.findById(id);
    if (!order) {
      throw new NotFoundException("Purchase order not found");
    }

    if (!["CONFIRMED", "PARTIAL_RECEIVED"].includes(order.status)) {
      throw new BadRequestException("Cannot receive goods for this order status");
    }

    const receiptNumber = await this.poRepo.generateReceiptNumber();

    const receipt = await this.poRepo.createReceipt({
      receiptNumber,
      purchaseOrderId: id,
      warehouseId: dto.warehouseId || order.warehouseId,
      receivedBy: dto.receivedBy,
      receivedAt: Date.now(),
      inspectedBy: dto.inspectedBy,
      inspectedAt: dto.inspectedBy ? Date.now() : undefined,
      inspectionNotes: dto.inspectionNotes,
      notes: dto.notes,
    });

    // Add receipt items and update PO item quantities
    for (const item of dto.items) {
      await this.poRepo.addReceiptItem({
        purchaseReceiptId: receipt.id,
        purchaseOrderItemId: item.purchaseOrderItemId,
        partNumber: item.partNumber,
        name: item.name,
        receivedQuantity: item.receivedQuantity,
        acceptedQuantity: item.acceptedQuantity,
        rejectedQuantity: item.rejectedQuantity || 0,
        unit: item.unit || "个",
        batchNumber: item.batchNumber,
        serialNumbers: item.serialNumbers,
        location: item.location,
        binNumber: item.binNumber,
        qualityStatus: item.qualityStatus || "PASSED",
        rejectionReason: item.rejectionReason,
        notes: item.notes,
      });

      // Update PO item received quantity
      const poItems = await this.poRepo.getItems(id);
      const poItem = poItems.find(i => i.id === item.purchaseOrderItemId);
      if (poItem) {
        await this.poRepo.updateItem(item.purchaseOrderItemId, {
          receivedQuantity: (poItem.receivedQuantity || 0) + item.acceptedQuantity,
        });
      }
    }

    // Check if all items are fully received
    const items = await this.poRepo.getItems(id);
    const allReceived = items.every(item => (item.receivedQuantity || 0) >= item.quantity);

    await this.poRepo.update(id, {
      status: allReceived ? "RECEIVED" : "PARTIAL_RECEIVED",
      actualDeliveryDate: allReceived ? Date.now() : undefined,
    });

    return receipt;
  }

  /**
   * Complete purchase order
   */
  async complete(id: string): Promise<PurchaseOrder> {
    const existing = await this.poRepo.findById(id);
    if (!existing) {
      throw new NotFoundException("Purchase order not found");
    }

    if (existing.status !== "RECEIVED") {
      throw new BadRequestException("Only RECEIVED orders can be completed");
    }

    return this.poRepo.update(id, { status: "COMPLETED" });
  }

  /**
   * Cancel purchase order
   */
  async cancel(id: string): Promise<PurchaseOrder> {
    const existing = await this.poRepo.findById(id);
    if (!existing) {
      throw new NotFoundException("Purchase order not found");
    }

    const nonCancellableStatuses = ["PARTIAL_RECEIVED", "RECEIVED", "COMPLETED", "CANCELLED"];
    if (nonCancellableStatuses.includes(existing.status)) {
      throw new BadRequestException("Cannot cancel this purchase order");
    }

    return this.poRepo.update(id, { status: "CANCELLED" });
  }

  /**
   * Delete purchase order (only DRAFT)
   */
  async delete(id: string): Promise<void> {
    const existing = await this.poRepo.findById(id);
    if (!existing) {
      throw new NotFoundException("Purchase order not found");
    }

    if (existing.status !== "DRAFT") {
      throw new BadRequestException("Only DRAFT orders can be deleted");
    }

    await this.poRepo.delete(id);
  }

  /**
   * List purchase orders
   */
  async list(options: ListPurchaseOrdersDto = {}): Promise<{
    data: PurchaseOrder[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { limit = 50, offset = 0, ...filters } = options;
    const [data, total] = await Promise.all([
      this.poRepo.list({ limit, offset, ...filters }),
      this.poRepo.count(filters.status),
    ]);

    return { data, total, limit, offset };
  }
}
