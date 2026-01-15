import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";

import type { User } from "@repo/db";

/**
 * JWT Passport Strategy
 *
 * Validates JWT tokens and attaches user to request
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_SECRET"),
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
