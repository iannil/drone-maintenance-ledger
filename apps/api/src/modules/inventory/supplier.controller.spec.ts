/**
 * SupplierController Unit Tests
 *
 * Tests for supplier management endpoints
 */

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';

import { SupplierController } from './supplier.controller';
import { SupplierService } from './supplier.service';

describe('SupplierController', () => {
  let controller: SupplierController;
  let supplierService: jest.Mocked<SupplierService>;

  const mockSupplier = {
    id: 'supplier-123',
    code: 'SUP-001',
    name: '大疆科技',
    contactPerson: '张三',
    contactPhone: '13800138000',
    contactEmail: 'zhangsan@dji.com',
    address: '深圳市南山区xxx路123号',
    website: 'https://www.dji.com',
    rating: 'A' as const,
    status: 'ACTIVE' as const,
    notes: '官方授权经销商',
    isActive: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const mockSupplierList = [
    mockSupplier,
    {
      ...mockSupplier,
      id: 'supplier-456',
      code: 'SUP-002',
      name: 'T-Motor',
      contactPerson: '李四',
      rating: 'B' as const,
    },
    {
      ...mockSupplier,
      id: 'supplier-789',
      code: 'SUP-003',
      name: '第三方供应商',
      rating: 'C' as const,
      status: 'INACTIVE' as const,
    },
  ];

  beforeEach(async () => {
    const mockSupplierService = {
      findById: jest.fn(),
      search: jest.fn(),
      list: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SupplierController],
      providers: [{ provide: SupplierService, useValue: mockSupplierService }],
    }).compile();

    controller = module.get<SupplierController>(SupplierController);
    supplierService = module.get(SupplierService);
  });

  // ==================== Search ====================

  describe('GET /suppliers/search/:query', () => {
    it('should search suppliers with default limit', async () => {
      supplierService.search.mockResolvedValue([mockSupplier] as any);

      const result = await controller.search('大疆');

      expect(result).toEqual([mockSupplier]);
      expect(supplierService.search).toHaveBeenCalledWith('大疆', 50);
    });

    it('should search with custom limit', async () => {
      supplierService.search.mockResolvedValue([mockSupplier] as any);

      const result = await controller.search('SUP', '10');

      expect(result).toEqual([mockSupplier]);
      expect(supplierService.search).toHaveBeenCalledWith('SUP', 10);
    });

    it('should return empty array for no matches', async () => {
      supplierService.search.mockResolvedValue([]);

      const result = await controller.search('不存在的供应商');

      expect(result).toEqual([]);
    });
  });

  // ==================== Get By ID ====================

  describe('GET /suppliers/:id', () => {
    it('should return supplier by ID', async () => {
      supplierService.findById.mockResolvedValue(mockSupplier as any);

      const result = await controller.getById('supplier-123');

      expect(result).toEqual(mockSupplier);
      expect(supplierService.findById).toHaveBeenCalledWith('supplier-123');
    });

    it('should return null for non-existent supplier', async () => {
      supplierService.findById.mockResolvedValue(null);

      const result = await controller.getById('non-existent');

      expect(result).toBeNull();
    });
  });

  // ==================== List ====================

  describe('GET /suppliers', () => {
    it('should return list with default pagination', async () => {
      supplierService.list.mockResolvedValue(mockSupplierList as any);

      const result = await controller.list();

      expect(result).toEqual(mockSupplierList);
      expect(supplierService.list).toHaveBeenCalledWith({
        limit: 50,
        offset: 0,
        status: undefined,
        rating: undefined,
      });
    });

    it('should return list with filters', async () => {
      supplierService.list.mockResolvedValue([mockSupplier] as any);

      const result = await controller.list('20', '10', 'ACTIVE', 'A');

      expect(result).toEqual([mockSupplier]);
      expect(supplierService.list).toHaveBeenCalledWith({
        limit: 20,
        offset: 10,
        status: 'ACTIVE',
        rating: 'A',
      });
    });

    it('should return empty list when no suppliers', async () => {
      const emptyResult = { data: [], total: 0, limit: 50, offset: 0 };
      supplierService.list.mockResolvedValue(emptyResult as any);

      const result = await controller.list();

      expect(result).toEqual(emptyResult);
    });
  });

  // ==================== Create ====================

  describe('POST /suppliers', () => {
    const createDto = {
      code: 'SUP-NEW',
      name: '新供应商',
      contactPerson: '新联系人',
      contactPhone: '13900139000',
      rating: 'B' as const,
    };

    it('should create a new supplier', async () => {
      const newSupplier = {
        id: 'supplier-new',
        ...createDto,
        contactEmail: null,
        address: null,
        website: null,
        notes: null,
        status: 'ACTIVE' as const,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      supplierService.create.mockResolvedValue(newSupplier as any);

      const result = await controller.create(createDto);

      expect(result).toEqual(newSupplier);
      expect(supplierService.create).toHaveBeenCalledWith(createDto);
    });

    it('should throw ConflictException for duplicate code', async () => {
      supplierService.create.mockRejectedValue(
        new ConflictException('Supplier code already exists')
      );

      await expect(controller.create(createDto)).rejects.toThrow(ConflictException);
    });
  });

  // ==================== Update ====================

  describe('PUT /suppliers/:id', () => {
    const updateDto = {
      name: '更新后的供应商名称',
      rating: 'A' as const,
      status: 'ACTIVE' as const,
    };

    it('should update supplier', async () => {
      const updatedSupplier = { ...mockSupplier, ...updateDto, updatedAt: Date.now() };
      supplierService.update.mockResolvedValue(updatedSupplier as any);

      const result = await controller.update('supplier-123', updateDto);

      expect(result).toEqual(updatedSupplier);
      expect(supplierService.update).toHaveBeenCalledWith('supplier-123', updateDto);
    });

    it('should throw NotFoundException for non-existent supplier', async () => {
      supplierService.update.mockRejectedValue(new NotFoundException('Supplier not found'));

      await expect(controller.update('non-existent', updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  // ==================== Delete ====================

  describe('DELETE /suppliers/:id', () => {
    it('should delete supplier and return success', async () => {
      supplierService.delete.mockResolvedValue(undefined);

      const result = await controller.delete('supplier-123');

      expect(result).toEqual({ success: true });
      expect(supplierService.delete).toHaveBeenCalledWith('supplier-123');
    });

    it('should throw NotFoundException for non-existent supplier', async () => {
      supplierService.delete.mockRejectedValue(new NotFoundException('Supplier not found'));

      await expect(controller.delete('non-existent')).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when supplier has purchase orders', async () => {
      supplierService.delete.mockRejectedValue(
        new ConflictException('Cannot delete supplier with associated purchase orders')
      );

      await expect(controller.delete('supplier-123')).rejects.toThrow(ConflictException);
    });
  });
});
