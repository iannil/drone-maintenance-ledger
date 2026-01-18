import { api } from "./api";

/**
 * Dashboard statistics types
 */
export interface DashboardStats {
  totalAircraft: number;
  aircraftByStatus: {
    serviceable: number;
    maintenance: number;
    grounded: number;
    retired: number;
  };
  totalFleets: number;
  workOrders: {
    pending: number;
    inProgress: number;
    completed: number;
  };
  flight: {
    totalHours: number;
    totalCycles: number;
    last30DaysHours: number;
  };
}

export interface RecentActivity {
  id: string;
  type: "maintenance" | "flight" | "warning" | "workorder";
  message: string;
  time: string;
  relatedId?: string;
}

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
 * Fault heatmap data for visualization
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
 * Reliability data for analysis page
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
 * Stats API service
 */
export const statsService = {
  /**
   * Get dashboard statistics
   */
  getDashboardStats(): Promise<DashboardStats> {
    return api.get<DashboardStats>("/stats/dashboard");
  },

  /**
   * Get recent activities
   */
  getRecentActivities(limit?: number): Promise<RecentActivity[]> {
    return api.get<RecentActivity[]>("/stats/activities", {
      params: { limit },
    });
  },

  /**
   * Get due maintenance items
   */
  getDueMaintenanceItems(limit?: number): Promise<DueMaintenanceItem[]> {
    return api.get<DueMaintenanceItem[]>("/stats/due-maintenance", {
      params: { limit },
    });
  },

  /**
   * Get fault heatmap data for visualization
   */
  getFaultHeatmap(days?: number): Promise<FaultHeatmapData> {
    return api.get<FaultHeatmapData>("/stats/fault-heatmap", {
      params: { days },
    });
  },

  /**
   * Get fleet locations for map view
   */
  getFleetLocations(): Promise<FleetLocationsData> {
    return api.get<FleetLocationsData>("/stats/fleet-locations");
  },

  /**
   * Get reliability analysis data
   */
  getReliabilityData(days?: number): Promise<ReliabilityData> {
    return api.get<ReliabilityData>("/stats/reliability", {
      params: { days },
    });
  },
};
