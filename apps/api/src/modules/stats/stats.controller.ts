import { Controller, Get, UseGuards, Inject, Query } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { StatsService, DashboardStats, RecentActivity, DueMaintenanceItem } from "./stats.service";

/**
 * Stats controller
 *
 * Provides API endpoints for dashboard statistics
 */
@Controller("stats")
@UseGuards(AuthGuard("jwt"))
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
  async getDashboardStats(): Promise<DashboardStats> {
    return this.statsService.getDashboardStats();
  }

  /**
   * GET /stats/activities
   * Returns recent activities for the dashboard
   */
  @Get("activities")
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
  async getDueMaintenanceItems(
    @Query("limit") limit?: string,
  ): Promise<DueMaintenanceItem[]> {
    return this.statsService.getDueMaintenanceItems(limit ? parseInt(limit, 10) : 10);
  }
}
