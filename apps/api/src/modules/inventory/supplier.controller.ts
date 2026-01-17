/**
 * Supplier Controller
 *
 * REST API endpoints for supplier management
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

import { SupplierService, CreateSupplierDto, UpdateSupplierDto } from "./supplier.service";
import { Roles } from "../../common/decorators/roles.decorator";
import { RolesGuard } from "../../common/guards/roles.guard";

// Swagger DTO classes
class CreateSupplierSwaggerDto {
  @ApiProperty({ description: "供应商编码", example: "SUP-001" })
  code!: string;

  @ApiProperty({ description: "供应商名称", example: "大疆科技" })
  name!: string;

  @ApiPropertyOptional({ description: "联系人" })
  contactPerson?: string;

  @ApiPropertyOptional({ description: "联系电话" })
  contactPhone?: string;

  @ApiPropertyOptional({ description: "联系邮箱" })
  contactEmail?: string;

  @ApiPropertyOptional({ description: "地址" })
  address?: string;

  @ApiPropertyOptional({ description: "网站" })
  website?: string;

  @ApiPropertyOptional({ description: "供应商评级", enum: ["A", "B", "C", "D"], example: "A" })
  rating?: string;

  @ApiPropertyOptional({ description: "备注" })
  notes?: string;
}

class UpdateSupplierSwaggerDto {
  @ApiPropertyOptional({ description: "供应商名称" })
  name?: string;

  @ApiPropertyOptional({ description: "联系人" })
  contactPerson?: string;

  @ApiPropertyOptional({ description: "联系电话" })
  contactPhone?: string;

  @ApiPropertyOptional({ description: "联系邮箱" })
  contactEmail?: string;

  @ApiPropertyOptional({ description: "地址" })
  address?: string;

  @ApiPropertyOptional({ description: "网站" })
  website?: string;

  @ApiPropertyOptional({ description: "供应商评级", enum: ["A", "B", "C", "D"] })
  rating?: string;

  @ApiPropertyOptional({ description: "状态", enum: ["ACTIVE", "INACTIVE", "BLACKLISTED"] })
  status?: string;

  @ApiPropertyOptional({ description: "备注" })
  notes?: string;
}

class SupplierResponseDto {
  @ApiProperty({ description: "供应商 ID" })
  id!: string;

  @ApiProperty({ description: "供应商编码" })
  code!: string;

  @ApiProperty({ description: "供应商名称" })
  name!: string;

  @ApiPropertyOptional({ description: "联系人" })
  contactPerson?: string | null;

  @ApiPropertyOptional({ description: "联系电话" })
  contactPhone?: string | null;

  @ApiPropertyOptional({ description: "联系邮箱" })
  contactEmail?: string | null;

  @ApiProperty({ description: "供应商评级" })
  rating!: string;

  @ApiProperty({ description: "状态" })
  status!: string;
}

@ApiTags("供应商 (Supplier)")
@ApiBearerAuth()
@Controller("suppliers")
@UseGuards(AuthGuard("jwt"), RolesGuard)
export class SupplierController {
  constructor(
    @Inject(SupplierService)
    private readonly supplierSvc: SupplierService
  ) {}

  /**
   * Search suppliers
   * GET /api/suppliers/search/:query
   */
  @Get("search/:query")
  @ApiOperation({ summary: "搜索供应商", description: "按编码或名称搜索供应商" })
  @ApiParam({ name: "query", description: "搜索关键词" })
  @ApiQuery({ name: "limit", required: false, description: "数量限制", example: 50 })
  @ApiResponse({ status: 200, description: "搜索成功", type: [SupplierResponseDto] })
  async search(
    @Param("query") query: string,
    @Query("limit") limitStr?: string,
  ) {
    const limit = limitStr ? parseInt(limitStr, 10) : 50;
    return this.supplierSvc.search(query, limit);
  }

  /**
   * Get supplier by ID
   * GET /api/suppliers/:id
   */
  @Get(":id")
  @ApiOperation({ summary: "获取供应商详情", description: "根据 ID 获取供应商详细信息" })
  @ApiParam({ name: "id", description: "供应商 ID" })
  @ApiResponse({ status: 200, description: "获取成功", type: SupplierResponseDto })
  @ApiResponse({ status: 404, description: "供应商不存在" })
  async getById(@Param("id") id: string) {
    return this.supplierSvc.findById(id);
  }

  /**
   * List all suppliers
   * GET /api/suppliers
   */
  @Get()
  @ApiOperation({ summary: "获取供应商列表", description: "获取所有供应商列表" })
  @ApiQuery({ name: "limit", required: false, description: "每页数量", example: 50 })
  @ApiQuery({ name: "offset", required: false, description: "偏移量", example: 0 })
  @ApiQuery({ name: "status", required: false, description: "按状态筛选", enum: ["ACTIVE", "INACTIVE", "BLACKLISTED"] })
  @ApiQuery({ name: "rating", required: false, description: "按评级筛选", enum: ["A", "B", "C", "D"] })
  @ApiResponse({ status: 200, description: "获取成功", type: [SupplierResponseDto] })
  async list(
    @Query("limit") limitStr?: string,
    @Query("offset") offsetStr?: string,
    @Query("status") status?: string,
    @Query("rating") rating?: string,
  ) {
    const limit = limitStr ? parseInt(limitStr, 10) : 50;
    const offset = offsetStr ? parseInt(offsetStr, 10) : 0;
    return this.supplierSvc.list({ limit, offset, status, rating });
  }

  /**
   * Create new supplier (admin/manager only)
   * POST /api/suppliers
   */
  @Post()
  @Roles("ADMIN", "MANAGER")
  @ApiOperation({ summary: "创建供应商", description: "创建新供应商（需要 ADMIN 或 MANAGER 角色）" })
  @ApiBody({ type: CreateSupplierSwaggerDto })
  @ApiResponse({ status: 201, description: "创建成功", type: SupplierResponseDto })
  @ApiResponse({ status: 400, description: "请求参数错误" })
  @ApiResponse({ status: 409, description: "供应商编码已存在" })
  async create(@Body() dto: CreateSupplierDto) {
    return this.supplierSvc.create(dto);
  }

  /**
   * Update supplier (admin/manager only)
   * PUT /api/suppliers/:id
   */
  @Put(":id")
  @Roles("ADMIN", "MANAGER")
  @ApiOperation({ summary: "更新供应商", description: "更新供应商信息（需要 ADMIN 或 MANAGER 角色）" })
  @ApiParam({ name: "id", description: "供应商 ID" })
  @ApiBody({ type: UpdateSupplierSwaggerDto })
  @ApiResponse({ status: 200, description: "更新成功", type: SupplierResponseDto })
  @ApiResponse({ status: 404, description: "供应商不存在" })
  async update(@Param("id") id: string, @Body() dto: UpdateSupplierDto) {
    return this.supplierSvc.update(id, dto);
  }

  /**
   * Delete supplier (admin only)
   * DELETE /api/suppliers/:id
   */
  @Delete(":id")
  @Roles("ADMIN")
  @ApiOperation({ summary: "删除供应商", description: "删除供应商（需要 ADMIN 角色，有关联采购单时不可删除）" })
  @ApiParam({ name: "id", description: "供应商 ID" })
  @ApiResponse({ status: 200, description: "删除成功", schema: { example: { success: true } } })
  @ApiResponse({ status: 404, description: "供应商不存在" })
  @ApiResponse({ status: 409, description: "供应商有关联数据，不可删除" })
  async delete(@Param("id") id: string) {
    await this.supplierSvc.delete(id);
    return { success: true };
  }
}
