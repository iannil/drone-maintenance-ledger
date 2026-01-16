import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  UseGuards,
  Put,
  Delete,
  Query,
  ParseIntPipe,
  Request,
  Inject,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import {
  WorkOrderService,
  CreateWorkOrderDto,
  UpdateWorkOrderDto,
  AddTaskDto,
  UpdateTaskDto,
  AddPartDto,
} from "./work-order.service";
import { Roles } from "../../common/decorators/roles.decorator";
import { RolesGuard } from "../../common/guards/roles.guard";

/**
 * Work Order controller
 *
 * Handles work order operations
 * Work orders are the primary mechanism for managing maintenance work
 */
@Controller("work-orders")
@UseGuards(AuthGuard("jwt"), RolesGuard)
export class WorkOrderController {
  private workOrderService: WorkOrderService;

  constructor(@Inject(WorkOrderService) workOrderService: WorkOrderService) {
    this.workOrderService = workOrderService;
  }

  /**
   * Get work order by ID
   */
  @Get(":id")
  async getById(@Param("id") id: string) {
    return this.workOrderService.findById(id);
  }

  /**
   * List work orders
   * Can filter by aircraft, assignee, status, etc.
   */
  @Get()
  async list(
    @Query("limit", new ParseIntPipe({ optional: true })) limit = 50,
    @Query("offset", new ParseIntPipe({ optional: true })) offset = 0,
    @Query("aircraftId") aircraftId?: string,
    @Query("assigneeId") assigneeId?: string,
    @Query("status") status?: string,
    @Query("open") open?: string,
    @Query("recent") recent?: string,
  ) {
    if (recent === "true") {
      return this.workOrderService.getRecent(limit);
    }

    if (open === "true") {
      return this.workOrderService.findOpen(limit, offset);
    }

    if (aircraftId) {
      return this.workOrderService.findByAircraft(aircraftId, limit, offset);
    }

    if (assigneeId) {
      return this.workOrderService.findByAssignee(assigneeId, limit, offset);
    }

    if (status) {
      return this.workOrderService.findByStatus(status as any, limit, offset);
    }

    // Default to open work orders
    return this.workOrderService.findOpen(limit, offset);
  }

  /**
   * Create new work order
   */
  @Post()
  @Roles("ADMIN", "MANAGER", "MECHANIC", "INSPECTOR")
  async create(@Body() dto: CreateWorkOrderDto) {
    return this.workOrderService.create(dto);
  }

  /**
   * Update work order
   */
  @Put(":id")
  @Roles("ADMIN", "MANAGER", "MECHANIC", "INSPECTOR")
  async update(@Param("id") id: string, @Body() dto: UpdateWorkOrderDto) {
    return this.workOrderService.update(id, dto);
  }

  /**
   * Update work order status
   */
  @Put(":id/status")
  @Roles("ADMIN", "MANAGER", "MECHANIC", "INSPECTOR")
  async updateStatus(@Param("id") id: string, @Body() body: { status: string }) {
    return this.workOrderService.updateStatus(id, body.status as any);
  }

  /**
   * Assign work order to a user
   */
  @Put(":id/assign")
  @Roles("ADMIN", "MANAGER")
  async assign(@Param("id") id: string, @Body() body: { userId: string }) {
    return this.workOrderService.assign(id, body.userId);
  }

  /**
   * Start work on a work order
   */
  @Post(":id/start")
  @Roles("ADMIN", "MANAGER", "MECHANIC")
  async start(@Param("id") id: string) {
    return this.workOrderService.start(id);
  }

  /**
   * Complete a work order
   */
  @Post(":id/complete")
  @Roles("ADMIN", "MANAGER", "MECHANIC")
  async complete(
    @Param("id") id: string,
    @Request() req,
    @Body() body?: { notes?: string },
  ) {
    return this.workOrderService.complete(id, req.user.id, body?.notes);
  }

  /**
   * Release work order (aircraft returned to service)
   * Only inspector can release
   */
  @Post(":id/release")
  @Roles("INSPECTOR", "ADMIN")
  async release(@Param("id") id: string, @Request() req) {
    return this.workOrderService.release(id, req.user.id);
  }

  /**
   * Cancel work order
   */
  @Post(":id/cancel")
  @Roles("ADMIN", "MANAGER")
  async cancel(@Param("id") id: string) {
    return this.workOrderService.cancel(id);
  }

  /**
   * Delete work order
   */
  @Delete(":id")
  @Roles("ADMIN")
  async delete(@Param("id") id: string) {
    await this.workOrderService.delete(id);
    return { success: true, message: "Work order deleted" };
  }

  // ========== Task Management ==========

  /**
   * Get tasks for a work order
   */
  @Get(":id/tasks")
  async getTasks(@Param("id") id: string) {
    return this.workOrderService.getTasks(id);
  }

  /**
   * Add task to work order
   */
  @Post(":id/tasks")
  @Roles("ADMIN", "MANAGER", "MECHANIC", "INSPECTOR")
  async addTask(@Param("id") id: string, @Body() dto: AddTaskDto) {
    return this.workOrderService.addTask(id, dto);
  }

  /**
   * Add multiple tasks to work order
   */
  @Post(":id/tasks/batch")
  @Roles("ADMIN", "MANAGER", "INSPECTOR")
  async addTasks(@Param("id") id: string, @Body() body: { tasks: AddTaskDto[] }) {
    return this.workOrderService.addTasks(id, body.tasks);
  }

  /**
   * Update task
   */
  @Put("tasks/:taskId")
  @Roles("ADMIN", "MANAGER", "MECHANIC", "INSPECTOR")
  async updateTask(@Param("taskId") taskId: string, @Body() dto: UpdateTaskDto) {
    return this.workOrderService.updateTask(taskId, dto);
  }

  /**
   * Update task status
   */
  @Put("tasks/:taskId/status")
  @Roles("ADMIN", "MANAGER", "MECHANIC", "INSPECTOR")
  async updateTaskStatus(@Param("taskId") taskId: string, @Body() body: { status: string }) {
    return this.workOrderService.updateTaskStatus(taskId, body.status as any);
  }

  /**
   * Sign off RII task
   * Only inspector can sign off RII tasks
   */
  @Post("tasks/:taskId/sign-off")
  @Roles("INSPECTOR", "ADMIN")
  async signOffRiiTask(@Param("taskId") taskId: string, @Request() req) {
    return this.workOrderService.signOffRiiTask(taskId, req.user.id);
  }

  /**
   * Delete task
   */
  @Delete("tasks/:taskId")
  @Roles("ADMIN", "MANAGER", "INSPECTOR")
  async deleteTask(@Param("taskId") taskId: string) {
    await this.workOrderService.deleteTask(taskId);
    return { success: true, message: "Task deleted" };
  }

  // ========== Part Management ==========

  /**
   * Get parts for a work order
   */
  @Get(":id/parts")
  async getParts(@Param("id") id: string) {
    return this.workOrderService.getParts(id);
  }

  /**
   * Add part to work order
   */
  @Post(":id/parts")
  @Roles("ADMIN", "MANAGER", "MECHANIC")
  async addPart(@Param("id") id: string, @Body() dto: AddPartDto) {
    return this.workOrderService.addPart(id, dto);
  }

  /**
   * Add multiple parts to work order
   */
  @Post(":id/parts/batch")
  @Roles("ADMIN", "MANAGER", "MECHANIC")
  async addParts(@Param("id") id: string, @Body() body: { parts: AddPartDto[] }) {
    return this.workOrderService.addParts(id, body.parts);
  }

  /**
   * Delete part
   */
  @Delete("parts/:partId")
  @Roles("ADMIN", "MANAGER", "MECHANIC")
  async deletePart(@Param("partId") partId: string) {
    await this.workOrderService.deletePart(partId);
    return { success: true, message: "Part deleted" };
  }
}
