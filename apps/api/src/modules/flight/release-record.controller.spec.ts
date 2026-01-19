/**
 * ReleaseRecordController Unit Tests
 *
 * Tests for release record (airworthiness) endpoints
 */

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

import { ReleaseRecordController } from './release-record.controller';
import { ReleaseRecordService } from './release-record.service';

describe('ReleaseRecordController', () => {
  let controller: ReleaseRecordController;
  let releaseService: jest.Mocked<ReleaseRecordService>;

  const mockReleaseRecord = {
    id: 'release-123',
    aircraftId: 'aircraft-123',
    workOrderId: 'wo-123',
    releaseStatus: 'RELEASED' as const,
    workDescription: '完成 50 小时定检，更换 1 号电机',
    releasedBy: 'inspector-123',
    releaseCertificateNumber: 'RC-2026-001',
    conditions: null,
    limitations: null,
    resolution: null,
    signatureHash: null,
    signedAt: null,
    isActive: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const mockSignedRelease = {
    ...mockReleaseRecord,
    signatureHash: 'abc123def456',
    signedAt: Date.now(),
  };

  const mockReleaseList = [
    mockReleaseRecord,
    {
      ...mockReleaseRecord,
      id: 'release-456',
      workOrderId: 'wo-456',
      releaseStatus: 'CONDITIONAL' as const,
      conditions: '仅限 VFR 飞行',
      signatureHash: 'xyz789',
      signedAt: Date.now() - 24 * 60 * 60 * 1000,
    },
  ];

  beforeEach(async () => {
    const mockReleaseService = {
      findById: jest.fn(),
      findByAircraft: jest.fn(),
      findByWorkOrder: jest.fn(),
      findCurrentRelease: jest.fn(),
      isAircraftReleased: jest.fn(),
      getRecent: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      sign: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReleaseRecordController],
      providers: [{ provide: ReleaseRecordService, useValue: mockReleaseService }],
    }).compile();

    controller = module.get<ReleaseRecordController>(ReleaseRecordController);
    releaseService = module.get(ReleaseRecordService);
  });

  // ==================== Get By ID ====================

  describe('GET /release-records/:id', () => {
    it('should return release record by ID', async () => {
      releaseService.findById.mockResolvedValue(mockReleaseRecord as any);

      const result = await controller.getById('release-123');

      expect(result).toEqual(mockReleaseRecord);
      expect(releaseService.findById).toHaveBeenCalledWith('release-123');
    });

    it('should return null for non-existent record', async () => {
      releaseService.findById.mockResolvedValue(null);

      const result = await controller.getById('non-existent');

      expect(result).toBeNull();
    });
  });

  // ==================== List ====================

  describe('GET /release-records', () => {
    it('should return recent releases by default', async () => {
      releaseService.getRecent.mockResolvedValue(mockReleaseList as any);

      const result = await controller.list(50, 0);

      expect(result).toEqual(mockReleaseList);
      expect(releaseService.getRecent).toHaveBeenCalledWith(50);
    });

    it('should return recent releases when recent=true', async () => {
      releaseService.getRecent.mockResolvedValue(mockReleaseList as any);

      const result = await controller.list(10, 0, undefined, undefined, 'true');

      expect(result).toEqual(mockReleaseList);
      expect(releaseService.getRecent).toHaveBeenCalledWith(10);
    });

    it('should filter by aircraft when aircraftId provided', async () => {
      releaseService.findByAircraft.mockResolvedValue([mockReleaseRecord] as any);

      const result = await controller.list(50, 0, 'aircraft-123');

      expect(result).toEqual([mockReleaseRecord]);
      expect(releaseService.findByAircraft).toHaveBeenCalledWith('aircraft-123', 50, 0);
    });

    it('should filter by work order when workOrderId provided', async () => {
      releaseService.findByWorkOrder.mockResolvedValue([mockReleaseRecord] as any);

      const result = await controller.list(50, 0, undefined, 'wo-123');

      expect(result).toEqual([mockReleaseRecord]);
      expect(releaseService.findByWorkOrder).toHaveBeenCalledWith('wo-123');
    });
  });

  // ==================== Get Current Release ====================

  describe('GET /release-records/aircraft/:aircraftId/current', () => {
    it('should return current release for aircraft', async () => {
      releaseService.findCurrentRelease.mockResolvedValue(mockSignedRelease as any);

      const result = await controller.getCurrentRelease('aircraft-123');

      expect(result).toEqual(mockSignedRelease);
      expect(releaseService.findCurrentRelease).toHaveBeenCalledWith('aircraft-123');
    });

    it('should return null when no current release', async () => {
      releaseService.findCurrentRelease.mockResolvedValue(null);

      const result = await controller.getCurrentRelease('aircraft-123');

      expect(result).toBeNull();
    });
  });

  // ==================== Get Release Status ====================

  describe('GET /release-records/aircraft/:aircraftId/status', () => {
    it('should return released status when aircraft is released', async () => {
      releaseService.isAircraftReleased.mockResolvedValue(true);
      releaseService.findCurrentRelease.mockResolvedValue(mockSignedRelease as any);

      const result = await controller.getReleaseStatus('aircraft-123');

      expect(result).toEqual({
        isReleased: true,
        release: mockSignedRelease,
      });
    });

    it('should return not released status when no valid release', async () => {
      releaseService.isAircraftReleased.mockResolvedValue(false);
      releaseService.findCurrentRelease.mockResolvedValue(null);

      const result = await controller.getReleaseStatus('aircraft-123');

      expect(result).toEqual({
        isReleased: false,
        release: null,
      });
    });
  });

  // ==================== Create ====================

  describe('POST /release-records', () => {
    const createDto = {
      aircraftId: 'aircraft-123',
      workOrderId: 'wo-123',
      releaseStatus: 'RELEASED' as const,
      workDescription: '完成定期检查',
    };

    it('should create a new release record', async () => {
      const newRelease = { ...mockReleaseRecord, ...createDto, id: 'release-new' };
      releaseService.create.mockResolvedValue(newRelease as any);

      const mockReq = { user: { id: 'inspector-123' } } as any;
      const result = await controller.create(mockReq, createDto);

      expect(result).toEqual(newRelease);
      expect(releaseService.create).toHaveBeenCalledWith('inspector-123', createDto);
    });
  });

  // ==================== Update ====================

  describe('PUT /release-records/:id', () => {
    const updateDto = {
      workDescription: '更新后的工作描述',
      conditions: '新增条件',
    };

    it('should update release record', async () => {
      const updatedRelease = { ...mockReleaseRecord, ...updateDto };
      releaseService.update.mockResolvedValue(updatedRelease as any);

      const result = await controller.update('release-123', updateDto);

      expect(result).toEqual(updatedRelease);
      expect(releaseService.update).toHaveBeenCalledWith('release-123', updateDto);
    });

    it('should throw NotFoundException for non-existent record', async () => {
      releaseService.update.mockRejectedValue(new NotFoundException('Release record not found'));

      await expect(controller.update('non-existent', updateDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for signed record', async () => {
      releaseService.update.mockRejectedValue(
        new ForbiddenException('Cannot update signed release record')
      );

      await expect(controller.update('release-123', updateDto)).rejects.toThrow(ForbiddenException);
    });
  });

  // ==================== Sign ====================

  describe('POST /release-records/:id/sign', () => {
    const signDto = {
      signatureHash: 'abc123def456',
    };

    it('should sign release record', async () => {
      releaseService.sign.mockResolvedValue(mockSignedRelease as any);

      const result = await controller.sign('release-123', signDto);

      expect(result).toEqual(mockSignedRelease);
      expect(releaseService.sign).toHaveBeenCalledWith('release-123', signDto);
    });

    it('should throw NotFoundException for non-existent record', async () => {
      releaseService.sign.mockRejectedValue(new NotFoundException('Release record not found'));

      await expect(controller.sign('non-existent', signDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for already signed record', async () => {
      releaseService.sign.mockRejectedValue(
        new ForbiddenException('Record already signed')
      );

      await expect(controller.sign('release-123', signDto)).rejects.toThrow(ForbiddenException);
    });
  });

  // ==================== Delete ====================

  describe('DELETE /release-records/:id', () => {
    it('should delete release record and return success', async () => {
      releaseService.delete.mockResolvedValue(undefined);

      const result = await controller.delete('release-123');

      expect(result).toEqual({ success: true, message: 'Release record deleted' });
      expect(releaseService.delete).toHaveBeenCalledWith('release-123');
    });

    it('should throw NotFoundException for non-existent record', async () => {
      releaseService.delete.mockRejectedValue(new NotFoundException('Release record not found'));

      await expect(controller.delete('non-existent')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for signed record', async () => {
      releaseService.delete.mockRejectedValue(
        new ForbiddenException('Cannot delete signed release record')
      );

      await expect(controller.delete('release-123')).rejects.toThrow(ForbiddenException);
    });
  });
});
