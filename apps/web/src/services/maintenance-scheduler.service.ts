/**
 * Maintenance Scheduler Service
 *
 * API client for maintenance scheduling operations
 */

import { api } from "./api";

/**
 * Maintenance types
 */
export type MaintenanceAlertType = "WARNING" | "DUE" | "OVERDUE";
export type MaintenanceScheduleStatus = "PENDING" | "DUE" | "OVERDUE" | "COMPLETED";
export type TriggerType = "CALENDAR_DAYS" | "FLIGHT_HOURS" | "FLIGHT_CYCLES" | "BATTERY_CYCLES";

export interface MaintenanceAlert {
  scheduleId: string;
  scheduleName: string;
  triggerId: string;
  triggerName: string;
  triggerType: TriggerType;
  aircraftId: string;
  aircraftRegistration: string;
  alertType: MaintenanceAlertType;
  dueAtValue: number | null;
  dueAtDate: number | null;
  currentValue: number;
  remainingValue: number | null;
  remainingDays: number | null;
}

export interface MaintenanceProgram {
  id: string;
  name: string;
  code: string;
  description: string | null;
  aircraftModel: string | null;
  isDefault: boolean;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface MaintenanceTrigger {
  id: string;
  programId: string;
  name: string;
  code: string;
  description: string | null;
  type: TriggerType;
  intervalValue: number;
  warningThreshold: number;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface MaintenanceSchedule {
  id: string;
  aircraftId: string;
  triggerId: string;
  status: MaintenanceScheduleStatus;
  lastCompletedAt: number | null;
  lastCompletedAtValue: number | null;
  dueAtDate: number | null;
  dueAtValue: number | null;
  workOrderId: string | null;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface SchedulerRunResult {
  processed: number;
  updated: number;
  warnings: number;
  due: number;
  overdue: number;
}

export interface CreateWorkOrdersResult {
  created: number;
  workOrders: unknown[];
}

export interface ScheduleCounts {
  PENDING: number;
  DUE: number;
  OVERDUE: number;
  COMPLETED: number;
}

export interface AlertsOptions {
  aircraftId?: string;
  types?: MaintenanceAlertType[];
  limit?: number;
}

export interface ScheduleListOptions {
  limit?: number;
  offset?: number;
  aircraftId?: string;
  status?: string;
  isActive?: boolean;
}

export interface ProgramListOptions {
  limit?: number;
  offset?: number;
  aircraftModel?: string;
  isActive?: boolean;
}

export interface TriggerListOptions {
  limit?: number;
  offset?: number;
  programId?: string;
  type?: string;
  isActive?: boolean;
}

export interface CreateProgramDto {
  name: string;
  code: string;
  description?: string;
  aircraftModel?: string;
  isDefault?: boolean;
}

export interface CreateTriggerDto {
  programId: string;
  name: string;
  code: string;
  description?: string;
  type: TriggerType;
  intervalValue: number;
  warningThreshold?: number;
}

/**
 * Maintenance Scheduler API service
 */
export const maintenanceSchedulerService = {
  // ==================== Scheduler Operations ====================

  /**
   * Run the scheduler to check and update all maintenance schedules
   */
  runScheduler(): Promise<SchedulerRunResult> {
    return api.post<SchedulerRunResult>("/maintenance-scheduler/run");
  },

  /**
   * Create work orders for all due schedules
   */
  createWorkOrders(autoAssign?: boolean): Promise<CreateWorkOrdersResult> {
    return api.post<CreateWorkOrdersResult>("/maintenance-scheduler/create-work-orders", {
      autoAssign,
    });
  },

  /**
   * Get maintenance alerts for dashboard
   */
  getAlerts(options: AlertsOptions = {}): Promise<MaintenanceAlert[]> {
    return api.get<MaintenanceAlert[]>("/maintenance-scheduler/alerts", {
      params: {
        aircraftId: options.aircraftId,
        types: options.types?.join(","),
        limit: options.limit,
      },
    });
  },

  /**
   * Initialize schedules for an aircraft
   */
  initializeAircraftSchedules(
    aircraftId: string
  ): Promise<{ created: number; schedules: MaintenanceSchedule[] }> {
    return api.post(`/maintenance-scheduler/aircraft/${aircraftId}/initialize`);
  },

  /**
   * Complete a maintenance schedule
   */
  completeSchedule(scheduleId: string, completedAtValue?: number): Promise<MaintenanceSchedule> {
    return api.post<MaintenanceSchedule>(`/maintenance-scheduler/schedules/${scheduleId}/complete`, {
      completedAtValue,
    });
  },

  // ==================== Maintenance Programs ====================

  /**
   * List maintenance programs
   */
  getPrograms(options: ProgramListOptions = {}): Promise<MaintenanceProgram[]> {
    return api.get<MaintenanceProgram[]>("/maintenance-scheduler/programs", {
      params: {
        limit: options.limit,
        offset: options.offset,
        aircraftModel: options.aircraftModel,
        isActive: options.isActive === undefined ? undefined : String(options.isActive),
      },
    });
  },

  /**
   * Get a maintenance program by ID
   */
  getProgramById(id: string): Promise<MaintenanceProgram> {
    return api.get<MaintenanceProgram>(`/maintenance-scheduler/programs/${id}`);
  },

  /**
   * Create a maintenance program
   */
  createProgram(dto: CreateProgramDto): Promise<MaintenanceProgram> {
    return api.post<MaintenanceProgram>("/maintenance-scheduler/programs", dto);
  },

  /**
   * Get default program for aircraft model
   */
  getDefaultProgram(aircraftModel: string): Promise<MaintenanceProgram | null> {
    return api.get<MaintenanceProgram | null>(
      `/maintenance-scheduler/programs/default/${encodeURIComponent(aircraftModel)}`
    );
  },

  // ==================== Maintenance Triggers ====================

  /**
   * List maintenance triggers
   */
  getTriggers(options: TriggerListOptions = {}): Promise<MaintenanceTrigger[]> {
    return api.get<MaintenanceTrigger[]>("/maintenance-scheduler/triggers", {
      params: {
        limit: options.limit,
        offset: options.offset,
        programId: options.programId,
        type: options.type,
        isActive: options.isActive === undefined ? undefined : String(options.isActive),
      },
    });
  },

  /**
   * Get a maintenance trigger by ID
   */
  getTriggerById(id: string): Promise<MaintenanceTrigger> {
    return api.get<MaintenanceTrigger>(`/maintenance-scheduler/triggers/${id}`);
  },

  /**
   * Create a maintenance trigger
   */
  createTrigger(dto: CreateTriggerDto): Promise<MaintenanceTrigger> {
    return api.post<MaintenanceTrigger>("/maintenance-scheduler/triggers", dto);
  },

  /**
   * Get triggers for a program
   */
  getProgramTriggers(programId: string): Promise<MaintenanceTrigger[]> {
    return api.get<MaintenanceTrigger[]>(`/maintenance-scheduler/programs/${programId}/triggers`);
  },

  // ==================== Maintenance Schedules ====================

  /**
   * List maintenance schedules
   */
  getSchedules(options: ScheduleListOptions = {}): Promise<MaintenanceSchedule[]> {
    return api.get<MaintenanceSchedule[]>("/maintenance-scheduler/schedules", {
      params: {
        limit: options.limit,
        offset: options.offset,
        aircraftId: options.aircraftId,
        status: options.status,
        isActive: options.isActive === undefined ? undefined : String(options.isActive),
      },
    });
  },

  /**
   * Get a maintenance schedule by ID
   */
  getScheduleById(id: string): Promise<MaintenanceSchedule> {
    return api.get<MaintenanceSchedule>(`/maintenance-scheduler/schedules/${id}`);
  },

  /**
   * Get schedules for an aircraft
   */
  getAircraftSchedules(aircraftId: string): Promise<MaintenanceSchedule[]> {
    return api.get<MaintenanceSchedule[]>(
      `/maintenance-scheduler/aircraft/${aircraftId}/schedules`
    );
  },

  /**
   * Get due or overdue schedules
   */
  getDueSchedules(): Promise<MaintenanceSchedule[]> {
    return api.get<MaintenanceSchedule[]>("/maintenance-scheduler/schedules/status/due-overdue");
  },

  /**
   * Get schedules due within N days
   */
  getSchedulesDueWithin(days: number): Promise<MaintenanceSchedule[]> {
    return api.get<MaintenanceSchedule[]>(`/maintenance-scheduler/schedules/due-within/${days}`);
  },

  /**
   * Get schedule status counts
   */
  getScheduleCounts(): Promise<ScheduleCounts> {
    return api.get<ScheduleCounts>("/maintenance-scheduler/schedules/counts");
  },
};
