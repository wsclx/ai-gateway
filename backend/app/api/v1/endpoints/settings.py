from fastapi import APIRouter
from app.core.config import settings

router = APIRouter()


@router.get("/")
async def get_settings():
    """Get application settings for frontend"""
    return {
        "ai_provider": settings.AI_PROVIDER,
        "demo_mode": settings.AI_PROVIDER == "demo",
        "features": {
            "chat": True,
            "analytics": True,
            "training": False,  # Not implemented
            "tickets": True,
            "admin": True,
            "branding": True
        },
        "environment": settings.ENVIRONMENT,
        "version": getattr(settings, 'VERSION', '1.0.0')
    }
