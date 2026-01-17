/**
 * Inventory Service
 *
 * API client for inventory management
 */

import { api } from "./api";

/**
 * Inventory item types
 */
export interface InventoryItem {
  id: string;
  partNumber: string;
  name: string;
  description: string | null;
  category: string | null;
  unit: string;
  warehouseId: string | null;
  location: string | null;
  binNumber: string | null;
  quantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  minStock: number;
  maxStock: number | null;
  reorderPoint: number;
  reorderQuantity: number;
  unitCost: number | null;
  totalValue: number | null;
  batchNumber: string | null;
  expiryDate: number | null;
  status: string;
  createdAt: number;
  updatedAt: number;
}

export interface CreateInventoryItemDto {
  partNumber: string;
  name: string;
  description?: string;
  category?: string;
  unit?: string;
  warehouseId?: string;
  location?: string;
  binNumber?: string;
  quantity?: number;
  minStock?: number;
  maxStock?: number;
  reorderPoint?: number;
  reorderQuantity?: number;
  unitCost?: number;
  batchNumber?: string;
  expiryDate?: number;
}

export interface UpdateInventoryItemDto {
  name?: string;
  description?: string;
  category?: string;
  unit?: string;
  warehouseId?: string;
  location?: string;
  binNumber?: string;
  minStock?: number;
  maxStock?: number;
  reorderPoint?: number;
  reorderQuantity?: number;
  unitCost?: number;
  status?: string;
}

export interface AdjustInventoryDto {
  quantity: number;
  reason: string;
  notes?: string;
}

export interface InventoryListResponse {
  data: InventoryItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface InventoryListOptions {
  limit?: number;
  offset?: number;
  warehouseId?: string;
  status?: string;
  category?: string;
  lowStock?: boolean;
}

export interface InventoryAlerts {
  lowStock: InventoryItem[];
  expiring: InventoryItem[];
}

/**
 * Inventory API service
 */
export const inventoryService = {
  /**
   * List inventory items with pagination and filters
   */
  list(options: InventoryListOptions = {}): Promise<InventoryListResponse> {
    return api.get<InventoryListResponse>("/inventory", {
      params: {
        limit: options.limit,
        offset: options.offset,
        warehouseId: options.warehouseId,
        status: options.status,
        category: options.category,
        lowStock: options.lowStock ? "true" : undefined,
      },
    });
  },

  /**
   * Get inventory item by ID
   */
  getById(id: string): Promise<InventoryItem> {
    return api.get<InventoryItem>(`/inventory/${id}`);
  },

  /**
   * Search inventory items
   */
  search(query: string, limit?: number): Promise<InventoryItem[]> {
    return api.get<InventoryItem[]>(`/inventory/search/${encodeURIComponent(query)}`, {
      params: { limit },
    });
  },

  /**
   * Create new inventory item
   */
  create(dto: CreateInventoryItemDto): Promise<InventoryItem> {
    return api.post<InventoryItem>("/inventory", dto);
  },

  /**
   * Update inventory item
   */
  update(id: string, dto: UpdateInventoryItemDto): Promise<InventoryItem> {
    return api.put<InventoryItem>(`/inventory/${id}`, dto);
  },

  /**
   * Delete inventory item
   */
  delete(id: string): Promise<void> {
    return api.delete(`/inventory/${id}`);
  },

  /**
   * Adjust inventory quantity
   */
  adjust(id: string, dto: AdjustInventoryDto): Promise<InventoryItem> {
    return api.post<InventoryItem>(`/inventory/${id}/adjust`, dto);
  },

  /**
   * Reserve inventory for work order
   */
  reserve(id: string, quantity: number): Promise<InventoryItem> {
    return api.post<InventoryItem>(`/inventory/${id}/reserve`, { quantity });
  },

  /**
   * Release reserved inventory
   */
  release(id: string, quantity: number): Promise<InventoryItem> {
    return api.post<InventoryItem>(`/inventory/${id}/release`, { quantity });
  },

  /**
   * Get inventory alerts (low stock and expiring)
   */
  getAlerts(): Promise<InventoryAlerts> {
    return api.get<InventoryAlerts>("/inventory/alerts");
  },
};

// ==================== Inventory Movements ====================

/**
 * Movement types
 */
export type MovementType =
  | "RECEIPT"
  | "ISSUE"
  | "TRANSFER"
  | "ADJUSTMENT"
  | "RETURN"
  | "SCRAP"
  | "COUNT";

export type MovementStatus = "PENDING" | "APPROVED" | "COMPLETED" | "CANCELLED";

export interface InventoryMovement {
  id: string;
  movementNumber: string;
  type: MovementType;
  status: MovementStatus;
  inventoryItemId: string | null;
  partNumber: string;
  partName: string | null;
  quantity: number;
  unit: string;
  fromWarehouseId: string | null;
  toWarehouseId: string | null;
  fromLocation: string | null;
  toLocation: string | null;
  referenceType: string | null;
  referenceId: string | null;
  referenceNumber: string | null;
  unitCost: number | null;
  totalCost: number | null;
  batchNumber: string | null;
  serialNumbers: string | null;
  reason: string | null;
  notes: string | null;
  requestedBy: string | null;
  approvedBy: string | null;
  approvedAt: number | null;
  movementDate: number;
  createdAt: number;
  updatedAt: number;
}

export interface CreateMovementDto {
  type: MovementType;
  partNumber: string;
  partName?: string;
  inventoryItemId?: string;
  quantity: number;
  unit?: string;
  fromWarehouseId?: string;
  toWarehouseId?: string;
  fromLocation?: string;
  toLocation?: string;
  referenceType?: string;
  referenceId?: string;
  referenceNumber?: string;
  unitCost?: number;
  batchNumber?: string;
  serialNumbers?: string[];
  reason?: string;
  notes?: string;
}

export interface UpdateMovementDto {
  quantity?: number;
  fromWarehouseId?: string;
  toWarehouseId?: string;
  fromLocation?: string;
  toLocation?: string;
  referenceType?: string;
  referenceId?: string;
  referenceNumber?: string;
  unitCost?: number;
  batchNumber?: string;
  serialNumbers?: string[];
  reason?: string;
  notes?: string;
}

export interface MovementListResponse {
  data: InventoryMovement[];
  total: number;
  limit: number;
  offset: number;
}

export interface MovementListOptions {
  limit?: number;
  offset?: number;
  type?: MovementType;
  status?: MovementStatus;
  warehouseId?: string;
  inventoryItemId?: string;
  startDate?: number;
  endDate?: number;
}

export interface MovementStats {
  total: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
}

/**
 * Inventory Movement API service
 */
export const inventoryMovementService = {
  /**
   * List movements with pagination and filters
   */
  list(options: MovementListOptions = {}): Promise<MovementListResponse> {
    return api.get<MovementListResponse>("/inventory/movements", {
      params: {
        limit: options.limit,
        offset: options.offset,
        type: options.type,
        status: options.status,
        warehouseId: options.warehouseId,
        inventoryItemId: options.inventoryItemId,
        startDate: options.startDate,
        endDate: options.endDate,
      },
    });
  },

  /**
   * Get movement by ID
   */
  getById(id: string): Promise<InventoryMovement> {
    return api.get<InventoryMovement>(`/inventory/movements/${id}`);
  },

  /**
   * Search movements
   */
  search(query: string, limit?: number): Promise<InventoryMovement[]> {
    return api.get<InventoryMovement[]>(
      `/inventory/movements/search/${encodeURIComponent(query)}`,
      { params: { limit } }
    );
  },

  /**
   * Get pending movements
   */
  getPending(): Promise<InventoryMovement[]> {
    return api.get<InventoryMovement[]>("/inventory/movements/pending");
  },

  /**
   * Get movements for an inventory item
   */
  getByInventoryItem(inventoryItemId: string): Promise<InventoryMovement[]> {
    return api.get<InventoryMovement[]>(`/inventory/movements/item/${inventoryItemId}`);
  },

  /**
   * Get movement statistics
   */
  getStats(options: {
    startDate?: number;
    endDate?: number;
    warehouseId?: string;
  } = {}): Promise<MovementStats> {
    return api.get<MovementStats>("/inventory/movements/stats", {
      params: {
        startDate: options.startDate,
        endDate: options.endDate,
        warehouseId: options.warehouseId,
      },
    });
  },

  /**
   * Create new movement
   */
  create(dto: CreateMovementDto): Promise<InventoryMovement> {
    return api.post<InventoryMovement>("/inventory/movements", dto);
  },

  /**
   * Update movement (only for pending)
   */
  update(id: string, dto: UpdateMovementDto): Promise<InventoryMovement> {
    return api.put<InventoryMovement>(`/inventory/movements/${id}`, dto);
  },

  /**
   * Approve movement
   */
  approve(id: string): Promise<InventoryMovement> {
    return api.post<InventoryMovement>(`/inventory/movements/${id}/approve`);
  },

  /**
   * Complete movement
   */
  complete(id: string): Promise<InventoryMovement> {
    return api.post<InventoryMovement>(`/inventory/movements/${id}/complete`);
  },

  /**
   * Cancel movement
   */
  cancel(id: string): Promise<InventoryMovement> {
    return api.post<InventoryMovement>(`/inventory/movements/${id}/cancel`);
  },

  /**
   * Delete movement (only for pending/cancelled)
   */
  delete(id: string): Promise<void> {
    return api.delete(`/inventory/movements/${id}`);
  },
};
