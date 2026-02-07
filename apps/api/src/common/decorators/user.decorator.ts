import { createParamDecorator, ExecutionContext } from "@nestjs/common";

import type { User } from "@repo/db";

/**
 * CurrentUser decorator factory function
 * Extracted for testing purposes
 */
export const currentUserFactory = (
  data: keyof User | undefined,
  ctx: ExecutionContext
): User | User[keyof User] => {
  const request = ctx.switchToHttp().getRequest();
  const user = request.user as User;

  return data ? user[data] : user;
};

/**
 * CurrentUser decorator
 *
 * Extracts the current user from the request
 * Usage: @CurrentUser() user: User
 */
export const CurrentUser = createParamDecorator(currentUserFactory);
