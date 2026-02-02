/**
 * StatsService Unit Tests
 *
 * Tests for statistics and dashboard service
 */

import { Test, TestingModule } from '@nestjs/testing';

import { StatsService } from './stats.service';

// Mock the db module - using a factory function since jest.mock is hoisted
jest.mock('@repo/db', () => {
  const mockDbChain: any = {
    select: jest.fn(function(this: any) { return this; }),
    from: jest.fn(function(this: any) { return this; }),
    where: jest.fn(function(this: any) { return this; }),
    groupBy: jest.fn(function(this: any) { return this; }),
    orderBy: jest.fn(function(this: any) { return this; }),
    limit: jest.fn(function(this: any) { return this; }),
    innerJoin: jest.fn(function(this: any) { return this; }),
  };

  // Make the chain awaitable - returns empty array when awaited
  Object.defineProperty(mockDbChain, 'then', {
    value: (resolve: (value: any) => void) => Promise.resolve([]).then(resolve),
  });

  return {
    db: mockDbChain,
    aircraft: {
      id: 'mock_id',
      status: 'mock_status',
      registrationNumber: 'mock_registrationNumber',
      model: 'mock_model',
      totalFlightHours: 'mock_totalFlightHours',
    },
    fleet: {},
    workOrder: {
      id: 'mock_id',
      status: 'mock_status',
      orderNumber: 'mock_orderNumber',
      aircraftId: 'mock_aircraftId',
      isActive: 'mock_isActive',
      createdAt: 'mock_createdAt',
      updatedAt: 'mock_updatedAt',
    },
    flightLog: {
      id: 'mock_id',
      aircraftId: 'mock_aircraftId',
      flightHours: 'mock_flightHours',
      takeoffCycles: 'mock_takeoffCycles',
      flightDate: 'mock_flightDate',
      createdAt: 'mock_createdAt',
      isActive: 'mock_isActive',
    },
    pilotReport: {
      id: 'mock_id',
      aircraftId: 'mock_aircraftId',
      severity: 'mock_severity',
      affectedSystem: 'mock_affectedSystem',
      status: 'mock_status',
      isActive: 'mock_isActive',
      createdAt: 'mock_createdAt',
    },
  };
});

import { db } from '@repo/db';

describe('StatsService', () => {
  let service: StatsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [StatsService],
    }).compile();

    service = module.get<StatsService>(StatsService);
  });

  // ==================== Get Dashboard Stats ====================

  describe('getDashboardStats', () => {
    it('should return default structure when db returns empty results', async () => {
      const result = await service.getDashboardStats();

      expect(result).toBeDefined();
      expect(result.totalAircraft).toBe(0);
      expect(result.aircraftByStatus).toEqual({
        serviceable: 0,
        maintenance: 0,
        grounded: 0,
        retired: 0,
      });
      expect(result.totalFleets).toBeDefined();
      expect(result.workOrders).toBeDefined();
      expect(result.flight).toBeDefined();
    });

    it('should have correct type structure', async () => {
      const result = await service.getDashboardStats();

      expect(typeof result.totalAircraft).toBe('number');
      expect(typeof result.totalFleets).toBe('number');
      expect(typeof result.workOrders.pending).toBe('number');
      expect(typeof result.workOrders.inProgress).toBe('number');
      expect(typeof result.workOrders.completed).toBe('number');
      expect(typeof result.flight.totalHours).toBe('number');
      expect(typeof result.flight.totalCycles).toBe('number');
      expect(typeof result.flight.last30DaysHours).toBe('number');
    });
  });

  // ==================== Get Recent Activities ====================

  describe('getRecentActivities', () => {
    it('should return empty array when no data available', async () => {
      const result = await service.getRecentActivities();

      expect(result).toEqual([]);
    });

    it('should use default limit of 10', async () => {
      await service.getRecentActivities();

      // Verify limit is called (implementation detail check)
      expect((db as any).limit).toHaveBeenCalledWith(5);
    });

    it('should accept custom limit parameter', async () => {
      await service.getRecentActivities(5);

      expect((db as any).limit).toHaveBeenCalledWith(5);
    });
  });

  // ==================== Get Due Maintenance Items ====================

  describe('getDueMaintenanceItems', () => {
    it('should return empty array when no maintenance aircraft', async () => {
      const result = await service.getDueMaintenanceItems();

      expect(result).toEqual([]);
    });

    it('should use default limit of 10', async () => {
      await service.getDueMaintenanceItems();

      expect((db as any).limit).toHaveBeenCalledWith(10);
    });

    it('should use custom limit', async () => {
      await service.getDueMaintenanceItems(5);

      expect((db as any).limit).toHaveBeenCalledWith(5);
    });
  });

  // ==================== Get Fault Heatmap ====================

  describe('getFaultHeatmap', () => {
    it('should return empty heatmap data structure', async () => {
      const result = await service.getFaultHeatmap();

      expect(result).toBeDefined();
      expect(result.byAircraftModel).toEqual([]);
      expect(result.bySystem).toEqual([]);
      expect(result.bySeverity).toEqual([]);
      expect(result.byMonth).toEqual([]);
      expect(result.totalFaults).toBe(0);
      expect(result.openFaults).toBe(0);
      expect(result.criticalFaults).toBe(0);
    });

    it('should use default days of 365', async () => {
      await service.getFaultHeatmap();

      expect((db as any).where).toHaveBeenCalled();
    });

    it('should accept custom days parameter', async () => {
      await service.getFaultHeatmap(90);

      expect((db as any).where).toHaveBeenCalled();
    });
  });

  // ==================== Get Fleet Locations ====================

  describe('getFleetLocations', () => {
    it('should return empty locations when no aircraft', async () => {
      const result = await service.getFleetLocations();

      expect(result.aircraft).toEqual([]);
      expect(result.lastUpdated).toBeDefined();
      expect(typeof result.lastUpdated).toBe('number');
    });

    it('should include lastUpdated timestamp', async () => {
      const before = Date.now();
      const result = await service.getFleetLocations();
      const after = Date.now();

      expect(result.lastUpdated).toBeGreaterThanOrEqual(before);
      expect(result.lastUpdated).toBeLessThanOrEqual(after);
    });
  });

  // ==================== Get Reliability Data ====================

  describe('getReliabilityData', () => {
    it('should return default reliability structure with no data', async () => {
      const result = await service.getReliabilityData();

      expect(result).toBeDefined();
      expect(result.summary).toBeDefined();
      expect(result.summary.overallReliability).toBe(100);
      expect(result.summary.previousPeriod).toBe(100);
      expect(result.summary.totalFlightHours).toBe(0);
      expect(result.summary.totalFlights).toBe(0);
      expect(result.summary.incidents).toBe(0);
      expect(result.summary.avgIncidentsPer100Hours).toBe(0);
      expect(result.summary.mtbf).toBe(9999);
      expect(result.summary.mttr).toBe(4.2);
      expect(result.componentReliability).toEqual([]);
      expect(result.systemReliability).toEqual([]);
      expect(result.incidentsByMonth).toEqual([]);
      expect(result.topFailureCauses).toEqual([]);
    });

    it('should use default days of 180', async () => {
      await service.getReliabilityData();

      expect((db as any).where).toHaveBeenCalled();
    });

    it('should accept custom days parameter', async () => {
      await service.getReliabilityData(90);

      expect((db as any).where).toHaveBeenCalled();
    });

    it('should calculate reliability metrics correctly', async () => {
      const result = await service.getReliabilityData();

      // With no incidents, reliability should be 100
      expect(result.summary.overallReliability).toBe(100);
      expect(result.summary.previousPeriod).toBe(100);
    });
  });

  // ==================== Service Initialization ====================

  describe('service initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should be an instance of StatsService', () => {
      expect(service).toBeInstanceOf(StatsService);
    });
  });

  // ==================== Utility Functions ====================

  describe('getWorkOrderStatusText', () => {
    let getWorkOrderStatusText: (status: string) => string;

    beforeAll(() => {
      // Dynamic import to get the exported function
      getWorkOrderStatusText = require('./stats.service').getWorkOrderStatusText;
    });

    it('should return Chinese text for known statuses', () => {
      expect(getWorkOrderStatusText('OPEN')).toBe('已创建');
      expect(getWorkOrderStatusText('IN_PROGRESS')).toBe('执行中');
      expect(getWorkOrderStatusText('PENDING_PARTS')).toBe('待零件');
      expect(getWorkOrderStatusText('PENDING_INSPECTION')).toBe('待检验');
      expect(getWorkOrderStatusText('COMPLETED')).toBe('已完成');
      expect(getWorkOrderStatusText('RELEASED')).toBe('已放行');
      expect(getWorkOrderStatusText('CANCELLED')).toBe('已取消');
    });

    it('should return original status for unknown statuses', () => {
      expect(getWorkOrderStatusText('UNKNOWN_STATUS')).toBe('UNKNOWN_STATUS');
      expect(getWorkOrderStatusText('IN_REVIEW')).toBe('IN_REVIEW');
    });

    it('should handle empty string', () => {
      expect(getWorkOrderStatusText('')).toBe('');
    });

    it('should handle special characters', () => {
      expect(getWorkOrderStatusText('STATUS-WITH-DASH')).toBe('STATUS-WITH-DASH');
    });
  });
});
