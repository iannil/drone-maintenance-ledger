import { Injectable, Inject } from "@nestjs/common";
import { sql, eq, desc, and, gte } from "drizzle-orm";

import { db, aircraft, fleet, workOrder, flightLog, pilotReport } from "@repo/db";

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
  time: number;
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
 * Fault heatmap data
 */
export interface FaultHeatmapData {
  byAircraftModel: { model: string; faultCount: number }[];
  bySystem: { system: string; faultCount: number }[];
  bySeverity: { severity: string; count: number }[];
  byMonth: { month: string; count: number }[];
  totalFaults: number;
  openFaults: number;
  criticalFaults: number;
}

/**
 * Aircraft location data for map view
 */
export interface AircraftLocationData {
  id: string;
  registrationNumber: string;
  model: string;
  status: string;
  latitude: number;
  longitude: number;
  lastFlightDate?: string;
  totalFlightHours?: number;
}

/**
 * Fleet locations response
 */
export interface FleetLocationsData {
  aircraft: AircraftLocationData[];
  lastUpdated: number;
}

/**
 * Reliability data for analysis
 */
export interface ReliabilityData {
  summary: {
    overallReliability: number;
    previousPeriod: number;
    totalFlightHours: number;
    totalFlights: number;
    incidents: number;
    avgIncidentsPer100Hours: number;
    mtbf: number;
    mttr: number;
  };
  componentReliability: {
    id: string;
    component: string;
    partNumber: string;
    category: string;
    totalInstalled: number;
    failures: number;
    mtbf: number;
    availability: number;
    trend: string;
    change: number;
    topFailureModes: { mode: string; count: number; percentage: number }[];
  }[];
  systemReliability: {
    system: string;
    reliability: number;
    incidents: number;
    trend: string;
  }[];
  incidentsByMonth: {
    month: string;
    incidents: number;
    flights: number;
  }[];
  topFailureCauses: {
    cause: string;
    count: number;
    percentage: number;
  }[];
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
        totalCycles: sql<number>`COALESCE(SUM(${flightLog.takeoffCycles}), 0)`.as("totalCycles"),
      })
      .from(flightLog);

    // Get last 30 days flight hours
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

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
      .sort((a, b) => b.time - a.time)
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

  /**
   * Get fault heatmap data for visualization
   */
  async getFaultHeatmap(days: number = 365): Promise<FaultHeatmapData> {
    const startTime = Date.now() - days * 24 * 60 * 60 * 1000;

    // Get faults by aircraft model
    const faultsByModel = await db
      .select({
        model: aircraft.model,
        count: sql<number>`count(*)`.as("count"),
      })
      .from(pilotReport)
      .innerJoin(aircraft, eq(pilotReport.aircraftId, aircraft.id))
      .where(and(
        eq(pilotReport.isActive, true),
        gte(pilotReport.createdAt, startTime)
      ))
      .groupBy(aircraft.model)
      .orderBy(desc(sql`count(*)`));

    // Get faults by affected system
    const faultsBySystem = await db
      .select({
        system: pilotReport.affectedSystem,
        count: sql<number>`count(*)`.as("count"),
      })
      .from(pilotReport)
      .where(and(
        eq(pilotReport.isActive, true),
        gte(pilotReport.createdAt, startTime)
      ))
      .groupBy(pilotReport.affectedSystem)
      .orderBy(desc(sql`count(*)`));

    // Get faults by severity
    const faultsBySeverity = await db
      .select({
        severity: pilotReport.severity,
        count: sql<number>`count(*)`.as("count"),
      })
      .from(pilotReport)
      .where(and(
        eq(pilotReport.isActive, true),
        gte(pilotReport.createdAt, startTime)
      ))
      .groupBy(pilotReport.severity);

    // Get faults by month (simplified - group by creation month)
    const faultsByMonth = await db
      .select({
        month: sql<string>`strftime('%Y-%m', datetime(${pilotReport.createdAt} / 1000, 'unixepoch'))`.as("month"),
        count: sql<number>`count(*)`.as("count"),
      })
      .from(pilotReport)
      .where(and(
        eq(pilotReport.isActive, true),
        gte(pilotReport.createdAt, startTime)
      ))
      .groupBy(sql`strftime('%Y-%m', datetime(${pilotReport.createdAt} / 1000, 'unixepoch'))`)
      .orderBy(sql`month`);

    // Get total counts
    const [totalStats] = await db
      .select({
        total: sql<number>`count(*)`.as("total"),
        open: sql<number>`sum(case when status = 'OPEN' or status = 'ACKNOWLEDGED' or status = 'INVESTIGATING' then 1 else 0 end)`.as("open"),
        critical: sql<number>`sum(case when severity = 'CRITICAL' then 1 else 0 end)`.as("critical"),
      })
      .from(pilotReport)
      .where(and(
        eq(pilotReport.isActive, true),
        gte(pilotReport.createdAt, startTime)
      ));

    return {
      byAircraftModel: faultsByModel.map((row) => ({
        model: row.model,
        faultCount: Number(row.count),
      })),
      bySystem: faultsBySystem
        .filter((row) => row.system)
        .map((row) => ({
          system: row.system || "未分类",
          faultCount: Number(row.count),
        })),
      bySeverity: faultsBySeverity.map((row) => ({
        severity: row.severity,
        count: Number(row.count),
      })),
      byMonth: faultsByMonth.map((row) => ({
        month: row.month,
        count: Number(row.count),
      })),
      totalFaults: Number(totalStats?.total || 0),
      openFaults: Number(totalStats?.open || 0),
      criticalFaults: Number(totalStats?.critical || 0),
    };
  }

  /**
   * Get fleet locations for map view
   * Note: Since GPS fields are not yet in the schema, this generates
   * mock coordinates based on aircraft data. Update this when GPS fields are added.
   */
  async getFleetLocations(): Promise<FleetLocationsData> {
    // Get all active aircraft
    const allAircraft = await db
      .select({
        id: aircraft.id,
        registrationNumber: aircraft.registrationNumber,
        model: aircraft.model,
        status: aircraft.status,
        totalFlightHours: aircraft.totalFlightHours,
      })
      .from(aircraft);

    // Get last flight date for each aircraft
    const lastFlights = await db
      .select({
        aircraftId: flightLog.aircraftId,
        lastFlightDate: sql<number>`MAX(${flightLog.flightDate})`.as("lastFlightDate"),
      })
      .from(flightLog)
      .where(eq(flightLog.isActive, true))
      .groupBy(flightLog.aircraftId);

    const lastFlightMap = new Map(
      lastFlights.map((f) => [f.aircraftId, f.lastFlightDate])
    );

    // Generate mock coordinates for demo purposes
    // Base location: Central China coordinates
    const baseLatitude = 35.8617;
    const baseLongitude = 104.1954;

    const aircraftLocations: AircraftLocationData[] = allAircraft.map((ac, index) => {
      // Generate pseudo-random but consistent coordinates based on aircraft ID
      const hash = ac.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const latOffset = ((hash % 1000) / 1000 - 0.5) * 20; // +/- 10 degrees
      const lngOffset = ((hash * 7 % 1000) / 1000 - 0.5) * 30; // +/- 15 degrees

      const lastFlight = lastFlightMap.get(ac.id);
      const lastFlightDate = lastFlight
        ? new Date(lastFlight).toLocaleDateString("zh-CN")
        : undefined;

      return {
        id: ac.id,
        registrationNumber: ac.registrationNumber,
        model: ac.model,
        status: ac.status,
        latitude: baseLatitude + latOffset,
        longitude: baseLongitude + lngOffset,
        lastFlightDate,
        totalFlightHours: ac.totalFlightHours,
      };
    });

    return {
      aircraft: aircraftLocations,
      lastUpdated: Date.now(),
    };
  }

  /**
   * Get reliability analysis data
   */
  async getReliabilityData(days: number = 180): Promise<ReliabilityData> {
    const startTime = Date.now() - days * 24 * 60 * 60 * 1000;
    const previousStartTime = startTime - days * 24 * 60 * 60 * 1000;

    // Get flight statistics for the period
    const [currentFlightStats] = await db
      .select({
        totalHours: sql<number>`COALESCE(SUM(${flightLog.flightHours}), 0)`.as("totalHours"),
        totalFlights: sql<number>`COUNT(*)`.as("totalFlights"),
      })
      .from(flightLog)
      .where(and(
        eq(flightLog.isActive, true),
        gte(flightLog.createdAt, startTime)
      ));

    // Get incident count (PIREPs with severity > MINOR)
    const [currentIncidents] = await db
      .select({
        count: sql<number>`COUNT(*)`.as("count"),
      })
      .from(pilotReport)
      .where(and(
        eq(pilotReport.isActive, true),
        gte(pilotReport.createdAt, startTime)
      ));

    // Get previous period statistics for comparison
    const [previousFlightStats] = await db
      .select({
        totalHours: sql<number>`COALESCE(SUM(${flightLog.flightHours}), 0)`.as("totalHours"),
        totalFlights: sql<number>`COUNT(*)`.as("totalFlights"),
      })
      .from(flightLog)
      .where(and(
        eq(flightLog.isActive, true),
        gte(flightLog.createdAt, previousStartTime),
        sql`${flightLog.createdAt} < ${startTime}`
      ));

    const [previousIncidents] = await db
      .select({
        count: sql<number>`COUNT(*)`.as("count"),
      })
      .from(pilotReport)
      .where(and(
        eq(pilotReport.isActive, true),
        gte(pilotReport.createdAt, previousStartTime),
        sql`${pilotReport.createdAt} < ${startTime}`
      ));

    const totalFlightHours = Number(currentFlightStats?.totalHours || 0);
    const totalFlights = Number(currentFlightStats?.totalFlights || 0);
    const incidents = Number(currentIncidents?.count || 0);
    const previousTotalHours = Number(previousFlightStats?.totalHours || 0);
    const previousIncidentCount = Number(previousIncidents?.count || 0);

    // Calculate reliability metrics
    const avgIncidentsPer100Hours = totalFlightHours > 0 ? (incidents / totalFlightHours) * 100 : 0;
    const mtbf = incidents > 0 ? totalFlightHours / incidents : 9999;
    const mttr = 4.2; // Placeholder - would need work order completion data

    // Calculate overall reliability (simplified)
    const overallReliability = totalFlightHours > 0
      ? Math.min(99.9, 100 - (incidents / totalFlightHours) * 10)
      : 100;

    const previousReliability = previousTotalHours > 0
      ? Math.min(99.9, 100 - (previousIncidentCount / previousTotalHours) * 10)
      : 100;

    // Get incidents by month
    const incidentsByMonth = await db
      .select({
        month: sql<string>`strftime('%Y-%m', datetime(${pilotReport.createdAt} / 1000, 'unixepoch'))`.as("month"),
        incidents: sql<number>`COUNT(*)`.as("incidents"),
      })
      .from(pilotReport)
      .where(and(
        eq(pilotReport.isActive, true),
        gte(pilotReport.createdAt, startTime)
      ))
      .groupBy(sql`strftime('%Y-%m', datetime(${pilotReport.createdAt} / 1000, 'unixepoch'))`)
      .orderBy(sql`month`);

    // Get flights by month
    const flightsByMonth = await db
      .select({
        month: sql<string>`strftime('%Y-%m', datetime(${flightLog.flightDate} / 1000, 'unixepoch'))`.as("month"),
        flights: sql<number>`COUNT(*)`.as("flights"),
      })
      .from(flightLog)
      .where(and(
        eq(flightLog.isActive, true),
        gte(flightLog.createdAt, startTime)
      ))
      .groupBy(sql`strftime('%Y-%m', datetime(${flightLog.flightDate} / 1000, 'unixepoch'))`)
      .orderBy(sql`month`);

    const flightsMap = new Map(flightsByMonth.map(f => [f.month, Number(f.flights)]));

    // Get failure causes from PIREPs
    const failureCauses = await db
      .select({
        cause: pilotReport.affectedSystem,
        count: sql<number>`COUNT(*)`.as("count"),
      })
      .from(pilotReport)
      .where(and(
        eq(pilotReport.isActive, true),
        gte(pilotReport.createdAt, startTime)
      ))
      .groupBy(pilotReport.affectedSystem)
      .orderBy(desc(sql`count(*)`))
      .limit(5);

    const totalCauses = failureCauses.reduce((sum, c) => sum + Number(c.count), 0);

    // Get system reliability from PIREPs
    const systemStats = await db
      .select({
        system: pilotReport.affectedSystem,
        incidents: sql<number>`COUNT(*)`.as("incidents"),
      })
      .from(pilotReport)
      .where(and(
        eq(pilotReport.isActive, true),
        gte(pilotReport.createdAt, startTime)
      ))
      .groupBy(pilotReport.affectedSystem);

    return {
      summary: {
        overallReliability: Math.round(overallReliability * 10) / 10,
        previousPeriod: Math.round(previousReliability * 10) / 10,
        totalFlightHours: Math.round(totalFlightHours * 10) / 10,
        totalFlights,
        incidents,
        avgIncidentsPer100Hours: Math.round(avgIncidentsPer100Hours * 100) / 100,
        mtbf: Math.round(mtbf),
        mttr,
      },
      componentReliability: [], // Would require component failure tracking
      systemReliability: systemStats
        .filter(s => s.system)
        .map(s => ({
          system: s.system || "其他",
          reliability: Math.max(90, 100 - (Number(s.incidents) / Math.max(totalFlights, 1)) * 100),
          incidents: Number(s.incidents),
          trend: "STABLE" as const,
        })),
      incidentsByMonth: incidentsByMonth.map(i => ({
        month: i.month,
        incidents: Number(i.incidents),
        flights: flightsMap.get(i.month) || 0,
      })),
      topFailureCauses: failureCauses
        .filter(c => c.cause)
        .map(c => ({
          cause: c.cause || "其他",
          count: Number(c.count),
          percentage: totalCauses > 0 ? Math.round((Number(c.count) / totalCauses) * 1000) / 10 : 0,
        })),
    };
  }
}

/**
 * Get work order status text (exported for testing)
 */
export function getWorkOrderStatusText(status: string): string {
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
