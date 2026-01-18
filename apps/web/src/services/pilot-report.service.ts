/**
 * Pilot Report Service
 *
 * API client for pilot report (PIREP) operations
 */

import { api } from "./api";

/**
 * Pilot report severity levels
 */
export type PilotReportSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

/**
 * Pilot report status
 */
export type PilotReportStatus = "OPEN" | "IN_PROGRESS" | "DEFERRED" | "RESOLVED" | "CLOSED";

/**
 * Pilot report type (matches backend schema)
 */
export interface PilotReport {
  id: string;
  aircraftId: string;
  flightLogId: string | null;
  reportedBy: string;
  title: string;
  description: string;
  severity: PilotReportSeverity;
  status: PilotReportStatus;
  affectedSystem: string | null;
  affectedComponent: string | null;
  isAog: boolean;
  resolvedBy: string | null;
  resolvedAt: number | null;
  resolution: string | null;
  workOrderId: string | null;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

/**
 * Create pilot report DTO
 */
export interface CreatePilotReportDto {
  aircraftId: string;
  flightLogId?: string;
  title: string;
  description: string;
  severity: PilotReportSeverity;
  affectedSystem?: string;
  affectedComponent?: string;
  isAog?: boolean;
}

/**
 * Update pilot report DTO
 */
export interface UpdatePilotReportDto {
  title?: string;
  description?: string;
  severity?: PilotReportSeverity;
  status?: PilotReportStatus;
  affectedSystem?: string;
  affectedComponent?: string;
  resolution?: string;
}

/**
 * Update status DTO
 */
export interface UpdateStatusDto {
  status: PilotReportStatus;
  resolution?: string;
}

/**
 * Pilot report list options
 */
export interface PilotReportListOptions {
  limit?: number;
  offset?: number;
  aircraftId?: string;
  reporterId?: string;
  open?: boolean;
  aog?: boolean;
}

/**
 * Pilot report service
 */
export const pilotReportService = {
  /**
   * List pilot reports
   */
  list(options: PilotReportListOptions = {}): Promise<PilotReport[]> {
    return api.get<PilotReport[]>("/pilot-reports", {
      params: {
        limit: options.limit,
        offset: options.offset,
        aircraftId: options.aircraftId,
        reporterId: options.reporterId,
        open: options.open ? "true" : undefined,
        aog: options.aog ? "true" : undefined,
      },
    });
  },

  /**
   * Get pilot report by ID
   */
  getById(id: string): Promise<PilotReport> {
    return api.get<PilotReport>(`/pilot-reports/${id}`);
  },

  /**
   * Get open (unresolved) pilot reports
   */
  getOpen(limit?: number, offset?: number): Promise<PilotReport[]> {
    return api.get<PilotReport[]>("/pilot-reports", {
      params: { open: "true", limit, offset },
    });
  },

  /**
   * Get AOG (aircraft-on-ground) pilot reports
   */
  getAog(): Promise<PilotReport[]> {
    return api.get<PilotReport[]>("/pilot-reports", {
      params: { aog: "true" },
    });
  },

  /**
   * Get pilot reports by aircraft
   */
  getByAircraft(aircraftId: string, limit?: number, offset?: number): Promise<PilotReport[]> {
    return api.get<PilotReport[]>("/pilot-reports", {
      params: { aircraftId, limit, offset },
    });
  },

  /**
   * Get pilot reports by reporter
   */
  getByReporter(reporterId: string, limit?: number, offset?: number): Promise<PilotReport[]> {
    return api.get<PilotReport[]>("/pilot-reports", {
      params: { reporterId, limit, offset },
    });
  },

  /**
   * Create a new pilot report
   */
  create(dto: CreatePilotReportDto): Promise<PilotReport> {
    return api.post<PilotReport>("/pilot-reports", dto);
  },

  /**
   * Update a pilot report
   */
  update(id: string, dto: UpdatePilotReportDto): Promise<PilotReport> {
    return api.put<PilotReport>(`/pilot-reports/${id}`, dto);
  },

  /**
   * Update pilot report status
   */
  updateStatus(id: string, dto: UpdateStatusDto): Promise<PilotReport> {
    return api.put<PilotReport>(`/pilot-reports/${id}/status`, dto);
  },

  /**
   * Link pilot report to work order
   */
  linkToWorkOrder(id: string, workOrderId: string): Promise<PilotReport> {
    return api.post<PilotReport>(`/pilot-reports/${id}/link-work-order`, { workOrderId });
  },

  /**
   * Delete a pilot report (soft delete)
   */
  delete(id: string): Promise<void> {
    return api.delete(`/pilot-reports/${id}`);
  },
};

/**
 * Severity level labels for display
 */
export const SEVERITY_LABELS: Record<PilotReportSeverity, string> = {
  LOW: "轻微",
  MEDIUM: "中等",
  HIGH: "严重",
  CRITICAL: "紧急",
};

/**
 * Severity level colors for display
 */
export const SEVERITY_COLORS: Record<PilotReportSeverity, string> = {
  LOW: "bg-yellow-100 text-yellow-700",
  MEDIUM: "bg-orange-100 text-orange-700",
  HIGH: "bg-red-100 text-red-700",
  CRITICAL: "bg-red-600 text-white",
};

/**
 * Status labels for display
 */
export const STATUS_LABELS: Record<PilotReportStatus, string> = {
  OPEN: "待处理",
  IN_PROGRESS: "处理中",
  DEFERRED: "已延迟",
  RESOLVED: "已解决",
  CLOSED: "已关闭",
};

/**
 * Status colors for display
 */
export const STATUS_COLORS: Record<PilotReportStatus, string> = {
  OPEN: "bg-red-100 text-red-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  DEFERRED: "bg-yellow-100 text-yellow-700",
  RESOLVED: "bg-green-100 text-green-700",
  CLOSED: "bg-slate-100 text-slate-700",
};
