FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UV_PROJECT_ENVIRONMENT=.venv

WORKDIR /app

RUN pip install --no-cache-dir uv

COPY pyproject.toml README.md ./
RUN uv venv .venv --python 3.13 && uv sync --no-dev

COPY app ./app
COPY alembic ./alembic
COPY alembic.ini ./

CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
