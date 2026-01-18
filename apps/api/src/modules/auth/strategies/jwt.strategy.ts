import { Injectable, UnauthorizedException, Inject } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

import type { User } from "@repo/db";

import { UserService } from "../../user/user.service";

/**
 * JWT Passport Strategy
 *
 * Validates JWT tokens and attaches user to request.
 * Fetches full user from database to ensure:
 * - User still exists
 * - User account is still active
 * - User has latest role/permissions
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(UserService)
    private readonly userService: UserService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || "default-secret-key-for-development",
    });
  }

  async validate(payload: { sub: string; username: string; role: string }): Promise<Omit<User, "passwordHash">> {
    // Fetch full user from database
    const user = await this.userService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    // Check if user account is active
    if (!user.isActive) {
      throw new UnauthorizedException("User account is disabled");
    }

    // Return user without password hash
    const { passwordHash: _unused, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
