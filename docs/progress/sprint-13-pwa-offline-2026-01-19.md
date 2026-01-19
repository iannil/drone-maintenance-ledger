# Sprint 13 进度报告 - PWA + 离线支持

**日期**: 2026-01-19
**状态**: 已完成

---

## 概述

Sprint 13 的主要目标是为应用添加 PWA (Progressive Web App) 支持，使应用能够：
- 安装到用户设备
- 离线访问静态资源
- 缓存 API 响应
- 显示网络状态指示器

---

## 完成工作

### 1. PWA 插件配置

安装并配置 `vite-plugin-pwa`:

```bash
pnpm --filter web add vite-plugin-pwa workbox-window
```

**配置内容**:
- 应用名称: "无人机维保系统"
- 主题色: #1e40af (蓝色)
- 自动更新注册
- 静态资源预缓存
- API 响应运行时缓存 (NetworkFirst 策略)

### 2. Service Worker 策略

| 资源类型 | 缓存策略 | 说明 |
|---------|---------|------|
| 静态资源 | 预缓存 | JS, CSS, HTML, 图片等 |
| API 响应 | NetworkFirst | 优先网络，失败后使用缓存 |
| 缓存过期 | 24小时 | API 缓存最长保留 24 小时 |

### 3. 离线状态指示器

创建 `OfflineIndicator` 组件，显示：
- 离线模式提示（黄色横幅）
- 新版本可用提示（蓝色横幅）
- 离线可用确认（绿色横幅）

### 4. 网络状态 Hook

创建 `useNetworkStatus` 和 `useServiceWorkerUpdate` hooks:
- 监听网络在线/离线状态
- 监听 Service Worker 更新
- 提供更新触发方法

---

## 修改文件清单

| 文件 | 类型 | 说明 |
|------|------|------|
| `apps/web/vite.config.ts` | 修改 | 添加 VitePWA 插件配置 |
| `apps/web/package.json` | 修改 | 添加 PWA 依赖 |
| `apps/web/src/main.tsx` | 修改 | 添加 OfflineIndicator |
| `apps/web/src/vite-env.d.ts` | 新增 | PWA 类型声明 |
| `apps/web/src/hooks/use-network-status.ts` | 新增 | 网络状态 hooks |
| `apps/web/src/components/common/offline-indicator.tsx` | 新增 | 离线指示器组件 |

---

## 新增文件内容

### vite.config.ts (PWA 配置部分)

```typescript
VitePWA({
  registerType: "autoUpdate",
  manifest: {
    name: "无人机维保系统",
    short_name: "维保系统",
    theme_color: "#1e40af",
    display: "standalone",
    // ...
  },
  workbox: {
    globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
    runtimeCaching: [
      {
        urlPattern: /\/api\/.*/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "api-cache",
          expiration: { maxAgeSeconds: 86400 },
        },
      },
    ],
  },
})
```

### use-network-status.ts

```typescript
// 网络状态 hook
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  // ... 监听 online/offline 事件
  return isOnline;
}

// Service Worker 更新 hook
export function useServiceWorkerUpdate() {
  const [needRefresh, setNeedRefresh] = useState(false);
  // ... 注册 SW 并监听更新
  return { needRefresh, updateServiceWorker };
}
```

### offline-indicator.tsx

```typescript
export function OfflineIndicator() {
  const isOnline = useNetworkStatus();
  const { needRefresh, updateServiceWorker } = useServiceWorkerUpdate();

  if (!isOnline) {
    return <离线模式横幅 />;
  }
  if (needRefresh) {
    return <更新可用横幅 />;
  }
  return null;
}
```

---

## 验证方法

### 开发环境测试

```bash
# 启动开发服务器
pnpm dev

# PWA 在开发模式下已启用 (devOptions.enabled: true)
# 打开 DevTools > Application > Service Workers 查看
```

### 生产环境测试

```bash
# 构建生产版本
pnpm --filter web build

# 使用本地服务器测试
npx serve apps/web/dist

# 测试步骤:
# 1. 打开 DevTools > Application > Service Workers
# 2. 勾选 "Offline" 模拟离线
# 3. 验证应用仍可访问
# 4. 验证离线指示器显示
```

### 安装测试

1. 访问应用
2. 浏览器地址栏应显示安装图标
3. 点击安装，应用添加到设备
4. 打开独立窗口运行

---

## 验收标准

- [x] vite-plugin-pwa 配置完成
- [x] 应用可安装为 PWA
- [x] 静态资源离线可用
- [x] API 响应有缓存
- [x] 离线状态指示器显示
- [x] TypeScript 编译无错误

---

## 待优化项 (可选)

| 项目 | 说明 | 优先级 |
|------|------|--------|
| IndexedDB 存储 | 使用 Dexie.js 实现离线数据持久化 | P2 |
| 离线表单队列 | 离线时暂存表单，恢复后自动提交 | P2 |
| PWA 图标 | 设计和添加正式的 PWA 图标 | P3 |
| 背景同步 | 使用 Background Sync API | P3 |

---

## 相关文档

- [Phase 3 开发计划](/docs/progress/phase-3-plan.md)
- [Sprint 12 进度报告](/docs/progress/sprint-12-form-enhancement-2026-01-19.md)
