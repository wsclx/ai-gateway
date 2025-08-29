from fastapi import Depends, HTTPException, status, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional

from app.core.database import get_db
from app.models.user import User


async def get_current_user(
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None)
) -> User:
    """Get current user from JWT token or create default admin user"""
    if not authorization or not authorization.startswith("Bearer "):
        # For development: create default admin user if none exists
        user = await _get_or_create_default_admin(db)
        return user
    
    token = authorization.replace("Bearer ", "")
    # TODO: Implement proper JWT token validation
    # For now, return default admin user
    user = await _get_or_create_default_admin(db)
    return user


async def _get_or_create_default_admin(db: AsyncSession) -> User:
    """Create default admin user if none exists"""
    row = await db.execute(select(User).where(User.role == "admin"))
    user = row.scalars().first()
    
    if not user:
        # Create default admin user
        from app.models.user import Department
        import uuid
        import hashlib
        
        # Create IT department if it doesn't exist
        dept_row = await db.execute(select(Department).where(Department.key == "IT"))
        dept = dept_row.scalars().first()
        
        if not dept:
            dept = Department(
                id=uuid.uuid4(),
                key="IT",
                name="Information Technology"
            )
            db.add(dept)
            await db.commit()
            await db.refresh(dept)
        
        # Create admin user
        ext_subject = "admin@local.dev"
        ext_subject_hash = hashlib.sha256(ext_subject.encode()).hexdigest()
        
        user = User(
            id=uuid.uuid4(),
            ext_subject=ext_subject,
            ext_subject_hash=ext_subject_hash,
            display_name="System Administrator",
            dept_id=dept.id,
            role="admin"
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    
    return user


def require_role(*roles: str):
    async def _inner(user: User = Depends(get_current_user)):
        if user.role not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return user
    return _inner


