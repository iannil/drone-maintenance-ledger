import { Controller, Post, Body, UseGuards, Request, Get } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import { AuthService } from "./auth.service";
import type { User } from "@repo/db";

/**
 * Register DTO
 */
interface RegisterDto {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  role?: User["role"];
}

/**
 * Login DTO
 */
interface LoginDto {
  username: string;
  password: string;
}

/**
 * Authentication controller
 *
 * Handles login, register, and profile
 */
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register endpoint
   * Creates new user and returns JWT token
   */
  @Post("register")
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /**
   * Login endpoint
   * Returns JWT token on successful authentication
   */
  @UseGuards(AuthGuard("local"))
  @Post("login")
  async login(@Request() req) {
    return this.authService.login(req.body.username, req.body.password);
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
