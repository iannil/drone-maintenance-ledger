/**
 * HealthService Unit Tests
 *
 * Tests for health check service
 */

import { Test, TestingModule } from '@nestjs/testing';

import { HealthService } from './health.service';

describe('HealthService', () => {
  let service: HealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HealthService],
    }).compile();

    service = module.get<HealthService>(HealthService);
  });

  // ==================== Get Health ====================

  describe('getHealth', () => {
    it('should return health status with timestamp', async () => {
      const result = await service.getHealth();

      expect(result.status).toBeDefined();
      expect(result.timestamp).toBeDefined();
      expect(result.uptime).toBeGreaterThanOrEqual(0);
      expect(result.version).toBeDefined();
    });

    it('should include database and memory checks', async () => {
      const result = await service.getHealth();

      expect(result.checks).toBeDefined();
      expect(result.checks.database).toBeDefined();
      expect(result.checks.memory).toBeDefined();
      expect(result.checks.database.status).toMatch(/up|down|degraded/);
      expect(result.checks.memory.status).toMatch(/up|down|degraded/);
    });

    it('should include memory details', async () => {
      const result = await service.getHealth();

      expect(result.checks.memory.details).toBeDefined();
      expect(result.checks.memory.details?.heapUsed).toMatch(/\d+MB/);
      expect(result.checks.memory.details?.heapTotal).toMatch(/\d+MB/);
      expect(result.checks.memory.details?.heapUsagePercent).toMatch(/\d+%/);
      expect(result.checks.memory.details?.rss).toMatch(/\d+MB/);
    });

    it('should calculate uptime correctly', async () => {
      const result = await service.getHealth();

      expect(result.uptime).toBeGreaterThanOrEqual(0);
      expect(typeof result.uptime).toBe('number');
      expect(Number.isInteger(result.uptime)).toBe(true);
    });

    it('should return degraded status when memory usage is high', async () => {
      // Mock process.memoryUsage to return high usage
      const memUsageSpy = jest.spyOn(process, 'memoryUsage').mockReturnValue({
        rss: 500000000,
        heapTotal: 1000000000,
        heapUsed: 920000000, // 92% usage
        external: 50000000,
        arrayBuffers: 10000000,
      } as NodeJS.MemoryUsage);

      const result = await service.getHealth();

      expect(result.checks.memory.status).toBe('degraded');

      memUsageSpy.mockRestore();
    });

    it('should return unhealthy memory status when memory usage is critical', async () => {
      // Mock process.memoryUsage to return critical usage
      const memUsageSpy = jest.spyOn(process, 'memoryUsage').mockReturnValue({
        rss: 500000000,
        heapTotal: 1000000000,
        heapUsed: 960000000, // 96% usage
        external: 50000000,
        arrayBuffers: 10000000,
      } as NodeJS.MemoryUsage);

      const result = await service.getHealth();

      expect(result.checks.memory.status).toBe('down');

      memUsageSpy.mockRestore();
    });
  });
});
