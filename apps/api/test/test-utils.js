import { Test } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
export function createMockUser(overrides = {}) {
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
export function createMockUserWithoutPassword(overrides = {}) {
    const user = createMockUser(overrides);
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
}
export function generateTestToken(jwtService, payload) {
    return jwtService.sign(payload);
}
export function configureTestApp(app) {
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));
}
export function createMockRepository(methods) {
    const mock = {};
    for (const method of methods) {
        mock[method] = jest.fn();
    }
    return mock;
}
export function createMockService(methods) {
    return createMockRepository(methods);
}
export async function waitFor(condition, timeout = 5000, interval = 100) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
        if (await condition()) {
            return;
        }
        await new Promise((resolve) => setTimeout(resolve, interval));
    }
    throw new Error('waitFor timeout exceeded');
}
export function mockDate(date) {
    jest.useFakeTimers();
    jest.setSystemTime(date);
}
export function restoreDate() {
    jest.useRealTimers();
}
export async function cleanupTestModule(module, app) {
    if (app) {
        await app.close();
    }
    await module.close();
}
export async function createTestModule(imports = [], controllers = [], providers = []) {
    return Test.createTestingModule({
        imports,
        controllers,
        providers,
    }).compile();
}
//# sourceMappingURL=test-utils.js.map