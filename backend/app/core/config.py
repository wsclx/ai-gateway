from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "Audiencly AI Gateway"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5556",
        "http://localhost:5558",
        "http://localhost:3000",
    ]
    ALLOWED_HOSTS: List[str] = ["localhost", "127.0.0.1"]
    
    # Database
    DATABASE_URL: str = (
        "postgresql://audiencly:audiencly_secure_password@localhost:5557/audiencly"
    )
    
    # Redis
    REDIS_URL: str = "redis://localhost:5558"
    
    # MinIO
    MINIO_ENDPOINT: str = "localhost:5559"
    MINIO_ACCESS_KEY: str = "audiencly"
    MINIO_SECRET_KEY: str = (
        "audiencly_secure_password"
    )
    MINIO_BUCKET_NAME: str = "audiencly"
    
    # AI Providers
    OPENAI_API_KEY: str = "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"
    OPENAI_BASE_URL: str = "https://api.openai.com/v1"
    ANTHROPIC_API_KEY: str = ""
    
    # OIDC
    # Microsoft Entra ID (Azure AD)
    MS_TENANT_ID: str = ""
    MS_CLIENT_ID: str = ""
    MS_CLIENT_SECRET: str = ""
    MS_REDIRECT_URI: str = "http://localhost:5556/auth/callback"  # frontend callback
    MS_AUTH_SCOPE: str = "openid profile email User.Read"
    
    # Monitoring
    ENABLE_METRICS: bool = True
    METRICS_PORT: int = 9090
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Create settings instance
settings = Settings()
