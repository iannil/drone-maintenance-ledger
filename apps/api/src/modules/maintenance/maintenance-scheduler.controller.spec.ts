/**
 * MaintenanceSchedulerController Unit Tests
 *
 * Tests for maintenance scheduling endpoints
 */

import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';

import { MaintenanceSchedulerController } from './maintenance-scheduler.controller';
import { MaintenanceSchedulerService } from './maintenance-scheduler.service';
import { TriggerCalculationService } from './trigger-calculation.service';
import { MaintenanceProgramRepository } from './repositories/maintenance-program.repository';
import { MaintenanceTriggerRepository } from './repositories/maintenance-trigger.repository';
import { MaintenanceScheduleRepository } from './repositories/maintenance-schedule.repository';

describe('MaintenanceSchedulerController', () => {
  let controller: MaintenanceSchedulerController;
  let schedulerService: jest.Mocked<MaintenanceSchedulerService>;
  let calcService: jest.Mocked<TriggerCalculationService>;
  let programRepo: jest.Mocked<MaintenanceProgramRepository>;
  let triggerRepo: jest.Mocked<MaintenanceTriggerRepository>;
  let scheduleRepo: jest.Mocked<MaintenanceScheduleRepository>;

  const mockProgram = {
    id: 'program-123',
    name: 'M300 RTK 标准维保程序',
    code: 'M300-STD-2024',
    aircraftModel: 'M300 RTK',
    description: '标准维保程序',
    isDefault: true,
    isActive: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const mockTrigger = {
    id: 'trigger-123',
    programId: 'program-123',
    type: 'FLIGHT_HOURS' as const,
    name: '50小时定检',
    description: '每50飞行小时进行检查',
    intervalValue: 50,
    warningThreshold: 45,
    priority: 'MEDIUM',
    applicableComponentType: null,
    applicableComponentLocation: null,
    requiredRole: 'MECHANIC',
    isRii: false,
    isActive: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const mockSchedule = {
    id: 'schedule-123',
    aircraftId: 'aircraft-123',
    triggerId: 'trigger-123',
    status: 'ACTIVE' as const,
    dueDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
    dueAtValue: 50,
    lastCompletedAt: null,
    lastCompletedAtValue: null,
    workOrderId: null,
    assignedTo: null,
    isActive: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const mockAlert = {
    scheduleId: 'schedule-123',
    aircraftId: 'aircraft-123',
    type: 'WARNING' as const,
    triggerName: '50小时定检',
    message: '即将到期：还剩5飞行小时',
  };

  beforeEach(async () => {
    const mockSchedulerService = {
      runScheduler: jest.fn(),
      createWorkOrdersForDueSchedules: jest.fn(),
      getAlerts: jest.fn(),
      initializeAircraftSchedules: jest.fn(),
      completeSchedule: jest.fn(),
    };

    const mockCalcService = {
      calculateTrigger: jest.fn(),
    };

    const mockProgramRepo = {
      list: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      findDefaultForModel: jest.fn(),
    };

    const mockTriggerRepo = {
      list: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      findByProgramId: jest.fn(),
    };

    const mockScheduleRepo = {
      list: jest.fn(),
      findById: jest.fn(),
      findByAircraftId: jest.fn(),
      findDueOrOverdue: jest.fn(),
      findDueWithinDays: jest.fn(),
      countByStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MaintenanceSchedulerController],
      providers: [
        { provide: MaintenanceSchedulerService, useValue: mockSchedulerService },
        { provide: TriggerCalculationService, useValue: mockCalcService },
        { provide: MaintenanceProgramRepository, useValue: mockProgramRepo },
        { provide: MaintenanceTriggerRepository, useValue: mockTriggerRepo },
        { provide: MaintenanceScheduleRepository, useValue: mockScheduleRepo },
      ],
    }).compile();

    controller = module.get<MaintenanceSchedulerController>(MaintenanceSchedulerController);
    schedulerService = module.get(MaintenanceSchedulerService);
    calcService = module.get(TriggerCalculationService);
    programRepo = module.get(MaintenanceProgramRepository);
    triggerRepo = module.get(MaintenanceTriggerRepository);
    scheduleRepo = module.get(MaintenanceScheduleRepository);
  });

  // ==================== Scheduler Operations ====================

  describe('POST /maintenance-scheduler/run', () => {
    it('should run scheduler and return results', async () => {
      const runResult = { checked: 100, updated: 5, alerts: 3 };
      schedulerService.runScheduler.mockResolvedValue(runResult as any);

      const result = await controller.runScheduler();

      expect(result).toEqual(runResult);
      expect(schedulerService.runScheduler).toHaveBeenCalled();
    });
  });

  describe('POST /maintenance-scheduler/create-work-orders', () => {
    it('should create work orders for due schedules', async () => {
      const mockWorkOrders = [{ id: 'wo-1' }, { id: 'wo-2' }];
      schedulerService.createWorkOrdersForDueSchedules.mockResolvedValue(mockWorkOrders as any);

      const result = await controller.createWorkOrders({ autoAssign: true });

      expect(result).toEqual({ created: 2, workOrders: mockWorkOrders });
      expect(schedulerService.createWorkOrdersForDueSchedules).toHaveBeenCalledWith(true);
    });

    it('should work without autoAssign option', async () => {
      schedulerService.createWorkOrdersForDueSchedules.mockResolvedValue([]);

      const result = await controller.createWorkOrders({});

      expect(result).toEqual({ created: 0, workOrders: [] });
      expect(schedulerService.createWorkOrdersForDueSchedules).toHaveBeenCalledWith(undefined);
    });
  });

  describe('GET /maintenance-scheduler/alerts', () => {
    it('should return alerts', async () => {
      schedulerService.getAlerts.mockResolvedValue([mockAlert] as any);

      const result = await controller.getAlerts();

      expect(result).toEqual([mockAlert]);
      expect(schedulerService.getAlerts).toHaveBeenCalledWith({
        aircraftId: undefined,
        types: undefined,
        limit: undefined,
      });
    });

    it('should filter alerts by parameters', async () => {
      schedulerService.getAlerts.mockResolvedValue([mockAlert] as any);

      const result = await controller.getAlerts('aircraft-123', 'WARNING,DUE', '10');

      expect(result).toEqual([mockAlert]);
      expect(schedulerService.getAlerts).toHaveBeenCalledWith({
        aircraftId: 'aircraft-123',
        types: ['WARNING', 'DUE'],
        limit: 10,
      });
    });
  });

  describe('POST /maintenance-scheduler/aircraft/:aircraftId/initialize', () => {
    it('should initialize aircraft schedules', async () => {
      schedulerService.initializeAircraftSchedules.mockResolvedValue([mockSchedule] as any);

      const result = await controller.initializeAircraftSchedules('aircraft-123');

      expect(result).toEqual({ created: 1, schedules: [mockSchedule] });
      expect(schedulerService.initializeAircraftSchedules).toHaveBeenCalledWith('aircraft-123');
    });
  });

  describe('POST /maintenance-scheduler/schedules/:scheduleId/complete', () => {
    it('should complete schedule', async () => {
      const completedSchedule = { ...mockSchedule, status: 'COMPLETED' as const };
      schedulerService.completeSchedule.mockResolvedValue(completedSchedule);

      const result = await controller.completeSchedule('schedule-123', { completedAtValue: 50 });

      expect(result).toEqual(completedSchedule);
      expect(schedulerService.completeSchedule).toHaveBeenCalledWith('schedule-123', 50);
    });
  });

  // ==================== Maintenance Programs ====================

  describe('GET /maintenance-scheduler/programs', () => {
    it('should list programs', async () => {
      programRepo.list.mockResolvedValue([mockProgram] as any);

      const result = await controller.listPrograms();

      expect(result).toEqual([mockProgram]);
      expect(programRepo.list).toHaveBeenCalledWith({
        limit: undefined,
        offset: undefined,
        aircraftModel: undefined,
        isActive: undefined,
      });
    });

    it('should filter programs by parameters', async () => {
      programRepo.list.mockResolvedValue([mockProgram] as any);

      const result = await controller.listPrograms('10', '5', 'M300 RTK', 'true');

      expect(result).toEqual([mockProgram]);
      expect(programRepo.list).toHaveBeenCalledWith({
        limit: 10,
        offset: 5,
        aircraftModel: 'M300 RTK',
        isActive: true,
      });
    });
  });

  describe('GET /maintenance-scheduler/programs/:id', () => {
    it('should return program by ID', async () => {
      programRepo.findById.mockResolvedValue(mockProgram as any);

      const result = await controller.getProgram('program-123');

      expect(result).toEqual(mockProgram);
    });

    it('should throw 404 for non-existent program', async () => {
      programRepo.findById.mockResolvedValue(null);

      await expect(controller.getProgram('non-existent')).rejects.toThrow(HttpException);
    });
  });

  describe('POST /maintenance-scheduler/programs', () => {
    it('should create program', async () => {
      const createDto = {
        name: '新程序',
        code: 'NEW-PROG',
        aircraftModel: 'Test Model',
      };
      programRepo.create.mockResolvedValue({ ...mockProgram, ...createDto });

      const result = await controller.createProgram(createDto as any);

      expect(result.name).toBe('新程序');
      expect(programRepo.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('GET /maintenance-scheduler/programs/default/:aircraftModel', () => {
    it('should return default program for model', async () => {
      programRepo.findDefaultForModel.mockResolvedValue(mockProgram as any);

      const result = await controller.getDefaultProgram('M300 RTK');

      expect(result).toEqual(mockProgram);
      expect(programRepo.findDefaultForModel).toHaveBeenCalledWith('M300 RTK');
    });
  });

  // ==================== Maintenance Triggers ====================

  describe('GET /maintenance-scheduler/triggers', () => {
    it('should list triggers', async () => {
      triggerRepo.list.mockResolvedValue([mockTrigger] as any);

      const result = await controller.listTriggers();

      expect(result).toEqual([mockTrigger]);
    });

    it('should filter triggers by parameters', async () => {
      triggerRepo.list.mockResolvedValue([mockTrigger] as any);

      const result = await controller.listTriggers('10', '0', 'program-123', 'FLIGHT_HOURS', 'true');

      expect(result).toEqual([mockTrigger]);
      expect(triggerRepo.list).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
        programId: 'program-123',
        type: 'FLIGHT_HOURS',
        isActive: true,
      });
    });
  });

  describe('GET /maintenance-scheduler/triggers/:id', () => {
    it('should return trigger by ID', async () => {
      triggerRepo.findById.mockResolvedValue(mockTrigger as any);

      const result = await controller.getTrigger('trigger-123');

      expect(result).toEqual(mockTrigger);
    });

    it('should throw 404 for non-existent trigger', async () => {
      triggerRepo.findById.mockResolvedValue(null);

      await expect(controller.getTrigger('non-existent')).rejects.toThrow(HttpException);
    });
  });

  describe('POST /maintenance-scheduler/triggers', () => {
    it('should create trigger', async () => {
      const createDto = {
        programId: 'program-123',
        type: 'FLIGHT_HOURS' as const,
        name: '新触发器',
        intervalValue: 100,
      };
      triggerRepo.create.mockResolvedValue({ ...mockTrigger, ...createDto });

      const result = await controller.createTrigger(createDto as any);

      expect(result.name).toBe('新触发器');
      expect(triggerRepo.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('GET /maintenance-scheduler/programs/:programId/triggers', () => {
    it('should return triggers for program', async () => {
      triggerRepo.findByProgramId.mockResolvedValue([mockTrigger] as any);

      const result = await controller.getProgramTriggers('program-123');

      expect(result).toEqual([mockTrigger]);
      expect(triggerRepo.findByProgramId).toHaveBeenCalledWith('program-123');
    });
  });

  // ==================== Maintenance Schedules ====================

  describe('GET /maintenance-scheduler/schedules', () => {
    it('should list schedules', async () => {
      scheduleRepo.list.mockResolvedValue([mockSchedule] as any);

      const result = await controller.listSchedules();

      expect(result).toEqual([mockSchedule]);
    });

    it('should filter schedules by parameters', async () => {
      scheduleRepo.list.mockResolvedValue([mockSchedule] as any);

      const result = await controller.listSchedules('20', '10', 'aircraft-123', 'DUE', 'true');

      expect(result).toEqual([mockSchedule]);
      expect(scheduleRepo.list).toHaveBeenCalledWith({
        limit: 20,
        offset: 10,
        aircraftId: 'aircraft-123',
        status: 'DUE',
        isActive: true,
      });
    });
  });

  describe('GET /maintenance-scheduler/schedules/:id', () => {
    it('should return schedule by ID', async () => {
      scheduleRepo.findById.mockResolvedValue(mockSchedule as any);

      const result = await controller.getSchedule('schedule-123');

      expect(result).toEqual(mockSchedule);
    });

    it('should throw 404 for non-existent schedule', async () => {
      scheduleRepo.findById.mockResolvedValue(null);

      await expect(controller.getSchedule('non-existent')).rejects.toThrow(HttpException);
    });
  });

  describe('GET /maintenance-scheduler/aircraft/:aircraftId/schedules', () => {
    it('should return schedules for aircraft', async () => {
      scheduleRepo.findByAircraftId.mockResolvedValue([mockSchedule] as any);

      const result = await controller.getAircraftSchedules('aircraft-123');

      expect(result).toEqual([mockSchedule]);
      expect(scheduleRepo.findByAircraftId).toHaveBeenCalledWith('aircraft-123');
    });
  });

  describe('GET /maintenance-scheduler/schedules/status/due-overdue', () => {
    it('should return due or overdue schedules', async () => {
      const overdueSchedule = { ...mockSchedule, status: 'OVERDUE' as const };
      scheduleRepo.findDueOrOverdue.mockResolvedValue([overdueSchedule] as any);

      const result = await controller.getDueOrOverdueSchedules();

      expect(result).toEqual([overdueSchedule]);
    });
  });

  describe('GET /maintenance-scheduler/schedules/due-within/:days', () => {
    it('should return schedules due within days', async () => {
      scheduleRepo.findDueWithinDays.mockResolvedValue([mockSchedule] as any);

      const result = await controller.getSchedulesDueWithinDays('7');

      expect(result).toEqual([mockSchedule]);
      expect(scheduleRepo.findDueWithinDays).toHaveBeenCalledWith(7);
    });
  });

  describe('GET /maintenance-scheduler/schedules/counts', () => {
    it('should return schedule status counts', async () => {
      const counts = { ACTIVE: 50, WARNING: 10, DUE: 5, OVERDUE: 2, COMPLETED: 100 };
      scheduleRepo.countByStatus.mockResolvedValue(counts);

      const result = await controller.getScheduleCounts();

      expect(result).toEqual(counts);
    });
  });

  // ==================== Calculation Preview ====================

  describe('POST /maintenance-scheduler/calculate-preview', () => {
    it('should calculate trigger preview', async () => {
      const calcResult = {
        triggerId: 'trigger-123',
        triggerName: '50小时定检',
        triggerType: 'FLIGHT_HOURS',
        status: 'WARNING' as const,
        remaining: 5,
        remainingValue: 5,
        remainingDays: 10,
        percentUsed: 90,
        percentageUsed: 90,
        dueDate: Date.now() + 5 * 24 * 60 * 60 * 1000,
        dueAtValue: 50,
        currentValue: 45,
        intervalValue: 50,
        message: '即将到期',
      };
      triggerRepo.findById.mockResolvedValue(mockTrigger as any);
      calcService.calculateTrigger.mockReturnValue(calcResult as any);

      const result = await controller.calculatePreview({
        triggerId: 'trigger-123',
        aircraft: { totalFlightHours: 45, totalFlightCycles: 100 },
        lastCompletedAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
        lastCompletedAtValue: 0,
      });

      expect(result).toEqual(calcResult);
      expect(triggerRepo.findById).toHaveBeenCalledWith('trigger-123');
      expect(calcService.calculateTrigger).toHaveBeenCalled();
    });

    it('should throw 404 for non-existent trigger', async () => {
      triggerRepo.findById.mockResolvedValue(null);

      await expect(controller.calculatePreview({
        triggerId: 'non-existent',
        aircraft: { totalFlightHours: 45, totalFlightCycles: 100 },
      })).rejects.toThrow(HttpException);
    });
  });
});
