# Phase 1：飞行记录与维修执行中心

**开始时间**: 待定
**预计工期**: 2-3 周
**状态**: 规划中

## 概述

本阶段将实现飞行与技术记录本、维修执行中心的核心功能，完善装机/拆下事务逻辑，建立开发数据库环境。

## 目标

1. 建立可运行的开发数据库环境
2. 实现飞行记录模块完整功能
3. 实现工单系统基础功能
4. 完善前端 UI 组件和页面交互

---

## 任务分解

### 1.1 数据库迁移与环境搭建 (2-3天)

- [ ] 配置 PostgreSQL 开发数据库
- [ ] 使用 Drizzle Kit 生成迁移文件
- [ ] 执行数据库迁移
- [ ] 创建种子数据脚本
- [ ] 验证数据库连接和查询

**验收标准**:
- 开发环境可正常连接数据库
- 所有 15 个表成功创建
- 可执行基本 CRUD 操作

---

### 1.2 零部件装机/拆下事务完善 (2-3天)

- [ ] 实现装机事务逻辑
  - 检查零部件状态（已装机/已报废）
  - 检查目标飞机状态
  - 记录装机历史
  - 更新零部件当前安装位置
- [ ] 实现拆下事务逻辑
  - 验证拆下权限
  - 记录拆下原因
  - 记录拆下时飞行小时/循环数
  - 更新零部件状态
- [ ] 添加事务回滚机制
- [ ] 编写单元测试

**API 设计**:
```
POST /components/install
Body: {
  componentId: string,
  aircraftId: string,
  location: string,
  installedAt: Date,
  installedBy: string
}

POST /components/remove
Body: {
  componentId: string,
  reason: string,
  flightHours: number,
  flightCycles: number,
  removedAt: Date,
  removedBy: string
}
```

**验收标准**:
- 装机/拆下操作原子性保证
- 完整的历史记录追溯
- 单元测试覆盖率 > 80%

---

### 1.3 飞行记录模块 API (3-4天)

#### 1.3.1 飞行日志 (Flight Log)

- [ ] 创建飞行日志 CRUD API
- [ ] 实现飞行小时/循环统计
- [ ] 实现按飞机/飞行员/日期范围查询
- [ ] 添加飞行数据验证

**API 设计**:
| 端点 | 方法 | 描述 |
|------|------|------|
| `/flight-logs` | GET | 列出飞行记录 |
| `/flight-logs/:id` | GET | 获取飞行记录详情 |
| `/flight-logs/aircraft/:aircraftId` | GET | 按飞机查询 |
| `/flight-logs/pilot/:pilotId` | GET | 按飞行员查询 |
| `/flight-logs` | POST | 创建飞行记录 |
| `/flight-logs/:id` | PUT | 更新飞行记录 |
| `/flight-logs/:id` | DELETE | 删除飞行记录 |

#### 1.3.2 飞行员报告 (PIREP)

- [ ] 创建 PIREP CRUD API
- [ ] 实现故障关联
- [ ] 实现报告状态流转

**API 设计**:
| 端点 | 方法 | 描述 |
|------|------|------|
| `/pilot-reports` | GET | 列出飞行员报告 |
| `/pilot-reports/:id` | GET | 获取报告详情 |
| `/pilot-reports` | POST | 创建报告 |
| `/pilot-reports/:id/status` | PUT | 更新报告状态 |

#### 1.3.3 放行记录

- [ ] 创建放行记录 CRUD API
- [ ] 实现放行验证逻辑
- [ ] 实现放行签名机制

**API 设计**:
| 端点 | 方法 | 描述 |
|------|------|------|
| `/release-records` | GET | 列出放行记录 |
| `/release-records/:id` | GET | 获取放行详情 |
| `/release-records/aircraft/:aircraftId/latest` | GET | 获取最新放行 |
| `/release-records` | POST | 创建放行记录 |

**验收标准**:
- 所有 API 端点可正常工作
- 飞行小时/循环统计准确
- 与零部件履历关联正确

---

### 1.4 工单系统基础 API (3-4天)

#### 1.4.1 工单 CRUD

- [ ] 创建工单 CRUD API
- [ ] 实现工单状态流转 (OPEN/IN_PROGRESS/COMPLETED/CANCELLED)
- [ ] 实现工单优先级管理
- [ ] 添加工单分配功能

**API 设计**:
| 端点 | 方法 | 描述 |
|------|------|------|
| `/work-orders` | GET | 列出工单 |
| `/work-orders/:id` | GET | 获取工单详情 |
| `/work-orders/aircraft/:aircraftId` | GET | 按飞机查询工单 |
| `/work-orders` | POST | 创建工单 |
| `/work-orders/:id` | PUT | 更新工单 |
| `/work-orders/:id/status` | PUT | 更新工单状态 |
| `/work-orders/:id/assign` | PUT | 分配工单 |

#### 1.4.2 工单任务

- [ ] 创建工单任务 CRUD API
- [ ] 实现任务状态流转
- [ ] 实现 RII（必检项）标记
- [ ] 实现任务完成验证

**API 设计**:
| 端点 | 方法 | 描述 |
|------|------|------|
| `/work-orders/:orderId/tasks` | GET | 列出工单任务 |
| `/work-orders/:orderId/tasks` | POST | 创建任务 |
| `/work-orders/:orderId/tasks/:taskId` | PUT | 更新任务 |
| `/work-orders/:orderId/tasks/:taskId/complete` | PUT | 完成任务 |

#### 1.4.3 工单零件

- [ ] 创建工单零件 API
- [ ] 实现零件领料逻辑
- [ ] 实现零件退料逻辑

**验收标准**:
- 工单状态流转正确
- 任务与工单关联正确
- RII 项目必须检验员签字

---

### 1.5 前端页面完善 (4-5天)

#### 1.5.1 UI 组件库集成

- [ ] 初始化 shadcn/ui
- [ ] 配置常用组件 (Button, Input, Table, Form, Dialog, etc.)
- [ ] 创建主题配置

#### 1.5.2 飞行记录页面

- [ ] 飞行记录列表页
- [ ] 飞行记录详情页
- [ ] 飞行记录创建/编辑表单
- [ ] 飞行统计展示

#### 1.5.3 工单管理页面

- [ ] 工单列表页（含筛选、排序）
- [ ] 工单详情页（含任务列表）
- [ ] 工单创建表单
- [ ] 工单状态更新界面

#### 1.5.4 完善现有页面

- [ ] 机队列表页添加操作按钮
- [ ] 飞机详情页添加零部件列表
- [ ] 零部件列表页添加履历展示

**验收标准**:
- 页面布局美观、交互流畅
- 表单验证正确
- 错误提示友好

---

## 技术要点

### 数据库事务

装机/拆下操作需要使用数据库事务保证原子性：

```typescript
// 示例：装机事务
async installComponent(params: InstallComponentDto) {
  return this.db.transaction(async (tx) => {
    // 1. 检查零部件状态
    // 2. 检查目标飞机状态
    // 3. 创建装机记录
    // 4. 更新零部件状态
    // 5. 更新飞机 BOM
  });
}
```

### 零部件履历更新

飞行记录创建时，需要更新相关零部件的累积数据：

```typescript
// 飞行小时更新逻辑
async updateComponentUsage(aircraftId: string, flightHours: number) {
  const components = await this.db.findInstalledComponents(aircraftId);
  for (const component of components) {
    await this.db.update(component.id, {
      totalFlightHours: component.totalFlightHours + flightHours,
      lastFlightDate: new Date(),
    });
  }
}
```

### RBAC 权限控制

不同角色对不同操作的权限：

| 操作 | PILOT | MECHANIC | INSPECTOR | MANAGER | ADMIN |
|------|-------|----------|-----------|---------|-------|
| 创建飞行记录 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 创建工单 | ❌ | ✅ | ✅ | ✅ | ✅ |
| 完成任务 | ❌ | ✅ | ✅ | ✅ | ✅ |
| RII 签字 | ❌ | ❌ | ✅ | ✅ | ✅ |
| 删除记录 | ❌ | ❌ | ❌ | ✅ | ✅ |

---

## 问题与风险

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 数据库迁移失败 | 高 | 先在测试环境验证，做好备份 |
| 事务性能问题 | 中 | 合理设计事务边界，添加必要索引 |
| 前端组件集成复杂度 | 中 | 先集成核心组件，逐步扩展 |
| 工单状态流转逻辑复杂 | 中 | 使用状态机模式，充分测试 |

---

## 文件变更预期

```
packages/db/
├── migrations/           # 新增迁移文件
└── seed/                # 新增种子数据

apps/api/src/modules/
├── flight/              # 新增飞行记录模块
│   ├── flight-log.module.ts
│   ├── flight-log.controller.ts
│   ├── flight-log.service.ts
│   ├── pilot-report.controller.ts
│   └── release-record.controller.ts
└── work-order/          # 新增工单模块
    ├── work-order.module.ts
    ├── work-order.controller.ts
    ├── work-order.service.ts
    ├── task.service.ts
    └── part.service.ts

apps/web/src/
├── components/ui/       # shadcn/ui 组件
├── pages/
│   ├── flight-log-list-page.tsx
│   ├── flight-log-detail-page.tsx
│   ├── work-order-list-page.tsx
│   └── work-order-detail-page.tsx
```

---

## 依赖

本阶段依赖于 Phase 0-1 的完成：
- ✅ 数据库 Schema 设计
- ✅ 认证与授权系统
- ✅ 资产配置中心 API
