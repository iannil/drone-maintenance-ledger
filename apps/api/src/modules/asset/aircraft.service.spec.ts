/**
 * AircraftService Unit Tests
 *
 * Tests for aircraft business logic
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';

import { AircraftService, CreateAircraftDto, UpdateAircraftDto } from './aircraft.service';
import { AircraftRepository } from './repositories/aircraft.repository';
import type { Aircraft } from '@repo/db';

describe('AircraftService', () => {
  let service: AircraftService;
  let repository: jest.Mocked<AircraftRepository>;

  const mockAircraft: Aircraft = {
    id: 'aircraft-123',
    fleetId: 'fleet-123',
    registrationNumber: 'B-1234',
    serialNumber: 'SN-MOT-001',
    model: 'DJI M350 RTK',
    manufacturer: 'DJI',
    status: 'AVAILABLE' as const,
    isAirworthy: true,
    totalFlightHours: 100,
    totalFlightCycles: 200,
    lastInspectionAt: null,
    nextInspectionDue: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  beforeEach(async () => {
    const mockAircraftRepository = {
      findById: jest.fn(),
      findByRegistration: jest.fn(),
      findBySerialNumber: jest.fn(),
      findByFleet: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateFlightMetrics: jest.fn(),
      updateStatus: jest.fn(),
      delete: jest.fn(),
      list: jest.fn(),
      countByStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AircraftService,
        { provide: AircraftRepository, useValue: mockAircraftRepository },
      ],
    }).compile();

    service = module.get<AircraftService>(AircraftService);
    repository = module.get(AircraftRepository);
  });

  // ==================== Find By ID ====================

  describe('findById', () => {
    it('should return aircraft when found', async () => {
      repository.findById.mockResolvedValue(mockAircraft);

      const result = await service.findById('aircraft-123');

      expect(result).toEqual(mockAircraft);
      expect(repository.findById).toHaveBeenCalledWith('aircraft-123');
    });

    it('should return null when not found', async () => {
      repository.findById.mockResolvedValue(null);

      const result = await service.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  // ==================== Find By Registration ====================

  describe('findByRegistration', () => {
    it('should return aircraft when registration exists', async () => {
      repository.findByRegistration.mockResolvedValue(mockAircraft);

      const result = await service.findByRegistration('B-1234');

      expect(result).toEqual(mockAircraft);
      expect(repository.findByRegistration).toHaveBeenCalledWith('B-1234');
    });

    it('should return null when registration does not exist', async () => {
      repository.findByRegistration.mockResolvedValue(null);

      const result = await service.findByRegistration('B-0000');

      expect(result).toBeNull();
    });
  });

  // ==================== Find By Fleet ====================

  describe('findByFleet', () => {
    it('should return aircraft list for fleet with default pagination', async () => {
      const aircraft = [mockAircraft];
      repository.findByFleet.mockResolvedValue(aircraft as any);

      const result = await service.findByFleet('fleet-123');

      expect(result).toEqual(aircraft);
      expect(repository.findByFleet).toHaveBeenCalledWith('fleet-123', 50, 0);
    });

    it('should return aircraft list for fleet with custom pagination', async () => {
      const aircraft = [mockAircraft];
      repository.findByFleet.mockResolvedValue(aircraft as any);

      const result = await service.findByFleet('fleet-123', 10, 5);

      expect(result).toEqual(aircraft);
      expect(repository.findByFleet).toHaveBeenCalledWith('fleet-123', 10, 5);
    });
  });

  // ==================== Create ====================

  describe('create', () => {
    const createDto: CreateAircraftDto = {
      fleetId: 'fleet-123',
      registrationNumber: 'B-5678',
      serialNumber: 'SN-MOT-002',
      model: 'DJI M300 RTK',
      manufacturer: 'DJI',
      status: 'AVAILABLE' as const,
    };

    it('should create aircraft when registration and serial are unique', async () => {
      repository.findByRegistration.mockResolvedValue(null);
      repository.findBySerialNumber.mockResolvedValue(null);
      repository.create.mockResolvedValue({
        ...mockAircraft,
        id: 'aircraft-new',
        ...createDto,
      } as any);

      const result = await service.create(createDto);

      expect(result).toBeDefined();
      expect(repository.findByRegistration).toHaveBeenCalledWith(createDto.registrationNumber);
      expect(repository.findBySerialNumber).toHaveBeenCalledWith(createDto.serialNumber);
      expect(repository.create).toHaveBeenCalledWith({
        ...createDto,
        status: 'AVAILABLE',
        isAirworthy: true,
        totalFlightHours: 0,
        totalFlightCycles: 0,
      });
    });

    it('should throw ConflictException when registration exists', async () => {
      repository.findByRegistration.mockResolvedValue(mockAircraft);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
      await expect(service.create(createDto)).rejects.toThrow('Registration number already exists');
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when serial number exists', async () => {
      repository.findByRegistration.mockResolvedValue(null);
      repository.findBySerialNumber.mockResolvedValue(mockAircraft);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
      await expect(service.create(createDto)).rejects.toThrow('Serial number already exists');
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should use default status when not provided', async () => {
      const dtoWithoutStatus = { ...createDto, status: undefined };
      repository.findByRegistration.mockResolvedValue(null);
      repository.findBySerialNumber.mockResolvedValue(null);
      repository.create.mockResolvedValue(mockAircraft as any);

      await service.create(dtoWithoutStatus as any);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'AVAILABLE' })
      );
    });
  });

  // ==================== Update ====================

  describe('update', () => {
    const updateDto: UpdateAircraftDto = {
      model: 'DJI M350 RTK V2',
      manufacturer: 'DJI China',
    };

    it('should update aircraft when exists', async () => {
      repository.findById.mockResolvedValue(mockAircraft);
      const updatedAircraft = { ...mockAircraft, ...updateDto, updatedAt: Date.now() };
      repository.update.mockResolvedValue(updatedAircraft as any);

      const result = await service.update('aircraft-123', updateDto);

      expect(result).toEqual(updatedAircraft);
      expect(repository.findById).toHaveBeenCalledWith('aircraft-123');
      expect(repository.update).toHaveBeenCalledWith('aircraft-123', updateDto);
    });

    it('should throw NotFoundException when aircraft does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.update('non-existent', updateDto)).rejects.toThrow(NotFoundException);
      await expect(service.update('non-existent', updateDto)).rejects.toThrow('Aircraft not found');
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when new registration already exists', async () => {
      repository.findById.mockResolvedValue(mockAircraft);
      repository.findByRegistration.mockResolvedValue(mockAircraft);
      const updateWithReg: UpdateAircraftDto = { registrationNumber: 'B-9999' };

      await expect(service.update('aircraft-123', updateWithReg)).rejects.toThrow(ConflictException);
      await expect(service.update('aircraft-123', updateWithReg)).rejects.toThrow('Registration number already exists');
    });

    it('should not check registration when registration is unchanged', async () => {
      repository.findById.mockResolvedValue(mockAircraft);
      const updateWithSameReg: UpdateAircraftDto = { registrationNumber: 'B-1234' };
      repository.update.mockResolvedValue(mockAircraft as any);

      await service.update('aircraft-123', updateWithSameReg);

      // Should not call findByRegistration for uniqueness check since registration is unchanged
      expect(repository.findByRegistration).not.toHaveBeenCalled();
    });
  });

  // ==================== Add Flight Metrics ====================

  describe('addFlightMetrics', () => {
    it('should update flight metrics', async () => {
      repository.updateFlightMetrics.mockResolvedValue({
        ...mockAircraft,
        totalFlightHours: 110,
        totalFlightCycles: 210,
      } as any);

      const result = await service.addFlightMetrics('aircraft-123', 10, 10);

      expect(result.totalFlightHours).toBe(110);
      expect(result.totalFlightCycles).toBe(210);
      expect(repository.updateFlightMetrics).toHaveBeenCalledWith('aircraft-123', 10, 10);
    });
  });

  // ==================== Update Status ====================

  describe('updateStatus', () => {
    it('should update aircraft status', async () => {
      repository.updateStatus.mockResolvedValue({
        ...mockAircraft,
        status: 'IN_MAINTENANCE' as const,
      } as any);

      const result = await service.updateStatus('aircraft-123', 'IN_MAINTENANCE');

      expect(result.status).toBe('IN_MAINTENANCE');
      expect(repository.updateStatus).toHaveBeenCalledWith('aircraft-123', 'IN_MAINTENANCE', undefined);
    });

    it('should update status and airworthiness', async () => {
      repository.updateStatus.mockResolvedValue({
        ...mockAircraft,
        status: 'AOG' as const,
        isAirworthy: false,
      } as any);

      const result = await service.updateStatus('aircraft-123', 'AOG', false);

      expect(result.status).toBe('AOG');
      expect(result.isAirworthy).toBe(false);
      expect(repository.updateStatus).toHaveBeenCalledWith('aircraft-123', 'AOG', false);
    });
  });

  // ==================== Delete ====================

  describe('delete', () => {
    it('should delete aircraft when exists', async () => {
      repository.findById.mockResolvedValue(mockAircraft);
      repository.delete.mockResolvedValue(undefined);

      await service.delete('aircraft-123');

      expect(repository.findById).toHaveBeenCalledWith('aircraft-123');
      expect(repository.delete).toHaveBeenCalledWith('aircraft-123');
    });

    it('should throw NotFoundException when aircraft does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.delete('non-existent')).rejects.toThrow(NotFoundException);
      await expect(service.delete('non-existent')).rejects.toThrow('Aircraft not found');
      expect(repository.delete).not.toHaveBeenCalled();
    });
  });

  // ==================== List ====================

  describe('list', () => {
    it('should return list with default pagination', async () => {
      const aircraft = [mockAircraft];
      repository.list.mockResolvedValue(aircraft as any);

      const result = await service.list();

      expect(result).toEqual(aircraft);
      expect(repository.list).toHaveBeenCalledWith(50, 0);
    });

    it('should return list with custom pagination', async () => {
      const aircraft = [mockAircraft];
      repository.list.mockResolvedValue(aircraft as any);

      const result = await service.list(10, 5);

      expect(result).toEqual(aircraft);
      expect(repository.list).toHaveBeenCalledWith(10, 5);
    });

    it('should return empty array when no aircraft', async () => {
      repository.list.mockResolvedValue([]);

      const result = await service.list();

      expect(result).toEqual([]);
    });
  });

  // ==================== Get Status Counts ====================

  describe('getStatusCounts', () => {
    it('should return status counts for all fleets', async () => {
      const counts = { AVAILABLE: 5, MAINTENANCE: 2, GROUNDED: 1, RETIRED: 0 };
      repository.countByStatus.mockResolvedValue(counts);

      const result = await service.getStatusCounts();

      expect(result).toEqual(counts);
      expect(repository.countByStatus).toHaveBeenCalledWith(undefined);
    });

    it('should return status counts for specific fleet', async () => {
      const counts = { AVAILABLE: 2, MAINTENANCE: 1 };
      repository.countByStatus.mockResolvedValue(counts);

      const result = await service.getStatusCounts('fleet-123');

      expect(result).toEqual(counts);
      expect(repository.countByStatus).toHaveBeenCalledWith('fleet-123');
    });
  });
});
