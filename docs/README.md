# DroneMaintenance-Ledger 文档索引

**最后更新**: 2026-01-17

---

## 快速导航

| 文档 | 说明 |
|------|------|
| [PROJECT_STATUS.md](./PROJECT_STATUS.md) | **项目总状态** - 当前进展、完成度、问题清单 |
| [../README.md](../README.md) | 项目介绍和产品需求 |
| [../CLAUDE.md](../CLAUDE.md) | Claude Code 开发指南 |

---

## 文档结构

```
docs/
├── README.md              # 本文件 - 文档索引
├── PROJECT_STATUS.md      # 项目总状态报告
├── database-setup.md      # 数据库配置指南
│
├── progress/              # 进行中的任务文档
│   ├── README.md          # 进度目录说明
│   └── phase-2-plan.md    # Phase 2 开发计划
│
├── reports/               # 分析报告
│   ├── code-analysis-*.md # 代码分析报告
│   ├── code-issues-*.md   # 代码问题清单
│   └── completed/         # 已完成阶段的报告
│
├── standards/             # 规范文档
│   ├── file-structure.md  # 文件结构规范
│   ├── naming-conventions.md # 命名规范
│   └── user-lifecycle.md  # 用户角色与业务流程
│
└── templates/             # 文档模板
    ├── progress-template.md  # 进度文档模板
    └── completed-template.md # 完成报告模板
```

---

## 核心文档

### 项目状态

- **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** - 项目总体进展、技术栈、问题清单、下一步计划

### 开发指南

- **[database-setup.md](./database-setup.md)** - 数据库环境配置和初始化

### 规范文档

- **[standards/file-structure.md](./standards/file-structure.md)** - 代码目录结构规范
- **[standards/naming-conventions.md](./standards/naming-conventions.md)** - 命名约定（文件、变量、API）
- **[standards/user-lifecycle.md](./standards/user-lifecycle.md)** - 用户角色定义和业务流程

---

## 进度追踪

### 当前阶段

- **[progress/phase-2-plan.md](./progress/phase-2-plan.md)** - Phase 2 开发计划（Sprint 1-2 已完成）

### 已完成阶段

| 阶段 | 报告 | 完成时间 |
|------|------|----------|
| Phase 0 | [phase-0-infrastructure.md](./reports/completed/phase-0-infrastructure.md) | 2026-01-16 |
| Phase 0-1 | [phase-0-1-data-model-auth-asset.md](./reports/completed/phase-0-1-data-model-auth-asset.md) | 2026-01-16 |
| Phase 1 | [phase-1-api-frontend.md](./reports/completed/phase-1-api-frontend.md) | 2026-01-16 |
| Phase 2 Sprint 1 | [phase-2-sprint-1-infrastructure.md](./reports/completed/phase-2-sprint-1-infrastructure.md) | 2026-01-16 |
| Phase 2 Sprint 2 | [phase-2-sprint-2-api-integration.md](./reports/completed/phase-2-sprint-2-api-integration.md) | 2026-01-17 |

---

## 问题与分析

- **[reports/code-analysis-2026-01-16.md](./reports/code-analysis-2026-01-16.md)** - 代码质量分析
- **[reports/code-issues-2026-01-17.md](./reports/code-issues-2026-01-17.md)** - TypeScript 错误清单（约 56 个）

---

## 使用指南

### 新增进度文档

1. 复制 `templates/progress-template.md` 到 `progress/` 目录
2. 按模板填写内容
3. 完成后移动到 `reports/completed/`

### 更新项目状态

1. 编辑 `PROJECT_STATUS.md`
2. 更新 `progress/README.md` 中的状态表

### 文档命名规范

- 进度文档：`phase-{n}-{sprint-name}.md` 或 `{task-name}.md`
- 报告文档：`{report-type}-{date}.md`
- 已完成报告：`phase-{n}-{sprint-name}.md`
