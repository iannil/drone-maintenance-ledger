/**
 * PurchaseRequestService Unit Tests
 *
 * Tests for purchase request business logic
 */

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';

import {
  PurchaseRequestService,
  CreatePurchaseRequestDto,
  UpdatePurchaseRequestDto,
  CreatePurchaseRequestItemDto,
} from './purchase-request.service';
import { PurchaseRequestRepository } from './repositories/purchase-request.repository';
import type { PurchaseRequest, PurchaseRequestItem } from '@repo/db';

describe('PurchaseRequestService', () => {
  let service: PurchaseRequestService;
  let repository: jest.Mocked<PurchaseRequestRepository>;

  const mockPurchaseRequest: PurchaseRequest = {
    id: 'pr-123',
    requestNumber: 'PR-2026-001',
    title: '采购电机配件',
    description: '用于 M350 定检',
    status: 'DRAFT' as const,
    priority: 'NORMAL' as const,
    requesterId: 'user-123',
    department: '维修部',
    requiredDate: null,
    submittedAt: null,
    approvedBy: null,
    approvedAt: null,
    rejectedBy: null,
    rejectedAt: null,
    rejectionReason: null,
    estimatedTotal: 500000,
    budgetCode: 'BUD-001',
    referenceType: null,
    referenceId: null,
    referenceNumber: null,
    notes: null,
    internalNotes: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const mockPurchaseRequestItem: PurchaseRequestItem = {
    id: 'pri-123',
    purchaseRequestId: 'pr-123',
    partNumber: 'PN-MOT-001',
    name: '电机组件',
    description: 'DJI M350 左前电机',
    specification: '350 RTK',
    quantity: 2,
    unit: '个',
    estimatedUnitPrice: 250000,
    estimatedTotal: 500000,
    preferredSupplierId: 'supplier-123',
    preferredSupplierName: '大疆科技',
    notes: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  beforeEach(async () => {
    const mockPurchaseRequestRepository = {
      findById: jest.fn(),
      findByIdWithItems: jest.fn(),
      generateRequestNumber: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      list: jest.fn(),
      count: jest.fn(),
      getItems: jest.fn(),
      addItem: jest.fn(),
      deleteItem: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchaseRequestService,
        { provide: PurchaseRequestRepository, useValue: mockPurchaseRequestRepository },
      ],
    }).compile();

    service = module.get<PurchaseRequestService>(PurchaseRequestService);
    repository = module.get(PurchaseRequestRepository);
  });

  // ==================== Find By ID ====================

  describe('findById', () => {
    it('should return purchase request when found', async () => {
      repository.findById.mockResolvedValue(mockPurchaseRequest);

      const result = await service.findById('pr-123');

      expect(result).toEqual(mockPurchaseRequest);
      expect(repository.findById).toHaveBeenCalledWith('pr-123');
    });

    it('should return null when not found', async () => {
      repository.findById.mockResolvedValue(null);

      const result = await service.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  // ==================== Find By ID With Items ====================

  describe('findByIdWithItems', () => {
    it('should return request with items when found', async () => {
      repository.findById.mockResolvedValue(mockPurchaseRequest);
      repository.getItems.mockResolvedValue([mockPurchaseRequestItem]);

      const result = await service.findByIdWithItems('pr-123');

      expect(result).toEqual({
        request: mockPurchaseRequest,
        items: [mockPurchaseRequestItem],
      });
    });

    it('should return null when request not found', async () => {
      repository.findById.mockResolvedValue(null);

      const result = await service.findByIdWithItems('non-existent');

      expect(result).toBeNull();
    });
  });

  // ==================== Create ====================

  describe('create', () => {
    const createDto: CreatePurchaseRequestDto = {
      title: '新采购请求',
      description: '测试采购',
      priority: 'HIGH' as const,
      requesterId: 'user-123',
      items: [
        {
          partNumber: 'PN-001',
          name: '测试零件',
          quantity: 5,
          estimatedUnitPrice: 10000,
        },
      ],
    };

    it('should create purchase request with items', async () => {
      repository.generateRequestNumber.mockResolvedValue('PR-2026-002');
      repository.create.mockResolvedValue({
        ...mockPurchaseRequest,
        id: 'pr-new',
        requestNumber: 'PR-2026-002',
        estimatedTotal: 50000,
      } as any);
      repository.addItem.mockResolvedValue(mockPurchaseRequestItem as any);

      const result = await service.create(createDto);

      expect(result).toBeDefined();
      expect(repository.generateRequestNumber).toHaveBeenCalled();
      expect(repository.create).toHaveBeenCalledWith({
        requestNumber: 'PR-2026-002',
        title: '新采购请求',
        description: '测试采购',
        priority: 'HIGH',
        requesterId: 'user-123',
        estimatedTotal: 50000,
      });
      expect(repository.addItem).toHaveBeenCalled();
    });

    it('should create purchase request without items', async () => {
      repository.generateRequestNumber.mockResolvedValue('PR-2026-002');
      const dtoWithoutItems: CreatePurchaseRequestDto = {
        ...createDto,
        items: undefined,
      };
      repository.create.mockResolvedValue({
        ...mockPurchaseRequest,
        id: 'pr-new',
        estimatedTotal: 0,
      } as any);

      const result = await service.create(dtoWithoutItems);

      expect(result.estimatedTotal).toBe(0);
    });

    it('should use default priority when not provided', async () => {
      repository.generateRequestNumber.mockResolvedValue('PR-2026-002');
      const dtoWithoutPriority = { ...createDto, priority: undefined, items: undefined };
      repository.create.mockResolvedValue(mockPurchaseRequest as any);

      await service.create(dtoWithoutPriority);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ priority: 'NORMAL' })
      );
    });

    it('should calculate estimated total from items', async () => {
      repository.generateRequestNumber.mockResolvedValue('PR-2026-002');
      repository.create.mockResolvedValue({
        ...mockPurchaseRequest,
        estimatedTotal: 150000,
      } as any);
      repository.addItem.mockResolvedValue(mockPurchaseRequestItem as any);

      const result = await service.create(createDto);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ estimatedTotal: 50000 })
      );
    });
  });

  // ==================== Update ====================

  describe('update', () => {
    const updateDto: UpdatePurchaseRequestDto = {
      title: '更新后的标题',
      priority: 'URGENT' as const,
    };

    it('should update draft request', async () => {
      repository.findById.mockResolvedValue(mockPurchaseRequest);
      const updatedRequest = { ...mockPurchaseRequest, ...updateDto };
      repository.update.mockResolvedValue(updatedRequest as any);

      const result = await service.update('pr-123', updateDto);

      expect(result).toEqual(updatedRequest);
      expect(repository.update).toHaveBeenCalledWith('pr-123', updateDto);
    });

    it('should throw NotFoundException when request does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.update('non-existent', updateDto)).rejects.toThrow(NotFoundException);
      await expect(service.update('non-existent', updateDto)).rejects.toThrow('Purchase request not found');
    });

    it('should throw BadRequestException when not in DRAFT status', async () => {
      const submittedRequest = { ...mockPurchaseRequest, status: 'SUBMITTED' as const };
      repository.findById.mockResolvedValue(submittedRequest as any);

      await expect(service.update('pr-123', updateDto)).rejects.toThrow(BadRequestException);
      await expect(service.update('pr-123', updateDto)).rejects.toThrow('Cannot update purchase request that is not in DRAFT status');
    });
  });

  // ==================== Submit ====================

  describe('submit', () => {
    it('should submit draft request with items', async () => {
      repository.findById.mockResolvedValue(mockPurchaseRequest);
      repository.getItems.mockResolvedValue([mockPurchaseRequestItem]);
      const submittedRequest = { ...mockPurchaseRequest, status: 'SUBMITTED' as const };
      repository.update.mockResolvedValue(submittedRequest as any);

      const result = await service.submit('pr-123');

      expect(result.status).toBe('SUBMITTED');
      expect(repository.update).toHaveBeenCalledWith('pr-123', {
        status: 'SUBMITTED',
        submittedAt: expect.any(Number),
      });
    });

    it('should throw NotFoundException when request does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.submit('non-existent')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when not in DRAFT status', async () => {
      const submittedRequest = { ...mockPurchaseRequest, status: 'SUBMITTED' as const };
      repository.findById.mockResolvedValue(submittedRequest as any);

      await expect(service.submit('pr-123')).rejects.toThrow(BadRequestException);
      await expect(service.submit('pr-123')).rejects.toThrow('Only DRAFT requests can be submitted');
    });

    it('should throw BadRequestException when request has no items', async () => {
      repository.findById.mockResolvedValue(mockPurchaseRequest);
      repository.getItems.mockResolvedValue([]);

      await expect(service.submit('pr-123')).rejects.toThrow(BadRequestException);
      await expect(service.submit('pr-123')).rejects.toThrow('Cannot submit empty purchase request');
    });
  });

  // ==================== Approve ====================

  describe('approve', () => {
    it('should approve submitted request', async () => {
      const submittedRequest = { ...mockPurchaseRequest, status: 'SUBMITTED' as const };
      repository.findById.mockResolvedValue(submittedRequest as any);
      const approvedRequest = { ...submittedRequest, status: 'APPROVED' as const };
      repository.update.mockResolvedValue(approvedRequest as any);

      const result = await service.approve('pr-123', 'manager-123');

      expect(result.status).toBe('APPROVED');
      expect(repository.update).toHaveBeenCalledWith('pr-123', {
        status: 'APPROVED',
        approvedBy: 'manager-123',
        approvedAt: expect.any(Number),
      });
    });

    it('should throw BadRequestException when not in SUBMITTED status', async () => {
      repository.findById.mockResolvedValue(mockPurchaseRequest);

      await expect(service.approve('pr-123', 'manager-123')).rejects.toThrow(BadRequestException);
      await expect(service.approve('pr-123', 'manager-123')).rejects.toThrow('Only SUBMITTED requests can be approved');
    });

    it('should throw NotFoundException when request not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.approve('non-existent', 'manager-123')).rejects.toThrow(NotFoundException);
      await expect(service.approve('non-existent', 'manager-123')).rejects.toThrow('Purchase request not found');
    });
  });

  // ==================== Reject ====================

  describe('reject', () => {
    it('should reject submitted request with reason', async () => {
      const submittedRequest = { ...mockPurchaseRequest, status: 'SUBMITTED' as const };
      repository.findById.mockResolvedValue(submittedRequest as any);
      const rejectedRequest = { ...submittedRequest, status: 'REJECTED' as const };
      repository.update.mockResolvedValue(rejectedRequest as any);

      const result = await service.reject('pr-123', 'manager-123', '预算不足');

      expect(result.status).toBe('REJECTED');
      expect(repository.update).toHaveBeenCalledWith('pr-123', {
        status: 'REJECTED',
        rejectedBy: 'manager-123',
        rejectedAt: expect.any(Number),
        rejectionReason: '预算不足',
      });
    });

    it('should throw BadRequestException when not in SUBMITTED status', async () => {
      repository.findById.mockResolvedValue(mockPurchaseRequest);

      await expect(service.reject('pr-123', 'manager-123', 'reason')).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when request not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.reject('non-existent', 'manager-123', 'reason')).rejects.toThrow(NotFoundException);
      await expect(service.reject('non-existent', 'manager-123', 'reason')).rejects.toThrow('Purchase request not found');
    });
  });

  // ==================== Cancel ====================

  describe('cancel', () => {
    it('should cancel draft request', async () => {
      repository.findById.mockResolvedValue(mockPurchaseRequest);
      const cancelledRequest = { ...mockPurchaseRequest, status: 'CANCELLED' as const };
      repository.update.mockResolvedValue(cancelledRequest as any);

      const result = await service.cancel('pr-123');

      expect(result.status).toBe('CANCELLED');
    });

    it('should cancel approved request', async () => {
      const approvedRequest = { ...mockPurchaseRequest, status: 'APPROVED' as const };
      repository.findById.mockResolvedValue(approvedRequest as any);
      const cancelledRequest = { ...approvedRequest, status: 'CANCELLED' as const };
      repository.update.mockResolvedValue(cancelledRequest as any);

      const result = await service.cancel('pr-123');

      expect(result.status).toBe('CANCELLED');
    });

    it('should throw BadRequestException when already ORDERED', async () => {
      const orderedRequest = { ...mockPurchaseRequest, status: 'ORDERED' as const };
      repository.findById.mockResolvedValue(orderedRequest as any);

      await expect(service.cancel('pr-123')).rejects.toThrow(BadRequestException);
      await expect(service.cancel('pr-123')).rejects.toThrow('Cannot cancel this purchase request');
    });

    it('should throw BadRequestException when already CANCELLED', async () => {
      const cancelledRequest = { ...mockPurchaseRequest, status: 'CANCELLED' as const };
      repository.findById.mockResolvedValue(cancelledRequest as any);

      await expect(service.cancel('pr-123')).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when request not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.cancel('non-existent')).rejects.toThrow(NotFoundException);
      await expect(service.cancel('non-existent')).rejects.toThrow('Purchase request not found');
    });
  });

  // ==================== Delete ====================

  describe('delete', () => {
    it('should delete draft request', async () => {
      repository.findById.mockResolvedValue(mockPurchaseRequest);
      repository.delete.mockResolvedValue(undefined);

      await service.delete('pr-123');

      expect(repository.delete).toHaveBeenCalledWith('pr-123');
    });

    it('should throw NotFoundException when request does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.delete('non-existent')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when not in DRAFT status', async () => {
      const submittedRequest = { ...mockPurchaseRequest, status: 'SUBMITTED' as const };
      repository.findById.mockResolvedValue(submittedRequest as any);

      await expect(service.delete('pr-123')).rejects.toThrow(BadRequestException);
      await expect(service.delete('pr-123')).rejects.toThrow('Only DRAFT requests can be deleted');
    });
  });

  // ==================== List ====================

  describe('list', () => {
    it('should return paginated list with default options', async () => {
      const requests = [mockPurchaseRequest];
      repository.list.mockResolvedValue(requests as any);
      repository.count.mockResolvedValue(1);

      const result = await service.list();

      expect(result).toEqual({
        data: requests,
        total: 1,
        limit: 50,
        offset: 0,
      });
      expect(repository.list).toHaveBeenCalledWith({ limit: 50, offset: 0 });
    });

    it('should return paginated list with custom options', async () => {
      const requests = [mockPurchaseRequest];
      repository.list.mockResolvedValue(requests as any);
      repository.count.mockResolvedValue(1);

      const result = await service.list({
        limit: 10,
        offset: 5,
        status: 'DRAFT',
        priority: 'HIGH',
      });

      expect(result).toEqual({
        data: requests,
        total: 1,
        limit: 10,
        offset: 5,
      });
      expect(repository.list).toHaveBeenCalledWith({
        limit: 10,
        offset: 5,
        status: 'DRAFT',
        priority: 'HIGH',
      });
    });
  });

  // ==================== Add Item ====================

  describe('addItem', () => {
    const itemDto: CreatePurchaseRequestItemDto = {
      partNumber: 'PN-002',
      name: '新零件',
      quantity: 3,
    };

    it('should add item to draft request', async () => {
      repository.findById.mockResolvedValue(mockPurchaseRequest);
      repository.update.mockResolvedValue(mockPurchaseRequest as any);
      repository.getItems.mockResolvedValue([mockPurchaseRequestItem]);
      repository.addItem.mockResolvedValue({
        ...mockPurchaseRequestItem,
        id: 'pri-new',
      } as any);

      const result = await service.addItem('pr-123', itemDto);

      expect(result).toBeDefined();
      expect(repository.addItem).toHaveBeenCalledWith(
        expect.objectContaining({
          purchaseRequestId: 'pr-123',
          partNumber: 'PN-002',
          name: '新零件',
          quantity: 3,
          unit: '个',
        })
      );
      expect(repository.update).toHaveBeenCalledWith('pr-123', { estimatedTotal: expect.any(Number) });
    });

    it('should throw NotFoundException when request does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.addItem('pr-123', itemDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when not in DRAFT status', async () => {
      const submittedRequest = { ...mockPurchaseRequest, status: 'SUBMITTED' as const };
      repository.findById.mockResolvedValue(submittedRequest as any);

      await expect(service.addItem('pr-123', itemDto)).rejects.toThrow(BadRequestException);
      await expect(service.addItem('pr-123', itemDto)).rejects.toThrow('Cannot add items to non-DRAFT request');
    });
  });

  // ==================== Remove Item ====================

  describe('removeItem', () => {
    it('should remove item from draft request', async () => {
      repository.findById.mockResolvedValue(mockPurchaseRequest);
      repository.update.mockResolvedValue(mockPurchaseRequest as any);
      repository.getItems.mockResolvedValue([mockPurchaseRequestItem]);
      repository.deleteItem.mockResolvedValue(undefined);

      await service.removeItem('pr-123', 'pri-123');

      expect(repository.deleteItem).toHaveBeenCalledWith('pri-123');
      expect(repository.update).toHaveBeenCalledWith('pr-123', { estimatedTotal: expect.any(Number) });
    });

    it('should throw NotFoundException when request does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.removeItem('pr-123', 'pri-123')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when not in DRAFT status', async () => {
      const submittedRequest = { ...mockPurchaseRequest, status: 'SUBMITTED' as const };
      repository.findById.mockResolvedValue(submittedRequest as any);

      await expect(service.removeItem('pr-123', 'pri-123')).rejects.toThrow(BadRequestException);
    });
  });
});
