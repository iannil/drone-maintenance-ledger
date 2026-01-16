# 代码问题与技术债务清单

**创建时间**: 2026-01-17
**分析范围**: 全项目代码
**目的**: 识别需要修复的问题，为后续迭代提供参考

---

## 一、构建阻塞问题（P0）

当前项目**无法通过构建**，以下问题必须优先修复：

### 1.1 TypeScript 编译错误

#### 工单相关页面（最多错误）

| 文件 | 错误数 | 问题描述 | 修复建议 |
|------|--------|----------|----------|
| `work-order-form-page.tsx` | 14 | 类型不匹配、undefined 检查 | 添加类型守卫和空值检查 |
| `work-order-release-page.tsx` | 14 | 未导入组件、类型不匹配 | 添加 Input 导入，修复类型 |
| `work-order-execute-page.tsx` | 6 | currentTask undefined | 添加空值检查 |
| `work-order-list-page.tsx` | 4 | Aircraft 缺少 registration | 更新 Aircraft 类型或使用正确属性 |
| `work-order-search-page.tsx` | 4 | 未使用的导入 | 删除未使用的导入 |

#### 其他页面

| 文件 | 错误数 | 问题描述 | 修复建议 |
|------|--------|----------|----------|
| `aircraft-form-page.tsx` | 3 | useForm 类型问题 | 添加泛型类型参数 |
| `component-bom-page.tsx` | 2 | BOMNode 类型定义 | 完善接口定义 |
| `pirep-form-page.tsx` | 5 | 重复的 model key | 移除重复属性 |
| `status-badge.tsx` | 3 | exactOptionalPropertyTypes | 添加 undefined 类型 |

#### 服务层

| 文件 | 错误数 | 问题描述 | 修复建议 |
|------|--------|----------|----------|
| `flight-log.service.ts` | 1 | exactOptionalPropertyTypes | 修复参数类型 |

### 1.2 错误分类统计

| 错误类型 | 数量 | 说明 |
|----------|------|------|
| TS18048 (possibly undefined) | ~20 | 缺少空值检查 |
| TS6133 (未使用的声明) | ~10 | 未使用的导入/变量 |
| TS2322 (类型不兼容) | ~15 | 类型赋值不匹配 |
| TS2339 (属性不存在) | ~5 | 访问不存在的属性 |
| 其他 | ~6 | - |
| **总计** | **~56** | - |

---

## 二、代码质量问题（P1）

### 2.1 未使用的导入

以下文件有未使用的导入，影响代码整洁度：

```
src/pages/work-order-form-page.tsx: CheckCircle2, Calendar, Clock
src/pages/work-order-list-page.tsx: User
src/pages/work-order-release-page.tsx: useEffect, AircraftStatusBadge, setWorkOrder, approvalStatus
src/pages/work-order-search-page.tsx: Filter, CheckCircle2, ChevronDown, CardDescription
```

### 2.2 类型定义不一致

| 问题 | 位置 | 说明 |
|------|------|------|
| Aircraft.registration 不存在 | work-order-list-page.tsx | Aircraft 类型缺少 registration 属性 |
| TaskExecution 类型不匹配 | work-order-execute-page.tsx | 状态类型字符串 vs 字面量类型 |
| PartReservation 必填属性 | work-order-form-page.tsx | id 属性应为必填 |

### 2.3 组件导入缺失

| 问题 | 位置 | 修复 |
|------|------|------|
| Input 组件未导入 | work-order-release-page.tsx | 添加 `import { Input }` |
| Tabs defaultValue 不存在 | work-order-release-page.tsx | 更新 Tabs 组件 props |

---

## 三、架构与设计问题（P2）

### 3.1 状态映射复杂性

前后端使用不同的状态枚举值：

| 后端 | 前端 |
|------|------|
| `AVAILABLE` | `SERVICEABLE` |
| `IN_MAINTENANCE` | `MAINTENANCE` |
| `AOG` | `GROUNDED` |
| `RETIRED` | `RETIRED` |

**影响**: 每个使用状态的组件都需要手动映射

**建议**: 统一前后端状态枚举，或在 types 包中定义统一的映射函数

### 3.2 Mock 数据残留

部分页面仍使用硬编码的 Mock 数据：

| 页面 | 状态 |
|------|------|
| 维保计划页面 | 部分 Mock |
| PIREP 表单页面 | Mock 数据 |
| 库存管理页面 | 无后端 API |
| 采购管理页面 | 无后端 API |
| 报表分析页面 | 部分 Mock |
| 系统设置页面 | Mock 数据 |

### 3.3 缺失的后端 API

| 模块 | 缺失 API | 前端页面 |
|------|----------|----------|
| 库存管理 | CRUD + 领料/退料 | 4 个页面 |
| 仓库管理 | CRUD | 1 个页面 |
| 采购管理 | 供应商/订单/申请 CRUD | 3 个页面 |
| 维保计划 | 计划触发计算 | 4 个页面 |

---

## 四、性能与安全问题（P3）

### 4.1 潜在性能问题

| 问题 | 位置 | 影响 |
|------|------|------|
| 无分页的列表加载 | 多个列表页面 | 大数据量时性能差 |
| 无缓存策略 | API 调用 | 重复请求 |
| 无虚拟滚动 | 长列表 | 渲染性能 |

### 4.2 潜在安全问题

| 问题 | 位置 | 建议 |
|------|------|------|
| JWT 密钥硬编码示例 | .env.example | 文档说明更换 |
| 无 CORS 配置 | API 服务 | 添加 CORS 中间件 |
| 无请求限流 | API 服务 | 添加 rate limiting |

---

## 五、文档与规范问题（P4）

### 5.1 文档与代码不一致

| 文档描述 | 实际情况 | 状态 |
|----------|----------|------|
| 使用 PostgreSQL | 实际使用 SQLite | ✅ 已在文档说明 |
| 89 个 API 端点 | 实际 92 个 | ⚠️ 需更新 |

### 5.2 缺失的文档

| 文档 | 说明 |
|------|------|
| API 文档 (Swagger) | 无自动化 API 文档 |
| 部署文档 | 无生产环境部署指南 |
| 贡献指南 | 无 CONTRIBUTING.md |

---

## 六、修复优先级建议

### 立即修复（阻塞构建）

1. 修复 work-order-*.tsx 的 TypeScript 错误
2. 修复 status-badge.tsx 的类型问题
3. 删除所有未使用的导入
4. 添加缺失的组件导入

### 短期修复（1-2 天）

1. 统一 Aircraft 类型定义
2. 修复 exactOptionalPropertyTypes 相关问题
3. 完善空值检查

### 中期改进

1. 开发缺失的库存/采购 API
2. 替换剩余 Mock 数据
3. 添加单元测试

---

## 七、快速修复命令

```bash
# 查看所有 TypeScript 错误
pnpm --filter @repo/web tsc --noEmit

# 修复 ESLint 可自动修复的问题
pnpm --filter @repo/web lint --fix

# 仅构建前端查看错误
pnpm --filter @repo/web build
```

---

## 附录：错误文件完整列表

```
apps/web/src/components/common/status-badge.tsx
apps/web/src/pages/aircraft-form-page.tsx
apps/web/src/pages/component-bom-page.tsx
apps/web/src/pages/pirep-form-page.tsx
apps/web/src/pages/work-order-execute-page.tsx
apps/web/src/pages/work-order-form-page.tsx
apps/web/src/pages/work-order-list-page.tsx
apps/web/src/pages/work-order-release-page.tsx
apps/web/src/pages/work-order-search-page.tsx
apps/web/src/services/flight-log.service.ts
```
