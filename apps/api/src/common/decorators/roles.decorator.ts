import { SetMetadata } from "@nestjs/common";

import type { User } from "@repo/db";

/**
 * Roles decorator
 *
 * Marks a route handler as requiring specific roles
 * Usage: @Roles('ADMIN', 'MANAGER')
 */
export const Roles = (...roles: User["role"][]) => SetMetadata("roles", roles);
