# 文件结构规范

本文档定义项目中各模块的文件结构规范，确保代码组织一致性。

## 后端模块结构 (NestJS)

每个功能模块遵循以下结构：

```
feature-name/
├── [feature-name].module.ts      # 模块定义
├── controllers/
│   └── [feature-name].controller.ts
├── services/
│   └── [feature-name].service.ts
├── repositories/
│   └── [feature-name].repository.ts
├── dto/
│   ├── create-[feature].dto.ts
│   ├── update-[feature].dto.ts
│   └── [feature]-response.dto.ts
├── entities/
│   └── [feature].entity.ts
├── strategies/                   # 认证策略 (auth 模块)
├── guards/                       # 守卫 (如需要)
└── [feature-name].spec.ts        # 测试
```

## 前端功能结构 (React)

每个功能模块遵循以下结构：

```
feature-name/
├── [feature]-page.tsx            # 页面组件
├── [feature]-store.ts            # MobX Store (如需要)
├── components/                   # 功能相关组件
│   ├── [component]-card.tsx
│   └── [component]-list.tsx
├── services/
│   └── [feature].service.ts
├── types/
│   └── [feature].types.ts
└── hooks/
    └── use-[feature].ts
```

## 数据库包结构

```
packages/db/
├── src/
│   ├── schema/
│   │   ├── core/                 # 核心实体表
│   │   │   ├── user.ts
│   │   │   ├── fleet.ts
│   │   │   ├── aircraft.ts
│   │   │   ├── component.ts
│   │   │   └── ...
│   │   ├── maintenance/          # 维保相关表
│   │   ├── flight/               # 飞行记录表
│   │   └── inventory/            # 库存相关表
│   └── index.ts
├── migrations/                   # Drizzle 迁移文件
├── drizzle.config.ts
└── package.json
```

## 公共模块结构

```
common/
├── guards/                       # 守卫
│   ├── roles.guard.ts
│   └── jwt-auth.guard.ts
├── decorators/                   # 装饰器
│   ├── roles.decorator.ts
│   └── user.decorator.ts
├── filters/                      # 异常过滤器
│   └── http-exception.filter.ts
├── interceptors/                 # 拦截器
│   └── logging.interceptor.ts
├── pipes/                        # 管道
│   └── validation.pipe.ts
└── validators/                   # 验证器
    └── custom-validators.ts
```

## 文档结构

```
docs/
├── progress/                     # 进行中的文档
│   └── phase-x-[name].md
├── reports/                      # 验收报告
│   └── completed/                # 已完成归档
├── standards/                    # 编码标准
│   ├── naming-conventions.md
│   ├── file-structure.md
│   └── ...
└── templates/                    # 文档模板
    ├── progress-template.md
    └── completed-template.md
```
