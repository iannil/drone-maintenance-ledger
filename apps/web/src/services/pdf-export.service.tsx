/**
 * PDF Export Service
 *
 * Service for generating and downloading PDF reports
 */
import { pdf } from "@react-pdf/renderer";
import { FleetHealthReport, type FleetHealthReportData } from "../components/pdf/fleet-health-report";
import { MaintenanceComplianceReport, type MaintenanceComplianceReportData } from "../components/pdf/maintenance-report";

/**
 * Download a blob as a file
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate filename with date
 */
function generateFilename(baseName: string, extension: string = "pdf"): string {
  const date = new Date().toISOString().split("T")[0];
  return `${baseName}-${date}.${extension}`;
}

/**
 * Export fleet health report as PDF
 */
export async function exportFleetHealthReport(data: FleetHealthReportData): Promise<void> {
  const blob = await pdf(<FleetHealthReport data={data} />).toBlob();
  downloadBlob(blob, generateFilename("fleet-health-report"));
}

/**
 * Export maintenance compliance report as PDF
 */
export async function exportMaintenanceComplianceReport(data: MaintenanceComplianceReportData): Promise<void> {
  const blob = await pdf(<MaintenanceComplianceReport data={data} />).toBlob();
  downloadBlob(blob, generateFilename("maintenance-compliance-report"));
}

/**
 * Generate mock data for fleet health report (for demo purposes)
 */
export function generateFleetHealthReportData(): FleetHealthReportData {
  return {
    reportDate: Date.now(),
    reportPeriod: "2026年1月",
    organization: "DroneMaintenance-Ledger",
    fleetSummary: {
      totalAircraft: 12,
      serviceableAircraft: 10,
      maintenanceAircraft: 1,
      groundedAircraft: 1,
      utilizationRate: 0.78,
    },
    aircraftList: [
      {
        id: "1",
        registration: "B-7011U",
        model: "DJI M350 RTK",
        status: "AVAILABLE",
        totalFlightHours: 125.5,
        totalCycles: 312,
        lastInspectionDate: Date.now() - 7 * 24 * 60 * 60 * 1000,
        nextMaintenanceDue: "2026-02-15",
        healthScore: 95,
      },
      {
        id: "2",
        registration: "B-7012U",
        model: "DJI M350 RTK",
        status: "AVAILABLE",
        totalFlightHours: 89.3,
        totalCycles: 198,
        lastInspectionDate: Date.now() - 14 * 24 * 60 * 60 * 1000,
        nextMaintenanceDue: "2026-02-20",
        healthScore: 92,
      },
      {
        id: "3",
        registration: "B-7013U",
        model: "DJI M300 RTK",
        status: "IN_MAINTENANCE",
        totalFlightHours: 210.8,
        totalCycles: 456,
        lastInspectionDate: Date.now() - 3 * 24 * 60 * 60 * 1000,
        nextMaintenanceDue: "维护中",
        healthScore: 78,
      },
      {
        id: "4",
        registration: "B-7021U",
        model: "DJI Mavic 3E",
        status: "AVAILABLE",
        totalFlightHours: 45.2,
        totalCycles: 89,
        lastInspectionDate: Date.now() - 21 * 24 * 60 * 60 * 1000,
        nextMaintenanceDue: "2026-03-01",
        healthScore: 98,
      },
      {
        id: "5",
        registration: "B-7022U",
        model: "DJI Mavic 3E",
        status: "AOG",
        totalFlightHours: 67.8,
        totalCycles: 134,
        lastInspectionDate: Date.now() - 2 * 24 * 60 * 60 * 1000,
        nextMaintenanceDue: "待修复",
        healthScore: 45,
      },
    ],
    recentMaintenance: [
      {
        workOrderId: "WO-2026-001",
        aircraftRegistration: "B-7011U",
        description: "50小时定期检查",
        completedDate: Date.now() - 7 * 24 * 60 * 60 * 1000,
        status: "COMPLETED",
      },
    ],
    upcomingMaintenance: [
      {
        aircraftRegistration: "B-7012U",
        taskName: "100小时定期检查",
        dueDate: "2026-02-20",
        priority: "MEDIUM",
      },
      {
        aircraftRegistration: "B-7011U",
        taskName: "电池循环检查",
        dueDate: "2026-02-15",
        priority: "LOW",
      },
    ],
  };
}

/**
 * Generate mock data for maintenance compliance report (for demo purposes)
 */
export function generateMaintenanceComplianceReportData(): MaintenanceComplianceReportData {
  return {
    reportDate: Date.now(),
    reportPeriod: "2026年1月",
    organization: "DroneMaintenance-Ledger",
    summary: {
      totalScheduled: 24,
      completed: 20,
      inProgress: 2,
      overdue: 2,
      complianceRate: 0.917,
      avgCompletionTime: 3.5,
    },
    workOrderStats: {
      open: 3,
      inProgress: 2,
      pendingReview: 1,
      completed: 18,
    },
    overdueItems: [
      {
        aircraftRegistration: "B-7013U",
        taskName: "200小时大检",
        dueDate: "2026-01-10",
        overdueDays: 8,
        priority: "HIGH",
      },
      {
        aircraftRegistration: "B-7022U",
        taskName: "电池更换",
        dueDate: "2026-01-15",
        overdueDays: 3,
        priority: "CRITICAL",
      },
    ],
    completedMaintenance: [
      {
        workOrderId: "WO-2026-001",
        aircraftRegistration: "B-7011U",
        description: "50小时定期检查",
        completedDate: Date.now() - 7 * 24 * 60 * 60 * 1000,
        technician: "张技师",
        workHours: 4.5,
      },
      {
        workOrderId: "WO-2026-002",
        aircraftRegistration: "B-7012U",
        description: "桨叶更换",
        completedDate: Date.now() - 5 * 24 * 60 * 60 * 1000,
        technician: "李技师",
        workHours: 1.5,
      },
      {
        workOrderId: "WO-2026-003",
        aircraftRegistration: "B-7021U",
        description: "云台校准",
        completedDate: Date.now() - 3 * 24 * 60 * 60 * 1000,
        technician: "张技师",
        workHours: 2.0,
      },
    ],
    monthlyTrend: [
      { month: "2025-10", scheduled: 22, completed: 22, complianceRate: 1.0 },
      { month: "2025-11", scheduled: 25, completed: 24, complianceRate: 0.96 },
      { month: "2025-12", scheduled: 23, completed: 21, complianceRate: 0.913 },
      { month: "2026-01", scheduled: 24, completed: 20, complianceRate: 0.917 },
    ],
  };
}

/**
 * Export report type enum
 */
export type ReportType = "fleet-health" | "maintenance-compliance";

/**
 * Export report by type
 */
export async function exportReport(type: ReportType): Promise<void> {
  switch (type) {
    case "fleet-health":
      await exportFleetHealthReport(generateFleetHealthReportData());
      break;
    case "maintenance-compliance":
      await exportMaintenanceComplianceReport(generateMaintenanceComplianceReportData());
      break;
    default:
      throw new Error(`Unknown report type: ${type}`);
  }
}
