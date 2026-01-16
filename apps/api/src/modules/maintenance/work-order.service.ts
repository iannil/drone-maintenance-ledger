import { Injectable, NotFoundException, ConflictException, Inject } from "@nestjs/common";

import type { WorkOrder, WorkOrderTask, WorkOrderPart } from "@repo/db";
import { WorkOrderRepository } from "./repositories/work-order.repository";
import { WorkOrderTaskRepository } from "./repositories/work-order-task.repository";
import { WorkOrderPartRepository } from "./repositories/work-order-part.repository";

/**
 * DTOs for work order operations
 */
export interface CreateWorkOrderDto {
  aircraftId: string;
  type: WorkOrder["type"];
  title: string;
  description?: string;
  reason?: string;
  priority?: WorkOrder["priority"];
  scheduledStart?: Date;
  scheduledEnd?: Date;
  assignedTo?: string;
  scheduleId?: string;
}

export interface UpdateWorkOrderDto {
  title?: string;
  description?: string;
  reason?: string;
  priority?: WorkOrder["priority"];
  scheduledStart?: Date;
  scheduledEnd?: Date;
  completionNotes?: string;
  discrepancies?: string;
}

export interface AddTaskDto {
  sequence: number;
  title: string;
  description?: string;
  instructions?: string;
  isRii?: boolean;
  requiredTools?: string[];
  requiredParts?: Array<{ partNumber: string; quantity: number }>;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  instructions?: string;
  status?: WorkOrderTask["status"];
  result?: string;
  notes?: string;
}

export interface AddPartDto {
  componentId?: string;
  partNumber: string;
  partName: string;
  quantity: number;
  unit: string;
  installedLocation?: string;
  removedComponentId?: string;
  removedSerialNumber?: string;
}

/**
 * Work Order service
 *
 * Handles work order business logic
 * Work orders are the primary mechanism for managing maintenance work
 */
@Injectable()
export class WorkOrderService {
  private workOrderRepository: WorkOrderRepository;
  private taskRepository: WorkOrderTaskRepository;
  private partRepository: WorkOrderPartRepository;

  constructor(
    @Inject(WorkOrderRepository) workOrderRepository: WorkOrderRepository,
    @Inject(WorkOrderTaskRepository) taskRepository: WorkOrderTaskRepository,
    @Inject(WorkOrderPartRepository) partRepository: WorkOrderPartRepository,
  ) {
    this.workOrderRepository = workOrderRepository;
    this.taskRepository = taskRepository;
    this.partRepository = partRepository;
  }

  /**
   * Find work order by ID
   */
  async findById(id: string): Promise<WorkOrder | null> {
    return this.workOrderRepository.findById(id);
  }

  /**
   * Find work orders by aircraft
   */
  async findByAircraft(aircraftId: string, limit: number = 50, offset: number = 0) {
    return this.workOrderRepository.findByAircraft(aircraftId, limit, offset);
  }

  /**
   * Find work orders by assignee
   */
  async findByAssignee(assigneeId: string, limit: number = 50, offset: number = 0) {
    return this.workOrderRepository.findByAssignee(assigneeId, limit, offset);
  }

  /**
   * Find open work orders
   */
  async findOpen(limit: number = 50, offset: number = 0) {
    return this.workOrderRepository.findOpen(limit, offset);
  }

  /**
   * Find work orders by status
   */
  async findByStatus(status: WorkOrder["status"], limit: number = 50, offset: number = 0) {
    return this.workOrderRepository.findByStatus(status, limit, offset);
  }

  /**
   * Get recent work orders
   */
  async getRecent(limit: number = 20) {
    return this.workOrderRepository.findRecent(limit);
  }

  /**
   * Create new work order
   */
  async create(dto: CreateWorkOrderDto): Promise<WorkOrder> {
    // Generate work order number
    const orderNumber = await this.workOrderRepository.generateOrderNumber();

    return this.workOrderRepository.create({
      ...dto,
      orderNumber,
      status: dto.assignedTo ? "OPEN" : "DRAFT",
      priority: dto.priority || "MEDIUM",
      assignedAt: dto.assignedTo ? new Date() : null,
    });
  }

  /**
   * Update work order
   */
  async update(id: string, dto: UpdateWorkOrderDto): Promise<WorkOrder> {
    const existing = await this.workOrderRepository.findById(id);
    if (!existing) {
      throw new NotFoundException("Work order not found");
    }

    // Cannot modify released work orders
    if (existing.status === "RELEASED") {
      throw new ConflictException("Cannot modify a released work order");
    }

    return this.workOrderRepository.update(id, dto);
  }

  /**
   * Update work order status
   */
  async updateStatus(id: string, status: WorkOrder["status"]): Promise<WorkOrder> {
    const existing = await this.workOrderRepository.findById(id);
    if (!existing) {
      throw new NotFoundException("Work order not found");
    }

    // Validate status transitions
    if (existing.status === "RELEASED") {
      throw new ConflictException("Cannot modify a released work order");
    }

    if (existing.status === "CANCELLED" && status !== "DRAFT") {
      throw new ConflictException("Cannot reopen a cancelled work order");
    }

    return this.workOrderRepository.updateStatus(id, status);
  }

  /**
   * Assign work order to a user
   */
  async assign(id: string, userId: string): Promise<WorkOrder> {
    const existing = await this.workOrderRepository.findById(id);
    if (!existing) {
      throw new NotFoundException("Work order not found");
    }

    if (existing.status === "RELEASED") {
      throw new ConflictException("Cannot assign a released work order");
    }

    return this.workOrderRepository.assign(id, userId);
  }

  /**
   * Start work on a work order
   */
  async start(id: string): Promise<WorkOrder> {
    const existing = await this.workOrderRepository.findById(id);
    if (!existing) {
      throw new NotFoundException("Work order not found");
    }

    if (existing.status === "RELEASED") {
      throw new ConflictException("Cannot start a released work order");
    }

    return this.workOrderRepository.start(id);
  }

  /**
   * Complete a work order
   */
  async complete(id: string, userId: string, notes?: string): Promise<WorkOrder> {
    const existing = await this.workOrderRepository.findById(id);
    if (!existing) {
      throw new NotFoundException("Work order not found");
    }

    // Check if all RII tasks are completed
    const riiTasks = await this.taskRepository.findRiiTasks(id);
    const pendingRii = riiTasks.filter((t) => t.status !== "COMPLETED");
    if (pendingRii.length > 0) {
      throw new ConflictException(
        `Cannot complete work order: ${pendingRii.length} RII task(s) pending inspection`,
      );
    }

    return this.workOrderRepository.complete(id, userId, notes);
  }

  /**
   * Release work order (aircraft returned to service)
   * Only inspector can release
   */
  async release(id: string, userId: string): Promise<WorkOrder> {
    const existing = await this.workOrderRepository.findById(id);
    if (!existing) {
      throw new NotFoundException("Work order not found");
    }

    if (existing.status !== "COMPLETED") {
      throw new ConflictException("Cannot release a work order that is not completed");
    }

    return this.workOrderRepository.release(id, userId);
  }

  /**
   * Cancel work order
   */
  async cancel(id: string): Promise<WorkOrder> {
    const existing = await this.workOrderRepository.findById(id);
    if (!existing) {
      throw new NotFoundException("Work order not found");
    }

    if (existing.status === "RELEASED") {
      throw new ConflictException("Cannot cancel a released work order");
    }

    return this.workOrderRepository.updateStatus(id, "CANCELLED");
  }

  /**
   * Delete work order (soft delete)
   */
  async delete(id: string): Promise<void> {
    const existing = await this.workOrderRepository.findById(id);
    if (!existing) {
      throw new NotFoundException("Work order not found");
    }

    // Cannot delete active work orders
    if (["OPEN", "IN_PROGRESS"].includes(existing.status)) {
      throw new ConflictException("Cannot delete an active work order");
    }

    await this.workOrderRepository.delete(id);
  }

  // ========== Task Management ==========

  /**
   * Get tasks for a work order
   */
  async getTasks(workOrderId: string): Promise<WorkOrderTask[]> {
    return this.taskRepository.findByWorkOrder(workOrderId);
  }

  /**
   * Add task to work order
   */
  async addTask(workOrderId: string, dto: AddTaskDto): Promise<WorkOrderTask> {
    const workOrder = await this.workOrderRepository.findById(workOrderId);
    if (!workOrder) {
      throw new NotFoundException("Work order not found");
    }

    return this.taskRepository.create({
      ...dto,
      workOrderId,
      status: "PENDING",
    });
  }

  /**
   * Add multiple tasks to work order
   */
  async addTasks(workOrderId: string, tasks: AddTaskDto[]): Promise<WorkOrderTask[]> {
    const workOrder = await this.workOrderRepository.findById(workOrderId);
    if (!workOrder) {
      throw new NotFoundException("Work order not found");
    }

    const taskData = tasks.map((dto) => ({
      ...dto,
      workOrderId,
      status: "PENDING" as const,
    }));

    return this.taskRepository.createMany(taskData);
  }

  /**
   * Update task
   */
  async updateTask(taskId: string, dto: UpdateTaskDto): Promise<WorkOrderTask> {
    const existing = await this.taskRepository.findById(taskId);
    if (!existing) {
      throw new NotFoundException("Task not found");
    }

    return this.taskRepository.update(taskId, dto);
  }

  /**
   * Update task status
   */
  async updateTaskStatus(taskId: string, status: WorkOrderTask["status"]): Promise<WorkOrderTask> {
    const existing = await this.taskRepository.findById(taskId);
    if (!existing) {
      throw new NotFoundException("Task not found");
    }

    // RII tasks must be signed off by inspector
    if (existing.isRii && status === "COMPLETED") {
      throw new ConflictException("RII tasks must be signed off by an inspector");
    }

    return this.taskRepository.updateStatus(taskId, status);
  }

  /**
   * Sign off RII task
   */
  async signOffRiiTask(taskId: string, inspectorId: string): Promise<WorkOrderTask> {
    const existing = await this.taskRepository.findById(taskId);
    if (!existing) {
      throw new NotFoundException("Task not found");
    }

    if (!existing.isRii) {
      throw new ConflictException("This is not an RII task");
    }

    return this.taskRepository.signOffRii(taskId, inspectorId);
  }

  /**
   * Delete task
   */
  async deleteTask(taskId: string): Promise<void> {
    const existing = await this.taskRepository.findById(taskId);
    if (!existing) {
      throw new NotFoundException("Task not found");
    }

    await this.taskRepository.delete(taskId);
  }

  // ========== Part Management ==========

  /**
   * Get parts for a work order
   */
  async getParts(workOrderId: string): Promise<WorkOrderPart[]> {
    return this.partRepository.findByWorkOrder(workOrderId);
  }

  /**
   * Add part to work order
   */
  async addPart(workOrderId: string, dto: AddPartDto): Promise<WorkOrderPart> {
    const workOrder = await this.workOrderRepository.findById(workOrderId);
    if (!workOrder) {
      throw new NotFoundException("Work order not found");
    }

    return this.partRepository.create({
      ...dto,
      workOrderId,
    });
  }

  /**
   * Add multiple parts to work order
   */
  async addParts(workOrderId: string, parts: AddPartDto[]): Promise<WorkOrderPart[]> {
    const workOrder = await this.workOrderRepository.findById(workOrderId);
    if (!workOrder) {
      throw new NotFoundException("Work order not found");
    }

    const partData = parts.map((dto) => ({
      ...dto,
      workOrderId,
    }));

    return this.partRepository.createMany(partData);
  }

  /**
   * Delete part
   */
  async deletePart(partId: string): Promise<void> {
    const existing = await this.partRepository.findById(partId);
    if (!existing) {
      throw new NotFoundException("Part not found");
    }

    await this.partRepository.delete(partId);
  }
}

// Re-export types for convenience
export type { WorkOrder, WorkOrderTask, WorkOrderPart };
