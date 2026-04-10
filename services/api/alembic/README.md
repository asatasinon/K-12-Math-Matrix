# Alembic Migrations

Run new migrations from `services/api`:

```bash
uv run alembic revision --autogenerate -m "create initial tables"
uv run alembic upgrade head
```

The concrete schema should follow `docs/database-schema.md`.

