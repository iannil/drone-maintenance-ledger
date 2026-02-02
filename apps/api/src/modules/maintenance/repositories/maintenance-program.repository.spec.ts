/**
 * MaintenanceProgramRepository Unit Tests
 *
 * Tests for maintenance program database operations
 */

import { Test, TestingModule } from '@nestjs/testing';

import { MaintenanceProgramRepository } from './maintenance-program.repository';
import type { MaintenanceProgram, NewMaintenanceProgram } from '@repo/db';
import { eq, and, desc } from 'drizzle-orm';

// Mock the db module
jest.mock('@repo/db', () => {
  const mockDb = {
    select: jest.fn(function(this: any) { return this; }),
    insert: jest.fn(function(this: any) { return this; }),
    update: jest.fn(function(this: any) { return this; }),
    delete: jest.fn(function(this: any) { return this; }),
  };

  const maintenanceProgram = {
    id: 'mock_id',
    name: 'mock_name',
    description: 'mock_description',
    aircraftModel: 'mock_aircraftModel',
    isDefault: 'mock_isDefault',
    isActive: 'mock_isActive',
    createdAt: 'mock_createdAt',
    updatedAt: 'mock_updatedAt',
  };

  return {
    db: mockDb,
    maintenanceProgram,
  };
});

import { db, maintenanceProgram } from '@repo/db';

describe('MaintenanceProgramRepository', () => {
  let repository: MaintenanceProgramRepository;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [MaintenanceProgramRepository],
    }).compile();

    repository = module.get<MaintenanceProgramRepository>(MaintenanceProgramRepository);

    // Default chain mock for select
    (db.select as jest.Mock).mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          orderBy: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              offset: jest.fn().mockResolvedValue([]),
            }),
          }),
        }),
        // When where is not called (no conditions), orderBy is available directly
        orderBy: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            offset: jest.fn().mockResolvedValue([]),
          }),
        }),
        limit: jest.fn().mockReturnValue({
          offset: jest.fn().mockResolvedValue([]),
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
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([]),
        }),
      }),
    });

    // Default chain mock for delete
    (db.delete as jest.Mock).mockReturnValue({
      where: jest.fn().mockResolvedValue(undefined),
    });
  });

  describe('findById', () => {
    it('should return program when found', async () => {
      const mockProgram: MaintenanceProgram = {
        id: 'program-1',
        name: 'Test Program',
        description: 'Test Description',
        aircraftModel: 'DJI Mavic 3',
        isDefault: true,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockProgram]),
        }),
      });

      const result = await repository.findById('program-1');

      expect(result).toEqual(mockProgram);
    });

    it('should return null when program not found', async () => {
      const result = await repository.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findDefaultForModel', () => {
    it('should return default program for aircraft model', async () => {
      const mockProgram: MaintenanceProgram = {
        id: 'program-1',
        name: 'Default Program',
        description: 'Default maintenance program',
        aircraftModel: 'DJI Mavic 3',
        isDefault: true,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockProgram]),
        }),
      });

      const result = await repository.findDefaultForModel('DJI Mavic 3');

      expect(result).toEqual(mockProgram);
    });

    it('should return null when no default program found', async () => {
      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });

      const result = await repository.findDefaultForModel('Unknown Model');

      expect(result).toBeNull();
    });
  });

  describe('findByAircraftModel', () => {
    it('should return programs for aircraft model', async () => {
      const mockPrograms: MaintenanceProgram[] = [
        {
          id: 'program-1',
          name: 'Program 1',
          description: 'Description 1',
          aircraftModel: 'DJI Mavic 3',
          isDefault: true,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        } as MaintenanceProgram,
        {
          id: 'program-2',
          name: 'Program 2',
          description: 'Description 2',
          aircraftModel: 'DJI Mavic 3',
          isDefault: false,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        } as MaintenanceProgram,
      ];

      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(mockPrograms),
        }),
      });

      const result = await repository.findByAircraftModel('DJI Mavic 3');

      expect(result).toEqual(mockPrograms);
    });

    it('should return empty array when no programs found', async () => {
      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });

      const result = await repository.findByAircraftModel('Unknown Model');

      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('should create and return program', async () => {
      const newProgram: NewMaintenanceProgram = {
        name: 'New Program',
        description: 'New Description',
        aircraftModel: 'DJI Mini 3',
        isDefault: false,
        isActive: true,
      };

      const createdProgram: MaintenanceProgram = {
        id: 'program-2',
        name: newProgram.name,
        description: newProgram.description ?? null,
        aircraftModel: newProgram.aircraftModel,
        isDefault: newProgram.isDefault ?? false,
        isActive: newProgram.isActive ?? true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      (db.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([createdProgram]),
        }),
      });

      const result = await repository.create(newProgram);

      expect(result).toEqual(createdProgram);
      expect(db.insert).toHaveBeenCalledWith(maintenanceProgram);
    });

    it('should throw error when creation fails', async () => {
      const newProgram: NewMaintenanceProgram = {
        name: 'New Program',
        aircraftModel: 'DJI Mini 3',
        isActive: true,
      };

      (db.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([]),
        }),
      });

      await expect(repository.create(newProgram)).rejects.toThrow('Failed to create maintenance program');
    });
  });

  describe('update', () => {
    it('should update and return program', async () => {
      const updateData = { name: 'Updated Program' };
      const updatedProgram: MaintenanceProgram = {
        id: 'program-1',
        name: 'Updated Program',
        description: 'Test Description',
        aircraftModel: 'DJI Mavic 3',
        isDefault: true,
        isActive: true,
        createdAt: Date.now() - 1000,
        updatedAt: Date.now(),
      };

      (db.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([updatedProgram]),
          }),
        }),
      });

      const result = await repository.update('program-1', updateData);

      expect(result).toEqual(updatedProgram);
      expect(db.update).toHaveBeenCalledWith(maintenanceProgram);
    });

    it('should throw error when program not found', async () => {
      (db.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      await expect(repository.update('non-existent', { name: 'Updated' }))
        .rejects.toThrow('Maintenance program with id non-existent not found');
    });
  });

  describe('delete', () => {
    it('should delete program', async () => {
      await expect(repository.delete('program-1')).resolves.toBeUndefined();
      expect(db.delete).toHaveBeenCalledWith(maintenanceProgram);
    });
  });

  describe('list', () => {
    it('should return list with default options', async () => {
      const mockPrograms: MaintenanceProgram[] = [
        {
          id: 'program-1',
          name: 'Program 1',
          description: 'Description 1',
          aircraftModel: 'DJI Mavic 3',
          isDefault: true,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        } as MaintenanceProgram,
      ];

      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          orderBy: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              offset: jest.fn().mockResolvedValue(mockPrograms),
            }),
          }),
          limit: jest.fn().mockReturnValue({
            offset: jest.fn().mockResolvedValue(mockPrograms),
          }),
        }),
      });

      const result = await repository.list();

      expect(result).toEqual(mockPrograms);
    });

    it('should apply aircraftModel filter', async () => {
      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                offset: jest.fn().mockResolvedValue([]),
              }),
            }),
          }),
        }),
      });

      await repository.list({ aircraftModel: 'DJI Mavic 3' });

      expect(db.select).toHaveBeenCalled();
    });

    it('should apply isActive filter', async () => {
      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                offset: jest.fn().mockResolvedValue([]),
              }),
            }),
          }),
        }),
      });

      await repository.list({ isActive: true });

      expect(db.select).toHaveBeenCalled();
    });

    it('should apply custom limit and offset', async () => {
      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          orderBy: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              offset: jest.fn().mockResolvedValue([]),
            }),
          }),
        }),
      });

      await repository.list({ limit: 10, offset: 5 });

      expect(db.select).toHaveBeenCalled();
    });
  });

  describe('count', () => {
    it('should return total count when no filter', async () => {
      const mockPrograms: MaintenanceProgram[] = [
        { id: 'p1', name: 'P1', aircraftModel: 'M1', isActive: true, isDefault: false, createdAt: 1, updatedAt: 1 } as MaintenanceProgram,
        { id: 'p2', name: 'P2', aircraftModel: 'M2', isActive: false, isDefault: false, createdAt: 1, updatedAt: 1 } as MaintenanceProgram,
      ];

      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockResolvedValue(mockPrograms),
      });

      const result = await repository.count();

      expect(result).toBe(2);
    });

    it('should return count of active programs', async () => {
      const mockPrograms: MaintenanceProgram[] = [
        { id: 'p1', name: 'P1', aircraftModel: 'M1', isActive: true, isDefault: false, createdAt: 1, updatedAt: 1 } as MaintenanceProgram,
        { id: 'p2', name: 'P2', aircraftModel: 'M2', isActive: false, isDefault: false, createdAt: 1, updatedAt: 1 } as MaintenanceProgram,
      ];

      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockResolvedValue(mockPrograms),
      });

      const result = await repository.count(true);

      expect(result).toBe(1);
    });

    it('should return count of inactive programs', async () => {
      const mockPrograms: MaintenanceProgram[] = [
        { id: 'p1', name: 'P1', aircraftModel: 'M1', isActive: true, isDefault: false, createdAt: 1, updatedAt: 1 } as MaintenanceProgram,
        { id: 'p2', name: 'P2', aircraftModel: 'M2', isActive: false, isDefault: false, createdAt: 1, updatedAt: 1 } as MaintenanceProgram,
      ];

      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockResolvedValue(mockPrograms),
      });

      const result = await repository.count(false);

      expect(result).toBe(1);
    });

    it('should return zero when no programs', async () => {
      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockResolvedValue([]),
      });

      const result = await repository.count();

      expect(result).toBe(0);
    });
  });
});
