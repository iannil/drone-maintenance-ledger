/**
 * SupplierService Unit Tests
 *
 * Tests for supplier business logic
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';

import { SupplierService, CreateSupplierDto, UpdateSupplierDto } from './supplier.service';
import { SupplierRepository } from './repositories/supplier.repository';
import type { Supplier } from '@repo/db';

describe('SupplierService', () => {
  let service: SupplierService;
  let repository: jest.Mocked<SupplierRepository>;

  const mockSupplier: Supplier = {
    id: 'supplier-123',
    code: 'SUP-001',
    name: '大疆科技',
    shortName: 'DJI',
    contactPerson: '张三',
    contactPhone: '13800138000',
    contactEmail: 'zhangsan@dji.com',
    website: 'https://www.dji.com',
    address: '深圳市南山区xxx路123号',
    city: '深圳市',
    province: '广东省',
    country: '中国',
    postalCode: '518000',
    businessLicense: 'BL-12345',
    taxId: 'TAX-12345',
    bankName: '中国银行',
    bankAccount: '6217xxxx',
    categories: '无人机',
    mainProducts: '电机,电调,螺旋桨',
    paymentTerms: '月结30天',
    creditLimit: 100000,
    leadTimeDays: 7,
    rating: 'A',
    status: 'ACTIVE',
    onTimeDeliveryRate: 95,
    qualityScore: 98,
    totalOrders: 50,
    totalAmount: 5000000,
    notes: '官方授权经销商',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  beforeEach(async () => {
    const mockSupplierRepository = {
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
        SupplierService,
        { provide: SupplierRepository, useValue: mockSupplierRepository },
      ],
    }).compile();

    service = module.get<SupplierService>(SupplierService);
    repository = module.get(SupplierRepository);
  });

  // ==================== Find By ID ====================

  describe('findById', () => {
    it('should return supplier when found', async () => {
      repository.findById.mockResolvedValue(mockSupplier);

      const result = await service.findById('supplier-123');

      expect(result).toEqual(mockSupplier);
      expect(repository.findById).toHaveBeenCalledWith('supplier-123');
    });

    it('should return null when not found', async () => {
      repository.findById.mockResolvedValue(null);

      const result = await service.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  // ==================== Create ====================

  describe('create', () => {
    const createDto: CreateSupplierDto = {
      code: 'SUP-NEW',
      name: '新供应商',
      contactPerson: '联系人',
      contactPhone: '13900139000',
    };

    it('should create supplier when code is unique', async () => {
      repository.findByCode.mockResolvedValue(null);
      repository.create.mockResolvedValue({
        ...mockSupplier,
        id: 'supplier-new',
        code: createDto.code,
        name: createDto.name,
      } as any);

      const result = await service.create(createDto);

      expect(result).toBeDefined();
      expect(repository.findByCode).toHaveBeenCalledWith(createDto.code);
      expect(repository.create).toHaveBeenCalledWith(createDto);
    });

    it('should throw ConflictException when code exists', async () => {
      repository.findByCode.mockResolvedValue(mockSupplier);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
      await expect(service.create(createDto)).rejects.toThrow('Supplier code already exists');
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  // ==================== Update ====================

  describe('update', () => {
    const updateDto: UpdateSupplierDto = {
      name: '更新后的供应商名称',
      rating: 'A',
      status: 'ACTIVE',
    };

    it('should update supplier when exists', async () => {
      repository.findById.mockResolvedValue(mockSupplier);
      const updatedSupplier = { ...mockSupplier, ...updateDto, updatedAt: Date.now() };
      repository.update.mockResolvedValue(updatedSupplier as any);

      const result = await service.update('supplier-123', updateDto);

      expect(result).toEqual(updatedSupplier);
      expect(repository.findById).toHaveBeenCalledWith('supplier-123');
      expect(repository.update).toHaveBeenCalledWith('supplier-123', updateDto);
    });

    it('should throw NotFoundException when supplier does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.update('non-existent', updateDto)).rejects.toThrow(NotFoundException);
      await expect(service.update('non-existent', updateDto)).rejects.toThrow('Supplier not found');
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should handle partial update', async () => {
      repository.findById.mockResolvedValue(mockSupplier);
      const partialDto: UpdateSupplierDto = { contactPhone: '13800138001' };
      repository.update.mockResolvedValue({
        ...mockSupplier,
        ...partialDto,
      } as any);

      const result = await service.update('supplier-123', partialDto);

      expect(result.contactPhone).toBe('13800138001');
    });
  });

  // ==================== Delete ====================

  describe('delete', () => {
    it('should delete supplier when exists', async () => {
      repository.findById.mockResolvedValue(mockSupplier);
      repository.delete.mockResolvedValue(undefined);

      await service.delete('supplier-123');

      expect(repository.findById).toHaveBeenCalledWith('supplier-123');
      expect(repository.delete).toHaveBeenCalledWith('supplier-123');
    });

    it('should throw NotFoundException when supplier does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.delete('non-existent')).rejects.toThrow(NotFoundException);
      await expect(service.delete('non-existent')).rejects.toThrow('Supplier not found');
      expect(repository.delete).not.toHaveBeenCalled();
    });
  });

  // ==================== List ====================

  describe('list', () => {
    it('should return paginated list with default options', async () => {
      const suppliers = [mockSupplier];
      repository.list.mockResolvedValue(suppliers as any);
      repository.count.mockResolvedValue(1);

      const result = await service.list();

      expect(result).toEqual({
        data: suppliers,
        total: 1,
        limit: 50,
        offset: 0,
      });
      expect(repository.list).toHaveBeenCalledWith({ limit: 50, offset: 0, status: undefined, rating: undefined });
      expect(repository.count).toHaveBeenCalledWith(undefined);
    });

    it('should return paginated list with custom options', async () => {
      const suppliers = [mockSupplier];
      repository.list.mockResolvedValue(suppliers as any);
      repository.count.mockResolvedValue(1);

      const result = await service.list({ limit: 10, offset: 5, status: 'ACTIVE', rating: 'A' });

      expect(result).toEqual({
        data: suppliers,
        total: 1,
        limit: 10,
        offset: 5,
      });
      expect(repository.list).toHaveBeenCalledWith({ limit: 10, offset: 5, status: 'ACTIVE', rating: 'A' });
      expect(repository.count).toHaveBeenCalledWith('ACTIVE');
    });

    it('should return empty list when no suppliers', async () => {
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
      const results = [mockSupplier];
      repository.search.mockResolvedValue(results as any);

      const result = await service.search('大疆');

      expect(result).toEqual(results);
      expect(repository.search).toHaveBeenCalledWith('大疆', 50);
    });

    it('should return search results with custom limit', async () => {
      const results = [mockSupplier];
      repository.search.mockResolvedValue(results as any);

      const result = await service.search('SUP', 10);

      expect(result).toEqual(results);
      expect(repository.search).toHaveBeenCalledWith('SUP', 10);
    });

    it('should return empty array for no matches', async () => {
      repository.search.mockResolvedValue([]);

      const result = await service.search('不存在的供应商');

      expect(result).toEqual([]);
    });
  });
});
