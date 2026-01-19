/**
 * InventoryMovementController Unit Tests
 *
 * Tests for inventory movement management endpoints
 */

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';

import { InventoryMovementController } from './inventory-movement.controller';
import { InventoryMovementService } from './inventory-movement.service';

describe('InventoryMovementController', () => {
  let controller: InventoryMovementController;
  let movementService: jest.Mocked<InventoryMovementService>;

  const mockMovement = {
    id: 'mov-123',
    movementNumber: 'MOV-2026-001',
    inventoryItemId: 'inv-123',
    type: 'OUT' as const,
    quantity: 2,
    sourceWarehouseId: 'warehouse-123',
    destinationWarehouseId: null,
    workOrderId: 'wo-123',
    purchaseOrderId: null,
    reason: '工单领料',
    notes: '维修电机更换',
    status: 'PENDING' as const,
    requestedBy: 'user-123',
    approvedBy: null,
    approvedAt: null,
    completedAt: null,
    isActive: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const mockStats = {
    totalIn: 100,
    totalOut: 80,
    totalTransfer: 20,
    totalAdjustment: 5,
  };

  const mockMovementList = [
    mockMovement,
    {
      ...mockMovement,
      id: 'mov-456',
      movementNumber: 'MOV-2026-002',
      type: 'IN' as const,
      status: 'COMPLETED' as const,
      purchaseOrderId: 'po-123',
      workOrderId: null,
    },
  ];

  beforeEach(async () => {
    const mockMovementService = {
      findById: jest.fn(),
      search: jest.fn(),
      list: jest.fn(),
      getPending: jest.fn(),
      getStats: jest.fn(),
      getByInventoryItem: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      approve: jest.fn(),
      complete: jest.fn(),
      cancel: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventoryMovementController],
      providers: [{ provide: InventoryMovementService, useValue: mockMovementService }],
    }).compile();

    controller = module.get<InventoryMovementController>(InventoryMovementController);
    movementService = module.get(InventoryMovementService);
  });

  // ==================== Pending Movements ====================

  describe('GET /inventory/movements/pending', () => {
    it('should return pending movements', async () => {
      movementService.getPending.mockResolvedValue([mockMovement] as any);

      const result = await controller.getPending();

      expect(result).toEqual([mockMovement]);
      expect(movementService.getPending).toHaveBeenCalled();
    });

    it('should return empty array when no pending movements', async () => {
      movementService.getPending.mockResolvedValue([]);

      const result = await controller.getPending();

      expect(result).toEqual([]);
    });
  });

  // ==================== Statistics ====================

  describe('GET /inventory/movements/stats', () => {
    it('should return movement statistics without filters', async () => {
      movementService.getStats.mockResolvedValue(mockStats as any);

      const result = await controller.getStats();

      expect(result).toEqual(mockStats);
      expect(movementService.getStats).toHaveBeenCalledWith({
        startDate: undefined,
        endDate: undefined,
        warehouseId: undefined,
      });
    });

    it('should return statistics with date filters', async () => {
      movementService.getStats.mockResolvedValue(mockStats as any);

      const result = await controller.getStats('1704067200000', '1706745600000', 'warehouse-123');

      expect(result).toEqual(mockStats);
      expect(movementService.getStats).toHaveBeenCalledWith({
        startDate: 1704067200000,
        endDate: 1706745600000,
        warehouseId: 'warehouse-123',
      });
    });
  });

  // ==================== Search ====================

  describe('GET /inventory/movements/search/:query', () => {
    it('should search movements with default limit', async () => {
      movementService.search.mockResolvedValue([mockMovement] as any);

      const result = await controller.search('MOV-2026');

      expect(result).toEqual([mockMovement]);
      expect(movementService.search).toHaveBeenCalledWith('MOV-2026', 50);
    });

    it('should search with custom limit', async () => {
      movementService.search.mockResolvedValue([mockMovement] as any);

      const result = await controller.search('MOV', '10');

      expect(result).toEqual([mockMovement]);
      expect(movementService.search).toHaveBeenCalledWith('MOV', 10);
    });
  });

  // ==================== Get By Inventory Item ====================

  describe('GET /inventory/movements/item/:inventoryItemId', () => {
    it('should return movements for inventory item', async () => {
      movementService.getByInventoryItem.mockResolvedValue(mockMovementList as any);

      const result = await controller.getByInventoryItem('inv-123');

      expect(result).toEqual(mockMovementList);
      expect(movementService.getByInventoryItem).toHaveBeenCalledWith('inv-123');
    });
  });

  // ==================== Get By ID ====================

  describe('GET /inventory/movements/:id', () => {
    it('should return movement by ID', async () => {
      movementService.findById.mockResolvedValue(mockMovement as any);

      const result = await controller.getById('mov-123');

      expect(result).toEqual(mockMovement);
      expect(movementService.findById).toHaveBeenCalledWith('mov-123');
    });

    it('should return null for non-existent movement', async () => {
      movementService.findById.mockResolvedValue(null);

      const result = await controller.getById('non-existent');

      expect(result).toBeNull();
    });
  });

  // ==================== List ====================

  describe('GET /inventory/movements', () => {
    it('should return list with default pagination', async () => {
      movementService.list.mockResolvedValue(mockMovementList as any);

      const result = await controller.list();

      expect(result).toEqual(mockMovementList);
      expect(movementService.list).toHaveBeenCalledWith({
        limit: 50,
        offset: 0,
        type: undefined,
        status: undefined,
        warehouseId: undefined,
        inventoryItemId: undefined,
        startDate: undefined,
        endDate: undefined,
      });
    });

    it('should return list with all filters', async () => {
      movementService.list.mockResolvedValue([mockMovement] as any);

      const result = await controller.list(
        '20', '10', 'OUT', 'PENDING', 'warehouse-123', 'inv-123', '1704067200000', '1706745600000'
      );

      expect(result).toEqual([mockMovement]);
      expect(movementService.list).toHaveBeenCalledWith({
        limit: 20,
        offset: 10,
        type: 'OUT',
        status: 'PENDING',
        warehouseId: 'warehouse-123',
        inventoryItemId: 'inv-123',
        startDate: 1704067200000,
        endDate: 1706745600000,
      });
    });
  });

  // ==================== Create ====================

  describe('POST /inventory/movements', () => {
    const createDto = {
      type: 'OUT',
      partNumber: 'PN-MOT-001',
      inventoryItemId: 'inv-123',
      quantity: 3,
      reason: '工单领料',
    };

    it('should create a new movement', async () => {
      const newMovement = {
        ...mockMovement,
        ...createDto,
        id: 'mov-new',
        movementNumber: 'MOV-2026-003',
      };
      movementService.create.mockResolvedValue(newMovement as any);

      const mockRequest = { user: { id: 'user-123' } } as any;
      const result = await controller.create(createDto, mockRequest);

      expect(result).toEqual(newMovement);
      expect(movementService.create).toHaveBeenCalledWith({
        ...createDto,
        requestedBy: 'user-123',
      });
    });
  });

  // ==================== Update ====================

  describe('PUT /inventory/movements/:id', () => {
    const updateDto = {
      quantity: 5,
      notes: '更新备注',
    };

    it('should update movement', async () => {
      const updatedMovement = { ...mockMovement, ...updateDto };
      movementService.update.mockResolvedValue(updatedMovement as any);

      const result = await controller.update('mov-123', updateDto);

      expect(result).toEqual(updatedMovement);
      expect(movementService.update).toHaveBeenCalledWith('mov-123', updateDto);
    });

    it('should throw NotFoundException for non-existent movement', async () => {
      movementService.update.mockRejectedValue(new NotFoundException('Movement not found'));

      await expect(controller.update('non-existent', updateDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException for non-pending movement', async () => {
      movementService.update.mockRejectedValue(
        new ConflictException('Cannot update non-pending movement')
      );

      await expect(controller.update('mov-123', updateDto)).rejects.toThrow(ConflictException);
    });
  });

  // ==================== Approve ====================

  describe('POST /inventory/movements/:id/approve', () => {
    it('should approve movement', async () => {
      const approvedMovement = {
        ...mockMovement,
        status: 'APPROVED' as const,
        approvedBy: 'manager-123',
        approvedAt: Date.now(),
      };
      movementService.approve.mockResolvedValue(approvedMovement as any);

      const mockRequest = { user: { id: 'manager-123' } } as any;
      const result = await controller.approve('mov-123', mockRequest);

      expect(result).toEqual(approvedMovement);
      expect(movementService.approve).toHaveBeenCalledWith('mov-123', { approvedBy: 'manager-123' });
    });

    it('should throw ConflictException for invalid status', async () => {
      movementService.approve.mockRejectedValue(
        new ConflictException('Cannot approve movement in current status')
      );

      const mockRequest = { user: { id: 'manager-123' } } as any;
      await expect(controller.approve('mov-123', mockRequest)).rejects.toThrow(ConflictException);
    });
  });

  // ==================== Complete ====================

  describe('POST /inventory/movements/:id/complete', () => {
    it('should complete movement', async () => {
      const completedMovement = {
        ...mockMovement,
        status: 'COMPLETED' as const,
        completedAt: Date.now(),
      };
      movementService.complete.mockResolvedValue(completedMovement as any);

      const result = await controller.complete('mov-123');

      expect(result).toEqual(completedMovement);
      expect(movementService.complete).toHaveBeenCalledWith('mov-123');
    });

    it('should throw ConflictException for invalid status', async () => {
      movementService.complete.mockRejectedValue(
        new ConflictException('Cannot complete movement in current status')
      );

      await expect(controller.complete('mov-123')).rejects.toThrow(ConflictException);
    });
  });

  // ==================== Cancel ====================

  describe('POST /inventory/movements/:id/cancel', () => {
    it('should cancel movement', async () => {
      const cancelledMovement = {
        ...mockMovement,
        status: 'CANCELLED' as const,
      };
      movementService.cancel.mockResolvedValue(cancelledMovement as any);

      const result = await controller.cancel('mov-123');

      expect(result).toEqual(cancelledMovement);
      expect(movementService.cancel).toHaveBeenCalledWith('mov-123');
    });

    it('should throw ConflictException for completed movement', async () => {
      movementService.cancel.mockRejectedValue(
        new ConflictException('Cannot cancel completed movement')
      );

      await expect(controller.cancel('mov-123')).rejects.toThrow(ConflictException);
    });
  });

  // ==================== Delete ====================

  describe('DELETE /inventory/movements/:id', () => {
    it('should delete movement and return success', async () => {
      movementService.delete.mockResolvedValue(undefined);

      const result = await controller.delete('mov-123');

      expect(result).toEqual({ success: true });
      expect(movementService.delete).toHaveBeenCalledWith('mov-123');
    });

    it('should throw NotFoundException for non-existent movement', async () => {
      movementService.delete.mockRejectedValue(new NotFoundException('Movement not found'));

      await expect(controller.delete('non-existent')).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException for non-pending movement', async () => {
      movementService.delete.mockRejectedValue(
        new ConflictException('Cannot delete non-pending movement')
      );

      await expect(controller.delete('mov-123')).rejects.toThrow(ConflictException);
    });
  });
});
