/**
 * CurrentUser Decorator Unit Tests
 *
 * Tests for the @CurrentUser() parameter decorator
 */

import { ExecutionContext } from '@nestjs/common';

import { currentUserFactory } from './user.decorator';

describe('CurrentUser Decorator', () => {
  const createMockContext = (user?: any): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as unknown as ExecutionContext;
  };

  describe('currentUserFactory', () => {
    describe('without data parameter', () => {
      it('should return the full user object', () => {
        const mockUser = {
          id: 'user-123',
          username: 'testuser',
          email: 'test@example.com',
          role: 'USER',
        };
        const context = createMockContext(mockUser);

        const result = currentUserFactory(undefined, context);

        expect(result).toEqual(mockUser);
      });

      it('should return undefined when no user in request', () => {
        const context = createMockContext(undefined);

        const result = currentUserFactory(undefined, context);

        expect(result).toBeUndefined();
      });
    });

    describe('with data parameter', () => {
      const mockUser = {
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        role: 'USER',
      };

      it('should return specific user property when data is provided', () => {
        const context = createMockContext(mockUser);

        const result = currentUserFactory('id', context);

        expect(result).toBe('user-123');
      });

      it('should return username property', () => {
        const context = createMockContext(mockUser);

        const result = currentUserFactory('username', context);

        expect(result).toBe('testuser');
      });

      it('should return email property', () => {
        const context = createMockContext(mockUser);

        const result = currentUserFactory('email', context);

        expect(result).toBe('test@example.com');
      });

      it('should return role property', () => {
        const context = createMockContext(mockUser);

        const result = currentUserFactory('role', context);

        expect(result).toBe('USER');
      });

      it('should return undefined when property does not exist on user', () => {
        const context = createMockContext(mockUser);

        const result = currentUserFactory('nonExistent' as any, context);

        expect(result).toBeUndefined();
      });
    });

    describe('edge cases', () => {
      it('should handle user with partial properties', () => {
        const context = createMockContext({ id: 'user-456' });

        const result = currentUserFactory('username', context);

        expect(result).toBeUndefined();
      });

      it('should handle null user', () => {
        const context = createMockContext(null);

        const result = currentUserFactory(undefined, context);

        expect(result).toBeNull();
      });

      it('should handle falsy property values', () => {
        const mockUser = {
          id: 'user-789',
          role: '',
          email: '',
        };
        const context = createMockContext(mockUser);

        expect(currentUserFactory('role', context)).toBe('');
        expect(currentUserFactory('email', context)).toBe('');
      });
    });
  });
});
