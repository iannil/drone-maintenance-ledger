/**
 * UserRepository Unit Tests
 *
 * Tests for user database operations
 */

import { Test, TestingModule } from '@nestjs/testing';

import { UserRepository } from './user.repository';
import type { User, NewUser } from '@repo/db';
import { eq } from 'drizzle-orm';

// Mock the db module
jest.mock('@repo/db', () => {
  const mockDb = {
    select: jest.fn(function(this: any) { return this; }),
    insert: jest.fn(function(this: any) { return this; }),
    update: jest.fn(function(this: any) { return this; }),
    delete: jest.fn(function(this: any) { return this; }),
  };

  const user = {
    id: 'mock_id',
    username: 'mock_username',
    email: 'mock_email',
    passwordHash: 'mock_passwordHash',
    role: 'mock_role',
    fullName: 'mock_fullName',
    isActive: 'mock_isActive',
    createdAt: 'mock_createdAt',
    updatedAt: 'mock_updatedAt',
  };

  return {
    db: mockDb,
    user,
  };
});

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password_123'),
  compare: jest.fn().mockResolvedValue(true),
}));

import { db, user } from '@repo/db';
import * as bcrypt from 'bcrypt';

describe('UserRepository', () => {
  let repository: UserRepository;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [UserRepository],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);

    // Default chain mock
    (db.select as jest.Mock).mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue([]),
      }),
    });
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      const mockUser: User = {
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hashed',
        role: 'PILOT',
        fullName: 'Test User',
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockUser]),
        }),
      });

      const result = await repository.findById('user-1');

      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      const result = await repository.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findByUsername', () => {
    it('should return user when username matches', async () => {
      const mockUser: User = {
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hashed',
        role: 'PILOT',
        fullName: 'Test User',
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockUser]),
        }),
      });

      const result = await repository.findByUsername('testuser');

      expect(result).toEqual(mockUser);
    });

    it('should return null when username not found', async () => {
      const result = await repository.findByUsername('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return user when email matches', async () => {
      const mockUser: User = {
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hashed',
        role: 'PILOT',
        fullName: 'Test User',
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockUser]),
        }),
      });

      const result = await repository.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
    });

    it('should return null when email not found', async () => {
      const result = await repository.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create user with hashed password', async () => {
      const newUser = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'plainpassword',
        role: 'PILOT' as const,
        fullName: 'New User',
        isActive: true,
      };

      const createdUser: User = {
        id: 'user-2',
        username: 'newuser',
        email: 'new@example.com',
        passwordHash: 'hashed_password_123',
        role: 'PILOT',
        fullName: 'New User',
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password_123');

      (db.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([createdUser]),
        }),
      });

      const result = await repository.create(newUser);

      expect(result).toEqual(createdUser);
      expect(bcrypt.hash).toHaveBeenCalledWith('plainpassword', 10);
      expect(db.insert).toHaveBeenCalledWith(user);
    });

    it('should use default values for optional fields', async () => {
      const newUser = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'plainpassword',
      };

      const createdUser: User = {
        id: 'user-2',
        username: 'newuser',
        email: 'new@example.com',
        passwordHash: 'hashed_password_123',
        role: 'PILOT',
        fullName: null,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      (db.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([createdUser]),
        }),
      });

      await repository.create(newUser);

      expect(db.insert).toHaveBeenCalledWith(user);
    });

    it('should throw error when creation fails', async () => {
      const newUser = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'plainpassword',
      };

      (db.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([]),
        }),
      });

      await expect(repository.create(newUser)).rejects.toThrow('Failed to create user');
    });
  });

  describe('verifyPassword', () => {
    it('should return true for correct password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await repository.verifyPassword('password', 'hash');

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hash');
    });

    it('should return false for incorrect password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await repository.verifyPassword('wrongpassword', 'hash');

      expect(result).toBe(false);
    });
  });

  describe('update', () => {
    it('should update and return user', async () => {
      const updateData = { fullName: 'Updated Name' };
      const updatedUser: User = {
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hashed',
        role: 'PILOT',
        fullName: 'Updated Name',
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      (db.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([updatedUser]),
          }),
        }),
      });

      const result = await repository.update('user-1', updateData);

      expect(result).toEqual(updatedUser);
      expect(db.update).toHaveBeenCalledWith(user);
    });

    it('should throw error when user not found for update', async () => {
      (db.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      await expect(repository.update('non-existent', { fullName: 'Updated' }))
        .rejects.toThrow('User with id non-existent not found');
    });
  });

  describe('delete', () => {
    it('should delete user', async () => {
      (db.delete as jest.Mock).mockReturnValue({
        where: jest.fn().mockResolvedValue(undefined),
      });

      await expect(repository.delete('user-1')).resolves.toBeUndefined();
      expect(db.delete).toHaveBeenCalledWith(user);
    });
  });

  describe('list', () => {
    it('should return list of users with default pagination', async () => {
      const mockUsers: User[] = [
        {
          id: 'user-1',
          username: 'user1',
          email: 'user1@example.com',
          passwordHash: 'hash1',
          role: 'PILOT',
          fullName: 'User 1',
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        } as User,
        {
          id: 'user-2',
          username: 'user2',
          email: 'user2@example.com',
          passwordHash: 'hash2',
          role: 'MECHANIC',
          fullName: 'User 2',
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        } as User,
      ];

      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            offset: jest.fn().mockResolvedValue(mockUsers),
          }),
        }),
      });

      const result = await repository.list();

      expect(result).toEqual(mockUsers);
    });

    it('should use custom limit and offset', async () => {
      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            offset: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      await repository.list(10, 5);

      expect(db.select).toHaveBeenCalled();
    });
  });
});
