/**
 * Warehouse Service
 *
 * API client for warehouse management
 */

import { api } from "./api";

/**
 * Warehouse types
 */
export interface Warehouse {
  id: string;
  code: string;
  name: string;
  description: string | null;
  address: string | null;
  contactPerson: string | null;
  contactPhone: string | null;
  status: string;
  createdAt: number;
  updatedAt: number;
}

export interface CreateWarehouseDto {
  code: string;
  name: string;
  description?: string;
  address?: string;
  contactPerson?: string;
  contactPhone?: string;
}

export interface UpdateWarehouseDto {
  code?: string;
  name?: string;
  description?: string;
  address?: string;
  contactPerson?: string;
  contactPhone?: string;
  status?: string;
}

export interface WarehouseListOptions {
  limit?: number;
  offset?: number;
  status?: string;
}

/**
 * Warehouse API service
 */
export const warehouseService = {
  /**
   * List all warehouses
   */
  list(options: WarehouseListOptions = {}): Promise<Warehouse[]> {
    return api.get<Warehouse[]>("/warehouses", {
      params: {
        limit: options.limit,
        offset: options.offset,
        status: options.status,
      },
    });
  },

  /**
   * Get warehouse by ID
   */
  getById(id: string): Promise<Warehouse> {
    return api.get<Warehouse>(`/warehouses/${id}`);
  },

  /**
   * Search warehouses
   */
  search(query: string, limit?: number): Promise<Warehouse[]> {
    return api.get<Warehouse[]>(`/warehouses/search/${encodeURIComponent(query)}`, {
      params: { limit },
    });
  },

  /**
   * Create new warehouse
   */
  create(dto: CreateWarehouseDto): Promise<Warehouse> {
    return api.post<Warehouse>("/warehouses", dto);
  },

  /**
   * Update warehouse
   */
  update(id: string, dto: UpdateWarehouseDto): Promise<Warehouse> {
    return api.put<Warehouse>(`/warehouses/${id}`, dto);
  },

  /**
   * Delete warehouse
   */
  delete(id: string): Promise<void> {
    return api.delete(`/warehouses/${id}`);
  },
};
