/**
 * Auth Strategies Unit Tests
 *
 * Tests for passport authentication strategies
 */

import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';

import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { AuthService } from '../auth.service';
import { UserService } from '../../user/user.service';
import type { User } from '@repo/db';

describe('LocalStrategy', () => {
  let strategy: LocalStrategy;
  let authService: jest.Mocked<AuthService>;

  const mockUser: User = {
    id: 'user-123',
    username: 'testuser',
    email: 'test@example.com',
    passwordHash: 'hashedpassword',
    fullName: 'Test User',
    isActive: true,
    role: 'INSPECTOR',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  beforeEach(async () => {
    const mockAuthService = {
      validateUser: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalStrategy,
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    strategy = module.get<LocalStrategy>(LocalStrategy);
    authService = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return user when credentials are valid', async () => {
      authService.validateUser.mockResolvedValue(mockUser);

      const result = await strategy.validate('testuser', 'password123');

      expect(result).toEqual(mockUser);
      expect(authService.validateUser).toHaveBeenCalledWith('testuser', 'password123');
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      authService.validateUser.mockResolvedValue(null as any);

      await expect(strategy.validate('testuser', 'wrongpassword')).rejects.toThrow(UnauthorizedException);
      await expect(strategy.validate('testuser', 'wrongpassword')).rejects.toThrow('Invalid credentials');
    });
  });
});

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let userService: jest.Mocked<UserService>;

  const mockUser: User = {
    id: 'user-123',
    username: 'testuser',
    email: 'test@example.com',
    passwordHash: 'hashedpassword',
    fullName: 'Test User',
    isActive: true,
    role: 'INSPECTOR',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const mockInactiveUser: User = {
    ...mockUser,
    id: 'user-456',
    isActive: false,
  };

  const mockPayload = {
    sub: 'user-123',
    username: 'testuser',
    role: 'INSPECTOR',
  };

  beforeEach(async () => {
    const mockUserService = {
      findById: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    userService = module.get(UserService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return user object without password when user is active', async () => {
      userService.findById.mockResolvedValue(mockUser);

      const result = await strategy.validate(mockPayload);

      expect(result).toHaveProperty('id', 'user-123');
      expect(result).toHaveProperty('username', 'testuser');
      expect(result).toHaveProperty('role', 'INSPECTOR');
      expect(result).not.toHaveProperty('passwordHash');
      expect(userService.findById).toHaveBeenCalledWith('user-123');
    });

    it('should throw UnauthorizedException when user not found', async () => {
      userService.findById.mockResolvedValue(null as any);

      await expect(strategy.validate(mockPayload)).rejects.toThrow(UnauthorizedException);
      await expect(strategy.validate(mockPayload)).rejects.toThrow('User not found');
    });

    it('should throw UnauthorizedException when user account is disabled', async () => {
      userService.findById.mockResolvedValue(mockInactiveUser);

      await expect(strategy.validate({ ...mockPayload, sub: 'user-456' })).rejects.toThrow(UnauthorizedException);
      await expect(strategy.validate({ ...mockPayload, sub: 'user-456' })).rejects.toThrow('User account is disabled');
    });

    it('should handle payloads with minimal fields', async () => {
      const minimalPayload = {
        sub: 'user-123',
        username: 'testuser',
        role: 'INSPECTOR',
      };
      userService.findById.mockResolvedValue(mockUser);

      const result = await strategy.validate(minimalPayload);

      expect(result).toHaveProperty('id', 'user-123');
      expect(result).toHaveProperty('username', 'testuser');
    });
  });
});
