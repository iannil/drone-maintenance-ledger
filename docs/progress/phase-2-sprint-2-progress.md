# Sprint 2 进度报告：前后端对接 (第一批)

**时间**: 2026-01-16
**执行人**: Claude Code

---

## 执行摘要

完成了 Sprint 2 第一批前后端对接任务，包括 API 客户端完善、登录页对接、仪表板统计 API 开发及对接、机队管理页面对接、飞机管理页面对接。

---

## 完成任务清单

### 2.1 API 客户端完善 ✅

| 任务 | 文件 | 说明 |
|------|------|------|
| ApiError 类 | `apps/web/src/services/api.ts` | 包含 status 和 code 属性 |
| 错误监听器 | `apps/web/src/services/api.ts` | `onApiError()` 注册全局错误监听 |
| 401 自动跳转 | `apps/web/src/services/api.ts` | 401 响应自动重定向到登录页 |
| 204 响应处理 | `apps/web/src/services/api.ts` | 正确处理 No Content 响应 |
| Toast 组件 | `apps/web/src/components/ui/toast.tsx` | 新增 Toast 通知组件 |
| AlertDialog 组件 | `apps/web/src/components/ui/alert-dialog.tsx` | 新增确认对话框组件 |

### 2.2 仪表板统计 API ✅

**新增后端模块**: `apps/api/src/modules/stats/`

| 端点 | 方法 | 说明 |
|------|------|------|
| `/stats/dashboard` | GET | 仪表板统计数据（飞机数、工单数、飞行统计） |
| `/stats/activities` | GET | 最近活动记录 |
| `/stats/due-maintenance` | GET | 即将到期的维保项目 |

**新增前端服务**: `apps/web/src/services/stats.service.ts`

### 2.3 仪表板页面对接 ✅

| 文件 | 变更 |
|------|------|
| `apps/web/src/pages/dashboard-page.tsx` | 使用 statsService 加载真实数据 |

功能：
- 显示飞机总数、可用飞机、维护中、停飞数量
- 显示待处理工单数量
- 显示可用率
- 显示维保预警列表
- 显示最近活动记录
- 加载状态骨架屏

### 2.4 机队管理页面对接 ✅

**新增前端服务**: `apps/web/src/services/fleet.service.ts`

| 文件 | 变更 |
|------|------|
| `apps/web/src/pages/fleet-list-page.tsx` | 使用 fleetService 加载真实数据 |
| `apps/web/src/pages/fleet-detail-page.tsx` | 使用 fleetService 和 aircraftService 加载真实数据 |

功能：
- 机队列表从 API 加载
- 每个机队显示飞机状态统计
- 机队详情页显示飞机列表
- 删除确认对话框
- 加载状态骨架屏

### 2.5 飞机管理页面对接 ✅

| 文件 | 变更 |
|------|------|
| `apps/web/src/pages/aircraft-list-page.tsx` | 使用 fullAircraftService 和 fleetService 加载真实数据 |

功能：
- 飞机列表从 API 加载
- 状态筛选（可用、维护中、停飞）
- 机队筛选
- 搜索功能
- 删除确认对话框
- 加载状态骨架屏

---

## 新增文件

| 文件路径 | 说明 |
|----------|------|
| `apps/api/src/modules/stats/stats.service.ts` | 统计服务 |
| `apps/api/src/modules/stats/stats.controller.ts` | 统计控制器 |
| `apps/api/src/modules/stats/stats.module.ts` | 统计模块 |
| `apps/web/src/services/stats.service.ts` | 前端统计服务 |
| `apps/web/src/services/fleet.service.ts` | 前端机队服务 |
| `apps/web/src/components/ui/toast.tsx` | Toast 通知组件 |
| `apps/web/src/components/ui/alert-dialog.tsx` | 确认对话框组件 |

---

## 修改文件

| 文件路径 | 变更类型 |
|----------|----------|
| `apps/api/src/app.module.ts` | 添加 StatsModule 导入 |
| `apps/web/src/main.tsx` | 添加 ToastProvider 和全局错误处理 |
| `apps/web/src/services/api.ts` | 增强错误处理和拦截器 |
| `apps/web/src/pages/dashboard-page.tsx` | API 对接 |
| `apps/web/src/pages/fleet-list-page.tsx` | API 对接 |
| `apps/web/src/pages/fleet-detail-page.tsx` | API 对接 |
| `apps/web/src/pages/aircraft-list-page.tsx` | API 对接 |

---

## 技术决策

### 1. Toast 组件实现

选择自己实现而非使用第三方库，原因：
- 项目已有 shadcn/ui 风格的组件
- 减少依赖
- 便于定制

### 2. 状态映射

后端使用 `AVAILABLE`, `IN_MAINTENANCE`, `AOG`, `RETIRED`
前端 StatusBadge 组件使用 `SERVICEABLE`, `MAINTENANCE`, `GROUNDED`, `RETIRED`

创建 STATUS_MAP 进行映射，保持前端组件不变。

### 3. 加载状态

所有页面都使用 Skeleton 组件显示加载状态，提升用户体验。

---

## 待解决问题

### 预存在的 TypeScript 错误

以下文件有预存在的类型错误，不影响本次变更：
- `src/components/common/status-badge.tsx` - exactOptionalPropertyTypes 问题
- `src/pages/aircraft-form-page.tsx` - useForm 类型问题
- `src/pages/component-bom-page.tsx` - BOMNode 类型问题
- `src/pages/pirep-form-page.tsx` - 重复的 model key

这些错误已记录，待后续修复。

---

## 下一步工作

1. **零部件管理页面对接** - 待完成
2. **飞行记录页面对接** - 待完成
3. **工单管理页面对接** - 待完成
4. **修复预存在的 TypeScript 错误**

---

## 构建验证

```bash
# Vite 构建成功
npx vite build
✓ 1781 modules transformed.
✓ built in 3.38s
```

---

## API 验证清单

| API | 状态 |
|-----|------|
| GET /api/stats/dashboard | ✅ 已对接 |
| GET /api/stats/activities | ✅ 已对接 |
| GET /api/stats/due-maintenance | ✅ 已对接 |
| GET /api/fleets | ✅ 已对接 |
| GET /api/fleets/:id | ✅ 已对接 |
| DELETE /api/fleets/:id | ✅ 已对接 |
| GET /api/aircraft | ✅ 已对接 |
| GET /api/aircraft/status/counts | ✅ 已对接 |
| DELETE /api/aircraft/:id | ✅ 已对接 |
