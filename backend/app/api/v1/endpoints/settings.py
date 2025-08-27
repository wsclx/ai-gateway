from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
import logging

from app.core.database import get_db
from app.models.user import User
from app.schemas.settings import (
    UserSettings,
    UserSettingsCreate,
    UserSettingsUpdate,
    UserSettingsResponse
)
from app.core.authz import get_current_local_user

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/settings", response_model=UserSettingsResponse)
async def get_user_settings(
    current_user: User = Depends(get_current_local_user),
    db: AsyncSession = Depends(get_db)
):
    """Get current user's settings"""
    try:
        # Get user with settings
        user_query = select(User).where(User.id == current_user.id)
        user_result = await db.execute(user_query)
        user = user_result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Convert user data to settings format
        settings = UserSettings(
            display_name=user.display_name or "",
            email=user.ext_subject or "",  # Use ext_subject instead of email
            department="IT",  # Default department
            role=user.role or "user",
            language="de",  # Default language
            timezone="Europe/Berlin",  # Default timezone
            default_assistant="",  # Default assistant
            max_tokens=4000,  # Default max tokens
            temperature=0.7,  # Default temperature
            notifications_enabled=True,  # Default notifications
            two_factor_enabled=False,  # Default 2FA
            session_timeout=30,  # Default session timeout
            password_expiry=90,  # Default password expiry
            login_notifications=True,  # Default login notifications
            data_retention=365,  # Default data retention
            analytics_tracking=True,  # Default analytics
            feedback_collection=True,  # Default feedback
            prompt_history=True  # Default prompt history
        )
        
        return UserSettingsResponse(
            success=True,
            data=settings,
            message="Settings retrieved successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get user settings: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user settings: {str(e)}"
        )


@router.post("/settings", response_model=UserSettingsResponse)
async def create_user_settings(
    settings_data: UserSettingsCreate,
    current_user: User = Depends(get_current_local_user),
    db: AsyncSession = Depends(get_db)
):
    """Create or update user settings"""
    try:
        # Update user with settings
        user_update = update(User).where(
            User.id == current_user.id
        ).values(
            display_name=settings_data.display_name,
            role=settings_data.role
        )
        
        await db.execute(user_update)
        await db.commit()
        
        # Get updated user
        user_query = select(User).where(User.id == current_user.id)
        user_result = await db.execute(user_query)
        user = user_result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found after update"
            )
        
        # Convert to settings format
        settings = UserSettings(
            display_name=user.display_name or "",
            email=user.ext_subject or "",  # Use ext_subject instead of email
            department="IT",  # Default department
            role=user.role or "user",
            language="de",  # Default language
            timezone="Europe/Berlin",  # Default timezone
            default_assistant="",  # Default assistant
            max_tokens=4000,  # Default max tokens
            temperature=0.7,  # Default temperature
            notifications_enabled=True,  # Default notifications
            two_factor_enabled=False,  # Default 2FA
            session_timeout=30,  # Default session timeout
            password_expiry=90,  # Default password expiry
            login_notifications=True,  # Default login notifications
            data_retention=365,  # Default data retention
            analytics_tracking=True,  # Default analytics
            feedback_collection=True,  # Default feedback
            prompt_history=True  # Default prompt history
        )
        
        return UserSettingsResponse(
            success=True,
            data=settings,
            message="Settings updated successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Failed to update user settings: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update user settings: {str(e)}"
        )


@router.put("/settings", response_model=UserSettingsResponse)
async def update_user_settings(
    settings_data: UserSettingsUpdate,
    current_user: User = Depends(get_current_local_user),
    db: AsyncSession = Depends(get_db)
):
    """Update user settings"""
    try:
        # Build update data
        update_data = {}
        
        if settings_data.display_name is not None:
            update_data['display_name'] = settings_data.display_name
        if settings_data.role is not None:
            update_data['role'] = settings_data.role
        
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No valid fields to update"
            )
        
        # Update user
        user_update = update(User).where(
            User.id == current_user.id
        ).values(**update_data)
        await db.execute(user_update)
        await db.commit()
        
        # Get updated user
        user_query = select(User).where(User.id == current_user.id)
        user_result = await db.execute(user_query)
        user = user_result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found after update"
            )
        
        # Convert to settings format
        settings = UserSettings(
            display_name=user.display_name or "",
            email=user.ext_subject or "",  # Use ext_subject instead of email
            department="IT",  # Default department
            role=user.role or "user",
            language="de",  # Default language
            timezone="Europe/Berlin",  # Default timezone
            default_assistant="",  # Default assistant
            max_tokens=4000,  # Default max tokens
            temperature=0.7,  # Default temperature
            notifications_enabled=True,  # Default notifications
            two_factor_enabled=False,  # Default 2FA
            session_timeout=30,  # Default session timeout
            password_expiry=90,  # Default password expiry
            login_notifications=True,  # Default login notifications
            data_retention=365,  # Default data retention
            analytics_tracking=True,  # Default analytics
            feedback_collection=True,  # Default feedback
            prompt_history=True  # Default prompt history
        )
        
        return UserSettingsResponse(
            success=True,
            data=settings,
            message="Settings updated successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Failed to update user settings: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update user settings: {str(e)}"
        )
