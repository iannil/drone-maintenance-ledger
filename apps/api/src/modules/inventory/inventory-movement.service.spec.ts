import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';

import {
  InventoryMovementService,
  CreateMovementDto,
  UpdateMovementDto,
  ApproveMovementDto,
} from './inventory-movement.service';
import { InventoryMovementRepository } from './repositories/inventory-movement.repository';
import { InventoryItemRepository } from './repositories/inventory-item.repository';

describe('InventoryMovementService', () => {
  let service: InventoryMovementService;
  let movementRepo: jest.Mocked<InventoryMovementRepository>;
  let inventoryRepo: jest.Mocked<InventoryItemRepository>;

  // Complete mock movement with all required fields
  const mockMovement = {
    id: 'movement-123',
    movementNumber: 'MV-2024-001',
    type: 'RECEIPT',
    status: 'PENDING',
    inventoryItemId: 'item-123',
    partNumber: 'PN-001',
    partName: 'Test Part',
    quantity: 50,
    unit: '个',
    fromWarehouseId: null,
    toWarehouseId: 'warehouse-123',
    fromLocation: null,
    toLocation: 'A-1-3',
    referenceType: 'PO',
    referenceId: 'po-123',
    referenceNumber: 'PO-2024-001',
    unitCost: 1000,
    totalCost: 50000,
    batchNumber: 'BATCH-001',
    serialNumbers: null,
    reason: 'Stock replenishment',
    notes: 'Test notes',
    requestedBy: 'user-123',
    approvedBy: null,
    approvedAt: null,
    movementDate: Date.now(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  // Mock inventory item
  const mockInventoryItem = {
    id: 'item-123',
    partNumber: 'PN-001',
    name: 'Test Part',
    description: null,
    category: null,
    unit: '个',
    warehouseId: 'warehouse-123',
    location: null,
    binNumber: null,
    quantity: 100,
    reservedQuantity: 10,
    availableQuantity: 90,
    minStock: 20,
    maxStock: null,
    reorderPoint: null,
    reorderQuantity: null,
    unitCost: 1000,
    totalValue: 100000,
    batchNumber: null,
    serialNumbers: null,
    expiryDate: null,
    status: 'AVAILABLE',
    lastCountDate: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  beforeEach(async () => {
    const mockMovementRepo = {
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      list: jest.fn(),
      count: jest.fn(),
      search: jest.fn(),
      getByInventoryItem: jest.fn(),
      getPending: jest.fn(),
      generateMovementNumber: jest.fn(),
    };

    const mockInventoryRepo = {
      findById: jest.fn(),
      updateQuantity: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryMovementService,
        { provide: InventoryMovementRepository, useValue: mockMovementRepo },
        { provide: InventoryItemRepository, useValue: mockInventoryRepo },
      ],
    }).compile();

    service = module.get<InventoryMovementService>(InventoryMovementService);
    movementRepo = module.get(InventoryMovementRepository);
    inventoryRepo = module.get(InventoryItemRepository);
  });

  describe('findById', () => {
    it('should return movement when found', async () => {
      movementRepo.findById.mockResolvedValue(mockMovement);

      const result = await service.findById('movement-123');

      expect(result).toEqual(mockMovement);
      expect(movementRepo.findById).toHaveBeenCalledWith('movement-123');
    });

    it('should return null when not found', async () => {
      movementRepo.findById.mockResolvedValue(null);

      const result = await service.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create receipt movement successfully', async () => {
      const createDto: CreateMovementDto = {
        type: 'RECEIPT',
        partNumber: 'PN-001',
        quantity: 50,
        toWarehouseId: 'warehouse-123',
        unitCost: 1000,
      };

      movementRepo.generateMovementNumber.mockResolvedValue('MV-2024-002');
      movementRepo.create.mockResolvedValue({ ...mockMovement, movementNumber: 'MV-2024-002' });

      const result = await service.create(createDto);

      expect(result.movementNumber).toBe('MV-2024-002');
      expect(movementRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'RECEIPT',
          status: 'PENDING',
          totalCost: 50000,
        }),
      );
    });

    it('should create issue movement successfully', async () => {
      const createDto: CreateMovementDto = {
        type: 'ISSUE',
        partNumber: 'PN-001',
        quantity: 10,
        fromWarehouseId: 'warehouse-123',
      };

      movementRepo.generateMovementNumber.mockResolvedValue('MV-2024-003');
      movementRepo.create.mockResolvedValue({ ...mockMovement, type: 'ISSUE' });

      await service.create(createDto);

      expect(movementRepo.create).toHaveBeenCalled();
    });

    it('should create transfer movement successfully', async () => {
      const createDto: CreateMovementDto = {
        type: 'TRANSFER',
        partNumber: 'PN-001',
        quantity: 20,
        fromWarehouseId: 'warehouse-123',
        toWarehouseId: 'warehouse-456',
      };

      movementRepo.generateMovementNumber.mockResolvedValue('MV-2024-004');
      movementRepo.create.mockResolvedValue({ ...mockMovement, type: 'TRANSFER' });

      await service.create(createDto);

      expect(movementRepo.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid movement type', async () => {
      const createDto: CreateMovementDto = {
        type: 'INVALID_TYPE',
        partNumber: 'PN-001',
        quantity: 10,
      };

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when transfer missing source warehouse', async () => {
      const createDto: CreateMovementDto = {
        type: 'TRANSFER',
        partNumber: 'PN-001',
        quantity: 10,
        toWarehouseId: 'warehouse-456',
      };

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when transfer source and destination are same', async () => {
      const createDto: CreateMovementDto = {
        type: 'TRANSFER',
        partNumber: 'PN-001',
        quantity: 10,
        fromWarehouseId: 'warehouse-123',
        toWarehouseId: 'warehouse-123',
      };

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when receipt missing destination warehouse', async () => {
      const createDto: CreateMovementDto = {
        type: 'RECEIPT',
        partNumber: 'PN-001',
        quantity: 10,
      };

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when issue missing source warehouse', async () => {
      const createDto: CreateMovementDto = {
        type: 'ISSUE',
        partNumber: 'PN-001',
        quantity: 10,
      };

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    const updateDto: UpdateMovementDto = {
      quantity: 60,
      notes: 'Updated notes',
    };

    it('should update pending movement successfully', async () => {
      movementRepo.findById.mockResolvedValue(mockMovement);
      movementRepo.update.mockResolvedValue({ ...mockMovement, quantity: 60, notes: 'Updated notes' });

      const result = await service.update('movement-123', updateDto);

      expect(result.quantity).toBe(60);
      expect(movementRepo.update).toHaveBeenCalledWith(
        'movement-123',
        expect.objectContaining({ quantity: 60 }),
      );
    });

    it('should recalculate total cost when quantity changes', async () => {
      movementRepo.findById.mockResolvedValue(mockMovement);
      movementRepo.update.mockResolvedValue({ ...mockMovement, quantity: 60, totalCost: 60000 });

      await service.update('movement-123', { quantity: 60 });

      expect(movementRepo.update).toHaveBeenCalledWith(
        'movement-123',
        expect.objectContaining({ totalCost: 60000 }),
      );
    });

    it('should throw NotFoundException when movement not found', async () => {
      movementRepo.findById.mockResolvedValue(null);

      await expect(service.update('non-existent', updateDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when movement is not pending', async () => {
      movementRepo.findById.mockResolvedValue({ ...mockMovement, status: 'APPROVED' });

      await expect(service.update('movement-123', updateDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('approve', () => {
    const approveDto: ApproveMovementDto = {
      approvedBy: 'approver-123',
    };

    it('should approve pending movement successfully', async () => {
      movementRepo.findById.mockResolvedValue(mockMovement);
      movementRepo.update.mockResolvedValue({ ...mockMovement, status: 'APPROVED' });

      const result = await service.approve('movement-123', approveDto);

      expect(result.status).toBe('APPROVED');
      expect(movementRepo.update).toHaveBeenCalledWith(
        'movement-123',
        expect.objectContaining({
          status: 'APPROVED',
          approvedBy: 'approver-123',
        }),
      );
    });

    it('should throw NotFoundException when movement not found', async () => {
      movementRepo.findById.mockResolvedValue(null);

      await expect(service.approve('non-existent', approveDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when movement is not pending', async () => {
      movementRepo.findById.mockResolvedValue({ ...mockMovement, status: 'COMPLETED' });

      await expect(service.approve('movement-123', approveDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('complete', () => {
    it('should complete approved receipt and increase inventory', async () => {
      const approvedMovement = { ...mockMovement, status: 'APPROVED', type: 'RECEIPT' };
      movementRepo.findById.mockResolvedValue(approvedMovement);
      inventoryRepo.findById.mockResolvedValue(mockInventoryItem);
      inventoryRepo.updateQuantity.mockResolvedValue({ ...mockInventoryItem, quantity: 150 });
      movementRepo.update.mockResolvedValue({ ...approvedMovement, status: 'COMPLETED' });

      const result = await service.complete('movement-123');

      expect(result.status).toBe('COMPLETED');
      expect(inventoryRepo.updateQuantity).toHaveBeenCalledWith('item-123', 50, 0);
    });

    it('should complete approved issue and decrease inventory', async () => {
      const approvedMovement = {
        ...mockMovement,
        status: 'APPROVED',
        type: 'ISSUE',
        quantity: 20,
      };
      movementRepo.findById.mockResolvedValue(approvedMovement);
      inventoryRepo.findById.mockResolvedValue(mockInventoryItem);
      inventoryRepo.updateQuantity.mockResolvedValue({ ...mockInventoryItem, quantity: 80 });
      movementRepo.update.mockResolvedValue({ ...approvedMovement, status: 'COMPLETED' });

      const result = await service.complete('movement-123');

      expect(result.status).toBe('COMPLETED');
      expect(inventoryRepo.updateQuantity).toHaveBeenCalledWith('item-123', -20, 0);
    });

    it('should throw BadRequestException when issue quantity exceeds available', async () => {
      const approvedMovement = {
        ...mockMovement,
        status: 'APPROVED',
        type: 'ISSUE',
        quantity: 100, // More than available (90)
      };
      movementRepo.findById.mockResolvedValue(approvedMovement);
      inventoryRepo.findById.mockResolvedValue(mockInventoryItem);

      await expect(service.complete('movement-123')).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when movement not found', async () => {
      movementRepo.findById.mockResolvedValue(null);

      await expect(service.complete('non-existent')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when movement is not approved', async () => {
      movementRepo.findById.mockResolvedValue(mockMovement); // status is PENDING

      await expect(service.complete('movement-123')).rejects.toThrow(BadRequestException);
    });

    it('should complete movement without inventory update when no inventoryItemId', async () => {
      const approvedMovement = { ...mockMovement, status: 'APPROVED', inventoryItemId: null };
      movementRepo.findById.mockResolvedValue(approvedMovement);
      movementRepo.update.mockResolvedValue({ ...approvedMovement, status: 'COMPLETED' });

      const result = await service.complete('movement-123');

      expect(result.status).toBe('COMPLETED');
      expect(inventoryRepo.updateQuantity).not.toHaveBeenCalled();
    });

    it('should complete adjustment movement and set quantity', async () => {
      const approvedMovement = {
        ...mockMovement,
        status: 'APPROVED',
        type: 'ADJUSTMENT',
        quantity: 10,
      };
      movementRepo.findById.mockResolvedValue(approvedMovement);
      inventoryRepo.findById.mockResolvedValue(mockInventoryItem);
      inventoryRepo.updateQuantity.mockResolvedValue({ ...mockInventoryItem });
      movementRepo.update.mockResolvedValue({ ...approvedMovement, status: 'COMPLETED' });

      const result = await service.complete('movement-123');

      expect(result.status).toBe('COMPLETED');
      expect(inventoryRepo.updateQuantity).toHaveBeenCalledWith('item-123', 10, 0);
    });

    it('should complete count movement and set quantity', async () => {
      const approvedMovement = {
        ...mockMovement,
        status: 'APPROVED',
        type: 'COUNT',
        quantity: 95,
      };
      movementRepo.findById.mockResolvedValue(approvedMovement);
      inventoryRepo.findById.mockResolvedValue(mockInventoryItem);
      inventoryRepo.updateQuantity.mockResolvedValue({ ...mockInventoryItem });
      movementRepo.update.mockResolvedValue({ ...approvedMovement, status: 'COMPLETED' });

      const result = await service.complete('movement-123');

      expect(result.status).toBe('COMPLETED');
      expect(inventoryRepo.updateQuantity).toHaveBeenCalledWith('item-123', 95, 0);
    });

    it('should complete transfer movement without inventory update', async () => {
      const approvedMovement = {
        ...mockMovement,
        status: 'APPROVED',
        type: 'TRANSFER',
      };
      movementRepo.findById.mockResolvedValue(approvedMovement);
      movementRepo.update.mockResolvedValue({ ...approvedMovement, status: 'COMPLETED' });

      const result = await service.complete('movement-123');

      expect(result.status).toBe('COMPLETED');
      expect(inventoryRepo.updateQuantity).not.toHaveBeenCalled();
    });
  });

  describe('cancel', () => {
    it('should cancel pending movement', async () => {
      movementRepo.findById.mockResolvedValue(mockMovement);
      movementRepo.update.mockResolvedValue({ ...mockMovement, status: 'CANCELLED' });

      const result = await service.cancel('movement-123');

      expect(result.status).toBe('CANCELLED');
    });

    it('should cancel approved movement', async () => {
      movementRepo.findById.mockResolvedValue({ ...mockMovement, status: 'APPROVED' });
      movementRepo.update.mockResolvedValue({ ...mockMovement, status: 'CANCELLED' });

      const result = await service.cancel('movement-123');

      expect(result.status).toBe('CANCELLED');
    });

    it('should throw NotFoundException when movement not found', async () => {
      movementRepo.findById.mockResolvedValue(null);

      await expect(service.cancel('non-existent')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when movement is completed', async () => {
      movementRepo.findById.mockResolvedValue({ ...mockMovement, status: 'COMPLETED' });

      await expect(service.cancel('movement-123')).rejects.toThrow(BadRequestException);
    });
  });

  describe('delete', () => {
    it('should delete pending movement', async () => {
      movementRepo.findById.mockResolvedValue(mockMovement);
      movementRepo.delete.mockResolvedValue(undefined);

      await expect(service.delete('movement-123')).resolves.toBeUndefined();
      expect(movementRepo.delete).toHaveBeenCalledWith('movement-123');
    });

    it('should delete cancelled movement', async () => {
      movementRepo.findById.mockResolvedValue({ ...mockMovement, status: 'CANCELLED' });
      movementRepo.delete.mockResolvedValue(undefined);

      await expect(service.delete('movement-123')).resolves.toBeUndefined();
    });

    it('should throw NotFoundException when movement not found', async () => {
      movementRepo.findById.mockResolvedValue(null);

      await expect(service.delete('non-existent')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when movement is approved', async () => {
      movementRepo.findById.mockResolvedValue({ ...mockMovement, status: 'APPROVED' });

      await expect(service.delete('movement-123')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when movement is completed', async () => {
      movementRepo.findById.mockResolvedValue({ ...mockMovement, status: 'COMPLETED' });

      await expect(service.delete('movement-123')).rejects.toThrow(BadRequestException);
    });
  });

  describe('list', () => {
    it('should return paginated list of movements', async () => {
      movementRepo.list.mockResolvedValue([mockMovement]);
      movementRepo.count.mockResolvedValue(1);

      const result = await service.list({ limit: 10, offset: 0 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.offset).toBe(0);
    });

    it('should use default pagination values', async () => {
      movementRepo.list.mockResolvedValue([]);
      movementRepo.count.mockResolvedValue(0);

      const result = await service.list();

      expect(result.limit).toBe(50);
      expect(result.offset).toBe(0);
    });

    it('should pass filters to repository', async () => {
      movementRepo.list.mockResolvedValue([]);
      movementRepo.count.mockResolvedValue(0);

      await service.list({
        type: 'RECEIPT',
        status: 'PENDING',
        warehouseId: 'warehouse-123',
      });

      expect(movementRepo.list).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'RECEIPT',
          status: 'PENDING',
          warehouseId: 'warehouse-123',
        }),
      );
    });
  });

  describe('search', () => {
    it('should search movements by query', async () => {
      movementRepo.search.mockResolvedValue([mockMovement]);

      const result = await service.search('MV-2024');

      expect(result).toHaveLength(1);
      expect(movementRepo.search).toHaveBeenCalledWith('MV-2024', 50);
    });

    it('should use custom limit', async () => {
      movementRepo.search.mockResolvedValue([]);

      await service.search('MV-2024', 10);

      expect(movementRepo.search).toHaveBeenCalledWith('MV-2024', 10);
    });
  });

  describe('getByInventoryItem', () => {
    it('should return movements for inventory item', async () => {
      movementRepo.getByInventoryItem.mockResolvedValue([mockMovement]);

      const result = await service.getByInventoryItem('item-123');

      expect(result).toHaveLength(1);
      expect(movementRepo.getByInventoryItem).toHaveBeenCalledWith('item-123');
    });
  });

  describe('getPending', () => {
    it('should return pending movements', async () => {
      movementRepo.getPending.mockResolvedValue([mockMovement]);

      const result = await service.getPending();

      expect(result).toHaveLength(1);
      expect(movementRepo.getPending).toHaveBeenCalled();
    });
  });

  describe('getStats', () => {
    it('should return movement statistics', async () => {
      const movements = [
        { ...mockMovement, type: 'RECEIPT', status: 'COMPLETED' },
        { ...mockMovement, id: 'movement-456', type: 'ISSUE', status: 'COMPLETED' },
        { ...mockMovement, id: 'movement-789', type: 'RECEIPT', status: 'PENDING' },
      ];
      movementRepo.list.mockResolvedValue(movements);

      const result = await service.getStats();

      expect(result.total).toBe(3);
      expect(result.byType).toEqual({ RECEIPT: 2, ISSUE: 1 });
      expect(result.byStatus).toEqual({ COMPLETED: 2, PENDING: 1 });
    });

    it('should pass date filters to repository', async () => {
      movementRepo.list.mockResolvedValue([]);

      const startDate = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const endDate = Date.now();

      await service.getStats({ startDate, endDate, warehouseId: 'warehouse-123' });

      expect(movementRepo.list).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate,
          endDate,
          warehouseId: 'warehouse-123',
        }),
      );
    });
  });
});
