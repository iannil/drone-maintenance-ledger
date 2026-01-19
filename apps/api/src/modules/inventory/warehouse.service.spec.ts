/**
 * WarehouseService Unit Tests
 *
 * Tests for warehouse business logic
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';

import { WarehouseService, CreateWarehouseDto, UpdateWarehouseDto } from './warehouse.service';
import { WarehouseRepository } from './repositories/warehouse.repository';
import type { Warehouse } from '@repo/db';

describe('WarehouseService', () => {
  let service: WarehouseService;
  let repository: jest.Mocked<WarehouseRepository>;

  const mockWarehouse: Warehouse = {
    id: 'warehouse-123',
    code: 'WH-001',
    name: '北京总仓',
    description: '主仓库',
    address: '北京市朝阳区xxx路123号',
    city: '北京市',
    province: '北京市',
    country: '中国',
    contactPerson: '张三',
    contactPhone: '13800138000',
    contactEmail: 'zhangsan@example.com',
    status: 'ACTIVE',
    totalCapacity: 10000,
    usedCapacity: 500,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  beforeEach(async () => {
    const mockWarehouseRepository = {
      findById: jest.fn(),
      findByCode: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      list: jest.fn(),
      count: jest.fn(),
      search: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WarehouseService,
        { provide: WarehouseRepository, useValue: mockWarehouseRepository },
      ],
    }).compile();

    service = module.get<WarehouseService>(WarehouseService);
    repository = module.get(WarehouseRepository);
  });

  // ==================== Find By ID ====================

  describe('findById', () => {
    it('should return warehouse when found', async () => {
      repository.findById.mockResolvedValue(mockWarehouse);

      const result = await service.findById('warehouse-123');

      expect(result).toEqual(mockWarehouse);
      expect(repository.findById).toHaveBeenCalledWith('warehouse-123');
    });

    it('should return null when not found', async () => {
      repository.findById.mockResolvedValue(null);

      const result = await service.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  // ==================== Create ====================

  describe('create', () => {
    const createDto: CreateWarehouseDto = {
      code: 'WH-NEW',
      name: '新仓库',
      address: '新地址',
    };

    it('should create warehouse when code is unique', async () => {
      repository.findByCode.mockResolvedValue(null);
      repository.create.mockResolvedValue({
        ...mockWarehouse,
        id: 'warehouse-new',
        code: createDto.code,
        name: createDto.name,
      } as any);

      const result = await service.create(createDto);

      expect(result).toBeDefined();
      expect(repository.findByCode).toHaveBeenCalledWith(createDto.code);
      expect(repository.create).toHaveBeenCalledWith(createDto);
    });

    it('should throw ConflictException when code exists', async () => {
      repository.findByCode.mockResolvedValue(mockWarehouse);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
      await expect(service.create(createDto)).rejects.toThrow('Warehouse code already exists');
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  // ==================== Update ====================

  describe('update', () => {
    const updateDto: UpdateWarehouseDto = {
      name: '更新后的仓库名称',
      status: 'ACTIVE',
    };

    it('should update warehouse when exists', async () => {
      repository.findById.mockResolvedValue(mockWarehouse);
      const updatedWarehouse = { ...mockWarehouse, ...updateDto, updatedAt: Date.now() };
      repository.update.mockResolvedValue(updatedWarehouse as any);

      const result = await service.update('warehouse-123', updateDto);

      expect(result).toEqual(updatedWarehouse);
      expect(repository.findById).toHaveBeenCalledWith('warehouse-123');
      expect(repository.update).toHaveBeenCalledWith('warehouse-123', updateDto);
    });

    it('should throw NotFoundException when warehouse does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.update('non-existent', updateDto)).rejects.toThrow(NotFoundException);
      await expect(service.update('non-existent', updateDto)).rejects.toThrow('Warehouse not found');
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should handle partial update', async () => {
      repository.findById.mockResolvedValue(mockWarehouse);
      const partialDto: UpdateWarehouseDto = { contactPerson: '新联系人' };
      repository.update.mockResolvedValue({
        ...mockWarehouse,
        ...partialDto,
      } as any);

      const result = await service.update('warehouse-123', partialDto);

      expect(result.contactPerson).toBe('新联系人');
    });
  });

  // ==================== Delete ====================

  describe('delete', () => {
    it('should delete warehouse when exists', async () => {
      repository.findById.mockResolvedValue(mockWarehouse);
      repository.delete.mockResolvedValue(undefined);

      await service.delete('warehouse-123');

      expect(repository.findById).toHaveBeenCalledWith('warehouse-123');
      expect(repository.delete).toHaveBeenCalledWith('warehouse-123');
    });

    it('should throw NotFoundException when warehouse does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.delete('non-existent')).rejects.toThrow(NotFoundException);
      await expect(service.delete('non-existent')).rejects.toThrow('Warehouse not found');
      expect(repository.delete).not.toHaveBeenCalled();
    });
  });

  // ==================== List ====================

  describe('list', () => {
    it('should return paginated list with default options', async () => {
      const warehouses = [mockWarehouse];
      repository.list.mockResolvedValue(warehouses as any);
      repository.count.mockResolvedValue(1);

      const result = await service.list();

      expect(result).toEqual({
        data: warehouses,
        total: 1,
        limit: 50,
        offset: 0,
      });
      expect(repository.list).toHaveBeenCalledWith({ limit: 50, offset: 0, status: undefined });
      expect(repository.count).toHaveBeenCalledWith(undefined);
    });

    it('should return paginated list with custom options', async () => {
      const warehouses = [mockWarehouse];
      repository.list.mockResolvedValue(warehouses as any);
      repository.count.mockResolvedValue(1);

      const result = await service.list({ limit: 10, offset: 5, status: 'ACTIVE' });

      expect(result).toEqual({
        data: warehouses,
        total: 1,
        limit: 10,
        offset: 5,
      });
      expect(repository.list).toHaveBeenCalledWith({ limit: 10, offset: 5, status: 'ACTIVE' });
      expect(repository.count).toHaveBeenCalledWith('ACTIVE');
    });

    it('should return empty list when no warehouses', async () => {
      repository.list.mockResolvedValue([]);
      repository.count.mockResolvedValue(0);

      const result = await service.list();

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  // ==================== Search ====================

  describe('search', () => {
    it('should return search results with default limit', async () => {
      const results = [mockWarehouse];
      repository.search.mockResolvedValue(results as any);

      const result = await service.search('北京');

      expect(result).toEqual(results);
      expect(repository.search).toHaveBeenCalledWith('北京', 50);
    });

    it('should return search results with custom limit', async () => {
      const results = [mockWarehouse];
      repository.search.mockResolvedValue(results as any);

      const result = await service.search('WH', 10);

      expect(result).toEqual(results);
      expect(repository.search).toHaveBeenCalledWith('WH', 10);
    });

    it('should return empty array for no matches', async () => {
      repository.search.mockResolvedValue([]);

      const result = await service.search('不存在的仓库');

      expect(result).toEqual([]);
    });
  });
});
