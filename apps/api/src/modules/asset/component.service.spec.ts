/**
 * ComponentService Unit Tests
 *
 * Tests for component business logic
 */

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';

import {
  ComponentService,
  CreateComponentDto,
  UpdateComponentDto,
  InstallComponentDto,
  RemoveComponentDto,
} from './component.service';
import { ComponentRepository } from './repositories/component.repository';
import type { Component } from '@repo/db';

describe('ComponentService', () => {
  let service: ComponentService;
  let repository: jest.Mocked<ComponentRepository>;

  const mockComponent: Component = {
    id: 'comp-123',
    serialNumber: 'SN-12345',
    partNumber: 'PN-MOT-001',
    type: 'MOTOR' as const,
    manufacturer: 'DJI',
    model: 'M350 RTK',
    description: 'Left front motor',
    status: 'NEW' as const,
    isAirworthy: true,
    isLifeLimited: false,
    maxFlightHours: null,
    maxCycles: null,
    totalFlightHours: 0,
    totalFlightCycles: 0,
    batteryCycles: 0,
    manufacturedAt: Date.now() - 86400000,
    purchasedAt: Date.now() - 604800000,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const mockInstalledComponent: Component = {
    ...mockComponent,
    status: 'IN_USE' as const,
  };

  const mockLifeLimitedComponent: Component = {
    ...mockComponent,
    isLifeLimited: true,
    maxFlightHours: 500,
    maxCycles: 1000,
    totalFlightHours: 400,
    totalFlightCycles: 800,
  };

  const mockExceededComponent: Component = {
    ...mockLifeLimitedComponent,
    totalFlightHours: 600,
    totalFlightCycles: 1200,
  };

  beforeEach(async () => {
    const mockComponentRepository = {
      findById: jest.fn(),
      findBySerialNumber: jest.fn(),
      findBySerialWithInstallation: jest.fn(),
      list: jest.fn(),
      findInstalledOnAircraft: jest.fn(),
      findDueForMaintenance: jest.fn(),
      getCurrentInstallation: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      install: jest.fn(),
      remove: jest.fn(),
      updateLifecycleMetrics: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComponentService,
        { provide: ComponentRepository, useValue: mockComponentRepository },
      ],
    }).compile();

    service = module.get<ComponentService>(ComponentService);
    repository = module.get(ComponentRepository);
  });

  // ==================== Find By ID ====================

  describe('findById', () => {
    it('should return component when found', async () => {
      repository.findById.mockResolvedValue(mockComponent);

      const result = await service.findById('comp-123');

      expect(result).toEqual(mockComponent);
      expect(repository.findById).toHaveBeenCalledWith('comp-123');
    });

    it('should return null when not found', async () => {
      repository.findById.mockResolvedValue(null);

      const result = await service.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  // ==================== Find By Serial Number ====================

  describe('findBySerialNumber', () => {
    it('should return component with installation info', async () => {
      const mockWithInstall = {
        component: mockComponent,
        installation: null,
      };
      repository.findBySerialWithInstallation.mockResolvedValue(mockWithInstall as any);

      const result = await service.findBySerialNumber('SN-12345');

      expect(result).toEqual(mockWithInstall);
      expect(repository.findBySerialWithInstallation).toHaveBeenCalledWith('SN-12345');
    });

    it('should return null when serial not found', async () => {
      repository.findBySerialWithInstallation.mockResolvedValue(null);

      const result = await service.findBySerialNumber('UNKNOWN');

      expect(result).toBeNull();
    });
  });

  // ==================== List ====================

  describe('list', () => {
    it('should return components with default pagination', async () => {
      repository.list.mockResolvedValue([mockComponent]);

      const result = await service.list();

      expect(result).toEqual([mockComponent]);
      expect(repository.list).toHaveBeenCalledWith(50, 0);
    });

    it('should return components with custom pagination', async () => {
      repository.list.mockResolvedValue([mockComponent]);

      const result = await service.list(10, 20);

      expect(result).toEqual([mockComponent]);
      expect(repository.list).toHaveBeenCalledWith(10, 20);
    });
  });

  // ==================== Find Installed On Aircraft ====================

  describe('findInstalledOnAircraft', () => {
    it('should return components installed on aircraft', async () => {
      const mockInstalledWithDetails = [
        {
          ...mockInstalledComponent,
          installationId: 'install-123',
          aircraftId: 'aircraft-123',
          location: 'Left Front',
          flightHours: 100,
          cycles: 200,
          installedAt: Date.now(),
        },
      ] as any;
      repository.findInstalledOnAircraft.mockResolvedValue(mockInstalledWithDetails);

      const result = await service.findInstalledOnAircraft('aircraft-123');

      expect(result).toEqual(mockInstalledWithDetails);
      expect(repository.findInstalledOnAircraft).toHaveBeenCalledWith('aircraft-123');
    });

    it('should return empty array when no components installed', async () => {
      repository.findInstalledOnAircraft.mockResolvedValue([]);

      const result = await service.findInstalledOnAircraft('aircraft-123');

      expect(result).toEqual([]);
    });
  });

  // ==================== Create ====================

  describe('create', () => {
    const createDto: CreateComponentDto = {
      serialNumber: 'SN-NEW-001',
      partNumber: 'PN-NEW-001',
      type: 'MOTOR' as const,
      manufacturer: 'DJI',
      model: 'M350 RTK',
      description: 'New motor',
    };

    it('should create component with default values', async () => {
      repository.findBySerialNumber.mockResolvedValue(null);
      repository.create.mockResolvedValue(mockComponent);

      const result = await service.create(createDto);

      expect(repository.create).toHaveBeenCalledWith({
        ...createDto,
        status: 'NEW',
        isAirworthy: true,
        totalFlightHours: 0,
        totalFlightCycles: 0,
        batteryCycles: 0,
      });
    });

    it('should throw ConflictException when serial number exists', async () => {
      repository.findBySerialNumber.mockResolvedValue(mockComponent);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
      await expect(service.create(createDto)).rejects.toThrow('Component serial number already exists');
    });
  });

  // ==================== Update ====================

  describe('update', () => {
    const updateDto: UpdateComponentDto = {
      partNumber: 'PN-UPDATED',
      status: 'REPAIRED' as const,
    };

    it('should update component successfully', async () => {
      repository.findById.mockResolvedValue(mockComponent);
      const updated = { ...mockComponent, ...updateDto };
      repository.update.mockResolvedValue(updated);

      const result = await service.update('comp-123', updateDto);

      expect(result).toEqual(updated);
      expect(repository.update).toHaveBeenCalledWith('comp-123', updateDto);
    });

    it('should throw NotFoundException when component not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.update('non-existent', updateDto)).rejects.toThrow(NotFoundException);
      await expect(service.update('non-existent', updateDto)).rejects.toThrow('Component not found');
    });
  });

  // ==================== Delete ====================

  describe('delete', () => {
    it('should delete component successfully', async () => {
      repository.findById.mockResolvedValue(mockComponent);
      repository.delete.mockResolvedValue(undefined);

      await expect(service.delete('comp-123')).resolves.toBeUndefined();
      expect(repository.delete).toHaveBeenCalledWith('comp-123');
    });

    it('should throw NotFoundException when component not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.delete('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  // ==================== Install ====================

  describe('install', () => {
    const installDto: InstallComponentDto = {
      componentId: 'comp-123',
      aircraftId: 'aircraft-123',
      location: 'Left Front',
      installNotes: 'Installed during scheduled maintenance',
    };

    it('should install component successfully', async () => {
      repository.findById.mockResolvedValue(mockComponent);
      repository.getCurrentInstallation.mockResolvedValue(null);
      repository.install.mockResolvedValue(undefined);
      repository.update.mockResolvedValue(mockInstalledComponent);

      const result = await service.install(installDto);

      expect(result).toEqual({
        componentId: 'comp-123',
        aircraftId: 'aircraft-123',
        location: 'Left Front',
        message: 'Component installed successfully',
      });
      expect(repository.install).toHaveBeenCalledWith('comp-123', 'aircraft-123', 'Left Front', 'Installed during scheduled maintenance');
      expect(repository.update).toHaveBeenCalledWith('comp-123', { status: 'IN_USE' });
    });

    it('should throw NotFoundException when component not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.install(installDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when component is not airworthy', async () => {
      const notAirworthy = { ...mockComponent, isAirworthy: false };
      repository.findById.mockResolvedValue(notAirworthy);

      await expect(service.install(installDto)).rejects.toThrow(ConflictException);
      await expect(service.install(installDto)).rejects.toThrow('Cannot install non-airworthy component');
    });

    it('should throw ConflictException when life limited component exceeded flight hours', async () => {
      repository.findById.mockResolvedValue(mockExceededComponent);

      await expect(service.install(installDto)).rejects.toThrow(ConflictException);
      await expect(service.install(installDto)).rejects.toThrow(
        `Component has exceeded flight hour limit (${mockExceededComponent.totalFlightHours}/${mockExceededComponent.maxFlightHours})`
      );
    });

    it('should throw ConflictException when life limited component exceeded cycles', async () => {
      const exceededCyclesOnly = {
        ...mockLifeLimitedComponent,
        totalFlightHours: 400,
        totalFlightCycles: 1200,
      };
      repository.findById.mockResolvedValue(exceededCyclesOnly);

      await expect(service.install(installDto)).rejects.toThrow(ConflictException);
      await expect(service.install(installDto)).rejects.toThrow(
        `Component has exceeded cycle limit (${exceededCyclesOnly.totalFlightCycles}/${exceededCyclesOnly.maxCycles})`
      );
    });

    it('should auto-remove from current aircraft when already installed', async () => {
      repository.findById.mockResolvedValue(mockInstalledComponent);
      repository.getCurrentInstallation.mockResolvedValue({
        aircraftId: 'aircraft-old',
        location: 'Old Location',
      } as any);
      repository.remove.mockResolvedValue(undefined);
      repository.install.mockResolvedValue(undefined);
      repository.update.mockResolvedValue(mockInstalledComponent);

      await service.install(installDto);

      expect(repository.remove).toHaveBeenCalledWith('comp-123', 'Auto-removed during installation to aircraft aircraft-123');
    });

    it('should allow installation of life limited component within limits', async () => {
      repository.findById.mockResolvedValue(mockLifeLimitedComponent);
      repository.getCurrentInstallation.mockResolvedValue(null);
      repository.install.mockResolvedValue(undefined);
      repository.update.mockResolvedValue(mockInstalledComponent);

      const result = await service.install(installDto);

      expect(result.componentId).toBe('comp-123');
      expect(repository.install).toHaveBeenCalled();
    });
  });

  // ==================== Remove ====================

  describe('remove', () => {
    const removeDto: RemoveComponentDto = {
      componentId: 'comp-123',
      removeNotes: 'Removed for replacement',
    };

    it('should remove component successfully', async () => {
      repository.findById.mockResolvedValue(mockInstalledComponent);
      repository.getCurrentInstallation.mockResolvedValue({
        aircraftId: 'aircraft-123',
        location: 'Left Front',
      } as any);
      repository.remove.mockResolvedValue(undefined);
      repository.update.mockResolvedValue(mockComponent);

      const result = await service.remove(removeDto);

      expect(result).toEqual({
        componentId: 'comp-123',
        message: 'Component removed successfully',
        previousAircraftId: 'aircraft-123',
      });
      expect(repository.remove).toHaveBeenCalledWith('comp-123', 'Removed for replacement');
      expect(repository.update).toHaveBeenCalledWith('comp-123', { status: 'NEW' });
    });

    it('should throw NotFoundException when component not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.remove(removeDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when component is not installed', async () => {
      repository.findById.mockResolvedValue(mockComponent); // status is NEW

      await expect(service.remove(removeDto)).rejects.toThrow(ConflictException);
      await expect(service.remove(removeDto)).rejects.toThrow('Component is not currently installed');
    });

    it('should handle removal when no installation record exists', async () => {
      repository.findById.mockResolvedValue(mockInstalledComponent);
      repository.getCurrentInstallation.mockResolvedValue(null);
      repository.remove.mockResolvedValue(undefined);
      repository.update.mockResolvedValue(mockComponent);

      const result = await service.remove(removeDto);

      expect(result.previousAircraftId).toBeNull();
    });
  });

  // ==================== Find Due For Maintenance ====================

  describe('findDueForMaintenance', () => {
    it('should return components due for maintenance', async () => {
      const dueComponents = [mockComponent, mockLifeLimitedComponent];
      repository.findDueForMaintenance.mockResolvedValue(dueComponents as any);

      const result = await service.findDueForMaintenance();

      expect(result).toEqual(dueComponents);
      expect(repository.findDueForMaintenance).toHaveBeenCalled();
    });

    it('should return empty array when no components due', async () => {
      repository.findDueForMaintenance.mockResolvedValue([]);

      const result = await service.findDueForMaintenance();

      expect(result).toEqual([]);
    });
  });

  // ==================== Update Lifecycle Metrics ====================

  describe('updateLifecycleMetrics', () => {
    it('should update component lifecycle metrics', async () => {
      const updatedComponent = {
        ...mockComponent,
        totalFlightHours: 110,
        totalFlightCycles: 210,
      };
      repository.updateLifecycleMetrics.mockResolvedValue(updatedComponent);

      const result = await service.updateLifecycleMetrics('comp-123', 10, 10);

      expect(result).toEqual(updatedComponent);
      expect(repository.updateLifecycleMetrics).toHaveBeenCalledWith('comp-123', 10, 10, undefined);
    });

    it('should update battery cycles when provided', async () => {
      const updatedComponent = {
        ...mockComponent,
        totalFlightHours: 110,
        totalFlightCycles: 210,
        batteryCycles: 5,
      };
      repository.updateLifecycleMetrics.mockResolvedValue(updatedComponent);

      await service.updateLifecycleMetrics('comp-123', 10, 10, 5);

      expect(repository.updateLifecycleMetrics).toHaveBeenCalledWith('comp-123', 10, 10, 5);
    });
  });
});
