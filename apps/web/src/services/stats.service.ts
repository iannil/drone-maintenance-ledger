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
};
