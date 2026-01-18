# Sprint 8 完成报告 - 依赖注入修复与项目启动

**开始时间**: 2026-01-18
**完成时间**: 2026-01-18
**状态**: 已完成

## 概述

本次 Sprint 主要解决了项目启动过程中遇到的依赖注入问题，确保开发环境能够正常运行。

## 完成内容

### 1. 开发环境配置 ✅

| 任务 | 操作 | 状态 |
|------|------|------|
| 创建 API .env 文件 | 从 `.env.example` 复制并配置 | ✅ |
| 数据库初始化 | 执行 `pnpm db:push` 创建表结构 | ✅ |
| 种子数据初始化 | 执行 `pnpm --filter @repo/db db:seed` | ✅ |

### 2. 依赖注入修复 ✅

#### 问题描述
在 tsx/ESM 环境下，NestJS 的自动类型推断无法正确解析构造函数参数类型，导致服务注入失败。

**错误表现**:
```
Cannot read properties of undefined (reading 'getAlerts')
Cannot read properties of undefined (reading 'list')
```

#### 解决方案

为 `MaintenanceSchedulerController` 和 `MaintenanceSchedulerService` 添加显式的 `@Inject()` 装饰器。

**修改文件 1**: `apps/api/src/modules/maintenance/maintenance-scheduler.controller.ts`

```typescript
// Before
constructor(
  private readonly schedulerService: MaintenanceSchedulerService,
  // ...
) {}

// After
constructor(
  @Inject(MaintenanceSchedulerService)
  private readonly schedulerService: MaintenanceSchedulerService,
  @Inject(TriggerCalculationService)
  private readonly calcService: TriggerCalculationService,
  // ...
) {}
```

**修改文件 2**: `apps/api/src/modules/maintenance/maintenance-scheduler.service.ts`

```typescript
// Before
constructor(
  private readonly programRepo: MaintenanceProgramRepository,
  // ...
) {}

// After
constructor(
  @Inject(MaintenanceProgramRepository)
  private readonly programRepo: MaintenanceProgramRepository,
  @Inject(MaintenanceTriggerRepository)
  private readonly triggerRepo: MaintenanceTriggerRepository,
  // ...
) {}
```

### 3. 测试验证 ✅

| 测试项 | 结果 |
|--------|------|
| API 健康检查 `/api/health` | ✅ 通过 |
| 维保预警 API `/api/maintenance-scheduler/alerts` | ✅ 通过 |
| 库存预警 API `/api/inventory/alerts` | ✅ 通过（需认证） |
| 前端首页加载 | ✅ 通过 |

## 测试账号

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | password123 | 管理员 |
| manager | password123 | 机队经理 |
| pilot | password123 | 飞手 |
| mechanic | password123 | 维修工 |
| inspector | password123 | 检验员 |

## 服务地址

- **Web 前端**: http://localhost:3000
- **API 服务**: http://localhost:3001
- **API 文档**: http://localhost:3001/api/docs
- **健康检查**: http://localhost:3001/api/health

## 技术说明

### 根本原因分析

在使用 `tsx` 作为 TypeScript 执行器时，即使配置了 `emitDecoratorMetadata: true` 和 `experimentalDecorators: true`，在某些情况下 `reflect-metadata` 仍然无法正确获取构造函数参数的类型信息。

### 最佳实践建议

对于 NestJS + tsx/ESM 项目，建议：
1. 在所有 Controller 和 Service 的构造函数参数上使用 `@Inject()` 装饰器
2. 确保 `tsx.config.json` 中配置了装饰器元数据
3. 在遇到 "undefined" 注入错误时，首先检查是否缺少显式的 `@Inject()` 装饰器

## 后续建议

1. 检查其他模块是否存在类似的依赖注入问题
2. 考虑为所有服务添加显式的 `@Inject()` 装饰器以提高稳定性
3. 在 CI 中添加启动测试以及早发现此类问题
