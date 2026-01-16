# DroneMaintenance-Ledger 项目进展报告

**更新时间**: 2026-01-16
**当前版本**: 0.1.0
**项目状态**: Phase 0-1 已完成，Phase 1 规划中

---

## 项目概述

DroneMaintenance-Ledger 是一个面向无人机和 eVTOL 飞行器的开源 MRO（维护、维修和运行）系统。它充当低空飞行器的"电子病历"系统，追踪零部件全生命周期、维保计划和适航合规状态。

### 核心设计理念

**零部件履历解耦**：零部件履历跟随零部件，而不是随机身。当零部件从一架飞机拆下并安装到另一架飞机时，其总飞行小时、维修记录和循环次数必须随之转移。这是航空业的行业标准实践。

---

## 六大核心中心

| 中心 | 功能 | 状态 |
|------|------|------|
| 1. 资产配置中心 | 机队档案、BOM树状结构、零部件全生命周期追踪 | ✅ Phase 0-1 已完成 |
| 2. 计划与工程中心 | 维修大纲定义、多维度触发器、预测性预警 | 🔄 数据模型已完成，API 待实现 |
| 3. 飞行与技术记录本 | 电子飞行记录、故障报告(PIREP)、适航放行 | 🔄 数据模型已完成，API 待实现 |
| 4. 维修执行中心 | 工单管理、数字化工卡、带 RII 的检查单 | 🔄 数据模型已完成，API 待实现 |
| 5. 库存与供应链 | 多仓库库存管理、库存预警、零件适用性校验 | ⏳ 待规划 |
| 6. 数据看板与报表 | 机队状态、适航履历、可靠性分析 | ⏳ 待规划 |

---

## 已完成工作 (Phase 0-1)

### 1. 项目基础设施
- [x] Monorepo 结构 (Turborepo + pnpm)
- [x] TypeScript 统一配置
- [x] ESLint 代码规范
- [x] 共享配置包 (@repo/config)
- [x] 依赖安装 (895 packages)

### 2. 数据库设计 (15个核心表)

#### 核心实体 (5表)
| 表名 | 说明 | 状态 |
|------|------|------|
| `user` | 用户表 (RBAC: 5种角色) | ✅ |
| `fleet` | 机队表 | ✅ |
| `aircraft` | 飞机表 (状态机: 4种状态) | ✅ |
| `component` | 零部件表 | ✅ |
| `component-installation` | 装机记录表 | ✅ |

#### 维保管理 (7表)
| 表名 | 说明 | 状态 |
|------|------|------|
| `maintenance-program` | 维保计划表 | ✅ |
| `maintenance-trigger` | 维保触发器表 | ✅ |
| `maintenance-schedule` | 维保调度表 | ✅ |
| `maintenance-history` | 维保历史表 | ✅ |
| `work-order` | 工单表 | ✅ |
| `work-order-task` | 工单任务表 | ✅ |
| `work-order-part` | 工单零件表 | ✅ |

#### 飞行记录 (3表)
| 表名 | 说明 | 状态 |
|------|------|------|
| `flight-log` | 飞行记录表 | ✅ |
| `pilot-report` | 飞行员报告表 (PIREP) | ✅ |
| `release-record` | 放行记录表 | ✅ |

### 3. 认证与授权系统
- [x] 密码加密 (bcrypt)
- [x] 用户注册 API
- [x] 登录 API (Local Strategy)
- [x] JWT 认证 (JWT Strategy)
- [x] 角色守卫 (RBAC Guard)
- [x] 用户管理 API

### 4. 资产配置中心 API

#### 机队管理 (/fleets) - 6个端点
- GET /fleets - 列出所有机队
- GET /fleets/:id - 获取机队详情
- GET /fleets/search/:query - 搜索机队
- POST /fleets - 创建机队
- PUT /fleets/:id - 更新机队
- DELETE /fleets/:id - 删除机队

#### 飞机管理 (/aircraft) - 8个端点
- GET /aircraft - 列出所有飞机
- GET /aircraft/:id - 获取飞机详情
- GET /aircraft?fleetId=:id - 按机队列出飞机
- GET /aircraft/status/counts - 获取状态统计
- POST /aircraft - 创建飞机
- PUT /aircraft/:id - 更新飞机
- PUT /aircraft/:id/status - 更新飞机状态
- DELETE /aircraft/:id - 删除飞机

#### 零部件管理 (/components) - 9个端点
- GET /components - 列出所有零部件
- GET /components/:id - 获取零部件详情
- GET /components/serial/:serialNumber - 按序列号查询
- GET /components?aircraftId=:id - 查询飞机上的零部件
- GET /components/maintenance/due - 查询需要维保的零部件
- POST /components - 创建零部件
- PUT /components/:id - 更新零部件
- DELETE /components/:id - 删除零部件
- POST /components/install - 安装零部件（框架已创建）
- POST /components/remove - 拆下零部件（框架已创建）

### 5. 前端基础
- [x] React 19 + Vite + Tailwind CSS
- [x] MobX 状态管理
- [x] 基础路由布局
- [x] 认证服务 (登录页、认证状态)
- [x] 基础页面组件 (仪表板、机队列表、飞机详情)

---

## 技术栈

| 层级 | 技术选择 | 版本 |
|------|----------|------|
| Monorepo | Turborepo + pnpm | ^2.3.3, ^9.15.4 |
| 后端 | NestJS | ^10.x |
| 前端 | React + MobX | ^19.x |
| UI 组件 | shadcn/ui + Tailwind CSS | ^3.x |
| ORM | Drizzle ORM | ^0.36.x |
| 数据库 | PostgreSQL + PostGIS | 16+ |
| 认证 | JWT + bcrypt | - |
| 校验 | Zod | ^3.x |
| 状态管理 | MobX | ^6.x |
| 路由 | React Router v7 | ^7.x |

---

## 遗留问题

### 高优先级
1. **数据库迁移** - Schema 已设计，但尚未生成和执行迁移
2. **装机/拆下事务** - 框架已创建，需要完善事务支持
3. **前端 UI 组件** - shadcn/ui 组件尚未完全集成

### 中优先级
4. **测试覆盖** - 单元测试和集成测试待添加
5. **错误处理** - 统一错误处理和用户友好提示
6. **日志系统** - 结构化日志和审计追踪

### 低优先级
7. **API 文档** - Swagger/OpenAPI 文档
8. **性能优化** - 查询优化、缓存策略

---

## 下一步工作 (Phase 1)

### 短期目标
1. 执行数据库迁移，建立开发环境
2. 完善装机/拆下事务逻辑
3. 实现飞行记录模块 API
4. 完善前端页面 UI

### 中期目标
1. 维保调度引擎 - 多触发器计算
2. 工单系统 - 完整的工单流转
3. 库存管理 - 航材库存
4. 数据看板 - 统计分析

详细的 Phase 1 计划请参见 [`/docs/progress/phase-1-plan.md`](./progress/phase-1-plan.md)

---

## 文档索引

| 文档 | 路径 | 说明 |
|------|------|------|
| 项目进展报告 | `/docs/PROJECT_STATUS.md` | 本文档 |
| Phase 1 计划 | `/docs/progress/phase-1-plan.md` | 下一阶段实施计划 |
| 完成报告 | `/docs/reports/completed/` | 已完成阶段的详细报告 |
| 文件结构规范 | `/docs/standards/file-structure.md` | 代码组织规范 |
| 命名规范 | `/docs/standards/naming-conventions.md` | 命名约定 |
| 进度文档模板 | `/docs/templates/progress-template.md` | 进度文档模板 |
| 完成报告模板 | `/docs/templates/completed-template.md` | 完成报告模板 |
