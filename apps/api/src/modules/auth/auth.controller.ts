import { Controller, Post, Body, UseGuards, Request, Get, Inject } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { IsString, IsOptional, IsEmail, IsNotEmpty } from "class-validator";

import { AuthService } from "./auth.service";
import type { User } from "@repo/db";

/**
 * Register DTO
 */
class RegisterDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  role?: User["role"];
}

/**
 * Login DTO
 */
class LoginDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

/**
 * Authentication controller
 *
 * Handles login, register, and profile
 */
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
  async register(@Body() dto: RegisterDto) {
    return this.authSvc.register(dto);
  }

  /**
   * Login endpoint
   * Returns JWT token on successful authentication
   */
  @Post("login")
  async login(@Body() dto: LoginDto) {
    return this.authSvc.login(dto.username, dto.password);
  }

  /**
   * Get current user profile
   * Requires valid JWT token
   */
  @UseGuards(AuthGuard("jwt"))
  @Get("profile")
  getProfile(@Request() req) {
    return req.user;
  }
}
