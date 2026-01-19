# Sprint 11 进度报告 - Controller 层测试

**日期**: 2026-01-19
**状态**: 进行中

---

## 概述

Sprint 11 的主要目标是提升 API 测试覆盖率。本次工作新增了 5 个 Controller 测试文件，包含 111 个新测试用例。

---

## 完成工作

### 新增 Controller 测试

| 模块 | Controller | 测试用例数 | 状态 |
|------|-----------|----------|------|
| Asset | FleetController | 17 | ✅ 完成 |
| Asset | AircraftController | 16 | ✅ 完成 |
| Asset | ComponentController | 18 | ✅ 完成 |
| Maintenance | WorkOrderController | 27 | ✅ 完成 |
| Maintenance | MaintenanceSchedulerController | 33 | ✅ 完成 |
| **合计** | **5 个 Controller** | **111 个测试** | ✅ |

### 测试文件清单

```
apps/api/src/modules/asset/
├── fleet.controller.spec.ts          (新增)
├── aircraft.controller.spec.ts       (新增)
└── component.controller.spec.ts      (新增)

apps/api/src/modules/maintenance/
├── work-order.controller.spec.ts     (新增)
└── maintenance-scheduler.controller.spec.ts (新增)
```

### 测试覆盖的端点

#### FleetController (17 tests)
- GET /fleets/:id
- GET /fleets (list with pagination)
- GET /fleets/search/:query
- POST /fleets
- PUT /fleets/:id
- DELETE /fleets/:id

#### AircraftController (16 tests)
- GET /aircraft/:id
- GET /aircraft (list with filtering)
- GET /aircraft/status/counts
- POST /aircraft
- PUT /aircraft/:id
- PUT /aircraft/:id/status
- DELETE /aircraft/:id

#### ComponentController (18 tests)
- GET /components/:id
- GET /components/serial/:serialNumber
- GET /components (list with filtering)
- GET /components/maintenance/due
- POST /components
- POST /components/install
- POST /components/remove
- PUT /components/:id
- DELETE /components/:id

#### WorkOrderController (27 tests)
- GET /work-orders/:id
- GET /work-orders (multiple filters)
- POST /work-orders
- PUT /work-orders/:id
- PUT /work-orders/:id/status
- PUT /work-orders/:id/assign
- POST /work-orders/:id/start
- POST /work-orders/:id/complete
- POST /work-orders/:id/release
- POST /work-orders/:id/cancel
- DELETE /work-orders/:id
- Task management (6 endpoints)
- Part management (3 endpoints)

#### MaintenanceSchedulerController (33 tests)
- POST /maintenance-scheduler/run
- POST /maintenance-scheduler/create-work-orders
- GET /maintenance-scheduler/alerts
- POST /maintenance-scheduler/aircraft/:aircraftId/initialize
- POST /maintenance-scheduler/schedules/:scheduleId/complete
- Programs CRUD (4 endpoints)
- Triggers CRUD (4 endpoints)
- Schedules queries (6 endpoints)
- POST /maintenance-scheduler/calculate-preview

---

## 测试统计

### 当前状态

```
Test Suites: 21 passed, 21 total
Tests:       397 passed, 397 total

Coverage Summary:
- Statements: 37.07%
- Branches:   25.61%
- Functions:  27.75%
- Lines:      36.52%
```

### 与目标对比

| 指标 | 目标 | 当前 | 差距 |
|------|------|------|------|
| Statements | 70% | 37% | -33% |
| Branches | 60% | 26% | -34% |
| Functions | 70% | 28% | -42% |
| Lines | 70% | 37% | -33% |

### Controller 测试覆盖

| 模块 | 总 Controllers | 已测试 | 覆盖率 |
|------|---------------|-------|--------|
| Auth | 1 | 1 | 100% |
| User | 1 | 1 | 100% |
| Asset | 3 | 3 | 100% |
| Flight | 3 | 2 | 67% |
| Maintenance | 2 | 2 | 100% |
| Inventory | 6 | 0 | 0% |
| Health | 1 | 0 | 0% |
| Stats | 1 | 0 | 0% |
| **总计** | **18** | **9** | **50%** |

---

## 待完成工作

### 高优先级（提升至 70% 覆盖率）

1. **Inventory 模块 Controller 测试** (6 个)
   - InventoryItemController
   - InventoryMovementController
   - WarehouseController
   - PurchaseOrderController
   - PurchaseRequestController
   - SupplierController

2. **其他模块 Controller 测试** (3 个)
   - HealthController
   - StatsController
   - ReleaseRecordController

3. **Service 层测试补充**
   - Asset 模块 Services
   - Flight 模块 Services
   - Maintenance 模块 Services

---

## 技术细节

### 测试模式

所有新 Controller 测试遵循统一模式：

```typescript
describe('ControllerName', () => {
  let controller: ControllerClass;
  let service: jest.Mocked<ServiceClass>;

  beforeEach(async () => {
    const mockService = { /* mocked methods */ };
    const module = await Test.createTestingModule({
      controllers: [ControllerClass],
      providers: [{ provide: ServiceClass, useValue: mockService }],
    }).compile();

    controller = module.get<ControllerClass>(ControllerClass);
    service = module.get(ServiceClass);
  });

  describe('HTTP_METHOD /endpoint', () => {
    it('should handle success case', async () => { ... });
    it('should handle error case', async () => { ... });
  });
});
```

### 类型断言处理

由于 Mock 对象与实际类型存在差异，使用 `as any` 类型断言：

```typescript
service.method.mockResolvedValue(mockData as any);
```

---

## 验证命令

```bash
# 运行所有测试
pnpm --filter api test

# 运行特定 Controller 测试
pnpm --filter api test -- --testPathPattern="fleet.controller.spec"

# 检查覆盖率
pnpm --filter api test -- --coverage
```

---

## 下一步计划

1. 继续 Inventory 模块 Controller 测试（提升覆盖率）
2. 补充 Service 层单元测试
3. 完成 Sprint 12：前端表单完善

---

## 相关文档

- [Phase 3 开发计划](/docs/progress/phase-3-plan.md)
- [Sprint 14 完成报告](/docs/reports/completed/sprint-14-mock-cleanup-completed-2026-01-19.md)
