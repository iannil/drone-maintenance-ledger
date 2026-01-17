import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';

import { FlightLogService, CreateFlightLogDto, UpdateFlightLogDto } from './flight-log.service';
import { FlightLogRepository } from './repositories/flight-log.repository';

describe('FlightLogService', () => {
  let service: FlightLogService;
  let flightLogRepo: jest.Mocked<FlightLogRepository>;

  // Complete mock flight log with all required fields
  const mockFlightLog = {
    id: 'flight-123',
    aircraftId: 'aircraft-123',
    flightDate: Date.now(),
    flightType: 'OPERATION',
    departureLocation: 'Base A',
    departureTime: Date.now(),
    arrivalLocation: 'Base B',
    arrivalTime: Date.now() + 3600000,
    pilotId: 'pilot-123',
    copilotId: null,
    flightDuration: 60, // minutes
    flightHours: 1,
    takeoffCycles: 1,
    landingCycles: 1,
    missionDescription: 'Survey mission',
    payloadWeight: 5,
    preFlightCheckCompleted: true,
    preFlightCheckBy: 'pilot-123',
    postFlightNotes: 'Completed successfully',
    discrepancies: null,
    aircraftHoursBefore: 100,
    aircraftHoursAfter: 101,
    aircraftCyclesBefore: 200,
    aircraftCyclesAfter: 202,
    isActive: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  // Mock aircraft stats
  const mockAircraftStats = {
    totalHours: 100,
    totalCycles: 200,
    totalFlights: 50,
    lastFlightDate: new Date(),
  };

  beforeEach(async () => {
    const mockFlightLogRepo = {
      findById: jest.fn(),
      findByAircraft: jest.fn(),
      findByPilot: jest.fn(),
      findByDateRange: jest.fn(),
      findRecent: jest.fn(),
      getAircraftStats: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      updateLifecycleMetrics: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FlightLogService,
        { provide: FlightLogRepository, useValue: mockFlightLogRepo },
      ],
    }).compile();

    service = module.get<FlightLogService>(FlightLogService);
    flightLogRepo = module.get(FlightLogRepository);
  });

  describe('findById', () => {
    it('should return flight log when found', async () => {
      flightLogRepo.findById.mockResolvedValue(mockFlightLog);

      const result = await service.findById('flight-123');

      expect(result).toEqual(mockFlightLog);
      expect(flightLogRepo.findById).toHaveBeenCalledWith('flight-123');
    });

    it('should return null when not found', async () => {
      flightLogRepo.findById.mockResolvedValue(null);

      const result = await service.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findByAircraft', () => {
    it('should return flight logs for aircraft', async () => {
      flightLogRepo.findByAircraft.mockResolvedValue([mockFlightLog]);

      const result = await service.findByAircraft('aircraft-123');

      expect(result).toHaveLength(1);
      expect(flightLogRepo.findByAircraft).toHaveBeenCalledWith('aircraft-123', 50, 0);
    });

    it('should use custom pagination', async () => {
      flightLogRepo.findByAircraft.mockResolvedValue([]);

      await service.findByAircraft('aircraft-123', 10, 5);

      expect(flightLogRepo.findByAircraft).toHaveBeenCalledWith('aircraft-123', 10, 5);
    });
  });

  describe('findByPilot', () => {
    it('should return flight logs for pilot', async () => {
      flightLogRepo.findByPilot.mockResolvedValue([mockFlightLog]);

      const result = await service.findByPilot('pilot-123');

      expect(result).toHaveLength(1);
      expect(flightLogRepo.findByPilot).toHaveBeenCalledWith('pilot-123', 50, 0);
    });

    it('should use custom pagination', async () => {
      flightLogRepo.findByPilot.mockResolvedValue([]);

      await service.findByPilot('pilot-123', 20, 10);

      expect(flightLogRepo.findByPilot).toHaveBeenCalledWith('pilot-123', 20, 10);
    });
  });

  describe('findByDateRange', () => {
    it('should return flight logs in date range', async () => {
      flightLogRepo.findByDateRange.mockResolvedValue([mockFlightLog]);

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      const result = await service.findByDateRange(startDate, endDate);

      expect(result).toHaveLength(1);
      expect(flightLogRepo.findByDateRange).toHaveBeenCalledWith(startDate, endDate);
    });
  });

  describe('getRecent', () => {
    it('should return recent flight logs', async () => {
      flightLogRepo.findRecent.mockResolvedValue([mockFlightLog]);

      const result = await service.getRecent();

      expect(result).toHaveLength(1);
      expect(flightLogRepo.findRecent).toHaveBeenCalledWith(20);
    });

    it('should use custom limit', async () => {
      flightLogRepo.findRecent.mockResolvedValue([]);

      await service.getRecent(10);

      expect(flightLogRepo.findRecent).toHaveBeenCalledWith(10);
    });
  });

  describe('getAircraftStats', () => {
    it('should return aircraft statistics', async () => {
      flightLogRepo.getAircraftStats.mockResolvedValue(mockAircraftStats);

      const result = await service.getAircraftStats('aircraft-123');

      expect(result).toEqual(mockAircraftStats);
      expect(flightLogRepo.getAircraftStats).toHaveBeenCalledWith('aircraft-123');
    });
  });

  describe('create', () => {
    const createDto: CreateFlightLogDto = {
      aircraftId: 'aircraft-123',
      pilotId: 'pilot-123',
      flightDate: Date.now(),
      flightType: 'OPERATION',
      departureLocation: 'Base A',
      flightDuration: 60,
      flightHours: 1,
    };

    it('should create flight log and update lifecycle metrics', async () => {
      flightLogRepo.getAircraftStats.mockResolvedValue(mockAircraftStats);
      flightLogRepo.create.mockResolvedValue(mockFlightLog);
      flightLogRepo.updateLifecycleMetrics.mockResolvedValue(undefined);

      const result = await service.create(createDto);

      expect(result).toEqual(mockFlightLog);
      expect(flightLogRepo.getAircraftStats).toHaveBeenCalledWith('aircraft-123');
      expect(flightLogRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          aircraftId: 'aircraft-123',
          aircraftHoursBefore: 100,
          aircraftHoursAfter: 101,
          aircraftCyclesBefore: 200,
          aircraftCyclesAfter: 202,
        }),
      );
      expect(flightLogRepo.updateLifecycleMetrics).toHaveBeenCalledWith('aircraft-123', 1, 2);
    });

    it('should use provided cycles if specified', async () => {
      const dtoWithCycles: CreateFlightLogDto = {
        ...createDto,
        takeoffCycles: 2,
        landingCycles: 3,
      };

      flightLogRepo.getAircraftStats.mockResolvedValue(mockAircraftStats);
      flightLogRepo.create.mockResolvedValue({ ...mockFlightLog, takeoffCycles: 2, landingCycles: 3 });
      flightLogRepo.updateLifecycleMetrics.mockResolvedValue(undefined);

      await service.create(dtoWithCycles);

      expect(flightLogRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          takeoffCycles: 2,
          landingCycles: 3,
          aircraftCyclesAfter: 205, // 200 + 2 + 3
        }),
      );
      expect(flightLogRepo.updateLifecycleMetrics).toHaveBeenCalledWith('aircraft-123', 1, 5); // 2 + 3
    });

    it('should handle first flight for aircraft', async () => {
      flightLogRepo.getAircraftStats.mockResolvedValue({
        totalHours: 0,
        totalCycles: 0,
        totalFlights: 0,
        lastFlightDate: null,
      });
      flightLogRepo.create.mockResolvedValue({
        ...mockFlightLog,
        aircraftHoursBefore: 0,
        aircraftHoursAfter: 1,
        aircraftCyclesBefore: 0,
        aircraftCyclesAfter: 2,
      });
      flightLogRepo.updateLifecycleMetrics.mockResolvedValue(undefined);

      const result = await service.create(createDto);

      expect(result.aircraftHoursBefore).toBe(0);
      expect(flightLogRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          aircraftHoursBefore: 0,
          aircraftHoursAfter: 1,
        }),
      );
    });
  });

  describe('update', () => {
    const updateDto: UpdateFlightLogDto = {
      postFlightNotes: 'Updated notes',
      missionDescription: 'Updated mission',
    };

    it('should update flight log successfully', async () => {
      flightLogRepo.findById.mockResolvedValue(mockFlightLog);
      flightLogRepo.update.mockResolvedValue({ ...mockFlightLog, ...updateDto });

      const result = await service.update('flight-123', updateDto);

      expect(result.postFlightNotes).toBe('Updated notes');
      expect(flightLogRepo.update).toHaveBeenCalledWith('flight-123', updateDto);
    });

    it('should throw NotFoundException when flight log not found', async () => {
      flightLogRepo.findById.mockResolvedValue(null);

      await expect(service.update('non-existent', updateDto)).rejects.toThrow(NotFoundException);
    });

    it('should warn when changing flight hours', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const updateWithHours: UpdateFlightLogDto = {
        flightHours: 2, // Different from original 1 hour
      };

      flightLogRepo.findById.mockResolvedValue(mockFlightLog);
      flightLogRepo.update.mockResolvedValue({ ...mockFlightLog, flightHours: 2 });

      await service.update('flight-123', updateWithHours);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Flight hours changed'),
      );
      consoleSpy.mockRestore();
    });

    it('should not warn when flight hours unchanged', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const updateWithSameHours: UpdateFlightLogDto = {
        flightHours: 1, // Same as original
      };

      flightLogRepo.findById.mockResolvedValue(mockFlightLog);
      flightLogRepo.update.mockResolvedValue(mockFlightLog);

      await service.update('flight-123', updateWithSameHours);

      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('delete', () => {
    it('should delete flight log successfully', async () => {
      flightLogRepo.findById.mockResolvedValue(mockFlightLog);
      flightLogRepo.delete.mockResolvedValue(undefined);

      await expect(service.delete('flight-123')).resolves.toBeUndefined();
      expect(flightLogRepo.delete).toHaveBeenCalledWith('flight-123');
    });

    it('should throw NotFoundException when flight log not found', async () => {
      flightLogRepo.findById.mockResolvedValue(null);

      await expect(service.delete('non-existent')).rejects.toThrow(NotFoundException);
    });
  });
});
