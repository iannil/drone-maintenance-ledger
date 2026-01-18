# Phase 2 开发计划：系统集成与功能完善

**创建时间**: 2026-01-16
**更新时间**: 2026-01-17
**阶段目标**: 完成前后端集成，实现系统可用
**当前状态**: Sprint 4 已完成，Sprint 5 待开始

---

## 阶段概述

Phase 1 已完成前端框架（51 个页面）和核心 API（92 个端点）的开发。Phase 2 的核心目标是**让系统真正可用**——执行数据库迁移、完成前后端对接、补充缺失的 API。

---

## 任务分解

### Sprint 1: 基础设施就绪（P0）✅ 已完成

**目标**: 数据库可用，系统可启动
**完成时间**: 2026-01-16

#### 1.1 数据库迁移执行 ✅
| 任务 | 命令/操作 | 状态 |
|------|-----------|------|
| ~~安装 PostgreSQL~~ | 使用 SQLite 替代 | ✅ 已完成 |
| 创建数据库 | `database/local.db` | ✅ 已完成 |
| 配置环境变量 | 编辑 `.env` 文件 | ✅ 已完成 |
| 推送 Schema | `pnpm --filter @repo/db db:push` | ✅ 已完成 |
| 初始化种子数据 | `pnpm --filter @repo/db db:seed` | ✅ 已完成 |
| 验证数据库 | `pnpm --filter @repo/db db:studio` | ✅ 已完成 |

#### 1.2 后端服务启动验证 ✅
| 任务 | 状态 |
|------|------|
| 安装依赖 | ✅ 已完成 |
| 启动 API 服务 | ✅ 已完成 |
| 测试认证 API | ✅ 已完成 |
| 测试资产 API | ✅ 已完成 |

**完成报告**: [phase-2-sprint-1-infrastructure.md](../reports/completed/phase-2-sprint-1-infrastructure.md)

---

### Sprint 2: 前后端对接（P0）✅ 已完成

**目标**: 前端页面使用真实 API 数据
**完成时间**: 2026-01-17

**完成报告**: [phase-2-sprint-2-api-integration.md](../reports/completed/phase-2-sprint-2-api-integration.md)

#### 2.1 API 客户端完善 ✅
| 任务 | 文件 | 状态 |
|------|------|------|
| 配置 API 基础 URL | `apps/web/src/services/api.ts` | ✅ |
| 完善请求拦截器 | `apps/web/src/services/api.ts` | ✅ |
| 完善响应拦截器 | `apps/web/src/services/api.ts` | ✅ |
| 统一错误处理 | `apps/web/src/services/api.ts` | ✅ |

#### 2.2 核心页面 API 对接 ✅

| 批次 | 页面 | 状态 |
|------|------|------|
| 第一批 | 登录页、仪表板 | ✅ |
| 第二批 | 机队/飞机/零部件 | ✅ |
| 第三批 | 飞行记录 | ✅ |
| 第四批 | 工单管理 | ✅ |

---

### Sprint 3: 缺失 API 开发（P1）✅ 已完成

**目标**: 补充前端页面所需但尚未实现的 API
**完成时间**: 2026-01-17

#### 3.1 库存管理 API ✅ (10 个端点)
| 端点 | 方法 | 说明 | 状态 |
|------|------|------|------|
| `/inventory/alerts` | GET | 库存预警列表 | ✅ |
| `/inventory/search/:query` | GET | 搜索库存 | ✅ |
| `/inventory/:id` | GET | 库存详情 | ✅ |
| `/inventory` | GET | 库存列表 | ✅ |
| `/inventory` | POST | 创建库存记录 | ✅ |
| `/inventory/:id` | PUT | 更新库存 | ✅ |
| `/inventory/:id/adjust` | POST | 库存调整 | ✅ |
| `/inventory/:id/reserve` | POST | 预留库存 | ✅ |
| `/inventory/:id/release` | POST | 释放预留 | ✅ |
| `/inventory/:id` | DELETE | 删除库存 | ✅ |

#### 3.2 仓库管理 API ✅ (6 个端点)
| 端点 | 方法 | 说明 | 状态 |
|------|------|------|------|
| `/warehouses` | GET | 仓库列表 | ✅ |
| `/warehouses/:id` | GET | 仓库详情 | ✅ |
| `/warehouses/search/:query` | GET | 搜索仓库 | ✅ |
| `/warehouses` | POST | 创建仓库 | ✅ |
| `/warehouses/:id` | PUT | 更新仓库 | ✅ |
| `/warehouses/:id` | DELETE | 删除仓库 | ✅ |

#### 3.3 供应商管理 API ✅ (6 个端点)
| 端点 | 方法 | 说明 | 状态 |
|------|------|------|------|
| `/suppliers` | GET | 供应商列表 | ✅ |
| `/suppliers/:id` | GET | 供应商详情 | ✅ |
| `/suppliers/search/:query` | GET | 搜索供应商 | ✅ |
| `/suppliers` | POST | 创建供应商 | ✅ |
| `/suppliers/:id` | PUT | 更新供应商 | ✅ |
| `/suppliers/:id` | DELETE | 删除供应商 | ✅ |

#### 3.4 采购申请 API ✅ (11 个端点)
| 端点 | 方法 | 说明 | 状态 |
|------|------|------|------|
| `/purchase-requests` | GET | 采购申请列表 | ✅ |
| `/purchase-requests/:id` | GET | 采购申请详情 | ✅ |
| `/purchase-requests` | POST | 创建采购申请 | ✅ |
| `/purchase-requests/:id` | PUT | 更新采购申请 | ✅ |
| `/purchase-requests/:id/submit` | POST | 提交审批 | ✅ |
| `/purchase-requests/:id/approve` | POST | 审批通过 | ✅ |
| `/purchase-requests/:id/reject` | POST | 审批拒绝 | ✅ |
| `/purchase-requests/:id/cancel` | POST | 取消申请 | ✅ |
| `/purchase-requests/:id` | DELETE | 删除申请 | ✅ |
| `/purchase-requests/:id/items` | POST | 添加明细 | ✅ |
| `/purchase-requests/:id/items/:itemId` | DELETE | 删除明细 | ✅ |

#### 3.5 采购订单 API ✅ (12 个端点)
| 端点 | 方法 | 说明 | 状态 |
|------|------|------|------|
| `/purchase-orders` | GET | 采购订单列表 | ✅ |
| `/purchase-orders/:id` | GET | 采购订单详情 | ✅ |
| `/purchase-orders` | POST | 创建采购订单 | ✅ |
| `/purchase-orders/:id` | PUT | 更新采购订单 | ✅ |
| `/purchase-orders/:id/submit` | POST | 提交审批 | ✅ |
| `/purchase-orders/:id/approve` | POST | 审批通过 | ✅ |
| `/purchase-orders/:id/send` | POST | 发送给供应商 | ✅ |
| `/purchase-orders/:id/confirm` | POST | 供应商确认 | ✅ |
| `/purchase-orders/:id/receive` | POST | 收货 | ✅ |
| `/purchase-orders/:id/complete` | POST | 完成订单 | ✅ |
| `/purchase-orders/:id/cancel` | POST | 取消订单 | ✅ |
| `/purchase-orders/:id` | DELETE | 删除订单 | ✅ |

**Sprint 3 新增端点数**: 45 个

---

### Sprint 4: 维保调度引擎（P1）✅ 已完成

**目标**: 实现自动维保提醒和工单生成
**完成时间**: 2026-01-17

#### 4.1 触发器计算服务 ✅
| 功能 | 说明 | 状态 |
|------|------|------|
| 日历触发器 | 基于日期计算下次维保时间 | ✅ |
| 飞行小时触发器 | 基于累计飞行小时计算 | ✅ |
| 起降循环触发器 | 基于循环次数计算 | ✅ |
| 电池循环触发器 | 基于充放电次数计算 | ✅ |
| 年度日历触发器 | 基于年度特定日期计算 | ✅ |

#### 4.2 调度服务 ✅
| 功能 | 说明 | 状态 |
|------|------|------|
| 维保到期检查 | 检查所有维保计划状态 | ✅ |
| 预警生成 | 生成 WARNING/DUE/OVERDUE 预警 | ✅ |
| 自动工单生成 | 到期自动创建工单 | ✅ |
| 飞机维保初始化 | 自动为新飞机创建维保计划 | ✅ |

#### 4.3 API 端点 ✅ (21 个端点)
| 端点 | 方法 | 说明 | 状态 |
|------|------|------|------|
| `/maintenance-scheduler/run` | POST | 运行调度器 | ✅ |
| `/maintenance-scheduler/create-work-orders` | POST | 批量创建工单 | ✅ |
| `/maintenance-scheduler/alerts` | GET | 获取维保预警 | ✅ |
| `/maintenance-scheduler/aircraft/:id/initialize` | POST | 初始化飞机维保 | ✅ |
| `/maintenance-scheduler/schedules/:id/complete` | POST | 完成维保计划 | ✅ |
| `/maintenance-scheduler/programs` | GET | 维保程序列表 | ✅ |
| `/maintenance-scheduler/programs/:id` | GET | 维保程序详情 | ✅ |
| `/maintenance-scheduler/programs` | POST | 创建维保程序 | ✅ |
| `/maintenance-scheduler/programs/default/:model` | GET | 获取默认程序 | ✅ |
| `/maintenance-scheduler/triggers` | GET | 触发器列表 | ✅ |
| `/maintenance-scheduler/triggers/:id` | GET | 触发器详情 | ✅ |
| `/maintenance-scheduler/triggers` | POST | 创建触发器 | ✅ |
| `/maintenance-scheduler/programs/:id/triggers` | GET | 程序触发器列表 | ✅ |
| `/maintenance-scheduler/schedules` | GET | 维保计划列表 | ✅ |
| `/maintenance-scheduler/schedules/:id` | GET | 维保计划详情 | ✅ |
| `/maintenance-scheduler/aircraft/:id/schedules` | GET | 飞机维保计划 | ✅ |
| `/maintenance-scheduler/schedules/status/due-overdue` | GET | 到期/逾期计划 | ✅ |
| `/maintenance-scheduler/schedules/due-within/:days` | GET | N天内到期计划 | ✅ |
| `/maintenance-scheduler/schedules/counts` | GET | 状态统计 | ✅ |
| `/maintenance-scheduler/calculate-preview` | POST | 计算预览 | ✅ |

**Sprint 4 新增端点数**: 21 个

#### 4.4 新增文件
```
apps/api/src/modules/maintenance/
├── repositories/
│   ├── maintenance-program.repository.ts
│   ├── maintenance-trigger.repository.ts
│   └── maintenance-schedule.repository.ts
├── trigger-calculation.service.ts
├── maintenance-scheduler.service.ts
└── maintenance-scheduler.controller.ts
```

---

### Sprint 5: 测试与质量（P0）

**目标**: 保证代码质量

#### 5.1 单元测试
| 模块 | 测试内容 | 工作量 |
|------|----------|--------|
| Repository 层 | 数据访问逻辑 | 2 天 |
| Service 层 | 业务逻辑 | 2 天 |
| Controller 层 | API 端点 | 1 天 |

#### 5.2 集成测试
| 测试场景 | 说明 | 工作量 |
|----------|------|--------|
| 认证流程 | 注册→登录→访问受保护资源 | 0.5 天 |
| 工单流程 | 创建→分配→执行→完成→放行 | 1 天 |
| 零部件流转 | 装机→飞行→拆下→安装到另一飞机 | 1 天 |

**预计总工作量**: 7.5 天

---

## 里程碑与验收

### M1: 系统可启动（Sprint 1 完成）✅ 已达成
- [x] 数据库迁移成功
- [x] 种子数据初始化
- [x] API 服务启动正常
- [x] 可通过 API 登录

### M2: 核心功能可用（Sprint 2 完成）✅ 已达成
- [x] 登录页对接真实 API
- [x] 资产配置页面数据真实
- [x] 飞行记录页面数据真实
- [x] 工单页面数据真实
- [x] TypeScript 编译错误已修复

### M3: 功能完整（Sprint 3-4 完成）✅ 已达成
- [x] 库存管理功能可用
- [x] 采购管理功能可用
- [x] 仪表板统计数据真实
- [x] 维保预警正常工作

### M4: 质量达标（Sprint 5 完成）⏳ 待开始
- [x] TypeScript 编译错误修复
- [ ] 单元测试覆盖率 > 70%
- [ ] 集成测试通过
- [ ] 无 P0 级别 Bug

---

## 遗留问题处理

### 高优先级（本阶段解决）
| 问题 | 解决方案 | 状态 |
|------|----------|------|
| 数据库迁移未执行 | 执行 db:push | ✅ 已完成 |
| 前端使用 Mock 数据 | API 对接 | ✅ 已完成 |
| TypeScript 编译错误 | 修复约 56 个错误 | ✅ 已完成 |
| 库存 API 缺失 | 开发库存模块 | ✅ 已完成 |
| 统计 API 缺失 | 开发统计模块 | ✅ 已完成 |

### 中优先级（下阶段解决）
| 问题 | 说明 |
|------|------|
| 错误处理不完善 | 统一错误码和提示 |
| 日志系统缺失 | 接入结构化日志 |
| API 文档缺失 | 接入 Swagger |

### 低优先级（后续迭代）
| 问题 | 说明 |
|------|------|
| 离线支持 | Service Worker |
| 性能优化 | 查询优化、缓存 |
| 移动端适配 | PWA |

---

## 风险与应对

| 风险 | 影响 | 应对措施 |
|------|------|----------|
| API 接口不匹配 | 前后端对接延误 | 先定义接口契约，再开发 |
| 数据库迁移失败 | 无法启动系统 | 保留回滚脚本 |
| 测试用例不足 | 质量隐患 | 关键路径优先覆盖 |
| 维保引擎逻辑复杂 | 开发延期 | 简化首版，迭代完善 |

---

## 资源需求

### 开发环境
- PostgreSQL 16+
- Node.js 20+
- pnpm 9+

### 测试账号
| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | password123 |
| 经理 | manager | password123 |
| 飞手 | pilot | password123 |
| 维修工 | mechanic | password123 |
| 检验员 | inspector | password123 |

---

## 总工作量估算

| Sprint | 内容 | 工作量 |
|--------|------|--------|
| Sprint 1 | 基础设施就绪 | 1 天 |
| Sprint 2 | 前后端对接 | 11 天 |
| Sprint 3 | 缺失 API 开发 | 9 天 |
| Sprint 4 | 维保调度引擎 | 5 天 |
| Sprint 5 | 测试与质量 | 7.5 天 |
| **总计** | | **33.5 天** |

---

## 下一步行动

1. **已完成**: TypeScript 编译错误已全部修复（2026-01-17）
2. **已完成**: Sprint 3 库存与供应链 API 开发（2026-01-17，45 个端点）
3. **已完成**: Sprint 4 维保调度引擎开发（2026-01-17，21 个端点）
4. **下一步**: Sprint 5 - 测试与质量
5. **短期目标**: 完成 Phase 2 所有功能

---

## API 端点统计

| Sprint | 模块 | 端点数 |
|--------|------|--------|
| Phase 1 | 核心 API | 92 |
| Sprint 3 | 库存与供应链 | 45 |
| Sprint 4 | 维保调度引擎 | 21 |
| **总计** | | **158** |
