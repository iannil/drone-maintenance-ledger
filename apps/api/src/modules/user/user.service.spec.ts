import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';

import { UserService } from './user.service';
import { UserRepository } from './repositories/user.repository';
import { createMockUser, createMockUserWithoutPassword } from '../../../test/test-utils';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: jest.Mocked<UserRepository>;

  const mockUser = createMockUser({
    id: 'user-123',
    username: 'testuser',
    email: 'test@example.com',
  });

  beforeEach(async () => {
    const mockUserRepository = {
      findById: jest.fn(),
      findByUsername: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      list: jest.fn(),
      verifyPassword: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, { provide: UserRepository, useValue: mockUserRepository }],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get(UserRepository);
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      userRepository.findById.mockResolvedValue(mockUser);

      const result = await userService.findById('user-123');

      expect(result).toEqual(mockUser);
      expect(userRepository.findById).toHaveBeenCalledWith('user-123');
    });

    it('should return null when user not found', async () => {
      userRepository.findById.mockResolvedValue(null);

      const result = await userService.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findByUsername', () => {
    it('should return user when found', async () => {
      userRepository.findByUsername.mockResolvedValue(mockUser);

      const result = await userService.findByUsername('testuser');

      expect(result).toEqual(mockUser);
      expect(userRepository.findByUsername).toHaveBeenCalledWith('testuser');
    });
  });

  describe('register', () => {
    const registerDto = {
      username: 'newuser',
      email: 'new@example.com',
      password: 'password123',
      fullName: 'New User',
    };

    it('should create user successfully when username and email are unique', async () => {
      const newUser = createMockUser({ id: 'new-user-id', ...registerDto });
      userRepository.findByUsername.mockResolvedValue(null);
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockResolvedValue(newUser);

      const result = await userService.register(registerDto);

      expect(result).not.toHaveProperty('passwordHash');
      expect(result.username).toBe(registerDto.username);
      expect(userRepository.create).toHaveBeenCalled();
    });

    it('should throw ConflictException when username already exists', async () => {
      userRepository.findByUsername.mockResolvedValue(mockUser);

      await expect(userService.register(registerDto)).rejects.toThrow(ConflictException);
      expect(userRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when email already exists', async () => {
      userRepository.findByUsername.mockResolvedValue(null);
      userRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(userService.register(registerDto)).rejects.toThrow(ConflictException);
      expect(userRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('verifyCredentials', () => {
    it('should return user without password when credentials are valid', async () => {
      userRepository.findByUsername.mockResolvedValue(mockUser);
      userRepository.verifyPassword.mockResolvedValue(true);

      const result = await userService.verifyCredentials('testuser', 'password123');

      expect(result).not.toBeNull();
      expect(result).not.toHaveProperty('passwordHash');
      expect(result?.username).toBe('testuser');
    });

    it('should return null when user not found', async () => {
      userRepository.findByUsername.mockResolvedValue(null);

      const result = await userService.verifyCredentials('nonexistent', 'password123');

      expect(result).toBeNull();
    });

    it('should return null when password is incorrect', async () => {
      userRepository.findByUsername.mockResolvedValue(mockUser);
      userRepository.verifyPassword.mockResolvedValue(false);

      const result = await userService.verifyCredentials('testuser', 'wrongpassword');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    const updateDto = { email: 'updated@example.com', fullName: 'Updated Name' };

    it('should update user successfully', async () => {
      const updatedUser = createMockUser({ ...mockUser, ...updateDto });
      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.update.mockResolvedValue(updatedUser);

      const result = await userService.update('user-123', updateDto);

      expect(result).not.toHaveProperty('passwordHash');
      expect(result.email).toBe(updateDto.email);
      expect(userRepository.update).toHaveBeenCalledWith('user-123', updateDto);
    });

    it('should throw NotFoundException when user not found', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(userService.update('non-existent', updateDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when new email already exists', async () => {
      const otherUser = createMockUser({ id: 'other-user', email: 'updated@example.com' });
      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.findByEmail.mockResolvedValue(otherUser);

      await expect(userService.update('user-123', updateDto)).rejects.toThrow(ConflictException);
    });

    it('should allow update when email unchanged', async () => {
      const updateWithSameEmail = { email: mockUser.email, fullName: 'Updated Name' };
      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.update.mockResolvedValue({ ...mockUser, ...updateWithSameEmail });

      const result = await userService.update('user-123', updateWithSameEmail);

      expect(result.fullName).toBe('Updated Name');
      expect(userRepository.findByEmail).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete user successfully', async () => {
      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.delete.mockResolvedValue(undefined);

      await expect(userService.delete('user-123')).resolves.toBeUndefined();
      expect(userRepository.delete).toHaveBeenCalledWith('user-123');
    });

    it('should throw NotFoundException when user not found', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(userService.delete('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('list', () => {
    it('should return list of users without passwords', async () => {
      const users = [
        createMockUser({ id: 'user-1', username: 'user1' }),
        createMockUser({ id: 'user-2', username: 'user2' }),
      ];
      userRepository.list.mockResolvedValue(users);

      const result = await userService.list(10, 0);

      expect(result).toHaveLength(2);
      result.forEach((user) => {
        expect(user).not.toHaveProperty('passwordHash');
      });
      expect(userRepository.list).toHaveBeenCalledWith(10, 0);
    });

    it('should use default pagination values', async () => {
      userRepository.list.mockResolvedValue([]);

      await userService.list();

      expect(userRepository.list).toHaveBeenCalledWith(50, 0);
    });
  });
});
