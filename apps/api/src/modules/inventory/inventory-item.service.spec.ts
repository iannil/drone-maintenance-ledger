import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';

import { InventoryItemService, CreateInventoryItemDto, UpdateInventoryItemDto, AdjustInventoryDto } from './inventory-item.service';
import { InventoryItemRepository } from './repositories/inventory-item.repository';

describe('InventoryItemService', () => {
  let service: InventoryItemService;
  let inventoryRepo: jest.Mocked<InventoryItemRepository>;

  // Complete mock inventory item with all required fields
  const mockInventoryItem = {
    id: 'item-123',
    partNumber: 'PN-001',
    name: 'Test Part',
    description: 'Test description',
    category: 'ELECTRICAL',
    unit: '个',
    warehouseId: 'warehouse-123',
    location: 'A-1-3',
    binNumber: 'BIN-001',
    quantity: 100,
    reservedQuantity: 10,
    availableQuantity: 90,
    minStock: 20,
    maxStock: 200,
    reorderPoint: 30,
    reorderQuantity: 50,
    unitCost: 1000, // 10.00 in cents
    totalValue: 100000, // 1000.00 in cents
    batchNumber: 'BATCH-001',
    serialNumbers: null,
    expiryDate: null,
    status: 'AVAILABLE',
    lastCountDate: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  beforeEach(async () => {
    const mockInventoryRepo = {
      findById: jest.fn(),
      findByPartNumber: jest.fn(),
      findByPartNumberAndWarehouse: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateQuantity: jest.fn(),
      delete: jest.fn(),
      list: jest.fn(),
      count: jest.fn(),
      search: jest.fn(),
      getLowStockItems: jest.fn(),
      getExpiringItems: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryItemService,
        { provide: InventoryItemRepository, useValue: mockInventoryRepo },
      ],
    }).compile();

    service = module.get<InventoryItemService>(InventoryItemService);
    inventoryRepo = module.get(InventoryItemRepository);
  });

  describe('findById', () => {
    it('should return inventory item when found', async () => {
      inventoryRepo.findById.mockResolvedValue(mockInventoryItem);

      const result = await service.findById('item-123');

      expect(result).toEqual(mockInventoryItem);
      expect(inventoryRepo.findById).toHaveBeenCalledWith('item-123');
    });

    it('should return null when not found', async () => {
      inventoryRepo.findById.mockResolvedValue(null);

      const result = await service.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    const createDto: CreateInventoryItemDto = {
      partNumber: 'PN-002',
      name: 'New Part',
      warehouseId: 'warehouse-123',
      quantity: 50,
      unitCost: 500,
    };

    it('should create inventory item successfully', async () => {
      inventoryRepo.findByPartNumberAndWarehouse.mockResolvedValue(null);
      inventoryRepo.create.mockResolvedValue({ ...mockInventoryItem, ...createDto });

      const result = await service.create(createDto);

      expect(result.partNumber).toBe('PN-002');
      expect(inventoryRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          partNumber: 'PN-002',
          name: 'New Part',
          totalValue: 25000, // 50 * 500
        }),
      );
    });

    it('should throw ConflictException when part number exists in warehouse', async () => {
      inventoryRepo.findByPartNumberAndWarehouse.mockResolvedValue(mockInventoryItem);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });

    it('should create without duplicate check when no warehouseId', async () => {
      const dtoWithoutWarehouse: CreateInventoryItemDto = {
        partNumber: 'PN-003',
        name: 'Part without warehouse',
      };
      inventoryRepo.create.mockResolvedValue({ ...mockInventoryItem, ...dtoWithoutWarehouse });

      await service.create(dtoWithoutWarehouse);

      expect(inventoryRepo.findByPartNumberAndWarehouse).not.toHaveBeenCalled();
      expect(inventoryRepo.create).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const updateDto: UpdateInventoryItemDto = {
      name: 'Updated Part Name',
      description: 'Updated description',
    };

    it('should update inventory item successfully', async () => {
      inventoryRepo.findById.mockResolvedValue(mockInventoryItem);
      inventoryRepo.update.mockResolvedValue({ ...mockInventoryItem, ...updateDto });

      const result = await service.update('item-123', updateDto);

      expect(result.name).toBe('Updated Part Name');
      expect(inventoryRepo.update).toHaveBeenCalledWith('item-123', updateDto);
    });

    it('should throw NotFoundException when item not found', async () => {
      inventoryRepo.findById.mockResolvedValue(null);

      await expect(service.update('non-existent', updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('adjustQuantity', () => {
    it('should increase quantity successfully', async () => {
      inventoryRepo.findById.mockResolvedValue(mockInventoryItem);
      inventoryRepo.update.mockResolvedValue({
        ...mockInventoryItem,
        quantity: 150,
        availableQuantity: 140,
        totalValue: 150000,
      });

      const dto: AdjustInventoryDto = {
        quantity: 50, // Increase by 50
        reason: 'Stock replenishment',
      };

      const result = await service.adjustQuantity('item-123', dto);

      expect(result.quantity).toBe(150);
      expect(inventoryRepo.update).toHaveBeenCalledWith(
        'item-123',
        expect.objectContaining({
          quantity: 150,
          availableQuantity: 140, // 150 - 10 reserved
        }),
      );
    });

    it('should decrease quantity successfully', async () => {
      inventoryRepo.findById.mockResolvedValue(mockInventoryItem);
      inventoryRepo.update.mockResolvedValue({
        ...mockInventoryItem,
        quantity: 50,
        availableQuantity: 40,
        totalValue: 50000,
      });

      const dto: AdjustInventoryDto = {
        quantity: -50, // Decrease by 50
        reason: 'Consumption',
      };

      const result = await service.adjustQuantity('item-123', dto);

      expect(result.quantity).toBe(50);
    });

    it('should throw BadRequestException when adjustment would result in negative quantity', async () => {
      inventoryRepo.findById.mockResolvedValue(mockInventoryItem);

      const dto: AdjustInventoryDto = {
        quantity: -150, // Would result in -50
        reason: 'Invalid adjustment',
      };

      await expect(service.adjustQuantity('item-123', dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when item not found', async () => {
      inventoryRepo.findById.mockResolvedValue(null);

      const dto: AdjustInventoryDto = {
        quantity: 10,
        reason: 'Adjustment',
      };

      await expect(service.adjustQuantity('non-existent', dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('reserve', () => {
    it('should reserve quantity successfully', async () => {
      inventoryRepo.findById.mockResolvedValue(mockInventoryItem);
      inventoryRepo.updateQuantity.mockResolvedValue({
        ...mockInventoryItem,
        reservedQuantity: 30,
        availableQuantity: 70,
      });

      const result = await service.reserve('item-123', 20);

      expect(result.reservedQuantity).toBe(30);
      expect(inventoryRepo.updateQuantity).toHaveBeenCalledWith('item-123', 0, 20);
    });

    it('should throw BadRequestException when insufficient available quantity', async () => {
      inventoryRepo.findById.mockResolvedValue(mockInventoryItem);

      // Trying to reserve 100, but only 90 available
      await expect(service.reserve('item-123', 100)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when item not found', async () => {
      inventoryRepo.findById.mockResolvedValue(null);

      await expect(service.reserve('non-existent', 10)).rejects.toThrow(NotFoundException);
    });
  });

  describe('release', () => {
    it('should release reserved quantity successfully', async () => {
      inventoryRepo.findById.mockResolvedValue(mockInventoryItem);
      inventoryRepo.updateQuantity.mockResolvedValue({
        ...mockInventoryItem,
        reservedQuantity: 5,
        availableQuantity: 95,
      });

      const result = await service.release('item-123', 5);

      expect(result.reservedQuantity).toBe(5);
      expect(inventoryRepo.updateQuantity).toHaveBeenCalledWith('item-123', 0, -5);
    });

    it('should throw BadRequestException when releasing more than reserved', async () => {
      inventoryRepo.findById.mockResolvedValue(mockInventoryItem);

      // Trying to release 20, but only 10 reserved
      await expect(service.release('item-123', 20)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when item not found', async () => {
      inventoryRepo.findById.mockResolvedValue(null);

      await expect(service.release('non-existent', 5)).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete item with zero quantity', async () => {
      const zeroQuantityItem = { ...mockInventoryItem, quantity: 0 };
      inventoryRepo.findById.mockResolvedValue(zeroQuantityItem);
      inventoryRepo.delete.mockResolvedValue(undefined);

      await expect(service.delete('item-123')).resolves.toBeUndefined();
      expect(inventoryRepo.delete).toHaveBeenCalledWith('item-123');
    });

    it('should throw BadRequestException when item has positive quantity', async () => {
      inventoryRepo.findById.mockResolvedValue(mockInventoryItem);

      await expect(service.delete('item-123')).rejects.toThrow(BadRequestException);
      expect(inventoryRepo.delete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when item not found', async () => {
      inventoryRepo.findById.mockResolvedValue(null);

      await expect(service.delete('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('list', () => {
    it('should return paginated list of items', async () => {
      inventoryRepo.list.mockResolvedValue([mockInventoryItem]);
      inventoryRepo.count.mockResolvedValue(1);

      const result = await service.list({ limit: 10, offset: 0 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.offset).toBe(0);
    });

    it('should use default pagination values', async () => {
      inventoryRepo.list.mockResolvedValue([]);
      inventoryRepo.count.mockResolvedValue(0);

      const result = await service.list();

      expect(result.limit).toBe(50);
      expect(result.offset).toBe(0);
    });

    it('should pass filters to repository', async () => {
      inventoryRepo.list.mockResolvedValue([]);
      inventoryRepo.count.mockResolvedValue(0);

      await service.list({
        warehouseId: 'warehouse-123',
        status: 'AVAILABLE',
        category: 'ELECTRICAL',
        lowStock: true,
      });

      expect(inventoryRepo.list).toHaveBeenCalledWith(
        expect.objectContaining({
          warehouseId: 'warehouse-123',
          status: 'AVAILABLE',
          category: 'ELECTRICAL',
          lowStock: true,
        }),
      );
    });
  });

  describe('search', () => {
    it('should search items by query', async () => {
      inventoryRepo.search.mockResolvedValue([mockInventoryItem]);

      const result = await service.search('Test');

      expect(result).toHaveLength(1);
      expect(inventoryRepo.search).toHaveBeenCalledWith('Test', 50);
    });

    it('should use custom limit', async () => {
      inventoryRepo.search.mockResolvedValue([]);

      await service.search('Test', 10);

      expect(inventoryRepo.search).toHaveBeenCalledWith('Test', 10);
    });
  });

  describe('getAlerts', () => {
    it('should return low stock and expiring items', async () => {
      const lowStockItem = { ...mockInventoryItem, quantity: 15 }; // Below minStock of 20
      const expiringItem = { ...mockInventoryItem, id: 'item-456', expiryDate: Date.now() + 15 * 24 * 60 * 60 * 1000 };

      inventoryRepo.getLowStockItems.mockResolvedValue([lowStockItem]);
      inventoryRepo.getExpiringItems.mockResolvedValue([expiringItem]);

      const result = await service.getAlerts();

      expect(result.lowStock).toHaveLength(1);
      expect(result.expiring).toHaveLength(1);
      expect(inventoryRepo.getLowStockItems).toHaveBeenCalled();
      expect(inventoryRepo.getExpiringItems).toHaveBeenCalledWith(30);
    });

    it('should return empty arrays when no alerts', async () => {
      inventoryRepo.getLowStockItems.mockResolvedValue([]);
      inventoryRepo.getExpiringItems.mockResolvedValue([]);

      const result = await service.getAlerts();

      expect(result.lowStock).toHaveLength(0);
      expect(result.expiring).toHaveLength(0);
    });
  });
});
