/**
 * UserController Unit Tests
 *
 * Tests for user management endpoints
 */

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';

import { UserController } from './user.controller';
import { UserService } from './user.service';
import { createMockUserWithoutPassword } from '../../../test/test-utils';

describe('UserController', () => {
  let controller: UserController;
  let userService: jest.Mocked<UserService>;

  const mockUser = createMockUserWithoutPassword({
    id: 'user-123',
    username: 'testuser',
    email: 'test@example.com',
    role: 'PILOT',
    fullName: 'Test User',
    isActive: true,
  });

  const mockUsers = [
    mockUser,
    createMockUserWithoutPassword({
      id: 'user-456',
      username: 'anotheruser',
      email: 'another@example.com',
      role: 'MECHANIC',
      fullName: 'Another User',
    }),
  ];

  beforeEach(async () => {
    const mockUserService = {
      findById: jest.fn(),
      findByUsername: jest.fn(),
      list: jest.fn(),
      register: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockUserService }],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get(UserService);
  });

  describe('GET /users/me', () => {
    it('should return current user profile', () => {
      const mockRequest = {
        user: { id: 'user-123' },
      };
      userService.findById.mockResolvedValue(mockUser as any);

      const result = controller.getProfile(mockRequest as any);

      expect(userService.findById).toHaveBeenCalledWith('user-123');
    });
  });

  describe('GET /users/:id', () => {
    it('should return user by ID', async () => {
      userService.findById.mockResolvedValue(mockUser as any);

      const result = await controller.getById('user-123');

      expect(result).toEqual(mockUser);
      expect(userService.findById).toHaveBeenCalledWith('user-123');
    });

    it('should handle not found user', async () => {
      userService.findById.mockRejectedValue(new NotFoundException('User not found'));

      await expect(controller.getById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('GET /users', () => {
    it('should return list of users with default pagination', async () => {
      userService.list.mockResolvedValue(mockUsers as any);

      const result = await controller.list(50, 0);

      expect(result).toEqual(mockUsers);
      expect(userService.list).toHaveBeenCalledWith(50, 0);
    });

    it('should return list of users with custom pagination', async () => {
      userService.list.mockResolvedValue(mockUsers as any);

      const result = await controller.list(10, 20);

      expect(result).toEqual(mockUsers);
      expect(userService.list).toHaveBeenCalledWith(10, 20);
    });

    it('should use default values when parameters are not provided', async () => {
      userService.list.mockResolvedValue(mockUsers as any);

      // Call without parameters to trigger default values (undefined)
      const result = await controller.list(undefined as any, undefined as any);

      expect(result).toEqual(mockUsers);
      expect(userService.list).toHaveBeenCalledWith(50, 0);
    });

    it('should use default offset when only limit is provided', async () => {
      userService.list.mockResolvedValue(mockUsers as any);

      const result = await controller.list(25, undefined as any);

      expect(result).toEqual(mockUsers);
      expect(userService.list).toHaveBeenCalledWith(25, 0);
    });
  });

  describe('POST /users', () => {
    const registerDto = {
      username: 'newuser',
      email: 'new@example.com',
      password: 'password123',
      fullName: 'New User',
    };

    it('should create a new user', async () => {
      const newUser = createMockUserWithoutPassword({
        id: 'new-user-id',
        ...registerDto,
      });
      userService.register.mockResolvedValue(newUser as any);

      const result = await controller.register(registerDto);

      expect(result).toEqual(newUser);
      expect(userService.register).toHaveBeenCalledWith(registerDto);
    });

    it('should handle duplicate username/email', async () => {
      userService.register.mockRejectedValue(new Error('Username already exists'));

      await expect(controller.register(registerDto)).rejects.toThrow('Username already exists');
    });
  });

  describe('PUT /users/:id', () => {
    const updateDto = {
      fullName: 'Updated Name',
      role: 'MECHANIC',
    };

    it('should update user', async () => {
      const updatedUser = { ...mockUser, ...updateDto };
      userService.update.mockResolvedValue(updatedUser as any);

      const result = await controller.update('user-123', updateDto);

      expect(result).toEqual(updatedUser);
      expect(userService.update).toHaveBeenCalledWith('user-123', updateDto);
    });

    it('should handle not found user on update', async () => {
      userService.update.mockRejectedValue(new NotFoundException('User not found'));

      await expect(controller.update('nonexistent', updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete user', async () => {
      userService.delete.mockResolvedValue(undefined);

      const result = await controller.delete('user-123');

      expect(result).toEqual({ success: true });
      expect(userService.delete).toHaveBeenCalledWith('user-123');
    });

    it('should handle not found user on delete', async () => {
      userService.delete.mockRejectedValue(new NotFoundException('User not found'));

      await expect(controller.delete('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
