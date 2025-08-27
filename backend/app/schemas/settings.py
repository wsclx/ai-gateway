from typing import Optional
from pydantic import BaseModel, Field


class UserSettings(BaseModel):
    """User settings model"""
    display_name: str = Field(default="", description="User display name")
    email: str = Field(description="User email address")
    department: str = Field(default="IT", description="User department")
    role: str = Field(default="user", description="User role")
    language: str = Field(default="de", description="Preferred language")
    timezone: str = Field(
        default="Europe/Berlin", description="User timezone"
    )
    default_assistant: str = Field(
        default="", description="Default AI assistant"
    )
    max_tokens: int = Field(
        default=4000, ge=100, le=32000,
        description="Max tokens for AI responses"
    )
    temperature: float = Field(
        default=0.7, ge=0.0, le=2.0,
        description="AI creativity level"
    )
    notifications_enabled: bool = Field(
        default=True, description="Enable notifications"
    )
    two_factor_enabled: bool = Field(
        default=False, description="Enable 2FA"
    )
    session_timeout: int = Field(
        default=30, ge=5, le=1440,
        description="Session timeout in minutes"
    )
    password_expiry: int = Field(
        default=90, ge=30, le=365,
        description="Password expiry in days"
    )
    login_notifications: bool = Field(
        default=True, description="Notify on login"
    )
    data_retention: int = Field(
        default=365, ge=30, le=2555,
        description="Data retention in days"
    )
    analytics_tracking: bool = Field(
        default=True, description="Enable analytics tracking"
    )
    feedback_collection: bool = Field(
        default=True, description="Enable feedback collection"
    )
    prompt_history: bool = Field(
        default=True, description="Save prompt history"
    )


class UserSettingsCreate(UserSettings):
    """Create user settings model"""
    pass


class UserSettingsUpdate(BaseModel):
    """Update user settings model (partial update)"""
    display_name: Optional[str] = None
    department: Optional[str] = None
    role: Optional[str] = None
    language: Optional[str] = None
    timezone: Optional[str] = None
    default_assistant: Optional[str] = None
    max_tokens: Optional[int] = Field(None, ge=100, le=32000)
    temperature: Optional[float] = Field(None, ge=0.0, le=2.0)
    notifications_enabled: Optional[bool] = None
    two_factor_enabled: Optional[bool] = None
    session_timeout: Optional[int] = Field(None, ge=5, le=1440)
    password_expiry: Optional[int] = Field(None, ge=30, le=365)
    login_notifications: Optional[bool] = None
    data_retention: Optional[int] = Field(None, ge=30, le=2555)
    analytics_tracking: Optional[bool] = None
    feedback_collection: Optional[bool] = None
    prompt_history: Optional[bool] = None


class UserSettingsResponse(BaseModel):
    """User settings response model"""
    success: bool
    data: Optional[UserSettings] = None
    message: str
    error: Optional[str] = None

