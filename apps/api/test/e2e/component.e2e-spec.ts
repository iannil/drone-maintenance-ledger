/**
 * Component Flow E2E Tests
 *
 * Tests the complete component lifecycle including:
 * - Create component
 * - Install component on aircraft
 * - Remove component from aircraft
 * - Transfer component between aircraft
 * - Scrap component
 * - Role-based access control
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

import { AssetModule } from '../../src/modules/asset/asset.module';
import { AuthModule } from '../../src/modules/auth/auth.module';
import { UserModule } from '../../src/modules/user/user.module';
import { ComponentRepository } from '../../src/modules/asset/repositories/component.repository';
import { AircraftRepository } from '../../src/modules/asset/repositories/aircraft.repository';
import { FleetRepository } from '../../src/modules/asset/repositories/fleet.repository';
import { UserRepository } from '../../src/modules/user/repositories/user.repository';
import { createMockUser } from '../test-utils';

describe('Component Flow E2E', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  // In-memory mock data storage
  const components: Map<string, any> = new Map();
  const installations: Map<string, any> = new Map();
  const mockUsers: Map<string, any> = new Map();
  const mockAircraft: Map<string, any> = new Map();

  let componentCounter = 0;
  let installationCounter = 0;

  // Test users for different roles
  const adminUser = createMockUser({
    id: 'admin-user-id',
    username: 'admin',
    email: 'admin@example.com',
    role: 'ADMIN',
  });

  const managerUser = createMockUser({
    id: 'manager-user-id',
    username: 'manager',
    email: 'manager@example.com',
    role: 'MANAGER',
  });

  const mechanicUser = createMockUser({
    id: 'mechanic-user-id',
    username: 'mechanic',
    email: 'mechanic@example.com',
    role: 'MECHANIC',
  });

  const pilotUser = createMockUser({
    id: 'pilot-user-id',
    username: 'pilot',
    email: 'pilot@example.com',
    role: 'PILOT',
  });

  // Test aircraft
  const aircraftA = {
    id: 'aircraft-a',
    registrationNumber: 'N-ALPHA',
    serialNumber: 'SN-A001',
    model: 'DJI Matrice 300',
    manufacturer: 'DJI',
    status: 'ACTIVE',
    totalFlightHours: 100,
    totalCycles: 150,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const aircraftB = {
    id: 'aircraft-b',
    registrationNumber: 'N-BETA',
    serialNumber: 'SN-B001',
    model: 'DJI Matrice 300',
    manufacturer: 'DJI',
    status: 'ACTIVE',
    totalFlightHours: 80,
    totalCycles: 100,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  beforeAll(async () => {
    // Initialize test data
    [adminUser, managerUser, mechanicUser, pilotUser].forEach((user) => {
      mockUsers.set(user.id, user);
      mockUsers.set(`username:${user.username}`, user);
    });
    mockAircraft.set(aircraftA.id, aircraftA);
    mockAircraft.set(aircraftB.id, aircraftB);

    // Helper to get current installation for a component
    const getCurrentInstallation = (componentId: string) => {
      const allInstallations = Array.from(installations.values());
      return allInstallations.find((i) => i.componentId === componentId && i.removedAt === null);
    };

    // Mock repositories
    const mockComponentRepository = {
      findById: jest.fn().mockImplementation((id: string) => Promise.resolve(components.get(id) || null)),
      findBySerialNumber: jest.fn().mockImplementation((serialNumber: string) => {
        const result = Array.from(components.values()).find((c) => c.serialNumber === serialNumber);
        return Promise.resolve(result || null);
      }),
      findBySerialWithInstallation: jest.fn().mockImplementation((serialNumber: string) => {
        const component = Array.from(components.values()).find((c) => c.serialNumber === serialNumber);
        if (!component) return Promise.resolve(null);
        const currentInstall = getCurrentInstallation(component.id);
        return Promise.resolve({
          ...component,
          currentInstallation: currentInstall || null,
        });
      }),
      list: jest.fn().mockImplementation((limit: number, offset: number) => {
        const all = Array.from(components.values());
        return Promise.resolve(all.slice(offset, offset + limit));
      }),
      findInstalledOnAircraft: jest.fn().mockImplementation((aircraftId: string) => {
        const installedComponentIds = Array.from(installations.values())
          .filter((i) => i.aircraftId === aircraftId && i.removedAt === null)
          .map((i) => i.componentId);
        const result = Array.from(components.values()).filter((c) => installedComponentIds.includes(c.id));
        return Promise.resolve(result);
      }),
      findDueForMaintenance: jest.fn().mockImplementation(() => {
        const result = Array.from(components.values()).filter(
          (c) => c.isLifeLimited && c.maxFlightHours && c.totalFlightHours >= c.maxFlightHours * 0.9,
        );
        return Promise.resolve(result);
      }),
      create: jest.fn().mockImplementation((data: any) => {
        componentCounter++;
        const id = `comp-${Date.now()}-${componentCounter}`;
        const component = {
          id,
          ...data,
          status: data.status || 'NEW',
          isAirworthy: data.isAirworthy ?? true,
          isLifeLimited: data.isLifeLimited ?? false,
          totalFlightHours: data.totalFlightHours ?? 0,
          totalFlightCycles: data.totalFlightCycles ?? 0,
          batteryCycles: data.batteryCycles ?? 0,
          currentAircraftId: null,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        components.set(id, component);
        return Promise.resolve(component);
      }),
      update: jest.fn().mockImplementation((id: string, data: any) => {
        const existing = components.get(id);
        if (!existing) return Promise.resolve(null);
        const updated = { ...existing, ...data, updatedAt: Date.now() };
        components.set(id, updated);
        return Promise.resolve(updated);
      }),
      delete: jest.fn().mockImplementation((id: string) => {
        components.delete(id);
        return Promise.resolve();
      }),
      getCurrentInstallation: jest.fn().mockImplementation((componentId: string) => {
        return Promise.resolve(getCurrentInstallation(componentId) || null);
      }),
      install: jest.fn().mockImplementation(
        (componentId: string, aircraftId: string, location: string, notes?: string) => {
          installationCounter++;
          const id = `install-${Date.now()}-${installationCounter}`;
          const component = components.get(componentId);
          const installation = {
            id,
            componentId,
            aircraftId,
            location,
            installNotes: notes || null,
            installedAt: Date.now(),
            installedHours: component?.totalFlightHours || 0,
            installedCycles: component?.totalFlightCycles || 0,
            removedAt: null,
            removeNotes: null,
          };
          installations.set(id, installation);

          // Update component's currentAircraftId
          if (component) {
            component.currentAircraftId = aircraftId;
            component.status = 'IN_USE';
            components.set(componentId, component);
          }

          return Promise.resolve(installation);
        },
      ),
      remove: jest.fn().mockImplementation((componentId: string, notes?: string) => {
        const currentInstall = getCurrentInstallation(componentId);
        if (currentInstall) {
          currentInstall.removedAt = Date.now();
          currentInstall.removeNotes = notes || null;
          installations.set(currentInstall.id, currentInstall);

          // Update component
          const component = components.get(componentId);
          if (component) {
            component.currentAircraftId = null;
            component.status = 'REMOVED';
            components.set(componentId, component);
          }
        }
        return Promise.resolve();
      }),
      getInstallationHistory: jest.fn().mockImplementation((componentId: string) => {
        const result = Array.from(installations.values())
          .filter((i) => i.componentId === componentId)
          .sort((a, b) => b.installedAt - a.installedAt);
        return Promise.resolve(result);
      }),
    };

    const mockAircraftRepository = {
      findById: jest.fn().mockImplementation((id: string) => Promise.resolve(mockAircraft.get(id) || null)),
      list: jest.fn().mockResolvedValue(Array.from(mockAircraft.values())),
    };

    const mockFleetRepository = {
      findById: jest.fn().mockResolvedValue(null),
      list: jest.fn().mockResolvedValue([]),
    };

    const mockUserRepository = {
      findById: jest.fn().mockImplementation((id: string) => Promise.resolve(mockUsers.get(id) || null)),
      findByUsername: jest.fn().mockImplementation((username: string) =>
        Promise.resolve(mockUsers.get(`username:${username}`) || null),
      ),
      verifyPassword: jest.fn().mockResolvedValue(true),
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
        AssetModule,
      ],
    })
      .overrideProvider(ComponentRepository)
      .useValue(mockComponentRepository)
      .overrideProvider(AircraftRepository)
      .useValue(mockAircraftRepository)
      .overrideProvider(FleetRepository)
      .useValue(mockFleetRepository)
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
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    // Clear components and installations before each test
    components.clear();
    installations.clear();
    componentCounter = 0;
    installationCounter = 0;
  });

  // Helper function to generate tokens for different roles
  const getToken = (user: ReturnType<typeof createMockUser>) =>
    jwtService.sign({ sub: user.id, username: user.username, role: user.role });

  describe('POST /components (Create Component)', () => {
    it('should create a component with MECHANIC role', async () => {
      const token = getToken(mechanicUser);
      const createDto = {
        serialNumber: 'SN-MOTOR-001',
        partNumber: 'PN-MOT-001',
        type: 'MOTOR',
        manufacturer: 'T-Motor',
        model: 'U13 KV100',
        description: 'High performance motor',
      };

      const response = await request(app.getHttpServer())
        .post('/components')
        .set('Authorization', `Bearer ${token}`)
        .send(createDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.serialNumber).toBe(createDto.serialNumber);
      expect(response.body.status).toBe('NEW');
      expect(response.body.isAirworthy).toBe(true);
      expect(response.body.totalFlightHours).toBe(0);
    });

    it('should reject duplicate serial number', async () => {
      const token = getToken(mechanicUser);
      const createDto = {
        serialNumber: 'SN-DUP-001',
        partNumber: 'PN-001',
        type: 'MOTOR',
        manufacturer: 'Test',
      };

      // Create first component
      await request(app.getHttpServer())
        .post('/components')
        .set('Authorization', `Bearer ${token}`)
        .send(createDto)
        .expect(201);

      // Try to create duplicate
      await request(app.getHttpServer())
        .post('/components')
        .set('Authorization', `Bearer ${token}`)
        .send(createDto)
        .expect(409);
    });

    it('should reject creation by PILOT role', async () => {
      const token = getToken(pilotUser);
      const createDto = {
        serialNumber: 'SN-TEST',
        partNumber: 'PN-TEST',
        type: 'MOTOR',
        manufacturer: 'Test',
      };

      await request(app.getHttpServer())
        .post('/components')
        .set('Authorization', `Bearer ${token}`)
        .send(createDto)
        .expect(403);
    });
  });

  describe('POST /components/install (Install Component)', () => {
    let componentId: string;

    beforeEach(async () => {
      // Create a component for testing
      const token = getToken(mechanicUser);
      const response = await request(app.getHttpServer())
        .post('/components')
        .set('Authorization', `Bearer ${token}`)
        .send({
          serialNumber: `SN-${Date.now()}`,
          partNumber: 'PN-MOT-001',
          type: 'MOTOR',
          manufacturer: 'T-Motor',
        })
        .expect(201);

      componentId = response.body.id;
    });

    it('should install component on aircraft', async () => {
      const token = getToken(mechanicUser);

      const response = await request(app.getHttpServer())
        .post('/components/install')
        .set('Authorization', `Bearer ${token}`)
        .send({
          componentId,
          aircraftId: aircraftA.id,
          location: '前左电机',
          installNotes: '安装完成，已测试',
        })
        .expect(201);

      expect(response.body).toHaveProperty('componentId', componentId);
      expect(response.body).toHaveProperty('aircraftId', aircraftA.id);
      expect(response.body).toHaveProperty('message');
    });

    it('should update component status to IN_USE after install', async () => {
      const token = getToken(mechanicUser);

      // Install
      await request(app.getHttpServer())
        .post('/components/install')
        .set('Authorization', `Bearer ${token}`)
        .send({
          componentId,
          aircraftId: aircraftA.id,
          location: '前左电机',
        })
        .expect(201);

      // Verify component status
      const component = await request(app.getHttpServer())
        .get(`/components/${componentId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(component.body.status).toBe('IN_USE');
    });

    it('should reject PILOT from installing component', async () => {
      const token = getToken(pilotUser);

      await request(app.getHttpServer())
        .post('/components/install')
        .set('Authorization', `Bearer ${token}`)
        .send({
          componentId,
          aircraftId: aircraftA.id,
          location: '前左电机',
        })
        .expect(403);
    });
  });

  describe('POST /components/remove (Remove Component)', () => {
    let componentId: string;

    beforeEach(async () => {
      const token = getToken(mechanicUser);

      // Create and install a component
      const createResponse = await request(app.getHttpServer())
        .post('/components')
        .set('Authorization', `Bearer ${token}`)
        .send({
          serialNumber: `SN-REM-${Date.now()}`,
          partNumber: 'PN-MOT-001',
          type: 'MOTOR',
          manufacturer: 'T-Motor',
        })
        .expect(201);

      componentId = createResponse.body.id;

      await request(app.getHttpServer())
        .post('/components/install')
        .set('Authorization', `Bearer ${token}`)
        .send({
          componentId,
          aircraftId: aircraftA.id,
          location: '前左电机',
        })
        .expect(201);
    });

    it('should remove installed component', async () => {
      const token = getToken(mechanicUser);

      const response = await request(app.getHttpServer())
        .post('/components/remove')
        .set('Authorization', `Bearer ${token}`)
        .send({
          componentId,
          removeNotes: '常规维护拆卸',
        })
        .expect(201);

      expect(response.body).toHaveProperty('componentId', componentId);
      expect(response.body).toHaveProperty('message');
    });

    it('should update component status to NEW (available) after removal', async () => {
      const token = getToken(mechanicUser);

      // Remove
      await request(app.getHttpServer())
        .post('/components/remove')
        .set('Authorization', `Bearer ${token}`)
        .send({ componentId })
        .expect(201);

      // Verify component status - removed components become NEW (available)
      const component = await request(app.getHttpServer())
        .get(`/components/${componentId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(component.body.status).toBe('NEW');
    });
  });

  describe('Component Transfer Flow', () => {
    let componentId: string;

    beforeEach(async () => {
      const token = getToken(mechanicUser);

      // Create a component
      const createResponse = await request(app.getHttpServer())
        .post('/components')
        .set('Authorization', `Bearer ${token}`)
        .send({
          serialNumber: `SN-XFER-${Date.now()}`,
          partNumber: 'PN-MOT-001',
          type: 'MOTOR',
          manufacturer: 'T-Motor',
        })
        .expect(201);

      componentId = createResponse.body.id;
    });

    it('should transfer component from aircraft A to aircraft B', async () => {
      const token = getToken(mechanicUser);

      // Install on aircraft A
      await request(app.getHttpServer())
        .post('/components/install')
        .set('Authorization', `Bearer ${token}`)
        .send({
          componentId,
          aircraftId: aircraftA.id,
          location: '前左电机',
        })
        .expect(201);

      // Verify installed on A
      let component = await request(app.getHttpServer())
        .get(`/components/${componentId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(component.body.status).toBe('IN_USE');
      expect(component.body.currentAircraftId).toBe(aircraftA.id);

      // Install directly on aircraft B (should auto-remove from A)
      await request(app.getHttpServer())
        .post('/components/install')
        .set('Authorization', `Bearer ${token}`)
        .send({
          componentId,
          aircraftId: aircraftB.id,
          location: '前右电机',
          installNotes: '从 A 转移到 B',
        })
        .expect(201);

      // Verify now on B
      component = await request(app.getHttpServer())
        .get(`/components/${componentId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(component.body.status).toBe('IN_USE');
      expect(component.body.currentAircraftId).toBe(aircraftB.id);
    });
  });

  describe('PUT /components/:id (Update Component)', () => {
    let componentId: string;

    beforeEach(async () => {
      const token = getToken(mechanicUser);
      const response = await request(app.getHttpServer())
        .post('/components')
        .set('Authorization', `Bearer ${token}`)
        .send({
          serialNumber: `SN-UPD-${Date.now()}`,
          partNumber: 'PN-MOT-001',
          type: 'MOTOR',
          manufacturer: 'T-Motor',
        })
        .expect(201);

      componentId = response.body.id;
    });

    it('should update component information', async () => {
      const token = getToken(mechanicUser);

      const response = await request(app.getHttpServer())
        .put(`/components/${componentId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          description: 'Updated description',
          model: 'U13 KV100 V2',
        })
        .expect(200);

      expect(response.body.description).toBe('Updated description');
      expect(response.body.model).toBe('U13 KV100 V2');
    });

    it('should mark component as scrapped', async () => {
      const token = getToken(mechanicUser);

      const response = await request(app.getHttpServer())
        .put(`/components/${componentId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          status: 'SCRAPPED',
          isAirworthy: false,
        })
        .expect(200);

      expect(response.body.status).toBe('SCRAPPED');
      expect(response.body.isAirworthy).toBe(false);
    });
  });

  describe('GET /components (List Components)', () => {
    beforeEach(async () => {
      const token = getToken(mechanicUser);

      // Create some components
      for (let i = 1; i <= 3; i++) {
        await request(app.getHttpServer())
          .post('/components')
          .set('Authorization', `Bearer ${token}`)
          .send({
            serialNumber: `SN-LIST-${i}`,
            partNumber: `PN-${i}`,
            type: 'MOTOR',
            manufacturer: 'Test',
          })
          .expect(201);
      }
    });

    it('should list all components', async () => {
      const token = getToken(mechanicUser);

      const response = await request(app.getHttpServer())
        .get('/components')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveLength(3);
    });

    it('should allow PILOT to read component list', async () => {
      const token = getToken(pilotUser);

      const response = await request(app.getHttpServer())
        .get('/components')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /components?aircraftId (Components by Aircraft)', () => {
    beforeEach(async () => {
      const token = getToken(mechanicUser);

      // Create and install components on aircraft A
      for (let i = 1; i <= 2; i++) {
        const createResponse = await request(app.getHttpServer())
          .post('/components')
          .set('Authorization', `Bearer ${token}`)
          .send({
            serialNumber: `SN-AC-${i}`,
            partNumber: `PN-${i}`,
            type: 'MOTOR',
            manufacturer: 'Test',
          })
          .expect(201);

        await request(app.getHttpServer())
          .post('/components/install')
          .set('Authorization', `Bearer ${token}`)
          .send({
            componentId: createResponse.body.id,
            aircraftId: aircraftA.id,
            location: `Position ${i}`,
          })
          .expect(201);
      }
    });

    it('should list components installed on specific aircraft', async () => {
      const token = getToken(mechanicUser);

      const response = await request(app.getHttpServer())
        .get(`/components?aircraftId=${aircraftA.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveLength(2);
      response.body.forEach((comp: any) => {
        expect(comp.currentAircraftId).toBe(aircraftA.id);
      });
    });
  });

  describe('Complete Component Lifecycle E2E', () => {
    it('should complete full component lifecycle', async () => {
      const mechanicToken = getToken(mechanicUser);
      const managerToken = getToken(managerUser);

      // Step 1: Create a new component
      const createResponse = await request(app.getHttpServer())
        .post('/components')
        .set('Authorization', `Bearer ${mechanicToken}`)
        .send({
          serialNumber: 'SN-LIFECYCLE-001',
          partNumber: 'PN-MOT-001',
          type: 'MOTOR',
          manufacturer: 'T-Motor',
          model: 'U13 KV100',
          isLifeLimited: true,
          maxFlightHours: 500,
          maxCycles: 1000,
        })
        .expect(201);

      const componentId = createResponse.body.id;
      expect(createResponse.body.status).toBe('NEW');

      // Step 2: Install on aircraft A
      await request(app.getHttpServer())
        .post('/components/install')
        .set('Authorization', `Bearer ${mechanicToken}`)
        .send({
          componentId,
          aircraftId: aircraftA.id,
          location: '前左电机位',
          installNotes: '新电机首次安装',
        })
        .expect(201);

      // Verify status changed to IN_USE
      let component = await request(app.getHttpServer())
        .get(`/components/${componentId}`)
        .set('Authorization', `Bearer ${mechanicToken}`)
        .expect(200);

      expect(component.body.status).toBe('IN_USE');
      expect(component.body.currentAircraftId).toBe(aircraftA.id);

      // Step 3: Transfer to aircraft B
      await request(app.getHttpServer())
        .post('/components/install')
        .set('Authorization', `Bearer ${mechanicToken}`)
        .send({
          componentId,
          aircraftId: aircraftB.id,
          location: '前右电机位',
          installNotes: '从飞机A转移',
        })
        .expect(201);

      component = await request(app.getHttpServer())
        .get(`/components/${componentId}`)
        .set('Authorization', `Bearer ${mechanicToken}`)
        .expect(200);

      expect(component.body.currentAircraftId).toBe(aircraftB.id);

      // Step 4: Remove from aircraft B
      await request(app.getHttpServer())
        .post('/components/remove')
        .set('Authorization', `Bearer ${mechanicToken}`)
        .send({
          componentId,
          removeNotes: '例行检查拆卸',
        })
        .expect(201);

      component = await request(app.getHttpServer())
        .get(`/components/${componentId}`)
        .set('Authorization', `Bearer ${mechanicToken}`)
        .expect(200);

      // After removal, component status becomes NEW (available for reinstallation)
      expect(component.body.status).toBe('NEW');
      expect(component.body.currentAircraftId).toBe(null);

      // Step 5: Mark as scrapped (end of life)
      await request(app.getHttpServer())
        .put(`/components/${componentId}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          status: 'SCRAPPED',
          isAirworthy: false,
        })
        .expect(200);

      component = await request(app.getHttpServer())
        .get(`/components/${componentId}`)
        .set('Authorization', `Bearer ${mechanicToken}`)
        .expect(200);

      expect(component.body.status).toBe('SCRAPPED');
      expect(component.body.isAirworthy).toBe(false);
    });
  });

  describe('Life Limited Component Validation', () => {
    it('should reject installation of non-airworthy component', async () => {
      const token = getToken(mechanicUser);

      // Create component
      const createResponse = await request(app.getHttpServer())
        .post('/components')
        .set('Authorization', `Bearer ${token}`)
        .send({
          serialNumber: 'SN-NOAIR-001',
          partNumber: 'PN-001',
          type: 'MOTOR',
          manufacturer: 'Test',
        })
        .expect(201);

      const componentId = createResponse.body.id;

      // Mark as not airworthy
      await request(app.getHttpServer())
        .put(`/components/${componentId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ isAirworthy: false })
        .expect(200);

      // Try to install - should fail
      await request(app.getHttpServer())
        .post('/components/install')
        .set('Authorization', `Bearer ${token}`)
        .send({
          componentId,
          aircraftId: aircraftA.id,
          location: 'Test',
        })
        .expect(409);
    });
  });
});
