/**
 * StatsController Unit Tests
 *
 * Tests for statistics and dashboard endpoints
 */

import { Test, TestingModule } from '@nestjs/testing';

import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

describe('StatsController', () => {
  let controller: StatsController;
  let statsService: jest.Mocked<StatsService>;

  const mockDashboardStats = {
    fleet: {
      total: 50,
      available: 40,
      inMaintenance: 8,
      aog: 2,
    },
    maintenance: {
      openWorkOrders: 15,
      dueSoon: 10,
      overdue: 3,
      completedThisMonth: 25,
    },
    flights: {
      totalToday: 120,
      totalHoursThisMonth: 450.5,
      averageHoursPerAircraft: 9.01,
    },
    inventory: {
      lowStockItems: 5,
      expiringItems: 3,
      pendingOrders: 8,
    },
  };

  const mockActivities = [
    {
      id: 'act-1',
      type: 'FLIGHT_COMPLETED' as const,
      title: '飞行任务完成',
      description: 'B-7011U 完成飞行 1.5 小时',
      timestamp: Date.now() - 30 * 60 * 1000,
      entityType: 'FLIGHT',
      entityId: 'flight-123',
    },
    {
      id: 'act-2',
      type: 'WORK_ORDER_COMPLETED' as const,
      title: '工单完成',
      description: 'WO-2026-001 已完成并放行',
      timestamp: Date.now() - 60 * 60 * 1000,
      entityType: 'WORK_ORDER',
      entityId: 'wo-123',
    },
  ];

  const mockDueMaintenanceItems = [
    {
      id: 'due-1',
      aircraftId: 'aircraft-123',
      registrationNumber: 'B-7011U',
      triggerName: '50小时定检',
      dueDate: Date.now() + 3 * 24 * 60 * 60 * 1000,
      remainingHours: 5,
      priority: 'HIGH' as const,
    },
    {
      id: 'due-2',
      aircraftId: 'aircraft-456',
      registrationNumber: 'B-7012U',
      triggerName: '年度检查',
      dueDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
      remainingHours: null,
      priority: 'MEDIUM' as const,
    },
  ];

  const mockFaultHeatmap = {
    byModel: [
      { model: 'M300 RTK', faults: 15 },
      { model: 'M350 RTK', faults: 8 },
    ],
    bySystem: [
      { system: 'PROPULSION', faults: 12 },
      { system: 'ELECTRICAL', faults: 8 },
      { system: 'AVIONICS', faults: 3 },
    ],
    bySeverity: [
      { severity: 'HIGH', count: 5 },
      { severity: 'MEDIUM', count: 12 },
      { severity: 'LOW', count: 6 },
    ],
    byMonth: [
      { month: '2026-01', faults: 8 },
      { month: '2025-12', faults: 10 },
      { month: '2025-11', faults: 5 },
    ],
  };

  const mockFleetLocations = {
    aircraft: [
      {
        id: 'aircraft-123',
        registrationNumber: 'B-7011U',
        latitude: 39.9042,
        longitude: 116.4074,
        status: 'AVAILABLE' as const,
        lastUpdated: Date.now() - 5 * 60 * 1000,
      },
      {
        id: 'aircraft-456',
        registrationNumber: 'B-7012U',
        latitude: 31.2304,
        longitude: 121.4737,
        status: 'IN_MAINTENANCE' as const,
        lastUpdated: Date.now() - 60 * 60 * 1000,
      },
    ],
    total: 2,
  };

  const mockReliabilityData = {
    overallMtbf: 250.5,
    overallDispatchRate: 0.95,
    bySystem: [
      { system: 'PROPULSION', mtbf: 300, failureRate: 0.03 },
      { system: 'ELECTRICAL', mtbf: 500, failureRate: 0.02 },
    ],
    byModel: [
      { model: 'M300 RTK', dispatchRate: 0.94, utilizationRate: 0.78 },
      { model: 'M350 RTK', dispatchRate: 0.96, utilizationRate: 0.82 },
    ],
    trend: [
      { month: '2026-01', mtbf: 255, dispatchRate: 0.95 },
      { month: '2025-12', mtbf: 248, dispatchRate: 0.94 },
    ],
  };

  beforeEach(async () => {
    const mockStatsService = {
      getDashboardStats: jest.fn(),
      getRecentActivities: jest.fn(),
      getDueMaintenanceItems: jest.fn(),
      getFaultHeatmap: jest.fn(),
      getFleetLocations: jest.fn(),
      getReliabilityData: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatsController],
      providers: [{ provide: StatsService, useValue: mockStatsService }],
    }).compile();

    controller = module.get<StatsController>(StatsController);
    statsService = module.get(StatsService);
  });

  // ==================== Dashboard Stats ====================

  describe('GET /stats/dashboard', () => {
    it('should return dashboard statistics', async () => {
      statsService.getDashboardStats.mockResolvedValue(mockDashboardStats as any);

      const result = await controller.getDashboardStats();

      expect(result).toEqual(mockDashboardStats);
      expect(statsService.getDashboardStats).toHaveBeenCalled();
    });
  });

  // ==================== Recent Activities ====================

  describe('GET /stats/activities', () => {
    it('should return recent activities with default limit', async () => {
      statsService.getRecentActivities.mockResolvedValue(mockActivities as any);

      const result = await controller.getRecentActivities();

      expect(result).toEqual(mockActivities);
      expect(statsService.getRecentActivities).toHaveBeenCalledWith(10);
    });

    it('should return recent activities with custom limit', async () => {
      statsService.getRecentActivities.mockResolvedValue([mockActivities[0]] as any);

      const result = await controller.getRecentActivities('5');

      expect(result).toEqual([mockActivities[0]]);
      expect(statsService.getRecentActivities).toHaveBeenCalledWith(5);
    });
  });

  // ==================== Due Maintenance ====================

  describe('GET /stats/due-maintenance', () => {
    it('should return due maintenance items with default limit', async () => {
      statsService.getDueMaintenanceItems.mockResolvedValue(mockDueMaintenanceItems as any);

      const result = await controller.getDueMaintenanceItems();

      expect(result).toEqual(mockDueMaintenanceItems);
      expect(statsService.getDueMaintenanceItems).toHaveBeenCalledWith(10);
    });

    it('should return due maintenance items with custom limit', async () => {
      statsService.getDueMaintenanceItems.mockResolvedValue([mockDueMaintenanceItems[0]] as any);

      const result = await controller.getDueMaintenanceItems('5');

      expect(result).toEqual([mockDueMaintenanceItems[0]]);
      expect(statsService.getDueMaintenanceItems).toHaveBeenCalledWith(5);
    });
  });

  // ==================== Fault Heatmap ====================

  describe('GET /stats/fault-heatmap', () => {
    it('should return fault heatmap with default days', async () => {
      statsService.getFaultHeatmap.mockResolvedValue(mockFaultHeatmap as any);

      const result = await controller.getFaultHeatmap();

      expect(result).toEqual(mockFaultHeatmap);
      expect(statsService.getFaultHeatmap).toHaveBeenCalledWith(365);
    });

    it('should return fault heatmap with custom days', async () => {
      statsService.getFaultHeatmap.mockResolvedValue(mockFaultHeatmap as any);

      const result = await controller.getFaultHeatmap('90');

      expect(result).toEqual(mockFaultHeatmap);
      expect(statsService.getFaultHeatmap).toHaveBeenCalledWith(90);
    });
  });

  // ==================== Fleet Locations ====================

  describe('GET /stats/fleet-locations', () => {
    it('should return fleet locations', async () => {
      statsService.getFleetLocations.mockResolvedValue(mockFleetLocations as any);

      const result = await controller.getFleetLocations();

      expect(result).toEqual(mockFleetLocations);
      expect(statsService.getFleetLocations).toHaveBeenCalled();
    });
  });

  // ==================== Reliability Data ====================

  describe('GET /stats/reliability', () => {
    it('should return reliability data with default days', async () => {
      statsService.getReliabilityData.mockResolvedValue(mockReliabilityData as any);

      const result = await controller.getReliabilityData();

      expect(result).toEqual(mockReliabilityData);
      expect(statsService.getReliabilityData).toHaveBeenCalledWith(180);
    });

    it('should return reliability data with custom days', async () => {
      statsService.getReliabilityData.mockResolvedValue(mockReliabilityData as any);

      const result = await controller.getReliabilityData('30');

      expect(result).toEqual(mockReliabilityData);
      expect(statsService.getReliabilityData).toHaveBeenCalledWith(30);
    });
  });
});
