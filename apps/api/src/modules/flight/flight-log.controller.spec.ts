/**
 * FlightLogController Unit Tests
 *
 * Tests for flight log endpoints
 */

import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';

import { FlightLogController } from './flight-log.controller';
import { FlightLogService } from './flight-log.service';

describe('FlightLogController', () => {
  let controller: FlightLogController;
  let flightLogService: jest.Mocked<FlightLogService>;

  const mockFlightLog = {
    id: 'fl-123',
    aircraftId: 'ac-001',
    pilotId: 'user-001',
    copilotId: null,
    flightDate: Date.now(),
    flightType: 'OPERATION',
    departureLocation: '基地停机坪',
    departureTime: Date.now(),
    arrivalLocation: '目标点A',
    arrivalTime: Date.now() + 3600000,
    flightDuration: 60,
    flightHours: 1.0,
    takeoffCycles: 1,
    landingCycles: 1,
    missionDescription: '巡检任务',
    payloadWeight: 500,
    preFlightCheckCompleted: true,
    preFlightCheckBy: 'user-002',
    postFlightNotes: null,
    discrepancies: null,
    aircraftHoursBefore: 100,
    aircraftHoursAfter: 101,
    aircraftCyclesBefore: 200,
    aircraftCyclesAfter: 201,
    isActive: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const mockFlightLogs = [mockFlightLog];

  beforeEach(async () => {
    const mockFlightLogService = {
      findById: jest.fn(),
      findByAircraft: jest.fn(),
      findByPilot: jest.fn(),
      findByDateRange: jest.fn(),
      getRecent: jest.fn(),
      getAircraftStats: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FlightLogController],
      providers: [{ provide: FlightLogService, useValue: mockFlightLogService }],
    }).compile();

    controller = module.get<FlightLogController>(FlightLogController);
    flightLogService = module.get(FlightLogService);
  });

  describe('GET /flight-logs/:id', () => {
    it('should return flight log by ID', async () => {
      flightLogService.findById.mockResolvedValue(mockFlightLog);

      const result = await controller.getById('fl-123');

      expect(result).toEqual(mockFlightLog);
      expect(flightLogService.findById).toHaveBeenCalledWith('fl-123');
    });

    it('should handle not found flight log', async () => {
      flightLogService.findById.mockRejectedValue(new NotFoundException('Flight log not found'));

      await expect(controller.getById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('GET /flight-logs', () => {
    it('should return recent flight logs by default', async () => {
      flightLogService.getRecent.mockResolvedValue(mockFlightLogs);

      const result = await controller.list(50, 0);

      expect(result).toEqual(mockFlightLogs);
      expect(flightLogService.getRecent).toHaveBeenCalledWith(50);
    });

    it('should return recent flight logs when recent=true', async () => {
      flightLogService.getRecent.mockResolvedValue(mockFlightLogs);

      const result = await controller.list(20, 0, undefined, undefined, 'true');

      expect(result).toEqual(mockFlightLogs);
      expect(flightLogService.getRecent).toHaveBeenCalledWith(20);
    });

    it('should filter by aircraft ID', async () => {
      flightLogService.findByAircraft.mockResolvedValue(mockFlightLogs);

      const result = await controller.list(50, 0, 'ac-001');

      expect(result).toEqual(mockFlightLogs);
      expect(flightLogService.findByAircraft).toHaveBeenCalledWith('ac-001', 50, 0);
    });

    it('should filter by pilot ID', async () => {
      flightLogService.findByPilot.mockResolvedValue(mockFlightLogs);

      const result = await controller.list(50, 0, undefined, 'user-001');

      expect(result).toEqual(mockFlightLogs);
      expect(flightLogService.findByPilot).toHaveBeenCalledWith('user-001', 50, 0);
    });

    it('should filter by date range', async () => {
      flightLogService.findByDateRange.mockResolvedValue(mockFlightLogs);

      const startDate = '2026-01-01';
      const endDate = '2026-01-31';
      const result = await controller.list(50, 0, undefined, undefined, undefined, startDate, endDate);

      expect(result).toEqual(mockFlightLogs);
      expect(flightLogService.findByDateRange).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid date format', async () => {
      await expect(
        controller.list(50, 0, undefined, undefined, undefined, 'invalid', 'date'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('GET /flight-logs/aircraft/:aircraftId/stats', () => {
    const mockStats = {
      totalFlights: 50,
      totalHours: 100,
      totalCycles: 200,
      lastFlightDate: new Date(),
    };

    it('should return aircraft statistics', async () => {
      flightLogService.getAircraftStats.mockResolvedValue(mockStats);

      const result = await controller.getAircraftStats('ac-001');

      expect(result).toEqual(mockStats);
      expect(flightLogService.getAircraftStats).toHaveBeenCalledWith('ac-001');
    });
  });

  describe('POST /flight-logs', () => {
    const createDto = {
      aircraftId: 'ac-001',
      pilotId: 'user-001',
      flightDate: Date.now(),
      flightType: 'OPERATION' as const,
      departureLocation: '基地停机坪',
      flightDuration: 60,
      flightHours: 1.0,
    };

    it('should create a new flight log', async () => {
      flightLogService.create.mockResolvedValue(mockFlightLog);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockFlightLog);
      expect(flightLogService.create).toHaveBeenCalledWith(createDto);
    });

    it('should handle validation errors', async () => {
      flightLogService.create.mockRejectedValue(new BadRequestException('Invalid aircraft ID'));

      await expect(controller.create(createDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('PUT /flight-logs/:id', () => {
    const updateDto = {
      postFlightNotes: 'Updated notes',
      discrepancies: 'Minor vibration observed',
    };

    it('should update flight log', async () => {
      const updatedFlightLog = { ...mockFlightLog, ...updateDto };
      flightLogService.update.mockResolvedValue(updatedFlightLog);

      const result = await controller.update('fl-123', updateDto);

      expect(result).toEqual(updatedFlightLog);
      expect(flightLogService.update).toHaveBeenCalledWith('fl-123', updateDto);
    });

    it('should handle not found flight log on update', async () => {
      flightLogService.update.mockRejectedValue(new NotFoundException('Flight log not found'));

      await expect(controller.update('nonexistent', updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('DELETE /flight-logs/:id', () => {
    it('should delete flight log', async () => {
      flightLogService.delete.mockResolvedValue(undefined);

      const result = await controller.delete('fl-123');

      expect(result).toEqual({ success: true, message: 'Flight log deleted' });
      expect(flightLogService.delete).toHaveBeenCalledWith('fl-123');
    });

    it('should handle not found flight log on delete', async () => {
      flightLogService.delete.mockRejectedValue(new NotFoundException('Flight log not found'));

      await expect(controller.delete('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
