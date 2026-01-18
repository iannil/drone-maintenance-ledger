/**
 * Work Order E2E Tests
 *
 * Tests the complete work order workflow including:
 * - Create work order
 * - Assign to personnel
 * - Start work
 * - Add tasks (including RII tasks)
 * - Complete tasks
 * - Inspector sign-off for RII tasks
 * - Complete work order
 * - Release work order
 * - Cancel work order
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

import { MaintenanceModule } from '../../src/modules/maintenance/maintenance.module';
import { AuthModule } from '../../src/modules/auth/auth.module';
import { UserModule } from '../../src/modules/user/user.module';
import { AssetModule } from '../../src/modules/asset/asset.module';
import { WorkOrderRepository } from '../../src/modules/maintenance/repositories/work-order.repository';
import { WorkOrderTaskRepository } from '../../src/modules/maintenance/repositories/work-order-task.repository';
import { WorkOrderPartRepository } from '../../src/modules/maintenance/repositories/work-order-part.repository';
import { UserRepository } from '../../src/modules/user/repositories/user.repository';
import { AircraftRepository } from '../../src/modules/asset/repositories/aircraft.repository';
import { createMockUser } from '../test-utils';

describe('Work Order E2E', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  // In-memory mock data storage
  const workOrders: Map<string, any> = new Map();
  const tasks: Map<string, any> = new Map();
  const parts: Map<string, any> = new Map();
  const mockUsers: Map<string, any> = new Map();
  const mockAircraft: Map<string, any> = new Map();

  let orderCounter = 0;
  let taskCounter = 0;
  let partCounter = 0;

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

  const inspectorUser = createMockUser({
    id: 'inspector-user-id',
    username: 'inspector',
    email: 'inspector@example.com',
    role: 'INSPECTOR',
  });

  const pilotUser = createMockUser({
    id: 'pilot-user-id',
    username: 'pilot',
    email: 'pilot@example.com',
    role: 'PILOT',
  });

  // Test aircraft
  const testAircraft = {
    id: 'aircraft-1',
    registrationNumber: 'N-12345',
    serialNumber: 'SN-001',
    model: 'DJI Matrice 300',
    manufacturer: 'DJI',
    status: 'ACTIVE',
    totalFlightHours: 150,
    totalCycles: 200,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  beforeAll(async () => {
    // Initialize test data
    [adminUser, managerUser, mechanicUser, inspectorUser, pilotUser].forEach((user) => {
      mockUsers.set(user.id, user);
      mockUsers.set(`username:${user.username}`, user);
    });
    mockAircraft.set(testAircraft.id, testAircraft);

    // Mock repositories
    const mockWorkOrderRepository = {
      findById: jest.fn().mockImplementation((id: string) => Promise.resolve(workOrders.get(id) || null)),
      findByAircraft: jest.fn().mockImplementation((aircraftId: string) => {
        const results = Array.from(workOrders.values()).filter((wo) => wo.aircraftId === aircraftId);
        return Promise.resolve(results);
      }),
      findByAssignee: jest.fn().mockImplementation((assigneeId: string) => {
        const results = Array.from(workOrders.values()).filter((wo) => wo.assignedTo === assigneeId);
        return Promise.resolve(results);
      }),
      findOpen: jest.fn().mockImplementation(() => {
        const results = Array.from(workOrders.values()).filter((wo) =>
          ['DRAFT', 'OPEN', 'IN_PROGRESS'].includes(wo.status),
        );
        return Promise.resolve(results);
      }),
      findByStatus: jest.fn().mockImplementation((status: string) => {
        const results = Array.from(workOrders.values()).filter((wo) => wo.status === status);
        return Promise.resolve(results);
      }),
      findRecent: jest.fn().mockImplementation(() => Promise.resolve(Array.from(workOrders.values()))),
      generateOrderNumber: jest.fn().mockImplementation(() => {
        orderCounter++;
        return Promise.resolve(`WO-${String(orderCounter).padStart(6, '0')}`);
      }),
      create: jest.fn().mockImplementation((data: any) => {
        const id = `wo-${Date.now()}-${orderCounter}`;
        const workOrder = {
          id,
          ...data,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        workOrders.set(id, workOrder);
        return Promise.resolve(workOrder);
      }),
      update: jest.fn().mockImplementation((id: string, data: any) => {
        const existing = workOrders.get(id);
        if (!existing) return Promise.resolve(null);
        const updated = { ...existing, ...data, updatedAt: Date.now() };
        workOrders.set(id, updated);
        return Promise.resolve(updated);
      }),
      delete: jest.fn().mockImplementation((id: string) => {
        workOrders.delete(id);
        return Promise.resolve();
      }),
      assign: jest.fn().mockImplementation((id: string, userId: string) => {
        const existing = workOrders.get(id);
        if (!existing) return Promise.resolve(null);
        const updated = {
          ...existing,
          assignedTo: userId,
          assignedAt: Date.now(),
          status: existing.status === 'DRAFT' ? 'OPEN' : existing.status,
          updatedAt: Date.now(),
        };
        workOrders.set(id, updated);
        return Promise.resolve(updated);
      }),
      start: jest.fn().mockImplementation((id: string) => {
        const existing = workOrders.get(id);
        if (!existing) return Promise.resolve(null);
        const updated = {
          ...existing,
          status: 'IN_PROGRESS',
          actualStart: Date.now(),
          updatedAt: Date.now(),
        };
        workOrders.set(id, updated);
        return Promise.resolve(updated);
      }),
      updateStatus: jest.fn().mockImplementation((id: string, status: string) => {
        const existing = workOrders.get(id);
        if (!existing) return Promise.resolve(null);
        const updated = { ...existing, status, updatedAt: Date.now() };
        workOrders.set(id, updated);
        return Promise.resolve(updated);
      }),
      complete: jest.fn().mockImplementation((id: string, userId: string, notes?: string) => {
        const existing = workOrders.get(id);
        if (!existing) return Promise.resolve(null);
        const updated = {
          ...existing,
          status: 'COMPLETED',
          completedBy: userId,
          completedAt: Date.now(),
          completionNotes: notes || null,
          updatedAt: Date.now(),
        };
        workOrders.set(id, updated);
        return Promise.resolve(updated);
      }),
      release: jest.fn().mockImplementation((id: string, userId: string) => {
        const existing = workOrders.get(id);
        if (!existing) return Promise.resolve(null);
        const updated = {
          ...existing,
          status: 'RELEASED',
          releasedBy: userId,
          releasedAt: Date.now(),
          updatedAt: Date.now(),
        };
        workOrders.set(id, updated);
        return Promise.resolve(updated);
      }),
    };

    const mockTaskRepository = {
      findById: jest.fn().mockImplementation((id: string) => Promise.resolve(tasks.get(id) || null)),
      findByWorkOrder: jest.fn().mockImplementation((workOrderId: string) => {
        const results = Array.from(tasks.values()).filter((t) => t.workOrderId === workOrderId);
        return Promise.resolve(results.sort((a, b) => a.sequence - b.sequence));
      }),
      create: jest.fn().mockImplementation((data: any) => {
        taskCounter++;
        const id = `task-${Date.now()}-${taskCounter}`;
        const task = {
          id,
          ...data,
          status: data.status || 'PENDING',
          isRii: data.isRii || false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        tasks.set(id, task);
        return Promise.resolve(task);
      }),
      update: jest.fn().mockImplementation((id: string, data: any) => {
        const existing = tasks.get(id);
        if (!existing) return Promise.resolve(null);
        const updated = { ...existing, ...data, updatedAt: Date.now() };
        tasks.set(id, updated);
        return Promise.resolve(updated);
      }),
      delete: jest.fn().mockImplementation((id: string) => {
        tasks.delete(id);
        return Promise.resolve();
      }),
      findRiiTasksByWorkOrder: jest.fn().mockImplementation((workOrderId: string) => {
        const results = Array.from(tasks.values()).filter((t) => t.workOrderId === workOrderId && t.isRii);
        return Promise.resolve(results);
      }),
      findRiiTasks: jest.fn().mockImplementation((workOrderId: string) => {
        const results = Array.from(tasks.values()).filter((t) => t.workOrderId === workOrderId && t.isRii);
        return Promise.resolve(results);
      }),
      updateStatus: jest.fn().mockImplementation((id: string, status: string) => {
        const existing = tasks.get(id);
        if (!existing) return Promise.resolve(null);
        const updated = { ...existing, status, updatedAt: Date.now() };
        tasks.set(id, updated);
        return Promise.resolve(updated);
      }),
      signOffRii: jest.fn().mockImplementation((id: string, inspectorId: string) => {
        const existing = tasks.get(id);
        if (!existing) return Promise.resolve(null);
        const updated = {
          ...existing,
          status: 'COMPLETED',
          signedOffBy: inspectorId,
          signedOffAt: Date.now(),
          updatedAt: Date.now(),
        };
        tasks.set(id, updated);
        return Promise.resolve(updated);
      }),
      createMany: jest.fn().mockImplementation((tasksData: any[]) => {
        return Promise.resolve(
          tasksData.map((data) => {
            taskCounter++;
            const id = `task-${Date.now()}-${taskCounter}`;
            const task = {
              id,
              ...data,
              status: data.status || 'PENDING',
              isRii: data.isRii || false,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            };
            tasks.set(id, task);
            return task;
          }),
        );
      }),
    };

    const mockPartRepository = {
      findById: jest.fn().mockImplementation((id: string) => Promise.resolve(parts.get(id) || null)),
      findByWorkOrder: jest.fn().mockImplementation((workOrderId: string) => {
        const results = Array.from(parts.values()).filter((p) => p.workOrderId === workOrderId);
        return Promise.resolve(results);
      }),
      create: jest.fn().mockImplementation((data: any) => {
        partCounter++;
        const id = `part-${Date.now()}-${partCounter}`;
        const part = {
          id,
          ...data,
          createdAt: Date.now(),
        };
        parts.set(id, part);
        return Promise.resolve(part);
      }),
      delete: jest.fn().mockImplementation((id: string) => {
        parts.delete(id);
        return Promise.resolve();
      }),
      createMany: jest.fn().mockImplementation((partsData: any[]) => {
        return Promise.resolve(
          partsData.map((data) => {
            partCounter++;
            const id = `part-${Date.now()}-${partCounter}`;
            const part = {
              id,
              ...data,
              createdAt: Date.now(),
            };
            parts.set(id, part);
            return part;
          }),
        );
      }),
    };

    const mockUserRepository = {
      findById: jest.fn().mockImplementation((id: string) => Promise.resolve(mockUsers.get(id) || null)),
      findByUsername: jest.fn().mockImplementation((username: string) =>
        Promise.resolve(mockUsers.get(`username:${username}`) || null),
      ),
      verifyPassword: jest.fn().mockResolvedValue(true),
    };

    const mockAircraftRepository = {
      findById: jest.fn().mockImplementation((id: string) => Promise.resolve(mockAircraft.get(id) || null)),
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
        MaintenanceModule,
      ],
    })
      .overrideProvider(WorkOrderRepository)
      .useValue(mockWorkOrderRepository)
      .overrideProvider(WorkOrderTaskRepository)
      .useValue(mockTaskRepository)
      .overrideProvider(WorkOrderPartRepository)
      .useValue(mockPartRepository)
      .overrideProvider(UserRepository)
      .useValue(mockUserRepository)
      .overrideProvider(AircraftRepository)
      .useValue(mockAircraftRepository)
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
    // Clear work orders, tasks, and parts before each test
    workOrders.clear();
    tasks.clear();
    parts.clear();
    orderCounter = 0;
    taskCounter = 0;
    partCounter = 0;
  });

  // Helper function to generate tokens for different roles
  const getToken = (user: ReturnType<typeof createMockUser>) =>
    jwtService.sign({ sub: user.id, username: user.username, role: user.role });

  describe('POST /work-orders (Create Work Order)', () => {
    it('should create a work order with MANAGER role', async () => {
      const token = getToken(managerUser);
      const createDto = {
        aircraftId: testAircraft.id,
        type: 'SCHEDULED',
        title: '50小时定检',
        description: '例行定期检查',
        priority: 'MEDIUM',
      };

      const response = await request(app.getHttpServer())
        .post('/work-orders')
        .set('Authorization', `Bearer ${token}`)
        .send(createDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('orderNumber');
      expect(response.body.orderNumber).toMatch(/^WO-\d{6}$/);
      expect(response.body.title).toBe(createDto.title);
      expect(response.body.status).toBe('DRAFT');
    });

    it('should create a work order with assignee and set status to OPEN', async () => {
      const token = getToken(managerUser);
      const createDto = {
        aircraftId: testAircraft.id,
        type: 'UNSCHEDULED',
        title: '发动机异常维修',
        assignedTo: mechanicUser.id,
      };

      const response = await request(app.getHttpServer())
        .post('/work-orders')
        .set('Authorization', `Bearer ${token}`)
        .send(createDto)
        .expect(201);

      expect(response.body.status).toBe('OPEN');
      expect(response.body.assignedTo).toBe(mechanicUser.id);
    });

    it('should reject creation by PILOT role', async () => {
      const token = getToken(pilotUser);
      const createDto = {
        aircraftId: testAircraft.id,
        type: 'SCHEDULED',
        title: 'Test',
      };

      await request(app.getHttpServer())
        .post('/work-orders')
        .set('Authorization', `Bearer ${token}`)
        .send(createDto)
        .expect(403);
    });

    it('should reject creation without authentication', async () => {
      const createDto = {
        aircraftId: testAircraft.id,
        type: 'SCHEDULED',
        title: 'Test',
      };

      await request(app.getHttpServer()).post('/work-orders').send(createDto).expect(401);
    });
  });

  describe('PUT /work-orders/:id/assign (Assign Work Order)', () => {
    it('should allow MANAGER to assign work order', async () => {
      // First create a work order
      const token = getToken(managerUser);
      const createResponse = await request(app.getHttpServer())
        .post('/work-orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          aircraftId: testAircraft.id,
          type: 'SCHEDULED',
          title: 'Test Work Order',
        })
        .expect(201);

      const workOrderId = createResponse.body.id;

      // Assign to mechanic
      const assignResponse = await request(app.getHttpServer())
        .put(`/work-orders/${workOrderId}/assign`)
        .set('Authorization', `Bearer ${token}`)
        .send({ userId: mechanicUser.id })
        .expect(200);

      expect(assignResponse.body.assignedTo).toBe(mechanicUser.id);
    });

    it('should reject MECHANIC from assigning work order', async () => {
      const managerToken = getToken(managerUser);
      const mechanicToken = getToken(mechanicUser);

      // Create work order as manager
      const createResponse = await request(app.getHttpServer())
        .post('/work-orders')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          aircraftId: testAircraft.id,
          type: 'SCHEDULED',
          title: 'Test Work Order',
        })
        .expect(201);

      // Try to assign as mechanic
      await request(app.getHttpServer())
        .put(`/work-orders/${createResponse.body.id}/assign`)
        .set('Authorization', `Bearer ${mechanicToken}`)
        .send({ userId: mechanicUser.id })
        .expect(403);
    });
  });

  describe('POST /work-orders/:id/start (Start Work Order)', () => {
    it('should allow MECHANIC to start assigned work order', async () => {
      const managerToken = getToken(managerUser);
      const mechanicToken = getToken(mechanicUser);

      // Create and assign work order
      const createResponse = await request(app.getHttpServer())
        .post('/work-orders')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          aircraftId: testAircraft.id,
          type: 'SCHEDULED',
          title: 'Test Work Order',
          assignedTo: mechanicUser.id,
        })
        .expect(201);

      const workOrderId = createResponse.body.id;

      // Start work order as mechanic
      const startResponse = await request(app.getHttpServer())
        .post(`/work-orders/${workOrderId}/start`)
        .set('Authorization', `Bearer ${mechanicToken}`)
        .expect(201); // NestJS POST default status

      expect(startResponse.body.status).toBe('IN_PROGRESS');
    });
  });

  describe('Work Order Task Flow', () => {
    let workOrderId: string;
    let managerToken: string;
    let mechanicToken: string;
    let inspectorToken: string;

    beforeEach(async () => {
      managerToken = getToken(managerUser);
      mechanicToken = getToken(mechanicUser);
      inspectorToken = getToken(inspectorUser);

      // Create a work order for testing
      const createResponse = await request(app.getHttpServer())
        .post('/work-orders')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          aircraftId: testAircraft.id,
          type: 'SCHEDULED',
          title: 'Task Test Work Order',
          assignedTo: mechanicUser.id,
        })
        .expect(201);

      workOrderId = createResponse.body.id;
    });

    it('should add a task to work order', async () => {
      const taskDto = {
        sequence: 1,
        title: '检查电机运转',
        description: '检查电机转速和噪音',
        isRii: false,
      };

      const response = await request(app.getHttpServer())
        .post(`/work-orders/${workOrderId}/tasks`)
        .set('Authorization', `Bearer ${mechanicToken}`)
        .send(taskDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(taskDto.title);
      expect(response.body.status).toBe('PENDING');
    });

    it('should add an RII (Required Inspection Item) task', async () => {
      const riiTaskDto = {
        sequence: 2,
        title: 'RII - 主桨检查',
        description: '检查主桨叶片完整性',
        isRii: true,
      };

      const response = await request(app.getHttpServer())
        .post(`/work-orders/${workOrderId}/tasks`)
        .set('Authorization', `Bearer ${mechanicToken}`)
        .send(riiTaskDto)
        .expect(201);

      expect(response.body.isRii).toBe(true);
    });

    it('should get tasks for a work order', async () => {
      // Add tasks
      await request(app.getHttpServer())
        .post(`/work-orders/${workOrderId}/tasks`)
        .set('Authorization', `Bearer ${mechanicToken}`)
        .send({ sequence: 1, title: 'Task 1' })
        .expect(201);

      await request(app.getHttpServer())
        .post(`/work-orders/${workOrderId}/tasks`)
        .set('Authorization', `Bearer ${mechanicToken}`)
        .send({ sequence: 2, title: 'Task 2' })
        .expect(201);

      // Get tasks
      const response = await request(app.getHttpServer())
        .get(`/work-orders/${workOrderId}/tasks`)
        .set('Authorization', `Bearer ${mechanicToken}`)
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should update task status', async () => {
      // Add task
      const addResponse = await request(app.getHttpServer())
        .post(`/work-orders/${workOrderId}/tasks`)
        .set('Authorization', `Bearer ${mechanicToken}`)
        .send({ sequence: 1, title: 'Task to complete' })
        .expect(201);

      const taskId = addResponse.body.id;

      // Update status to COMPLETED
      const updateResponse = await request(app.getHttpServer())
        .put(`/work-orders/tasks/${taskId}/status`)
        .set('Authorization', `Bearer ${mechanicToken}`)
        .send({ status: 'COMPLETED' })
        .expect(200);

      expect(updateResponse.body.status).toBe('COMPLETED');
    });

    it('should allow INSPECTOR to sign off RII task', async () => {
      // Add RII task
      const addResponse = await request(app.getHttpServer())
        .post(`/work-orders/${workOrderId}/tasks`)
        .set('Authorization', `Bearer ${mechanicToken}`)
        .send({ sequence: 1, title: 'RII Task', isRii: true })
        .expect(201);

      const taskId = addResponse.body.id;

      // Sign off as inspector
      const signOffResponse = await request(app.getHttpServer())
        .post(`/work-orders/tasks/${taskId}/sign-off`)
        .set('Authorization', `Bearer ${inspectorToken}`)
        .expect(201);

      expect(signOffResponse.body).toHaveProperty('signedOffBy');
    });

    it('should reject MECHANIC from signing off RII task', async () => {
      // Add RII task
      const addResponse = await request(app.getHttpServer())
        .post(`/work-orders/${workOrderId}/tasks`)
        .set('Authorization', `Bearer ${mechanicToken}`)
        .send({ sequence: 1, title: 'RII Task', isRii: true })
        .expect(201);

      const taskId = addResponse.body.id;

      // Try to sign off as mechanic
      await request(app.getHttpServer())
        .post(`/work-orders/tasks/${taskId}/sign-off`)
        .set('Authorization', `Bearer ${mechanicToken}`)
        .expect(403);
    });
  });

  describe('POST /work-orders/:id/complete (Complete Work Order)', () => {
    it('should complete work order after all tasks are done', async () => {
      const managerToken = getToken(managerUser);
      const mechanicToken = getToken(mechanicUser);

      // Create and start work order
      const createResponse = await request(app.getHttpServer())
        .post('/work-orders')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          aircraftId: testAircraft.id,
          type: 'SCHEDULED',
          title: 'Complete Test Work Order',
          assignedTo: mechanicUser.id,
        })
        .expect(201);

      const workOrderId = createResponse.body.id;

      await request(app.getHttpServer())
        .post(`/work-orders/${workOrderId}/start`)
        .set('Authorization', `Bearer ${mechanicToken}`)
        .expect(201);

      // Add and complete a task
      const taskResponse = await request(app.getHttpServer())
        .post(`/work-orders/${workOrderId}/tasks`)
        .set('Authorization', `Bearer ${mechanicToken}`)
        .send({ sequence: 1, title: 'Simple task' })
        .expect(201);

      await request(app.getHttpServer())
        .put(`/work-orders/tasks/${taskResponse.body.id}/status`)
        .set('Authorization', `Bearer ${mechanicToken}`)
        .send({ status: 'COMPLETED' })
        .expect(200);

      // Complete work order
      const completeResponse = await request(app.getHttpServer())
        .post(`/work-orders/${workOrderId}/complete`)
        .set('Authorization', `Bearer ${mechanicToken}`)
        .send({ notes: 'All tasks completed successfully' })
        .expect(201);

      expect(completeResponse.body.status).toBe('COMPLETED');
    });
  });

  describe('POST /work-orders/:id/release (Release Work Order)', () => {
    it('should allow INSPECTOR to release completed work order', async () => {
      const managerToken = getToken(managerUser);
      const mechanicToken = getToken(mechanicUser);
      const inspectorToken = getToken(inspectorUser);

      // Create, start and complete work order
      const createResponse = await request(app.getHttpServer())
        .post('/work-orders')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          aircraftId: testAircraft.id,
          type: 'SCHEDULED',
          title: 'Release Test Work Order',
          assignedTo: mechanicUser.id,
        })
        .expect(201);

      const workOrderId = createResponse.body.id;

      await request(app.getHttpServer())
        .post(`/work-orders/${workOrderId}/start`)
        .set('Authorization', `Bearer ${mechanicToken}`)
        .expect(201);

      await request(app.getHttpServer())
        .post(`/work-orders/${workOrderId}/complete`)
        .set('Authorization', `Bearer ${mechanicToken}`)
        .expect(201);

      // Release as inspector
      const releaseResponse = await request(app.getHttpServer())
        .post(`/work-orders/${workOrderId}/release`)
        .set('Authorization', `Bearer ${inspectorToken}`)
        .expect(201);

      expect(releaseResponse.body.status).toBe('RELEASED');
    });

    it('should reject MECHANIC from releasing work order', async () => {
      const managerToken = getToken(managerUser);
      const mechanicToken = getToken(mechanicUser);

      // Create and complete work order
      const createResponse = await request(app.getHttpServer())
        .post('/work-orders')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          aircraftId: testAircraft.id,
          type: 'SCHEDULED',
          title: 'Release Test',
          assignedTo: mechanicUser.id,
        })
        .expect(201);

      const workOrderId = createResponse.body.id;

      await request(app.getHttpServer())
        .post(`/work-orders/${workOrderId}/start`)
        .set('Authorization', `Bearer ${mechanicToken}`)
        .expect(201);

      await request(app.getHttpServer())
        .post(`/work-orders/${workOrderId}/complete`)
        .set('Authorization', `Bearer ${mechanicToken}`)
        .expect(201);

      // Try to release as mechanic
      await request(app.getHttpServer())
        .post(`/work-orders/${workOrderId}/release`)
        .set('Authorization', `Bearer ${mechanicToken}`)
        .expect(403);
    });
  });

  describe('POST /work-orders/:id/cancel (Cancel Work Order)', () => {
    it('should allow MANAGER to cancel work order', async () => {
      const managerToken = getToken(managerUser);

      // Create work order
      const createResponse = await request(app.getHttpServer())
        .post('/work-orders')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          aircraftId: testAircraft.id,
          type: 'SCHEDULED',
          title: 'Cancel Test Work Order',
        })
        .expect(201);

      const workOrderId = createResponse.body.id;

      // Cancel work order
      const cancelResponse = await request(app.getHttpServer())
        .post(`/work-orders/${workOrderId}/cancel`)
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(201);

      expect(cancelResponse.body.status).toBe('CANCELLED');
    });

    it('should reject MECHANIC from canceling work order', async () => {
      const managerToken = getToken(managerUser);
      const mechanicToken = getToken(mechanicUser);

      // Create work order
      const createResponse = await request(app.getHttpServer())
        .post('/work-orders')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          aircraftId: testAircraft.id,
          type: 'SCHEDULED',
          title: 'Cancel Test',
        })
        .expect(201);

      // Try to cancel as mechanic
      await request(app.getHttpServer())
        .post(`/work-orders/${createResponse.body.id}/cancel`)
        .set('Authorization', `Bearer ${mechanicToken}`)
        .expect(403);
    });
  });

  describe('Complete Work Order Flow E2E', () => {
    it('should complete full work order lifecycle', async () => {
      const managerToken = getToken(managerUser);
      const mechanicToken = getToken(mechanicUser);
      const inspectorToken = getToken(inspectorUser);

      // Step 1: Manager creates work order
      const createResponse = await request(app.getHttpServer())
        .post('/work-orders')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          aircraftId: testAircraft.id,
          type: 'SCHEDULED',
          title: '100小时定检',
          description: '飞行100小时例行维保',
          priority: 'HIGH',
        })
        .expect(201);

      const workOrderId = createResponse.body.id;
      expect(createResponse.body.status).toBe('DRAFT');

      // Step 2: Manager assigns to mechanic
      await request(app.getHttpServer())
        .put(`/work-orders/${workOrderId}/assign`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({ userId: mechanicUser.id })
        .expect(200);

      // Step 3: Mechanic starts work order
      const startResponse = await request(app.getHttpServer())
        .post(`/work-orders/${workOrderId}/start`)
        .set('Authorization', `Bearer ${mechanicToken}`)
        .expect(201);

      expect(startResponse.body.status).toBe('IN_PROGRESS');

      // Step 4: Mechanic adds regular task
      const regularTaskResponse = await request(app.getHttpServer())
        .post(`/work-orders/${workOrderId}/tasks`)
        .set('Authorization', `Bearer ${mechanicToken}`)
        .send({
          sequence: 1,
          title: '清洁机身',
          description: '清洁无人机机身和镜头',
        })
        .expect(201);

      // Step 5: Mechanic adds RII task
      const riiTaskResponse = await request(app.getHttpServer())
        .post(`/work-orders/${workOrderId}/tasks`)
        .set('Authorization', `Bearer ${mechanicToken}`)
        .send({
          sequence: 2,
          title: 'RII - 检查电机',
          description: '检查电机运转情况',
          isRii: true,
        })
        .expect(201);

      // Step 6: Mechanic completes regular task
      await request(app.getHttpServer())
        .put(`/work-orders/tasks/${regularTaskResponse.body.id}/status`)
        .set('Authorization', `Bearer ${mechanicToken}`)
        .send({ status: 'COMPLETED' })
        .expect(200);

      // Step 7: Mechanic marks RII task as IN_PROGRESS (only inspector can complete it)
      await request(app.getHttpServer())
        .put(`/work-orders/tasks/${riiTaskResponse.body.id}/status`)
        .set('Authorization', `Bearer ${mechanicToken}`)
        .send({ status: 'IN_PROGRESS' })
        .expect(200);

      // Step 8: Inspector signs off RII task (this completes it)
      await request(app.getHttpServer())
        .post(`/work-orders/tasks/${riiTaskResponse.body.id}/sign-off`)
        .set('Authorization', `Bearer ${inspectorToken}`)
        .expect(201);

      // Step 9: Mechanic completes work order
      const completeResponse = await request(app.getHttpServer())
        .post(`/work-orders/${workOrderId}/complete`)
        .set('Authorization', `Bearer ${mechanicToken}`)
        .send({ notes: '所有任务已完成，飞行器状态良好' })
        .expect(201);

      expect(completeResponse.body.status).toBe('COMPLETED');

      // Step 10: Inspector releases work order
      const releaseResponse = await request(app.getHttpServer())
        .post(`/work-orders/${workOrderId}/release`)
        .set('Authorization', `Bearer ${inspectorToken}`)
        .expect(201);

      expect(releaseResponse.body.status).toBe('RELEASED');

      // Step 11: Verify final work order state
      const finalResponse = await request(app.getHttpServer())
        .get(`/work-orders/${workOrderId}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);

      expect(finalResponse.body.status).toBe('RELEASED');
    });
  });
});
