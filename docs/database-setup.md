# 数据库设置指南

**更新时间**: 2026-01-16

---

## 概述

本项目使用 PostgreSQL 作为主数据库，配合 Drizzle ORM 进行数据库访问和迁移管理。

---

## 1. 安装 PostgreSQL

### macOS

```bash
brew install postgresql@16
brew services start postgresql@16
```

### Linux (Ubuntu/Debian)

```bash
sudo apt install postgresql-16
sudo systemctl start postgresql
```

### Docker

```bash
docker run -d \
  --name drone-ledger-db \
  -e POSTGRES_USER=drone_ledger \
  -e POSTGRES_PASSWORD=drone_ledger \
  -e POSTGRES_DB=drone_ledger \
  -p 5432:5432 \
  postgis/postgis:16-3.4-alpine
```

---

## 2. 创建数据库

```bash
# 连接到 PostgreSQL
psql -U postgres

# 创建数据库和用户
CREATE USER drone_ledger WITH PASSWORD 'drone_ledger';
CREATE DATABASE drone_ledger OWNER drone_ledger;
GRANT ALL PRIVILEGES ON DATABASE drone_ledger TO drone_ledger;
\q
```

---

## 3. 配置环境变量

复制 `.env.example` 到 `.env` 并修改数据库连接字符串：

```bash
cp .env.example .env
```

编辑 `.env`：

```env
DATABASE_URL=postgresql://drone_ledger:drone_ledger@localhost:5432/drone_ledger
```

---

## 4. 运行数据库迁移

### 方式 1: 生成并执行迁移文件（推荐生产环境）

```bash
# 生成迁移文件
pnpm --filter @repo/db db:generate

# 执行迁移
pnpm --filter @repo/db db:migrate
```

迁移文件将保存在 `/database/migrations/` 目录。

### 方式 2: 直接推送 Schema（推荐开发环境）

```bash
pnpm --filter @repo/db db:push
```

---

## 5. 运行种子数据（开发环境）

```bash
pnpm --filter @repo/db db:seed
```

这将创建测试用户和演示数据。

**测试账号**:
- `admin / password123` - 管理员
- `manager / password123` - 机队经理
- `pilot / password123` - 飞手
- `mechanic / password123` - 维修工
- `inspector / password123` - 检验员

---

## 6. Drizzle Studio（数据库可视化）

```bash
pnpm --filter @repo/db db:studio
```

访问 http://localhost:4983 查看数据库内容。

---

## 7. 数据库 Schema 结构

```
drone_ledger
├── 核心表 (core/)
│   ├── user              # 用户表
│   ├── fleet             # 机队表
│   ├── aircraft          # 飞机表
│   ├── component         # 零部件表
│   └── component_installation  # 零部件装机记录
│
├── 飞行记录表 (flight/)
│   ├── flight_log        # 飞行日志
│   ├── pilot_report      # 飞行员报告 (PIREP)
│   └── release_record    # 放行记录
│
└── 维保表 (maintenance/)
    ├── maintenance_program     # 维保计划
    ├── maintenance_trigger     # 维保触发器
    ├── maintenance_schedule    # 维保调度
    ├── maintenance_history     # 维保历史
    ├── work_order             # 工单
    ├── work_order_task        # 工单任务
    └── work_order_part        # 工单零件
```

---

## 8. 常见问题

### Q: 迁移失败怎么办？

```bash
# 查看迁移状态
psql -U drone_ledger -d drone_ledger
\dt

# 手动删除所有表（危险！仅开发环境）
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO drone_ledger;

# 然后重新运行迁移
pnpm --filter @repo/db db:push
```

### Q: 如何重置数据库？

```bash
# 删除并重新创建数据库
psql -U postgres -c "DROP DATABASE drone_ledger;"
psql -U postgres -c "CREATE DATABASE drone_ledger OWNER drone_ledger;"

# 重新运行迁移和种子
pnpm --filter @repo/db db:push
pnpm --filter @repo/db db:seed
```

### Q: 如何备份数据库？

```bash
pg_dump -U drone_ledger drone_ledger > backup.sql
```

### Q: 如何恢复数据库？

```bash
psql -U drone_ledger drone_ledger < backup.sql
```
