/**
 * AuthController Unit Tests
 *
 * Tests for authentication endpoints
 */

import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { createMockUserWithoutPassword } from '../../../test/test-utils';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockUser = createMockUserWithoutPassword({
    id: 'user-123',
    username: 'testuser',
    email: 'test@example.com',
    role: 'PILOT',
    fullName: 'Test User',
    isActive: true,
  });

  const mockAuthResponse = {
    accessToken: 'test-jwt-token',
    user: {
      id: mockUser.id,
      username: mockUser.username,
      email: mockUser.email,
      role: mockUser.role,
      fullName: mockUser.fullName,
    },
  };

  beforeEach(async () => {
    const mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
      validateUser: jest.fn(),
      verifyToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  describe('POST /auth/register', () => {
    const registerDto = {
      username: 'newuser',
      email: 'new@example.com',
      password: 'password123',
      fullName: 'New User',
    };

    it('should create a new user and return auth response', async () => {
      authService.register.mockResolvedValue(mockAuthResponse);

      const result = await controller.register(registerDto);

      expect(result).toEqual(mockAuthResponse);
      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });

    it('should handle registration errors', async () => {
      authService.register.mockRejectedValue(new Error('Username already exists'));

      await expect(controller.register(registerDto)).rejects.toThrow('Username already exists');
    });
  });

  describe('POST /auth/login', () => {
    const loginDto = {
      username: 'testuser',
      password: 'password123',
    };

    it('should return auth response on successful login', async () => {
      authService.login.mockResolvedValue(mockAuthResponse);

      const result = await controller.login(loginDto);

      expect(result).toEqual(mockAuthResponse);
      expect(authService.login).toHaveBeenCalledWith(loginDto.username, loginDto.password);
    });

    it('should throw UnauthorizedException on invalid credentials', async () => {
      authService.login.mockRejectedValue(new UnauthorizedException('Invalid credentials'));

      await expect(controller.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should handle inactive user login', async () => {
      authService.login.mockRejectedValue(new UnauthorizedException('Account is disabled'));

      await expect(controller.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('GET /auth/profile', () => {
    it('should return current user profile', () => {
      const mockRequest = {
        user: mockUser,
      } as unknown as Request & { user?: unknown };

      const result = controller.getProfile(mockRequest as any);

      expect(result).toEqual(mockUser);
    });

    it('should return undefined if no user in request', () => {
      const mockRequest = {} as unknown as Request & { user?: unknown };

      const result = controller.getProfile(mockRequest as any);

      expect(result).toBeUndefined();
    });
  });
});
