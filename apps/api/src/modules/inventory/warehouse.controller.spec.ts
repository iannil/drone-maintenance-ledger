/**
 * WarehouseController Unit Tests
 *
 * Tests for warehouse management endpoints
 */

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';

import { WarehouseController } from './warehouse.controller';
import { WarehouseService } from './warehouse.service';

describe('WarehouseController', () => {
  let controller: WarehouseController;
  let warehouseService: jest.Mocked<WarehouseService>;

  const mockWarehouse = {
    id: 'warehouse-123',
    code: 'WH-001',
    name: '北京总仓',
    type: 'MAIN' as const,
    address: '北京市朝阳区xxx路123号',
    contactPerson: '张三',
    contactPhone: '13800138000',
    notes: '主仓库',
    status: 'ACTIVE' as const,
    isActive: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const mockWarehouseList = [
    mockWarehouse,
    {
      ...mockWarehouse,
      id: 'warehouse-456',
      code: 'WH-002',
      name: '上海分仓',
      type: 'BRANCH' as const,
      address: '上海市浦东新区xxx路456号',
      contactPerson: '李四',
    },
    {
      ...mockWarehouse,
      id: 'warehouse-789',
      code: 'WH-M01',
      name: '移动仓库-车辆A',
      type: 'MOBILE' as const,
      address: null,
      contactPerson: '王五',
    },
  ];

  beforeEach(async () => {
    const mockWarehouseService = {
      findById: jest.fn(),
      search: jest.fn(),
      list: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WarehouseController],
      providers: [{ provide: WarehouseService, useValue: mockWarehouseService }],
    }).compile();

    controller = module.get<WarehouseController>(WarehouseController);
    warehouseService = module.get(WarehouseService);
  });

  // ==================== Get By ID Endpoints ====================

  describe('GET /warehouses/:id', () => {
    it('should return warehouse by ID', async () => {
      warehouseService.findById.mockResolvedValue(mockWarehouse as any);

      const result = await controller.getById('warehouse-123');

      expect(result).toEqual(mockWarehouse);
      expect(warehouseService.findById).toHaveBeenCalledWith('warehouse-123');
    });

    it('should return null for non-existent warehouse', async () => {
      warehouseService.findById.mockResolvedValue(null);

      const result = await controller.getById('non-existent');

      expect(result).toBeNull();
    });
  });

  // ==================== List Endpoints ====================

  describe('GET /warehouses', () => {
    it('should return list with default pagination', async () => {
      warehouseService.list.mockResolvedValue(mockWarehouseList as any);

      const result = await controller.list();

      expect(result).toEqual(mockWarehouseList);
      expect(warehouseService.list).toHaveBeenCalledWith({
        limit: 50,
        offset: 0,
        status: undefined,
      });
    });

    it('should return list with custom pagination', async () => {
      warehouseService.list.mockResolvedValue([mockWarehouse] as any);

      const result = await controller.list('10', '5');

      expect(result).toEqual([mockWarehouse]);
      expect(warehouseService.list).toHaveBeenCalledWith({
        limit: 10,
        offset: 5,
        status: undefined,
      });
    });

    it('should filter by status', async () => {
      warehouseService.list.mockResolvedValue([mockWarehouse] as any);

      const result = await controller.list('50', '0', 'ACTIVE');

      expect(result).toEqual([mockWarehouse]);
      expect(warehouseService.list).toHaveBeenCalledWith({
        limit: 50,
        offset: 0,
        status: 'ACTIVE',
      });
    });

    it('should return empty array when no warehouses', async () => {
      const emptyResult = { data: [], total: 0, limit: 50, offset: 0 };
      warehouseService.list.mockResolvedValue(emptyResult as any);

      const result = await controller.list();

      expect(result).toEqual(emptyResult);
    });
  });

  // ==================== Search Endpoints ====================

  describe('GET /warehouses/search/:query', () => {
    it('should search warehouses with default limit', async () => {
      warehouseService.search.mockResolvedValue([mockWarehouse] as any);

      const result = await controller.search('北京');

      expect(result).toEqual([mockWarehouse]);
      expect(warehouseService.search).toHaveBeenCalledWith('北京', 50);
    });

    it('should search with custom limit', async () => {
      warehouseService.search.mockResolvedValue([mockWarehouse] as any);

      const result = await controller.search('WH', '10');

      expect(result).toEqual([mockWarehouse]);
      expect(warehouseService.search).toHaveBeenCalledWith('WH', 10);
    });

    it('should return empty array for no matches', async () => {
      warehouseService.search.mockResolvedValue([]);

      const result = await controller.search('不存在的仓库');

      expect(result).toEqual([]);
    });
  });

  // ==================== Create Endpoints ====================

  describe('POST /warehouses', () => {
    const createDto = {
      code: 'WH-NEW',
      name: '新仓库',
      type: 'BRANCH' as const,
      address: '新地址',
      contactPerson: '新联系人',
      contactPhone: '13900139000',
    };

    it('should create a new warehouse', async () => {
      const newWarehouse = {
        id: 'warehouse-new',
        ...createDto,
        notes: null,
        status: 'ACTIVE' as const,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      warehouseService.create.mockResolvedValue(newWarehouse as any);

      const result = await controller.create(createDto);

      expect(result).toEqual(newWarehouse);
      expect(warehouseService.create).toHaveBeenCalledWith(createDto);
    });

    it('should throw ConflictException for duplicate warehouse code', async () => {
      warehouseService.create.mockRejectedValue(
        new ConflictException('Warehouse code already exists')
      );

      await expect(controller.create(createDto)).rejects.toThrow(ConflictException);
    });
  });

  // ==================== Update Endpoints ====================

  describe('PUT /warehouses/:id', () => {
    const updateDto = {
      name: '更新后的仓库名称',
      address: '更新后的地址',
      status: 'ACTIVE' as const,
    };

    it('should update warehouse', async () => {
      const updatedWarehouse = { ...mockWarehouse, ...updateDto, updatedAt: Date.now() };
      warehouseService.update.mockResolvedValue(updatedWarehouse as any);

      const result = await controller.update('warehouse-123', updateDto);

      expect(result).toEqual(updatedWarehouse);
      expect(warehouseService.update).toHaveBeenCalledWith('warehouse-123', updateDto);
    });

    it('should throw NotFoundException for non-existent warehouse', async () => {
      warehouseService.update.mockRejectedValue(new NotFoundException('Warehouse not found'));

      await expect(controller.update('non-existent', updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  // ==================== Delete Endpoints ====================

  describe('DELETE /warehouses/:id', () => {
    it('should delete warehouse and return success', async () => {
      warehouseService.delete.mockResolvedValue(undefined);

      const result = await controller.delete('warehouse-123');

      expect(result).toEqual({ success: true });
      expect(warehouseService.delete).toHaveBeenCalledWith('warehouse-123');
    });

    it('should throw NotFoundException for non-existent warehouse', async () => {
      warehouseService.delete.mockRejectedValue(new NotFoundException('Warehouse not found'));

      await expect(controller.delete('non-existent')).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when warehouse has inventory', async () => {
      warehouseService.delete.mockRejectedValue(
        new ConflictException('Cannot delete warehouse with inventory')
      );

      await expect(controller.delete('warehouse-123')).rejects.toThrow(ConflictException);
    });
  });
});
