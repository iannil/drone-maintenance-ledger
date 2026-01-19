/**
 * PurchaseOrderService Unit Tests
 *
 * Tests for purchase order business logic
 */

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';

import {
  PurchaseOrderService,
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderDto,
  ReceiveGoodsDto,
} from './purchase-order.service';
import { PurchaseOrderRepository } from './repositories/purchase-order.repository';
import { PurchaseRequestRepository } from './repositories/purchase-request.repository';
import type { PurchaseOrder, PurchaseReceipt } from '@repo/db';

describe('PurchaseOrderService', () => {
  let service: PurchaseOrderService;
  let poRepo: jest.Mocked<PurchaseOrderRepository>;
  let prRepo: jest.Mocked<PurchaseRequestRepository>;

  const mockPurchaseOrder: PurchaseOrder = {
    id: 'po-123',
    orderNumber: 'PO-2026-001',
    title: '采购电机配件',
    status: 'DRAFT' as const,
    supplierId: 'supplier-123',
    supplierName: '大疆科技',
    supplierContact: '张三',
    warehouseId: 'warehouse-123',
    deliveryAddress: '北京市朝阳区xxx',
    purchaseRequestId: 'pr-123',
    createdBy: 'user-123',
    approvedBy: null,
    approvedAt: null,
    orderDate: null,
    expectedDeliveryDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
    actualDeliveryDate: null,
    subtotal: 100000,
    taxAmount: 13000,
    shippingCost: 0,
    discount: 0,
    totalAmount: 113000,
    currency: 'CNY',
    paymentTerms: '月结30天',
    paymentStatus: 'UNPAID',
    shippingMethod: '快递',
    trackingNumber: null,
    notes: null,
    termsAndConditions: null,
    internalNotes: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const mockPurchaseReceipt: PurchaseReceipt = {
    id: 'receipt-123',
    receiptNumber: 'GR-2026-001',
    purchaseOrderId: 'po-123',
    receivedBy: 'user-123',
    receivedAt: Date.now(),
    warehouseId: 'warehouse-123',
    inspectedBy: 'inspector-123',
    inspectedAt: Date.now(),
    inspectionNotes: null,
    isInspectionPassed: true,
    notes: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  beforeEach(async () => {
    const mockPORepository = {
      findById: jest.fn(),
      findByIdWithDetails: jest.fn(),
      generateOrderNumber: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      list: jest.fn(),
      count: jest.fn(),
      getItems: jest.fn(),
      addItem: jest.fn(),
      updateItem: jest.fn(),
      getReceipts: jest.fn(),
      generateReceiptNumber: jest.fn(),
      createReceipt: jest.fn(),
      addReceiptItem: jest.fn(),
    };

    const mockPRRepository = {
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchaseOrderService,
        { provide: PurchaseOrderRepository, useValue: mockPORepository },
        { provide: PurchaseRequestRepository, useValue: mockPRRepository },
      ],
    }).compile();

    service = module.get<PurchaseOrderService>(PurchaseOrderService);
    poRepo = module.get(PurchaseOrderRepository);
    prRepo = module.get(PurchaseRequestRepository);
  });

  // ==================== Find By ID ====================

  describe('findById', () => {
    it('should return purchase order when found', async () => {
      poRepo.findById.mockResolvedValue(mockPurchaseOrder);

      const result = await service.findById('po-123');

      expect(result).toEqual(mockPurchaseOrder);
      expect(poRepo.findById).toHaveBeenCalledWith('po-123');
    });

    it('should return null when not found', async () => {
      poRepo.findById.mockResolvedValue(null);

      const result = await service.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  // ==================== Find By ID With Details ====================

  describe('findByIdWithDetails', () => {
    it('should return order with items and receipts when found', async () => {
      const mockItems = [{ id: 'poi-123', partNumber: 'PN-001' }] as any;
      const mockReceipts = [mockPurchaseReceipt] as any;
      poRepo.findById.mockResolvedValue(mockPurchaseOrder);
      poRepo.getItems.mockResolvedValue(mockItems);
      poRepo.getReceipts.mockResolvedValue(mockReceipts);

      const result = await service.findByIdWithDetails('po-123');

      expect(result).toEqual({
        order: mockPurchaseOrder,
        items: mockItems,
        receipts: mockReceipts,
      });
    });

    it('should return null when order not found', async () => {
      poRepo.findById.mockResolvedValue(null);

      const result = await service.findByIdWithDetails('non-existent');

      expect(result).toBeNull();
    });
  });

  // ==================== Create ====================

  describe('create', () => {
    const createDto: CreatePurchaseOrderDto = {
      title: '新采购订单',
      supplierId: 'supplier-123',
      items: [
        {
          partNumber: 'PN-001',
          name: '零件1',
          quantity: 5,
          unitPrice: 10000,
        },
      ],
    };

    it('should create purchase order with items', async () => {
      poRepo.generateOrderNumber.mockResolvedValue('PO-2026-002');
      poRepo.create.mockResolvedValue({
        ...mockPurchaseOrder,
        id: 'po-new',
        orderNumber: 'PO-2026-002',
        subtotal: 50000,
        totalAmount: 50000,
      } as any);
      poRepo.addItem.mockResolvedValue(undefined as any);

      const result = await service.create(createDto, 'user-123');

      expect(result).toBeDefined();
      expect(poRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          orderNumber: 'PO-2026-002',
          title: '新采购订单',
          subtotal: 50000,
          totalAmount: 50000,
          createdBy: 'user-123',
        })
      );
    });

    it('should create purchase order without items', async () => {
      poRepo.generateOrderNumber.mockResolvedValue('PO-2026-002');
      const dtoWithoutItems = { ...createDto, items: undefined };
      poRepo.create.mockResolvedValue({
        ...mockPurchaseOrder,
        subtotal: 0,
        totalAmount: 0,
      } as any);

      await service.create(dtoWithoutItems, 'user-123');

      expect(poRepo.addItem).not.toHaveBeenCalled();
    });

    it('should update purchase request status when linked', async () => {
      poRepo.generateOrderNumber.mockResolvedValue('PO-2026-002');
      poRepo.create.mockResolvedValue(mockPurchaseOrder as any);
      poRepo.addItem.mockResolvedValue(undefined as any);
      const dtoWithPR = { ...createDto, purchaseRequestId: 'pr-123' };

      await service.create(dtoWithPR, 'user-123');

      expect(prRepo.update).toHaveBeenCalledWith('pr-123', { status: 'ORDERED' });
    });

    it('should calculate tax amount from items with tax rate', async () => {
      const createDtoWithTax = {
        ...createDto,
        items: [
          {
            partNumber: 'PN-001',
            name: '零件1',
            quantity: 5,
            unitPrice: 10000,
            taxRate: 1300, // 13%
          },
        ],
      };
      poRepo.generateOrderNumber.mockResolvedValue('PO-2026-002');
      poRepo.create.mockResolvedValue({
        ...mockPurchaseOrder,
        subtotal: 50000,
        taxAmount: 6500,
        totalAmount: 56500,
      } as any);
      poRepo.addItem.mockResolvedValue(undefined as any);

      await service.create(createDtoWithTax, 'user-123');

      expect(poRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          taxAmount: 6500,
          totalAmount: 56500,
        })
      );
    });
  });

  // ==================== Update ====================

  describe('update', () => {
    const updateDto: UpdatePurchaseOrderDto = {
      title: '更新后的标题',
      supplierId: 'supplier-456',
    };

    it('should update draft order', async () => {
      poRepo.findById.mockResolvedValue(mockPurchaseOrder);
      const updatedOrder = { ...mockPurchaseOrder, ...updateDto };
      poRepo.update.mockResolvedValue(updatedOrder as any);

      const result = await service.update('po-123', updateDto);

      expect(result).toEqual(updatedOrder);
      expect(poRepo.update).toHaveBeenCalledWith('po-123', updateDto);
    });

    it('should throw NotFoundException when order does not exist', async () => {
      poRepo.findById.mockResolvedValue(null);

      await expect(service.update('non-existent', updateDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when not in DRAFT status', async () => {
      const sentOrder = { ...mockPurchaseOrder, status: 'SENT' as const };
      poRepo.findById.mockResolvedValue(sentOrder as any);

      await expect(service.update('po-123', updateDto)).rejects.toThrow(BadRequestException);
      await expect(service.update('po-123', updateDto)).rejects.toThrow('Cannot update purchase order that is not in DRAFT status');
    });
  });

  // ==================== Submit For Approval ====================

  describe('submitForApproval', () => {
    it('should submit draft order with items', async () => {
      poRepo.findById.mockResolvedValue(mockPurchaseOrder);
      poRepo.getItems.mockResolvedValue([{ id: 'poi-123' } as any]);
      const submittedOrder = { ...mockPurchaseOrder, status: 'PENDING_APPROVAL' as const };
      poRepo.update.mockResolvedValue(submittedOrder as any);

      const result = await service.submitForApproval('po-123');

      expect(result.status).toBe('PENDING_APPROVAL');
      expect(poRepo.update).toHaveBeenCalledWith('po-123', { status: 'PENDING_APPROVAL' });
    });

    it('should throw BadRequestException when order has no items', async () => {
      poRepo.findById.mockResolvedValue(mockPurchaseOrder);
      poRepo.getItems.mockResolvedValue([]);

      await expect(service.submitForApproval('po-123')).rejects.toThrow(BadRequestException);
      await expect(service.submitForApproval('po-123')).rejects.toThrow('Cannot submit empty purchase order');
    });

    it('should throw BadRequestException when not in DRAFT status', async () => {
      const submittedOrder = { ...mockPurchaseOrder, status: 'PENDING_APPROVAL' as const };
      poRepo.findById.mockResolvedValue(submittedOrder as any);

      await expect(service.submitForApproval('po-123')).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when order does not exist', async () => {
      poRepo.findById.mockResolvedValue(null);

      await expect(service.submitForApproval('non-existent')).rejects.toThrow(NotFoundException);
      await expect(service.submitForApproval('non-existent')).rejects.toThrow('Purchase order not found');
    });
  });

  // ==================== Approve ====================

  describe('approve', () => {
    it('should approve pending order', async () => {
      const pendingOrder = { ...mockPurchaseOrder, status: 'PENDING_APPROVAL' as const };
      poRepo.findById.mockResolvedValue(pendingOrder as any);
      const approvedOrder = { ...pendingOrder, status: 'APPROVED' as const };
      poRepo.update.mockResolvedValue(approvedOrder as any);

      const result = await service.approve('po-123', 'manager-123');

      expect(result.status).toBe('APPROVED');
      expect(poRepo.update).toHaveBeenCalledWith('po-123', {
        status: 'APPROVED',
        approvedBy: 'manager-123',
        approvedAt: expect.any(Number),
      });
    });

    it('should throw BadRequestException when not in PENDING_APPROVAL status', async () => {
      poRepo.findById.mockResolvedValue(mockPurchaseOrder);

      await expect(service.approve('po-123', 'manager-123')).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when order does not exist', async () => {
      poRepo.findById.mockResolvedValue(null);

      await expect(service.approve('non-existent', 'manager-123')).rejects.toThrow(NotFoundException);
      await expect(service.approve('non-existent', 'manager-123')).rejects.toThrow('Purchase order not found');
    });
  });

  // ==================== Send To Supplier ====================

  describe('sendToSupplier', () => {
    it('should send approved order to supplier', async () => {
      const approvedOrder = { ...mockPurchaseOrder, status: 'APPROVED' as const };
      poRepo.findById.mockResolvedValue(approvedOrder as any);
      const sentOrder = { ...approvedOrder, status: 'SENT' as const };
      poRepo.update.mockResolvedValue(sentOrder as any);

      const result = await service.sendToSupplier('po-123');

      expect(result.status).toBe('SENT');
      expect(poRepo.update).toHaveBeenCalledWith('po-123', {
        status: 'SENT',
        orderDate: expect.any(Number),
      });
    });

    it('should throw BadRequestException when not APPROVED', async () => {
      poRepo.findById.mockResolvedValue(mockPurchaseOrder);

      await expect(service.sendToSupplier('po-123')).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when order does not exist', async () => {
      poRepo.findById.mockResolvedValue(null);

      await expect(service.sendToSupplier('non-existent')).rejects.toThrow(NotFoundException);
      await expect(service.sendToSupplier('non-existent')).rejects.toThrow('Purchase order not found');
    });
  });

  // ==================== Confirm By Supplier ====================

  describe('confirmBySupplier', () => {
    it('should confirm sent order', async () => {
      const sentOrder = { ...mockPurchaseOrder, status: 'SENT' as const };
      poRepo.findById.mockResolvedValue(sentOrder as any);
      const confirmedOrder = { ...sentOrder, status: 'CONFIRMED' as const };
      poRepo.update.mockResolvedValue(confirmedOrder as any);

      const result = await service.confirmBySupplier('po-123');

      expect(result.status).toBe('CONFIRMED');
      expect(poRepo.update).toHaveBeenCalledWith('po-123', { status: 'CONFIRMED' });
    });

    it('should throw BadRequestException when not SENT', async () => {
      poRepo.findById.mockResolvedValue(mockPurchaseOrder);

      await expect(service.confirmBySupplier('po-123')).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when order does not exist', async () => {
      poRepo.findById.mockResolvedValue(null);

      await expect(service.confirmBySupplier('non-existent')).rejects.toThrow(NotFoundException);
      await expect(service.confirmBySupplier('non-existent')).rejects.toThrow('Purchase order not found');
    });
  });

  // ==================== Receive Goods ====================

  describe('receiveGoods', () => {
    const receiveDto: ReceiveGoodsDto = {
      warehouseId: 'warehouse-123',
      receivedBy: 'user-123',
      inspectedBy: 'inspector-123',
      items: [
        {
          purchaseOrderItemId: 'poi-123',
          partNumber: 'PN-001',
          name: '零件1',
          receivedQuantity: 5,
          acceptedQuantity: 5,
        },
      ],
    };

    it('should receive goods for confirmed order', async () => {
      const confirmedOrder = { ...mockPurchaseOrder, status: 'CONFIRMED' as const };
      poRepo.findById.mockResolvedValue(confirmedOrder as any);
      poRepo.generateReceiptNumber.mockResolvedValue('GR-2026-001');
      poRepo.createReceipt.mockResolvedValue(mockPurchaseReceipt as any);
      poRepo.addReceiptItem.mockResolvedValue(undefined as any);
      poRepo.getItems.mockResolvedValue([
        { id: 'poi-123', quantity: 5, receivedQuantity: 0 } as any,
      ]);
      poRepo.updateItem.mockResolvedValue(undefined as any);

      const result = await service.receiveGoods('po-123', receiveDto);

      expect(result.receiptNumber).toBe('GR-2026-001');
      expect(poRepo.createReceipt).toHaveBeenCalled();
    });

    it('should use order warehouseId when not provided in dto', async () => {
      const confirmedOrder = { ...mockPurchaseOrder, status: 'CONFIRMED' as const };
      poRepo.findById.mockResolvedValue(confirmedOrder as any);
      poRepo.generateReceiptNumber.mockResolvedValue('GR-2026-001');
      poRepo.createReceipt.mockResolvedValue(mockPurchaseReceipt as any);
      poRepo.addReceiptItem.mockResolvedValue(undefined as any);
      poRepo.getItems.mockResolvedValue([
        { id: 'poi-123', quantity: 5, receivedQuantity: 0 } as any,
      ]);
      poRepo.updateItem.mockResolvedValue(undefined as any);

      // Provide dto without warehouseId
      const dtoWithoutWarehouse = { ...receiveDto, warehouseId: undefined as unknown as string };
      await service.receiveGoods('po-123', dtoWithoutWarehouse);

      expect(poRepo.createReceipt).toHaveBeenCalledWith(
        expect.objectContaining({
          warehouseId: confirmedOrder.warehouseId,
        })
      );
    });

    it('should not set inspectedAt when inspectedBy is not provided', async () => {
      const confirmedOrder = { ...mockPurchaseOrder, status: 'CONFIRMED' as const };
      poRepo.findById.mockResolvedValue(confirmedOrder as any);
      poRepo.generateReceiptNumber.mockResolvedValue('GR-2026-001');
      poRepo.createReceipt.mockResolvedValue(mockPurchaseReceipt as any);
      poRepo.addReceiptItem.mockResolvedValue(undefined as any);
      poRepo.getItems.mockResolvedValue([
        { id: 'poi-123', quantity: 5, receivedQuantity: 0 } as any,
      ]);
      poRepo.updateItem.mockResolvedValue(undefined as any);

      // Provide dto without inspectedBy
      const dtoWithoutInspector = { ...receiveDto, inspectedBy: undefined };
      await service.receiveGoods('po-123', dtoWithoutInspector);

      expect(poRepo.createReceipt).toHaveBeenCalledWith(
        expect.objectContaining({
          inspectedAt: undefined,
        })
      );
    });

    it('should set status to RECEIVED when all items are fully received', async () => {
      const confirmedOrder = { ...mockPurchaseOrder, status: 'CONFIRMED' as const };
      poRepo.findById.mockResolvedValue(confirmedOrder as any);
      poRepo.generateReceiptNumber.mockResolvedValue('GR-2026-001');
      poRepo.createReceipt.mockResolvedValue(mockPurchaseReceipt as any);
      poRepo.addReceiptItem.mockResolvedValue(undefined as any);
      poRepo.getItems.mockResolvedValue([
        { id: 'poi-123', quantity: 5, receivedQuantity: 5 } as any, // Fully received
      ]);
      poRepo.updateItem.mockResolvedValue(undefined as any);

      await service.receiveGoods('po-123', receiveDto);

      expect(poRepo.update).toHaveBeenCalledWith('po-123',
        expect.objectContaining({
          status: 'RECEIVED',
        })
      );
    });

    it('should set status to PARTIAL_RECEIVED when not all items are received', async () => {
      const confirmedOrder = { ...mockPurchaseOrder, status: 'CONFIRMED' as const };
      poRepo.findById.mockResolvedValue(confirmedOrder as any);
      poRepo.generateReceiptNumber.mockResolvedValue('GR-2026-001');
      poRepo.createReceipt.mockResolvedValue(mockPurchaseReceipt as any);
      poRepo.addReceiptItem.mockResolvedValue(undefined as any);
      poRepo.getItems.mockResolvedValue([
        { id: 'poi-123', quantity: 10, receivedQuantity: 5 } as any, // Only 5 of 10 received
      ]);
      poRepo.updateItem.mockResolvedValue(undefined as any);

      await service.receiveGoods('po-123', receiveDto);

      expect(poRepo.update).toHaveBeenCalledWith('po-123',
        expect.objectContaining({
          status: 'PARTIAL_RECEIVED',
        })
      );
    });

    it('should throw BadRequestException for invalid status', async () => {
      poRepo.findById.mockResolvedValue(mockPurchaseOrder);

      await expect(service.receiveGoods('po-123', receiveDto)).rejects.toThrow(BadRequestException);
      await expect(service.receiveGoods('po-123', receiveDto)).rejects.toThrow('Cannot receive goods for this order status');
    });

    it('should throw NotFoundException when order does not exist', async () => {
      poRepo.findById.mockResolvedValue(null);

      await expect(service.receiveGoods('non-existent', receiveDto)).rejects.toThrow(NotFoundException);
      await expect(service.receiveGoods('non-existent', receiveDto)).rejects.toThrow('Purchase order not found');
    });
  });

  // ==================== Complete ====================

  describe('complete', () => {
    it('should complete received order', async () => {
      const receivedOrder = { ...mockPurchaseOrder, status: 'RECEIVED' as const };
      poRepo.findById.mockResolvedValue(receivedOrder as any);
      const completedOrder = { ...receivedOrder, status: 'COMPLETED' as const };
      poRepo.update.mockResolvedValue(completedOrder as any);

      const result = await service.complete('po-123');

      expect(result.status).toBe('COMPLETED');
    });

    it('should throw BadRequestException when not RECEIVED', async () => {
      poRepo.findById.mockResolvedValue(mockPurchaseOrder);

      await expect(service.complete('po-123')).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when order does not exist', async () => {
      poRepo.findById.mockResolvedValue(null);

      await expect(service.complete('non-existent')).rejects.toThrow(NotFoundException);
      await expect(service.complete('non-existent')).rejects.toThrow('Purchase order not found');
    });
  });

  // ==================== Cancel ====================

  describe('cancel', () => {
    it('should cancel draft order', async () => {
      poRepo.findById.mockResolvedValue(mockPurchaseOrder);
      const cancelledOrder = { ...mockPurchaseOrder, status: 'CANCELLED' as const };
      poRepo.update.mockResolvedValue(cancelledOrder as any);

      const result = await service.cancel('po-123');

      expect(result.status).toBe('CANCELLED');
    });

    it('should throw BadRequestException for non-cancellable status', async () => {
      const receivedOrder = { ...mockPurchaseOrder, status: 'RECEIVED' as const };
      poRepo.findById.mockResolvedValue(receivedOrder as any);

      await expect(service.cancel('po-123')).rejects.toThrow(BadRequestException);
      await expect(service.cancel('po-123')).rejects.toThrow('Cannot cancel this purchase order');
    });

    it('should throw NotFoundException when order does not exist', async () => {
      poRepo.findById.mockResolvedValue(null);

      await expect(service.cancel('non-existent')).rejects.toThrow(NotFoundException);
      await expect(service.cancel('non-existent')).rejects.toThrow('Purchase order not found');
    });
  });

  // ==================== Delete ====================

  describe('delete', () => {
    it('should delete draft order', async () => {
      poRepo.findById.mockResolvedValue(mockPurchaseOrder);
      poRepo.delete.mockResolvedValue(undefined);

      await service.delete('po-123');

      expect(poRepo.delete).toHaveBeenCalledWith('po-123');
    });

    it('should throw NotFoundException when order does not exist', async () => {
      poRepo.findById.mockResolvedValue(null);

      await expect(service.delete('non-existent')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when not in DRAFT status', async () => {
      const approvedOrder = { ...mockPurchaseOrder, status: 'APPROVED' as const };
      poRepo.findById.mockResolvedValue(approvedOrder as any);

      await expect(service.delete('po-123')).rejects.toThrow(BadRequestException);
    });
  });

  // ==================== List ====================

  describe('list', () => {
    it('should return paginated list with default options', async () => {
      const orders = [mockPurchaseOrder];
      poRepo.list.mockResolvedValue(orders as any);
      poRepo.count.mockResolvedValue(1);

      const result = await service.list();

      expect(result).toEqual({
        data: orders,
        total: 1,
        limit: 50,
        offset: 0,
      });
    });

    it('should return paginated list with filters', async () => {
      const orders = [mockPurchaseOrder];
      poRepo.list.mockResolvedValue(orders as any);
      poRepo.count.mockResolvedValue(1);

      const result = await service.list({
        limit: 10,
        offset: 5,
        status: 'DRAFT',
        supplierId: 'supplier-123',
      });

      expect(result.limit).toBe(10);
      expect(poRepo.list).toHaveBeenCalledWith({
        limit: 10,
        offset: 5,
        status: 'DRAFT',
        supplierId: 'supplier-123',
      });
    });
  });
});
