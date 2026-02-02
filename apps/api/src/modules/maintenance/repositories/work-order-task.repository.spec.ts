/**
 * WorkOrderTaskRepository Unit Tests
 *
 * Tests for work order task database operations
 */

import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { WorkOrderTaskRepository } from './work-order-task.repository';
import type { WorkOrderTask, NewWorkOrderTask } from '@repo/db';
import { eq, and } from 'drizzle-orm';

// Mock the db module
jest.mock('@repo/db', () => {
  const mockDb = {
    select: jest.fn(function(this: any) { return this; }),
    insert: jest.fn(function(this: any) { return this; }),
    update: jest.fn(function(this: any) { return this; }),
    delete: jest.fn(function(this: any) { return this; }),
  };

  const workOrderTask = {
    id: 'mock_id',
    workOrderId: 'mock_workOrderId',
    sequence: 'mock_sequence',
    title: 'mock_title',
    description: 'mock_description',
    status: 'mock_status',
    isRii: 'mock_isRii',
    isActive: 'mock_isActive',
    createdAt: 'mock_createdAt',
    updatedAt: 'mock_updatedAt',
  };

  return {
    db: mockDb,
    workOrderTask,
  };
});

import { db, workOrderTask } from '@repo/db';

describe('WorkOrderTaskRepository', () => {
  let repository: WorkOrderTaskRepository;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkOrderTaskRepository],
    }).compile();

    repository = module.get<WorkOrderTaskRepository>(WorkOrderTaskRepository);

    // Default chain mock for select
    (db.select as jest.Mock).mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          orderBy: jest.fn().mockResolvedValue([]),
        }),
        orderBy: jest.fn().mockResolvedValue([]),
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
    it('should return task when found', async () => {
      const mockTask: WorkOrderTask = {
        id: 'task-1',
        workOrderId: 'wo-1',
        sequence: 1,
        title: 'Test Task',
        description: 'Test Description',
        status: 'PENDING',
        isRii: false,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        startedAt: null,
        completedAt: null,
        inspectedBy: null,
        instructions: null,
        result: null,
        notes: null,
        photos: null,
        requiredTools: null,
        requiredParts: null,
      };

      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockTask]),
        }),
      });

      const result = await repository.findById('task-1');

      expect(result).toEqual(mockTask);
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

  describe('findByWorkOrder', () => {
    it('should return tasks for work order', async () => {
      const mockTasks: WorkOrderTask[] = [
        {
          id: 'task-1',
          workOrderId: 'wo-1',
          sequence: 1,
          title: 'Task 1',
          description: 'Description 1',
          status: 'PENDING',
          isRii: false,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          startedAt: null,
          completedAt: null,
          inspectedBy: null,
          instructions: null,
          result: null,
          notes: null,
          photos: null,
          requiredTools: null,
          requiredParts: null,
        },
      ];

      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockResolvedValue(mockTasks),
          }),
        }),
      });

      const result = await repository.findByWorkOrder('wo-1');

      expect(result).toEqual(mockTasks);
    });
  });

  describe('findRiiTasks', () => {
    it('should return RII tasks for work order', async () => {
      const mockTasks: WorkOrderTask[] = [
        {
          id: 'task-1',
          workOrderId: 'wo-1',
          sequence: 1,
          title: 'RII Task',
          description: 'Required inspection',
          status: 'PENDING',
          isRii: true,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          startedAt: null,
          completedAt: null,
          inspectedBy: null,
          instructions: null,
          result: null,
          notes: null,
          photos: null,
          requiredTools: null,
          requiredParts: null,
        },
      ];

      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockResolvedValue(mockTasks),
          }),
        }),
      });

      const result = await repository.findRiiTasks('wo-1');

      expect(result).toEqual(mockTasks);
    });
  });

  describe('create', () => {
    it('should create and return task', async () => {
      const newTask: NewWorkOrderTask = {
        workOrderId: 'wo-1',
        sequence: 1,
        title: 'New Task',
        description: 'New Description',
        status: 'PENDING',
        isRii: false,
      };

      const createdTask: WorkOrderTask = {
        id: 'task-1',
        workOrderId: newTask.workOrderId,
        sequence: newTask.sequence,
        title: newTask.title,
        description: newTask.description ?? null,
        status: newTask.status as string,
        isRii: newTask.isRii ?? false,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        startedAt: null,
        completedAt: null,
        inspectedBy: null,
        instructions: null,
        result: null,
        notes: null,
        photos: null,
        requiredTools: null,
        requiredParts: null,
      } as WorkOrderTask;

      (db.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([createdTask]),
        }),
      });

      const result = await repository.create(newTask);

      expect(result).toEqual(createdTask);
    });

    it('should throw error when creation fails', async () => {
      const newTask: NewWorkOrderTask = {
        workOrderId: 'wo-1',
        sequence: 1,
        title: 'New Task',
        status: 'PENDING',
        isRii: false,
      };

      (db.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([]),
        }),
      });

      await expect(repository.create(newTask)).rejects.toThrow('Failed to create work order task');
    });
  });

  describe('createMany', () => {
    it('should create multiple tasks', async () => {
      const newTasks: NewWorkOrderTask[] = [
        {
          workOrderId: 'wo-1',
          sequence: 1,
          title: 'Task 1',
          status: 'PENDING',
          isRii: false,
        },
        {
          workOrderId: 'wo-1',
          sequence: 2,
          title: 'Task 2',
          status: 'PENDING',
          isRii: false,
        },
      ];

      const createdTasks: WorkOrderTask[] = [
        {
          id: 'task-1',
          workOrderId: 'wo-1',
          sequence: 1,
          title: 'Task 1',
          description: null,
          status: 'PENDING',
          isRii: false,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          startedAt: null,
          completedAt: null,
          inspectedBy: null,
          instructions: null,
          result: null,
          notes: null,
          photos: null,
          requiredTools: null,
          requiredParts: null,
        },
        {
          id: 'task-2',
          workOrderId: 'wo-1',
          sequence: 2,
          title: 'Task 2',
          description: null,
          status: 'PENDING',
          isRii: false,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          startedAt: null,
          completedAt: null,
          inspectedBy: null,
          instructions: null,
          result: null,
          notes: null,
          photos: null,
          requiredTools: null,
          requiredParts: null,
        },
      ];

      (db.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue(createdTasks),
        }),
      });

      const result = await repository.createMany(newTasks);

      expect(result).toEqual(createdTasks);
    });

    it('should return empty array when no tasks created', async () => {
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
    it('should update and return task', async () => {
      const updateData = { title: 'Updated Task' };
      const updatedTask: WorkOrderTask = {
        id: 'task-1',
        workOrderId: 'wo-1',
        sequence: 1,
        title: 'Updated Task',
        description: 'Description',
        status: 'PENDING',
        isRii: false,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        startedAt: null,
        completedAt: null,
        inspectedBy: null,
        instructions: null,
        result: null,
        notes: null,
        photos: null,
        requiredTools: null,
        requiredParts: null,
      };

      (db.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([updatedTask]),
          }),
        }),
      });

      const result = await repository.update('task-1', updateData);

      expect(result).toEqual(updatedTask);
    });

    it('should throw NotFoundException when not found', async () => {
      (db.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      await expect(repository.update('non-existent', { title: 'Updated' }))
        .rejects.toThrow(NotFoundException);
      await expect(repository.update('non-existent', { title: 'Updated' }))
        .rejects.toThrow('Task with id non-existent not found');
    });
  });

  describe('updateStatus', () => {
    it('should update status to IN_PROGRESS with startedAt', async () => {
      const updatedTask: WorkOrderTask = {
        id: 'task-1',
        workOrderId: 'wo-1',
        sequence: 1,
        title: 'Task',
        description: 'Description',
        status: 'IN_PROGRESS',
        isRii: false,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        startedAt: Date.now(),
        completedAt: null,
        inspectedBy: null,
        instructions: null,
        result: null,
        notes: null,
        photos: null,
        requiredTools: null,
        requiredParts: null,
      };

      (db.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([updatedTask]),
          }),
        }),
      });

      const result = await repository.updateStatus('task-1', 'IN_PROGRESS');

      expect(result).toEqual(updatedTask);
      expect(result.status).toBe('IN_PROGRESS');
    });

    it('should update status to COMPLETED with completedAt', async () => {
      const updatedTask: WorkOrderTask = {
        id: 'task-1',
        workOrderId: 'wo-1',
        sequence: 1,
        title: 'Task',
        description: 'Description',
        status: 'COMPLETED',
        isRii: false,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        startedAt: null,
        completedAt: Date.now(),
        inspectedBy: null,
        instructions: null,
        result: null,
        notes: null,
        photos: null,
        requiredTools: null,
        requiredParts: null,
      };

      (db.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([updatedTask]),
          }),
        }),
      });

      const result = await repository.updateStatus('task-1', 'COMPLETED');

      expect(result).toEqual(updatedTask);
      expect(result.status).toBe('COMPLETED');
    });

    it('should throw NotFoundException when not found', async () => {
      (db.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      await expect(repository.updateStatus('non-existent', 'COMPLETED'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('signOffRii', () => {
    it('should sign off RII task', async () => {
      const updatedTask: WorkOrderTask = {
        id: 'task-1',
        workOrderId: 'wo-1',
        sequence: 1,
        title: 'RII Task',
        description: 'Description',
        status: 'COMPLETED',
        isRii: true,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        startedAt: Date.now() - 3600000,
        completedAt: Date.now(),
        inspectedBy: 'inspector-1',
        instructions: null,
        result: null,
        notes: null,
        photos: null,
        requiredTools: null,
        requiredParts: null,
      };

      (db.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([updatedTask]),
          }),
        }),
      });

      const result = await repository.signOffRii('task-1', 'inspector-1');

      expect(result).toEqual(updatedTask);
      expect(result.status).toBe('COMPLETED');
      expect(result.inspectedBy).toBe('inspector-1');
    });

    it('should throw NotFoundException when not found', async () => {
      (db.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      await expect(repository.signOffRii('non-existent', 'inspector-1'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should soft delete task', async () => {
      (db.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(undefined),
        }),
      });

      await expect(repository.delete('task-1')).resolves.toBeUndefined();
      expect(db.update).toHaveBeenCalledWith(workOrderTask);
    });
  });

  describe('deleteByWorkOrder', () => {
    it('should soft delete all tasks for work order', async () => {
      (db.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(undefined),
        }),
      });

      await expect(repository.deleteByWorkOrder('wo-1')).resolves.toBeUndefined();
      expect(db.update).toHaveBeenCalledWith(workOrderTask);
    });
  });
});
