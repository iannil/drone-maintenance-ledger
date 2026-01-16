import { api } from "./api";

/**
 * Component types (matches backend enum)
 */
export type ComponentType =
  | "MOTOR"
  | "PROPELLER"
  | "BATTERY"
  | "ESC"
  | "FLIGHT_CONTROLLER"
  | "GPS"
  | "CAMERA"
  | "GIMBAL"
  | "LANDING_GEAR"
  | "OTHER";

/**
 * Component status (matches backend enum)
 * Note: Backend uses NEW, IN_USE, REPAIR, SCRAPPED, LOST
 * For UI display, we map: NEW/IN_USE->IN_STOCK/INSTALLED based on installation
 */
export type ComponentStatus = "NEW" | "IN_USE" | "REPAIR" | "SCRAPPED" | "LOST";

/**
 * Component type (matches backend schema)
 */
export interface Component {
  id: string;
  serialNumber: string;
  partNumber: string;
  type: ComponentType;
  manufacturer: string;
  model: string | null;
  description: string | null;
  totalFlightHours: number;
  totalFlightCycles: number;
  batteryCycles: number;
  isLifeLimited: boolean;
  maxFlightHours: number | null;
  maxCycles: number | null;
  status: ComponentStatus;
  isAirworthy: boolean;
  manufacturedAt: number | null;
  purchasedAt: number | null;
  createdAt: number;
  updatedAt: number;
}

/**
 * Component installation record (from component_installation table)
 */
export interface ComponentInstallation {
  id: string;
  componentId: string;
  aircraftId: string;
  position: string;
  installedAt: number;
  installedBy: string | null;
  removedAt: number | null;
  removedBy: string | null;
  removeReason: string | null;
  flightHoursAtInstall: number;
  flightCyclesAtInstall: number;
  flightHoursAtRemoval: number | null;
  flightCyclesAtRemoval: number | null;
  createdAt: number;
  updatedAt: number;
}

/**
 * Component with current installation info
 */
export interface ComponentWithInstallation extends Component {
  currentInstallation?: ComponentInstallation & {
    aircraftRegistration?: string;
  };
}

/**
 * Create component DTO
 */
export interface CreateComponentDto {
  serialNumber: string;
  partNumber: string;
  type: ComponentType;
  manufacturer: string;
  model?: string;
  description?: string;
  isLifeLimited?: boolean;
  maxFlightHours?: number;
  maxCycles?: number;
  manufacturedAt?: number;
  purchasedAt?: number;
}

/**
 * Update component DTO
 */
export interface UpdateComponentDto {
  partNumber?: string;
  type?: ComponentType;
  manufacturer?: string;
  model?: string;
  description?: string;
  status?: ComponentStatus;
  isAirworthy?: boolean;
  isLifeLimited?: boolean;
  maxFlightHours?: number;
  maxCycles?: number;
}

/**
 * Install component DTO
 */
export interface InstallComponentDto {
  componentId: string;
  aircraftId: string;
  position: string;
  installedBy?: string;
}

/**
 * Remove component DTO
 */
export interface RemoveComponentDto {
  componentId: string;
  removeReason: string;
  removedBy?: string;
}

/**
 * Component service
 */
export const componentService = {
  /**
   * List all components
   */
  list(limit?: number, offset?: number, aircraftId?: string): Promise<Component[]> {
    return api.get<Component[]>("/components", {
      params: { limit, offset, aircraftId },
    });
  },

  /**
   * Get component by ID
   */
  getById(id: string): Promise<Component> {
    return api.get<Component>(`/components/${id}`);
  },

  /**
   * Get component by serial number
   */
  getBySerialNumber(serialNumber: string): Promise<Component> {
    return api.get<Component>(`/components/serial/${encodeURIComponent(serialNumber)}`);
  },

  /**
   * Get components due for maintenance
   */
  getDueForMaintenance(): Promise<Component[]> {
    return api.get<Component[]>("/components/maintenance/due");
  },

  /**
   * Create a new component
   */
  create(dto: CreateComponentDto): Promise<Component> {
    return api.post<Component>("/components", dto);
  },

  /**
   * Update a component
   */
  update(id: string, dto: UpdateComponentDto): Promise<Component> {
    return api.put<Component>(`/components/${id}`, dto);
  },

  /**
   * Delete a component
   */
  delete(id: string): Promise<void> {
    return api.delete(`/components/${id}`);
  },

  /**
   * Install component on aircraft
   */
  install(dto: InstallComponentDto): Promise<ComponentInstallation> {
    return api.post<ComponentInstallation>("/components/install", dto);
  },

  /**
   * Remove component from aircraft
   */
  remove(dto: RemoveComponentDto): Promise<ComponentInstallation> {
    return api.post<ComponentInstallation>("/components/remove", dto);
  },
};

/**
 * Type labels for display
 */
export const COMPONENT_TYPE_LABELS: Record<ComponentType, string> = {
  MOTOR: "电机",
  PROPELLER: "桨叶",
  BATTERY: "电池",
  ESC: "电调",
  FLIGHT_CONTROLLER: "飞控",
  GPS: "GPS",
  CAMERA: "相机",
  GIMBAL: "云台",
  LANDING_GEAR: "起落架",
  OTHER: "其他",
};

/**
 * Status labels for display
 */
export const COMPONENT_STATUS_LABELS: Record<ComponentStatus, string> = {
  NEW: "全新",
  IN_USE: "使用中",
  REPAIR: "维修中",
  SCRAPPED: "已报废",
  LOST: "丢失",
};

/**
 * Map backend status to display status for ComponentStatusBadge
 */
export type DisplayStatus = "IN_STOCK" | "INSTALLED" | "REMOVED" | "SCRAPPED";

export const STATUS_DISPLAY_MAP: Record<ComponentStatus, DisplayStatus> = {
  NEW: "IN_STOCK",
  IN_USE: "INSTALLED",
  REPAIR: "REMOVED",
  SCRAPPED: "SCRAPPED",
  LOST: "SCRAPPED",
};
