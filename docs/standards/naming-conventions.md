# 命名规范

本文档定义项目中使用的命名规范，确保代码一致性和可维护性。

## 目录和文件命名

### 目录
- 使用小写字母和连字符
- 示例: `component-installation/`, `flight-log/`

### 文件
- TypeScript 文件使用小写字母和连字符
- React 组件文件使用小写字母和连字符
- 测试文件与源文件同名，添加 `.spec.ts` 或 `.test.ts` 后缀
- 示例: `auth.service.ts`, `login-page.tsx`, `auth.service.spec.ts`

## 代码命名

### 变量和函数
- 使用 camelCase
- 布尔值变量以 `is`, `has`, `should` 开头
- 示例:
  ```typescript
  const userName = "admin";
  const isActive = true;
  const hasPermission = true;

  function getUserById(id: string) { }
  ```

### 类和接口
- 使用 PascalCase
- 接口可以添加 `I` 前缀（可选，本项目不使用）
- 示例:
  ```typescript
  class UserService { }
  interface User { }
  ```

### 类型和枚举
- 使用 PascalCase
- 枚举值使用 UPPER_SNAKE_CASE
- 示例:
  ```typescript
  type UserRole = "ADMIN" | "USER";

  enum UserRoleEnum {
    ADMIN = "ADMIN",
    PILOT = "PILOT",
  }
  ```

### 常量
- 使用 UPPER_SNAKE_CASE
- 示例:
  ```typescript
  const MAX_FLIGHT_HOURS = 500;
  const API_BASE_URL = "http://localhost:3001";
  ```

## 特定模式命名

### Service
- 格式: `XxxService`
- 工厂函数: `createXxxService`
- 示例:
  ```typescript
  class UserService { }
  export function createUserService(db: Database) {
    return new UserService(db);
  }
  ```

### Repository
- 格式: `XxxRepository`
- 示例: `UserRepository`, `AircraftRepository`

### Controller
- 格式: `XxxController`
- 示例: `AuthController`, `UserController`

### DTO (Data Transfer Object)
- 输入 DTO: `CreateXxxDto`, `UpdateXxxDto`
- 示例: `CreateUserDto`, `UpdateAircraftDto`

### Store (MobX)
- 格式: `xxxStore`
- 示例: `authStore`, `fleetStore`

### 工具函数
- 解析函数: `parseXxx`
- 断言函数: `assertXxx`
- 安全解析: `safeXxx`
- 格式化函数: `formatXxx`
- 示例:
  ```typescript
  function parseJwt(token: string) { }
  function assertIsUser(value: unknown): asserts value is User { }
  function safeJsonParse<T>(json: string): T | null { }
  function formatDate(date: Date): string { }
  ```

## 数据库命名

### 表名
- 使用小写字母和下划线
- 使用单数形式
- 示例: `user`, `component_installation`

### 字段名
- 使用小写字母和下划线
- 示例: `created_at`, `is_active`

### 外键字段
- 格式: `referenced_table_id`
- 示例: `fleet_id`, `aircraft_id`

## 组件命名

### React 组件
- 使用 PascalCase
- 文件名使用 kebab-case
- 示例:
  ```typescript
  // file: user-profile.tsx
  export function UserProfile() { }
  ```

### 页面组件
- 格式: `xxx-page`
- 示例: `login-page.tsx`, `dashboard-page.tsx`

### 布局组件
- 格式: `xxx-layout`
- 示例: `dashboard-layout.tsx`
