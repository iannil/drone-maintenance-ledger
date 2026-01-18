import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';

import { JwtStrategy } from './jwt.strategy';
import { UserService } from '../../user/user.service';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let userService: jest.Mocked<UserService>;

  const mockUser = {
    id: 'user-123',
    username: 'testuser',
    email: 'test@example.com',
    role: 'PILOT' as const,
    fullName: 'Test User',
    isActive: true,
    passwordHash: 'hashed-password',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  beforeEach(async () => {
    process.env.JWT_SECRET = 'test-secret';

    const mockUserService = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    userService = module.get(UserService);
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
  });

  describe('validate', () => {
    it('should return user without password hash when user exists and is active', async () => {
      userService.findById.mockResolvedValue(mockUser);

      const payload = { sub: 'user-123', username: 'testuser', role: 'PILOT' };
      const result = await jwtStrategy.validate(payload);

      expect(result).not.toHaveProperty('passwordHash');
      expect(result).toEqual({
        id: mockUser.id,
        username: mockUser.username,
        email: mockUser.email,
        role: mockUser.role,
        fullName: mockUser.fullName,
        isActive: mockUser.isActive,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
      expect(userService.findById).toHaveBeenCalledWith('user-123');
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      userService.findById.mockResolvedValue(null);

      const payload = { sub: 'nonexistent-user', username: 'ghost', role: 'PILOT' };

      await expect(jwtStrategy.validate(payload)).rejects.toThrow(UnauthorizedException);
      await expect(jwtStrategy.validate(payload)).rejects.toThrow('User not found');
    });

    it('should throw UnauthorizedException when user account is disabled', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      userService.findById.mockResolvedValue(inactiveUser);

      const payload = { sub: 'user-123', username: 'testuser', role: 'PILOT' };

      await expect(jwtStrategy.validate(payload)).rejects.toThrow(UnauthorizedException);
      await expect(jwtStrategy.validate(payload)).rejects.toThrow('User account is disabled');
    });

    it('should return current role from database, not from token', async () => {
      const userWithUpdatedRole = { ...mockUser, role: 'ADMIN' as const };
      userService.findById.mockResolvedValue(userWithUpdatedRole);

      // Token says PILOT, but database says ADMIN
      const payload = { sub: 'user-123', username: 'testuser', role: 'PILOT' };
      const result = await jwtStrategy.validate(payload);

      expect(result.role).toBe('ADMIN');
    });
  });

  describe('role validation scenarios', () => {
    const roles = ['PILOT', 'MECHANIC', 'INSPECTOR', 'MANAGER', 'ADMIN'] as const;

    roles.forEach((role) => {
      it(`should correctly return user with ${role} role`, async () => {
        const userWithRole = { ...mockUser, role };
        userService.findById.mockResolvedValue(userWithRole);

        const payload = { sub: 'user-123', username: 'testuser', role };
        const result = await jwtStrategy.validate(payload);

        expect(result.role).toBe(role);
      });
    });
  });
});
