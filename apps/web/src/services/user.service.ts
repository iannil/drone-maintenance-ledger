/**
 * User Service
 *
 * API client for user operations
 */

import { api } from "./api";

/**
 * User role
 */
export type UserRole = "ADMIN" | "MANAGER" | "PILOT" | "MECHANIC" | "INSPECTOR" | "VIEWER";

/**
 * User type (matches backend schema)
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone: string | null;
  employeeId: string | null;
  licenseNumber: string | null;
  department: string | null;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

/**
 * User list options
 */
export interface UserListOptions {
  limit?: number;
  offset?: number;
  role?: UserRole;
}

/**
 * User service
 */
export const userService = {
  /**
   * Get current user profile
   */
  getProfile(): Promise<User> {
    return api.get<User>("/users/me");
  },

  /**
   * Get user by ID
   */
  getById(id: string): Promise<User> {
    return api.get<User>(`/users/${id}`);
  },

  /**
   * List all users (requires ADMIN or MANAGER role)
   */
  list(options: UserListOptions = {}): Promise<User[]> {
    return api.get<User[]>("/users", {
      params: {
        limit: options.limit,
        offset: options.offset,
      },
    });
  },

  /**
   * Get pilots (users with PILOT role)
   */
  async getPilots(limit?: number): Promise<User[]> {
    const users = await api.get<User[]>("/users", {
      params: { limit: limit || 100 },
    });
    return users.filter((u) => u.role === "PILOT" || u.role === "ADMIN" || u.role === "MANAGER");
  },
};

/**
 * Role labels for display
 */
export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "管理员",
  MANAGER: "主管",
  PILOT: "飞行员",
  MECHANIC: "机务人员",
  INSPECTOR: "检验员",
  VIEWER: "查看者",
};

/**
 * Role colors for display
 */
export const ROLE_COLORS: Record<UserRole, string> = {
  ADMIN: "bg-purple-100 text-purple-700",
  MANAGER: "bg-blue-100 text-blue-700",
  PILOT: "bg-green-100 text-green-700",
  MECHANIC: "bg-yellow-100 text-yellow-700",
  INSPECTOR: "bg-orange-100 text-orange-700",
  VIEWER: "bg-slate-100 text-slate-700",
};
