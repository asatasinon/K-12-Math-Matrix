# K-12 Math Matrix 技术栈文档

## 1. 选型原则

本项目的技术选型遵循 4 条原则：

- 面向内容平台，不做一次性展示型前端
- 面向自托管可控，不依赖重度 SaaS
- 面向结构化知识资产，不把内容退化为普通文章
- 面向 0-1 落地，不引入过早的微服务复杂度

## 2. 最终技术栈

| 层级 | 选型 | 用途 |
| --- | --- | --- |
| 前台 Web | Next.js 15 + React 19 + TypeScript | 学生侧内容站、课程树、知识点页、搜索页 |
| 后台 Web | Next.js 15 + React 19 + TypeScript | 教研后台、审核中心、媒体管理 |
| 后端 API | Python 3.13 + FastAPI | 内容服务、关系服务、搜索聚合、审核流、AI 编排 |
| 异步任务 | Celery | AI 任务、索引刷新、缓存刷新、媒体后处理 |
| 主数据库 | PostgreSQL | 存储结构化内容、关系、版本、审核记录 |
| 搜索引擎 | Meilisearch | 全文检索、筛选、排序 |
| 缓存/队列 | Redis | 缓存、异步任务、限流 |
| 对象存储 | RustFS | 图片、封面、导出资产 |
| ORM | SQLAlchemy 2.0 | Python 侧数据库访问与关系映射 |
| 数据迁移 | Alembic | 数据库 schema 迁移 |
| 数据校验 | Pydantic v2 | 请求/响应模型、配置校验 |
| 数学公式渲染 | KaTeX | 前台与后台公式显示 |
| 几何绘图 | SVG + JSXGraph | 静态图与交互几何图 |
| 图谱可视化 | D3.js | 知识点邻接图、专题关系图 |
| UI 组件 | Tailwind CSS + shadcn/ui | 快速构建后台与内容站界面 |
| 仓库组织 | 单仓混合技术栈 + pnpm + uv | 前端与 Python 后端共仓管理 |
| 鉴权 | JWT + HttpOnly Cookie | 前后端分离下的后台登录态 |
| 日志 | structlog | 后端结构化日志 |
| 监控 | OpenTelemetry + Prometheus + Grafana + Loki | 指标、链路、日志观测 |
| 测试 | Vitest、Playwright、pytest | 单测、E2E、接口测试 |
| 部署 | Docker Compose，后续可迁移 K8s | 自托管部署与环境一致性 |
| CI/CD | GitHub Actions | 测试、镜像构建、部署流水线 |

## 3. 为什么这样选

### 3.1 前台与后台统一使用 Next.js

选 Next.js 的原因：

- 知识点详情页、专题页、课程页需要 SSR/SEO
- 既能做公开站，也能做内部后台
- 路由、数据获取、静态生成能力成熟
- 更适合内容型产品，而不是单页演示应用

不继续沿用历史 Vite 原型作为正式架构的原因：

- Vite 更适合纯前端应用原型
- 对 SEO 和内容页首屏能力支持不足
- 后续再补 SSR 会产生额外迁移成本

### 3.2 后端采用 Python + FastAPI

选 FastAPI 的原因：

- Python 在 AI 编排、文本处理、内容清洗、数学内容加工上更有生态优势
- FastAPI 的性能和开发体验足以支撑 0-1 阶段内容平台
- Pydantic 模型定义清晰，适合结构化请求与响应
- 自动生成 OpenAPI 文档，便于前后端联调和后续 SDK 生成
- 与 SQLAlchemy、Alembic、Celery 的配套成熟

不继续坚持后端 TypeScript 一栈的原因：

- 本项目的 AI 生成、质量检查、文本处理明显更贴近 Python 生态
- 将 AI 工作流放到 Python 后端中，可以减少跨语言调用与维护成本
- 前端仍保留 TypeScript，不影响页面开发效率

后端配套固定如下：

- Web 框架：FastAPI
- ORM：SQLAlchemy 2.0
- 数据迁移：Alembic
- 数据校验：Pydantic v2
- 异步任务：Celery + Redis
- 运行容器：Uvicorn

### 3.3 PostgreSQL 作为主库

选 PostgreSQL 的原因：

- 结构化数据、事务、版本记录、审核流都适合关系型数据库
- 可用 JSONB 存储富文本与图规格
- 后续即使增加分析场景也有扩展空间

首版不单独引入图库的原因：

- 当前图谱是“知识点关系查询”，不是超大规模图计算平台
- 关系边可以通过表结构和索引解决
- 过早引入图库会增加运维与建模复杂度

### 3.4 Meilisearch 作为搜索引擎

选 Meilisearch 的原因：

- 部署轻量，自托管成本低
- 适合内容站的全文检索与筛选
- 对中文场景可通过分词预处理和字段设计满足 MVP

首版不直接上 Elasticsearch 的原因：

- 资源占用和维护复杂度更高
- 对当前项目体量而言收益不明显

### 3.5 RustFS 作为对象存储

选 RustFS 的原因：

- 自托管友好
- 提供 S3 兼容接口，媒体上传、预签名上传和对象管理方案可以直接沿用
- 对高性能对象存储场景更贴合，适合作为图片、封面、导出资产的统一存储层
- 适合图片、封面、导出素材等资源管理

不再使用 MinIO 的原因：

- 当前技术栈已经明确转向更强调对象存储性能和 Rust 生态的基础设施
- 在保持 S3 兼容的前提下，RustFS 可以替代 MinIO 而不需要重做应用层对象存储接口

### 3.6 数学渲染与绘图

- `KaTeX` 用于公式渲染，因为渲染快、体积可控、适合教育内容页
- `SVG` 用于静态数学图，因为可缩放、可导出、可保持清晰
- `JSXGraph` 用于交互几何图，因为比手写 Canvas 更贴近数学对象建模
- `D3` 只负责知识图谱和部分关系图，不承担正文里的几何作图

## 4. 工程组织方式

建议采用单仓混合技术栈结构：

```text
apps/
  student-web/
  admin-web/
services/
  api/
    app/
    tests/
    alembic/
packages/
  ui/
  config/
  math-render/
docs/
```

这样做的原因：

- 前端继续使用 `pnpm workspace`
- Python 后端使用 `uv` 管理依赖和锁文件
- 保持一个仓库协作，但不强行把 Python 服务塞进 JavaScript-only 工程语义
- 文档、脚本、部署配置仍然可以统一管理

## 5. 后端模块划分

FastAPI 服务内部按领域模块组织：

- `auth`
- `curriculum`
- `knowledge`
- `relations`
- `search`
- `media`
- `review`
- `ai`
- `versioning`

推荐目录结构：

```text
services/api/app/
  main.py
  core/
  db/
  models/
  schemas/
  api/
    v1/
  services/
  tasks/
```

分层规则固定如下：

- `api`：FastAPI 路由层
- `schemas`：Pydantic 请求响应模型
- `models`：SQLAlchemy 模型
- `services`：业务逻辑
- `tasks`：Celery 异步任务
- `db`：数据库会话与基础访问层

## 6. 数据与搜索策略

### 6.1 正文存储

正文采用“结构化数据库 + 富文本 JSON”的方式：

- 理论、案例、技巧正文存 PostgreSQL JSONB
- 公式单独结构化存储，便于索引和复用
- 图规格单独存储，便于渲染和复用

### 6.2 搜索索引

Meilisearch 索引字段建议固定为：

- 标题
- 别名
- 学段
- 年级
- 领域
- 子领域
- 标签
- 难度
- 主线来源
- 摘要
- 核心公式文本

发布后通过异步任务刷新索引，不在写请求中同步重建。

## 7. 鉴权与安全

后台登录方案固定为：

- 后端签发 JWT
- 浏览器保存 HttpOnly Cookie
- 前台学生站无需登录即可访问已发布内容
- 后台接口统一走守卫与角色校验

首版不做 SSO、多组织、多租户隔离。

## 8. 测试策略

- `Vitest`：前端组件、工具函数、内容转换逻辑
- `pytest`：FastAPI API 测试、服务层测试、数据库集成测试
- `Playwright`：学生前台与教研后台关键流程 E2E

必须覆盖的关键路径：

- 搜索与筛选
- 知识点详情页渲染
- 内容创建到发布
- 版本回滚
- 关系编辑与展示

## 9. 可观测性

必须具备最小观测体系：

- API 请求日志
- 异步任务执行日志
- 关键接口耗时指标
- 搜索命中率与失败率
- AI 任务成功率与人工打回率

首版不追求复杂 APM，但必须保证问题能定位。

## 10. 部署与环境

环境分 4 类：

- `local`：本地开发
- `dev`：共享开发环境
- `staging`：预发验证
- `prod`：生产环境

部署固定策略：

- 应用镜像容器化
- 使用 Docker Compose 启动基础服务
- FastAPI 与 Celery 分别构建镜像
- GitHub Actions 负责测试与镜像构建
- 后续流量上升时迁移到 K8s，但不影响应用层接口设计

## 11. 不做的技术事项

第一版明确不做：

- 微服务拆分
- GraphQL 主接口
- 自研全文检索
- 站内视频转码平台
- 图数据库主存
- 原生移动端客户端
