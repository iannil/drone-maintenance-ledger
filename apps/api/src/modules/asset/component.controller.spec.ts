/**
 * ComponentController Unit Tests
 *
 * Tests for component management endpoints
 */

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';

import { ComponentController } from './component.controller';
import { ComponentService } from './component.service';

describe('ComponentController', () => {
  let controller: ComponentController;
  let componentService: jest.Mocked<ComponentService>;

  const mockComponent = {
    id: 'component-123',
    serialNumber: 'SN-MOTOR-001',
    partNumber: 'PN-MOT-001',
    type: 'MOTOR' as const,
    manufacturer: 'T-Motor',
    model: 'U13 KV100',
    description: '高效无刷电机',
    status: 'IN_USE' as const,
    isAirworthy: true,
    isLifeLimited: true,
    maxFlightHours: 500,
    maxCycles: 1000,
    totalFlightHours: 150.5,
    totalFlightCycles: 320,
    batteryCycles: 0,
    manufacturedAt: Date.now() - 365 * 24 * 60 * 60 * 1000,
    purchasedAt: Date.now() - 300 * 24 * 60 * 60 * 1000,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  // Mock for findBySerialNumber which returns component with installation info
  const mockComponentWithInstallation = {
    component: mockComponent,
    installation: {
      id: 'install-123',
      componentId: 'component-123',
      aircraftId: 'aircraft-123',
      location: '前左电机',
      flightHours: 150.5,
      flightCycles: 320,
      installedAt: Date.now() - 100 * 24 * 60 * 60 * 1000,
      removedAt: null,
      installNotes: null,
      removeNotes: null,
    },
  };

  // Mock for findInstalledOnAircraft which returns installed components with extra fields
  const mockInstalledComponent = {
    ...mockComponent,
    installationId: 'install-123',
    aircraftId: 'aircraft-123',
    location: '前左电机',
    flightHours: 150.5,
    flightCycles: 320,
    installedAt: Date.now() - 100 * 24 * 60 * 60 * 1000,
    removedAt: null,
    installNotes: null,
  };

  const mockComponentList = [
    mockComponent,
    {
      ...mockComponent,
      id: 'component-456',
      serialNumber: 'SN-MOTOR-002',
      type: 'PROPELLER' as const,
      status: 'NEW' as const,
      totalFlightHours: 0,
      totalFlightCycles: 0,
    },
  ];

  beforeEach(async () => {
    const mockComponentService = {
      findById: jest.fn(),
      findBySerialNumber: jest.fn(),
      findInstalledOnAircraft: jest.fn(),
      findDueForMaintenance: jest.fn(),
      list: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      install: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComponentController],
      providers: [{ provide: ComponentService, useValue: mockComponentService }],
    }).compile();

    controller = module.get<ComponentController>(ComponentController);
    componentService = module.get(ComponentService);
  });

  describe('GET /components/:id', () => {
    it('should return component by ID', async () => {
      componentService.findById.mockResolvedValue(mockComponent);

      const result = await controller.getById('component-123');

      expect(result).toEqual(mockComponent);
      expect(componentService.findById).toHaveBeenCalledWith('component-123');
    });

    it('should return null for non-existent component', async () => {
      componentService.findById.mockResolvedValue(null);

      const result = await controller.getById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('GET /components/serial/:serialNumber', () => {
    it('should return component by serial number', async () => {
      componentService.findBySerialNumber.mockResolvedValue(mockComponentWithInstallation as any);

      const result = await controller.getBySerial('SN-MOTOR-001');

      expect(result).toEqual(mockComponentWithInstallation);
      expect(componentService.findBySerialNumber).toHaveBeenCalledWith('SN-MOTOR-001');
    });

    it('should return null for non-existent serial number', async () => {
      componentService.findBySerialNumber.mockResolvedValue(null);

      const result = await controller.getBySerial('NON-EXISTENT');

      expect(result).toBeNull();
    });
  });

  describe('GET /components', () => {
    it('should return list of components with default pagination', async () => {
      componentService.list.mockResolvedValue(mockComponentList);

      const result = await controller.list();

      expect(result).toEqual(mockComponentList);
      expect(componentService.list).toHaveBeenCalledWith(50, 0);
    });

    it('should return list with custom pagination', async () => {
      componentService.list.mockResolvedValue([mockComponent]);

      const result = await controller.list(10, 5);

      expect(result).toEqual([mockComponent]);
      expect(componentService.list).toHaveBeenCalledWith(10, 5);
    });

    it('should filter by aircraftId when provided', async () => {
      componentService.findInstalledOnAircraft.mockResolvedValue([mockInstalledComponent] as any);

      const result = await controller.list(50, 0, 'aircraft-123');

      expect(result).toEqual([mockInstalledComponent]);
      expect(componentService.findInstalledOnAircraft).toHaveBeenCalledWith('aircraft-123');
      expect(componentService.list).not.toHaveBeenCalled();
    });

    it('should handle empty list', async () => {
      componentService.list.mockResolvedValue([]);

      const result = await controller.list();

      expect(result).toEqual([]);
    });
  });

  describe('GET /components/maintenance/due', () => {
    it('should return components due for maintenance', async () => {
      componentService.findDueForMaintenance.mockResolvedValue([mockComponent]);

      const result = await controller.getDueForMaintenance();

      expect(result).toEqual([mockComponent]);
      expect(componentService.findDueForMaintenance).toHaveBeenCalled();
    });

    it('should return empty array when no components due', async () => {
      componentService.findDueForMaintenance.mockResolvedValue([]);

      const result = await controller.getDueForMaintenance();

      expect(result).toEqual([]);
    });
  });

  describe('POST /components', () => {
    const createDto = {
      serialNumber: 'SN-NEW-001',
      partNumber: 'PN-NEW-001',
      type: 'BATTERY' as const,
      manufacturer: 'DJI',
      model: 'TB60',
      isLifeLimited: true,
      maxCycles: 300,
    };

    it('should create a new component', async () => {
      const newComponent = {
        id: 'component-new',
        ...createDto,
        status: 'NEW' as const,
        isAirworthy: true,
        totalFlightHours: 0,
        totalFlightCycles: 0,
        batteryCycles: 0,
        description: null,
        maxFlightHours: null,
        manufacturedAt: null,
        purchasedAt: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      componentService.create.mockResolvedValue(newComponent);

      const result = await controller.create(createDto);

      expect(result).toEqual(newComponent);
      expect(componentService.create).toHaveBeenCalledWith(createDto);
    });

    it('should throw ConflictException for duplicate serial number', async () => {
      componentService.create.mockRejectedValue(new ConflictException('Serial number already exists'));

      await expect(controller.create(createDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('POST /components/install', () => {
    const installDto = {
      componentId: 'component-123',
      aircraftId: 'aircraft-123',
      location: '前左电机',
      installNotes: '新件安装',
    };

    it('should install component on aircraft', async () => {
      const installResult = {
        componentId: installDto.componentId,
        aircraftId: installDto.aircraftId,
        location: installDto.location,
        message: 'Component installed successfully',
      };
      componentService.install.mockResolvedValue(installResult);

      const result = await controller.install(installDto);

      expect(result).toEqual(installResult);
      expect(componentService.install).toHaveBeenCalledWith(installDto);
    });

    it('should throw NotFoundException for non-existent component', async () => {
      componentService.install.mockRejectedValue(new NotFoundException('Component not found'));

      await expect(controller.install(installDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException for non-airworthy component', async () => {
      componentService.install.mockRejectedValue(new ConflictException('Component is not airworthy'));

      await expect(controller.install(installDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('POST /components/remove', () => {
    const removeDto = {
      componentId: 'component-123',
      removeNotes: '定期检查拆卸',
    };

    it('should remove component from aircraft', async () => {
      const removeResult = {
        componentId: removeDto.componentId,
        message: 'Component removed successfully',
        previousAircraftId: 'aircraft-123',
      };
      componentService.remove.mockResolvedValue(removeResult);

      const result = await controller.remove(removeDto);

      expect(result).toEqual(removeResult);
      expect(componentService.remove).toHaveBeenCalledWith(removeDto);
    });

    it('should throw NotFoundException for non-existent component', async () => {
      componentService.remove.mockRejectedValue(new NotFoundException('Component not found'));

      await expect(controller.remove(removeDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException for component not installed', async () => {
      componentService.remove.mockRejectedValue(new ConflictException('Component is not currently installed'));

      await expect(controller.remove(removeDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('PUT /components/:id', () => {
    const updateDto = {
      status: 'OVERHAULED' as const,
      isAirworthy: true,
      description: '已完成大修',
    };

    it('should update component', async () => {
      const updatedComponent = { ...mockComponent, ...updateDto, updatedAt: Date.now() };
      componentService.update.mockResolvedValue(updatedComponent);

      const result = await controller.update('component-123', updateDto);

      expect(result).toEqual(updatedComponent);
      expect(componentService.update).toHaveBeenCalledWith('component-123', updateDto);
    });

    it('should throw NotFoundException for non-existent component', async () => {
      componentService.update.mockRejectedValue(new NotFoundException('Component not found'));

      await expect(controller.update('non-existent', updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('DELETE /components/:id', () => {
    it('should delete component and return success', async () => {
      componentService.delete.mockResolvedValue(undefined);

      const result = await controller.delete('component-123');

      expect(result).toEqual({ success: true });
      expect(componentService.delete).toHaveBeenCalledWith('component-123');
    });

    it('should throw NotFoundException for non-existent component', async () => {
      componentService.delete.mockRejectedValue(new NotFoundException('Component not found'));

      await expect(controller.delete('non-existent')).rejects.toThrow(NotFoundException);
    });
  });
});
