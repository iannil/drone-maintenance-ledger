/**
 * FleetService Unit Tests
 *
 * Tests for fleet business logic
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';

import { FleetService, CreateFleetDto, UpdateFleetDto } from './fleet.service';
import { FleetRepository } from './repositories/fleet.repository';
import type { Fleet } from '@repo/db';

describe('FleetService', () => {
  let service: FleetService;
  let repository: jest.Mocked<FleetRepository>;

  const mockFleet: Fleet = {
    id: 'fleet-123',
    name: '华北巡检队',
    code: 'HB-PATROL-01',
    organization: '北京分公司',
    description: '负责华北地区电网巡检任务',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  beforeEach(async () => {
    const mockFleetRepository = {
      findById: jest.fn(),
      findByCode: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      list: jest.fn(),
      search: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FleetService,
        { provide: FleetRepository, useValue: mockFleetRepository },
      ],
    }).compile();

    service = module.get<FleetService>(FleetService);
    repository = module.get(FleetRepository);
  });

  // ==================== Find By ID ====================

  describe('findById', () => {
    it('should return fleet when found', async () => {
      repository.findById.mockResolvedValue(mockFleet);

      const result = await service.findById('fleet-123');

      expect(result).toEqual(mockFleet);
      expect(repository.findById).toHaveBeenCalledWith('fleet-123');
    });

    it('should return null when not found', async () => {
      repository.findById.mockResolvedValue(null);

      const result = await service.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  // ==================== Find By Code ====================

  describe('findByCode', () => {
    it('should return fleet when code exists', async () => {
      repository.findByCode.mockResolvedValue(mockFleet);

      const result = await service.findByCode('HB-PATROL-01');

      expect(result).toEqual(mockFleet);
      expect(repository.findByCode).toHaveBeenCalledWith('HB-PATROL-01');
    });

    it('should return null when code does not exist', async () => {
      repository.findByCode.mockResolvedValue(null);

      const result = await service.findByCode('NON-EXISTENT');

      expect(result).toBeNull();
    });
  });

  // ==================== Create ====================

  describe('create', () => {
    const createDto: CreateFleetDto = {
      name: '华东巡检队',
      code: 'HD-PATROL-01',
      organization: '上海分公司',
      description: '负责华东地区巡检',
    };

    it('should create fleet when code is unique', async () => {
      repository.findByCode.mockResolvedValue(null);
      repository.create.mockResolvedValue({
        ...mockFleet,
        id: 'fleet-new',
        ...createDto,
      } as any);

      const result = await service.create(createDto);

      expect(result).toBeDefined();
      expect(repository.findByCode).toHaveBeenCalledWith(createDto.code);
      expect(repository.create).toHaveBeenCalledWith(createDto);
    });

    it('should throw ConflictException when code exists', async () => {
      repository.findByCode.mockResolvedValue(mockFleet);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
      await expect(service.create(createDto)).rejects.toThrow('Fleet code already exists');
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  // ==================== Update ====================

  describe('update', () => {
    const updateDto: UpdateFleetDto = {
      name: '更新后的机队名称',
      organization: '新组织',
    };

    it('should update fleet when exists', async () => {
      repository.findById.mockResolvedValue(mockFleet);
      const updatedFleet = { ...mockFleet, ...updateDto, updatedAt: Date.now() };
      repository.update.mockResolvedValue(updatedFleet as any);

      const result = await service.update('fleet-123', updateDto);

      expect(result).toEqual(updatedFleet);
      expect(repository.findById).toHaveBeenCalledWith('fleet-123');
      expect(repository.update).toHaveBeenCalledWith('fleet-123', updateDto);
    });

    it('should throw NotFoundException when fleet does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.update('non-existent', updateDto)).rejects.toThrow(NotFoundException);
      await expect(service.update('non-existent', updateDto)).rejects.toThrow('Fleet not found');
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should update with new code when code is unique', async () => {
      repository.findById.mockResolvedValue(mockFleet);
      repository.findByCode.mockResolvedValue(null);
      const updateWithCode: UpdateFleetDto = { code: 'NEW-CODE' };
      repository.update.mockResolvedValue({
        ...mockFleet,
        ...updateWithCode,
      } as any);

      const result = await service.update('fleet-123', updateWithCode);

      expect(result.code).toBe('NEW-CODE');
      expect(repository.findByCode).toHaveBeenCalledWith('NEW-CODE');
    });

    it('should throw ConflictException when new code already exists', async () => {
      repository.findById.mockResolvedValue(mockFleet);
      repository.findByCode.mockResolvedValue(mockFleet);
      const updateWithCode: UpdateFleetDto = { code: 'EXISTING-CODE' };

      await expect(service.update('fleet-123', updateWithCode)).rejects.toThrow(ConflictException);
      await expect(service.update('fleet-123', updateWithCode)).rejects.toThrow('Fleet code already exists');
    });

    it('should not check code uniqueness when code is unchanged', async () => {
      repository.findById.mockResolvedValue(mockFleet);
      const updateWithSameCode: UpdateFleetDto = { code: 'HB-PATROL-01' };
      repository.update.mockResolvedValue(mockFleet as any);

      await service.update('fleet-123', updateWithSameCode);

      // Should not call findByCode for uniqueness check since code is unchanged
      expect(repository.findByCode).not.toHaveBeenCalled();
    });
  });

  // ==================== Delete ====================

  describe('delete', () => {
    it('should delete fleet when exists', async () => {
      repository.findById.mockResolvedValue(mockFleet);
      repository.delete.mockResolvedValue(undefined);

      await service.delete('fleet-123');

      expect(repository.findById).toHaveBeenCalledWith('fleet-123');
      expect(repository.delete).toHaveBeenCalledWith('fleet-123');
    });

    it('should throw NotFoundException when fleet does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.delete('non-existent')).rejects.toThrow(NotFoundException);
      await expect(service.delete('non-existent')).rejects.toThrow('Fleet not found');
      expect(repository.delete).not.toHaveBeenCalled();
    });
  });

  // ==================== List ====================

  describe('list', () => {
    it('should return list with default pagination', async () => {
      const fleets = [mockFleet];
      repository.list.mockResolvedValue(fleets as any);

      const result = await service.list();

      expect(result).toEqual(fleets);
      expect(repository.list).toHaveBeenCalledWith(50, 0);
    });

    it('should return list with custom pagination', async () => {
      const fleets = [mockFleet];
      repository.list.mockResolvedValue(fleets as any);

      const result = await service.list(10, 5);

      expect(result).toEqual(fleets);
      expect(repository.list).toHaveBeenCalledWith(10, 5);
    });

    it('should return empty array when no fleets', async () => {
      repository.list.mockResolvedValue([]);

      const result = await service.list();

      expect(result).toEqual([]);
    });
  });

  // ==================== Search ====================

  describe('search', () => {
    it('should return search results with default limit', async () => {
      const results = [mockFleet];
      repository.search.mockResolvedValue(results as any);

      const result = await service.search('华北');

      expect(result).toEqual(results);
      expect(repository.search).toHaveBeenCalledWith('华北', 50);
    });

    it('should return search results with custom limit', async () => {
      const results = [mockFleet];
      repository.search.mockResolvedValue(results as any);

      const result = await service.search('PATROL', 10);

      expect(result).toEqual(results);
      expect(repository.search).toHaveBeenCalledWith('PATROL', 10);
    });

    it('should return empty array for no matches', async () => {
      repository.search.mockResolvedValue([]);

      const result = await service.search('不存在的机队');

      expect(result).toEqual([]);
    });
  });
});
