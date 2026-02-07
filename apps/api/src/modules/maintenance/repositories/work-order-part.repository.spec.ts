/**
 * WorkOrderPartRepository Unit Tests
 *
 * Tests for work order part database operations
 */

import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { WorkOrderPartRepository } from './work-order-part.repository';
import type { WorkOrderPart, NewWorkOrderPart } from '@repo/db';
import { eq, and, desc } from 'drizzle-orm';

// Mock the db module
jest.mock('@repo/db', () => {
  const mockDb = {
    select: jest.fn(function(this: any) { return this; }),
    insert: jest.fn(function(this: any) { return this; }),
    update: jest.fn(function(this: any) { return this; }),
    delete: jest.fn(function(this: any) { return this; }),
  };

  const workOrderPart = {
    id: 'mock_id',
    workOrderId: 'mock_workOrderId',
    componentId: 'mock_componentId',
    quantity: 'mock_quantity',
    unitCost: 'mock_unitCost',
    totalCost: 'mock_totalCost',
    partNumber: 'mock_partNumber',
    partName: 'mock_partName',
    supplier: 'mock_supplier',
    isActive: 'mock_isActive',
    createdAt: 'mock_createdAt',
    updatedAt: 'mock_updatedAt',
  };

  return {
    db: mockDb,
    workOrderPart,
  };
});

import { db, workOrderPart } from '@repo/db';

describe('WorkOrderPartRepository', () => {
  let repository: WorkOrderPartRepository;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkOrderPartRepository],
    }).compile();

    repository = module.get<WorkOrderPartRepository>(WorkOrderPartRepository);

    // Default chain mock for select
    (db.select as jest.Mock).mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          orderBy: jest.fn().mockResolvedValue([]),
        }),
      }),
    });

    // Default chain mock for insert
    (db.insert as jest.Mock).mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([]),
      }),
    });

    // Default chain mock for update
    (db.update as jest.Mock).mockReturnValue({
      set: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue(undefined),
      }),
    });
  });

  describe('findById', () => {
    it('should return part when found', async () => {
      const mockPart: WorkOrderPart = {
        id: 'part-1',
        workOrderId: 'wo-1',
        componentId: 'component-1',
        quantity: 2,
        unit: 'pcs',
        partNumber: 'P123',
        partName: 'Test Part',
        isActive: true,
        createdAt: Date.now(),
        installedLocation: null,
        removedComponentId: null,
        removedSerialNumber: null,
      };

      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockPart]),
        }),
      });

      const result = await repository.findById('part-1');

      expect(result).toEqual(mockPart);
    });

    it('should return null when part not found', async () => {
      const result = await repository.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findByWorkOrder', () => {
    it('should return parts for work order', async () => {
      const mockParts: WorkOrderPart[] = [
        {
          id: 'part-1',
          workOrderId: 'wo-1',
          componentId: 'component-1',
          quantity: 2,
          unit: 'pcs',
          partNumber: 'P123',
          partName: 'Part 1',
          isActive: true,
          createdAt: Date.now(),
          installedLocation: null,
          removedComponentId: null,
          removedSerialNumber: null,
        },
        {
          id: 'part-2',
          workOrderId: 'wo-1',
          componentId: 'component-2',
          quantity: 1,
          unit: 'pcs',
          partNumber: 'P456',
          partName: 'Part 2',
          isActive: true,
          createdAt: Date.now(),
          installedLocation: null,
          removedComponentId: null,
          removedSerialNumber: null,
        },
      ];

      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockResolvedValue(mockParts),
          }),
        }),
      });

      const result = await repository.findByWorkOrder('wo-1');

      expect(result).toEqual(mockParts);
      expect(db.select).toHaveBeenCalledWith();
    });

    it('should return empty array when no parts found', async () => {
      const result = await repository.findByWorkOrder('wo-empty');

      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('should create and return part', async () => {
      const newPart: NewWorkOrderPart = {
        workOrderId: 'wo-1',
        partNumber: 'P123',
        partName: 'Test Part',
        quantity: 2,
        unit: 'pcs',
      };

      const createdPart: WorkOrderPart = {
        id: 'part-1',
        workOrderId: 'wo-1',
        componentId: null,
        partNumber: 'P123',
        partName: 'Test Part',
        quantity: 2,
        unit: 'pcs',
        isActive: true,
        createdAt: Date.now(),
        installedLocation: null,
        removedComponentId: null,
        removedSerialNumber: null,
      };

      (db.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([createdPart]),
        }),
      });

      const result = await repository.create(newPart);

      expect(result).toEqual(createdPart);
      expect(db.insert).toHaveBeenCalledWith(workOrderPart);
    });

    it('should throw error when creation fails', async () => {
      const newPart: NewWorkOrderPart = {
        workOrderId: 'wo-1',
        partNumber: 'P123',
        partName: 'Test Part',
        quantity: 2,
        unit: 'pcs',
      };

      (db.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([]),
        }),
      });

      await expect(repository.create(newPart)).rejects.toThrow('Failed to create work order part');
    });
  });

  describe('createMany', () => {
    it('should create multiple parts', async () => {
      const newParts: NewWorkOrderPart[] = [
        {
          workOrderId: 'wo-1',
          partNumber: 'P123',
          partName: 'Part 1',
          quantity: 2,
          unit: 'pcs',
        },
        {
          workOrderId: 'wo-1',
          partNumber: 'P456',
          partName: 'Part 2',
          quantity: 1,
          unit: 'pcs',
        },
      ];

      const createdParts: WorkOrderPart[] = [
        {
          id: 'part-1',
          workOrderId: 'wo-1',
          componentId: null,
          partNumber: 'P123',
          partName: 'Part 1',
          quantity: 2,
          unit: 'pcs',
          isActive: true,
          createdAt: Date.now(),
          installedLocation: null,
          removedComponentId: null,
          removedSerialNumber: null,
        },
        {
          id: 'part-2',
          workOrderId: 'wo-1',
          componentId: null,
          partNumber: 'P456',
          partName: 'Part 2',
          quantity: 1,
          unit: 'pcs',
          isActive: true,
          createdAt: Date.now(),
          installedLocation: null,
          removedComponentId: null,
          removedSerialNumber: null,
        },
      ];

      (db.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue(createdParts),
        }),
      });

      const result = await repository.createMany(newParts);

      expect(result).toEqual(createdParts);
    });

    it('should return empty array when no parts created', async () => {
      (db.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([]),
        }),
      });

      const result = await repository.createMany([]);

      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update and return part', async () => {
      const updateData = { quantity: 5 };
      const updatedPart: WorkOrderPart = {
        id: 'part-1',
        workOrderId: 'wo-1',
        componentId: 'component-1',
        quantity: 5,
        unit: 'pcs',
        partNumber: 'P123',
        partName: 'Test Part',
        isActive: true,
        createdAt: Date.now(),
        installedLocation: null,
        removedComponentId: null,
        removedSerialNumber: null,
      };

      (db.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([updatedPart]),
          }),
        }),
      });

      const result = await repository.update('part-1', updateData);

      expect(result).toEqual(updatedPart);
      expect(db.update).toHaveBeenCalledWith(workOrderPart);
    });

    it('should throw NotFoundException when part not found', async () => {
      (db.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      await expect(repository.update('non-existent', { quantity: 5 }))
        .rejects.toThrow(NotFoundException);
      await expect(repository.update('non-existent', { quantity: 5 }))
        .rejects.toThrow('Work order part with id non-existent not found');
    });
  });

  describe('delete', () => {
    it('should soft delete part', async () => {
      (db.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(undefined),
        }),
      });

      await expect(repository.delete('part-1')).resolves.toBeUndefined();
      expect(db.update).toHaveBeenCalledWith(workOrderPart);
    });
  });

  describe('deleteByWorkOrder', () => {
    it('should soft delete all parts for work order', async () => {
      (db.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(undefined),
        }),
      });

      await expect(repository.deleteByWorkOrder('wo-1')).resolves.toBeUndefined();
      expect(db.update).toHaveBeenCalledWith(workOrderPart);
    });
  });
});
