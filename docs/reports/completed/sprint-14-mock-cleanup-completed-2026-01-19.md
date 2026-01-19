# Sprint 14 完成报告 - Mock 数据清理

**完成日期**: 2026-01-19
**状态**: 已完成

---

## 概述

Sprint 14 的主要目标是清理前端所有 Mock 数据，将其替换为真实 API 调用。本次工作已全部完成。

---

## 完成工作

### 14.1 确认已完成的 API 对接

以下页面在本次检查前已完成 API 对接：

| 页面 | 状态 | 说明 |
|------|------|------|
| `reliability-analysis-page.tsx` | ✅ 完成 | 使用 `statsService.getReliabilityData()` |
| `work-order-form-page.tsx` | ✅ 完成 | 使用 `fullAircraftService`、`userService`、`inventoryService`、`maintenanceSchedulerService` |
| `aircraft-detail-page.tsx` | ✅ 完成 | 集成 `flightLogService` 和 `workOrderService` |
| `component-detail-page.tsx` | ✅ 完成 | 简化版实现 |
| `mobile-work-order-execute-page.tsx` | ✅ 完成 | 集成 `workOrderService` |
| `reports-data-dashboard-page.tsx` | ✅ 完成 | 集成 `statsService` |
| `settings-page.tsx` | ✅ 完成 | 集成 `userService` |
| `work-order-release-page.tsx` | ✅ 完成 | 集成 `workOrderService` + `userService` |

### 14.2 本次清理的文件

| 文件 | 修改内容 | 状态 |
|------|---------|------|
| `install-component-dialog.tsx` | 移除 `MOCK_AIRCRAFT`，替换为 `fullAircraftService.list()` | ✅ 完成 |

### 14.3 API 端点确认

可靠性分析 API 已存在于后端：

- **端点**: `GET /api/stats/reliability`
- **参数**: `days` (可选，默认 180)
- **实现**: `apps/api/src/modules/stats/stats.service.ts:510`
- **功能**:
  - 整体可靠性计算
  - MTBF/MTTR 统计
  - 月度故障趋势
  - 故障原因分布
  - 系统可靠性分析

---

## 验证结果

```bash
# TypeScript 编译通过
pnpm --filter web exec tsc --noEmit  # ✅ 无错误

# Mock 数据统计
grep -r "MOCK_" apps/web/src/  # 0 处（从 ~150 处减少至 0）
```

---

## Mock 数据清理统计

| 指标 | 数值 |
|------|------|
| 原始 Mock 引用数 | ~150 处 |
| 清理后 Mock 引用数 | 0 处 |
| 清理率 | 100% |

---

## 技术细节

### install-component-dialog.tsx 修改

**之前**:
```typescript
const MOCK_AIRCRAFT = [
  { id: "ac-001", registration: "B-7011U", status: "SERVICEABLE", ... },
  ...
];
```

**之后**:
```typescript
const [aircraftList, setAircraftList] = useState<Aircraft[]>([]);
const [isLoadingAircraft, setIsLoadingAircraft] = useState(false);

useEffect(() => {
  if (open && aircraftList.length === 0) {
    setIsLoadingAircraft(true);
    fullAircraftService.list(100)
      .then(setAircraftList)
      .catch((err) => console.error("Failed to load aircraft:", err))
      .finally(() => setIsLoadingAircraft(false));
  }
}, [open, aircraftList.length]);
```

### 状态映射

添加 API 状态到显示状态的映射：
```typescript
const STATUS_MAP: Record<string, string> = {
  AVAILABLE: "SERVICEABLE",
  IN_MAINTENANCE: "MAINTENANCE",
  AOG: "GROUNDED",
  RETIRED: "RETIRED",
};
```

---

## 里程碑验收

### M1: Mock 数据清理（Sprint 14 完成）✅

- [x] 所有页面 Mock 数据清理
- [x] 组件 Mock 数据清理
- [x] TypeScript 编译通过
- [x] 状态映射正确

---

## 下一步计划

Sprint 14 Mock 数据清理已完成，可进入以下工作：

1. **Sprint 11**: Controller 层测试（目标覆盖率 70%）
2. **Sprint 12**: 前端表单完善（表单验证、错误提示）
3. **Sprint 13**: PWA + 离线支持

---

## 相关文档

- [Phase 3 开发计划](/docs/progress/phase-3-plan.md)
- [Sprint 14 进度报告](/docs/progress/sprint-14-mock-cleanup-2026-01-18.md)
- [实现程度评估](/docs/reports/implementation-evaluation-2026-01-18.md)
