# API Service

FastAPI + Celery + Alembic service for K-12 Math Matrix.

## Local Commands

```bash
uv python install 3.13
uv venv .venv --python 3.13
uv sync
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
uv run celery -A app.tasks.celery_app.celery_app worker --loglevel=info
uv run alembic upgrade head
uv run pytest
```

Node.js applications in this repository must be installed and run with `pnpm`, not `npm`.
