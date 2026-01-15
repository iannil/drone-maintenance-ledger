import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import type { User } from "@repo/db";

/**
 * Roles Guard
 *
 * Protects routes based on user roles
 * Usage: @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN')
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<User["role"][]>("roles", context.getHandler());

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as User | undefined;

    if (!user) {
      return false;
    }

    return requiredRoles.includes(user.role);
  }
}
