import { Injectable, Inject } from "@nestjs/common";
import { sql, eq, desc, and, gte } from "drizzle-orm";

import { db, aircraft, fleet, workOrder, flightLog } from "@repo/db";

/**
 * Dashboard statistics response
 */
export interface DashboardStats {
  /** Total number of aircraft */
  totalAircraft: number;
  /** Aircraft count by status */
  aircraftByStatus: {
    serviceable: number;
    maintenance: number;
    grounded: number;
    retired: number;
  };
  /** Total number of fleets */
  totalFleets: number;
  /** Work order statistics */
  workOrders: {
    pending: number;
    inProgress: number;
    completed: number;
  };
  /** Flight statistics */
  flight: {
    totalHours: number;
    totalCycles: number;
    last30DaysHours: number;
  };
}

/**
 * Recent activity item
 */
export interface RecentActivity {
  id: string;
  type: "maintenance" | "flight" | "warning" | "workorder";
  message: string;
  time: Date;
  relatedId?: string;
}

/**
 * Due maintenance item
 */
export interface DueMaintenanceItem {
  id: string;
  aircraft: string;
  aircraftId: string;
  component: string;
  componentId?: string;
  type: string;
  dueIn: string;
  status: "urgent" | "warning" | "normal";
}

/**
 * Stats service
 *
 * Provides aggregated statistics for the dashboard
 */
@Injectable()
export class StatsService {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    // Get aircraft counts by status
    const aircraftStats = await db
      .select({
        status: aircraft.status,
        count: sql<number>`count(*)`.as("count"),
      })
      .from(aircraft)
      .groupBy(aircraft.status);

    const statusCounts = aircraftStats.reduce(
      (acc, row) => {
        const key = row.status.toLowerCase() as keyof typeof acc;
        acc[key] = Number(row.count);
        return acc;
      },
      { serviceable: 0, maintenance: 0, grounded: 0, retired: 0 },
    );

    const totalAircraft = Object.values(statusCounts).reduce((a, b) => a + b, 0);

    // Get fleet count
    const [fleetCount] = await db
      .select({ count: sql<number>`count(*)`.as("count") })
      .from(fleet);

    // Get work order counts by status
    const workOrderStats = await db
      .select({
        status: workOrder.status,
        count: sql<number>`count(*)`.as("count"),
      })
      .from(workOrder)
      .where(eq(workOrder.isActive, true))
      .groupBy(workOrder.status);

    const workOrderCounts = workOrderStats.reduce(
      (acc, row) => {
        if (["OPEN", "PENDING_PARTS", "PENDING_INSPECTION"].includes(row.status)) {
          acc.pending += Number(row.count);
        } else if (row.status === "IN_PROGRESS") {
          acc.inProgress = Number(row.count);
        } else if (["COMPLETED", "RELEASED"].includes(row.status)) {
          acc.completed += Number(row.count);
        }
        return acc;
      },
      { pending: 0, inProgress: 0, completed: 0 },
    );

    // Get flight statistics
    const [flightStats] = await db
      .select({
        totalHours: sql<number>`COALESCE(SUM(${flightLog.flightHours}), 0)`.as("totalHours"),
        totalCycles: sql<number>`COALESCE(SUM(${flightLog.flightCycles}), 0)`.as("totalCycles"),
      })
      .from(flightLog);

    // Get last 30 days flight hours
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [recentFlightStats] = await db
      .select({
        hours: sql<number>`COALESCE(SUM(${flightLog.flightHours}), 0)`.as("hours"),
      })
      .from(flightLog)
      .where(gte(flightLog.createdAt, thirtyDaysAgo));

    return {
      totalAircraft,
      aircraftByStatus: statusCounts,
      totalFleets: Number(fleetCount?.count || 0),
      workOrders: workOrderCounts,
      flight: {
        totalHours: Number(flightStats?.totalHours || 0),
        totalCycles: Number(flightStats?.totalCycles || 0),
        last30DaysHours: Number(recentFlightStats?.hours || 0),
      },
    };
  }

  /**
   * Get recent activities for dashboard
   */
  async getRecentActivities(limit: number = 10): Promise<RecentActivity[]> {
    const activities: RecentActivity[] = [];

    // Get recent work orders
    const recentWorkOrders = await db
      .select({
        id: workOrder.id,
        orderNumber: workOrder.orderNumber,
        status: workOrder.status,
        createdAt: workOrder.createdAt,
        aircraftId: workOrder.aircraftId,
      })
      .from(workOrder)
      .where(eq(workOrder.isActive, true))
      .orderBy(desc(workOrder.updatedAt))
      .limit(5);

    for (const wo of recentWorkOrders) {
      // Get aircraft registration
      const [ac] = await db
        .select({ registration: aircraft.registrationNumber })
        .from(aircraft)
        .where(eq(aircraft.id, wo.aircraftId));

      activities.push({
        id: wo.id,
        type: wo.status === "COMPLETED" || wo.status === "RELEASED" ? "maintenance" : "workorder",
        message: `${ac?.registration || "Unknown"} 工单 ${wo.orderNumber} ${this.getWorkOrderStatusText(wo.status)}`,
        time: wo.createdAt,
        relatedId: wo.id,
      });
    }

    // Get recent flight logs
    const recentFlights = await db
      .select({
        id: flightLog.id,
        aircraftId: flightLog.aircraftId,
        flightHours: flightLog.flightHours,
        createdAt: flightLog.createdAt,
      })
      .from(flightLog)
      .orderBy(desc(flightLog.createdAt))
      .limit(5);

    for (const fl of recentFlights) {
      const [ac] = await db
        .select({ registration: aircraft.registrationNumber })
        .from(aircraft)
        .where(eq(aircraft.id, fl.aircraftId));

      activities.push({
        id: fl.id,
        type: "flight",
        message: `${ac?.registration || "Unknown"} 完成飞行 ${fl.flightHours.toFixed(1)} 小时`,
        time: fl.createdAt,
        relatedId: fl.id,
      });
    }

    // Sort by time and limit
    return activities
      .sort((a, b) => b.time.getTime() - a.time.getTime())
      .slice(0, limit);
  }

  /**
   * Get due maintenance items for dashboard
   */
  async getDueMaintenanceItems(limit: number = 10): Promise<DueMaintenanceItem[]> {
    // This is a simplified version - in production, this would query
    // maintenance schedules and calculate due dates based on triggers
    // For now, return mock data based on aircraft in maintenance status
    const maintenanceAircraft = await db
      .select({
        id: aircraft.id,
        registration: aircraft.registrationNumber,
        status: aircraft.status,
        totalFlightHours: aircraft.totalFlightHours,
      })
      .from(aircraft)
      .where(eq(aircraft.status, "MAINTENANCE"))
      .limit(limit);

    return maintenanceAircraft.map((ac) => ({
      id: ac.id,
      aircraft: ac.registration,
      aircraftId: ac.id,
      component: "Scheduled Maintenance",
      type: "Calendar",
      dueIn: "In Progress",
      status: "warning" as const,
    }));
  }

  private getWorkOrderStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      OPEN: "已创建",
      IN_PROGRESS: "执行中",
      PENDING_PARTS: "待零件",
      PENDING_INSPECTION: "待检验",
      COMPLETED: "已完成",
      RELEASED: "已放行",
      CANCELLED: "已取消",
    };
    return statusMap[status] || status;
  }
}
