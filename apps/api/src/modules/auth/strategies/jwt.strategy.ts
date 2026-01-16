import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

import type { User } from "@repo/db";

/**
 * JWT Passport Strategy
 *
 * Validates JWT tokens and attaches user to request
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || "default-secret-key-for-development",
    });
  }

  async validate(payload: { sub: string; username: string; role: string }): Promise<Omit<User, "passwordHash">> {
    // TODO: Fetch full user from database
    // const user = await this.userService.findById(payload.sub);
    // if (!user) {
    //   throw new UnauthorizedException();
    // }
    // return user;

    // Placeholder for development
    return {
      id: payload.sub,
      username: payload.username,
      email: "user@example.com",
      role: payload.role as User["role"],
      fullName: "User",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Omit<User, "passwordHash">;
  }
}
