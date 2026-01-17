import { Injectable } from "@nestjs/common";
import { db } from "@repo/db";
import { sql } from "drizzle-orm";

export interface HealthStatus {
  status: "healthy" | "unhealthy" | "degraded";
  timestamp: string;
  uptime: number;
  version: string;
  checks: {
    database: CheckResult;
    memory: CheckResult;
  };
}

export interface CheckResult {
  status: "up" | "down" | "degraded";
  responseTime?: number;
  details?: Record<string, any>;
}

@Injectable()
export class HealthService {
  private readonly startTime = Date.now();

  async getHealth(): Promise<HealthStatus> {
    const [databaseCheck, memoryCheck] = await Promise.all([
      this.checkDatabase(),
      this.checkMemory(),
    ]);

    const allChecks = [databaseCheck, memoryCheck];
    const hasDown = allChecks.some((c) => c.status === "down");
    const hasDegraded = allChecks.some((c) => c.status === "degraded");

    let overallStatus: "healthy" | "unhealthy" | "degraded" = "healthy";
    if (hasDown) {
      overallStatus = "unhealthy";
    } else if (hasDegraded) {
      overallStatus = "degraded";
    }

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      version: process.env.npm_package_version || "1.0.0",
      checks: {
        database: databaseCheck,
        memory: memoryCheck,
      },
    };
  }

  private async checkDatabase(): Promise<CheckResult> {
    const startTime = Date.now();
    try {
      db.run(sql`SELECT 1`);
      const responseTime = Date.now() - startTime;

      return {
        status: responseTime > 1000 ? "degraded" : "up",
        responseTime,
      };
    } catch (error) {
      return {
        status: "down",
        details: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  }

  private async checkMemory(): Promise<CheckResult> {
    const memUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
    const heapUsagePercent = Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100);

    let status: "up" | "degraded" | "down" = "up";
    if (heapUsagePercent > 90) {
      status = "degraded";
    }
    if (heapUsagePercent > 95) {
      status = "down";
    }

    return {
      status,
      details: {
        heapUsed: `${heapUsedMB}MB`,
        heapTotal: `${heapTotalMB}MB`,
        heapUsagePercent: `${heapUsagePercent}%`,
        rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
      },
    };
  }
}
