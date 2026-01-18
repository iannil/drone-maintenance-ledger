/**
 * PilotReportController Unit Tests
 *
 * Tests for pilot report (PIREP) endpoints
 */

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';

import { PilotReportController } from './pilot-report.controller';
import { PilotReportService } from './pilot-report.service';

describe('PilotReportController', () => {
  let controller: PilotReportController;
  let pilotReportService: jest.Mocked<PilotReportService>;

  const mockPilotReport = {
    id: 'pr-123',
    aircraftId: 'ac-001',
    flightLogId: 'fl-001',
    reportedBy: 'user-001',
    title: '电机异常噪音',
    description: '飞行过程中1号电机出现异常噪音',
    severity: 'MEDIUM',
    status: 'OPEN',
    affectedSystem: '动力系统',
    affectedComponent: '1号电机',
    isAog: false,
    resolvedBy: null,
    resolvedAt: null,
    resolution: null,
    workOrderId: null,
    isActive: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const mockPilotReports = [mockPilotReport];

  beforeEach(async () => {
    const mockPilotReportService = {
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
      controllers: [PilotReportController],
      providers: [{ provide: PilotReportService, useValue: mockPilotReportService }],
    }).compile();

    controller = module.get<PilotReportController>(PilotReportController);
    pilotReportService = module.get(PilotReportService);
  });

  describe('GET /pilot-reports/:id', () => {
    it('should return pilot report by ID', async () => {
      pilotReportService.findById.mockResolvedValue(mockPilotReport);

      const result = await controller.getById('pr-123');

      expect(result).toEqual(mockPilotReport);
      expect(pilotReportService.findById).toHaveBeenCalledWith('pr-123');
    });

    it('should handle not found pilot report', async () => {
      pilotReportService.findById.mockRejectedValue(new NotFoundException('Pilot report not found'));

      await expect(controller.getById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('GET /pilot-reports', () => {
    it('should return open pilot reports by default', async () => {
      pilotReportService.findOpen.mockResolvedValue(mockPilotReports);

      const result = await controller.list(50, 0);

      expect(result).toEqual(mockPilotReports);
      expect(pilotReportService.findOpen).toHaveBeenCalledWith(50, 0);
    });

    it('should return AOG reports when aog=true', async () => {
      pilotReportService.findAog.mockResolvedValue(mockPilotReports);

      const result = await controller.list(50, 0, undefined, undefined, undefined, 'true');

      expect(result).toEqual(mockPilotReports);
      expect(pilotReportService.findAog).toHaveBeenCalled();
    });

    it('should return open reports when open=true', async () => {
      pilotReportService.findOpen.mockResolvedValue(mockPilotReports);

      const result = await controller.list(50, 0, undefined, undefined, 'true');

      expect(result).toEqual(mockPilotReports);
      expect(pilotReportService.findOpen).toHaveBeenCalledWith(50, 0);
    });

    it('should filter by aircraft ID', async () => {
      pilotReportService.findByAircraft.mockResolvedValue(mockPilotReports);

      const result = await controller.list(50, 0, 'ac-001');

      expect(result).toEqual(mockPilotReports);
      expect(pilotReportService.findByAircraft).toHaveBeenCalledWith('ac-001', 50, 0);
    });

    it('should filter by reporter ID', async () => {
      pilotReportService.findByReporter.mockResolvedValue(mockPilotReports);

      const result = await controller.list(50, 0, undefined, 'user-001');

      expect(result).toEqual(mockPilotReports);
      expect(pilotReportService.findByReporter).toHaveBeenCalledWith('user-001', 50, 0);
    });
  });

  describe('POST /pilot-reports', () => {
    const createDto = {
      aircraftId: 'ac-001',
      title: '新故障报告',
      description: '测试故障描述',
      severity: 'MEDIUM' as const,
    };

    it('should create a new pilot report', async () => {
      const mockRequest = { user: { id: 'user-001' } };
      pilotReportService.create.mockResolvedValue(mockPilotReport);

      const result = await controller.create(mockRequest as any, createDto);

      expect(result).toEqual(mockPilotReport);
      expect(pilotReportService.create).toHaveBeenCalledWith('user-001', createDto);
    });
  });

  describe('PUT /pilot-reports/:id', () => {
    const updateDto = {
      description: '更新后的故障描述',
      severity: 'HIGH' as const,
    };

    it('should update pilot report', async () => {
      const updatedReport = { ...mockPilotReport, ...updateDto };
      pilotReportService.update.mockResolvedValue(updatedReport);

      const result = await controller.update('pr-123', updateDto);

      expect(result).toEqual(updatedReport);
      expect(pilotReportService.update).toHaveBeenCalledWith('pr-123', updateDto);
    });

    it('should handle not found pilot report on update', async () => {
      pilotReportService.update.mockRejectedValue(new NotFoundException('Pilot report not found'));

      await expect(controller.update('nonexistent', updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('PUT /pilot-reports/:id/status', () => {
    const statusDto = {
      status: 'RESOLVED' as const,
      resolution: '已更换电机',
    };

    it('should update pilot report status', async () => {
      const mockRequest = { user: { id: 'user-002' } };
      const updatedReport = {
        ...mockPilotReport,
        status: 'RESOLVED',
        resolution: '已更换电机',
        resolvedBy: 'user-002',
        resolvedAt: Date.now(),
      };
      pilotReportService.updateStatus.mockResolvedValue(updatedReport);

      const result = await controller.updateStatus(mockRequest as any, 'pr-123', statusDto);

      expect(result).toEqual(updatedReport);
      expect(pilotReportService.updateStatus).toHaveBeenCalledWith('pr-123', 'user-002', statusDto);
    });
  });

  describe('POST /pilot-reports/:id/link-work-order', () => {
    it('should link pilot report to work order', async () => {
      const linkedReport = { ...mockPilotReport, workOrderId: 'wo-001' };
      pilotReportService.linkToWorkOrder.mockResolvedValue(linkedReport);

      const result = await controller.linkToWorkOrder('pr-123', { workOrderId: 'wo-001' });

      expect(result).toEqual(linkedReport);
      expect(pilotReportService.linkToWorkOrder).toHaveBeenCalledWith('pr-123', 'wo-001');
    });
  });

  describe('DELETE /pilot-reports/:id', () => {
    it('should delete pilot report', async () => {
      pilotReportService.delete.mockResolvedValue(undefined);

      const result = await controller.delete('pr-123');

      expect(result).toEqual({ success: true, message: 'Pilot report deleted' });
      expect(pilotReportService.delete).toHaveBeenCalledWith('pr-123');
    });

    it('should handle not found pilot report on delete', async () => {
      pilotReportService.delete.mockRejectedValue(new NotFoundException('Pilot report not found'));

      await expect(controller.delete('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
