import { Controller, Get, UseGuards, Inject, Query } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";

import { StatsService, DashboardStats, RecentActivity, DueMaintenanceItem } from "./stats.service";
import { RolesGuard } from "../../common/guards/roles.guard";

/**
 * Stats controller
 *
 * Provides API endpoints for dashboard statistics
 */
@ApiTags("统计 (Stats)")
@ApiBearerAuth()
@Controller("stats")
@UseGuards(AuthGuard("jwt"), RolesGuard)
export class StatsController {
  private statsService: StatsService;

  constructor(@Inject(StatsService) statsService: StatsService) {
    this.statsService = statsService;
  }

  /**
   * GET /stats/dashboard
   * Returns aggregated dashboard statistics
   */
  @Get("dashboard")
  @ApiOperation({ summary: "获取仪表板统计", description: "获取聚合的仪表板统计数据" })
  @ApiResponse({ status: 200, description: "获取成功" })
  async getDashboardStats(): Promise<DashboardStats> {
    return this.statsService.getDashboardStats();
  }

  /**
   * GET /stats/activities
   * Returns recent activities for the dashboard
   */
  @Get("activities")
  @ApiOperation({ summary: "获取最近活动", description: "获取仪表板显示的最近活动记录" })
  @ApiQuery({ name: "limit", required: false, description: "数量限制", example: 10 })
  @ApiResponse({ status: 200, description: "获取成功" })
  async getRecentActivities(
    @Query("limit") limit?: string,
  ): Promise<RecentActivity[]> {
    return this.statsService.getRecentActivities(limit ? parseInt(limit, 10) : 10);
  }

  /**
   * GET /stats/due-maintenance
   * Returns maintenance items that are due soon
   */
  @Get("due-maintenance")
  @ApiOperation({ summary: "获取即将到期维保", description: "获取即将到期的维保项目" })
  @ApiQuery({ name: "limit", required: false, description: "数量限制", example: 10 })
  @ApiResponse({ status: 200, description: "获取成功" })
  async getDueMaintenanceItems(
    @Query("limit") limit?: string,
  ): Promise<DueMaintenanceItem[]> {
    return this.statsService.getDueMaintenanceItems(limit ? parseInt(limit, 10) : 10);
  }
}
