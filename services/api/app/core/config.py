from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "K-12 Math Matrix API"
    environment: str = "local"
    enable_docs: bool = True
    api_v1_prefix: str = "/api/v1"

    database_url: str = Field(
        default="postgresql+psycopg://k12:k12_local_password@postgres:5432/k12_math_matrix",
        alias="DATABASE_URL",
    )
    redis_url: str = Field(default="redis://redis:6379/0", alias="REDIS_URL")
    meilisearch_url: str = Field(default="http://meilisearch:7700", alias="MEILISEARCH_URL")
    meilisearch_master_key: str = Field(default="local-meilisearch-key", alias="MEILISEARCH_MASTER_KEY")
    rustfs_endpoint: str = Field(default="http://rustfs:9000", alias="RUSTFS_ENDPOINT")
    rustfs_access_key: str = Field(default="rustfsadmin", alias="RUSTFS_ACCESS_KEY")
    rustfs_secret_key: str = Field(default="ChangeMe123!", alias="RUSTFS_SECRET_KEY")
    rustfs_bucket_media: str = Field(default="k12-math-media", alias="RUSTFS_BUCKET_MEDIA")
    jwt_secret: str = Field(default="change-this-in-real-env", alias="JWT_SECRET")


settings = Settings()

