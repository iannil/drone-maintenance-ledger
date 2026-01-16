import { api } from "./api";

/**
 * Fleet types
 */
export interface Fleet {
  id: string;
  name: string;
  code: string;
  organization: string;
  description: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface CreateFleetDto {
  name: string;
  code: string;
  organization: string;
  description?: string;
}

export interface UpdateFleetDto {
  name?: string;
  code?: string;
  organization?: string;
  description?: string;
}

export interface FleetStatusCounts {
  serviceable: number;
  maintenance: number;
  grounded: number;
  retired: number;
}

/**
 * Fleet with aircraft status counts
 */
export interface FleetWithStats extends Fleet {
  aircraftCount: number;
  statusCounts: FleetStatusCounts;
}

/**
 * Fleet API service
 */
export const fleetService = {
  /**
   * List all fleets
   */
  list(limit?: number, offset?: number): Promise<Fleet[]> {
    return api.get<Fleet[]>("/fleets", {
      params: { limit, offset },
    });
  },

  /**
   * Get fleet by ID
   */
  getById(id: string): Promise<Fleet> {
    return api.get<Fleet>(`/fleets/${id}`);
  },

  /**
   * Search fleets
   */
  search(query: string, limit?: number): Promise<Fleet[]> {
    return api.get<Fleet[]>(`/fleets/search/${encodeURIComponent(query)}`, {
      params: { limit },
    });
  },

  /**
   * Create a new fleet
   */
  create(dto: CreateFleetDto): Promise<Fleet> {
    return api.post<Fleet>("/fleets", dto);
  },

  /**
   * Update a fleet
   */
  update(id: string, dto: UpdateFleetDto): Promise<Fleet> {
    return api.put<Fleet>(`/fleets/${id}`, dto);
  },

  /**
   * Delete a fleet
   */
  delete(id: string): Promise<void> {
    return api.delete(`/fleets/${id}`);
  },
};

/**
 * Aircraft service for fleet-related queries
 */
export const aircraftService = {
  /**
   * Get aircraft status counts (optionally filtered by fleet)
   */
  getStatusCounts(fleetId?: string): Promise<FleetStatusCounts> {
    return api.get<FleetStatusCounts>("/aircraft/status/counts", {
      params: { fleetId },
    });
  },

  /**
   * List aircraft by fleet
   */
  listByFleet(fleetId: string, limit?: number, offset?: number): Promise<Aircraft[]> {
    return api.get<Aircraft[]>("/aircraft", {
      params: { fleetId, limit, offset },
    });
  },
};

/**
 * Aircraft status enum (matches backend)
 */
export type AircraftStatus = "AVAILABLE" | "IN_MAINTENANCE" | "AOG" | "RETIRED";

/**
 * Aircraft type (matches backend schema)
 */
export interface Aircraft {
  id: string;
  fleetId: string;
  registrationNumber: string;
  serialNumber: string;
  model: string;
  manufacturer: string;
  status: AircraftStatus;
  totalFlightHours: number;
  totalFlightCycles: number;
  isAirworthy: boolean;
  lastInspectionAt: number | null;
  nextInspectionDue: number | null;
  createdAt: number;
  updatedAt: number;
}

/**
 * Full aircraft service
 */
export const fullAircraftService = {
  /**
   * List all aircraft
   */
  list(limit?: number, offset?: number, fleetId?: string): Promise<Aircraft[]> {
    return api.get<Aircraft[]>("/aircraft", {
      params: { limit, offset, fleetId },
    });
  },

  /**
   * Get aircraft by ID
   */
  getById(id: string): Promise<Aircraft> {
    return api.get<Aircraft>(`/aircraft/${id}`);
  },

  /**
   * Get aircraft status counts
   */
  getStatusCounts(fleetId?: string): Promise<FleetStatusCounts> {
    return api.get<FleetStatusCounts>("/aircraft/status/counts", {
      params: { fleetId },
    });
  },
};
