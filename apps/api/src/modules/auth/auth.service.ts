import { Injectable, UnauthorizedException, Inject } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

import type { User } from "@repo/db";
import { UserService } from "../user/user.service";

/**
 * Authentication service
 *
 * Handles JWT token generation and user authentication
 */
@Injectable()
export class AuthService {
  private jwtSvc: JwtService;
  private configSvc: ConfigService;
  private userSvc: UserService;

  constructor(
    @Inject(JwtService) jwtService: JwtService,
    @Inject(ConfigService) configService: ConfigService,
    @Inject(UserService) userService: UserService,
  ) {
    this.jwtSvc = jwtService;
    this.configSvc = configService;
    this.userSvc = userService;
  }

  /**
   * Validate user credentials
   */
  async validateUser(username: string, password: string): Promise<Omit<User, "passwordHash">> {
    const user = await this.userSvc.verifyCredentials(username, password);

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    if (!user.isActive) {
      throw new UnauthorizedException("User account is disabled");
    }

    return user;
  }

  /**
   * Login with username and password
   */
  async login(username: string, password: string) {
    const user = await this.validateUser(username, password);
    return this.generateTokens(user);
  }

  /**
   * Register new user
   */
  async register(dto: {
    username: string;
    email: string;
    password: string;
    fullName?: string;
    role?: User["role"];
  }) {
    const user = await this.userSvc.register(dto);
    return this.generateTokens(user);
  }

  /**
   * Generate JWT token for authenticated user
   */
  private generateTokens(user: Omit<User, "passwordHash">) {
    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    return {
      accessToken: this.jwtSvc.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
      },
    };
  }

  /**
   * Verify JWT token and return payload
   */
  async verifyToken(token: string) {
    try {
      return await this.jwtSvc.verifyAsync(token);
    } catch {
      throw new UnauthorizedException("Invalid token");
    }
  }
}
