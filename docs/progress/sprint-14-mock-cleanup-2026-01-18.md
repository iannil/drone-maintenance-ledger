# Sprint 14 进度报告 - Mock 数据清理

**日期**: 2026-01-18
**状态**: 进行中

---

## 已完成工作

### 14.1 详情页 API 对接

| 页面 | 文件 | 状态 | 说明 |
|------|------|------|------|
| 飞机详情 | `aircraft-detail-page.tsx` | ✅ 完成 | 集成 flightLogService 和 workOrderService |
| 零部件详情 | `component-detail-page.tsx` | ✅ 完成 | 简化版实现（受限于 Component 接口无 aircraftId） |

### 14.2 Mock 数据替换

| 页面 | 文件 | 状态 | 说明 |
|------|------|------|------|
| 移动工单执行 | `mobile-work-order-execute-page.tsx` | ✅ 完成 | 集成 workOrderService.getById/getTasks |
| 报告看板 | `reports-data-dashboard-page.tsx` | ✅ 完成 | 集成 statsService |
| 系统设置 | `settings-page.tsx` | ✅ 完成 | 集成 userService.getProfile/list |
| 工单放行 | `work-order-release-page.tsx` | ✅ 完成 | 集成 workOrderService + userService |

---

## 技术细节

### 修改的服务调用

1. **flightLogService.getByAircraft(id, limit)** - 获取飞机飞行记录
2. **workOrderService.getByAircraft(id, limit)** - 获取飞机工单
3. **workOrderService.getById(id)** - 获取工单详情
4. **workOrderService.getTasks(id)** - 获取工单任务列表
5. **statsService.getDashboardStats()** - 获取仪表盘统计
6. **statsService.getDueMaintenanceItems(limit)** - 获取待维护项
7. **userService.getProfile()** - 获取当前用户
8. **userService.list()** - 获取用户列表
9. **fullAircraftService.list()** - 获取飞机列表

### 类型适配

- 修复 Component 接口无 aircraftId 的问题（简化为仅显示组件状态）
- 适配 User 接口（使用 `name` 而非 `fullName`，使用 `email` 而非 `username`）
- 适配 WorkOrder 接口（使用 `completionNotes` 而非 `notes`）

---

## 遗留工作

以下页面仍有 MOCK_ 数据（共 14 个文件，97 处引用）：

| 优先级 | 文件 | Mock 内容 |
|--------|------|-----------|
| 高 | `work-order-form-page.tsx` | 表单引用数据 |
| 高 | `reliability-analysis-page.tsx` | 可靠性数据 |
| 中 | `roles-page.tsx` | 角色定义（静态数据，可保留） |
| 中 | `component-transfers-page.tsx` | 调拨操作 |
| 中 | `suppliers-page.tsx` | 供应商 CRUD |
| 低 | `task-card-templates-page.tsx` | 模板复制/删除 |
| 低 | `users-page.tsx` | 用户管理 |
| 低 | `purchase-requests-page.tsx` | 采购请求 |
| 低 | `purchase-orders-page.tsx` | 采购订单 |
| 低 | `component-form-page.tsx` | 表单引用 |
| 低 | `component-bom-page.tsx` | BOM 数据 |
| 低 | `work-order-execute-page.tsx` | 桌面版执行（与移动版类似） |
| 低 | `component-removal-detail-page.tsx` | 拆件详情 |
| 低 | `aircraft-form-page.tsx` | 表单引用 |

---

## 验证结果

```bash
# TypeScript 编译通过
pnpm --filter web exec tsc --noEmit  # ✅ 无错误

# Mock 数据统计
grep -r "MOCK_" apps/web/src/pages/ | wc -l  # 97 处（从 ~150 处减少）
```

---

## 下一步计划

1. 完成高优先级页面的 Mock 替换
2. 评估是否需要为 component 添加安装信息 API
3. 添加可靠性分析 API 端点
