import { api } from "./api";

/**
 * Flight type (matches backend enum)
 */
export type FlightType = "OPERATION" | "TRAINING" | "TEST" | "FERRY" | "DELIVERY";

/**
 * Flight log type (matches backend schema)
 */
export interface FlightLog {
  id: string;
  aircraftId: string;
  flightDate: number;
  flightType: FlightType;
  departureLocation: string;
  departureTime: number | null;
  arrivalLocation: string | null;
  arrivalTime: number | null;
  pilotId: string;
  copilotId: string | null;
  flightDuration: number; // minutes
  flightHours: number; // hours
  takeoffCycles: number;
  landingCycles: number;
  missionDescription: string | null;
  payloadWeight: number | null;
  preFlightCheckCompleted: boolean;
  preFlightCheckBy: string | null;
  postFlightNotes: string | null;
  discrepancies: string | null;
  aircraftHoursBefore: number | null;
  aircraftHoursAfter: number | null;
  aircraftCyclesBefore: number | null;
  aircraftCyclesAfter: number | null;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

/**
 * Create flight log DTO
 */
export interface CreateFlightLogDto {
  aircraftId: string;
  pilotId: string;
  copilotId?: string;
  flightDate: number;
  flightType: FlightType;
  departureLocation: string;
  departureTime?: number;
  arrivalLocation?: string;
  arrivalTime?: number;
  flightDuration: number;
  flightHours: number;
  takeoffCycles?: number;
  landingCycles?: number;
  missionDescription?: string;
  payloadWeight?: number;
  preFlightCheckCompleted?: boolean;
  preFlightCheckBy?: string;
  postFlightNotes?: string;
  discrepancies?: string;
}

/**
 * Update flight log DTO
 */
export interface UpdateFlightLogDto {
  flightDate?: number;
  flightType?: FlightType;
  departureLocation?: string;
  departureTime?: number;
  arrivalLocation?: string;
  arrivalTime?: number;
  flightDuration?: number;
  flightHours?: number;
  takeoffCycles?: number;
  landingCycles?: number;
  missionDescription?: string;
  payloadWeight?: number;
  postFlightNotes?: string;
  discrepancies?: string;
}

/**
 * Aircraft flight statistics
 */
export interface AircraftFlightStats {
  totalFlights: number;
  totalHours: number;
  totalCycles: number;
  lastFlightDate: number | null;
}

/**
 * Flight log service
 */
export const flightLogService = {
  /**
   * List flight logs
   * Can filter by aircraft, pilot, or date range
   */
  list(params?: {
    limit?: number;
    offset?: number;
    aircraftId?: string;
    pilotId?: string;
    recent?: boolean;
    startDate?: string;
    endDate?: string;
  }): Promise<FlightLog[]> {
    return api.get<FlightLog[]>("/flight-logs", { params });
  },

  /**
   * Get recent flight logs
   */
  getRecent(limit: number = 20): Promise<FlightLog[]> {
    return api.get<FlightLog[]>("/flight-logs", {
      params: { recent: "true", limit },
    });
  },

  /**
   * Get flight log by ID
   */
  getById(id: string): Promise<FlightLog> {
    return api.get<FlightLog>(`/flight-logs/${id}`);
  },

  /**
   * Get flight logs for an aircraft
   */
  getByAircraft(
    aircraftId: string,
    limit?: number,
    offset?: number
  ): Promise<FlightLog[]> {
    return api.get<FlightLog[]>("/flight-logs", {
      params: { aircraftId, limit, offset },
    });
  },

  /**
   * Get flight logs by pilot
   */
  getByPilot(
    pilotId: string,
    limit?: number,
    offset?: number
  ): Promise<FlightLog[]> {
    return api.get<FlightLog[]>("/flight-logs", {
      params: { pilotId, limit, offset },
    });
  },

  /**
   * Get flight logs by date range
   */
  getByDateRange(startDate: string, endDate: string): Promise<FlightLog[]> {
    return api.get<FlightLog[]>("/flight-logs", {
      params: { startDate, endDate },
    });
  },

  /**
   * Get aircraft flight statistics
   */
  getAircraftStats(aircraftId: string): Promise<AircraftFlightStats> {
    return api.get<AircraftFlightStats>(
      `/flight-logs/aircraft/${aircraftId}/stats`
    );
  },

  /**
   * Create a new flight log
   */
  create(dto: CreateFlightLogDto): Promise<FlightLog> {
    return api.post<FlightLog>("/flight-logs", dto);
  },

  /**
   * Update a flight log
   */
  update(id: string, dto: UpdateFlightLogDto): Promise<FlightLog> {
    return api.put<FlightLog>(`/flight-logs/${id}`, dto);
  },

  /**
   * Delete a flight log (soft delete)
   */
  delete(id: string): Promise<void> {
    return api.delete(`/flight-logs/${id}`);
  },
};

/**
 * Flight type labels for display
 */
export const FLIGHT_TYPE_LABELS: Record<FlightType, string> = {
  OPERATION: "运营",
  TRAINING: "训练",
  TEST: "测试",
  FERRY: "转场",
  DELIVERY: "配送",
};

/**
 * Flight type colors for display
 */
export const FLIGHT_TYPE_COLORS: Record<FlightType, string> = {
  OPERATION: "bg-blue-50 text-blue-700 border-blue-200",
  TRAINING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  TEST: "bg-slate-50 text-slate-700 border-slate-200",
  FERRY: "bg-purple-50 text-purple-700 border-purple-200",
  DELIVERY: "bg-green-50 text-green-700 border-green-200",
};
