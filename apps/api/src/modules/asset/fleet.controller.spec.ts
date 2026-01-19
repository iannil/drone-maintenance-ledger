/**
 * FleetController Unit Tests
 *
 * Tests for fleet management endpoints
 */

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';

import { FleetController } from './fleet.controller';
import { FleetService } from './fleet.service';

describe('FleetController', () => {
  let controller: FleetController;
  let fleetService: jest.Mocked<FleetService>;

  const mockFleet = {
    id: 'fleet-123',
    name: '华北巡检队',
    code: 'HB-PATROL-01',
    organization: '北京分公司',
    description: '负责华北地区电网巡检任务',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const mockFleetList = [
    mockFleet,
    {
      id: 'fleet-456',
      name: '华南巡检队',
      code: 'HN-PATROL-01',
      organization: '广州分公司',
      description: '负责华南地区电网巡检任务',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ];

  beforeEach(async () => {
    const mockFleetService = {
      findById: jest.fn(),
      findByCode: jest.fn(),
      list: jest.fn(),
      search: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FleetController],
      providers: [{ provide: FleetService, useValue: mockFleetService }],
    }).compile();

    controller = module.get<FleetController>(FleetController);
    fleetService = module.get(FleetService);
  });

  describe('GET /fleets/:id', () => {
    it('should return fleet by ID', async () => {
      fleetService.findById.mockResolvedValue(mockFleet);

      const result = await controller.getById('fleet-123');

      expect(result).toEqual(mockFleet);
      expect(fleetService.findById).toHaveBeenCalledWith('fleet-123');
    });

    it('should return null for non-existent fleet', async () => {
      fleetService.findById.mockResolvedValue(null);

      const result = await controller.getById('non-existent');

      expect(result).toBeNull();
      expect(fleetService.findById).toHaveBeenCalledWith('non-existent');
    });
  });

  describe('GET /fleets', () => {
    it('should return list of fleets with default pagination', async () => {
      fleetService.list.mockResolvedValue(mockFleetList);

      const result = await controller.list();

      expect(result).toEqual(mockFleetList);
      expect(fleetService.list).toHaveBeenCalledWith(50, 0);
    });

    it('should return list with custom pagination', async () => {
      fleetService.list.mockResolvedValue([mockFleet]);

      const result = await controller.list('10', '5');

      expect(result).toEqual([mockFleet]);
      expect(fleetService.list).toHaveBeenCalledWith(10, 5);
    });

    it('should handle empty list', async () => {
      fleetService.list.mockResolvedValue([]);

      const result = await controller.list();

      expect(result).toEqual([]);
    });
  });

  describe('GET /fleets/search/:query', () => {
    it('should return search results', async () => {
      fleetService.search.mockResolvedValue([mockFleet]);

      const result = await controller.search('华北');

      expect(result).toEqual([mockFleet]);
      expect(fleetService.search).toHaveBeenCalledWith('华北', 50);
    });

    it('should return search results with custom limit', async () => {
      fleetService.search.mockResolvedValue(mockFleetList);

      const result = await controller.search('巡检', '100');

      expect(result).toEqual(mockFleetList);
      expect(fleetService.search).toHaveBeenCalledWith('巡检', 100);
    });

    it('should return empty array for no matches', async () => {
      fleetService.search.mockResolvedValue([]);

      const result = await controller.search('不存在');

      expect(result).toEqual([]);
    });
  });

  describe('POST /fleets', () => {
    const createDto = {
      name: '新建机队',
      code: 'NEW-FLEET-01',
      organization: '测试组织',
      description: '测试机队描述',
    };

    it('should create a new fleet', async () => {
      const newFleet = { id: 'fleet-new', ...createDto, createdAt: Date.now(), updatedAt: Date.now() };
      fleetService.create.mockResolvedValue(newFleet);

      const result = await controller.create(createDto);

      expect(result).toEqual(newFleet);
      expect(fleetService.create).toHaveBeenCalledWith(createDto);
    });

    it('should throw ConflictException for duplicate code', async () => {
      fleetService.create.mockRejectedValue(new ConflictException('Fleet code already exists'));

      await expect(controller.create(createDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('PUT /fleets/:id', () => {
    const updateDto = {
      name: '更新后的机队名称',
      description: '更新后的描述',
    };

    it('should update fleet', async () => {
      const updatedFleet = { ...mockFleet, ...updateDto, updatedAt: Date.now() };
      fleetService.update.mockResolvedValue(updatedFleet);

      const result = await controller.update('fleet-123', updateDto);

      expect(result).toEqual(updatedFleet);
      expect(fleetService.update).toHaveBeenCalledWith('fleet-123', updateDto);
    });

    it('should throw NotFoundException for non-existent fleet', async () => {
      fleetService.update.mockRejectedValue(new NotFoundException('Fleet not found'));

      await expect(controller.update('non-existent', updateDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException for duplicate code', async () => {
      fleetService.update.mockRejectedValue(new ConflictException('Fleet code already exists'));

      await expect(controller.update('fleet-123', { code: 'DUPLICATE-CODE' })).rejects.toThrow(ConflictException);
    });
  });

  describe('DELETE /fleets/:id', () => {
    it('should delete fleet and return success', async () => {
      fleetService.delete.mockResolvedValue(undefined);

      const result = await controller.delete('fleet-123');

      expect(result).toEqual({ success: true });
      expect(fleetService.delete).toHaveBeenCalledWith('fleet-123');
    });

    it('should throw NotFoundException for non-existent fleet', async () => {
      fleetService.delete.mockRejectedValue(new NotFoundException('Fleet not found'));

      await expect(controller.delete('non-existent')).rejects.toThrow(NotFoundException);
    });
  });
});
