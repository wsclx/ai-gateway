from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text

from app.core.database import get_db

router = APIRouter()


@router.get("/db/health")
async def db_health(db: AsyncSession = Depends(get_db)):
    try:
        await db.execute(text("SELECT 1"))
        return {"ok": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB error: {e}")


@router.get("/audit/logs")
async def get_audit_logs(limit: int = 100, db: AsyncSession = Depends(get_db)):
    from app.models.audit import AuditLog
    rows = await db.execute(select(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit))
    return {
        "items": [
            {
                "id": str(a.id),
                "user_id": str(a.user_id) if a.user_id else None,
                "method": a.method,
                "path": a.path,
                "status": a.status,
                "ip": a.ip,
                "user_agent": a.user_agent,
                "duration_ms": a.duration_ms,
                "request_bytes": a.request_bytes,
                "response_bytes": a.response_bytes,
                "created_at": a.created_at.isoformat() if a.created_at else None,
            }
            for a in rows.scalars().all()
        ]
    }
@router.get("/audit/logs")
async def get_audit_logs(limit: int = 100, db: AsyncSession = Depends(get_db)):
    from app.models.audit import AuditLog
    rows = await db.execute(select(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit))
    logs = [
        {
            "id": str(a.id),
            "user_id": str(a.user_id) if a.user_id else None,
            "method": a.method,
            "path": a.path,
            "status": a.status,
            "ip": a.ip,
            "user_agent": a.user_agent,
            "duration_ms": a.duration_ms,
            "request_bytes": a.request_bytes,
            "response_bytes": a.response_bytes,
            "created_at": a.created_at.isoformat() if a.created_at else None,
        }
        for a in rows.scalars().all()
    ]
    return {"items": logs}
