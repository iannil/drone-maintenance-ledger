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
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiProperty,
  ApiPropertyOptional,
} from "@nestjs/swagger";
import type { Request as ExpressRequest } from "express";

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

// Swagger DTO classes
class CreateWorkOrderSwaggerDto {
  @ApiProperty({ description: "飞行器 ID" })
  aircraftId!: string;

  @ApiProperty({
    description: "工单类型",
    enum: ["SCHEDULED", "UNSCHEDULED", "AOG", "INSPECTION", "MODIFICATION"],
    example: "SCHEDULED",
  })
  type!: string;

  @ApiProperty({ description: "工单标题", example: "50小时定检" })
  title!: string;

  @ApiPropertyOptional({ description: "工单描述" })
  description?: string;

  @ApiPropertyOptional({ description: "维修原因" })
  reason?: string;

  @ApiPropertyOptional({
    description: "优先级",
    enum: ["LOW", "MEDIUM", "HIGH", "AOG"],
    default: "MEDIUM",
  })
  priority?: string;

  @ApiPropertyOptional({ description: "计划开始时间（时间戳）" })
  scheduledStart?: number;

  @ApiPropertyOptional({ description: "计划结束时间（时间戳）" })
  scheduledEnd?: number;

  @ApiPropertyOptional({ description: "指派人员 ID" })
  assignedTo?: string;

  @ApiPropertyOptional({ description: "关联维保计划 ID" })
  scheduleId?: string;
}

class UpdateWorkOrderSwaggerDto {
  @ApiPropertyOptional({ description: "工单标题" })
  title?: string;

  @ApiPropertyOptional({ description: "工单描述" })
  description?: string;

  @ApiPropertyOptional({ description: "维修原因" })
  reason?: string;

  @ApiPropertyOptional({
    description: "优先级",
    enum: ["LOW", "MEDIUM", "HIGH", "AOG"],
  })
  priority?: string;

  @ApiPropertyOptional({ description: "计划开始时间" })
  scheduledStart?: number;

  @ApiPropertyOptional({ description: "计划结束时间" })
  scheduledEnd?: number;

  @ApiPropertyOptional({ description: "完工备注" })
  completionNotes?: string;

  @ApiPropertyOptional({ description: "异常记录" })
  discrepancies?: string;
}

class UpdateStatusSwaggerDto {
  @ApiProperty({
    description: "工单状态",
    enum: ["DRAFT", "OPEN", "IN_PROGRESS", "COMPLETED", "RELEASED", "CANCELLED"],
  })
  status!: string;
}

class AssignSwaggerDto {
  @ApiProperty({ description: "指派人员 ID" })
  userId!: string;
}

class CompleteSwaggerDto {
  @ApiPropertyOptional({ description: "完工备注" })
  notes?: string;
}

class AddTaskSwaggerDto {
  @ApiProperty({ description: "任务序号", example: 1 })
  sequence!: number;

  @ApiProperty({ description: "任务标题", example: "检查电机运转" })
  title!: string;

  @ApiPropertyOptional({ description: "任务描述" })
  description?: string;

  @ApiPropertyOptional({ description: "操作说明" })
  instructions?: string;

  @ApiPropertyOptional({ description: "是否为必检项 (RII)", default: false })
  isRii?: boolean;

  @ApiPropertyOptional({ description: "所需工具", type: [String] })
  requiredTools?: string[];

  @ApiPropertyOptional({
    description: "所需零件",
    type: "array",
    items: { type: "object", properties: { partNumber: { type: "string" }, quantity: { type: "number" } } },
  })
  requiredParts?: Array<{ partNumber: string; quantity: number }>;
}

class UpdateTaskSwaggerDto {
  @ApiPropertyOptional({ description: "任务标题" })
  title?: string;

  @ApiPropertyOptional({ description: "任务描述" })
  description?: string;

  @ApiPropertyOptional({ description: "操作说明" })
  instructions?: string;

  @ApiPropertyOptional({
    description: "任务状态",
    enum: ["PENDING", "IN_PROGRESS", "COMPLETED", "SKIPPED"],
  })
  status?: string;

  @ApiPropertyOptional({ description: "执行结果" })
  result?: string;

  @ApiPropertyOptional({ description: "备注" })
  notes?: string;
}

class UpdateTaskStatusSwaggerDto {
  @ApiProperty({
    description: "任务状态",
    enum: ["PENDING", "IN_PROGRESS", "COMPLETED", "SKIPPED"],
  })
  status!: string;
}

class AddPartSwaggerDto {
  @ApiPropertyOptional({ description: "部件 ID" })
  componentId?: string;

  @ApiProperty({ description: "部件号", example: "PN-MOT-001" })
  partNumber!: string;

  @ApiProperty({ description: "部件名称", example: "电机" })
  partName!: string;

  @ApiProperty({ description: "数量", example: 1 })
  quantity!: number;

  @ApiProperty({ description: "单位", example: "个" })
  unit!: string;

  @ApiPropertyOptional({ description: "安装位置" })
  installedLocation?: string;

  @ApiPropertyOptional({ description: "拆卸部件 ID" })
  removedComponentId?: string;

  @ApiPropertyOptional({ description: "拆卸部件序列号" })
  removedSerialNumber?: string;
}

class BatchTasksSwaggerDto {
  @ApiProperty({ description: "任务列表", type: [AddTaskSwaggerDto] })
  tasks!: AddTaskSwaggerDto[];
}

class BatchPartsSwaggerDto {
  @ApiProperty({ description: "零件列表", type: [AddPartSwaggerDto] })
  parts!: AddPartSwaggerDto[];
}

class WorkOrderResponseDto {
  @ApiProperty({ description: "工单 ID" })
  id!: string;

  @ApiProperty({ description: "工单编号" })
  orderNumber!: string;

  @ApiProperty({ description: "飞行器 ID" })
  aircraftId!: string;

  @ApiProperty({ description: "工单类型" })
  type!: string;

  @ApiProperty({ description: "工单标题" })
  title!: string;

  @ApiProperty({ description: "状态" })
  status!: string;

  @ApiProperty({ description: "优先级" })
  priority!: string;
}

/**
 * Work Order controller
 *
 * Handles work order operations
 * Work orders are the primary mechanism for managing maintenance work
 */
@ApiTags("工单 (Work Order)")
@ApiBearerAuth()
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
  @ApiOperation({ summary: "获取工单详情", description: "根据 ID 获取工单详细信息" })
  @ApiParam({ name: "id", description: "工单 ID" })
  @ApiResponse({ status: 200, description: "获取成功", type: WorkOrderResponseDto })
  @ApiResponse({ status: 404, description: "工单不存在" })
  async getById(@Param("id") id: string) {
    return this.workOrderService.findById(id);
  }

  /**
   * List work orders
   * Can filter by aircraft, assignee, status, etc.
   */
  @Get()
  @ApiOperation({ summary: "获取工单列表", description: "获取工单列表，支持多种筛选条件" })
  @ApiQuery({ name: "limit", required: false, description: "每页数量", example: 50 })
  @ApiQuery({ name: "offset", required: false, description: "偏移量", example: 0 })
  @ApiQuery({ name: "aircraftId", required: false, description: "按飞行器筛选" })
  @ApiQuery({ name: "assigneeId", required: false, description: "按指派人员筛选" })
  @ApiQuery({ name: "status", required: false, description: "按状态筛选", enum: ["DRAFT", "OPEN", "IN_PROGRESS", "COMPLETED", "RELEASED", "CANCELLED"] })
  @ApiQuery({ name: "open", required: false, description: "仅获取未完成工单", enum: ["true", "false"] })
  @ApiQuery({ name: "recent", required: false, description: "获取最近工单", enum: ["true", "false"] })
  @ApiResponse({ status: 200, description: "获取成功", type: [WorkOrderResponseDto] })
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
  @ApiOperation({ summary: "创建工单", description: "创建新维修工单" })
  @ApiBody({ type: CreateWorkOrderSwaggerDto })
  @ApiResponse({ status: 201, description: "创建成功", type: WorkOrderResponseDto })
  @ApiResponse({ status: 400, description: "请求参数错误" })
  async create(@Body() dto: CreateWorkOrderDto) {
    return this.workOrderService.create(dto);
  }

  /**
   * Update work order
   */
  @Put(":id")
  @Roles("ADMIN", "MANAGER", "MECHANIC", "INSPECTOR")
  @ApiOperation({ summary: "更新工单", description: "更新工单信息（已放行的工单不可修改）" })
  @ApiParam({ name: "id", description: "工单 ID" })
  @ApiBody({ type: UpdateWorkOrderSwaggerDto })
  @ApiResponse({ status: 200, description: "更新成功", type: WorkOrderResponseDto })
  @ApiResponse({ status: 404, description: "工单不存在" })
  @ApiResponse({ status: 409, description: "已放行的工单不可修改" })
  async update(@Param("id") id: string, @Body() dto: UpdateWorkOrderDto) {
    return this.workOrderService.update(id, dto);
  }

  /**
   * Update work order status
   */
  @Put(":id/status")
  @Roles("ADMIN", "MANAGER", "MECHANIC", "INSPECTOR")
  @ApiOperation({ summary: "更新工单状态", description: "更新工单状态" })
  @ApiParam({ name: "id", description: "工单 ID" })
  @ApiBody({ type: UpdateStatusSwaggerDto })
  @ApiResponse({ status: 200, description: "更新成功", type: WorkOrderResponseDto })
  @ApiResponse({ status: 404, description: "工单不存在" })
  async updateStatus(@Param("id") id: string, @Body() body: { status: string }) {
    return this.workOrderService.updateStatus(id, body.status as any);
  }

  /**
   * Assign work order to a user
   */
  @Put(":id/assign")
  @Roles("ADMIN", "MANAGER")
  @ApiOperation({ summary: "指派工单", description: "将工单指派给指定人员（需要 ADMIN 或 MANAGER 角色）" })
  @ApiParam({ name: "id", description: "工单 ID" })
  @ApiBody({ type: AssignSwaggerDto })
  @ApiResponse({ status: 200, description: "指派成功", type: WorkOrderResponseDto })
  @ApiResponse({ status: 404, description: "工单不存在" })
  async assign(@Param("id") id: string, @Body() body: { userId: string }) {
    return this.workOrderService.assign(id, body.userId);
  }

  /**
   * Start work on a work order
   */
  @Post(":id/start")
  @Roles("ADMIN", "MANAGER", "MECHANIC")
  @ApiOperation({ summary: "开始工单", description: "开始执行工单" })
  @ApiParam({ name: "id", description: "工单 ID" })
  @ApiResponse({ status: 200, description: "开始成功", type: WorkOrderResponseDto })
  @ApiResponse({ status: 404, description: "工单不存在" })
  async start(@Param("id") id: string) {
    return this.workOrderService.start(id);
  }

  /**
   * Complete a work order
   */
  @Post(":id/complete")
  @Roles("ADMIN", "MANAGER", "MECHANIC")
  @ApiOperation({ summary: "完成工单", description: "标记工单为已完成（所有 RII 任务必须先完成检验）" })
  @ApiParam({ name: "id", description: "工单 ID" })
  @ApiBody({ type: CompleteSwaggerDto, required: false })
  @ApiResponse({ status: 200, description: "完成成功", type: WorkOrderResponseDto })
  @ApiResponse({ status: 404, description: "工单不存在" })
  @ApiResponse({ status: 409, description: "RII 任务尚未完成检验" })
  async complete(
    @Param("id") id: string,
    @Request() req: ExpressRequest & { user?: { id: string } },
    @Body() body?: { notes?: string },
  ) {
    return this.workOrderService.complete(id, req.user!.id, body?.notes);
  }

  /**
   * Release work order (aircraft returned to service)
   * Only inspector can release
   */
  @Post(":id/release")
  @Roles("INSPECTOR", "ADMIN")
  @ApiOperation({ summary: "放行工单", description: "放行工单，飞行器恢复服务（需要 INSPECTOR 角色）" })
  @ApiParam({ name: "id", description: "工单 ID" })
  @ApiResponse({ status: 200, description: "放行成功", type: WorkOrderResponseDto })
  @ApiResponse({ status: 404, description: "工单不存在" })
  @ApiResponse({ status: 409, description: "工单尚未完成" })
  async release(@Param("id") id: string, @Request() req: ExpressRequest & { user?: { id: string } }) {
    return this.workOrderService.release(id, req.user!.id);
  }

  /**
   * Cancel work order
   */
  @Post(":id/cancel")
  @Roles("ADMIN", "MANAGER")
  @ApiOperation({ summary: "取消工单", description: "取消工单（需要 ADMIN 或 MANAGER 角色）" })
  @ApiParam({ name: "id", description: "工单 ID" })
  @ApiResponse({ status: 200, description: "取消成功", type: WorkOrderResponseDto })
  @ApiResponse({ status: 404, description: "工单不存在" })
  @ApiResponse({ status: 409, description: "已放行的工单不可取消" })
  async cancel(@Param("id") id: string) {
    return this.workOrderService.cancel(id);
  }

  /**
   * Delete work order
   */
  @Delete(":id")
  @Roles("ADMIN")
  @ApiOperation({ summary: "删除工单", description: "删除工单（需要 ADMIN 角色，活动中的工单不可删除）" })
  @ApiParam({ name: "id", description: "工单 ID" })
  @ApiResponse({ status: 200, description: "删除成功", schema: { example: { success: true, message: "Work order deleted" } } })
  @ApiResponse({ status: 404, description: "工单不存在" })
  @ApiResponse({ status: 409, description: "活动中的工单不可删除" })
  async delete(@Param("id") id: string) {
    await this.workOrderService.delete(id);
    return { success: true, message: "Work order deleted" };
  }

  // ========== Task Management ==========

  /**
   * Get tasks for a work order
   */
  @Get(":id/tasks")
  @ApiOperation({ summary: "获取工单任务列表", description: "获取工单下的所有任务" })
  @ApiParam({ name: "id", description: "工单 ID" })
  @ApiResponse({ status: 200, description: "获取成功" })
  async getTasks(@Param("id") id: string) {
    return this.workOrderService.getTasks(id);
  }

  /**
   * Add task to work order
   */
  @Post(":id/tasks")
  @Roles("ADMIN", "MANAGER", "MECHANIC", "INSPECTOR")
  @ApiOperation({ summary: "添加任务", description: "向工单添加单个任务" })
  @ApiParam({ name: "id", description: "工单 ID" })
  @ApiBody({ type: AddTaskSwaggerDto })
  @ApiResponse({ status: 201, description: "添加成功" })
  @ApiResponse({ status: 404, description: "工单不存在" })
  async addTask(@Param("id") id: string, @Body() dto: AddTaskDto) {
    return this.workOrderService.addTask(id, dto);
  }

  /**
   * Add multiple tasks to work order
   */
  @Post(":id/tasks/batch")
  @Roles("ADMIN", "MANAGER", "INSPECTOR")
  @ApiOperation({ summary: "批量添加任务", description: "向工单批量添加任务" })
  @ApiParam({ name: "id", description: "工单 ID" })
  @ApiBody({ type: BatchTasksSwaggerDto })
  @ApiResponse({ status: 201, description: "添加成功" })
  @ApiResponse({ status: 404, description: "工单不存在" })
  async addTasks(@Param("id") id: string, @Body() body: { tasks: AddTaskDto[] }) {
    return this.workOrderService.addTasks(id, body.tasks);
  }

  /**
   * Update task
   */
  @Put("tasks/:taskId")
  @Roles("ADMIN", "MANAGER", "MECHANIC", "INSPECTOR")
  @ApiOperation({ summary: "更新任务", description: "更新任务信息" })
  @ApiParam({ name: "taskId", description: "任务 ID" })
  @ApiBody({ type: UpdateTaskSwaggerDto })
  @ApiResponse({ status: 200, description: "更新成功" })
  @ApiResponse({ status: 404, description: "任务不存在" })
  async updateTask(@Param("taskId") taskId: string, @Body() dto: UpdateTaskDto) {
    return this.workOrderService.updateTask(taskId, dto);
  }

  /**
   * Update task status
   */
  @Put("tasks/:taskId/status")
  @Roles("ADMIN", "MANAGER", "MECHANIC", "INSPECTOR")
  @ApiOperation({ summary: "更新任务状态", description: "更新任务状态（RII 任务必须由检验员签字完成）" })
  @ApiParam({ name: "taskId", description: "任务 ID" })
  @ApiBody({ type: UpdateTaskStatusSwaggerDto })
  @ApiResponse({ status: 200, description: "更新成功" })
  @ApiResponse({ status: 404, description: "任务不存在" })
  @ApiResponse({ status: 409, description: "RII 任务需要检验员签字" })
  async updateTaskStatus(@Param("taskId") taskId: string, @Body() body: { status: string }) {
    return this.workOrderService.updateTaskStatus(taskId, body.status as any);
  }

  /**
   * Sign off RII task
   * Only inspector can sign off RII tasks
   */
  @Post("tasks/:taskId/sign-off")
  @Roles("INSPECTOR", "ADMIN")
  @ApiOperation({ summary: "RII 签字", description: "检验员对 RII 必检项进行签字确认（需要 INSPECTOR 角色）" })
  @ApiParam({ name: "taskId", description: "任务 ID" })
  @ApiResponse({ status: 200, description: "签字成功" })
  @ApiResponse({ status: 404, description: "任务不存在" })
  @ApiResponse({ status: 409, description: "非 RII 任务" })
  async signOffRiiTask(@Param("taskId") taskId: string, @Request() req: ExpressRequest & { user?: { id: string } }) {
    return this.workOrderService.signOffRiiTask(taskId, req.user!.id);
  }

  /**
   * Delete task
   */
  @Delete("tasks/:taskId")
  @Roles("ADMIN", "MANAGER", "INSPECTOR")
  @ApiOperation({ summary: "删除任务", description: "删除工单任务" })
  @ApiParam({ name: "taskId", description: "任务 ID" })
  @ApiResponse({ status: 200, description: "删除成功", schema: { example: { success: true, message: "Task deleted" } } })
  @ApiResponse({ status: 404, description: "任务不存在" })
  async deleteTask(@Param("taskId") taskId: string) {
    await this.workOrderService.deleteTask(taskId);
    return { success: true, message: "Task deleted" };
  }

  // ========== Part Management ==========

  /**
   * Get parts for a work order
   */
  @Get(":id/parts")
  @ApiOperation({ summary: "获取工单零件列表", description: "获取工单使用的零件清单" })
  @ApiParam({ name: "id", description: "工单 ID" })
  @ApiResponse({ status: 200, description: "获取成功" })
  async getParts(@Param("id") id: string) {
    return this.workOrderService.getParts(id);
  }

  /**
   * Add part to work order
   */
  @Post(":id/parts")
  @Roles("ADMIN", "MANAGER", "MECHANIC")
  @ApiOperation({ summary: "添加零件", description: "向工单添加使用的零件" })
  @ApiParam({ name: "id", description: "工单 ID" })
  @ApiBody({ type: AddPartSwaggerDto })
  @ApiResponse({ status: 201, description: "添加成功" })
  @ApiResponse({ status: 404, description: "工单不存在" })
  async addPart(@Param("id") id: string, @Body() dto: AddPartDto) {
    return this.workOrderService.addPart(id, dto);
  }

  /**
   * Add multiple parts to work order
   */
  @Post(":id/parts/batch")
  @Roles("ADMIN", "MANAGER", "MECHANIC")
  @ApiOperation({ summary: "批量添加零件", description: "向工单批量添加使用的零件" })
  @ApiParam({ name: "id", description: "工单 ID" })
  @ApiBody({ type: BatchPartsSwaggerDto })
  @ApiResponse({ status: 201, description: "添加成功" })
  @ApiResponse({ status: 404, description: "工单不存在" })
  async addParts(@Param("id") id: string, @Body() body: { parts: AddPartDto[] }) {
    return this.workOrderService.addParts(id, body.parts);
  }

  /**
   * Delete part
   */
  @Delete("parts/:partId")
  @Roles("ADMIN", "MANAGER", "MECHANIC")
  @ApiOperation({ summary: "删除零件", description: "从工单删除零件记录" })
  @ApiParam({ name: "partId", description: "零件记录 ID" })
  @ApiResponse({ status: 200, description: "删除成功", schema: { example: { success: true, message: "Part deleted" } } })
  @ApiResponse({ status: 404, description: "零件记录不存在" })
  async deletePart(@Param("partId") partId: string) {
    await this.workOrderService.deletePart(partId);
    return { success: true, message: "Part deleted" };
  }
}
