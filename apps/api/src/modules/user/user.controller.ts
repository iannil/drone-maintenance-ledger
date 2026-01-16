import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  UseGuards,
  Request,
  Put,
  Delete,
  Query,
  ParseIntPipe,
  Inject,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import { UserService, RegisterDto, UpdateUserDto } from "./user.service";
import { Roles } from "../../common/decorators/roles.decorator";
import { RolesGuard } from "../../common/guards/roles.guard";
import type { User } from "@repo/db";

/**
 * User controller
 *
 * Handles user-related endpoints
 */
@Controller("users")
@UseGuards(AuthGuard("jwt"), RolesGuard)
export class UserController {
  private userService: UserService;

  constructor(@Inject(UserService) userService: UserService) {
    this.userService = userService;
  }

  /**
   * Get current user profile
   */
  @Get("me")
  getProfile(@Request() req) {
    return this.userService.findById(req.user.id);
  }

  /**
   * Get user by ID
   */
  @Get(":id")
  async getById(@Param("id") id: string) {
    return this.userService.findById(id);
  }

  /**
   * List all users (admin/manager only)
   */
  @Get()
  @Roles("ADMIN", "MANAGER")
  async list(
    @Query("limit", new ParseIntPipe({ optional: true })) limit = 50,
    @Query("offset", new ParseIntPipe({ optional: true })) offset = 0,
  ) {
    return this.userService.list(limit, offset);
  }

  /**
   * Register new user (admin only)
   */
  @Post()
  @Roles("ADMIN")
  async register(@Body() dto: RegisterDto) {
    return this.userService.register(dto);
  }

  /**
   * Update user
   */
  @Put(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }

  /**
   * Delete user (admin only)
   */
  @Delete(":id")
  @Roles("ADMIN")
  async delete(@Param("id") id: string) {
    await this.userService.delete(id);
    return { success: true };
  }
}
