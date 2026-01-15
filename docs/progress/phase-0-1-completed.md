# 阶段 0-1：项目基础设施 + 数据模型 + 认证 + 资产配置中心

**时间**: 2026-01-16
**状态**: 已完成

## 概述

本阶段完成了项目基础设施搭建、完整数据库模型设计、用户认证系统和资产配置中心的核心 CRUD 功能。

## 已完成工作

### 1. 项目基础设施
- [x] Monorepo 结构
- [x] Turborepo 配置
- [x] TypeScript 配置
- [x] ESLint 配置
- [x] 依赖安装 (895 packages)

### 2. 数据库 Schema 完整设计

#### 核心实体
- [x] `user` - 用户表 (RBAC)
- [x] `fleet` - 机队表
- [x] `aircraft` - 飞机表
- [x] `component` - 零部件表（履历解耦核心）
- [x] `component-installation` - 装机记录表

#### 维保管理
- [x] `maintenance-program` - 维保计划表
- [x] `maintenance-trigger` - 维保触发器表
- [x] `maintenance-schedule` - 维保调度表
- [x] `maintenance-history` - 维保历史表
- [x] `work-order` - 工单表
- [x] `work-order-task` - 工单任务表
- [x] `work-order-part` - 工单零件表

#### 飞行记录
- [x] `flight-log` - 飞行记录表
- [x] `pilot-report` - 飞行员报告表 (PIREP)
- [x] `release-record` - 放行记录表

### 3. 认证与授权
- [x] 密码加密 (bcrypt)
- [x] 用户注册 API
- [x] 登录 API
- [x] JWT 认证
- [x] 角色守卫 (RBAC)
- [x] 用户管理 API

### 4. 资产配置中心 API

#### 机队管理 (`/fleets`)
- [x] `GET /fleets` - 列出所有机队
- [x] `GET /fleets/:id` - 获取机队详情
- [x] `GET /fleets/search/:query` - 搜索机队
- [x] `POST /fleets` - 创建机队
- [x] `PUT /fleets/:id` - 更新机队
- [x] `DELETE /fleets/:id` - 删除机队

#### 飞机管理 (`/aircraft`)
- [x] `GET /aircraft` - 列出所有飞机
- [x] `GET /aircraft/:id` - 获取飞机详情
- [x] `GET /aircraft?fleetId=:id` - 按机队列出飞机
- [x] `GET /aircraft/status/counts` - 获取状态统计
- [x] `POST /aircraft` - 创建飞机
- [x] `PUT /aircraft/:id` - 更新飞机
- [x] `PUT /aircraft/:id/status` - 更新飞机状态
- [x] `DELETE /aircraft/:id` - 删除飞机

#### 零部件管理 (`/components`)
- [x] `GET /components` - 列出所有零部件
- [x] `GET /components/:id` - 获取零部件详情
- [x] `GET /components/serial/:serialNumber` - 按序列号查询
- [x] `GET /components?aircraftId=:id` - 查询飞机上的零部件
- [x] `GET /components/maintenance/due` - 查询需要维保的零部件
- [x] `POST /components` - 创建零部件
- [x] `PUT /components/:id` - 更新零部件
- [x] `DELETE /components/:id` - 删除零部件
- [x] `POST /components/install` - 安装零部件（框架已创建）
- [x] `POST /components/remove` - 拆下零部件（框架已创建）

## 技术栈确认

| 层级 | 技术选择 |
|------|----------|
| Monorepo | Turborepo + pnpm |
| 后端 | NestJS |
| 前端 | React + MobX |
| UI 组件 | shadcn/ui |
| ORM | Drizzle ORM |
| 数据库 | PostgreSQL + PostGIS |
| 认证 | JWT + bcrypt |
| 校验 | Zod |

## 下一步工作

### 短期
1. **数据库迁移** - 使用 Drizzle Kit 生成并执行迁移
2. **完善装机/拆下逻辑** - 需要事务支持
3. **飞行记录模块** - 实现飞行日志 API
4. **前端开发** - 实现对应的前端页面

### 中期
1. 维保调度引擎 - 多触发器计算
2. 工单系统 - 完整的工单流转
3. 库存管理 - 航材库存
4. 数据看板 - 统计分析

## 文件变更清单

主要创建/修改的文件：

```
packages/
├── db/src/schema/
│   ├── core/ (5 files)
│   ├── maintenance/ (7 files)
│   └── flight/ (3 files)
├── types/ (3 files)
├── ui/ (3 files)
└── config/ (4 files)

apps/
├── api/src/modules/
│   ├── auth/ (5 files)
│   ├── user/ (4 files)
│   └── asset/ (13 files)
└── web/src/ (14 files)

docs/
├── progress/ (1 file)
├── standards/ (2 files)
└── templates/ (2 files)
```
