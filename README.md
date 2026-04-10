# K-12 Math Matrix

项目当前采用双工具链，并且约定固定：

- Python 包管理统一使用 `uv`
- Python 虚拟环境统一使用 `uv venv .venv`
- Node.js 包管理统一使用 `pnpm`

## 目录

- `apps/student-web`：学生端 Next.js 应用
- `apps/admin-web`：教研后台 Next.js 应用
- `services/api`：FastAPI + Celery + Alembic 服务

## 本地开发

### 1. 前端依赖

```bash
corepack enable
pnpm install
```

### 2. Python 服务依赖

```bash
cd services/api
uv python install 3.13
uv venv .venv --python 3.13
uv sync
```

### 3. 启动前端

```bash
pnpm dev:student
pnpm dev:admin
```

### 4. 启动 API / Worker

```bash
cd services/api
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
uv run celery -A app.tasks.celery_app.celery_app worker --loglevel=info
```

### 5. 启动基础设施

```bash
cp .env.example .env
docker compose up postgres redis meilisearch rustfs
```

## 约定

- 不使用 `npm` 管理 Node 依赖
- 不使用 `pip` 或 `python -m venv` 管理 Python 环境
- Python 项目虚拟环境固定在 `services/api/.venv`

