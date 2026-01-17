import { Controller, Get, Inject } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { HealthService, HealthStatus } from "./health.service";

@ApiTags("系统 (System)")
@Controller("health")
export class HealthController {
  private healthService: HealthService;

  constructor(@Inject(HealthService) healthService: HealthService) {
    this.healthService = healthService;
  }

  @Get()
  @ApiOperation({ summary: "健康检查", description: "检查系统健康状态" })
  @ApiResponse({
    status: 200,
    description: "系统健康",
    schema: {
      type: "object",
      properties: {
        status: { type: "string", enum: ["healthy", "unhealthy", "degraded"] },
        timestamp: { type: "string" },
        uptime: { type: "number", description: "运行时间（秒）" },
        version: { type: "string" },
        checks: {
          type: "object",
          properties: {
            database: {
              type: "object",
              properties: {
                status: { type: "string", enum: ["up", "down", "degraded"] },
                responseTime: { type: "number" },
              },
            },
            memory: {
              type: "object",
              properties: {
                status: { type: "string", enum: ["up", "down", "degraded"] },
                details: { type: "object" },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 503, description: "系统不健康" })
  async getHealth(): Promise<HealthStatus> {
    return this.healthService.getHealth();
  }

  @Get("live")
  @ApiOperation({ summary: "存活检查", description: "简单存活检查（用于 K8s liveness probe）" })
  @ApiResponse({ status: 200, description: "服务存活" })
  getLiveness(): { status: string } {
    return { status: "ok" };
  }

  @Get("ready")
  @ApiOperation({ summary: "就绪检查", description: "就绪检查（用于 K8s readiness probe）" })
  @ApiResponse({ status: 200, description: "服务就绪" })
  @ApiResponse({ status: 503, description: "服务未就绪" })
  async getReadiness(): Promise<{ status: string }> {
    const health = await this.healthService.getHealth();
    if (health.status === "unhealthy") {
      throw new Error("Service not ready");
    }
    return { status: "ready" };
  }
}
