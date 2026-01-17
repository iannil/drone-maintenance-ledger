import { TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { User } from '@repo/db';
export declare function createMockUser(overrides?: Partial<User>): User;
export declare function createMockUserWithoutPassword(overrides?: Partial<Omit<User, 'passwordHash'>>): Omit<User, 'passwordHash'>;
export declare function generateTestToken(jwtService: JwtService, payload: {
    sub: string;
    username: string;
    role: string;
}): string;
export declare function configureTestApp(app: INestApplication): void;
export declare function createMockRepository<T extends object>(methods: (keyof T)[]): jest.Mocked<T>;
export declare function createMockService<T extends object>(methods: (keyof T)[]): jest.Mocked<T>;
export declare function waitFor(condition: () => boolean | Promise<boolean>, timeout?: number, interval?: number): Promise<void>;
export declare function mockDate(date: Date): void;
export declare function restoreDate(): void;
export declare function cleanupTestModule(module: TestingModule, app?: INestApplication): Promise<void>;
export declare function createTestModule(imports?: any[], controllers?: any[], providers?: any[]): Promise<TestingModule>;
//# sourceMappingURL=test-utils.d.ts.map