import { Controller, Post, Body, UseGuards, Request, Get, Inject } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { IsString, IsOptional, IsEmail, IsNotEmpty } from "class-validator";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiProperty,
  ApiPropertyOptional,
} from "@nestjs/swagger";
import type { Request as ExpressRequest } from "express";

import { AuthService } from "./auth.service";

/**
 * Register DTO
 */
class RegisterDto {
  @ApiProperty({ description: "用户名", example: "john_doe" })
  @IsString()
  @IsNotEmpty()
  username!: string;

  @ApiProperty({ description: "邮箱地址", example: "john@example.com" })
  @IsEmail()
  email!: string;

  @ApiProperty({ description: "密码", example: "SecurePass123!" })
  @IsString()
  @IsNotEmpty()
  password!: string;

  @ApiPropertyOptional({ description: "用户全名", example: "John Doe" })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiPropertyOptional({
    description: "用户角色",
    enum: ["ADMIN", "MECHANIC", "PILOT", "INSPECTOR", "MANAGER"],
    example: "PILOT",
  })
  @IsString()
  @IsOptional()
  role?: string;
}

/**
 * Login DTO
 */
class LoginDto {
  @ApiProperty({ description: "用户名", example: "john_doe" })
  @IsString()
  @IsNotEmpty()
  username!: string;

  @ApiProperty({ description: "密码", example: "SecurePass123!" })
  @IsString()
  @IsNotEmpty()
  password!: string;
}

/**
 * Auth User Response DTO
 */
class AuthUserDto {
  @ApiProperty({ description: "用户 ID", example: "uuid" })
  id!: string;

  @ApiProperty({ description: "用户名", example: "john_doe" })
  username!: string;

  @ApiProperty({ description: "邮箱", example: "john@example.com" })
  email!: string;

  @ApiProperty({ description: "角色", example: "PILOT" })
  role!: string;

  @ApiPropertyOptional({ description: "全名", example: "John Doe" })
  fullName?: string | null;
}

/**
 * Auth Response DTO
 */
class AuthResponseDto {
  @ApiProperty({ description: "JWT 访问令牌" })
  accessToken!: string;

  @ApiProperty({ description: "用户信息", type: () => AuthUserDto })
  user!: AuthUserDto;
}

/**
 * User Profile DTO
 */
class UserProfileDto {
  @ApiProperty({ description: "用户 ID" })
  id!: string;

  @ApiProperty({ description: "用户名" })
  username!: string;

  @ApiProperty({ description: "邮箱" })
  email!: string;

  @ApiProperty({ description: "角色" })
  role!: string;

  @ApiPropertyOptional({ description: "全名" })
  fullName?: string | null;
}

/**
 * Authentication controller
 *
 * Handles login, register, and profile
 */
@ApiTags("认证 (Auth)")
@Controller("auth")
export class AuthController {
  private authSvc: AuthService;

  constructor(@Inject(AuthService) authService: AuthService) {
    this.authSvc = authService;
  }

  /**
   * Register endpoint
   * Creates new user and returns JWT token
   */
  @Post("register")
  @ApiOperation({ summary: "用户注册", description: "创建新用户账户并返回 JWT 令牌" })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: "注册成功", type: AuthResponseDto })
  @ApiResponse({ status: 400, description: "请求参数错误" })
  @ApiResponse({ status: 409, description: "用户名或邮箱已存在" })
  async register(@Body() dto: RegisterDto) {
    return this.authSvc.register(dto);
  }

  /**
   * Login endpoint
   * Returns JWT token on successful authentication
   */
  @Post("login")
  @ApiOperation({ summary: "用户登录", description: "使用用户名和密码进行身份验证，返回 JWT 令牌" })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: "登录成功", type: AuthResponseDto })
  @ApiResponse({ status: 401, description: "用户名或密码错误" })
  async login(@Body() dto: LoginDto) {
    return this.authSvc.login(dto.username, dto.password);
  }

  /**
   * Get current user profile
   * Requires valid JWT token
   */
  @UseGuards(AuthGuard("jwt"))
  @Get("profile")
  @ApiBearerAuth()
  @ApiOperation({ summary: "获取当前用户信息", description: "返回当前已认证用户的详细信息" })
  @ApiResponse({ status: 200, description: "获取成功", type: UserProfileDto })
  @ApiResponse({ status: 401, description: "未授权，需要有效的 JWT 令牌" })
  getProfile(@Request() req: ExpressRequest & { user?: unknown }) {
    return req.user;
  }
}
