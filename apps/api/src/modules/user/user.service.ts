import { Injectable, ConflictException, NotFoundException } from "@nestjs/common";

import type { User } from "@repo/db";

import { UserRepository } from "./repositories/user.repository";

/**
 * DTOs for user operations
 */
export interface RegisterDto {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  role?: User["role"];
}

export interface UpdateUserDto {
  email?: string;
  fullName?: string;
  role?: User["role"];
  isActive?: boolean;
}

/**
 * User service
 *
 * Handles user business logic
 */
@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  /**
   * Find user by username
   */
  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findByUsername(username);
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  /**
   * Register new user
   */
  async register(dto: RegisterDto): Promise<Omit<User, "passwordHash">> {
    // Check if username already exists
    const existingByUsername = await this.userRepository.findByUsername(dto.username);
    if (existingByUsername) {
      throw new ConflictException("Username already exists");
    }

    // Check if email already exists
    const existingByEmail = await this.userRepository.findByEmail(dto.email);
    if (existingByEmail) {
      throw new ConflictException("Email already exists");
    }

    // Create user
    const user = await this.userRepository.create({
      username: dto.username,
      email: dto.email,
      password: dto.password,
      fullName: dto.fullName,
      role: dto.role,
      isActive: true,
    });

    // Return user without password hash
    const { passwordHash: _unused, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Verify user credentials
   */
  async verifyCredentials(username: string, password: string): Promise<Omit<User, "passwordHash"> | null> {
    const user = await this.userRepository.findByUsername(username);
    if (!user) {
      return null;
    }

    const isValid = await this.userRepository.verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return null;
    }

    const { passwordHash: _unused, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Update user
   */
  async update(id: string, dto: UpdateUserDto): Promise<Omit<User, "passwordHash">> {
    const existing = await this.userRepository.findById(id);
    if (!existing) {
      throw new NotFoundException("User not found");
    }

    // Check email uniqueness if changing email
    if (dto.email && dto.email !== existing.email) {
      const existingByEmail = await this.userRepository.findByEmail(dto.email);
      if (existingByEmail) {
        throw new ConflictException("Email already exists");
      }
    }

    const updated = await this.userRepository.update(id, dto);
    const { passwordHash: _unused, ...userWithoutPassword } = updated;
    return userWithoutPassword;
  }

  /**
   * Delete user
   */
  async delete(id: string): Promise<void> {
    const existing = await this.userRepository.findById(id);
    if (!existing) {
      throw new NotFoundException("User not found");
    }

    await this.userRepository.delete(id);
  }

  /**
   * List all users
   */
  async list(limit: number = 50, offset: number = 0): Promise<Omit<User, "passwordHash">[]> {
    const users = await this.userRepository.list(limit, offset);
    return users.map(({ passwordHash: _unused, ...user }) => user);
  }
}
