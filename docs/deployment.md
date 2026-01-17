# 部署文档

本文档介绍如何部署 DroneMaintenance-Ledger 系统。

## 目录

- [环境要求](#环境要求)
- [本地开发部署](#本地开发部署)
- [生产环境部署](#生产环境部署)
- [Docker 部署](#docker-部署)
- [环境变量配置](#环境变量配置)
- [数据库迁移](#数据库迁移)
- [常见问题](#常见问题)

## 环境要求

### 软件版本

| 软件 | 最低版本 | 推荐版本 |
|------|---------|---------|
| Node.js | 18.x | 20.x LTS |
| pnpm | 8.x | 9.x |
| SQLite | 3.x | 3.45+ |
| PostgreSQL (生产) | 14.x | 16.x |

### 硬件要求

**开发环境：**
- CPU: 2 核心
- 内存: 4GB
- 存储: 10GB

**生产环境（推荐）：**
- CPU: 4 核心
- 内存: 8GB
- 存储: 50GB SSD

## 本地开发部署

### 1. 克隆代码

```bash
git clone https://github.com/your-org/drone-maintenance-ledger.git
cd drone-maintenance-ledger
```

### 2. 安装依赖

```bash
# 安装 pnpm（如未安装）
npm install -g pnpm

# 安装项目依赖
pnpm install
```

### 3. 配置环境变量

```bash
# 复制环境变量模板
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# 编辑 API 环境变量
# apps/api/.env
```

**必要的环境变量：**

```env
# 数据库连接（开发环境使用 SQLite）
DATABASE_URL="file:./dev.db"

# JWT 密钥（生产环境必须更换）
JWT_SECRET="your-secret-key-at-least-32-characters"
JWT_EXPIRES_IN="24h"

# 服务端口
PORT=3001

# 跨域配置
CORS_ORIGIN="http://localhost:3000"
```

### 4. 初始化数据库

```bash
# 生成 Prisma 客户端
pnpm --filter @repo/db db:generate

# 执行数据库迁移
pnpm --filter @repo/db db:push

# （可选）填充测试数据
pnpm --filter @repo/db db:seed
```

### 5. 启动服务

```bash
# 同时启动前端和后端
pnpm dev

# 或分别启动
pnpm --filter @repo/api dev    # 后端 http://localhost:3001
pnpm --filter @repo/web dev    # 前端 http://localhost:3000
```

### 6. 验证部署

- 前端: http://localhost:3000
- 后端 API: http://localhost:3001/api
- Swagger 文档: http://localhost:3001/api/docs

## 生产环境部署

### 1. 构建项目

```bash
# 安装依赖（仅生产依赖）
pnpm install --prod=false

# 生成数据库客户端
pnpm --filter @repo/db db:generate

# 构建所有包
pnpm build
```

### 2. 配置生产环境变量

```env
# 生产数据库（PostgreSQL 推荐）
DATABASE_URL="postgresql://user:password@host:5432/drone_mro?schema=public"

# 强密钥
JWT_SECRET="生产环境使用至少64字符的随机字符串"
JWT_EXPIRES_IN="8h"

# 生产端口
PORT=3001
NODE_ENV=production

# 跨域配置
CORS_ORIGIN="https://your-domain.com"
```

### 3. 执行数据库迁移

```bash
# 生成迁移文件（开发时）
pnpm --filter @repo/db db:migrate:dev --name your_migration_name

# 生产环境部署迁移
pnpm --filter @repo/db db:migrate:deploy
```

### 4. 启动服务

```bash
# 后端服务
cd apps/api
node dist/main.js

# 或使用 PM2
pm2 start dist/main.js --name drone-api
```

### 5. 配置反向代理（Nginx 示例）

```nginx
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name your-domain.com;

    root /var/www/drone-web/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Docker 部署

### 快速开始

```bash
# 1. 复制环境变量配置
cp .env.docker.example .env

# 2. 编辑环境变量（至少修改 JWT_SECRET）
# 生产环境必须使用强密钥！
nano .env

# 3. 启动所有服务
docker-compose up -d

# 4. 查看服务状态
docker-compose ps

# 5. 查看日志
docker-compose logs -f
```

### 服务访问

启动成功后，可通过以下地址访问：

- 前端界面: http://localhost:3000
- API 接口: http://localhost:3001/api
- API 文档: http://localhost:3001/api/docs
- 健康检查: http://localhost:3001/api/health

### 环境变量配置

创建 `.env` 文件（基于 `.env.docker.example`）：

```env
# API 配置
API_PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Web 前端配置
WEB_PORT=3000
VITE_API_URL=http://localhost:3001

# CORS 配置（多个源用逗号分隔）
CORS_ORIGIN=http://localhost:3000,http://localhost:80
```

### Docker Compose 命令

```bash
# 启动服务（后台运行）
docker-compose up -d

# 启动服务（前台运行，查看日志）
docker-compose up

# 停止服务
docker-compose down

# 停止并删除数据卷（清除数据库）
docker-compose down -v

# 重新构建镜像
docker-compose build --no-cache

# 查看服务日志
docker-compose logs -f api    # 仅 API 日志
docker-compose logs -f web    # 仅 Web 日志

# 进入容器
docker-compose exec api sh
docker-compose exec web sh
```

### 单独构建镜像

```bash
# 构建 API 镜像
docker build -f apps/api/Dockerfile -t drone-api:latest .

# 构建 Web 镜像
docker build -f apps/web/Dockerfile -t drone-web:latest \
  --build-arg VITE_API_URL=http://your-api-domain:3001 .

# 运行 API 容器
docker run -d \
  --name drone-api \
  -p 3001:3001 \
  -e JWT_SECRET=your-secret-key \
  -v drone-data:/app/data \
  drone-api:latest

# 运行 Web 容器
docker run -d \
  --name drone-web \
  -p 3000:80 \
  drone-web:latest
```

### 数据持久化

API 服务使用 Docker 卷 `api-data` 存储 SQLite 数据库：

```bash
# 查看卷信息
docker volume inspect drone-maintenance-ledger_api-data

# 备份数据
docker run --rm \
  -v drone-maintenance-ledger_api-data:/data \
  -v $(pwd)/backup:/backup \
  alpine cp /data/drone-maintenance.db /backup/

# 恢复数据
docker run --rm \
  -v drone-maintenance-ledger_api-data:/data \
  -v $(pwd)/backup:/backup \
  alpine cp /backup/drone-maintenance.db /data/
```

### 生产环境配置

对于生产环境，建议：

1. **使用强 JWT 密钥**
```bash
# 生成随机密钥
openssl rand -base64 64
```

2. **配置 HTTPS（使用 Traefik 或 Nginx 反向代理）**

3. **启用容器资源限制**
```yaml
# docker-compose.override.yml
services:
  api:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

4. **配置日志轮转**
```yaml
services:
  api:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### 健康检查

Docker 容器已配置健康检查：

```bash
# 查看健康状态
docker-compose ps

# 手动检查 API 健康
curl http://localhost:3001/api/health

# 预期响应
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "version": "0.1.0",
  "checks": {
    "database": { "status": "up", "responseTime": 2 },
    "memory": { "status": "up", "details": { ... } }
  }
}
```

### 故障排查

**容器无法启动**
```bash
# 查看容器日志
docker-compose logs api

# 检查镜像构建
docker-compose build api
```

**API 连接数据库失败**
```bash
# 检查数据卷是否正确挂载
docker-compose exec api ls -la /app/data

# 检查数据库文件权限
docker-compose exec api stat /app/data/drone-maintenance.db
```

**前端无法访问 API**
- 检查 `VITE_API_URL` 是否正确配置
- 确认 `CORS_ORIGIN` 包含前端地址
- 验证 API 容器健康状态

## 环境变量配置

### 后端环境变量

| 变量名 | 必需 | 默认值 | 说明 |
|--------|------|--------|------|
| `DATABASE_URL` | 是 | - | 数据库连接字符串 |
| `JWT_SECRET` | 是 | - | JWT 签名密钥 |
| `JWT_EXPIRES_IN` | 否 | `24h` | JWT 过期时间 |
| `PORT` | 否 | `3001` | 服务端口 |
| `NODE_ENV` | 否 | `development` | 运行环境 |
| `CORS_ORIGIN` | 否 | `*` | 允许的跨域来源 |
| `LOG_LEVEL` | 否 | `info` | 日志级别 |

### 前端环境变量

| 变量名 | 必需 | 默认值 | 说明 |
|--------|------|--------|------|
| `VITE_API_BASE_URL` | 否 | `/api` | API 基础路径 |

## 数据库迁移

### 创建迁移

```bash
# 开发环境创建并应用迁移
pnpm --filter @repo/db db:migrate:dev --name add_new_feature
```

### 部署迁移

```bash
# 生产环境部署迁移（不生成新迁移）
pnpm --filter @repo/db db:migrate:deploy
```

### 重置数据库（仅开发）

```bash
# 重置并重新应用所有迁移
pnpm --filter @repo/db db:migrate:reset
```

## 常见问题

### Q: 启动时提示端口被占用

```bash
# 查找占用端口的进程
lsof -i :3001
# 或
netstat -tulpn | grep 3001

# 终止进程
kill -9 <PID>
```

### Q: 数据库连接失败

1. 检查 `DATABASE_URL` 格式是否正确
2. 确认数据库服务已启动
3. 验证数据库用户权限

```bash
# 测试 PostgreSQL 连接
psql -h host -U user -d database
```

### Q: Prisma 客户端未生成

```bash
pnpm --filter @repo/db db:generate
```

### Q: 前端页面 404

确保 Nginx 配置了 SPA 路由回退：

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### Q: JWT 验证失败

1. 检查 `JWT_SECRET` 在前后端是否一致
2. 确认 token 未过期
3. 验证 token 格式正确（Bearer token）

## 监控与日志

### 查看日志

```bash
# PM2 日志
pm2 logs drone-api

# Docker 日志
docker-compose logs -f api
```

### 健康检查

```bash
curl http://localhost:3001/api/health
```

## 备份与恢复

### PostgreSQL 备份

```bash
# 备份
pg_dump -U user -d drone_mro > backup.sql

# 恢复
psql -U user -d drone_mro < backup.sql
```

### SQLite 备份

```bash
# 直接复制数据库文件
cp apps/api/dev.db apps/api/dev.db.backup
```

---

## 联系与支持

如遇问题，请通过以下方式获取帮助：

- GitHub Issues: [项目 Issues](https://github.com/your-org/drone-maintenance-ledger/issues)
- 文档: [项目文档](./README.md)
