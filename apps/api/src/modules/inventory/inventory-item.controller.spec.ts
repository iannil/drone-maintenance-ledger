/**
 * InventoryItemController Unit Tests
 *
 * Tests for inventory management endpoints
 */

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';

import { InventoryItemController } from './inventory-item.controller';
import { InventoryItemService } from './inventory-item.service';

describe('InventoryItemController', () => {
  let controller: InventoryItemController;
  let inventoryService: jest.Mocked<InventoryItemService>;

  const mockInventoryItem = {
    id: 'inv-123',
    warehouseId: 'warehouse-123',
    partNumber: 'PN-MOT-001',
    name: '电机',
    description: '高效无刷电机',
    category: 'ROTABLE' as const,
    quantity: 10,
    reservedQuantity: 2,
    availableQuantity: 8,
    unit: '个',
    minQuantity: 5,
    maxQuantity: 100,
    location: 'A-01-02',
    batchNumber: 'BATCH-2026-001',
    expirationDate: null,
    unitPrice: 1200,
    status: 'ACTIVE' as const,
    isActive: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const mockAlert = {
    type: 'LOW_STOCK' as const,
    inventoryItemId: 'inv-123',
    partNumber: 'PN-MOT-001',
    message: '库存低于最小值：当前 3，最小 5',
  };

  const mockInventoryList = [
    mockInventoryItem,
    {
      ...mockInventoryItem,
      id: 'inv-456',
      partNumber: 'PN-PROP-001',
      name: '桨叶',
      category: 'EXPENDABLE' as const,
      quantity: 50,
      reservedQuantity: 0,
      availableQuantity: 50,
    },
  ];

  beforeEach(async () => {
    const mockInventoryService = {
      findById: jest.fn(),
      search: jest.fn(),
      list: jest.fn(),
      getAlerts: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      adjustQuantity: jest.fn(),
      reserve: jest.fn(),
      release: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventoryItemController],
      providers: [{ provide: InventoryItemService, useValue: mockInventoryService }],
    }).compile();

    controller = module.get<InventoryItemController>(InventoryItemController);
    inventoryService = module.get(InventoryItemService);
  });

  // ==================== Alert Endpoints ====================

  describe('GET /inventory/alerts', () => {
    it('should return inventory alerts', async () => {
      inventoryService.getAlerts.mockResolvedValue([mockAlert] as any);

      const result = await controller.getAlerts();

      expect(result).toEqual([mockAlert]);
      expect(inventoryService.getAlerts).toHaveBeenCalled();
    });

    it('should return empty alerts when no alerts', async () => {
      const emptyAlerts = { lowStock: [], expiring: [] };
      inventoryService.getAlerts.mockResolvedValue(emptyAlerts as any);

      const result = await controller.getAlerts();

      expect(result).toEqual(emptyAlerts);
    });
  });

  // ==================== Search Endpoints ====================

  describe('GET /inventory/search/:query', () => {
    it('should search inventory items with default limit', async () => {
      inventoryService.search.mockResolvedValue([mockInventoryItem] as any);

      const result = await controller.search('电机');

      expect(result).toEqual([mockInventoryItem]);
      expect(inventoryService.search).toHaveBeenCalledWith('电机', 50);
    });

    it('should search with custom limit', async () => {
      inventoryService.search.mockResolvedValue([mockInventoryItem] as any);

      const result = await controller.search('电机', '10');

      expect(result).toEqual([mockInventoryItem]);
      expect(inventoryService.search).toHaveBeenCalledWith('电机', 10);
    });

    it('should return empty array for no matches', async () => {
      inventoryService.search.mockResolvedValue([]);

      const result = await controller.search('不存在的物料');

      expect(result).toEqual([]);
    });
  });

  // ==================== Get By ID Endpoints ====================

  describe('GET /inventory/:id', () => {
    it('should return inventory item by ID', async () => {
      inventoryService.findById.mockResolvedValue(mockInventoryItem as any);

      const result = await controller.getById('inv-123');

      expect(result).toEqual(mockInventoryItem);
      expect(inventoryService.findById).toHaveBeenCalledWith('inv-123');
    });

    it('should return null for non-existent inventory item', async () => {
      inventoryService.findById.mockResolvedValue(null);

      const result = await controller.getById('non-existent');

      expect(result).toBeNull();
    });
  });

  // ==================== List Endpoints ====================

  describe('GET /inventory', () => {
    it('should return list with default pagination', async () => {
      inventoryService.list.mockResolvedValue(mockInventoryList as any);

      const result = await controller.list();

      expect(result).toEqual(mockInventoryList);
      expect(inventoryService.list).toHaveBeenCalledWith({
        limit: 50,
        offset: 0,
        warehouseId: undefined,
        status: undefined,
        category: undefined,
        lowStock: false,
      });
    });

    it('should return list with custom pagination', async () => {
      inventoryService.list.mockResolvedValue([mockInventoryItem] as any);

      const result = await controller.list('20', '10');

      expect(result).toEqual([mockInventoryItem]);
      expect(inventoryService.list).toHaveBeenCalledWith({
        limit: 20,
        offset: 10,
        warehouseId: undefined,
        status: undefined,
        category: undefined,
        lowStock: false,
      });
    });

    it('should filter by warehouseId', async () => {
      inventoryService.list.mockResolvedValue([mockInventoryItem] as any);

      const result = await controller.list('50', '0', 'warehouse-123');

      expect(result).toEqual([mockInventoryItem]);
      expect(inventoryService.list).toHaveBeenCalledWith({
        limit: 50,
        offset: 0,
        warehouseId: 'warehouse-123',
        status: undefined,
        category: undefined,
        lowStock: false,
      });
    });

    it('should filter by status', async () => {
      inventoryService.list.mockResolvedValue([mockInventoryItem] as any);

      const result = await controller.list('50', '0', undefined, 'ACTIVE');

      expect(result).toEqual([mockInventoryItem]);
      expect(inventoryService.list).toHaveBeenCalledWith({
        limit: 50,
        offset: 0,
        warehouseId: undefined,
        status: 'ACTIVE',
        category: undefined,
        lowStock: false,
      });
    });

    it('should filter by category', async () => {
      inventoryService.list.mockResolvedValue([mockInventoryItem] as any);

      const result = await controller.list('50', '0', undefined, undefined, 'ROTABLE');

      expect(result).toEqual([mockInventoryItem]);
      expect(inventoryService.list).toHaveBeenCalledWith({
        limit: 50,
        offset: 0,
        warehouseId: undefined,
        status: undefined,
        category: 'ROTABLE',
        lowStock: false,
      });
    });

    it('should filter by lowStock', async () => {
      inventoryService.list.mockResolvedValue([mockInventoryItem] as any);

      const result = await controller.list('50', '0', undefined, undefined, undefined, 'true');

      expect(result).toEqual([mockInventoryItem]);
      expect(inventoryService.list).toHaveBeenCalledWith({
        limit: 50,
        offset: 0,
        warehouseId: undefined,
        status: undefined,
        category: undefined,
        lowStock: true,
      });
    });

    it('should return empty list when no items', async () => {
      const emptyResult = { data: [], total: 0, limit: 50, offset: 0 };
      inventoryService.list.mockResolvedValue(emptyResult as any);

      const result = await controller.list();

      expect(result).toEqual(emptyResult);
    });
  });

  // ==================== Create Endpoints ====================

  describe('POST /inventory', () => {
    const createDto = {
      warehouseId: 'warehouse-123',
      partNumber: 'PN-NEW-001',
      name: '新物料',
      category: 'CONSUMABLE' as const,
      quantity: 20,
      unit: '个',
      minQuantity: 10,
    };

    it('should create a new inventory item', async () => {
      const newItem = {
        id: 'inv-new',
        ...createDto,
        description: null,
        maxQuantity: null,
        location: null,
        batchNumber: null,
        expirationDate: null,
        unitPrice: null,
        reservedQuantity: 0,
        availableQuantity: 20,
        status: 'ACTIVE' as const,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      inventoryService.create.mockResolvedValue(newItem as any);

      const result = await controller.create(createDto);

      expect(result).toEqual(newItem);
      expect(inventoryService.create).toHaveBeenCalledWith(createDto);
    });

    it('should throw ConflictException for duplicate part number in warehouse', async () => {
      inventoryService.create.mockRejectedValue(
        new ConflictException('Part number already exists in this warehouse')
      );

      await expect(controller.create(createDto)).rejects.toThrow(ConflictException);
    });
  });

  // ==================== Update Endpoints ====================

  describe('PUT /inventory/:id', () => {
    const updateDto = {
      name: '更新后的物料名称',
      minQuantity: 15,
      status: 'ACTIVE' as const,
    };

    it('should update inventory item', async () => {
      const updatedItem = { ...mockInventoryItem, ...updateDto, updatedAt: Date.now() };
      inventoryService.update.mockResolvedValue(updatedItem as any);

      const result = await controller.update('inv-123', updateDto);

      expect(result).toEqual(updatedItem);
      expect(inventoryService.update).toHaveBeenCalledWith('inv-123', updateDto);
    });

    it('should throw NotFoundException for non-existent item', async () => {
      inventoryService.update.mockRejectedValue(new NotFoundException('Inventory item not found'));

      await expect(controller.update('non-existent', updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  // ==================== Adjust Endpoints ====================

  describe('POST /inventory/:id/adjust', () => {
    const adjustDto = {
      quantity: -2,
      reason: 'DAMAGE' as const,
      notes: '运输过程中损坏',
    };

    it('should adjust inventory quantity', async () => {
      const adjustedItem = {
        ...mockInventoryItem,
        quantity: 8,
        availableQuantity: 6,
        updatedAt: Date.now(),
      };
      inventoryService.adjustQuantity.mockResolvedValue(adjustedItem as any);

      const result = await controller.adjust('inv-123', adjustDto);

      expect(result).toEqual(adjustedItem);
      expect(inventoryService.adjustQuantity).toHaveBeenCalledWith('inv-123', adjustDto);
    });

    it('should throw NotFoundException for non-existent item', async () => {
      inventoryService.adjustQuantity.mockRejectedValue(
        new NotFoundException('Inventory item not found')
      );

      await expect(controller.adjust('non-existent', adjustDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for insufficient quantity', async () => {
      inventoryService.adjustQuantity.mockRejectedValue(
        new BadRequestException('Insufficient quantity')
      );

      await expect(
        controller.adjust('inv-123', { quantity: -100, reason: 'CORRECTION' })
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ==================== Reserve Endpoints ====================

  describe('POST /inventory/:id/reserve', () => {
    it('should reserve inventory', async () => {
      const reservedItem = {
        ...mockInventoryItem,
        reservedQuantity: 5,
        availableQuantity: 5,
        updatedAt: Date.now(),
      };
      inventoryService.reserve.mockResolvedValue(reservedItem as any);

      const result = await controller.reserve('inv-123', { quantity: 3 });

      expect(result).toEqual(reservedItem);
      expect(inventoryService.reserve).toHaveBeenCalledWith('inv-123', 3);
    });

    it('should throw NotFoundException for non-existent item', async () => {
      inventoryService.reserve.mockRejectedValue(new NotFoundException('Inventory item not found'));

      await expect(controller.reserve('non-existent', { quantity: 1 })).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw BadRequestException for insufficient available quantity', async () => {
      inventoryService.reserve.mockRejectedValue(
        new BadRequestException('Insufficient available quantity')
      );

      await expect(controller.reserve('inv-123', { quantity: 100 })).rejects.toThrow(
        BadRequestException
      );
    });
  });

  // ==================== Release Endpoints ====================

  describe('POST /inventory/:id/release', () => {
    it('should release reserved inventory', async () => {
      const releasedItem = {
        ...mockInventoryItem,
        reservedQuantity: 0,
        availableQuantity: 10,
        updatedAt: Date.now(),
      };
      inventoryService.release.mockResolvedValue(releasedItem as any);

      const result = await controller.release('inv-123', { quantity: 2 });

      expect(result).toEqual(releasedItem);
      expect(inventoryService.release).toHaveBeenCalledWith('inv-123', 2);
    });

    it('should throw NotFoundException for non-existent item', async () => {
      inventoryService.release.mockRejectedValue(new NotFoundException('Inventory item not found'));

      await expect(controller.release('non-existent', { quantity: 1 })).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw BadRequestException for insufficient reserved quantity', async () => {
      inventoryService.release.mockRejectedValue(
        new BadRequestException('Insufficient reserved quantity')
      );

      await expect(controller.release('inv-123', { quantity: 100 })).rejects.toThrow(
        BadRequestException
      );
    });
  });

  // ==================== Delete Endpoints ====================

  describe('DELETE /inventory/:id', () => {
    it('should delete inventory item and return success', async () => {
      inventoryService.delete.mockResolvedValue(undefined);

      const result = await controller.delete('inv-123');

      expect(result).toEqual({ success: true });
      expect(inventoryService.delete).toHaveBeenCalledWith('inv-123');
    });

    it('should throw NotFoundException for non-existent item', async () => {
      inventoryService.delete.mockRejectedValue(new NotFoundException('Inventory item not found'));

      await expect(controller.delete('non-existent')).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when item has remaining quantity', async () => {
      inventoryService.delete.mockRejectedValue(
        new ConflictException('Cannot delete item with remaining quantity')
      );

      await expect(controller.delete('inv-123')).rejects.toThrow(ConflictException);
    });
  });
});
