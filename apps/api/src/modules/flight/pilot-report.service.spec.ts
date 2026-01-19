/**
 * PilotReportService Unit Tests
 *
 * Tests for pilot report business logic
 */

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';

import {
  PilotReportService,
  CreatePilotReportDto,
  UpdatePilotReportDto,
  UpdateStatusDto,
} from './pilot-report.service';
import { PilotReportRepository } from './repositories/pilot-report.repository';
import type { PilotReport } from '@repo/db';

describe('PilotReportService', () => {
  let service: PilotReportService;
  let repository: jest.Mocked<PilotReportRepository>;

  const mockPilotReport: PilotReport = {
    id: 'pirep-123',
    aircraftId: 'aircraft-123',
    flightLogId: 'flight-123',
    reportedBy: 'user-123',
    title: '电机异常震动',
    description: '飞行中发现左前电机有异常震动',
    severity: 'HIGH' as const,
    status: 'OPEN' as const,
    isAog: false,
    affectedSystem: '动力系统',
    affectedComponent: '左前电机',
    workOrderId: null,
    resolution: null,
    resolvedAt: null,
    resolvedBy: null,
    isActive: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  beforeEach(async () => {
    const mockPilotReportRepository = {
      findById: jest.fn(),
      findByAircraft: jest.fn(),
      findByReporter: jest.fn(),
      findOpen: jest.fn(),
      findAog: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
      linkToWorkOrder: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PilotReportService,
        { provide: PilotReportRepository, useValue: mockPilotReportRepository },
      ],
    }).compile();

    service = module.get<PilotReportService>(PilotReportService);
    repository = module.get(PilotReportRepository);
  });

  // ==================== Find By ID ====================

  describe('findById', () => {
    it('should return pilot report when found', async () => {
      repository.findById.mockResolvedValue(mockPilotReport);

      const result = await service.findById('pirep-123');

      expect(result).toEqual(mockPilotReport);
      expect(repository.findById).toHaveBeenCalledWith('pirep-123');
    });

    it('should return null when not found', async () => {
      repository.findById.mockResolvedValue(null);

      const result = await service.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  // ==================== Find By Aircraft ====================

  describe('findByAircraft', () => {
    it('should return reports for aircraft with default pagination', async () => {
      const reports = [mockPilotReport];
      repository.findByAircraft.mockResolvedValue(reports as any);

      const result = await service.findByAircraft('aircraft-123');

      expect(result).toEqual(reports);
      expect(repository.findByAircraft).toHaveBeenCalledWith('aircraft-123', 50, 0);
    });

    it('should return reports for aircraft with custom pagination', async () => {
      const reports = [mockPilotReport];
      repository.findByAircraft.mockResolvedValue(reports as any);

      const result = await service.findByAircraft('aircraft-123', 10, 5);

      expect(result).toEqual(reports);
      expect(repository.findByAircraft).toHaveBeenCalledWith('aircraft-123', 10, 5);
    });
  });

  // ==================== Find By Reporter ====================

  describe('findByReporter', () => {
    it('should return reports by reporter with default pagination', async () => {
      const reports = [mockPilotReport];
      repository.findByReporter.mockResolvedValue(reports as any);

      const result = await service.findByReporter('user-123');

      expect(result).toEqual(reports);
      expect(repository.findByReporter).toHaveBeenCalledWith('user-123', 50, 0);
    });

    it('should return reports by reporter with custom pagination', async () => {
      const reports = [mockPilotReport];
      repository.findByReporter.mockResolvedValue(reports as any);

      const result = await service.findByReporter('user-123', 10, 5);

      expect(result).toEqual(reports);
      expect(repository.findByReporter).toHaveBeenCalledWith('user-123', 10, 5);
    });
  });

  // ==================== Find Open ====================

  describe('findOpen', () => {
    it('should return open reports with default pagination', async () => {
      const reports = [mockPilotReport];
      repository.findOpen.mockResolvedValue(reports as any);

      const result = await service.findOpen();

      expect(result).toEqual(reports);
      expect(repository.findOpen).toHaveBeenCalledWith(50, 0);
    });

    it('should return open reports with custom pagination', async () => {
      const reports = [mockPilotReport];
      repository.findOpen.mockResolvedValue(reports as any);

      const result = await service.findOpen(10, 5);

      expect(result).toEqual(reports);
      expect(repository.findOpen).toHaveBeenCalledWith(10, 5);
    });
  });

  // ==================== Find AOG ====================

  describe('findAog', () => {
    it('should return AOG reports', async () => {
      const aogReport = { ...mockPilotReport, id: 'pirep-aog', isAog: true, severity: 'CRITICAL' as const };
      repository.findAog.mockResolvedValue([aogReport] as any);

      const result = await service.findAog();

      expect(result).toEqual([aogReport]);
      expect(repository.findAog).toHaveBeenCalled();
    });

    it('should return empty array when no AOG reports', async () => {
      repository.findAog.mockResolvedValue([]);

      const result = await service.findAog();

      expect(result).toEqual([]);
    });
  });

  // ==================== Create ====================

  describe('create', () => {
    const createDto: CreatePilotReportDto = {
      aircraftId: 'aircraft-123',
      flightLogId: 'flight-123',
      title: '新报告',
      description: '测试问题描述',
      severity: 'MEDIUM' as const,
      affectedSystem: '动力系统',
    };

    it('should create report with default values', async () => {
      repository.create.mockResolvedValue({
        ...mockPilotReport,
        ...createDto,
      } as any);

      const result = await service.create('user-123', createDto);

      expect(result).toBeDefined();
      expect(repository.create).toHaveBeenCalledWith({
        ...createDto,
        reportedBy: 'user-123',
        isAog: false,
        status: 'OPEN',
      });
    });

    it('should automatically set AOG for CRITICAL severity', async () => {
      const criticalDto = { ...createDto, severity: 'CRITICAL' as const };
      repository.create.mockResolvedValue({
        ...mockPilotReport,
        ...criticalDto,
        isAog: true,
      } as any);

      const result = await service.create('user-123', criticalDto);

      expect(repository.create).toHaveBeenCalledWith({
        ...criticalDto,
        reportedBy: 'user-123',
        isAog: true,
        status: 'OPEN',
      });
    });

    it('should respect explicit AOG flag', async () => {
      const aogDto = { ...createDto, isAog: true };
      repository.create.mockResolvedValue({
        ...mockPilotReport,
        ...aogDto,
        isAog: true,
      } as any);

      const result = await service.create('user-123', aogDto);

      expect(repository.create).toHaveBeenCalledWith({
        ...aogDto,
        reportedBy: 'user-123',
        isAog: true,
        status: 'OPEN',
      });
    });

    it('should set AOG when CRITICAL and explicit flag', async () => {
      const criticalAogDto = { ...createDto, severity: 'CRITICAL' as const, isAog: false };
      repository.create.mockResolvedValue({
        ...mockPilotReport,
        ...criticalAogDto,
      } as any);

      const result = await service.create('user-123', criticalAogDto);

      // CRITICAL severity overrides the isAog flag
      expect(repository.create).toHaveBeenCalledWith({
        ...criticalAogDto,
        reportedBy: 'user-123',
        isAog: true,
        status: 'OPEN',
      });
    });
  });

  // ==================== Update ====================

  describe('update', () => {
    const updateDto: UpdatePilotReportDto = {
      title: '更新后的标题',
      severity: 'LOW' as const,
    };

    it('should update report when exists', async () => {
      repository.findById.mockResolvedValue(mockPilotReport);
      const updatedReport = { ...mockPilotReport, ...updateDto };
      repository.update.mockResolvedValue(updatedReport as any);

      const result = await service.update('pirep-123', updateDto);

      expect(result).toEqual(updatedReport);
      expect(repository.findById).toHaveBeenCalledWith('pirep-123');
      expect(repository.update).toHaveBeenCalledWith('pirep-123', updateDto);
    });

    it('should throw NotFoundException when report does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.update('non-existent', updateDto)).rejects.toThrow(NotFoundException);
      await expect(service.update('non-existent', updateDto)).rejects.toThrow('Pilot report not found');
      expect(repository.update).not.toHaveBeenCalled();
    });
  });

  // ==================== Update Status ====================

  describe('updateStatus', () => {
    const statusDto: UpdateStatusDto = {
      status: 'INVESTIGATING' as const,
      resolution: '开始调查',
    };

    it('should update status when report exists', async () => {
      repository.findById.mockResolvedValue(mockPilotReport);
      repository.update.mockResolvedValue(mockPilotReport as any);
      repository.updateStatus.mockResolvedValue({
        ...mockPilotReport,
        status: 'INVESTIGATING' as const,
      } as any);

      const result = await service.updateStatus('pirep-123', 'user-123', statusDto);

      expect(result.status).toBe('INVESTIGATING');
      expect(repository.update).not.toHaveBeenCalledWith('pirep-123', { isAog: false });
      expect(repository.updateStatus).toHaveBeenCalledWith('pirep-123', 'INVESTIGATING', 'user-123');
    });

    it('should clear AOG flag when resolving', async () => {
      const aogReport = { ...mockPilotReport, isAog: true, severity: 'CRITICAL' as const };
      repository.findById.mockResolvedValue(aogReport);
      repository.update.mockResolvedValue(aogReport as any);
      repository.updateStatus.mockResolvedValue({
        ...aogReport,
        status: 'RESOLVED' as const,
        isAog: false,
      } as any);

      const resolveDto: UpdateStatusDto = { status: 'RESOLVED' as const, resolution: '已修复' };
      const result = await service.updateStatus('pirep-123', 'user-123', resolveDto);

      expect(repository.update).toHaveBeenCalledWith('pirep-123', { isAog: false });
      expect(repository.updateStatus).toHaveBeenCalledWith('pirep-123', 'RESOLVED', 'user-123');
    });

    it('should throw NotFoundException when report does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.updateStatus('non-existent', 'user-123', statusDto)).rejects.toThrow(NotFoundException);
      await expect(service.updateStatus('non-existent', 'user-123', statusDto)).rejects.toThrow('Pilot report not found');
    });
  });

  // ==================== Link To Work Order ====================

  describe('linkToWorkOrder', () => {
    it('should link report to work order', async () => {
      const linkedReport = { ...mockPilotReport, workOrderId: 'wo-123' };
      repository.linkToWorkOrder.mockResolvedValue(linkedReport as any);

      const result = await service.linkToWorkOrder('pirep-123', 'wo-123');

      expect(result.workOrderId).toBe('wo-123');
      expect(repository.linkToWorkOrder).toHaveBeenCalledWith('pirep-123', 'wo-123');
    });
  });

  // ==================== Delete ====================

  describe('delete', () => {
    it('should delete report when exists', async () => {
      repository.findById.mockResolvedValue(mockPilotReport);
      repository.delete.mockResolvedValue(undefined);

      await service.delete('pirep-123');

      expect(repository.findById).toHaveBeenCalledWith('pirep-123');
      expect(repository.delete).toHaveBeenCalledWith('pirep-123');
    });

    it('should throw NotFoundException when report does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.delete('non-existent')).rejects.toThrow(NotFoundException);
      await expect(service.delete('non-existent')).rejects.toThrow('Pilot report not found');
      expect(repository.delete).not.toHaveBeenCalled();
    });
  });
});
