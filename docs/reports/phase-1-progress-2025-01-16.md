# Phase 1 进展报告

**更新时间**: 2026-01-16
**版本**: 1.0

## 概述

本报告记录了 Phase 1 的准备工作进展，包括文档整理、环境配置和核心业务逻辑完善。

---

## 已完成工作

### 1. 文档整理

| 文档 | 操作 | 说明 |
|------|------|------|
| `README.md` | 更新 | 技术栈描述更新为实际采用的技术 |
| `.env.example` | 更新 | 补充数据库、CORS、日志等环境变量 |
| `PROJECT_STATUS.md` | 更新 | 更新前端完成内容、文档索引 |
| `progress/README.md` | 更新 | 增加相关规划文档引用 |
| `database-setup.md` | 新增 | 数据库设置指南 |
| `documentation-update-2025-01-16.md` | 新增 | 文档整理报告 |
| `redundancy-analysis-2025-01-16.md` | 新增 | 冗余内容分析报告 |

### 2. 数据库环境准备

**创建的目录**:
- `/database/migrations/` - 数据库迁移文件目录
- `/database/.gitkeep` - 占位文件

**创建的脚本**:
- `/packages/db/scripts/seed.ts` - 开发环境种子数据脚本

种子数据包含：
- 5 个测试用户（admin, manager, pilot, mechanic, inspector）
- 1 个演示机队
- 2 架飞机（1架可用，1架维修中）
- 7 个零部件（电机、电池、桨叶等）
- 3 个维保计划模板

### 3. 零部件装机/拆下事务逻辑完善

#### Repository 层 (`component.repository.ts`)

新增方法：
- `install()` - 安装零部件到飞机
- `remove()` - 从飞机拆下零部件
- `getCurrentInstallation()` - 获取当前装机状态
- `getInstallationHistory()` - 获取装机历史

修复：
- 添加 `sql` 导入以支持 lifecycle metrics 更新

#### Service 层 (`component.service.ts`)

完善方法：
- `install()` - 零部件安装业务逻辑
  - 适航性检查
  - 寿命件超限检查
  - 自动拆下旧装机记录
  - 更新零部件状态
- `remove()` - 零部件拆下业务逻辑
  - 状态检查
  - 关闭装机记录
  - 更新零部件状态

---

## 核心设计：零部件履历解耦

### 设计原则

零部件履历跟随零部件，而不是随机身。当序列号为 SN-12345 的电机从 A 飞机拆下并安装到 B 飞机时：
- 总飞行小时保留在零部件记录中
- 维修历史保留在零部件记录中
- 循环次数保留在零部件记录中

### 数据模型

**component 表** - 零部件主表
- 存储累积数据：`totalFlightHours`, `totalFlightCycles`, `batteryCycles`
- 这些数据随零部件流转

**component_installation 表** - 装机记录表
- 记录每次装机的快照
- `inheritedFlightHours` - 装机时继承的累积小时数
- `inheritedCycles` - 装机时继承的累积循环数
- `installedAt`, `removedAt` - 装机时间段

### 安装流程

```
┌─────────────────────────────────────────────────────────────┐
│                    零部件安装流程                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 检查零部件适航性                                          │
│     ├── isAirworthy = true                                   │
│     └── 寿命件未超限                                          │
│                                                             │
│  2. 检查当前装机状态                                          │
│     └── 如已装机，先执行拆下                                  │
│                                                             │
│  3. 创建新的装机记录                                          │
│     ├── 继承当前累积数据 (inheritedFlightHours)              │
│     └── 记录安装位置和时间                                    │
│                                                             │
│  4. 更新零部件状态                                           │
│     ├── status = INSTALLED                                   │
│     ├── currentAircraftId = 目标飞机                         │
│     └── installPosition = 安装位置                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 拆下流程

```
┌─────────────────────────────────────────────────────────────┐
│                    零部件拆下流程                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 验证零部件状态                                            │
│     └── status 必须是 INSTALLED                              │
│                                                             │
│  2. 关闭当前装机记录                                          │
│     ├── removedAt = 当前时间                                 │
│     └── removeNotes = 拆下原因                               │
│                                                             │
│  3. 更新零部件状态                                           │
│     ├── status = REMOVED                                    │
│     ├── currentAircraftId = null                            │
│     └── installPosition = null                              │
│                                                             │
│  4. 零部件累积数据保留（不清零）                              │
│     └── totalFlightHours, totalFlightCycles 保持不变        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 下一步工作

### 优先级 P0（必需）

1. **数据库迁移生成与执行**
   - 运行 `pnpm --filter @repo/db db:generate` 生成迁移文件
   - 运行 `pnpm --filter @repo/db db:push` 推送 schema
   - 运行 `pnpm --filter @repo/db db:seed` 初始化测试数据

2. **飞行记录 API 实现**
   - 创建 `flight-log` 模块
   - 实现飞行日志 CRUD
   - 实现飞行员报告 (PIREP) API
   - 实现放行记录 API

3. **工单系统 API 实现**
   - 创建 `work-order` 模块
   - 实现工单 CRUD 与状态流转
   - 实现工单任务管理
   - 实现工单零件管理

### 优先级 P1（重要）

4. **前端页面完善**
   - 飞行记录创建页面
   - 工单创建与管理页面
   - 库存列表页面

5. **单元测试**
   - Repository 层测试
   - Service 层测试
   - Controller 层测试

---

## API 端点总结

### 零部件管理

| 方法 | 端点 | 权限 | 说明 |
|------|------|------|------|
| GET | `/components` | ALL | 查询零部件列表 |
| GET | `/components/:id` | ALL | 查询零部件详情 |
| GET | `/components/serial/:serialNumber` | ALL | 按序列号查询 |
| GET | `/components?aircraftId=:id` | ALL | 查询飞机上的零部件 |
| GET | `/components/maintenance/due` | ALL | 查询待维保零部件 |
| POST | `/components` | ADMIN, MANAGER, MECHANIC | 创建零部件 |
| POST | `/components/install` | ADMIN, MANAGER, MECHANIC | 安装零部件 |
| POST | `/components/remove` | ADMIN, MANAGER, MECHANIC | 拆下零部件 |
| PUT | `/components/:id` | ADMIN, MANAGER, MECHANIC | 更新零部件 |
| DELETE | `/components/:id` | ADMIN, MANAGER | 删除零部件 |

---

## 变更文件清单

```
modified:   README.md
modified:   .env.example
modified:   docs/PROJECT_STATUS.md
modified:   docs/progress/README.md
modified:   apps/api/src/modules/asset/component.service.ts
modified:   apps/api/src/modules/asset/repositories/component.repository.ts

new file:   docs/database-setup.md
new file:   docs/reports/documentation-update-2025-01-16.md
new file:   docs/reports/redundancy-analysis-2025-01-16.md
new file:   docs/reports/phase-1-progress-2025-01-16.md
new file:   database/.gitkeep
new file:   database/migrations/.gitkeep
new file:   packages/db/scripts/seed.ts
```
