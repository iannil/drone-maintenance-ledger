import { api } from "./api";

/**
 * Work order type (matches backend enum)
 */
export type WorkOrderType =
  | "SCHEDULED"
  | "INSPECTION"
  | "REPAIR"
  | "MODIFICATION"
  | "EMERGENCY";

/**
 * Work order status (matches backend enum)
 */
export type WorkOrderStatus =
  | "DRAFT"
  | "OPEN"
  | "IN_PROGRESS"
  | "PENDING_PARTS"
  | "PENDING_INSPECTION"
  | "COMPLETED"
  | "RELEASED"
  | "CANCELLED";

/**
 * Work order priority (matches backend enum)
 */
export type WorkOrderPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

/**
 * Work order type (matches backend schema)
 */
export interface WorkOrder {
  id: string;
  orderNumber: string;
  aircraftId: string;
  type: WorkOrderType;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  title: string;
  description: string | null;
  reason: string | null;
  assignedTo: string | null;
  assignedAt: number | null;
  scheduledStart: number | null;
  scheduledEnd: number | null;
  actualStart: number | null;
  actualEnd: number | null;
  aircraftHours: number | null;
  aircraftCycles: number | null;
  completedBy: string | null;
  completedAt: number | null;
  releasedBy: string | null;
  releasedAt: number | null;
  completionNotes: string | null;
  discrepancies: string | null;
  scheduleId: string | null;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

/**
 * Work order task
 */
export interface WorkOrderTask {
  id: string;
  workOrderId: string;
  sequence: number;
  title: string;
  description: string | null;
  instructions: string | null;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED";
  isRii: boolean;
  result: string | null;
  notes: string | null;
  completedBy: string | null;
  completedAt: number | null;
  riiSignedOffBy: string | null;
  riiSignedOffAt: number | null;
  createdAt: number;
  updatedAt: number;
}

/**
 * Work order part
 */
export interface WorkOrderPart {
  id: string;
  workOrderId: string;
  componentId: string | null;
  partNumber: string;
  partName: string;
  quantity: number;
  unit: string;
  installedLocation: string | null;
  removedComponentId: string | null;
  removedSerialNumber: string | null;
  createdAt: number;
  updatedAt: number;
}

/**
 * Create work order DTO
 */
export interface CreateWorkOrderDto {
  aircraftId: string;
  type: WorkOrderType;
  title: string;
  description?: string;
  reason?: string;
  priority?: WorkOrderPriority;
  scheduledStart?: number;
  scheduledEnd?: number;
  assignedTo?: string;
  scheduleId?: string;
}

/**
 * Update work order DTO
 */
export interface UpdateWorkOrderDto {
  title?: string;
  description?: string;
  reason?: string;
  priority?: WorkOrderPriority;
  scheduledStart?: number;
  scheduledEnd?: number;
  completionNotes?: string;
  discrepancies?: string;
}

/**
 * Add task DTO
 */
export interface AddTaskDto {
  sequence: number;
  title: string;
  description?: string;
  instructions?: string;
  isRii?: boolean;
}

/**
 * Work order service
 */
export const workOrderService = {
  /**
   * List work orders
   */
  list(params?: {
    limit?: number;
    offset?: number;
    aircraftId?: string;
    assigneeId?: string;
    status?: WorkOrderStatus;
    open?: boolean;
    recent?: boolean;
  }): Promise<WorkOrder[]> {
    const queryParams: Record<string, string | number | undefined> = {
      limit: params?.limit,
      offset: params?.offset,
      aircraftId: params?.aircraftId,
      assigneeId: params?.assigneeId,
      status: params?.status,
      open: params?.open ? "true" : undefined,
      recent: params?.recent ? "true" : undefined,
    };
    return api.get<WorkOrder[]>("/work-orders", { params: queryParams });
  },

  /**
   * Get recent work orders
   */
  getRecent(limit: number = 20): Promise<WorkOrder[]> {
    return api.get<WorkOrder[]>("/work-orders", {
      params: { recent: "true", limit },
    });
  },

  /**
   * Get open work orders
   */
  getOpen(limit?: number, offset?: number): Promise<WorkOrder[]> {
    return api.get<WorkOrder[]>("/work-orders", {
      params: { open: "true", limit, offset },
    });
  },

  /**
   * Get work order by ID
   */
  getById(id: string): Promise<WorkOrder> {
    return api.get<WorkOrder>(`/work-orders/${id}`);
  },

  /**
   * Get work orders by aircraft
   */
  getByAircraft(
    aircraftId: string,
    limit?: number,
    offset?: number
  ): Promise<WorkOrder[]> {
    return api.get<WorkOrder[]>("/work-orders", {
      params: { aircraftId, limit, offset },
    });
  },

  /**
   * Get work orders by status
   */
  getByStatus(
    status: WorkOrderStatus,
    limit?: number,
    offset?: number
  ): Promise<WorkOrder[]> {
    return api.get<WorkOrder[]>("/work-orders", {
      params: { status, limit, offset },
    });
  },

  /**
   * Create a new work order
   */
  create(dto: CreateWorkOrderDto): Promise<WorkOrder> {
    return api.post<WorkOrder>("/work-orders", dto);
  },

  /**
   * Update a work order
   */
  update(id: string, dto: UpdateWorkOrderDto): Promise<WorkOrder> {
    return api.put<WorkOrder>(`/work-orders/${id}`, dto);
  },

  /**
   * Update work order status
   */
  updateStatus(id: string, status: WorkOrderStatus): Promise<WorkOrder> {
    return api.put<WorkOrder>(`/work-orders/${id}/status`, { status });
  },

  /**
   * Assign work order to a user
   */
  assign(id: string, userId: string): Promise<WorkOrder> {
    return api.put<WorkOrder>(`/work-orders/${id}/assign`, { userId });
  },

  /**
   * Start work on a work order
   */
  start(id: string): Promise<WorkOrder> {
    return api.post<WorkOrder>(`/work-orders/${id}/start`);
  },

  /**
   * Complete a work order
   */
  complete(id: string, notes?: string): Promise<WorkOrder> {
    return api.post<WorkOrder>(`/work-orders/${id}/complete`, { notes });
  },

  /**
   * Release work order
   */
  release(id: string): Promise<WorkOrder> {
    return api.post<WorkOrder>(`/work-orders/${id}/release`);
  },

  /**
   * Cancel work order
   */
  cancel(id: string): Promise<WorkOrder> {
    return api.post<WorkOrder>(`/work-orders/${id}/cancel`);
  },

  /**
   * Delete work order
   */
  delete(id: string): Promise<void> {
    return api.delete(`/work-orders/${id}`);
  },

  // Task management

  /**
   * Get tasks for a work order
   */
  getTasks(workOrderId: string): Promise<WorkOrderTask[]> {
    return api.get<WorkOrderTask[]>(`/work-orders/${workOrderId}/tasks`);
  },

  /**
   * Add task to work order
   */
  addTask(workOrderId: string, dto: AddTaskDto): Promise<WorkOrderTask> {
    return api.post<WorkOrderTask>(`/work-orders/${workOrderId}/tasks`, dto);
  },

  /**
   * Update task status
   */
  updateTaskStatus(
    taskId: string,
    status: WorkOrderTask["status"]
  ): Promise<WorkOrderTask> {
    return api.put<WorkOrderTask>(`/work-orders/tasks/${taskId}/status`, {
      status,
    });
  },

  /**
   * Sign off RII task
   */
  signOffRiiTask(taskId: string): Promise<WorkOrderTask> {
    return api.post<WorkOrderTask>(`/work-orders/tasks/${taskId}/sign-off`);
  },

  // Part management

  /**
   * Get parts for a work order
   */
  getParts(workOrderId: string): Promise<WorkOrderPart[]> {
    return api.get<WorkOrderPart[]>(`/work-orders/${workOrderId}/parts`);
  },
};

/**
 * Work order type labels
 */
export const WORK_ORDER_TYPE_LABELS: Record<WorkOrderType, string> = {
  SCHEDULED: "计划性",
  INSPECTION: "检查",
  REPAIR: "维修",
  MODIFICATION: "改装",
  EMERGENCY: "紧急",
};

/**
 * Work order type colors
 */
export const WORK_ORDER_TYPE_COLORS: Record<WorkOrderType, string> = {
  SCHEDULED: "bg-purple-50 text-purple-700 border-purple-200",
  INSPECTION: "bg-blue-50 text-blue-700 border-blue-200",
  REPAIR: "bg-orange-50 text-orange-700 border-orange-200",
  MODIFICATION: "bg-green-50 text-green-700 border-green-200",
  EMERGENCY: "bg-red-50 text-red-700 border-red-200",
};

/**
 * Work order status labels
 */
export const WORK_ORDER_STATUS_LABELS: Record<WorkOrderStatus, string> = {
  DRAFT: "草稿",
  OPEN: "待处理",
  IN_PROGRESS: "进行中",
  PENDING_PARTS: "等待备件",
  PENDING_INSPECTION: "待检验",
  COMPLETED: "已完成",
  RELEASED: "已放行",
  CANCELLED: "已取消",
};

/**
 * Work order status colors
 */
export const WORK_ORDER_STATUS_COLORS: Record<WorkOrderStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  OPEN: "bg-slate-100 text-slate-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  PENDING_PARTS: "bg-yellow-100 text-yellow-700",
  PENDING_INSPECTION: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-green-100 text-green-700",
  RELEASED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

/**
 * Work order priority labels
 */
export const WORK_ORDER_PRIORITY_LABELS: Record<WorkOrderPriority, string> = {
  LOW: "低",
  MEDIUM: "中",
  HIGH: "高",
  CRITICAL: "紧急",
};

/**
 * Work order priority colors
 */
export const WORK_ORDER_PRIORITY_COLORS: Record<WorkOrderPriority, string> = {
  LOW: "bg-slate-400",
  MEDIUM: "bg-yellow-500",
  HIGH: "bg-orange-500",
  CRITICAL: "bg-red-500",
};
