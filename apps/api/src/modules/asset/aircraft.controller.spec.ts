/**
 * AircraftController Unit Tests
 *
 * Tests for aircraft management endpoints
 */

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';

import { AircraftController } from './aircraft.controller';
import { AircraftService } from './aircraft.service';

describe('AircraftController', () => {
  let controller: AircraftController;
  let aircraftService: jest.Mocked<AircraftService>;

  const mockAircraft = {
    id: 'aircraft-123',
    fleetId: 'fleet-123',
    registrationNumber: 'B-7011U',
    serialNumber: 'SN-2024-001',
    model: 'DJI Matrice 350 RTK',
    manufacturer: 'DJI',
    status: 'AVAILABLE' as const,
    isAirworthy: true,
    totalFlightHours: 150.5,
    totalFlightCycles: 320,
    lastInspectionAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
    nextInspectionDue: Date.now() + 23 * 24 * 60 * 60 * 1000,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const mockAircraftList = [
    mockAircraft,
    {
      ...mockAircraft,
      id: 'aircraft-456',
      registrationNumber: 'B-7012U',
      serialNumber: 'SN-2024-002',
      status: 'IN_MAINTENANCE' as const,
      isAirworthy: false,
    },
  ];

  const mockStatusCounts = {
    AVAILABLE: 10,
    IN_MAINTENANCE: 3,
    AOG: 1,
    RETIRED: 2,
  };

  beforeEach(async () => {
    const mockAircraftService = {
      findById: jest.fn(),
      findByFleet: jest.fn(),
      findByRegistration: jest.fn(),
      list: jest.fn(),
      getStatusCounts: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AircraftController],
      providers: [{ provide: AircraftService, useValue: mockAircraftService }],
    }).compile();

    controller = module.get<AircraftController>(AircraftController);
    aircraftService = module.get(AircraftService);
  });

  describe('GET /aircraft/:id', () => {
    it('should return aircraft by ID', async () => {
      aircraftService.findById.mockResolvedValue(mockAircraft);

      const result = await controller.getById('aircraft-123');

      expect(result).toEqual(mockAircraft);
      expect(aircraftService.findById).toHaveBeenCalledWith('aircraft-123');
    });

    it('should return null for non-existent aircraft', async () => {
      aircraftService.findById.mockResolvedValue(null);

      const result = await controller.getById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('GET /aircraft', () => {
    it('should return list of aircraft with default pagination', async () => {
      aircraftService.list.mockResolvedValue(mockAircraftList);

      const result = await controller.list();

      expect(result).toEqual(mockAircraftList);
      expect(aircraftService.list).toHaveBeenCalledWith(50, 0);
    });

    it('should return list with custom pagination', async () => {
      aircraftService.list.mockResolvedValue([mockAircraft]);

      const result = await controller.list('10', '5');

      expect(result).toEqual([mockAircraft]);
      expect(aircraftService.list).toHaveBeenCalledWith(10, 5);
    });

    it('should filter by fleetId when provided', async () => {
      aircraftService.findByFleet.mockResolvedValue([mockAircraft]);

      const result = await controller.list('50', '0', 'fleet-123');

      expect(result).toEqual([mockAircraft]);
      expect(aircraftService.findByFleet).toHaveBeenCalledWith('fleet-123', 50, 0);
      expect(aircraftService.list).not.toHaveBeenCalled();
    });

    it('should handle empty list', async () => {
      aircraftService.list.mockResolvedValue([]);

      const result = await controller.list();

      expect(result).toEqual([]);
    });
  });

  describe('GET /aircraft/status/counts', () => {
    it('should return status counts for all aircraft', async () => {
      aircraftService.getStatusCounts.mockResolvedValue(mockStatusCounts);

      const result = await controller.getStatusCounts();

      expect(result).toEqual(mockStatusCounts);
      expect(aircraftService.getStatusCounts).toHaveBeenCalledWith(undefined);
    });

    it('should return status counts filtered by fleetId', async () => {
      const fleetCounts = { AVAILABLE: 5, IN_MAINTENANCE: 1, AOG: 0, RETIRED: 0 };
      aircraftService.getStatusCounts.mockResolvedValue(fleetCounts);

      const result = await controller.getStatusCounts('fleet-123');

      expect(result).toEqual(fleetCounts);
      expect(aircraftService.getStatusCounts).toHaveBeenCalledWith('fleet-123');
    });
  });

  describe('POST /aircraft', () => {
    const createDto = {
      fleetId: 'fleet-123',
      registrationNumber: 'B-7013U',
      serialNumber: 'SN-2024-003',
      model: 'DJI Matrice 350 RTK',
      manufacturer: 'DJI',
    };

    it('should create a new aircraft', async () => {
      const newAircraft = {
        id: 'aircraft-new',
        ...createDto,
        status: 'AVAILABLE' as const,
        isAirworthy: true,
        totalFlightHours: 0,
        totalFlightCycles: 0,
        lastInspectionAt: null,
        nextInspectionDue: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      aircraftService.create.mockResolvedValue(newAircraft);

      const result = await controller.create(createDto);

      expect(result).toEqual(newAircraft);
      expect(aircraftService.create).toHaveBeenCalledWith(createDto);
    });

    it('should throw ConflictException for duplicate registration number', async () => {
      aircraftService.create.mockRejectedValue(new ConflictException('Registration number already exists'));

      await expect(controller.create(createDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('PUT /aircraft/:id', () => {
    const updateDto = {
      model: 'DJI Matrice 300 RTK',
      isAirworthy: false,
    };

    it('should update aircraft', async () => {
      const updatedAircraft = { ...mockAircraft, ...updateDto, updatedAt: Date.now() };
      aircraftService.update.mockResolvedValue(updatedAircraft);

      const result = await controller.update('aircraft-123', updateDto);

      expect(result).toEqual(updatedAircraft);
      expect(aircraftService.update).toHaveBeenCalledWith('aircraft-123', updateDto);
    });

    it('should throw NotFoundException for non-existent aircraft', async () => {
      aircraftService.update.mockRejectedValue(new NotFoundException('Aircraft not found'));

      await expect(controller.update('non-existent', updateDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException for duplicate registration', async () => {
      aircraftService.update.mockRejectedValue(new ConflictException('Registration number already exists'));

      await expect(controller.update('aircraft-123', { registrationNumber: 'B-DUPLICATE' })).rejects.toThrow(ConflictException);
    });
  });

  describe('PUT /aircraft/:id/status', () => {
    it('should update aircraft status', async () => {
      const updatedAircraft = { ...mockAircraft, status: 'IN_MAINTENANCE' as const, isAirworthy: false };
      aircraftService.updateStatus.mockResolvedValue(updatedAircraft);

      const result = await controller.updateStatus('aircraft-123', { status: 'IN_MAINTENANCE', isAirworthy: false });

      expect(result).toEqual(updatedAircraft);
      expect(aircraftService.updateStatus).toHaveBeenCalledWith('aircraft-123', 'IN_MAINTENANCE', false);
    });

    it('should update status without airworthiness change', async () => {
      const updatedAircraft = { ...mockAircraft, status: 'AOG' as const };
      aircraftService.updateStatus.mockResolvedValue(updatedAircraft);

      const result = await controller.updateStatus('aircraft-123', { status: 'AOG' });

      expect(result).toEqual(updatedAircraft);
      expect(aircraftService.updateStatus).toHaveBeenCalledWith('aircraft-123', 'AOG', undefined);
    });

    it('should throw NotFoundException for non-existent aircraft', async () => {
      aircraftService.updateStatus.mockRejectedValue(new NotFoundException('Aircraft not found'));

      await expect(controller.updateStatus('non-existent', { status: 'AVAILABLE' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('DELETE /aircraft/:id', () => {
    it('should delete aircraft and return success', async () => {
      aircraftService.delete.mockResolvedValue(undefined);

      const result = await controller.delete('aircraft-123');

      expect(result).toEqual({ success: true });
      expect(aircraftService.delete).toHaveBeenCalledWith('aircraft-123');
    });

    it('should throw NotFoundException for non-existent aircraft', async () => {
      aircraftService.delete.mockRejectedValue(new NotFoundException('Aircraft not found'));

      await expect(controller.delete('non-existent')).rejects.toThrow(NotFoundException);
    });
  });
});
