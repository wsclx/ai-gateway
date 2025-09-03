from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
import psutil
import time
from datetime import datetime
from typing import Dict, Any

from app.core.database import get_db
from app.core.config import settings

router = APIRouter()

# Startup time for uptime calculation
STARTUP_TIME = time.time()


async def check_database(db: AsyncSession) -> Dict[str, Any]:
    """Check database connectivity and health"""
    try:
        # Test database connection
        result = await db.execute(text("SELECT 1"))
        result.fetchone()
        
        # Get database info
        db_info = await db.execute(text("SELECT version()"))
        version = db_info.fetchone()[0]
        
        return {
            "status": "ok",
            "version": version,
            "connection": "healthy"
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "connection": "failed"
        }


async def check_ai_provider() -> Dict[str, Any]:
    """Check AI provider status"""
    try:
        provider = settings.AI_PROVIDER or "demo"
        
        if provider == "demo":
            return {
                "status": "ok",
                "provider": "demo",
                "message": "Demo mode active - no external API required"
            }
        elif provider == "openai":
            if not settings.OPENAI_API_KEY:
                return {
                    "status": "warning",
                    "provider": "openai",
                    "message": "OpenAI API key not configured"
                }
            return {
                "status": "ok",
                "provider": "openai",
                "message": "OpenAI API key configured"
            }
        elif provider == "anthropic":
            if not settings.ANTHROPIC_API_KEY:
                return {
                    "status": "warning",
                    "provider": "anthropic",
                    "message": "Anthropic API key not configured"
                }
            return {
                "status": "ok",
                "provider": "anthropic",
                "message": "Anthropic API key configured"
            }
        elif provider == "ollama":
            return {
                "status": "ok",
                "provider": "ollama",
                "message": "Ollama local provider configured"
            }
        else:
            return {
                "status": "error",
                "provider": provider,
                "message": "Unknown AI provider"
            }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "message": "Failed to check AI provider"
        }


async def check_storage() -> Dict[str, Any]:
    """Check storage availability"""
    try:
        # Check disk usage
        disk_usage = psutil.disk_usage('/')
        disk_percent = disk_usage.percent
        
        if disk_percent > 90:
            status = "warning"
        elif disk_percent > 95:
            status = "error"
        else:
            status = "ok"
        
        return {
            "status": status,
            "disk_percent": disk_percent,
            "disk_free_gb": round(disk_usage.free / (1024**3), 2),
            "disk_total_gb": round(disk_usage.total / (1024**3), 2)
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "message": "Failed to check storage"
        }


async def check_migrations(db: AsyncSession) -> Dict[str, Any]:
    """Check database migrations status"""
    try:
        # Check if migrations table exists
        result = await db.execute(text("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'alembic_version'
            )
        """))
        migrations_table_exists = result.fetchone()[0]
        
        if migrations_table_exists:
            # Get current migration version
            result = await db.execute(text("SELECT version_num FROM alembic_version"))
            current_version = result.fetchone()[0]
            
            return {
                "status": "ok",
                "migrations_table": True,
                "current_version": current_version
            }
        else:
            return {
                "status": "warning",
                "migrations_table": False,
                "message": "Migrations table not found"
            }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "message": "Failed to check migrations"
        }


@router.get("/health")
async def health_check():
    """Basic health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "version": getattr(settings, 'VERSION', '1.0.0'),
        "environment": settings.ENVIRONMENT
    }


@router.get("/health/detailed")
async def detailed_health_check(db: AsyncSession = Depends(get_db)):
    """Detailed system health check"""
    
    # Run all health checks
    checks = {
        "database": await check_database(db),
        "ai_provider": await check_ai_provider(),
        "storage": await check_storage(),
        "migrations": await check_migrations(db),
    }
    
    # Determine overall status
    overall_status = "healthy"
    if any(check["status"] == "error" for check in checks.values()):
        overall_status = "unhealthy"
    elif any(check["status"] == "warning" for check in checks.values()):
        overall_status = "degraded"
    
    # Get system metrics
    system_metrics = {
        "cpu_percent": psutil.cpu_percent(interval=1),
        "memory_percent": psutil.virtual_memory().percent,
        "uptime_seconds": round(time.time() - STARTUP_TIME, 2),
        "uptime_hours": round((time.time() - STARTUP_TIME) / 3600, 2)
    }
    
    return {
        "status": overall_status,
        "timestamp": datetime.utcnow(),
        "version": getattr(settings, 'VERSION', '1.0.0'),
        "environment": settings.ENVIRONMENT,
        "checks": checks,
        "system": system_metrics
    }


@router.get("/health/ready")
async def readiness_check(db: AsyncSession = Depends(get_db)):
    """Readiness check for Kubernetes"""
    
    # Check critical services
    db_check = await check_database(db)
    storage_check = await check_storage()
    
    # Service is ready if database and storage are ok
    is_ready = (
        db_check["status"] == "ok" and 
        storage_check["status"] in ["ok", "warning"]
    )
    
    if is_ready:
        return {"status": "ready"}
    else:
        return {
            "status": "not_ready",
            "checks": {
                "database": db_check,
                "storage": storage_check
            }
        }


@router.get("/health/live")
async def liveness_check():
    """Liveness check for Kubernetes"""
    return {"status": "alive"}
