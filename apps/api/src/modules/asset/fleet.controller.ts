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

import { FleetService, CreateFleetDto, UpdateFleetDto } from "./fleet.service";
import { Roles } from "../../common/decorators/roles.decorator";
import { RolesGuard } from "../../common/guards/roles.guard";

// Swagger DTO classes
class CreateFleetSwaggerDto {
  @ApiProperty({ description: "机队名称", example: "华北巡检队" })
  name!: string;

  @ApiProperty({ description: "机队代码", example: "HB-PATROL-01" })
  code!: string;

  @ApiProperty({ description: "所属组织", example: "北京分公司" })
  organization!: string;

  @ApiPropertyOptional({ description: "描述", example: "负责华北地区电网巡检任务" })
  description?: string;
}

class UpdateFleetSwaggerDto {
  @ApiPropertyOptional({ description: "机队名称" })
  name?: string;

  @ApiPropertyOptional({ description: "机队代码" })
  code?: string;

  @ApiPropertyOptional({ description: "所属组织" })
  organization?: string;

  @ApiPropertyOptional({ description: "描述" })
  description?: string;
}

class FleetResponseDto {
  @ApiProperty({ description: "机队 ID" })
  id!: string;

  @ApiProperty({ description: "机队名称" })
  name!: string;

  @ApiProperty({ description: "机队代码" })
  code!: string;

  @ApiProperty({ description: "所属组织" })
  organization!: string;

  @ApiPropertyOptional({ description: "描述" })
  description?: string | null;

  @ApiProperty({ description: "创建时间" })
  createdAt!: number;

  @ApiProperty({ description: "更新时间" })
  updatedAt!: number;
}

/**
 * Fleet controller
 *
 * Handles fleet CRUD operations
 */
@ApiTags("机队 (Fleet)")
@ApiBearerAuth()
@Controller("fleets")
@UseGuards(AuthGuard("jwt"), RolesGuard)
export class FleetController {
  private fleetSvc: FleetService;

  constructor(@Inject(FleetService) fleetService: FleetService) {
    this.fleetSvc = fleetService;
  }

  /**
   * Get fleet by ID
   */
  @Get(":id")
  @ApiOperation({ summary: "获取机队详情", description: "根据 ID 获取机队详细信息" })
  @ApiParam({ name: "id", description: "机队 ID" })
  @ApiResponse({ status: 200, description: "获取成功", type: FleetResponseDto })
  @ApiResponse({ status: 404, description: "机队不存在" })
  async getById(@Param("id") id: string) {
    return this.fleetSvc.findById(id);
  }

  /**
   * List all fleets
   */
  @Get()
  @ApiOperation({ summary: "获取机队列表", description: "获取所有机队，支持分页" })
  @ApiQuery({ name: "limit", required: false, description: "每页数量", example: 50 })
  @ApiQuery({ name: "offset", required: false, description: "偏移量", example: 0 })
  @ApiResponse({ status: 200, description: "获取成功", type: [FleetResponseDto] })
  async list(
    @Query("limit") limitStr?: string,
    @Query("offset") offsetStr?: string,
  ) {
    const limit = limitStr ? parseInt(limitStr, 10) : 50;
    const offset = offsetStr ? parseInt(offsetStr, 10) : 0;
    return this.fleetSvc.list(limit, offset);
  }

  /**
   * Search fleets
   */
  @Get("search/:query")
  @ApiOperation({ summary: "搜索机队", description: "根据关键词搜索机队" })
  @ApiParam({ name: "query", description: "搜索关键词" })
  @ApiQuery({ name: "limit", required: false, description: "结果数量限制", example: 50 })
  @ApiResponse({ status: 200, description: "搜索成功", type: [FleetResponseDto] })
  async search(@Param("query") query: string, @Query("limit") limitStr?: string) {
    const limit = limitStr ? parseInt(limitStr, 10) : 50;
    return this.fleetSvc.search(query, limit);
  }

  /**
   * Create new fleet (admin/manager only)
   */
  @Post()
  @Roles("ADMIN", "MANAGER")
  @ApiOperation({ summary: "创建机队", description: "创建新机队（需要 ADMIN 或 MANAGER 角色）" })
  @ApiBody({ type: CreateFleetSwaggerDto })
  @ApiResponse({ status: 201, description: "创建成功", type: FleetResponseDto })
  @ApiResponse({ status: 400, description: "请求参数错误" })
  @ApiResponse({ status: 409, description: "机队代码已存在" })
  async create(@Body() dto: CreateFleetDto) {
    return this.fleetSvc.create(dto);
  }

  /**
   * Update fleet (admin/manager only)
   */
  @Put(":id")
  @Roles("ADMIN", "MANAGER")
  @ApiOperation({ summary: "更新机队", description: "更新机队信息（需要 ADMIN 或 MANAGER 角色）" })
  @ApiParam({ name: "id", description: "机队 ID" })
  @ApiBody({ type: UpdateFleetSwaggerDto })
  @ApiResponse({ status: 200, description: "更新成功", type: FleetResponseDto })
  @ApiResponse({ status: 404, description: "机队不存在" })
  @ApiResponse({ status: 409, description: "机队代码已被使用" })
  async update(@Param("id") id: string, @Body() dto: UpdateFleetDto) {
    return this.fleetSvc.update(id, dto);
  }

  /**
   * Delete fleet (admin only)
   */
  @Delete(":id")
  @Roles("ADMIN")
  @ApiOperation({ summary: "删除机队", description: "永久删除机队（需要 ADMIN 角色）" })
  @ApiParam({ name: "id", description: "机队 ID" })
  @ApiResponse({ status: 200, description: "删除成功", schema: { example: { success: true } } })
  @ApiResponse({ status: 404, description: "机队不存在" })
  async delete(@Param("id") id: string) {
    await this.fleetSvc.delete(id);
    return { success: true };
  }
}
