from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.user import User


async def get_current_local_user(db: AsyncSession = Depends(get_db)) -> User:
    row = await db.execute(select(User).order_by(User.created_at.asc()))
    user = row.scalars().first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No user")
    return user


def require_role(*roles: str):
    async def _inner(user: User = Depends(get_current_local_user)):
        if user.role not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return user
    return _inner


