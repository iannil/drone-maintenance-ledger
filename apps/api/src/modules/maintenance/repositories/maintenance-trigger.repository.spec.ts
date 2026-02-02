/**
 * MaintenanceTriggerRepository Unit Tests
 *
 * Tests for maintenance trigger database operations
 */

import { Test, TestingModule } from '@nestjs/testing';

import { MaintenanceTriggerRepository } from './maintenance-trigger.repository';
import type { MaintenanceTrigger, NewMaintenanceTrigger } from '@repo/db';
import { eq, and, desc } from 'drizzle-orm';

// Mock the db module
jest.mock('@repo/db', () => {
  const mockDb = {
    select: jest.fn(function(this: any) { return this; }),
    insert: jest.fn(function(this: any) { return this; }),
    update: jest.fn(function(this: any) { return this; }),
    delete: jest.fn(function(this: any) { return this; }),
  };

  const maintenanceTrigger = {
    id: 'mock_id',
    programId: 'mock_programId',
    type: 'mock_type',
    description: 'mock_description',
    priority: 'mock_priority',
    intervalValue: 'mock_intervalValue',
    isActive: 'mock_isActive',
    createdAt: 'mock_createdAt',
    updatedAt: 'mock_updatedAt',
    name: 'mock_name',
    applicableComponentType: 'mock_applicableComponentType',
    applicableComponentLocation: 'mock_applicableComponentLocation',
    requiredRole: 'mock_requiredRole',
    isRii: 'mock_isRii',
  };

  return {
    db: mockDb,
    maintenanceTrigger,
  };
});

import { db, maintenanceTrigger } from '@repo/db';

describe('MaintenanceTriggerRepository', () => {
  let repository: MaintenanceTriggerRepository;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [MaintenanceTriggerRepository],
    }).compile();

    repository = module.get<MaintenanceTriggerRepository>(MaintenanceTriggerRepository);

    // Default chain mock for select
    (db.select as jest.Mock).mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          orderBy: jest.fn().mockResolvedValue([]),
        }),
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
    it('should return trigger when found', async () => {
      const mockTrigger: MaintenanceTrigger = {
        id: 'trigger-1',
        programId: 'program-1',
        type: 'FLIGHT_HOURS',
        name: 'Check after 100 hours',
        description: 'Check after 100 flight hours',
        priority: 'MEDIUM',
        intervalValue: 100,
        applicableComponentType: null,
        applicableComponentLocation: null,
        requiredRole: 'INSPECTOR',
        isRii: false,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      } as any;

      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockTrigger]),
        }),
      });

      const result = await repository.findById('trigger-1');

      expect(result).toEqual(mockTrigger);
    });

    it('should return null when not found', async () => {
      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });

      const result = await repository.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findByProgramId', () => {
    it('should return triggers for program', async () => {
      const mockTriggers: MaintenanceTrigger[] = [
        {
          id: 'trigger-1',
          programId: 'program-1',
          type: 'FLIGHT_HOURS',
          name: 'Check after 100 hours',
          description: 'Check after 100 flight hours',
          priority: 'MEDIUM',
          intervalValue: 100,
          applicableComponentType: null,
          applicableComponentLocation: null,
          requiredRole: 'INSPECTOR',
          isRii: false,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        } as any,
      ];

      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockResolvedValue(mockTriggers),
          }),
        }),
      });

      const result = await repository.findByProgramId('program-1');

      expect(result).toEqual(mockTriggers);
    });
  });

  describe('findByType', () => {
    it('should return triggers by type', async () => {
      const mockTriggers: MaintenanceTrigger[] = [
        {
          id: 'trigger-1',
          programId: 'program-1',
          type: 'FLIGHT_HOURS',
          description: 'Check after 100 hours',
          priority: "MEDIUM" as any,
          intervalValue: 100,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        } as any,
      ];

      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(mockTriggers),
        }),
      });

      const result = await repository.findByType('FLIGHT_HOURS');

      expect(result).toEqual(mockTriggers);
    });
  });

  describe('create', () => {
    it('should create and return trigger', async () => {
      const newTrigger: NewMaintenanceTrigger = {
        programId: 'program-1',
        type: 'FLIGHT_HOURS',
        name: 'Check after 100 hours',
        description: 'Check after 100 flight hours',
        priority: 'MEDIUM',
        intervalValue: 100,
        applicableComponentType: null,
        applicableComponentLocation: null,
        requiredRole: 'INSPECTOR',
        isRii: false,
        isActive: true,
      };

      const createdTrigger: MaintenanceTrigger = {
        id: 'trigger-1',
        programId: newTrigger.programId,
        type: newTrigger.type,
        name: newTrigger.name,
        description: newTrigger.description ?? null,
        priority: newTrigger.priority,
        intervalValue: newTrigger.intervalValue,
        applicableComponentType: newTrigger.applicableComponentType,
        applicableComponentLocation: newTrigger.applicableComponentLocation,
        requiredRole: newTrigger.requiredRole,
        isRii: newTrigger.isRii,
        isActive: newTrigger.isActive ?? true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      } as MaintenanceTrigger;

      (db.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([createdTrigger]),
        }),
      });

      const result = await repository.create(newTrigger);

      expect(result).toEqual(createdTrigger);
    });

    it('should throw error when creation fails', async () => {
      const newTrigger: NewMaintenanceTrigger = {
        programId: 'program-1',
        type: 'FLIGHT_HOURS',
        name: 'Check after 100 hours',
        description: 'Check after 100 flight hours',
        priority: 'MEDIUM',
        intervalValue: 100,
        applicableComponentType: null,
        applicableComponentLocation: null,
        requiredRole: 'INSPECTOR',
        isRii: false,
        isActive: true,
      };

      (db.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([]),
        }),
      });

      await expect(repository.create(newTrigger)).rejects.toThrow('Failed to create maintenance trigger');
    });
  });

  describe('createMany', () => {
    it('should create multiple triggers', async () => {
      const newTriggers: NewMaintenanceTrigger[] = [
        {
          programId: 'program-1',
          type: 'FLIGHT_HOURS',
          name: 'Check after 100 hours',
          description: 'Check after 100 flight hours',
          priority: 'MEDIUM',
          intervalValue: 100,
          applicableComponentType: null,
          applicableComponentLocation: null,
          requiredRole: 'INSPECTOR',
          isRii: false,
          isActive: true,
        },
        {
          programId: 'program-1',
          type: 'CALENDAR_DAYS',
          name: 'Check after 30 days',
          description: 'Check after 30 calendar days',
          priority: 'MEDIUM',
          intervalValue: 30,
          applicableComponentType: null,
          applicableComponentLocation: null,
          requiredRole: 'INSPECTOR',
          isRii: false,
          isActive: true,
        },
      ];

      const createdTriggers: MaintenanceTrigger[] = [
        {
          id: 'trigger-1',
          programId: 'program-1',
          type: 'FLIGHT_HOURS',
          name: 'Check after 100 hours',
          description: 'Check after 100 flight hours',
          priority: 'MEDIUM',
          intervalValue: 100,
          applicableComponentType: null,
          applicableComponentLocation: null,
          requiredRole: 'INSPECTOR',
          isRii: false,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        } as MaintenanceTrigger,
        {
          id: 'trigger-2',
          programId: 'program-1',
          type: 'CALENDAR_DAYS',
          name: 'Check after 30 days',
          description: 'Check after 30 calendar days',
          priority: 'MEDIUM',
          intervalValue: 30,
          applicableComponentType: null,
          applicableComponentLocation: null,
          requiredRole: 'INSPECTOR',
          isRii: false,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        } as MaintenanceTrigger,
      ];

      (db.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue(createdTriggers),
        }),
      });

      const result = await repository.createMany(newTriggers);

      expect(result).toEqual(createdTriggers);
    });

    it('should return empty array when input is empty', async () => {
      const result = await repository.createMany([]);

      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update and return trigger', async () => {
      const updateData = { description: 'Updated description' };
      const updatedTrigger: MaintenanceTrigger = {
        id: 'trigger-1',
        programId: 'program-1',
        type: 'FLIGHT_HOURS',
        name: 'Check after 100 hours',
        description: 'Updated description',
        priority: 'MEDIUM',
        intervalValue: 100,
        applicableComponentType: null,
        applicableComponentLocation: null,
        requiredRole: 'INSPECTOR',
        isRii: false,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      } as MaintenanceTrigger;

      (db.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([updatedTrigger]),
          }),
        }),
      });

      const result = await repository.update('trigger-1', updateData);

      expect(result).toEqual(updatedTrigger);
    });

    it('should throw error when not found', async () => {
      (db.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      await expect(repository.update('non-existent', { description: 'Updated' }))
        .rejects.toThrow('Maintenance trigger with id non-existent not found');
    });
  });

  describe('delete', () => {
    it('should delete trigger', async () => {
      await expect(repository.delete('trigger-1')).resolves.toBeUndefined();
      expect(db.delete).toHaveBeenCalledWith(maintenanceTrigger);
    });
  });

  describe('deleteByProgramId', () => {
    it('should delete triggers by program', async () => {
      await expect(repository.deleteByProgramId('program-1')).resolves.toBeUndefined();
      expect(db.delete).toHaveBeenCalledWith(maintenanceTrigger);
    });
  });

  describe('list', () => {
    it('should return list with default options', async () => {
      const mockTriggers: MaintenanceTrigger[] = [
        {
          id: 'trigger-1',
          programId: 'program-1',
          type: 'FLIGHT_HOURS',
          description: 'Check after 100 hours',
          priority: "MEDIUM" as any,
          intervalValue: 100,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        } as any,
      ];

      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          orderBy: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              offset: jest.fn().mockResolvedValue(mockTriggers),
            }),
          }),
          limit: jest.fn().mockReturnValue({
            offset: jest.fn().mockResolvedValue(mockTriggers),
          }),
        }),
      });

      const result = await repository.list();

      expect(result).toEqual(mockTriggers);
    });

    it('should apply programId filter', async () => {
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

      await repository.list({ programId: 'program-1' });

      expect(db.select).toHaveBeenCalled();
    });

    it('should apply type filter', async () => {
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

      await repository.list({ type: 'FLIGHT_HOURS' });

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
});
