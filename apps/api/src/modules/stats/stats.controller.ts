import { Controller, Get, UseGuards, Inject, Query } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";

import { StatsService, DashboardStats, RecentActivity, DueMaintenanceItem, FaultHeatmapData, FleetLocationsData, ReliabilityData } from "./stats.service";
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

  /**
   * GET /stats/fault-heatmap
   * Returns fault heatmap data for visualization
   */
  @Get("fault-heatmap")
  @ApiOperation({ summary: "获取故障热力图数据", description: "获取按机型、系统、严重程度和月份分组的故障统计" })
  @ApiQuery({ name: "days", required: false, description: "统计天数", example: 365 })
  @ApiResponse({ status: 200, description: "获取成功" })
  async getFaultHeatmap(
    @Query("days") days?: string,
  ): Promise<FaultHeatmapData> {
    return this.statsService.getFaultHeatmap(days ? parseInt(days, 10) : 365);
  }

  /**
   * GET /stats/fleet-locations
   * Returns aircraft locations for map view
   */
  @Get("fleet-locations")
  @ApiOperation({ summary: "获取机队位置", description: "获取所有飞机的位置信息用于地图显示" })
  @ApiResponse({ status: 200, description: "获取成功" })
  async getFleetLocations(): Promise<FleetLocationsData> {
    return this.statsService.getFleetLocations();
  }

  /**
   * GET /stats/reliability
   * Returns reliability analysis data
   */
  @Get("reliability")
  @ApiOperation({ summary: "获取可靠性分析数据", description: "获取系统、零部件可靠性分析数据" })
  @ApiQuery({ name: "days", required: false, description: "统计天数", example: 180 })
  @ApiResponse({ status: 200, description: "获取成功" })
  async getReliabilityData(
    @Query("days") days?: string,
  ): Promise<ReliabilityData> {
    return this.statsService.getReliabilityData(days ? parseInt(days, 10) : 180);
  }
}
