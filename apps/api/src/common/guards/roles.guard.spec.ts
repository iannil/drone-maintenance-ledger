import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';

import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let rolesGuard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  const createMockContext = (user?: { role: string }): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;
  };

  beforeEach(async () => {
    const mockReflector = {
      getAllAndOverride: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        { provide: Reflector, useValue: mockReflector },
      ],
    }).compile();

    rolesGuard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get(Reflector);
  });

  describe('canActivate', () => {
    it('should allow access when no roles are required', () => {
      reflector.getAllAndOverride.mockReturnValue(undefined);
      const context = createMockContext({ role: 'PILOT' });

      const result = rolesGuard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow access when roles array is empty', () => {
      reflector.getAllAndOverride.mockReturnValue([]);
      const context = createMockContext({ role: 'PILOT' });

      const result = rolesGuard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should deny access when user is not present', () => {
      reflector.getAllAndOverride.mockReturnValue(['ADMIN']);
      const context = createMockContext(undefined);

      const result = rolesGuard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should allow access when user has required role', () => {
      reflector.getAllAndOverride.mockReturnValue(['ADMIN', 'MANAGER']);
      const context = createMockContext({ role: 'ADMIN' });

      const result = rolesGuard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow access when user has one of multiple required roles', () => {
      reflector.getAllAndOverride.mockReturnValue(['ADMIN', 'MANAGER', 'MECHANIC']);
      const context = createMockContext({ role: 'MECHANIC' });

      const result = rolesGuard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should deny access when user does not have required role', () => {
      reflector.getAllAndOverride.mockReturnValue(['ADMIN', 'MANAGER']);
      const context = createMockContext({ role: 'PILOT' });

      const result = rolesGuard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should deny access for PILOT trying to access ADMIN-only endpoint', () => {
      reflector.getAllAndOverride.mockReturnValue(['ADMIN']);
      const context = createMockContext({ role: 'PILOT' });

      const result = rolesGuard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should allow INSPECTOR to access INSPECTOR endpoint', () => {
      reflector.getAllAndOverride.mockReturnValue(['INSPECTOR', 'ADMIN']);
      const context = createMockContext({ role: 'INSPECTOR' });

      const result = rolesGuard.canActivate(context);

      expect(result).toBe(true);
    });
  });

  describe('role hierarchy scenarios', () => {
    const scenarios = [
      // [userRole, requiredRoles, expected]
      { userRole: 'ADMIN', requiredRoles: ['ADMIN'], expected: true },
      { userRole: 'ADMIN', requiredRoles: ['MANAGER'], expected: false },
      { userRole: 'MANAGER', requiredRoles: ['ADMIN', 'MANAGER'], expected: true },
      { userRole: 'MECHANIC', requiredRoles: ['MECHANIC', 'INSPECTOR'], expected: true },
      { userRole: 'INSPECTOR', requiredRoles: ['MECHANIC', 'INSPECTOR'], expected: true },
      { userRole: 'PILOT', requiredRoles: ['MECHANIC', 'INSPECTOR'], expected: false },
      { userRole: 'PILOT', requiredRoles: ['PILOT', 'MECHANIC', 'INSPECTOR', 'MANAGER', 'ADMIN'], expected: true },
    ];

    scenarios.forEach(({ userRole, requiredRoles, expected }) => {
      it(`should ${expected ? 'allow' : 'deny'} ${userRole} for roles [${requiredRoles.join(', ')}]`, () => {
        reflector.getAllAndOverride.mockReturnValue(requiredRoles);
        const context = createMockContext({ role: userRole });

        const result = rolesGuard.canActivate(context);

        expect(result).toBe(expected);
      });
    });
  });
});
