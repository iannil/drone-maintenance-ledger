/**
 * HealthController Unit Tests
 *
 * Tests for health check endpoints
 */

import { Test, TestingModule } from '@nestjs/testing';

import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
  let controller: HealthController;
  let healthService: jest.Mocked<HealthService>;

  const mockHealthStatus = {
    status: 'healthy' as const,
    timestamp: new Date().toISOString(),
    uptime: 3600,
    version: '1.0.0',
    checks: {
      database: {
        status: 'up' as const,
        responseTime: 5,
      },
      memory: {
        status: 'up' as const,
        details: {
          heapUsed: 50000000,
          heapTotal: 100000000,
          rss: 150000000,
        },
      },
    },
  };

  beforeEach(async () => {
    const mockHealthService = {
      getHealth: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: HealthService, useValue: mockHealthService }],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthService = module.get(HealthService);
  });

  // ==================== Health Check ====================

  describe('GET /health', () => {
    it('should return healthy status', async () => {
      healthService.getHealth.mockResolvedValue(mockHealthStatus as any);

      const result = await controller.getHealth();

      expect(result).toEqual(mockHealthStatus);
      expect(healthService.getHealth).toHaveBeenCalled();
    });

    it('should return unhealthy status when database is down', async () => {
      const unhealthyStatus = {
        ...mockHealthStatus,
        status: 'unhealthy' as const,
        checks: {
          ...mockHealthStatus.checks,
          database: {
            status: 'down' as const,
            responseTime: 0,
          },
        },
      };
      healthService.getHealth.mockResolvedValue(unhealthyStatus as any);

      const result = await controller.getHealth();

      expect(result.status).toBe('unhealthy');
      expect(result.checks.database.status).toBe('down');
    });

    it('should return degraded status when memory is degraded', async () => {
      const degradedStatus = {
        ...mockHealthStatus,
        status: 'degraded' as const,
        checks: {
          ...mockHealthStatus.checks,
          memory: {
            status: 'degraded' as const,
            details: {
              heapUsed: 90000000,
              heapTotal: 100000000,
              rss: 200000000,
            },
          },
        },
      };
      healthService.getHealth.mockResolvedValue(degradedStatus as any);

      const result = await controller.getHealth();

      expect(result.status).toBe('degraded');
      expect(result.checks.memory.status).toBe('degraded');
    });
  });

  // ==================== Liveness Check ====================

  describe('GET /health/live', () => {
    it('should return ok status', () => {
      const result = controller.getLiveness();

      expect(result).toEqual({ status: 'ok' });
    });
  });

  // ==================== Readiness Check ====================

  describe('GET /health/ready', () => {
    it('should return ready status when healthy', async () => {
      healthService.getHealth.mockResolvedValue(mockHealthStatus as any);

      const result = await controller.getReadiness();

      expect(result).toEqual({ status: 'ready' });
    });

    it('should throw error when unhealthy', async () => {
      const unhealthyStatus = { ...mockHealthStatus, status: 'unhealthy' as const };
      healthService.getHealth.mockResolvedValue(unhealthyStatus as any);

      await expect(controller.getReadiness()).rejects.toThrow('Service not ready');
    });

    it('should return ready when degraded', async () => {
      const degradedStatus = { ...mockHealthStatus, status: 'degraded' as const };
      healthService.getHealth.mockResolvedValue(degradedStatus as any);

      const result = await controller.getReadiness();

      expect(result).toEqual({ status: 'ready' });
    });
  });
});
