import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';

import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { createMockUserWithoutPassword } from '../../../test/test-utils';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: jest.Mocked<UserService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser = createMockUserWithoutPassword({
    id: 'user-123',
    username: 'testuser',
    email: 'test@example.com',
    role: 'PILOT',
    isActive: true,
  });

  beforeEach(async () => {
    const mockUserService = {
      verifyCredentials: jest.fn(),
      register: jest.fn(),
      findById: jest.fn(),
      findByUsername: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn().mockReturnValue('test-token'),
      verifyAsync: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn().mockImplementation((key: string) => {
        const config: Record<string, string> = {
          JWT_SECRET: 'test-secret',
          JWT_EXPIRES_IN: '1h',
        };
        return config[key];
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get(UserService);
    jwtService = module.get(JwtService);
  });

  describe('validateUser', () => {
    it('should return user without password when credentials are valid', async () => {
      userService.verifyCredentials.mockResolvedValue(mockUser);

      const result = await authService.validateUser('testuser', 'password123');

      expect(result).toEqual(mockUser);
      expect(userService.verifyCredentials).toHaveBeenCalledWith('testuser', 'password123');
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      userService.verifyCredentials.mockResolvedValue(null);

      await expect(authService.validateUser('testuser', 'wrongpassword')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when user is inactive', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      userService.verifyCredentials.mockResolvedValue(inactiveUser);

      await expect(authService.validateUser('testuser', 'password123')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('login', () => {
    it('should return access token and user info on successful login', async () => {
      userService.verifyCredentials.mockResolvedValue(mockUser);

      const result = await authService.login('testuser', 'password123');

      expect(result).toHaveProperty('accessToken', 'test-token');
      expect(result).toHaveProperty('user');
      expect(result.user).toEqual({
        id: mockUser.id,
        username: mockUser.username,
        email: mockUser.email,
        role: mockUser.role,
        fullName: mockUser.fullName,
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        username: mockUser.username,
        role: mockUser.role,
      });
    });

    it('should throw UnauthorizedException when login fails', async () => {
      userService.verifyCredentials.mockResolvedValue(null);

      await expect(authService.login('testuser', 'wrongpassword')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('register', () => {
    it('should create user and return tokens', async () => {
      const registerDto = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
        fullName: 'New User',
      };
      const newUser = createMockUserWithoutPassword({
        id: 'new-user-id',
        ...registerDto,
      });
      userService.register.mockResolvedValue(newUser);

      const result = await authService.register(registerDto);

      expect(result).toHaveProperty('accessToken', 'test-token');
      expect(result).toHaveProperty('user');
      expect(userService.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('verifyToken', () => {
    it('should return payload when token is valid', async () => {
      const payload = { sub: 'user-123', username: 'testuser', role: 'pilot' };
      jwtService.verifyAsync.mockResolvedValue(payload);

      const result = await authService.verifyToken('valid-token');

      expect(result).toEqual(payload);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-token');
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await expect(authService.verifyToken('invalid-token')).rejects.toThrow(UnauthorizedException);
    });
  });
});
