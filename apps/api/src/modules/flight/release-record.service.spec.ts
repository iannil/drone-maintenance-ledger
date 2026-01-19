/**
 * ReleaseRecordService Unit Tests
 *
 * Tests for release record business logic
 */

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

import {
  ReleaseRecordService,
  CreateReleaseRecordDto,
  UpdateReleaseRecordDto,
  SignReleaseDto,
} from './release-record.service';
import { ReleaseRecordRepository } from './repositories/release-record.repository';
import type { ReleaseRecord } from '@repo/db';

describe('ReleaseRecordService', () => {
  let service: ReleaseRecordService;
  let repository: jest.Mocked<ReleaseRecordRepository>;

  const mockReleaseRecord: ReleaseRecord = {
    id: 'release-123',
    aircraftId: 'aircraft-123',
    workOrderId: 'wo-123',
    releasedBy: 'inspector-123',
    releaseStatus: 'FULL' as const,
    releaseCertificateNumber: 'RC-2026-001',
    conditions: null,
    workDescription: '完成 50 小时定检',
    limitations: null,
    signatureHash: null,
    isValid: true,
    supersededBy: null,
    isActive: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const mockSignedRelease: ReleaseRecord = {
    ...mockReleaseRecord,
    signatureHash: 'abc123def456',
  };

  beforeEach(async () => {
    const mockReleaseRecordRepository = {
      findById: jest.fn(),
      findByAircraft: jest.fn(),
      findCurrentRelease: jest.fn(),
      findByWorkOrder: jest.fn(),
      findRecent: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      supersede: jest.fn(),
      addSignature: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReleaseRecordService,
        { provide: ReleaseRecordRepository, useValue: mockReleaseRecordRepository },
      ],
    }).compile();

    service = module.get<ReleaseRecordService>(ReleaseRecordService);
    repository = module.get(ReleaseRecordRepository);
  });

  // ==================== Find By ID ====================

  describe('findById', () => {
    it('should return release record when found', async () => {
      repository.findById.mockResolvedValue(mockReleaseRecord);

      const result = await service.findById('release-123');

      expect(result).toEqual(mockReleaseRecord);
      expect(repository.findById).toHaveBeenCalledWith('release-123');
    });

    it('should return null when not found', async () => {
      repository.findById.mockResolvedValue(null);

      const result = await service.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  // ==================== Find By Aircraft ====================

  describe('findByAircraft', () => {
    it('should return records for aircraft with default pagination', async () => {
      const records = [mockReleaseRecord];
      repository.findByAircraft.mockResolvedValue(records as any);

      const result = await service.findByAircraft('aircraft-123');

      expect(result).toEqual(records);
      expect(repository.findByAircraft).toHaveBeenCalledWith('aircraft-123', 50, 0);
    });

    it('should return records for aircraft with custom pagination', async () => {
      const records = [mockReleaseRecord];
      repository.findByAircraft.mockResolvedValue(records as any);

      const result = await service.findByAircraft('aircraft-123', 10, 5);

      expect(result).toEqual(records);
      expect(repository.findByAircraft).toHaveBeenCalledWith('aircraft-123', 10, 5);
    });
  });

  // ==================== Find Current Release ====================

  describe('findCurrentRelease', () => {
    it('should return current release for aircraft', async () => {
      repository.findCurrentRelease.mockResolvedValue(mockReleaseRecord);

      const result = await service.findCurrentRelease('aircraft-123');

      expect(result).toEqual(mockReleaseRecord);
      expect(repository.findCurrentRelease).toHaveBeenCalledWith('aircraft-123');
    });

    it('should return null when no current release', async () => {
      repository.findCurrentRelease.mockResolvedValue(null);

      const result = await service.findCurrentRelease('aircraft-123');

      expect(result).toBeNull();
    });
  });

  // ==================== Find By Work Order ====================

  describe('findByWorkOrder', () => {
    it('should return records for work order', async () => {
      const records = [mockReleaseRecord];
      repository.findByWorkOrder.mockResolvedValue(records as any);

      const result = await service.findByWorkOrder('wo-123');

      expect(result).toEqual(records);
      expect(repository.findByWorkOrder).toHaveBeenCalledWith('wo-123');
    });
  });

  // ==================== Get Recent ====================

  describe('getRecent', () => {
    it('should return recent records with default limit', async () => {
      const records = [mockReleaseRecord];
      repository.findRecent.mockResolvedValue(records as any);

      const result = await service.getRecent();

      expect(result).toEqual(records);
      expect(repository.findRecent).toHaveBeenCalledWith(20);
    });

    it('should return recent records with custom limit', async () => {
      const records = [mockReleaseRecord];
      repository.findRecent.mockResolvedValue(records as any);

      const result = await service.getRecent(10);

      expect(result).toEqual(records);
      expect(repository.findRecent).toHaveBeenCalledWith(10);
    });
  });

  // ==================== Create ====================

  describe('create', () => {
    const createDto: CreateReleaseRecordDto = {
      aircraftId: 'aircraft-123',
      workOrderId: 'wo-123',
      releaseStatus: 'FULL' as const,
      workDescription: '完成定检',
    };

    it('should create release record without superseding', async () => {
      repository.findCurrentRelease.mockResolvedValue(null);
      repository.create.mockResolvedValue({
        ...mockReleaseRecord,
        ...createDto,
      } as any);

      const result = await service.create('inspector-123', createDto);

      expect(result).toBeDefined();
      expect(repository.findCurrentRelease).toHaveBeenCalledWith('aircraft-123');
      expect(repository.create).toHaveBeenCalledWith({
        ...createDto,
        releasedBy: 'inspector-123',
      });
      expect(repository.supersede).not.toHaveBeenCalled();
    });

    it('should supersede existing current release', async () => {
      repository.findCurrentRelease.mockResolvedValue(mockReleaseRecord);
      const newRelease = { ...mockReleaseRecord, id: 'release-new' };
      repository.create.mockResolvedValue(newRelease as any);

      const result = await service.create('inspector-123', createDto);

      expect(repository.create).toHaveBeenCalledWith({
        ...createDto,
        releasedBy: 'inspector-123',
      });
      expect(repository.supersede).toHaveBeenCalledWith('release-123', 'release-new');
    });
  });

  // ==================== Update ====================

  describe('update', () => {
    const updateDto: UpdateReleaseRecordDto = {
      workDescription: '更新后的工作描述',
      conditions: '新条件',
    };

    it('should update unsigned release record', async () => {
      repository.findById.mockResolvedValue(mockReleaseRecord);
      const updatedRelease = { ...mockReleaseRecord, ...updateDto };
      repository.update.mockResolvedValue(updatedRelease as any);

      const result = await service.update('release-123', updateDto);

      expect(result).toEqual(updatedRelease);
      expect(repository.findById).toHaveBeenCalledWith('release-123');
      expect(repository.update).toHaveBeenCalledWith('release-123', updateDto);
    });

    it('should throw NotFoundException when record does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.update('non-existent', updateDto)).rejects.toThrow(NotFoundException);
      await expect(service.update('non-existent', updateDto)).rejects.toThrow('Release record not found');
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when record is signed', async () => {
      repository.findById.mockResolvedValue(mockSignedRelease);

      await expect(service.update('release-123', updateDto)).rejects.toThrow(ForbiddenException);
      await expect(service.update('release-123', updateDto)).rejects.toThrow('Cannot modify a signed release record');
      expect(repository.update).not.toHaveBeenCalled();
    });
  });

  // ==================== Sign ====================

  describe('sign', () => {
    const signDto: SignReleaseDto = {
      signatureHash: 'abc123def456',
    };

    it('should sign unsigned release record', async () => {
      repository.findById.mockResolvedValue(mockReleaseRecord);
      const signedRelease = { ...mockReleaseRecord, signatureHash: signDto.signatureHash };
      repository.addSignature.mockResolvedValue(signedRelease as any);

      const result = await service.sign('release-123', signDto);

      expect(result.signatureHash).toBe(signDto.signatureHash);
      expect(repository.findById).toHaveBeenCalledWith('release-123');
      expect(repository.addSignature).toHaveBeenCalledWith('release-123', signDto.signatureHash);
    });

    it('should throw NotFoundException when record does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.sign('non-existent', signDto)).rejects.toThrow(NotFoundException);
      await expect(service.sign('non-existent', signDto)).rejects.toThrow('Release record not found');
      expect(repository.addSignature).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when record is already signed', async () => {
      repository.findById.mockResolvedValue(mockSignedRelease);

      await expect(service.sign('release-123', signDto)).rejects.toThrow(ForbiddenException);
      await expect(service.sign('release-123', signDto)).rejects.toThrow('Release record is already signed');
      expect(repository.addSignature).not.toHaveBeenCalled();
    });
  });

  // ==================== Delete ====================

  describe('delete', () => {
    it('should delete unsigned release record', async () => {
      repository.findById.mockResolvedValue(mockReleaseRecord);
      repository.delete.mockResolvedValue(undefined);

      await service.delete('release-123');

      expect(repository.findById).toHaveBeenCalledWith('release-123');
      expect(repository.delete).toHaveBeenCalledWith('release-123');
    });

    it('should throw NotFoundException when record does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.delete('non-existent')).rejects.toThrow(NotFoundException);
      await expect(service.delete('non-existent')).rejects.toThrow('Release record not found');
      expect(repository.delete).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when record is signed', async () => {
      repository.findById.mockResolvedValue(mockSignedRelease);

      await expect(service.delete('release-123')).rejects.toThrow(ForbiddenException);
      await expect(service.delete('release-123')).rejects.toThrow('Cannot delete a signed release record');
      expect(repository.delete).not.toHaveBeenCalled();
    });
  });

  // ==================== Is Aircraft Released ====================

  describe('isAircraftReleased', () => {
    it('should return true when aircraft has signed release', async () => {
      repository.findCurrentRelease.mockResolvedValue(mockSignedRelease);

      const result = await service.isAircraftReleased('aircraft-123');

      expect(result).toBe(true);
    });

    it('should return false when aircraft has no release', async () => {
      repository.findCurrentRelease.mockResolvedValue(null);

      const result = await service.isAircraftReleased('aircraft-123');

      expect(result).toBe(false);
    });

    it('should return false when aircraft has unsigned release', async () => {
      repository.findCurrentRelease.mockResolvedValue(mockReleaseRecord);

      const result = await service.isAircraftReleased('aircraft-123');

      expect(result).toBe(false);
    });
  });
});
