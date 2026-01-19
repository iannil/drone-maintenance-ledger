import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';

import { WorkOrderService, CreateWorkOrderDto, UpdateWorkOrderDto, AddTaskDto } from './work-order.service';
import { WorkOrderRepository } from './repositories/work-order.repository';
import { WorkOrderTaskRepository } from './repositories/work-order-task.repository';
import { WorkOrderPartRepository } from './repositories/work-order-part.repository';

describe('WorkOrderService', () => {
  let service: WorkOrderService;
  let workOrderRepo: jest.Mocked<WorkOrderRepository>;
  let taskRepo: jest.Mocked<WorkOrderTaskRepository>;
  let partRepo: jest.Mocked<WorkOrderPartRepository>;

  // Complete mock work order with all required fields
  const mockWorkOrder = {
    id: 'wo-123',
    orderNumber: 'WO-2024-001',
    aircraftId: 'aircraft-123',
    type: 'SCHEDULED',
    title: 'Test Work Order',
    description: 'Test description',
    reason: null,
    status: 'DRAFT',
    priority: 'MEDIUM',
    assignedTo: null,
    assignedAt: null,
    scheduledStart: null,
    scheduledEnd: null,
    actualStart: null,
    actualEnd: null,
    aircraftHours: null,
    aircraftCycles: null,
    completedBy: null,
    completedAt: null,
    releasedBy: null,
    releasedAt: null,
    completionNotes: null,
    discrepancies: null,
    scheduleId: null,
    isActive: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  // Complete mock task with all required fields
  const mockTask = {
    id: 'task-123',
    workOrderId: 'wo-123',
    sequence: 1,
    title: 'Test Task',
    description: 'Test task description',
    instructions: null,
    status: 'PENDING',
    isRii: false,
    inspectedBy: null,
    startedAt: null,
    completedAt: null,
    result: null,
    notes: null,
    photos: null,
    requiredTools: null,
    requiredParts: null,
    isActive: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  // Complete mock part with all required fields
  const mockPart = {
    id: 'part-123',
    workOrderId: 'wo-123',
    componentId: null,
    partNumber: 'PN-001',
    partName: 'Test Part',
    quantity: 1,
    unit: 'EA',
    installedLocation: null,
    removedComponentId: null,
    removedSerialNumber: null,
    isActive: true,
    createdAt: Date.now(),
  };

  beforeEach(async () => {
    const mockWorkOrderRepo = {
      findById: jest.fn(),
      findByAircraft: jest.fn(),
      findByAssignee: jest.fn(),
      findOpen: jest.fn(),
      findByStatus: jest.fn(),
      findRecent: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
      assign: jest.fn(),
      start: jest.fn(),
      complete: jest.fn(),
      release: jest.fn(),
      delete: jest.fn(),
      generateOrderNumber: jest.fn(),
    };

    const mockTaskRepo = {
      findById: jest.fn(),
      findByWorkOrder: jest.fn(),
      findRiiTasks: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
      signOffRii: jest.fn(),
      delete: jest.fn(),
    };

    const mockPartRepo = {
      findById: jest.fn(),
      findByWorkOrder: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkOrderService,
        { provide: WorkOrderRepository, useValue: mockWorkOrderRepo },
        { provide: WorkOrderTaskRepository, useValue: mockTaskRepo },
        { provide: WorkOrderPartRepository, useValue: mockPartRepo },
      ],
    }).compile();

    service = module.get<WorkOrderService>(WorkOrderService);
    workOrderRepo = module.get(WorkOrderRepository);
    taskRepo = module.get(WorkOrderTaskRepository);
    partRepo = module.get(WorkOrderPartRepository);
  });

  describe('findById', () => {
    it('should return work order when found', async () => {
      workOrderRepo.findById.mockResolvedValue(mockWorkOrder);

      const result = await service.findById('wo-123');

      expect(result).toEqual(mockWorkOrder);
      expect(workOrderRepo.findById).toHaveBeenCalledWith('wo-123');
    });

    it('should return null when not found', async () => {
      workOrderRepo.findById.mockResolvedValue(null);

      const result = await service.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    const createDto: CreateWorkOrderDto = {
      aircraftId: 'aircraft-123',
      type: 'SCHEDULED',
      title: 'New Work Order',
    };

    it('should create work order with DRAFT status when no assignee', async () => {
      workOrderRepo.generateOrderNumber.mockResolvedValue('WO-2024-002');
      workOrderRepo.create.mockResolvedValue({ ...mockWorkOrder, status: 'DRAFT' });

      const result = await service.create(createDto);

      expect(result.status).toBe('DRAFT');
      expect(workOrderRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          aircraftId: createDto.aircraftId,
          type: createDto.type,
          title: createDto.title,
          status: 'DRAFT',
          orderNumber: 'WO-2024-002',
        }),
      );
    });

    it('should create work order with OPEN status when assignee is provided', async () => {
      const createWithAssignee = { ...createDto, assignedTo: 'user-123' };
      workOrderRepo.generateOrderNumber.mockResolvedValue('WO-2024-002');
      workOrderRepo.create.mockResolvedValue({ ...mockWorkOrder, status: 'OPEN' });

      await service.create(createWithAssignee);

      expect(workOrderRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'OPEN',
          assignedTo: 'user-123',
        }),
      );
    });
  });

  describe('update', () => {
    const updateDto: UpdateWorkOrderDto = {
      title: 'Updated Title',
      description: 'Updated description',
    };

    it('should update work order successfully', async () => {
      workOrderRepo.findById.mockResolvedValue(mockWorkOrder);
      workOrderRepo.update.mockResolvedValue({ ...mockWorkOrder, ...updateDto });

      const result = await service.update('wo-123', updateDto);

      expect(result.title).toBe('Updated Title');
      expect(workOrderRepo.update).toHaveBeenCalledWith('wo-123', updateDto);
    });

    it('should throw NotFoundException when work order not found', async () => {
      workOrderRepo.findById.mockResolvedValue(null);

      await expect(service.update('non-existent', updateDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when trying to modify released work order', async () => {
      workOrderRepo.findById.mockResolvedValue({ ...mockWorkOrder, status: 'RELEASED' });

      await expect(service.update('wo-123', updateDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('updateStatus', () => {
    it('should update status successfully', async () => {
      workOrderRepo.findById.mockResolvedValue(mockWorkOrder);
      workOrderRepo.updateStatus.mockResolvedValue({ ...mockWorkOrder, status: 'OPEN' });

      const result = await service.updateStatus('wo-123', 'OPEN');

      expect(result.status).toBe('OPEN');
      expect(workOrderRepo.updateStatus).toHaveBeenCalledWith('wo-123', 'OPEN');
    });

    it('should throw ConflictException when modifying released work order', async () => {
      workOrderRepo.findById.mockResolvedValue({ ...mockWorkOrder, status: 'RELEASED' });

      await expect(service.updateStatus('wo-123', 'OPEN')).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException when reopening cancelled work order', async () => {
      workOrderRepo.findById.mockResolvedValue({ ...mockWorkOrder, status: 'CANCELLED' });

      await expect(service.updateStatus('wo-123', 'OPEN')).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException when work order not found', async () => {
      workOrderRepo.findById.mockResolvedValue(null);

      await expect(service.updateStatus('non-existent', 'OPEN')).rejects.toThrow(NotFoundException);
    });
  });

  describe('assign', () => {
    it('should assign work order successfully', async () => {
      workOrderRepo.findById.mockResolvedValue(mockWorkOrder);
      workOrderRepo.assign.mockResolvedValue({ ...mockWorkOrder, assignedTo: 'user-123' });

      const result = await service.assign('wo-123', 'user-123');

      expect(result.assignedTo).toBe('user-123');
      expect(workOrderRepo.assign).toHaveBeenCalledWith('wo-123', 'user-123');
    });

    it('should throw ConflictException when assigning released work order', async () => {
      workOrderRepo.findById.mockResolvedValue({ ...mockWorkOrder, status: 'RELEASED' });

      await expect(service.assign('wo-123', 'user-123')).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException when work order not found', async () => {
      workOrderRepo.findById.mockResolvedValue(null);

      await expect(service.assign('non-existent', 'user-123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('complete', () => {
    it('should complete work order when all RII tasks are completed', async () => {
      workOrderRepo.findById.mockResolvedValue({ ...mockWorkOrder, status: 'IN_PROGRESS' });
      taskRepo.findRiiTasks.mockResolvedValue([{ ...mockTask, isRii: true, status: 'COMPLETED' }]);
      workOrderRepo.complete.mockResolvedValue({ ...mockWorkOrder, status: 'COMPLETED' });

      const result = await service.complete('wo-123', 'user-123', 'Completed successfully');

      expect(result.status).toBe('COMPLETED');
      expect(workOrderRepo.complete).toHaveBeenCalledWith('wo-123', 'user-123', 'Completed successfully');
    });

    it('should throw ConflictException when RII tasks are pending', async () => {
      workOrderRepo.findById.mockResolvedValue({ ...mockWorkOrder, status: 'IN_PROGRESS' });
      taskRepo.findRiiTasks.mockResolvedValue([{ ...mockTask, isRii: true, status: 'PENDING' }]);

      await expect(service.complete('wo-123', 'user-123')).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException when work order not found', async () => {
      workOrderRepo.findById.mockResolvedValue(null);

      await expect(service.complete('non-existent', 'user-123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('release', () => {
    it('should release completed work order', async () => {
      workOrderRepo.findById.mockResolvedValue({ ...mockWorkOrder, status: 'COMPLETED' });
      workOrderRepo.release.mockResolvedValue({ ...mockWorkOrder, status: 'RELEASED' });

      const result = await service.release('wo-123', 'inspector-123');

      expect(result.status).toBe('RELEASED');
      expect(workOrderRepo.release).toHaveBeenCalledWith('wo-123', 'inspector-123');
    });

    it('should throw ConflictException when releasing non-completed work order', async () => {
      workOrderRepo.findById.mockResolvedValue({ ...mockWorkOrder, status: 'IN_PROGRESS' });

      await expect(service.release('wo-123', 'inspector-123')).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException when work order not found', async () => {
      workOrderRepo.findById.mockResolvedValue(null);

      await expect(service.release('non-existent', 'inspector-123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete draft work order', async () => {
      workOrderRepo.findById.mockResolvedValue({ ...mockWorkOrder, status: 'DRAFT' });
      workOrderRepo.delete.mockResolvedValue(undefined);

      await expect(service.delete('wo-123')).resolves.toBeUndefined();
      expect(workOrderRepo.delete).toHaveBeenCalledWith('wo-123');
    });

    it('should throw ConflictException when deleting active work order', async () => {
      workOrderRepo.findById.mockResolvedValue({ ...mockWorkOrder, status: 'IN_PROGRESS' });

      await expect(service.delete('wo-123')).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException when work order not found', async () => {
      workOrderRepo.findById.mockResolvedValue(null);

      await expect(service.delete('non-existent')).rejects.toThrow(NotFoundException);
      await expect(service.delete('non-existent')).rejects.toThrow('Work order not found');
    });
  });

  // Task Management Tests
  describe('getTasks', () => {
    it('should return tasks for work order', async () => {
      taskRepo.findByWorkOrder.mockResolvedValue([mockTask]);

      const result = await service.getTasks('wo-123');

      expect(result).toHaveLength(1);
      expect(taskRepo.findByWorkOrder).toHaveBeenCalledWith('wo-123');
    });
  });

  describe('addTask', () => {
    const taskDto: AddTaskDto = {
      sequence: 1,
      title: 'New Task',
      description: 'New task description',
    };

    it('should add task to work order', async () => {
      workOrderRepo.findById.mockResolvedValue(mockWorkOrder);
      taskRepo.create.mockResolvedValue(mockTask);

      const result = await service.addTask('wo-123', taskDto);

      expect(result).toEqual(mockTask);
      expect(taskRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          workOrderId: 'wo-123',
          status: 'PENDING',
        }),
      );
    });

    it('should throw NotFoundException when work order not found', async () => {
      workOrderRepo.findById.mockResolvedValue(null);

      await expect(service.addTask('non-existent', taskDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateTaskStatus', () => {
    it('should update task status', async () => {
      taskRepo.findById.mockResolvedValue(mockTask);
      taskRepo.updateStatus.mockResolvedValue({ ...mockTask, status: 'COMPLETED' });

      const result = await service.updateTaskStatus('task-123', 'COMPLETED');

      expect(result.status).toBe('COMPLETED');
    });

    it('should throw ConflictException when completing RII task directly', async () => {
      taskRepo.findById.mockResolvedValue({ ...mockTask, isRii: true });

      await expect(service.updateTaskStatus('task-123', 'COMPLETED')).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException when task not found', async () => {
      taskRepo.findById.mockResolvedValue(null);

      await expect(service.updateTaskStatus('non-existent', 'COMPLETED')).rejects.toThrow(NotFoundException);
      await expect(service.updateTaskStatus('non-existent', 'COMPLETED')).rejects.toThrow('Task not found');
    });
  });

  describe('signOffRiiTask', () => {
    it('should sign off RII task', async () => {
      const riiTask = { ...mockTask, isRii: true };
      taskRepo.findById.mockResolvedValue(riiTask);
      taskRepo.signOffRii.mockResolvedValue({ ...riiTask, status: 'COMPLETED' });

      const result = await service.signOffRiiTask('task-123', 'inspector-123');

      expect(result.status).toBe('COMPLETED');
      expect(taskRepo.signOffRii).toHaveBeenCalledWith('task-123', 'inspector-123');
    });

    it('should throw ConflictException when signing off non-RII task', async () => {
      taskRepo.findById.mockResolvedValue(mockTask);

      await expect(service.signOffRiiTask('task-123', 'inspector-123')).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException when task not found', async () => {
      taskRepo.findById.mockResolvedValue(null);

      await expect(service.signOffRiiTask('non-existent', 'inspector-123')).rejects.toThrow(NotFoundException);
      await expect(service.signOffRiiTask('non-existent', 'inspector-123')).rejects.toThrow('Task not found');
    });
  });

  // Part Management Tests
  describe('getParts', () => {
    it('should return parts for work order', async () => {
      partRepo.findByWorkOrder.mockResolvedValue([mockPart]);

      const result = await service.getParts('wo-123');

      expect(result).toHaveLength(1);
      expect(partRepo.findByWorkOrder).toHaveBeenCalledWith('wo-123');
    });
  });

  describe('addPart', () => {
    const partDto = {
      partNumber: 'PN-002',
      partName: 'New Part',
      quantity: 2,
      unit: 'EA',
    };

    it('should add part to work order', async () => {
      workOrderRepo.findById.mockResolvedValue(mockWorkOrder);
      partRepo.create.mockResolvedValue(mockPart);

      const result = await service.addPart('wo-123', partDto);

      expect(result).toEqual(mockPart);
      expect(partRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          workOrderId: 'wo-123',
        }),
      );
    });
  });

  describe('deletePart', () => {
    it('should delete part successfully', async () => {
      partRepo.findById.mockResolvedValue(mockPart);
      partRepo.delete.mockResolvedValue(undefined);

      await expect(service.deletePart('part-123')).resolves.toBeUndefined();
      expect(partRepo.delete).toHaveBeenCalledWith('part-123');
    });

    it('should throw NotFoundException when part not found', async () => {
      partRepo.findById.mockResolvedValue(null);

      await expect(service.deletePart('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  // Query Methods Tests
  describe('findByAircraft', () => {
    it('should return work orders for aircraft with default pagination', async () => {
      workOrderRepo.findByAircraft.mockResolvedValue([mockWorkOrder]);

      const result = await service.findByAircraft('aircraft-123');

      expect(result).toEqual([mockWorkOrder]);
      expect(workOrderRepo.findByAircraft).toHaveBeenCalledWith('aircraft-123', 50, 0);
    });

    it('should return work orders for aircraft with custom pagination', async () => {
      workOrderRepo.findByAircraft.mockResolvedValue([mockWorkOrder]);

      const result = await service.findByAircraft('aircraft-123', 10, 5);

      expect(result).toEqual([mockWorkOrder]);
      expect(workOrderRepo.findByAircraft).toHaveBeenCalledWith('aircraft-123', 10, 5);
    });
  });

  describe('findByAssignee', () => {
    it('should return work orders for assignee with default pagination', async () => {
      workOrderRepo.findByAssignee.mockResolvedValue([mockWorkOrder]);

      const result = await service.findByAssignee('user-123');

      expect(result).toEqual([mockWorkOrder]);
      expect(workOrderRepo.findByAssignee).toHaveBeenCalledWith('user-123', 50, 0);
    });

    it('should return work orders for assignee with custom pagination', async () => {
      workOrderRepo.findByAssignee.mockResolvedValue([mockWorkOrder]);

      const result = await service.findByAssignee('user-123', 10, 5);

      expect(result).toEqual([mockWorkOrder]);
      expect(workOrderRepo.findByAssignee).toHaveBeenCalledWith('user-123', 10, 5);
    });
  });

  describe('findOpen', () => {
    it('should return open work orders with default pagination', async () => {
      const openOrders = [{ ...mockWorkOrder, status: 'OPEN' }];
      workOrderRepo.findOpen.mockResolvedValue(openOrders as any);

      const result = await service.findOpen();

      expect(result).toEqual(openOrders);
      expect(workOrderRepo.findOpen).toHaveBeenCalledWith(50, 0);
    });

    it('should return open work orders with custom pagination', async () => {
      workOrderRepo.findOpen.mockResolvedValue([mockWorkOrder]);

      const result = await service.findOpen(10, 5);

      expect(result).toEqual([mockWorkOrder]);
      expect(workOrderRepo.findOpen).toHaveBeenCalledWith(10, 5);
    });
  });

  describe('findByStatus', () => {
    it('should return work orders by status', async () => {
      const inProgressOrders = [{ ...mockWorkOrder, status: 'IN_PROGRESS' }];
      workOrderRepo.findByStatus.mockResolvedValue(inProgressOrders as any);

      const result = await service.findByStatus('IN_PROGRESS');

      expect(result).toEqual(inProgressOrders);
      expect(workOrderRepo.findByStatus).toHaveBeenCalledWith('IN_PROGRESS', 50, 0);
    });

    it('should return work orders by status with custom pagination', async () => {
      workOrderRepo.findByStatus.mockResolvedValue([mockWorkOrder]);

      const result = await service.findByStatus('COMPLETED', 10, 5);

      expect(result).toEqual([mockWorkOrder]);
      expect(workOrderRepo.findByStatus).toHaveBeenCalledWith('COMPLETED', 10, 5);
    });
  });

  describe('getRecent', () => {
    it('should return recent work orders with default limit', async () => {
      workOrderRepo.findRecent.mockResolvedValue([mockWorkOrder]);

      const result = await service.getRecent();

      expect(result).toEqual([mockWorkOrder]);
      expect(workOrderRepo.findRecent).toHaveBeenCalledWith(20);
    });

    it('should return recent work orders with custom limit', async () => {
      workOrderRepo.findRecent.mockResolvedValue([mockWorkOrder]);

      const result = await service.getRecent(10);

      expect(result).toEqual([mockWorkOrder]);
      expect(workOrderRepo.findRecent).toHaveBeenCalledWith(10);
    });
  });

  // Status Transition Tests
  describe('start', () => {
    it('should start work order successfully', async () => {
      workOrderRepo.findById.mockResolvedValue({ ...mockWorkOrder, status: 'OPEN' });
      workOrderRepo.start.mockResolvedValue({ ...mockWorkOrder, status: 'IN_PROGRESS' });

      const result = await service.start('wo-123');

      expect(result.status).toBe('IN_PROGRESS');
      expect(workOrderRepo.start).toHaveBeenCalledWith('wo-123');
    });

    it('should throw NotFoundException when work order not found', async () => {
      workOrderRepo.findById.mockResolvedValue(null);

      await expect(service.start('non-existent')).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when starting released work order', async () => {
      workOrderRepo.findById.mockResolvedValue({ ...mockWorkOrder, status: 'RELEASED' });

      await expect(service.start('wo-123')).rejects.toThrow(ConflictException);
      await expect(service.start('wo-123')).rejects.toThrow('Cannot start a released work order');
    });
  });

  describe('cancel', () => {
    it('should cancel work order successfully', async () => {
      workOrderRepo.findById.mockResolvedValue({ ...mockWorkOrder, status: 'OPEN' });
      workOrderRepo.updateStatus.mockResolvedValue({ ...mockWorkOrder, status: 'CANCELLED' });

      const result = await service.cancel('wo-123');

      expect(result.status).toBe('CANCELLED');
      expect(workOrderRepo.updateStatus).toHaveBeenCalledWith('wo-123', 'CANCELLED');
    });

    it('should throw NotFoundException when work order not found', async () => {
      workOrderRepo.findById.mockResolvedValue(null);

      await expect(service.cancel('non-existent')).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when cancelling released work order', async () => {
      workOrderRepo.findById.mockResolvedValue({ ...mockWorkOrder, status: 'RELEASED' });

      await expect(service.cancel('wo-123')).rejects.toThrow(ConflictException);
      await expect(service.cancel('wo-123')).rejects.toThrow('Cannot cancel a released work order');
    });
  });

  // Task Management Additional Tests
  describe('addTasks', () => {
    const tasksDtos: AddTaskDto[] = [
      { sequence: 1, title: 'Task 1', description: 'First task' },
      { sequence: 2, title: 'Task 2', description: 'Second task' },
    ];

    it('should add multiple tasks to work order', async () => {
      workOrderRepo.findById.mockResolvedValue(mockWorkOrder);
      taskRepo.createMany.mockResolvedValue([mockTask, { ...mockTask, id: 'task-456' }] as any);

      const result = await service.addTasks('wo-123', tasksDtos);

      expect(result).toHaveLength(2);
      expect(taskRepo.createMany).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ workOrderId: 'wo-123', status: 'PENDING' }),
        ]),
      );
    });

    it('should throw NotFoundException when work order not found', async () => {
      workOrderRepo.findById.mockResolvedValue(null);

      await expect(service.addTasks('non-existent', tasksDtos)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateTask', () => {
    const updateDto = {
      title: 'Updated Task',
      description: 'Updated description',
    };

    it('should update task successfully', async () => {
      taskRepo.findById.mockResolvedValue(mockTask);
      taskRepo.update.mockResolvedValue({ ...mockTask, ...updateDto });

      const result = await service.updateTask('task-123', updateDto);

      expect(result.title).toBe('Updated Task');
      expect(taskRepo.update).toHaveBeenCalledWith('task-123', updateDto);
    });

    it('should throw NotFoundException when task not found', async () => {
      taskRepo.findById.mockResolvedValue(null);

      await expect(service.updateTask('non-existent', updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteTask', () => {
    it('should delete task successfully', async () => {
      taskRepo.findById.mockResolvedValue(mockTask);
      taskRepo.delete.mockResolvedValue(undefined);

      await expect(service.deleteTask('task-123')).resolves.toBeUndefined();
      expect(taskRepo.delete).toHaveBeenCalledWith('task-123');
    });

    it('should throw NotFoundException when task not found', async () => {
      taskRepo.findById.mockResolvedValue(null);

      await expect(service.deleteTask('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  // Part Management Additional Tests
  describe('addParts', () => {
    const partsDtos = [
      { partNumber: 'PN-001', partName: 'Part 1', quantity: 1, unit: 'EA' },
      { partNumber: 'PN-002', partName: 'Part 2', quantity: 2, unit: 'EA' },
    ];

    it('should add multiple parts to work order', async () => {
      workOrderRepo.findById.mockResolvedValue(mockWorkOrder);
      partRepo.createMany.mockResolvedValue([mockPart, { ...mockPart, id: 'part-456' }] as any);

      const result = await service.addParts('wo-123', partsDtos);

      expect(result).toHaveLength(2);
      expect(partRepo.createMany).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ workOrderId: 'wo-123' }),
        ]),
      );
    });

    it('should throw NotFoundException when work order not found', async () => {
      workOrderRepo.findById.mockResolvedValue(null);

      await expect(service.addParts('non-existent', partsDtos)).rejects.toThrow(NotFoundException);
    });
  });
});
