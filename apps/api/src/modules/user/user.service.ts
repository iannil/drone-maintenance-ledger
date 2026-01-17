import { Injectable, ConflictException, NotFoundException, Inject } from "@nestjs/common";
import { IsString, IsEmail, IsOptional, IsBoolean, IsNotEmpty, IsIn } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import type { User } from "@repo/db";

import { UserRepository } from "./repositories/user.repository";

/**
 * DTO for user registration
 */
export class RegisterDto {
  @ApiProperty({ description: "用户名", example: "john_doe" })
  @IsString()
  @IsNotEmpty()
  username!: string;

  @ApiProperty({ description: "邮箱地址", example: "john@example.com" })
  @IsEmail()
  email!: string;

  @ApiProperty({ description: "密码", example: "SecurePass123!" })
  @IsString()
  @IsNotEmpty()
  password!: string;

  @ApiPropertyOptional({ description: "用户全名", example: "John Doe" })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiPropertyOptional({
    description: "用户角色",
    enum: ["ADMIN", "MECHANIC", "PILOT", "INSPECTOR", "MANAGER"],
    example: "PILOT",
  })
  @IsString()
  @IsOptional()
  @IsIn(["ADMIN", "MECHANIC", "PILOT", "INSPECTOR", "MANAGER"])
  role?: string;
}

/**
 * DTO for updating user
 */
export class UpdateUserDto {
  @ApiPropertyOptional({ description: "邮箱地址", example: "john@example.com" })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: "用户全名", example: "John Doe" })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiPropertyOptional({
    description: "用户角色",
    enum: ["ADMIN", "MECHANIC", "PILOT", "INSPECTOR", "MANAGER"],
    example: "PILOT",
  })
  @IsString()
  @IsOptional()
  @IsIn(["ADMIN", "MECHANIC", "PILOT", "INSPECTOR", "MANAGER"])
  role?: string;

  @ApiPropertyOptional({ description: "是否激活", example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

/**
 * User service
 *
 * Handles user business logic
 */
@Injectable()
export class UserService {
  private userRepo: UserRepository;

  constructor(@Inject(UserRepository) userRepository: UserRepository) {
    this.userRepo = userRepository;
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    return this.userRepo.findById(id);
  }

  /**
   * Find user by username
   */
  async findByUsername(username: string): Promise<User | null> {
    return this.userRepo.findByUsername(username);
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findByEmail(email);
  }

  /**
   * Register new user
   */
  async register(dto: RegisterDto): Promise<Omit<User, "passwordHash">> {
    // Check if username already exists
    const existingByUsername = await this.userRepo.findByUsername(dto.username);
    if (existingByUsername) {
      throw new ConflictException("Username already exists");
    }

    // Check if email already exists
    const existingByEmail = await this.userRepo.findByEmail(dto.email);
    if (existingByEmail) {
      throw new ConflictException("Email already exists");
    }

    // Create user
    const user = await this.userRepo.create({
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
    const user = await this.userRepo.findByUsername(username);
    if (!user) {
      return null;
    }

    const isValid = await this.userRepo.verifyPassword(password, user.passwordHash);
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
    const existing = await this.userRepo.findById(id);
    if (!existing) {
      throw new NotFoundException("User not found");
    }

    // Check email uniqueness if changing email
    if (dto.email && dto.email !== existing.email) {
      const existingByEmail = await this.userRepo.findByEmail(dto.email);
      if (existingByEmail) {
        throw new ConflictException("Email already exists");
      }
    }

    const updated = await this.userRepo.update(id, dto);
    const { passwordHash: _unused, ...userWithoutPassword } = updated;
    return userWithoutPassword;
  }

  /**
   * Delete user
   */
  async delete(id: string): Promise<void> {
    const existing = await this.userRepo.findById(id);
    if (!existing) {
      throw new NotFoundException("User not found");
    }

    await this.userRepo.delete(id);
  }

  /**
   * List all users
   */
  async list(limit: number = 50, offset: number = 0): Promise<Omit<User, "passwordHash">[]> {
    const users = await this.userRepo.list(limit, offset);
    return users.map(({ passwordHash: _unused, ...user }) => user);
  }
}
