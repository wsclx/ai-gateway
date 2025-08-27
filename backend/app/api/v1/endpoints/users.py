from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid

from app.core.database import get_db
from app.models.user import User, Department
from app.models.assistant import Assistant

router = APIRouter()


LOCAL_SUBJECT = "local-test"


def _to_settings_dict(user: User, dept: Department | None, default_asst: Assistant | None):
    return {
        "displayName": user.display_name,
        "email": f"{user.ext_subject}@local",  # placeholder
        "department": (dept.name if dept else "IT"),
        "role": user.role,
        "defaultAssistant": str(default_asst.id) if default_asst else "",
        "maxTokens": 4000,
        "temperature": 0.7,
        "language": "de",
        "notifications": True,
    }


async def _get_or_create_local_user(db: AsyncSession) -> User:
    # get department or create default IT
    drow = await db.execute(select(Department).where(Department.key == "it"))
    dept = drow.scalar_one_or_none()
    if not dept:
        dept = Department(id=uuid.uuid4(), key="it", name="IT")
        db.add(dept)
        await db.flush()

    urow = await db.execute(select(User).where(User.ext_subject == LOCAL_SUBJECT))
    user = urow.scalar_one_or_none()
    if not user:
        user = User(
            id=uuid.uuid4(),
            ext_subject=LOCAL_SUBJECT,
            ext_subject_hash="0" * 64,
            display_name="Local Tester",
            dept_id=dept.id,
            role="admin",
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    return user


@router.get("/me")
async def get_me(db: AsyncSession = Depends(get_db)):
    # For local test without auth, use a deterministic local user
    user = await _get_or_create_local_user(db)

    dept = None
    if user.dept_id:
        drow = await db.execute(select(Department).where(Department.id == user.dept_id))
        dept = drow.scalar_one_or_none()

    arow = await db.execute(select(Assistant).order_by(Assistant.created_at.asc()))
    default_asst = arow.scalars().first()

    return _to_settings_dict(user, dept, default_asst)


@router.put("/me")
async def update_me(payload: dict, db: AsyncSession = Depends(get_db)):
    user = await _get_or_create_local_user(db)

    # Persist only supported fields in User
    display_name = payload.get("displayName")
    role = payload.get("role")
    if isinstance(display_name, str) and display_name.strip():
        user.display_name = display_name.strip()
    if isinstance(role, str) and role.strip():
        user.role = role.strip()

    await db.commit()
    await db.refresh(user)

    # Rebuild response (others are ephemeral settings for now)
    dept = None
    if user.dept_id:
        drow = await db.execute(select(Department).where(Department.id == user.dept_id))
        dept = drow.scalar_one_or_none()
    arow = await db.execute(select(Assistant).order_by(Assistant.created_at.asc()))
    default_asst = arow.scalars().first()

    return _to_settings_dict(user, dept, default_asst)


