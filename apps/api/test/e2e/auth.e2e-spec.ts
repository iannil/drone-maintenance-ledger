/**
 * Authentication E2E Tests
 *
 * Tests the complete authentication flow including:
 * - User registration
 * - User login
 * - Token validation
 * - Profile access
 * - Permission verification
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

import { AuthModule } from '../../src/modules/auth/auth.module';
import { UserModule } from '../../src/modules/user/user.module';
import { UserRepository } from '../../src/modules/user/repositories/user.repository';
import { createMockUser } from '../test-utils';

describe('Authentication E2E', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let userRepository: jest.Mocked<UserRepository>;

  // Test data
  const testPassword = 'TestPass123!';
  const hashedPassword = '$2b$10$abcdefghijklmnopqrstuv'; // Mock hash

  const mockUsers: Map<string, ReturnType<typeof createMockUser>> = new Map();

  const createTestUser = (overrides: Partial<ReturnType<typeof createMockUser>> = {}) => {
    const user = createMockUser({
      passwordHash: hashedPassword,
      ...overrides,
    });
    mockUsers.set(user.id, user);
    mockUsers.set(`username:${user.username}`, user);
    mockUsers.set(`email:${user.email}`, user);
    return user;
  };

  beforeAll(async () => {
    // Create mock repository
    const mockUserRepository = {
      findById: jest.fn().mockImplementation((id: string) => {
        return Promise.resolve(mockUsers.get(id) || null);
      }),
      findByUsername: jest.fn().mockImplementation((username: string) => {
        return Promise.resolve(mockUsers.get(`username:${username}`) || null);
      }),
      findByEmail: jest.fn().mockImplementation((email: string) => {
        return Promise.resolve(mockUsers.get(`email:${email}`) || null);
      }),
      create: jest.fn().mockImplementation((data: any) => {
        const newUser = createMockUser({
          id: `user-${Date.now()}`,
          username: data.username,
          email: data.email,
          fullName: data.fullName || null,
          role: data.role || 'PILOT',
          isActive: true,
        });
        mockUsers.set(newUser.id, newUser);
        mockUsers.set(`username:${newUser.username}`, newUser);
        mockUsers.set(`email:${newUser.email}`, newUser);
        return Promise.resolve(newUser);
      }),
      verifyPassword: jest.fn().mockImplementation((plain: string, hashed: string) => {
        // Simple mock: password matches if plain is 'TestPass123!'
        return Promise.resolve(plain === testPassword);
      }),
      update: jest.fn(),
      delete: jest.fn(),
      list: jest.fn().mockResolvedValue([]),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: [],
          load: [
            () => ({
              JWT_SECRET: 'test-jwt-secret-key-for-e2e-testing',
              JWT_EXPIRES_IN: '1h',
            }),
          ],
        }),
        ThrottlerModule.forRoot([
          { name: 'short', ttl: 1000, limit: 100 },
          { name: 'medium', ttl: 60000, limit: 1000 },
          { name: 'long', ttl: 3600000, limit: 10000 },
        ]),
        AuthModule,
        UserModule,
      ],
    })
      .overrideProvider(UserRepository)
      .useValue(mockUserRepository)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();

    jwtService = moduleFixture.get<JwtService>(JwtService);
    userRepository = moduleFixture.get(UserRepository);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    // Clear mock users before each test
    mockUsers.clear();
    jest.clearAllMocks();
  });

  describe('POST /auth/register', () => {
    it('should register a new user and return token', async () => {
      const registerDto = {
        username: 'newuser',
        email: 'new@example.com',
        password: testPassword,
        fullName: 'New User',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.username).toBe(registerDto.username);
      expect(response.body.user.email).toBe(registerDto.email);
      expect(response.body.user).not.toHaveProperty('passwordHash');
    });

    it('should reject registration with existing username', async () => {
      createTestUser({ username: 'existinguser', email: 'existing@example.com' });

      const registerDto = {
        username: 'existinguser',
        email: 'another@example.com',
        password: testPassword,
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(409);
    });

    it('should reject registration with existing email', async () => {
      createTestUser({ username: 'user1', email: 'taken@example.com' });

      const registerDto = {
        username: 'anotheruser',
        email: 'taken@example.com',
        password: testPassword,
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(409);
    });

    it('should reject registration with invalid email', async () => {
      const registerDto = {
        username: 'testuser',
        email: 'invalid-email',
        password: testPassword,
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(400);
    });

    it('should reject registration with missing required fields', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ username: 'testuser' })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should login with valid credentials and return token', async () => {
      const user = createTestUser({
        username: 'loginuser',
        email: 'login@example.com',
      });

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: user.username, password: testPassword })
        .expect(201); // NestJS POST default status

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.username).toBe(user.username);
    });

    it('should reject login with wrong password', async () => {
      createTestUser({
        username: 'wrongpassuser',
        email: 'wrongpass@example.com',
      });

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'wrongpassuser', password: 'wrongpassword' })
        .expect(401);
    });

    it('should reject login for non-existent user', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'nonexistent', password: testPassword })
        .expect(401);
    });

    it('should reject login for disabled user', async () => {
      createTestUser({
        username: 'disableduser',
        email: 'disabled@example.com',
        isActive: false,
      });

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'disableduser', password: testPassword })
        .expect(401);
    });

    it('should reject login with missing credentials', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'testuser' })
        .expect(400);
    });
  });

  describe('GET /auth/profile', () => {
    it('should return user profile with valid token', async () => {
      const user = createTestUser({
        username: 'profileuser',
        email: 'profile@example.com',
        role: 'PILOT',
      });

      const token = jwtService.sign({
        sub: user.id,
        username: user.username,
        role: user.role,
      });

      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', user.id);
      expect(response.body).toHaveProperty('username', user.username);
      expect(response.body).toHaveProperty('email', user.email);
      expect(response.body).toHaveProperty('role', user.role);
      expect(response.body).not.toHaveProperty('passwordHash');
    });

    it('should reject access without token', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .expect(401);
    });

    it('should reject access with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should reject access with expired token', async () => {
      const user = createTestUser();

      // Create an expired token (sign with very short expiration)
      const expiredToken = jwtService.sign(
        { sub: user.id, username: user.username, role: user.role },
        { expiresIn: '0s' },
      );

      // Wait a moment for token to expire
      await new Promise((resolve) => setTimeout(resolve, 100));

      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });

    it('should reject access for deleted user (token still valid but user not found)', async () => {
      const user = createTestUser({
        id: 'deleted-user-id',
        username: 'deleteduser',
        email: 'deleted@example.com',
      });

      const token = jwtService.sign({
        sub: user.id,
        username: user.username,
        role: user.role,
      });

      // Remove user from mock storage
      mockUsers.delete(user.id);
      mockUsers.delete(`username:${user.username}`);
      mockUsers.delete(`email:${user.email}`);

      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(401);
    });

    it('should reject access for disabled user (token valid but account disabled)', async () => {
      const user = createTestUser({
        id: 'disabled-user-id',
        username: 'disabledprofile',
        email: 'disabledprofile@example.com',
        isActive: true, // Start active
      });

      const token = jwtService.sign({
        sub: user.id,
        username: user.username,
        role: user.role,
      });

      // Disable user after token was created
      user.isActive = false;
      mockUsers.set(user.id, user);

      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(401);
    });
  });

  describe('Complete Registration → Login → Profile Flow', () => {
    it('should complete full authentication flow', async () => {
      // Step 1: Register
      const registerDto = {
        username: 'flowuser',
        email: 'flow@example.com',
        password: testPassword,
        fullName: 'Flow Test User',
        role: 'MECHANIC',
      };

      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      expect(registerResponse.body).toHaveProperty('accessToken');
      const registeredUserId = registerResponse.body.user.id;

      // Step 2: Login with registered credentials
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: registerDto.username, password: registerDto.password })
        .expect(201); // NestJS POST default status

      expect(loginResponse.body).toHaveProperty('accessToken');
      const loginToken = loginResponse.body.accessToken;

      // Step 3: Access profile with login token
      const profileResponse = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${loginToken}`)
        .expect(200);

      expect(profileResponse.body.id).toBe(registeredUserId);
      expect(profileResponse.body.username).toBe(registerDto.username);
      expect(profileResponse.body.email).toBe(registerDto.email);
    });
  });

  describe('Role-based Access Verification', () => {
    const testRoles = ['PILOT', 'MECHANIC', 'INSPECTOR', 'MANAGER', 'ADMIN'] as const;

    testRoles.forEach((role) => {
      it(`should correctly identify user with ${role} role`, async () => {
        const user = createTestUser({
          username: `${role.toLowerCase()}user`,
          email: `${role.toLowerCase()}@example.com`,
          role,
        });

        const token = jwtService.sign({
          sub: user.id,
          username: user.username,
          role: user.role,
        });

        const response = await request(app.getHttpServer())
          .get('/auth/profile')
          .set('Authorization', `Bearer ${token}`)
          .expect(200);

        expect(response.body.role).toBe(role);
      });
    });
  });

  describe('Token Validation Edge Cases', () => {
    it('should handle malformed Authorization header', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'NotBearer token')
        .expect(401);
    });

    it('should handle empty Bearer token', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer ')
        .expect(401);
    });

    it('should handle token with wrong secret', async () => {
      const wrongJwtService = new JwtService({ secret: 'wrong-secret' });
      const fakeToken = wrongJwtService.sign({
        sub: 'user-123',
        username: 'fakeuser',
        role: 'ADMIN',
      });

      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${fakeToken}`)
        .expect(401);
    });
  });
});
