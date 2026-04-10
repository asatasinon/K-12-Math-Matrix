from fastapi import FastAPI

from app.api.v1.router import api_router
from app.core.config import settings


def create_app() -> FastAPI:
    app = FastAPI(
        title="K-12 Math Matrix API",
        version="0.1.0",
        openapi_url=f"{settings.api_v1_prefix}/openapi.json",
        docs_url="/docs" if settings.enable_docs else None,
        redoc_url="/redoc" if settings.enable_docs else None,
    )
    app.include_router(api_router, prefix=settings.api_v1_prefix)
    return app


app = create_app()

