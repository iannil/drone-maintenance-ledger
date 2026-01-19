/**
 * PurchaseRequestController Unit Tests
 *
 * Tests for purchase request management endpoints
 */

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';

import { PurchaseRequestController } from './purchase-request.controller';
import { PurchaseRequestService } from './purchase-request.service';

describe('PurchaseRequestController', () => {
  let controller: PurchaseRequestController;
  let prService: jest.Mocked<PurchaseRequestService>;

  const mockPurchaseRequest = {
    id: 'pr-123',
    requestNumber: 'PR-2026-001',
    requesterId: 'user-123',
    title: '维修工单零件采购',
    description: '工单 WO-2026-001 需要更换电机',
    priority: 'MEDIUM' as const,
    status: 'DRAFT' as const,
    requiredDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
    workOrderId: 'wo-123',
    notes: '采购申请备注',
    approvedBy: null,
    approvedAt: null,
    rejectedBy: null,
    rejectedAt: null,
    rejectionReason: null,
    isActive: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    items: [
      {
        id: 'pri-123',
        purchaseRequestId: 'pr-123',
        partNumber: 'PN-MOT-001',
        partName: '电机',
        quantity: 2,
        unit: '个',
        estimatedUnitPrice: 1500,
        notes: null,
      },
    ],
  };

  const mockPurchaseRequestList = [
    mockPurchaseRequest,
    {
      ...mockPurchaseRequest,
      id: 'pr-456',
      requestNumber: 'PR-2026-002',
      priority: 'HIGH' as const,
      status: 'APPROVED' as const,
      approvedBy: 'manager-123',
      approvedAt: Date.now(),
    },
  ];

  beforeEach(async () => {
    const mockPrService = {
      findByIdWithItems: jest.fn(),
      list: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      submit: jest.fn(),
      approve: jest.fn(),
      reject: jest.fn(),
      cancel: jest.fn(),
      delete: jest.fn(),
      addItem: jest.fn(),
      removeItem: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PurchaseRequestController],
      providers: [{ provide: PurchaseRequestService, useValue: mockPrService }],
    }).compile();

    controller = module.get<PurchaseRequestController>(PurchaseRequestController);
    prService = module.get(PurchaseRequestService);
  });

  // ==================== Get By ID ====================

  describe('GET /purchase-requests/:id', () => {
    it('should return purchase request with items', async () => {
      prService.findByIdWithItems.mockResolvedValue(mockPurchaseRequest as any);

      const result = await controller.getById('pr-123');

      expect(result).toEqual(mockPurchaseRequest);
      expect(prService.findByIdWithItems).toHaveBeenCalledWith('pr-123');
    });

    it('should return null for non-existent request', async () => {
      prService.findByIdWithItems.mockResolvedValue(null);

      const result = await controller.getById('non-existent');

      expect(result).toBeNull();
    });
  });

  // ==================== List ====================

  describe('GET /purchase-requests', () => {
    it('should return list with default pagination', async () => {
      prService.list.mockResolvedValue(mockPurchaseRequestList as any);

      const result = await controller.list();

      expect(result).toEqual(mockPurchaseRequestList);
      expect(prService.list).toHaveBeenCalledWith({
        limit: 50,
        offset: 0,
        status: undefined,
        requesterId: undefined,
        priority: undefined,
      });
    });

    it('should return list with filters', async () => {
      prService.list.mockResolvedValue([mockPurchaseRequest] as any);

      const result = await controller.list('20', '10', 'DRAFT', 'user-123', 'MEDIUM');

      expect(result).toEqual([mockPurchaseRequest]);
      expect(prService.list).toHaveBeenCalledWith({
        limit: 20,
        offset: 10,
        status: 'DRAFT',
        requesterId: 'user-123',
        priority: 'MEDIUM',
      });
    });
  });

  // ==================== Create ====================

  describe('POST /purchase-requests', () => {
    const createDto = {
      title: '新采购申请',
      description: '申请描述',
      priority: 'MEDIUM' as const,
    };

    it('should create a new purchase request', async () => {
      const newRequest = { ...mockPurchaseRequest, ...createDto, id: 'pr-new' };
      prService.create.mockResolvedValue(newRequest as any);

      const mockReq = { user: { id: 'user-123' } } as any;
      const result = await controller.create(createDto, mockReq);

      expect(result).toEqual(newRequest);
      expect(prService.create).toHaveBeenCalledWith({
        ...createDto,
        requesterId: 'user-123',
      });
    });
  });

  // ==================== Update ====================

  describe('PUT /purchase-requests/:id', () => {
    const updateDto = {
      title: '更新后的标题',
      priority: 'HIGH' as const,
    };

    it('should update purchase request', async () => {
      const updatedRequest = { ...mockPurchaseRequest, ...updateDto };
      prService.update.mockResolvedValue(updatedRequest as any);

      const result = await controller.update('pr-123', updateDto);

      expect(result).toEqual(updatedRequest);
      expect(prService.update).toHaveBeenCalledWith('pr-123', updateDto);
    });

    it('should throw ConflictException for non-draft request', async () => {
      prService.update.mockRejectedValue(
        new ConflictException('Cannot update non-draft request')
      );

      await expect(controller.update('pr-123', updateDto)).rejects.toThrow(ConflictException);
    });
  });

  // ==================== Submit ====================

  describe('POST /purchase-requests/:id/submit', () => {
    it('should submit request for approval', async () => {
      const submittedRequest = { ...mockPurchaseRequest, status: 'SUBMITTED' as const };
      prService.submit.mockResolvedValue(submittedRequest as any);

      const result = await controller.submit('pr-123');

      expect(result).toEqual(submittedRequest);
      expect(prService.submit).toHaveBeenCalledWith('pr-123');
    });

    it('should throw ConflictException for invalid status', async () => {
      prService.submit.mockRejectedValue(
        new ConflictException('Cannot submit request in current status')
      );

      await expect(controller.submit('pr-123')).rejects.toThrow(ConflictException);
    });
  });

  // ==================== Approve ====================

  describe('POST /purchase-requests/:id/approve', () => {
    it('should approve request', async () => {
      const approvedRequest = {
        ...mockPurchaseRequest,
        status: 'APPROVED' as const,
        approvedBy: 'manager-123',
        approvedAt: Date.now(),
      };
      prService.approve.mockResolvedValue(approvedRequest as any);

      const mockReq = { user: { id: 'manager-123' } } as any;
      const result = await controller.approve('pr-123', mockReq);

      expect(result).toEqual(approvedRequest);
      expect(prService.approve).toHaveBeenCalledWith('pr-123', 'manager-123');
    });
  });

  // ==================== Reject ====================

  describe('POST /purchase-requests/:id/reject', () => {
    it('should reject request with reason', async () => {
      const rejectedRequest = {
        ...mockPurchaseRequest,
        status: 'REJECTED' as const,
        rejectedBy: 'manager-123',
        rejectedAt: Date.now(),
        rejectionReason: '预算超支',
      };
      prService.reject.mockResolvedValue(rejectedRequest as any);

      const mockReq = { user: { id: 'manager-123' } } as any;
      const result = await controller.reject('pr-123', { reason: '预算超支' }, mockReq);

      expect(result).toEqual(rejectedRequest);
      expect(prService.reject).toHaveBeenCalledWith('pr-123', 'manager-123', '预算超支');
    });
  });

  // ==================== Cancel ====================

  describe('POST /purchase-requests/:id/cancel', () => {
    it('should cancel request', async () => {
      const cancelledRequest = { ...mockPurchaseRequest, status: 'CANCELLED' as const };
      prService.cancel.mockResolvedValue(cancelledRequest as any);

      const result = await controller.cancel('pr-123');

      expect(result).toEqual(cancelledRequest);
      expect(prService.cancel).toHaveBeenCalledWith('pr-123');
    });

    it('should throw ConflictException for approved request', async () => {
      prService.cancel.mockRejectedValue(
        new ConflictException('Cannot cancel approved request')
      );

      await expect(controller.cancel('pr-123')).rejects.toThrow(ConflictException);
    });
  });

  // ==================== Delete ====================

  describe('DELETE /purchase-requests/:id', () => {
    it('should delete request and return success', async () => {
      prService.delete.mockResolvedValue(undefined);

      const result = await controller.delete('pr-123');

      expect(result).toEqual({ success: true });
      expect(prService.delete).toHaveBeenCalledWith('pr-123');
    });

    it('should throw ConflictException for non-draft request', async () => {
      prService.delete.mockRejectedValue(
        new ConflictException('Cannot delete non-draft request')
      );

      await expect(controller.delete('pr-123')).rejects.toThrow(ConflictException);
    });
  });

  // ==================== Item Operations ====================

  describe('POST /purchase-requests/:id/items', () => {
    const itemDto = {
      partNumber: 'PN-PROP-001',
      name: '桨叶',
      quantity: 4,
      unit: '对',
    };

    it('should add item to request', async () => {
      const newItem = {
        id: 'pri-new',
        purchaseRequestId: 'pr-123',
        partName: itemDto.name,
        ...itemDto,
        estimatedUnitPrice: null,
        notes: null,
      };
      prService.addItem.mockResolvedValue(newItem as any);

      const result = await controller.addItem('pr-123', itemDto);

      expect(result).toEqual(newItem);
      expect(prService.addItem).toHaveBeenCalledWith('pr-123', itemDto);
    });

    it('should throw ConflictException for non-draft request', async () => {
      prService.addItem.mockRejectedValue(
        new ConflictException('Cannot add item to non-draft request')
      );

      await expect(controller.addItem('pr-123', itemDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('DELETE /purchase-requests/:id/items/:itemId', () => {
    it('should remove item from request', async () => {
      prService.removeItem.mockResolvedValue(undefined);

      const result = await controller.removeItem('pr-123', 'pri-123');

      expect(result).toEqual({ success: true });
      expect(prService.removeItem).toHaveBeenCalledWith('pr-123', 'pri-123');
    });

    it('should throw NotFoundException for non-existent item', async () => {
      prService.removeItem.mockRejectedValue(new NotFoundException('Item not found'));

      await expect(controller.removeItem('pr-123', 'non-existent')).rejects.toThrow(NotFoundException);
    });
  });
});
