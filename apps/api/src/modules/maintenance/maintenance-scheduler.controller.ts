/**
 * Maintenance Scheduler Controller
 *
 * API endpoints for maintenance scheduling operations
 */

import { Controller, Get, Post, Body, Param, Query, HttpException, HttpStatus, Inject, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiProperty,
  ApiPropertyOptional,
  ApiBearerAuth,
} from "@nestjs/swagger";

import { MaintenanceSchedulerService, MaintenanceAlert, SchedulerRunResult } from "./maintenance-scheduler.service";
import { Roles } from "../../common/decorators/roles.decorator";
import { RolesGuard } from "../../common/guards/roles.guard";
import { TriggerCalculationService, TriggerCalculationResult } from "./trigger-calculation.service";
import { MaintenanceProgramRepository } from "./repositories/maintenance-program.repository";
import { MaintenanceTriggerRepository } from "./repositories/maintenance-trigger.repository";
import { MaintenanceScheduleRepository } from "./repositories/maintenance-schedule.repository";

import type { MaintenanceProgram, MaintenanceTrigger, MaintenanceSchedule, NewMaintenanceProgram, NewMaintenanceTrigger } from "@repo/db";

// Swagger DTO classes
class CreateWorkOrdersSwaggerDto {
  @ApiPropertyOptional({ description: "是否自动指派", default: false })
  autoAssign?: boolean;
}

class CompleteScheduleSwaggerDto {
  @ApiPropertyOptional({ description: "完成时的计数值" })
  completedAtValue?: number;
}

class CalculatePreviewSwaggerDto {
  @ApiProperty({ description: "触发器 ID" })
  triggerId!: string;

  @ApiProperty({
    description: "飞行器数据",
    example: { totalFlightHours: 100, totalFlightCycles: 200 },
  })
  aircraft!: { totalFlightHours: number; totalFlightCycles: number };

  @ApiPropertyOptional({ description: "上次完成时间（时间戳）" })
  lastCompletedAt?: number;

  @ApiPropertyOptional({ description: "上次完成时的计数值" })
  lastCompletedAtValue?: number;
}

class CreateProgramSwaggerDto {
  @ApiProperty({ description: "程序名称", example: "M300 RTK 标准维保程序" })
  name!: string;

  @ApiProperty({ description: "程序代码", example: "M300-STD-2024" })
  code!: string;

  @ApiPropertyOptional({ description: "适用机型" })
  aircraftModel?: string;

  @ApiPropertyOptional({ description: "描述" })
  description?: string;

  @ApiPropertyOptional({ description: "是否为默认程序", default: false })
  isDefault?: boolean;
}

class CreateTriggerSwaggerDto {
  @ApiProperty({ description: "维保程序 ID" })
  programId!: string;

  @ApiProperty({
    description: "触发器类型",
    enum: ["CALENDAR", "FLIGHT_HOURS", "FLIGHT_CYCLES", "BATTERY_CYCLES", "LIFE_LIMIT"],
    example: "FLIGHT_HOURS",
  })
  type!: string;

  @ApiProperty({ description: "触发器名称", example: "50小时定检" })
  name!: string;

  @ApiPropertyOptional({ description: "描述" })
  description?: string;

  @ApiProperty({ description: "间隔值", example: 50 })
  intervalValue!: number;

  @ApiPropertyOptional({ description: "预警阈值", example: 45 })
  warningThreshold?: number;
}

class SchedulerRunResultDto {
  @ApiProperty({ description: "检查的计划数" })
  checked!: number;

  @ApiProperty({ description: "更新的计划数" })
  updated!: number;

  @ApiProperty({ description: "发现的告警数" })
  alerts!: number;
}

class MaintenanceAlertDto {
  @ApiProperty({ description: "计划 ID" })
  scheduleId!: string;

  @ApiProperty({ description: "飞行器 ID" })
  aircraftId!: string;

  @ApiProperty({ description: "告警类型", enum: ["WARNING", "DUE", "OVERDUE"] })
  type!: string;

  @ApiProperty({ description: "触发器名称" })
  triggerName!: string;

  @ApiProperty({ description: "消息" })
  message!: string;
}

@ApiTags("维保调度 (Maintenance Scheduler)")
@ApiBearerAuth()
@Controller("maintenance-scheduler")
@UseGuards(AuthGuard("jwt"), RolesGuard)
export class MaintenanceSchedulerController {
  constructor(
    @Inject(MaintenanceSchedulerService)
    private readonly schedulerService: MaintenanceSchedulerService,
    @Inject(TriggerCalculationService)
    private readonly calcService: TriggerCalculationService,
    @Inject(MaintenanceProgramRepository)
    private readonly programRepo: MaintenanceProgramRepository,
    @Inject(MaintenanceTriggerRepository)
    private readonly triggerRepo: MaintenanceTriggerRepository,
    @Inject(MaintenanceScheduleRepository)
    private readonly scheduleRepo: MaintenanceScheduleRepository
  ) {}

  // ==================== Scheduler Operations ====================

  /**
   * Run the scheduler to check and update all maintenance schedules
   */
  @Post("run")
  @Roles("ADMIN", "MANAGER")
  @ApiOperation({ summary: "运行调度器", description: "检查并更新所有维保计划状态（需要 ADMIN 或 MANAGER 角色）" })
  @ApiResponse({ status: 200, description: "运行成功", type: SchedulerRunResultDto })
  async runScheduler(): Promise<SchedulerRunResult> {
    return this.schedulerService.runScheduler();
  }

  /**
   * Create work orders for all due schedules
   */
  @Post("create-work-orders")
  @Roles("ADMIN", "MANAGER")
  @ApiOperation({ summary: "创建到期工单", description: "为所有到期的维保计划创建工单（需要 ADMIN 或 MANAGER 角色）" })
  @ApiBody({ type: CreateWorkOrdersSwaggerDto, required: false })
  @ApiResponse({
    status: 200,
    description: "创建成功",
    schema: {
      type: "object",
      properties: {
        created: { type: "number", description: "创建的工单数" },
        workOrders: { type: "array", description: "创建的工单列表" },
      },
    },
  })
  async createWorkOrders(
    @Body() body: { autoAssign?: boolean }
  ): Promise<{ created: number; workOrders: any[] }> {
    const workOrders = await this.schedulerService.createWorkOrdersForDueSchedules(body.autoAssign);
    return {
      created: workOrders.length,
      workOrders,
    };
  }

  /**
   * Get maintenance alerts for dashboard
   */
  @Get("alerts")
  @ApiOperation({ summary: "获取维保告警", description: "获取仪表板显示的维保告警列表" })
  @ApiQuery({ name: "aircraftId", required: false, description: "按飞行器筛选" })
  @ApiQuery({ name: "types", required: false, description: "告警类型（逗号分隔）", example: "WARNING,DUE,OVERDUE" })
  @ApiQuery({ name: "limit", required: false, description: "数量限制" })
  @ApiResponse({ status: 200, description: "获取成功", type: [MaintenanceAlertDto] })
  async getAlerts(
    @Query("aircraftId") aircraftId?: string,
    @Query("types") types?: string,
    @Query("limit") limit?: string
  ): Promise<MaintenanceAlert[]> {
    const typeArray = types
      ? (types.split(",") as ("WARNING" | "DUE" | "OVERDUE")[])
      : undefined;

    return this.schedulerService.getAlerts({
      aircraftId,
      types: typeArray,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  /**
   * Initialize schedules for an aircraft
   */
  @Post("aircraft/:aircraftId/initialize")
  @Roles("ADMIN", "MANAGER")
  @ApiOperation({ summary: "初始化飞行器维保计划", description: "根据维保程序为飞行器创建初始维保计划（需要 ADMIN 或 MANAGER 角色）" })
  @ApiParam({ name: "aircraftId", description: "飞行器 ID" })
  @ApiResponse({
    status: 200,
    description: "初始化成功",
    schema: {
      type: "object",
      properties: {
        created: { type: "number", description: "创建的计划数" },
        schedules: { type: "array", description: "创建的计划列表" },
      },
    },
  })
  async initializeAircraftSchedules(
    @Param("aircraftId") aircraftId: string
  ): Promise<{ created: number; schedules: MaintenanceSchedule[] }> {
    const schedules = await this.schedulerService.initializeAircraftSchedules(aircraftId);
    return {
      created: schedules.length,
      schedules,
    };
  }

  /**
   * Complete a maintenance schedule
   */
  @Post("schedules/:scheduleId/complete")
  @Roles("ADMIN", "MANAGER", "MECHANIC", "INSPECTOR")
  @ApiOperation({ summary: "完成维保计划", description: "标记维保计划为已完成，并自动创建下一周期计划（需要 ADMIN、MANAGER、MECHANIC 或 INSPECTOR 角色）" })
  @ApiParam({ name: "scheduleId", description: "计划 ID" })
  @ApiBody({ type: CompleteScheduleSwaggerDto, required: false })
  @ApiResponse({ status: 200, description: "完成成功" })
  async completeSchedule(
    @Param("scheduleId") scheduleId: string,
    @Body() body: { completedAtValue?: number }
  ): Promise<MaintenanceSchedule> {
    return this.schedulerService.completeSchedule(scheduleId, body.completedAtValue);
  }

  // ==================== Maintenance Programs ====================

  /**
   * List maintenance programs
   */
  @Get("programs")
  @ApiOperation({ summary: "获取维保程序列表", description: "获取所有维保程序" })
  @ApiQuery({ name: "limit", required: false, description: "每页数量" })
  @ApiQuery({ name: "offset", required: false, description: "偏移量" })
  @ApiQuery({ name: "aircraftModel", required: false, description: "按机型筛选" })
  @ApiQuery({ name: "isActive", required: false, description: "按激活状态筛选", enum: ["true", "false"] })
  @ApiResponse({ status: 200, description: "获取成功" })
  async listPrograms(
    @Query("limit") limit?: string,
    @Query("offset") offset?: string,
    @Query("aircraftModel") aircraftModel?: string,
    @Query("isActive") isActive?: string
  ): Promise<MaintenanceProgram[]> {
    return this.programRepo.list({
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
      aircraftModel,
      isActive: isActive ? isActive === "true" : undefined,
    });
  }

  /**
   * Get a maintenance program by ID
   */
  @Get("programs/:id")
  @ApiOperation({ summary: "获取维保程序详情", description: "根据 ID 获取维保程序详细信息" })
  @ApiParam({ name: "id", description: "程序 ID" })
  @ApiResponse({ status: 200, description: "获取成功" })
  @ApiResponse({ status: 404, description: "程序不存在" })
  async getProgram(@Param("id") id: string): Promise<MaintenanceProgram> {
    const program = await this.programRepo.findById(id);
    if (!program) {
      throw new HttpException("Maintenance program not found", HttpStatus.NOT_FOUND);
    }
    return program;
  }

  /**
   * Create a maintenance program
   */
  @Post("programs")
  @Roles("ADMIN", "MANAGER")
  @ApiOperation({ summary: "创建维保程序", description: "创建新的维保程序（维保大纲）（需要 ADMIN 或 MANAGER 角色）" })
  @ApiBody({ type: CreateProgramSwaggerDto })
  @ApiResponse({ status: 201, description: "创建成功" })
  async createProgram(@Body() data: NewMaintenanceProgram): Promise<MaintenanceProgram> {
    return this.programRepo.create(data);
  }

  /**
   * Get default program for aircraft model
   */
  @Get("programs/default/:aircraftModel")
  @ApiOperation({ summary: "获取机型默认程序", description: "获取指定机型的默认维保程序" })
  @ApiParam({ name: "aircraftModel", description: "机型名称" })
  @ApiResponse({ status: 200, description: "获取成功" })
  async getDefaultProgram(
    @Param("aircraftModel") aircraftModel: string
  ): Promise<MaintenanceProgram | null> {
    return this.programRepo.findDefaultForModel(aircraftModel);
  }

  // ==================== Maintenance Triggers ====================

  /**
   * List maintenance triggers
   */
  @Get("triggers")
  @ApiOperation({ summary: "获取触发器列表", description: "获取所有维保触发器" })
  @ApiQuery({ name: "limit", required: false, description: "每页数量" })
  @ApiQuery({ name: "offset", required: false, description: "偏移量" })
  @ApiQuery({ name: "programId", required: false, description: "按程序筛选" })
  @ApiQuery({ name: "type", required: false, description: "按类型筛选", enum: ["CALENDAR", "FLIGHT_HOURS", "FLIGHT_CYCLES", "BATTERY_CYCLES", "LIFE_LIMIT"] })
  @ApiQuery({ name: "isActive", required: false, description: "按激活状态筛选", enum: ["true", "false"] })
  @ApiResponse({ status: 200, description: "获取成功" })
  async listTriggers(
    @Query("limit") limit?: string,
    @Query("offset") offset?: string,
    @Query("programId") programId?: string,
    @Query("type") type?: string,
    @Query("isActive") isActive?: string
  ): Promise<MaintenanceTrigger[]> {
    return this.triggerRepo.list({
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
      programId,
      type,
      isActive: isActive ? isActive === "true" : undefined,
    });
  }

  /**
   * Get a maintenance trigger by ID
   */
  @Get("triggers/:id")
  @ApiOperation({ summary: "获取触发器详情", description: "根据 ID 获取触发器详细信息" })
  @ApiParam({ name: "id", description: "触发器 ID" })
  @ApiResponse({ status: 200, description: "获取成功" })
  @ApiResponse({ status: 404, description: "触发器不存在" })
  async getTrigger(@Param("id") id: string): Promise<MaintenanceTrigger> {
    const trigger = await this.triggerRepo.findById(id);
    if (!trigger) {
      throw new HttpException("Maintenance trigger not found", HttpStatus.NOT_FOUND);
    }
    return trigger;
  }

  /**
   * Create a maintenance trigger
   */
  @Post("triggers")
  @Roles("ADMIN", "MANAGER")
  @ApiOperation({ summary: "创建触发器", description: "创建新的维保触发器（如：每50小时检查）（需要 ADMIN 或 MANAGER 角色）" })
  @ApiBody({ type: CreateTriggerSwaggerDto })
  @ApiResponse({ status: 201, description: "创建成功" })
  async createTrigger(@Body() data: NewMaintenanceTrigger): Promise<MaintenanceTrigger> {
    return this.triggerRepo.create(data);
  }

  /**
   * Get triggers for a program
   */
  @Get("programs/:programId/triggers")
  @ApiOperation({ summary: "获取程序触发器", description: "获取指定维保程序下的所有触发器" })
  @ApiParam({ name: "programId", description: "程序 ID" })
  @ApiResponse({ status: 200, description: "获取成功" })
  async getProgramTriggers(@Param("programId") programId: string): Promise<MaintenanceTrigger[]> {
    return this.triggerRepo.findByProgramId(programId);
  }

  // ==================== Maintenance Schedules ====================

  /**
   * List maintenance schedules
   */
  @Get("schedules")
  @ApiOperation({ summary: "获取维保计划列表", description: "获取所有维保计划" })
  @ApiQuery({ name: "limit", required: false, description: "每页数量" })
  @ApiQuery({ name: "offset", required: false, description: "偏移量" })
  @ApiQuery({ name: "aircraftId", required: false, description: "按飞行器筛选" })
  @ApiQuery({ name: "status", required: false, description: "按状态筛选", enum: ["ACTIVE", "WARNING", "DUE", "OVERDUE", "COMPLETED"] })
  @ApiQuery({ name: "isActive", required: false, description: "按激活状态筛选", enum: ["true", "false"] })
  @ApiResponse({ status: 200, description: "获取成功" })
  async listSchedules(
    @Query("limit") limit?: string,
    @Query("offset") offset?: string,
    @Query("aircraftId") aircraftId?: string,
    @Query("status") status?: string,
    @Query("isActive") isActive?: string
  ): Promise<MaintenanceSchedule[]> {
    return this.scheduleRepo.list({
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
      aircraftId,
      status,
      isActive: isActive ? isActive === "true" : undefined,
    });
  }

  /**
   * Get a maintenance schedule by ID
   */
  @Get("schedules/:id")
  @ApiOperation({ summary: "获取维保计划详情", description: "根据 ID 获取维保计划详细信息" })
  @ApiParam({ name: "id", description: "计划 ID" })
  @ApiResponse({ status: 200, description: "获取成功" })
  @ApiResponse({ status: 404, description: "计划不存在" })
  async getSchedule(@Param("id") id: string): Promise<MaintenanceSchedule> {
    const schedule = await this.scheduleRepo.findById(id);
    if (!schedule) {
      throw new HttpException("Maintenance schedule not found", HttpStatus.NOT_FOUND);
    }
    return schedule;
  }

  /**
   * Get schedules for an aircraft
   */
  @Get("aircraft/:aircraftId/schedules")
  @ApiOperation({ summary: "获取飞行器维保计划", description: "获取指定飞行器的所有维保计划" })
  @ApiParam({ name: "aircraftId", description: "飞行器 ID" })
  @ApiResponse({ status: 200, description: "获取成功" })
  async getAircraftSchedules(@Param("aircraftId") aircraftId: string): Promise<MaintenanceSchedule[]> {
    return this.scheduleRepo.findByAircraftId(aircraftId);
  }

  /**
   * Get due or overdue schedules
   */
  @Get("schedules/status/due-overdue")
  @ApiOperation({ summary: "获取到期/逾期计划", description: "获取所有到期或逾期的维保计划" })
  @ApiResponse({ status: 200, description: "获取成功" })
  async getDueOrOverdueSchedules(): Promise<MaintenanceSchedule[]> {
    return this.scheduleRepo.findDueOrOverdue();
  }

  /**
   * Get schedules due within N days
   */
  @Get("schedules/due-within/:days")
  @ApiOperation({ summary: "获取即将到期计划", description: "获取指定天数内即将到期的维保计划" })
  @ApiParam({ name: "days", description: "天数" })
  @ApiResponse({ status: 200, description: "获取成功" })
  async getSchedulesDueWithinDays(@Param("days") days: string): Promise<MaintenanceSchedule[]> {
    return this.scheduleRepo.findDueWithinDays(parseInt(days, 10));
  }

  /**
   * Get schedule status counts
   */
  @Get("schedules/counts")
  @ApiOperation({ summary: "获取计划状态统计", description: "获取各状态的维保计划数量" })
  @ApiResponse({
    status: 200,
    description: "获取成功",
    schema: {
      type: "object",
      additionalProperties: { type: "number" },
      example: { ACTIVE: 50, WARNING: 10, DUE: 5, OVERDUE: 2, COMPLETED: 100 },
    },
  })
  async getScheduleCounts(): Promise<Record<string, number>> {
    return this.scheduleRepo.countByStatus();
  }

  // ==================== Calculation Preview ====================

  /**
   * Preview trigger calculation for an aircraft
   * Useful for seeing when maintenance will be due without modifying data
   */
  @Post("calculate-preview")
  @ApiOperation({ summary: "预览触发器计算", description: "预览触发器计算结果（不修改数据），用于查看维保何时到期" })
  @ApiBody({ type: CalculatePreviewSwaggerDto })
  @ApiResponse({ status: 200, description: "计算成功" })
  @ApiResponse({ status: 404, description: "触发器不存在" })
  async calculatePreview(
    @Body() body: {
      triggerId: string;
      aircraft: {
        totalFlightHours: number;
        totalFlightCycles: number;
      };
      lastCompletedAt?: number;
      lastCompletedAtValue?: number;
    }
  ): Promise<TriggerCalculationResult> {
    const trigger = await this.triggerRepo.findById(body.triggerId);
    if (!trigger) {
      throw new HttpException("Trigger not found", HttpStatus.NOT_FOUND);
    }

    return this.calcService.calculateTrigger(trigger, {
      aircraft: body.aircraft as any,
      lastCompletedAt: body.lastCompletedAt,
      lastCompletedAtValue: body.lastCompletedAtValue,
    });
  }
}
