import os
import secrets
from typing import List

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "AI Gateway"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = os.environ.get("ENVIRONMENT", "development")
    DEBUG: bool = True

    # Security
    SECRET_KEY: str = os.environ.get("SECRET_KEY") or secrets.token_urlsafe(32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000", 
        "http://localhost:5556",
        "http://127.0.0.1:5556",
        "http://frontend:3000"
    ]
    ALLOWED_HOSTS: List[str] = [
        "localhost", "127.0.0.1", "backend", "frontend"
    ]

    # Database
    DATABASE_URL: str = "postgresql://audiencly:audiencly@db:5432/audiencly"

    # Redis
    REDIS_URL: str = "redis://localhost:5558"

    # MinIO
    MINIO_ENDPOINT: str = "localhost:5559"
    MINIO_ACCESS_KEY: str = "minio"
    MINIO_SECRET_KEY: str = "minio_secret"
    MINIO_BUCKET_NAME: str = "aigateway"

    # AI Providers
    AI_PROVIDER: str = os.environ.get("AI_PROVIDER", "demo")
    OPENAI_API_KEY: str = ""
    OPENAI_BASE_URL: str = "https://api.openai.com/v1"
    ANTHROPIC_API_KEY: str = ""

    # OIDC
    # Microsoft Entra ID (Azure AD)
    MS_TENANT_ID: str = ""
    MS_CLIENT_ID: str = ""
    MS_CLIENT_SECRET: str = ""
    MS_REDIRECT_URI: str = "http://localhost:3000/auth/callback"
    MS_AUTH_SCOPE: str = "openid profile email User.Read"

    # Monitoring
    ENABLE_METRICS: bool = True
    METRICS_PORT: int = 9090

    # File Upload
    UPLOAD_DIR: str = os.environ.get("UPLOAD_DIR", "./uploads")
    MAX_FILE_SIZE: int = int(os.environ.get("MAX_FILE_SIZE", "10")) * 1024 * 1024  # 10MB

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
