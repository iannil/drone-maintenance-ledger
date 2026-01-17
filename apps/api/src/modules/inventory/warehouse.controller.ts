/**
 * Warehouse Controller
 *
 * REST API endpoints for warehouse management
 */

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

import { WarehouseService, CreateWarehouseDto, UpdateWarehouseDto } from "./warehouse.service";
import { Roles } from "../../common/decorators/roles.decorator";
import { RolesGuard } from "../../common/guards/roles.guard";

// Swagger DTO classes
class CreateWarehouseSwaggerDto {
  @ApiProperty({ description: "仓库编码", example: "WH-001" })
  code!: string;

  @ApiProperty({ description: "仓库名称", example: "北京总仓" })
  name!: string;

  @ApiPropertyOptional({ description: "仓库类型", enum: ["MAIN", "BRANCH", "MOBILE"], example: "MAIN" })
  type?: string;

  @ApiPropertyOptional({ description: "地址" })
  address?: string;

  @ApiPropertyOptional({ description: "联系人" })
  contactPerson?: string;

  @ApiPropertyOptional({ description: "联系电话" })
  contactPhone?: string;

  @ApiPropertyOptional({ description: "备注" })
  notes?: string;
}

class UpdateWarehouseSwaggerDto {
  @ApiPropertyOptional({ description: "仓库名称" })
  name?: string;

  @ApiPropertyOptional({ description: "仓库类型", enum: ["MAIN", "BRANCH", "MOBILE"] })
  type?: string;

  @ApiPropertyOptional({ description: "地址" })
  address?: string;

  @ApiPropertyOptional({ description: "联系人" })
  contactPerson?: string;

  @ApiPropertyOptional({ description: "联系电话" })
  contactPhone?: string;

  @ApiPropertyOptional({ description: "备注" })
  notes?: string;

  @ApiPropertyOptional({ description: "状态", enum: ["ACTIVE", "INACTIVE"] })
  status?: string;
}

class WarehouseResponseDto {
  @ApiProperty({ description: "仓库 ID" })
  id!: string;

  @ApiProperty({ description: "仓库编码" })
  code!: string;

  @ApiProperty({ description: "仓库名称" })
  name!: string;

  @ApiProperty({ description: "仓库类型" })
  type!: string;

  @ApiPropertyOptional({ description: "地址" })
  address?: string | null;

  @ApiPropertyOptional({ description: "联系人" })
  contactPerson?: string | null;

  @ApiProperty({ description: "状态" })
  status!: string;
}

@ApiTags("仓库 (Warehouse)")
@ApiBearerAuth()
@Controller("warehouses")
@UseGuards(AuthGuard("jwt"), RolesGuard)
export class WarehouseController {
  constructor(
    @Inject(WarehouseService)
    private readonly warehouseSvc: WarehouseService
  ) {}

  /**
   * Get warehouse by ID
   * GET /api/warehouses/:id
   */
  @Get(":id")
  @ApiOperation({ summary: "获取仓库详情", description: "根据 ID 获取仓库详细信息" })
  @ApiParam({ name: "id", description: "仓库 ID" })
  @ApiResponse({ status: 200, description: "获取成功", type: WarehouseResponseDto })
  @ApiResponse({ status: 404, description: "仓库不存在" })
  async getById(@Param("id") id: string) {
    return this.warehouseSvc.findById(id);
  }

  /**
   * List all warehouses
   * GET /api/warehouses
   */
  @Get()
  @ApiOperation({ summary: "获取仓库列表", description: "获取所有仓库列表" })
  @ApiQuery({ name: "limit", required: false, description: "每页数量", example: 50 })
  @ApiQuery({ name: "offset", required: false, description: "偏移量", example: 0 })
  @ApiQuery({ name: "status", required: false, description: "按状态筛选", enum: ["ACTIVE", "INACTIVE"] })
  @ApiResponse({ status: 200, description: "获取成功", type: [WarehouseResponseDto] })
  async list(
    @Query("limit") limitStr?: string,
    @Query("offset") offsetStr?: string,
    @Query("status") status?: string,
  ) {
    const limit = limitStr ? parseInt(limitStr, 10) : 50;
    const offset = offsetStr ? parseInt(offsetStr, 10) : 0;
    return this.warehouseSvc.list({ limit, offset, status });
  }

  /**
   * Search warehouses
   * GET /api/warehouses/search/:query
   */
  @Get("search/:query")
  @ApiOperation({ summary: "搜索仓库", description: "按编码或名称搜索仓库" })
  @ApiParam({ name: "query", description: "搜索关键词" })
  @ApiQuery({ name: "limit", required: false, description: "数量限制", example: 50 })
  @ApiResponse({ status: 200, description: "搜索成功", type: [WarehouseResponseDto] })
  async search(
    @Param("query") query: string,
    @Query("limit") limitStr?: string,
  ) {
    const limit = limitStr ? parseInt(limitStr, 10) : 50;
    return this.warehouseSvc.search(query, limit);
  }

  /**
   * Create new warehouse (admin/manager only)
   * POST /api/warehouses
   */
  @Post()
  @Roles("ADMIN", "MANAGER")
  @ApiOperation({ summary: "创建仓库", description: "创建新仓库（需要 ADMIN 或 MANAGER 角色）" })
  @ApiBody({ type: CreateWarehouseSwaggerDto })
  @ApiResponse({ status: 201, description: "创建成功", type: WarehouseResponseDto })
  @ApiResponse({ status: 400, description: "请求参数错误" })
  @ApiResponse({ status: 409, description: "仓库编码已存在" })
  async create(@Body() dto: CreateWarehouseDto) {
    return this.warehouseSvc.create(dto);
  }

  /**
   * Update warehouse (admin/manager only)
   * PUT /api/warehouses/:id
   */
  @Put(":id")
  @Roles("ADMIN", "MANAGER")
  @ApiOperation({ summary: "更新仓库", description: "更新仓库信息（需要 ADMIN 或 MANAGER 角色）" })
  @ApiParam({ name: "id", description: "仓库 ID" })
  @ApiBody({ type: UpdateWarehouseSwaggerDto })
  @ApiResponse({ status: 200, description: "更新成功", type: WarehouseResponseDto })
  @ApiResponse({ status: 404, description: "仓库不存在" })
  async update(@Param("id") id: string, @Body() dto: UpdateWarehouseDto) {
    return this.warehouseSvc.update(id, dto);
  }

  /**
   * Delete warehouse (admin only)
   * DELETE /api/warehouses/:id
   */
  @Delete(":id")
  @Roles("ADMIN")
  @ApiOperation({ summary: "删除仓库", description: "删除仓库（需要 ADMIN 角色，有库存时不可删除）" })
  @ApiParam({ name: "id", description: "仓库 ID" })
  @ApiResponse({ status: 200, description: "删除成功", schema: { example: { success: true } } })
  @ApiResponse({ status: 404, description: "仓库不存在" })
  @ApiResponse({ status: 409, description: "仓库有库存，不可删除" })
  async delete(@Param("id") id: string) {
    await this.warehouseSvc.delete(id);
    return { success: true };
  }
}
