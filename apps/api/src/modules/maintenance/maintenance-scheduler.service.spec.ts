import { Test, TestingModule } from '@nestjs/testing';

import { MaintenanceSchedulerService } from './maintenance-scheduler.service';
import { MaintenanceProgramRepository } from './repositories/maintenance-program.repository';
import { MaintenanceTriggerRepository } from './repositories/maintenance-trigger.repository';
import { MaintenanceScheduleRepository } from './repositories/maintenance-schedule.repository';
import { WorkOrderRepository } from './repositories/work-order.repository';
import { AircraftRepository } from '../asset/repositories/aircraft.repository';
import { TriggerCalculationService, TriggerCalculationResult } from './trigger-calculation.service';

describe('MaintenanceSchedulerService', () => {
  let service: MaintenanceSchedulerService;
  let programRepo: jest.Mocked<MaintenanceProgramRepository>;
  let triggerRepo: jest.Mocked<MaintenanceTriggerRepository>;
  let scheduleRepo: jest.Mocked<MaintenanceScheduleRepository>;
  let workOrderRepo: jest.Mocked<WorkOrderRepository>;
  let aircraftRepo: jest.Mocked<AircraftRepository>;
  let calcService: jest.Mocked<TriggerCalculationService>;

  // Complete mock aircraft
  const mockAircraft = {
    id: 'aircraft-123',
    fleetId: 'fleet-123',
    registrationNumber: 'N12345',
    serialNumber: 'SN-001',
    model: 'DJI M300',
    manufacturer: 'DJI',
    status: 'AVAILABLE',
    totalFlightHours: 100,
    totalFlightCycles: 200,
    isAirworthy: true,
    lastInspectionAt: null,
    nextInspectionDue: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  // Complete mock trigger
  const mockTrigger = {
    id: 'trigger-123',
    programId: 'program-123',
    name: 'Engine Inspection',
    description: 'Regular engine inspection',
    type: 'FLIGHT_HOURS',
    intervalValue: 50,
    applicableComponentType: null,
    applicableComponentLocation: null,
    priority: 'MEDIUM',
    requiredRole: 'INSPECTOR',
    isRii: false,
    isActive: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  // Complete mock schedule
  const mockSchedule = {
    id: 'schedule-123',
    aircraftId: 'aircraft-123',
    triggerId: 'trigger-123',
    status: 'SCHEDULED',
    dueDate: null,
    dueAtValue: 150,
    lastCompletedAt: null,
    lastCompletedAtValue: null,
    assignedTo: null,
    workOrderId: null,
    isActive: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  // Complete mock calculation result
  const mockCalcResult: TriggerCalculationResult = {
    triggerId: 'trigger-123',
    triggerName: 'Engine Inspection',
    triggerType: 'FLIGHT_HOURS',
    status: 'OK',
    currentValue: 100,
    remainingValue: 50,
    remainingDays: 25,
    dueDate: null,
    dueAtValue: 150,
    percentageUsed: 66.67,
  };

  beforeEach(async () => {
    const mockProgramRepo = {
      findById: jest.fn(),
      findDefaultForModel: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      list: jest.fn(),
    };

    const mockTriggerRepo = {
      findById: jest.fn(),
      findByProgramId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };

    const mockScheduleRepo = {
      findById: jest.fn(),
      findByAircraftId: jest.fn(),
      findDueWithoutWorkOrder: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
      update: jest.fn(),
    };

    const mockWorkOrderRepo = {
      findById: jest.fn(),
      create: jest.fn(),
      generateOrderNumber: jest.fn(),
    };

    const mockAircraftRepo = {
      findById: jest.fn(),
      list: jest.fn(),
    };

    const mockCalcService = {
      calculateTrigger: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MaintenanceSchedulerService,
        { provide: MaintenanceProgramRepository, useValue: mockProgramRepo },
        { provide: MaintenanceTriggerRepository, useValue: mockTriggerRepo },
        { provide: MaintenanceScheduleRepository, useValue: mockScheduleRepo },
        { provide: WorkOrderRepository, useValue: mockWorkOrderRepo },
        { provide: AircraftRepository, useValue: mockAircraftRepo },
        { provide: TriggerCalculationService, useValue: mockCalcService },
      ],
    }).compile();

    service = module.get<MaintenanceSchedulerService>(MaintenanceSchedulerService);
    programRepo = module.get(MaintenanceProgramRepository);
    triggerRepo = module.get(MaintenanceTriggerRepository);
    scheduleRepo = module.get(MaintenanceScheduleRepository);
    workOrderRepo = module.get(WorkOrderRepository);
    aircraftRepo = module.get(AircraftRepository);
    calcService = module.get(TriggerCalculationService);
  });

  describe('runScheduler', () => {
    it('should process all aircraft schedules successfully', async () => {
      aircraftRepo.list.mockResolvedValue([mockAircraft]);
      scheduleRepo.findByAircraftId.mockResolvedValue([mockSchedule]);
      triggerRepo.findById.mockResolvedValue(mockTrigger);
      calcService.calculateTrigger.mockReturnValue(mockCalcResult);

      const result = await service.runScheduler();

      expect(result.schedulesProcessed).toBe(1);
      expect(result.errors).toHaveLength(0);
      expect(aircraftRepo.list).toHaveBeenCalledWith(1000);
    });

    it('should generate alerts for WARNING status', async () => {
      const warningCalcResult: TriggerCalculationResult = {
        ...mockCalcResult,
        status: 'WARNING',
      };

      aircraftRepo.list.mockResolvedValue([mockAircraft]);
      scheduleRepo.findByAircraftId.mockResolvedValue([mockSchedule]);
      triggerRepo.findById.mockResolvedValue(mockTrigger);
      calcService.calculateTrigger.mockReturnValue(warningCalcResult);

      const result = await service.runScheduler();

      expect(result.alerts).toHaveLength(1);
      expect(result.alerts[0]!.type).toBe('WARNING');
      expect(result.alerts[0]!.aircraftId).toBe(mockAircraft.id);
    });

    it('should update schedule status when DUE', async () => {
      const dueCalcResult: TriggerCalculationResult = {
        ...mockCalcResult,
        status: 'DUE',
        remainingValue: 0,
      };

      aircraftRepo.list.mockResolvedValue([mockAircraft]);
      scheduleRepo.findByAircraftId.mockResolvedValue([mockSchedule]);
      triggerRepo.findById.mockResolvedValue(mockTrigger);
      calcService.calculateTrigger.mockReturnValue(dueCalcResult);
      scheduleRepo.update.mockResolvedValue({ ...mockSchedule, status: 'DUE' });

      const result = await service.runScheduler();

      expect(result.statusUpdates.toDue).toBe(1);
      expect(scheduleRepo.update).toHaveBeenCalledWith(
        mockSchedule.id,
        expect.objectContaining({ status: 'DUE' }),
      );
    });

    it('should handle errors gracefully', async () => {
      aircraftRepo.list.mockRejectedValue(new Error('Database error'));

      const result = await service.runScheduler();

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Scheduler run failed');
    });
  });

  describe('createWorkOrdersForDueSchedules', () => {
    it('should create work orders for due schedules', async () => {
      const dueSchedule = { ...mockSchedule, status: 'DUE' };
      const mockWorkOrder = {
        id: 'wo-123',
        orderNumber: 'WO-2024-001',
        title: 'Engine Inspection - N12345',
        aircraftId: mockAircraft.id,
        type: 'SCHEDULED',
        status: 'PENDING',
        priority: 'MEDIUM',
        description: null,
        reason: null,
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
        scheduleId: dueSchedule.id,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      scheduleRepo.findDueWithoutWorkOrder.mockResolvedValue([dueSchedule]);
      triggerRepo.findById.mockResolvedValue(mockTrigger);
      aircraftRepo.findById.mockResolvedValue(mockAircraft);
      workOrderRepo.generateOrderNumber.mockResolvedValue('WO-2024-001');
      workOrderRepo.create.mockResolvedValue(mockWorkOrder);
      scheduleRepo.update.mockResolvedValue({ ...dueSchedule, workOrderId: 'wo-123' });

      const result = await service.createWorkOrdersForDueSchedules();

      expect(result).toHaveLength(1);
      expect(workOrderRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'SCHEDULED',
          aircraftId: mockAircraft.id,
        }),
      );
      expect(scheduleRepo.update).toHaveBeenCalledWith(
        dueSchedule.id,
        expect.objectContaining({ status: 'IN_PROGRESS' }),
      );
    });

    it('should skip schedules with missing trigger', async () => {
      const dueSchedule = { ...mockSchedule, status: 'DUE' };
      scheduleRepo.findDueWithoutWorkOrder.mockResolvedValue([dueSchedule]);
      triggerRepo.findById.mockResolvedValue(null);

      const result = await service.createWorkOrdersForDueSchedules();

      expect(result).toHaveLength(0);
      expect(workOrderRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('initializeAircraftSchedules', () => {
    const mockProgram = {
      id: 'program-123',
      name: 'Default Maintenance Program',
      description: 'Standard maintenance program',
      aircraftModel: 'DJI M300',
      isDefault: true,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    it('should create schedules for aircraft based on program triggers', async () => {
      aircraftRepo.findById.mockResolvedValue(mockAircraft);
      programRepo.findDefaultForModel.mockResolvedValue(mockProgram);
      triggerRepo.findByProgramId.mockResolvedValue([mockTrigger]);
      calcService.calculateTrigger.mockReturnValue(mockCalcResult);
      scheduleRepo.createMany.mockResolvedValue([mockSchedule]);

      const result = await service.initializeAircraftSchedules('aircraft-123');

      expect(result).toHaveLength(1);
      expect(scheduleRepo.createMany).toHaveBeenCalled();
    });

    it('should throw error when aircraft not found', async () => {
      aircraftRepo.findById.mockResolvedValue(null);

      await expect(service.initializeAircraftSchedules('non-existent')).rejects.toThrow(
        'Aircraft non-existent not found',
      );
    });

    it('should return empty array when no program found', async () => {
      aircraftRepo.findById.mockResolvedValue(mockAircraft);
      programRepo.findDefaultForModel.mockResolvedValue(null);

      const result = await service.initializeAircraftSchedules('aircraft-123');

      expect(result).toHaveLength(0);
    });
  });

  describe('completeSchedule', () => {
    it('should complete schedule and create new one for next interval', async () => {
      scheduleRepo.findById.mockResolvedValue(mockSchedule);
      aircraftRepo.findById.mockResolvedValue(mockAircraft);
      triggerRepo.findById.mockResolvedValue(mockTrigger);
      calcService.calculateTrigger.mockReturnValue(mockCalcResult);
      scheduleRepo.update.mockResolvedValue({ ...mockSchedule, status: 'COMPLETED' });
      scheduleRepo.create.mockResolvedValue({
        ...mockSchedule,
        id: 'new-schedule-123',
        status: 'SCHEDULED',
      });

      const result = await service.completeSchedule('schedule-123');

      expect(result.status).toBe('COMPLETED');
      expect(scheduleRepo.update).toHaveBeenCalledWith(
        'schedule-123',
        expect.objectContaining({ status: 'COMPLETED' }),
      );
      expect(scheduleRepo.create).toHaveBeenCalled();
    });

    it('should throw error when schedule not found', async () => {
      scheduleRepo.findById.mockResolvedValue(null);

      await expect(service.completeSchedule('non-existent')).rejects.toThrow(
        'Schedule non-existent not found',
      );
    });
  });

  describe('getAlerts', () => {
    it('should return alerts filtered by aircraft', async () => {
      const warningCalcResult: TriggerCalculationResult = {
        ...mockCalcResult,
        status: 'WARNING',
      };

      aircraftRepo.findById.mockResolvedValue(mockAircraft);
      scheduleRepo.findByAircraftId.mockResolvedValue([mockSchedule]);
      triggerRepo.findById.mockResolvedValue(mockTrigger);
      calcService.calculateTrigger.mockReturnValue(warningCalcResult);

      const result = await service.getAlerts({ aircraftId: 'aircraft-123' });

      expect(result.length).toBeGreaterThan(0);
      expect(result[0]!.aircraftId).toBe('aircraft-123');
    });

    it('should filter alerts by type', async () => {
      const dueCalcResult: TriggerCalculationResult = {
        ...mockCalcResult,
        status: 'DUE',
      };

      aircraftRepo.list.mockResolvedValue([mockAircraft]);
      scheduleRepo.findByAircraftId.mockResolvedValue([mockSchedule]);
      triggerRepo.findById.mockResolvedValue(mockTrigger);
      calcService.calculateTrigger.mockReturnValue(dueCalcResult);

      const result = await service.getAlerts({ types: ['DUE'] });

      expect(result.every((alert) => alert.type === 'DUE')).toBe(true);
    });

    it('should sort alerts by urgency (OVERDUE first)', async () => {
      const mockSchedules = [
        { ...mockSchedule, id: 'schedule-1' },
        { ...mockSchedule, id: 'schedule-2' },
      ];

      aircraftRepo.list.mockResolvedValue([mockAircraft]);
      scheduleRepo.findByAircraftId.mockResolvedValue(mockSchedules);
      triggerRepo.findById.mockResolvedValue(mockTrigger);

      // Return different statuses for different calls
      calcService.calculateTrigger
        .mockReturnValueOnce({ ...mockCalcResult, status: 'WARNING' } as TriggerCalculationResult)
        .mockReturnValueOnce({ ...mockCalcResult, status: 'OVERDUE' } as TriggerCalculationResult);

      const result = await service.getAlerts();

      expect(result.length).toBeGreaterThan(0);
      expect(result[0]!.type).toBe('OVERDUE');
    });
  });
});
