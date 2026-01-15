# 阶段 0：项目基础设施搭建

**时间**: 2026-01-16
**状态**: 进行中

## 概述

本项目采用 Monorepo 架构，使用 Turborepo + pnpm 进行工作空间管理。

## 已完成工作

### 1. 根配置文件
- [x] `package.json` - 根依赖和脚本配置
- [x] `pnpm-workspace.yaml` - pnpm workspace 配置
- [x] `turbo.json` - Turborepo 任务配置
- [x] `tsconfig.base.json` - TypeScript 基础配置
- [x] `.gitignore` - Git 忽略规则
- [x] `.env.example` - 环境变量模板

### 2. packages/config - 共享配置包
- [x] `package.json` - 配置包定义
- [x] `eslint.ts` - ESLint 配置
- [x] `tsconfig/node.json` - Node.js TS 配置
- [x] `tsconfig/react.json` - React TS 配置
- [x] `tsconfig/library.json` - 库 TS 配置

### 3. packages/db - 数据库包
- [x] `package.json` - 数据库包依赖
- [x] `drizzle.config.ts` - Drizzle ORM 配置
- [x] 核心实体 Schema:
  - `user.ts` - 用户表 (RBAC)
  - `fleet.ts` - 机队表
  - `aircraft.ts` - 飞机表
  - `component.ts` - 零部件表（履历解耦核心）
  - `component-installation.ts` - 装机记录表

### 4. apps/api - NestJS 后端
- [x] `package.json` - 后端依赖
- [x] `nest-cli.json` - Nest CLI 配置
- [x] `main.ts` - 应用入口
- [x] `app.module.ts` - 根模块
- [x] `config/validation.ts` - Zod 配置验证
- [x] `modules/auth/` - 认证模块
  - `auth.module.ts`
  - `auth.service.ts`
  - `auth.controller.ts`
  - `strategies/jwt.strategy.ts`
  - `strategies/local.strategy.ts`
- [x] `modules/user/` - 用户模块
  - `user.module.ts`
  - `user.service.ts`
  - `user.controller.ts`
- [x] `common/guards/roles.guard.ts` - 角色守卫
- [x] `common/decorators/roles.decorator.ts` - 角色装饰器
- [x] `common/decorators/user.decorator.ts` - 用户装饰器
- [x] `common/filters/http-exception.filter.ts` - 异常过滤器

### 5. apps/web - React 前端
- [x] `package.json` - 前端依赖
- [x] `vite.config.ts` - Vite 配置
- [x] `tailwind.config.js` - Tailwind CSS 配置
- [x] `index.html` - HTML 模板
- [x] `main.tsx` - 应用入口
- [x] `router.tsx` - 路由配置
- [x] `stores/auth.store.ts` - MobX 认证状态
- [x] `services/api.ts` - API 客户端
- [x] `services/auth.service.ts` - 认证服务
- [x] 页面组件:
  - `login-page.tsx` - 登录页
  - `dashboard-layout.tsx` - 仪表板布局
  - `dashboard-page.tsx` - 首页
  - `fleet-list-page.tsx` - 机队列表
  - `aircraft-detail-page.tsx` - 飞机详情

## 技术栈确认

| 层级 | 技术选择 |
|------|----------|
| Monorepo | Turborepo + pnpm |
| 后端 | NestJS |
| 前端 | React + MobX |
| UI 组件 | shadcn/ui |
| ORM | Drizzle ORM |
| 数据库 | PostgreSQL + PostGIS |
| 认证 | JWT |
| 校验 | Zod |

## 下一步工作

1. 安装依赖并验证项目可运行
2. 完善数据库 Schema（添加维保计划、工单、飞行记录等表）
3. 实现用户注册和密码加密
4. 实现资产配置中心 API 和前端页面
5. 实现零部件履历解耦逻辑
