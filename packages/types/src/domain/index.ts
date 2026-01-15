/**
 * Domain types
 *
 * Core business entity types
 */

/**
 * User roles enum
 */
export enum UserRole {
  PILOT = "PILOT",
  MECHANIC = "MECHANIC",
  INSPECTOR = "INSPECTOR",
  MANAGER = "MANAGER",
  ADMIN = "ADMIN",
}

/**
 * User interface
 */
export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  fullName: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Aircraft status enum
 */
export enum AircraftStatus {
  AVAILABLE = "AVAILABLE",
  IN_MAINTENANCE = "IN_MAINTENANCE",
  AOG = "AOG",
  RETIRED = "RETIRED",
}

/**
 * Component type enum
 */
export enum ComponentType {
  MOTOR = "MOTOR",
  PROPELLER = "PROPELLER",
  BATTERY = "BATTERY",
  ESC = "ESC",
  FLIGHT_CONTROLLER = "FLIGHT_CONTROLLER",
  GPS = "GPS",
  CAMERA = "CAMERA",
  GIMBAL = "GIMBAL",
  LANDING_GEAR = "LANDING_GEAR",
  OTHER = "OTHER",
}

/**
 * Component status enum
 */
export enum ComponentStatus {
  NEW = "NEW",
  IN_USE = "IN_USE",
  REPAIR = "REPAIR",
  SCRAPPED = "SCRAPPED",
  LOST = "LOST",
}
