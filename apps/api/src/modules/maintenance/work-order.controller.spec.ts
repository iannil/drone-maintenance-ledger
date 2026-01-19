/**
 * WorkOrderController Unit Tests
 *
 * Tests for work order management endpoints
 */

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';

import { WorkOrderController } from './work-order.controller';
import { WorkOrderService } from './work-order.service';

describe('WorkOrderController', () => {
  let controller: WorkOrderController;
  let workOrderService: jest.Mocked<WorkOrderService>;

  const mockWorkOrder = {
    id: 'wo-123',
    orderNumber: 'WO-2026-001',
    aircraftId: 'aircraft-123',
    type: 'SCHEDULED' as const,
    title: '50小时定检',
    description: '电机定期检查维护',
    reason: '计划性维护',
    status: 'OPEN' as const,
    priority: 'MEDIUM' as const,
    assignedTo: 'user-123',
    assignedAt: null,
    scheduledStart: Date.now(),
    scheduledEnd: Date.now() + 8 * 60 * 60 * 1000,
    actualStart: null,
    actualEnd: null,
    completedBy: null,
    completedAt: null,
    releasedBy: null,
    releasedAt: null,
    completionNotes: null,
    discrepancies: null,
    scheduleId: null,
    aircraftHours: 100,
    aircraftCycles: 200,
    isActive: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const mockTask = {
    id: 'task-123',
    workOrderId: 'wo-123',
    sequence: 1,
    title: '检查电机运转',
    description: '检查电机是否正常运转',
    instructions: '启动电机，观察运转情况',
    status: 'PENDING' as const,
    isRii: false,
    riiSignedBy: null,
    riiSignedAt: null,
    result: null,
    notes: null,
    requiredTools: ['万用表'],
    requiredParts: [],
    isActive: true,
    completedAt: null,
    inspectedBy: null,
    startedAt: null,
    photos: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const mockPart = {
    id: 'part-123',
    workOrderId: 'wo-123',
    componentId: 'component-123',
    partNumber: 'PN-MOT-001',
    partName: '电机',
    quantity: 1,
    unit: '个',
    installedLocation: '前左电机',
    removedComponentId: null,
    removedSerialNumber: null,
    isActive: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  beforeEach(async () => {
    const mockWorkOrderService = {
      findById: jest.fn(),
      findOpen: jest.fn(),
      findByAircraft: jest.fn(),
      findByAssignee: jest.fn(),
      findByStatus: jest.fn(),
      getRecent: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
      assign: jest.fn(),
      start: jest.fn(),
      complete: jest.fn(),
      release: jest.fn(),
      cancel: jest.fn(),
      delete: jest.fn(),
      getTasks: jest.fn(),
      addTask: jest.fn(),
      addTasks: jest.fn(),
      updateTask: jest.fn(),
      updateTaskStatus: jest.fn(),
      signOffRiiTask: jest.fn(),
      deleteTask: jest.fn(),
      getParts: jest.fn(),
      addPart: jest.fn(),
      addParts: jest.fn(),
      deletePart: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkOrderController],
      providers: [{ provide: WorkOrderService, useValue: mockWorkOrderService }],
    }).compile();

    controller = module.get<WorkOrderController>(WorkOrderController);
    workOrderService = module.get(WorkOrderService);
  });

  describe('GET /work-orders/:id', () => {
    it('should return work order by ID', async () => {
      workOrderService.findById.mockResolvedValue(mockWorkOrder);

      const result = await controller.getById('wo-123');

      expect(result).toEqual(mockWorkOrder);
      expect(workOrderService.findById).toHaveBeenCalledWith('wo-123');
    });

    it('should return null for non-existent work order', async () => {
      workOrderService.findById.mockResolvedValue(null);

      const result = await controller.getById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('GET /work-orders', () => {
    it('should return open work orders by default', async () => {
      workOrderService.findOpen.mockResolvedValue([mockWorkOrder]);

      const result = await controller.list();

      expect(result).toEqual([mockWorkOrder]);
      expect(workOrderService.findOpen).toHaveBeenCalledWith(50, 0);
    });

    it('should return open work orders when open parameter is true', async () => {
      workOrderService.findOpen.mockResolvedValue([mockWorkOrder]);

      const result = await controller.list(50, 0, undefined, undefined, undefined, 'true');

      expect(result).toEqual([mockWorkOrder]);
      expect(workOrderService.findOpen).toHaveBeenCalledWith(50, 0);
    });

    it('should return recent work orders when requested', async () => {
      workOrderService.getRecent.mockResolvedValue([mockWorkOrder]);

      const result = await controller.list(10, 0, undefined, undefined, undefined, undefined, 'true');

      expect(result).toEqual([mockWorkOrder]);
      expect(workOrderService.getRecent).toHaveBeenCalledWith(10);
    });

    it('should filter by aircraft when aircraftId provided', async () => {
      workOrderService.findByAircraft.mockResolvedValue([mockWorkOrder]);

      const result = await controller.list(50, 0, 'aircraft-123');

      expect(result).toEqual([mockWorkOrder]);
      expect(workOrderService.findByAircraft).toHaveBeenCalledWith('aircraft-123', 50, 0);
    });

    it('should filter by assignee when assigneeId provided', async () => {
      workOrderService.findByAssignee.mockResolvedValue([mockWorkOrder]);

      const result = await controller.list(50, 0, undefined, 'user-123');

      expect(result).toEqual([mockWorkOrder]);
      expect(workOrderService.findByAssignee).toHaveBeenCalledWith('user-123', 50, 0);
    });

    it('should filter by status when status provided', async () => {
      workOrderService.findByStatus.mockResolvedValue([mockWorkOrder]);

      const result = await controller.list(50, 0, undefined, undefined, 'OPEN');

      expect(result).toEqual([mockWorkOrder]);
      expect(workOrderService.findByStatus).toHaveBeenCalledWith('OPEN', 50, 0);
    });
  });

  describe('POST /work-orders', () => {
    const createDto = {
      aircraftId: 'aircraft-123',
      type: 'SCHEDULED' as const,
      title: '新工单',
      description: '测试工单',
      priority: 'MEDIUM' as const,
    };

    it('should create a new work order', async () => {
      const newWorkOrder = { ...mockWorkOrder, ...createDto, id: 'wo-new', orderNumber: 'WO-2026-002' };
      workOrderService.create.mockResolvedValue(newWorkOrder);

      const result = await controller.create(createDto);

      expect(result).toEqual(newWorkOrder);
      expect(workOrderService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('PUT /work-orders/:id', () => {
    const updateDto = {
      title: '更新后的标题',
      description: '更新后的描述',
    };

    it('should update work order', async () => {
      const updatedWorkOrder = { ...mockWorkOrder, ...updateDto };
      workOrderService.update.mockResolvedValue(updatedWorkOrder);

      const result = await controller.update('wo-123', updateDto);

      expect(result).toEqual(updatedWorkOrder);
      expect(workOrderService.update).toHaveBeenCalledWith('wo-123', updateDto);
    });

    it('should throw NotFoundException for non-existent work order', async () => {
      workOrderService.update.mockRejectedValue(new NotFoundException('Work order not found'));

      await expect(controller.update('non-existent', updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('PUT /work-orders/:id/status', () => {
    it('should update work order status', async () => {
      const updatedWorkOrder = { ...mockWorkOrder, status: 'IN_PROGRESS' as const };
      workOrderService.updateStatus.mockResolvedValue(updatedWorkOrder);

      const result = await controller.updateStatus('wo-123', { status: 'IN_PROGRESS' });

      expect(result).toEqual(updatedWorkOrder);
      expect(workOrderService.updateStatus).toHaveBeenCalledWith('wo-123', 'IN_PROGRESS');
    });
  });

  describe('PUT /work-orders/:id/assign', () => {
    it('should assign work order to user', async () => {
      const assignedWorkOrder = { ...mockWorkOrder, assignedTo: 'user-456' };
      workOrderService.assign.mockResolvedValue(assignedWorkOrder);

      const result = await controller.assign('wo-123', { userId: 'user-456' });

      expect(result).toEqual(assignedWorkOrder);
      expect(workOrderService.assign).toHaveBeenCalledWith('wo-123', 'user-456');
    });
  });

  describe('POST /work-orders/:id/start', () => {
    it('should start work order', async () => {
      const startedWorkOrder = { ...mockWorkOrder, status: 'IN_PROGRESS' as const, actualStart: Date.now() };
      workOrderService.start.mockResolvedValue(startedWorkOrder);

      const result = await controller.start('wo-123');

      expect(result).toEqual(startedWorkOrder);
      expect(workOrderService.start).toHaveBeenCalledWith('wo-123');
    });
  });

  describe('POST /work-orders/:id/complete', () => {
    it('should complete work order', async () => {
      const completedWorkOrder = { ...mockWorkOrder, status: 'COMPLETED' as const, completedBy: 'user-123' };
      workOrderService.complete.mockResolvedValue(completedWorkOrder);

      const mockRequest = { user: { id: 'user-123' } } as any;
      const result = await controller.complete('wo-123', mockRequest, { notes: '完成备注' });

      expect(result).toEqual(completedWorkOrder);
      expect(workOrderService.complete).toHaveBeenCalledWith('wo-123', 'user-123', '完成备注');
    });

    it('should throw ConflictException if RII tasks not signed', async () => {
      workOrderService.complete.mockRejectedValue(new ConflictException('RII tasks not signed'));

      const mockRequest = { user: { id: 'user-123' } } as any;
      await expect(controller.complete('wo-123', mockRequest)).rejects.toThrow(ConflictException);
    });
  });

  describe('POST /work-orders/:id/release', () => {
    it('should release work order', async () => {
      const releasedWorkOrder = { ...mockWorkOrder, status: 'RELEASED' as const, releasedBy: 'inspector-123' };
      workOrderService.release.mockResolvedValue(releasedWorkOrder);

      const mockRequest = { user: { id: 'inspector-123' } } as any;
      const result = await controller.release('wo-123', mockRequest);

      expect(result).toEqual(releasedWorkOrder);
      expect(workOrderService.release).toHaveBeenCalledWith('wo-123', 'inspector-123');
    });
  });

  describe('POST /work-orders/:id/cancel', () => {
    it('should cancel work order', async () => {
      const cancelledWorkOrder = { ...mockWorkOrder, status: 'CANCELLED' as const };
      workOrderService.cancel.mockResolvedValue(cancelledWorkOrder);

      const result = await controller.cancel('wo-123');

      expect(result).toEqual(cancelledWorkOrder);
      expect(workOrderService.cancel).toHaveBeenCalledWith('wo-123');
    });
  });

  describe('DELETE /work-orders/:id', () => {
    it('should delete work order and return success', async () => {
      workOrderService.delete.mockResolvedValue(undefined);

      const result = await controller.delete('wo-123');

      expect(result).toEqual({ success: true, message: 'Work order deleted' });
      expect(workOrderService.delete).toHaveBeenCalledWith('wo-123');
    });
  });

  // Task Management Tests
  describe('GET /work-orders/:id/tasks', () => {
    it('should return tasks for work order', async () => {
      workOrderService.getTasks.mockResolvedValue([mockTask]);

      const result = await controller.getTasks('wo-123');

      expect(result).toEqual([mockTask]);
      expect(workOrderService.getTasks).toHaveBeenCalledWith('wo-123');
    });
  });

  describe('POST /work-orders/:id/tasks', () => {
    const addTaskDto = {
      sequence: 2,
      title: '新任务',
      description: '任务描述',
      isRii: false,
    };

    it('should add task to work order', async () => {
      const newTask = { ...mockTask, ...addTaskDto, id: 'task-new' };
      workOrderService.addTask.mockResolvedValue(newTask);

      const result = await controller.addTask('wo-123', addTaskDto);

      expect(result).toEqual(newTask);
      expect(workOrderService.addTask).toHaveBeenCalledWith('wo-123', addTaskDto);
    });
  });

  describe('POST /work-orders/:id/tasks/batch', () => {
    const tasksDto = {
      tasks: [
        {
          sequence: 2,
          title: '任务1',
          description: '任务描述1',
          isRii: false,
        },
        {
          sequence: 3,
          title: '任务2',
          description: '任务描述2',
          isRii: true,
        },
      ],
    };

    it('should add multiple tasks to work order', async () => {
      const newTasks = [
        { ...mockTask, ...tasksDto.tasks[0], id: 'task-new-1' },
        { ...mockTask, ...tasksDto.tasks[1], id: 'task-new-2' },
      ];
      workOrderService.addTasks.mockResolvedValue(newTasks);

      const result = await controller.addTasks('wo-123', tasksDto);

      expect(result).toEqual(newTasks);
      expect(workOrderService.addTasks).toHaveBeenCalledWith('wo-123', tasksDto.tasks);
    });
  });

  describe('PUT /work-orders/tasks/:taskId', () => {
    const updateTaskDto = {
      title: '更新后的任务标题',
      status: 'COMPLETED' as const,
    };

    it('should update task', async () => {
      const updatedTask = { ...mockTask, ...updateTaskDto };
      workOrderService.updateTask.mockResolvedValue(updatedTask);

      const result = await controller.updateTask('task-123', updateTaskDto);

      expect(result).toEqual(updatedTask);
      expect(workOrderService.updateTask).toHaveBeenCalledWith('task-123', updateTaskDto);
    });
  });

  describe('PUT /work-orders/tasks/:taskId/status', () => {
    it('should update task status', async () => {
      const updatedTask = { ...mockTask, status: 'COMPLETED' as const };
      workOrderService.updateTaskStatus.mockResolvedValue(updatedTask);

      const result = await controller.updateTaskStatus('task-123', { status: 'COMPLETED' });

      expect(result).toEqual(updatedTask);
      expect(workOrderService.updateTaskStatus).toHaveBeenCalledWith('task-123', 'COMPLETED');
    });
  });

  describe('POST /work-orders/tasks/:taskId/sign-off', () => {
    it('should sign off RII task', async () => {
      const signedTask = { ...mockTask, isRii: true, riiSignedBy: 'inspector-123', riiSignedAt: Date.now() };
      workOrderService.signOffRiiTask.mockResolvedValue(signedTask);

      const mockRequest = { user: { id: 'inspector-123' } } as any;
      const result = await controller.signOffRiiTask('task-123', mockRequest);

      expect(result).toEqual(signedTask);
      expect(workOrderService.signOffRiiTask).toHaveBeenCalledWith('task-123', 'inspector-123');
    });
  });

  describe('DELETE /work-orders/tasks/:taskId', () => {
    it('should delete task', async () => {
      workOrderService.deleteTask.mockResolvedValue(undefined);

      const result = await controller.deleteTask('task-123');

      expect(result).toEqual({ success: true, message: 'Task deleted' });
      expect(workOrderService.deleteTask).toHaveBeenCalledWith('task-123');
    });
  });

  // Part Management Tests
  describe('GET /work-orders/:id/parts', () => {
    it('should return parts for work order', async () => {
      workOrderService.getParts.mockResolvedValue([mockPart]);

      const result = await controller.getParts('wo-123');

      expect(result).toEqual([mockPart]);
      expect(workOrderService.getParts).toHaveBeenCalledWith('wo-123');
    });
  });

  describe('POST /work-orders/:id/parts', () => {
    const addPartDto = {
      partNumber: 'PN-NEW-001',
      partName: '新零件',
      quantity: 2,
      unit: '个',
    };

    it('should add part to work order', async () => {
      const newPart = { ...mockPart, ...addPartDto, id: 'part-new' };
      workOrderService.addPart.mockResolvedValue(newPart);

      const result = await controller.addPart('wo-123', addPartDto);

      expect(result).toEqual(newPart);
      expect(workOrderService.addPart).toHaveBeenCalledWith('wo-123', addPartDto);
    });
  });

  describe('POST /work-orders/:id/parts/batch', () => {
    const partsDto = {
      parts: [
        {
          partNumber: 'PN-NEW-001',
          partName: '新零件1',
          quantity: 2,
          unit: '个',
        },
        {
          partNumber: 'PN-NEW-002',
          partName: '新零件2',
          quantity: 1,
          unit: '个',
        },
      ],
    };

    it('should add multiple parts to work order', async () => {
      const newParts = [
        { ...mockPart, ...partsDto.parts[0], id: 'part-new-1' },
        { ...mockPart, ...partsDto.parts[1], id: 'part-new-2' },
      ];
      workOrderService.addParts.mockResolvedValue(newParts);

      const result = await controller.addParts('wo-123', partsDto);

      expect(result).toEqual(newParts);
      expect(workOrderService.addParts).toHaveBeenCalledWith('wo-123', partsDto.parts);
    });
  });

  describe('DELETE /work-orders/parts/:partId', () => {
    it('should delete part', async () => {
      workOrderService.deletePart.mockResolvedValue(undefined);

      const result = await controller.deletePart('part-123');

      expect(result).toEqual({ success: true, message: 'Part deleted' });
      expect(workOrderService.deletePart).toHaveBeenCalledWith('part-123');
    });
  });
});
