from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, conint
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid
from typing import List

from app.core.database import get_db
from app.core.authz import require_role
from app.models.config import GatewayConfig
from app.models.user import User, Department


router = APIRouter()


class ConfigUpdate(BaseModel):
    openaiApiKey: str | None = Field(default=None, min_length=1)
    anthropicApiKey: str | None = Field(default=None, min_length=1)
    retentionDays: conint(ge=0) | None = None
    redactionEnabled: bool | None = None
    budgetMonthlyCents: conint(ge=0) | None = None
    costAlertThresholdCents: conint(ge=0) | None = None
    featureDemoMode: bool | None = None
    enableAnalytics: bool | None = None


class UserCreate(BaseModel):
    email: str = Field(..., min_length=1)
    display_name: str = Field(..., min_length=1)
    role: str = Field(default="user", pattern="^(admin|user|dpo)$")
    department: str = Field(default="IT")


class UserUpdate(BaseModel):
    display_name: str | None = None
    role: str | None = Field(None, pattern="^(admin|user|dpo)$")
    department: str | None = None
    status: str | None = Field(None, pattern="^(active|inactive)$")


def _to_dict(cfg: GatewayConfig) -> dict:
    return {
        "openaiApiKey": bool(cfg.openai_api_key),  # do not expose key
        "anthropicApiKey": bool(cfg.anthropic_api_key),
        "retentionDays": cfg.retention_days,
        "redactionEnabled": cfg.redaction_enabled,
        "budgetMonthlyCents": cfg.budget_monthly_cents,
        "costAlertThresholdCents": cfg.cost_alert_threshold_cents,
        "featureDemoMode": cfg.feature_demo_mode,
        "enableAnalytics": cfg.enable_analytics,
    }


def _user_to_dict(user: User, dept: Department | None = None) -> dict:
    return {
        "id": str(user.id),
        "email": f"{user.ext_subject}@local",
        "display_name": user.display_name,
        "role": user.role,
        "department": dept.name if dept else "IT",
        "status": "active",
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "last_login": None  # TODO: Implement login tracking
    }


async def _get_or_create_config(db: AsyncSession) -> GatewayConfig:
    row = await db.execute(select(GatewayConfig))
    cfg = row.scalars().first()
    if not cfg:
        cfg = GatewayConfig()
        db.add(cfg)
        await db.commit()
        await db.refresh(cfg)
    return cfg


@router.get("/config")
async def get_config(
    db: AsyncSession = Depends(get_db),
    user=Depends(require_role("admin", "dpo"))
):
    cfg = await _get_or_create_config(db)
    return _to_dict(cfg)


@router.put("/config")
async def update_config(
    payload: ConfigUpdate,
    db: AsyncSession = Depends(get_db),
    user=Depends(require_role("admin", "dpo")),
):
    cfg = await _get_or_create_config(db)
    # Update allowed fields
    if payload.retentionDays is not None:
        cfg.retention_days = payload.retentionDays
    if payload.redactionEnabled is not None:
        cfg.redaction_enabled = payload.redactionEnabled
    if payload.budgetMonthlyCents is not None:
        cfg.budget_monthly_cents = payload.budgetMonthlyCents
    if payload.costAlertThresholdCents is not None:
        cfg.cost_alert_threshold_cents = payload.costAlertThresholdCents
    if payload.featureDemoMode is not None:
        cfg.feature_demo_mode = payload.featureDemoMode
    if payload.enableAnalytics is not None:
        cfg.enable_analytics = payload.enableAnalytics

    # Provider keys (optional; avoid echoing back)
    # NOTE: At-Rest Encryption: replace assignment with envelope
    # encryption (KMS) in production
    if payload.openaiApiKey:
        cfg.openai_api_key = payload.openaiApiKey.strip()
    if payload.anthropicApiKey:
        cfg.anthropic_api_key = payload.anthropicApiKey.strip()

    await db.commit()
    await db.refresh(cfg)
    return _to_dict(cfg)


# User Management Endpoints
@router.get("/users")
async def get_users(
    db: AsyncSession = Depends(get_db),
    user=Depends(require_role("admin", "dpo"))
):
    """Get all users"""
    users = await db.execute(select(User))
    user_list = users.scalars().all()
    
    result = []
    for u in user_list:
        dept = None
        if u.dept_id:
            dept_row = await db.execute(select(Department).where(Department.id == u.dept_id))
            dept = dept_row.scalar_one_or_none()
        result.append(_user_to_dict(u, dept))
    
    return result


@router.post("/users")
async def create_user(
    payload: UserCreate,
    db: AsyncSession = Depends(get_db),
    user=Depends(require_role("admin"))
):
    """Create a new user"""
    # Check if user already exists
    existing = await db.execute(select(User).where(User.ext_subject == payload.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="User already exists")
    
    # Get or create department
    dept_row = await db.execute(select(Department).where(Department.key == payload.department.lower()))
    dept = dept_row.scalar_one_or_none()
    if not dept:
        dept = Department(id=uuid.uuid4(), key=payload.department.lower(), name=payload.department)
        db.add(dept)
        await db.flush()
    
    # Create user
    new_user = User(
        id=uuid.uuid4(),
        ext_subject=payload.email,
        ext_subject_hash="0" * 64,  # TODO: Proper hash
        display_name=payload.display_name,
        dept_id=dept.id,
        role=payload.role,
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    return _user_to_dict(new_user, dept)


@router.get("/users/{user_id}")
async def get_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    user=Depends(require_role("admin", "dpo"))
):
    """Get a specific user"""
    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID")
    
    user_row = await db.execute(select(User).where(User.id == user_uuid))
    user_obj = user_row.scalar_one_or_none()
    if not user_obj:
        raise HTTPException(status_code=404, detail="User not found")
    
    dept = None
    if user_obj.dept_id:
        dept_row = await db.execute(select(Department).where(Department.id == user_obj.dept_id))
        dept = dept_row.scalar_one_or_none()
    
    return _user_to_dict(user_obj, dept)


@router.put("/users/{user_id}")
async def update_user(
    user_id: str,
    payload: UserUpdate,
    db: AsyncSession = Depends(get_db),
    user=Depends(require_role("admin"))
):
    """Update a user"""
    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID")
    
    user_row = await db.execute(select(User).where(User.id == user_uuid))
    user_obj = user_row.scalar_one_or_none()
    if not user_obj:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update fields
    if payload.display_name is not None:
        user_obj.display_name = payload.display_name
    if payload.role is not None:
        user_obj.role = payload.role
    if payload.department is not None:
        # Update department
        dept_row = await db.execute(select(Department).where(Department.key == payload.department.lower()))
        dept = dept_row.scalar_one_or_none()
        if not dept:
            dept = Department(id=uuid.uuid4(), key=payload.department.lower(), name=payload.department)
            db.add(dept)
            await db.flush()
        user_obj.dept_id = dept.id
    
    await db.commit()
    await db.refresh(user_obj)
    
    dept = None
    if user_obj.dept_id:
        dept_row = await db.execute(select(Department).where(Department.id == user_obj.dept_id))
        dept = dept_row.scalar_one_or_none()
    
    return _user_to_dict(user_obj, dept)


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    user=Depends(require_role("admin"))
):
    """Delete a user"""
    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID")
    
    user_row = await db.execute(select(User).where(User.id == user_uuid))
    user_obj = user_row.scalar_one_or_none()
    if not user_obj:
        raise HTTPException(status_code=404, detail="User not found")
    
    await db.delete(user_obj)
    await db.commit()
    
    return {"message": "User deleted successfully"}


