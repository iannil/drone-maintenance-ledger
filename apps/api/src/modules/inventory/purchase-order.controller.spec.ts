/**
 * PurchaseOrderController Unit Tests
 *
 * Tests for purchase order management endpoints
 */

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';

import { PurchaseOrderController } from './purchase-order.controller';
import { PurchaseOrderService } from './purchase-order.service';

describe('PurchaseOrderController', () => {
  let controller: PurchaseOrderController;
  let poService: jest.Mocked<PurchaseOrderService>;

  const mockPurchaseOrder = {
    id: 'po-123',
    orderNumber: 'PO-2026-001',
    supplierId: 'supplier-123',
    purchaseRequestId: 'pr-123',
    status: 'DRAFT' as const,
    totalAmount: 15000,
    expectedDeliveryDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
    deliveryWarehouseId: 'warehouse-123',
    deliveryAddress: '北京市朝阳区xxx路123号',
    paymentTerms: '款到发货',
    notes: '采购备注',
    createdBy: 'user-123',
    approvedBy: null,
    approvedAt: null,
    sentAt: null,
    confirmedAt: null,
    completedAt: null,
    cancelledAt: null,
    isActive: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    items: [
      {
        id: 'poi-123',
        purchaseOrderId: 'po-123',
        partNumber: 'PN-MOT-001',
        partName: '电机',
        quantity: 5,
        unit: '个',
        unitPrice: 1500,
        totalPrice: 7500,
        receivedQuantity: 0,
        notes: null,
      },
    ],
  };

  const mockPurchaseOrderList = [
    mockPurchaseOrder,
    {
      ...mockPurchaseOrder,
      id: 'po-456',
      orderNumber: 'PO-2026-002',
      status: 'APPROVED' as const,
      approvedBy: 'admin-123',
      approvedAt: Date.now(),
    },
  ];

  beforeEach(async () => {
    const mockPoService = {
      findByIdWithDetails: jest.fn(),
      list: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      submitForApproval: jest.fn(),
      approve: jest.fn(),
      sendToSupplier: jest.fn(),
      confirmBySupplier: jest.fn(),
      receiveGoods: jest.fn(),
      complete: jest.fn(),
      cancel: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PurchaseOrderController],
      providers: [{ provide: PurchaseOrderService, useValue: mockPoService }],
    }).compile();

    controller = module.get<PurchaseOrderController>(PurchaseOrderController);
    poService = module.get(PurchaseOrderService);
  });

  // ==================== Get By ID ====================

  describe('GET /purchase-orders/:id', () => {
    it('should return purchase order with details', async () => {
      poService.findByIdWithDetails.mockResolvedValue(mockPurchaseOrder as any);

      const result = await controller.getById('po-123');

      expect(result).toEqual(mockPurchaseOrder);
      expect(poService.findByIdWithDetails).toHaveBeenCalledWith('po-123');
    });

    it('should return null for non-existent order', async () => {
      poService.findByIdWithDetails.mockResolvedValue(null);

      const result = await controller.getById('non-existent');

      expect(result).toBeNull();
    });
  });

  // ==================== List ====================

  describe('GET /purchase-orders', () => {
    it('should return list with default pagination', async () => {
      poService.list.mockResolvedValue(mockPurchaseOrderList as any);

      const result = await controller.list();

      expect(result).toEqual(mockPurchaseOrderList);
      expect(poService.list).toHaveBeenCalledWith({
        limit: 50,
        offset: 0,
        status: undefined,
        supplierId: undefined,
      });
    });

    it('should return list with filters', async () => {
      poService.list.mockResolvedValue([mockPurchaseOrder] as any);

      const result = await controller.list('20', '10', 'DRAFT', 'supplier-123');

      expect(result).toEqual([mockPurchaseOrder]);
      expect(poService.list).toHaveBeenCalledWith({
        limit: 20,
        offset: 10,
        status: 'DRAFT',
        supplierId: 'supplier-123',
      });
    });
  });

  // ==================== Create ====================

  describe('POST /purchase-orders', () => {
    const createDto = {
      title: '采购订单-电机',
      supplierId: 'supplier-123',
      expectedDeliveryDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
      items: [
        {
          partNumber: 'PN-MOT-001',
          name: '电机',
          quantity: 5,
          unitPrice: 1500,
        },
      ],
    };

    it('should create a new purchase order', async () => {
      poService.create.mockResolvedValue(mockPurchaseOrder as any);

      const mockRequest = { user: { id: 'user-123' } } as any;
      const result = await controller.create(createDto, mockRequest);

      expect(result).toEqual(mockPurchaseOrder);
      expect(poService.create).toHaveBeenCalledWith(createDto, 'user-123');
    });
  });

  // ==================== Update ====================

  describe('PUT /purchase-orders/:id', () => {
    const updateDto = {
      expectedDeliveryDate: Date.now() + 14 * 24 * 60 * 60 * 1000,
      notes: '更新备注',
    };

    it('should update purchase order', async () => {
      const updatedOrder = { ...mockPurchaseOrder, ...updateDto };
      poService.update.mockResolvedValue(updatedOrder as any);

      const result = await controller.update('po-123', updateDto);

      expect(result).toEqual(updatedOrder);
      expect(poService.update).toHaveBeenCalledWith('po-123', updateDto);
    });

    it('should throw ConflictException for non-draft order', async () => {
      poService.update.mockRejectedValue(
        new ConflictException('Cannot update non-draft order')
      );

      await expect(controller.update('po-123', updateDto)).rejects.toThrow(ConflictException);
    });
  });

  // ==================== Submit ====================

  describe('POST /purchase-orders/:id/submit', () => {
    it('should submit order for approval', async () => {
      const submittedOrder = { ...mockPurchaseOrder, status: 'PENDING_APPROVAL' as const };
      poService.submitForApproval.mockResolvedValue(submittedOrder as any);

      const result = await controller.submit('po-123');

      expect(result).toEqual(submittedOrder);
      expect(poService.submitForApproval).toHaveBeenCalledWith('po-123');
    });

    it('should throw ConflictException for invalid status', async () => {
      poService.submitForApproval.mockRejectedValue(
        new ConflictException('Cannot submit order in current status')
      );

      await expect(controller.submit('po-123')).rejects.toThrow(ConflictException);
    });
  });

  // ==================== Approve ====================

  describe('POST /purchase-orders/:id/approve', () => {
    it('should approve order', async () => {
      const approvedOrder = {
        ...mockPurchaseOrder,
        status: 'APPROVED' as const,
        approvedBy: 'admin-123',
        approvedAt: Date.now(),
      };
      poService.approve.mockResolvedValue(approvedOrder as any);

      const mockRequest = { user: { id: 'admin-123' } } as any;
      const result = await controller.approve('po-123', mockRequest);

      expect(result).toEqual(approvedOrder);
      expect(poService.approve).toHaveBeenCalledWith('po-123', 'admin-123');
    });
  });

  // ==================== Send ====================

  describe('POST /purchase-orders/:id/send', () => {
    it('should send order to supplier', async () => {
      const sentOrder = { ...mockPurchaseOrder, status: 'SENT' as const, sentAt: Date.now() };
      poService.sendToSupplier.mockResolvedValue(sentOrder as any);

      const result = await controller.sendToSupplier('po-123');

      expect(result).toEqual(sentOrder);
      expect(poService.sendToSupplier).toHaveBeenCalledWith('po-123');
    });
  });

  // ==================== Confirm ====================

  describe('POST /purchase-orders/:id/confirm', () => {
    it('should mark order as confirmed by supplier', async () => {
      const confirmedOrder = {
        ...mockPurchaseOrder,
        status: 'CONFIRMED' as const,
        confirmedAt: Date.now(),
      };
      poService.confirmBySupplier.mockResolvedValue(confirmedOrder as any);

      const result = await controller.confirm('po-123');

      expect(result).toEqual(confirmedOrder);
      expect(poService.confirmBySupplier).toHaveBeenCalledWith('po-123');
    });
  });

  // ==================== Receive Goods ====================

  describe('POST /purchase-orders/:id/receive', () => {
    const receiveDto = {
      items: [
        {
          purchaseOrderItemId: 'poi-123',
          partNumber: 'PN-MOT-001',
          name: '电机',
          receivedQuantity: 3,
          acceptedQuantity: 3,
          batchNumber: 'BATCH-001',
        },
      ],
      notes: '收货备注',
    };

    it('should record goods receipt', async () => {
      const receivedOrder = {
        ...mockPurchaseOrder,
        status: 'PARTIAL_RECEIVED' as const,
      };
      poService.receiveGoods.mockResolvedValue(receivedOrder as any);

      const mockRequest = { user: { id: 'storekeeper-123' } } as any;
      const result = await controller.receiveGoods('po-123', receiveDto, mockRequest);

      expect(result).toEqual(receivedOrder);
      expect(poService.receiveGoods).toHaveBeenCalledWith('po-123', {
        ...receiveDto,
        receivedBy: 'storekeeper-123',
      });
    });
  });

  // ==================== Complete ====================

  describe('POST /purchase-orders/:id/complete', () => {
    it('should complete order', async () => {
      const completedOrder = {
        ...mockPurchaseOrder,
        status: 'COMPLETED' as const,
        completedAt: Date.now(),
      };
      poService.complete.mockResolvedValue(completedOrder as any);

      const result = await controller.complete('po-123');

      expect(result).toEqual(completedOrder);
      expect(poService.complete).toHaveBeenCalledWith('po-123');
    });
  });

  // ==================== Cancel ====================

  describe('POST /purchase-orders/:id/cancel', () => {
    it('should cancel order', async () => {
      const cancelledOrder = {
        ...mockPurchaseOrder,
        status: 'CANCELLED' as const,
        cancelledAt: Date.now(),
      };
      poService.cancel.mockResolvedValue(cancelledOrder as any);

      const result = await controller.cancel('po-123');

      expect(result).toEqual(cancelledOrder);
      expect(poService.cancel).toHaveBeenCalledWith('po-123');
    });

    it('should throw ConflictException for received order', async () => {
      poService.cancel.mockRejectedValue(
        new ConflictException('Cannot cancel order with received goods')
      );

      await expect(controller.cancel('po-123')).rejects.toThrow(ConflictException);
    });
  });

  // ==================== Delete ====================

  describe('DELETE /purchase-orders/:id', () => {
    it('should delete order and return success', async () => {
      poService.delete.mockResolvedValue(undefined);

      const result = await controller.delete('po-123');

      expect(result).toEqual({ success: true });
      expect(poService.delete).toHaveBeenCalledWith('po-123');
    });

    it('should throw NotFoundException for non-existent order', async () => {
      poService.delete.mockRejectedValue(new NotFoundException('Purchase order not found'));

      await expect(controller.delete('non-existent')).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException for non-draft order', async () => {
      poService.delete.mockRejectedValue(
        new ConflictException('Cannot delete non-draft order')
      );

      await expect(controller.delete('po-123')).rejects.toThrow(ConflictException);
    });
  });
});
