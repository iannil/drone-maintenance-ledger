# Sprint 9 完成报告 - RBAC 权限完善

**开始时间**: 2026-01-18
**完成时间**: 2026-01-18
**状态**: 已完成

## 概述

Sprint 9 的目标是完善 RBAC（基于角色的访问控制）权限系统，确保所有 API 端点都有适当的权限保护。本次 Sprint 主要完成了以下工作：

1. 修复 JWT Strategy，从数据库获取完整用户信息
2. 修复 RolesGuard 依赖注入问题
3. 为所有 Controller 配置角色权限
4. 编写权限测试用例

## 完成内容

### 1. JWT Strategy 修复 ✅

**问题描述**：
原 JWT Strategy 使用占位符返回用户信息，没有从数据库验证用户。

**解决方案**：
修改 `apps/api/src/modules/auth/strategies/jwt.strategy.ts`，添加数据库验证：

- 注入 `UserService` 获取完整用户信息
- 验证用户是否存在
- 验证用户账户是否激活
- 返回最新的用户角色（而非 token 中的旧角色）

```typescript
async validate(payload): Promise<Omit<User, "passwordHash">> {
  const user = await this.userService.findById(payload.sub);

  if (!user) {
    throw new UnauthorizedException("User not found");
  }

  if (!user.isActive) {
    throw new UnauthorizedException("User account is disabled");
  }

  const { passwordHash: _unused, ...userWithoutPassword } = user;
  return userWithoutPassword;
}
```

### 2. RolesGuard 修复 ✅

**问题描述**：
在 tsx/ESM 环境下，`Reflector` 未正确注入导致角色验证失效。

**解决方案**：
为 `RolesGuard` 的 `Reflector` 添加显式 `@Inject()` 装饰器：

```typescript
constructor(
  @Inject(Reflector)
  private readonly reflector: Reflector
) {}
```

### 3. Controller 权限配置 ✅

所有 Controller 已配置适当的角色权限：

| Controller | Guards | 权限配置 |
|------------|--------|----------|
| AuthController | 无（公开） | 登录/注册无需认证 |
| HealthController | 无（公开） | 健康检查无需认证 |
| UserController | JWT + Roles | ADMIN 管理用户 |
| FleetController | JWT + Roles | ADMIN/MANAGER 管理机队 |
| AircraftController | JWT + Roles | ADMIN/MANAGER 管理飞机 |
| ComponentController | JWT + Roles | ADMIN/MANAGER 管理零部件 |
| FlightLogController | JWT + Roles | PILOT 写入, ALL 读取 |
| PilotReportController | JWT + Roles | PILOT/MECHANIC 写入 |
| ReleaseRecordController | JWT + Roles | INSPECTOR 放行 |
| WorkOrderController | JWT + Roles | MECHANIC/INSPECTOR/MANAGER 操作 |
| MaintenanceSchedulerController | JWT + Roles | ADMIN/MANAGER 管理计划 |
| InventoryItemController | JWT + Roles | MECHANIC/MANAGER 操作 |
| WarehouseController | JWT + Roles | ADMIN/MANAGER 管理 |
| SupplierController | JWT + Roles | ADMIN/MANAGER 管理 |
| PurchaseRequestController | JWT + Roles | ALL 申请, MANAGER 审批 |
| PurchaseOrderController | JWT + Roles | MANAGER 管理 |
| InventoryMovementController | JWT + Roles | 多角色操作 |
| StatsController | JWT + Roles | ALL 已认证用户 |

### 4. 权限测试用例 ✅

**新增测试文件**：

1. `apps/api/src/common/guards/roles.guard.spec.ts` - 15 个测试用例
2. `apps/api/src/modules/auth/strategies/jwt.strategy.spec.ts` - 9 个测试用例

**测试覆盖场景**：

- 无角色要求时允许访问
- 用户未登录时拒绝访问
- 用户角色匹配时允许访问
- 用户角色不匹配时拒绝访问
- 用户账户被禁用时拒绝访问
- 多角色场景验证

## 验证测试

### API 权限验证

| 测试场景 | 预期结果 | 实际结果 |
|----------|----------|----------|
| 未认证访问 `/maintenance-scheduler/alerts` | 401 | ✅ 401 |
| Pilot 访问 `POST /maintenance-scheduler/run` | 403 | ✅ 403 |
| Admin 访问 `POST /maintenance-scheduler/run` | 200 | ✅ 200 |
| Pilot 访问 `GET /maintenance-scheduler/alerts` | 200 | ✅ 200 |

### 单元测试

```bash
pnpm --filter @repo/api test -- --testPathPattern="roles.guard"
# 15 passed

pnpm --filter @repo/api test -- --testPathPattern="jwt.strategy"
# 9 passed
```

## 修改文件清单

| 文件 | 修改类型 | 说明 |
|------|----------|------|
| `apps/api/src/modules/auth/strategies/jwt.strategy.ts` | 修改 | 添加数据库验证 |
| `apps/api/src/common/guards/roles.guard.ts` | 修改 | 添加 @Inject 装饰器 |
| `apps/api/src/modules/maintenance/maintenance-scheduler.controller.ts` | 修改 | 添加 Guards 和 Roles |
| `apps/api/src/modules/stats/stats.controller.ts` | 修改 | 添加 Guards 和 Swagger |
| `apps/api/src/common/guards/roles.guard.spec.ts` | 新增 | RolesGuard 测试 |
| `apps/api/src/modules/auth/strategies/jwt.strategy.spec.ts` | 新增 | JWT Strategy 测试 |

## 权限矩阵

| 角色 | 用户管理 | 机队管理 | 飞行记录 | 工单管理 | 库存管理 | 采购管理 |
|------|----------|----------|----------|----------|----------|----------|
| ADMIN | ✅ 全部 | ✅ 全部 | ✅ 全部 | ✅ 全部 | ✅ 全部 | ✅ 全部 |
| MANAGER | ❌ | ✅ 全部 | ✅ 读写 | ✅ 管理 | ✅ 全部 | ✅ 全部 |
| INSPECTOR | ❌ | ❌ | ✅ 读取 | ✅ 检验放行 | ✅ 读取 | ❌ |
| MECHANIC | ❌ | ❌ | ✅ 读取 | ✅ 执行 | ✅ 领料 | ✅ 申请 |
| PILOT | ❌ | ❌ | ✅ 写入 | ✅ 读取 | ✅ 读取 | ✅ 申请 |

## 技术说明

### tsx/ESM 依赖注入最佳实践

在使用 tsx 作为 TypeScript 执行器时，NestJS 的自动类型推断可能失效。建议：

1. 在所有构造函数参数上使用 `@Inject()` 装饰器
2. 确保 `reflect-metadata` 正确导入
3. 配置 `emitDecoratorMetadata: true`

### 角色设计原则

- **最小权限原则**：默认拒绝，仅授予必要权限
- **职责分离**：不同角色有不同职责
- **向上兼容**：管理员角色继承所有权限

## 后续建议

1. **Sprint 10**: 集成测试 - 完整业务流程 E2E 测试
2. 考虑添加细粒度权限（Permission-based）控制
3. 添加权限审计日志
4. 实现资源级别的访问控制（如：用户只能查看自己的飞行记录）

## 相关文档

- Phase 3 计划: `/docs/progress/phase-3-plan.md`
- 项目状态: `/docs/PROJECT_STATUS.md`
