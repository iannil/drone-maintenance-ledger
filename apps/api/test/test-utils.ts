/**
 * Test utilities and helpers
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { User } from '@repo/db';

/**
 * Create a mock user for testing
 */
export function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: 'test-user-id',
    username: 'testuser',
    email: 'test@example.com',
    passwordHash: '$2b$10$hashedpassword',
    fullName: 'Test User',
    role: 'PILOT',
    isActive: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

/**
 * Create a mock user without password hash
 */
export function createMockUserWithoutPassword(
  overrides: Partial<Omit<User, 'passwordHash'>> = {},
): Omit<User, 'passwordHash'> {
  const user = createMockUser(overrides);
  const { passwordHash: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Generate a test JWT token
 */
export function generateTestToken(
  jwtService: JwtService,
  payload: { sub: string; username: string; role: string },
): string {
  return jwtService.sign(payload);
}

/**
 * Configure app with global pipes and settings
 */
export function configureTestApp(app: INestApplication): void {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
}

/**
 * Create a mock repository
 */
export function createMockRepository<T extends object>(methods: (keyof T)[]): jest.Mocked<T> {
  const mock = {} as jest.Mocked<T>;
  for (const method of methods) {
    (mock as Record<keyof T, jest.Mock>)[method] = jest.fn();
  }
  return mock;
}

/**
 * Create a mock service
 */
export function createMockService<T extends object>(methods: (keyof T)[]): jest.Mocked<T> {
  return createMockRepository(methods);
}

/**
 * Wait for a condition to be true (useful for async tests)
 */
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  timeout = 5000,
  interval = 100,
): Promise<void> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  throw new Error('waitFor timeout exceeded');
}

/**
 * Mock dates for consistent testing
 */
export function mockDate(date: Date): void {
  jest.useFakeTimers();
  jest.setSystemTime(date);
}

/**
 * Restore real dates
 */
export function restoreDate(): void {
  jest.useRealTimers();
}

/**
 * Clean up test module
 */
export async function cleanupTestModule(module: TestingModule, app?: INestApplication): Promise<void> {
  if (app) {
    await app.close();
  }
  await module.close();
}

/**
 * Create standard test module with common providers mocked
 */
export async function createTestModule(
  imports: any[] = [],
  controllers: any[] = [],
  providers: any[] = [],
): Promise<TestingModule> {
  return Test.createTestingModule({
    imports,
    controllers,
    providers,
  }).compile();
}
