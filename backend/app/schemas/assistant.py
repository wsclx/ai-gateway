from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from enum import Enum


class AssistantStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    MAINTENANCE = "maintenance"


class AssistantCreate(BaseModel):
    name: str
    description: Optional[str] = None
    instructions: Optional[str] = None
    provider: str = "openai"
    system_prompt: str = "Du bist ein hilfreicher KI-Assistent."
    model: str = "gpt-4o-mini"
    status: AssistantStatus = AssistantStatus.ACTIVE


class AssistantUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    instructions: Optional[str] = None
    provider: Optional[str] = None
    system_prompt: Optional[str] = None
    model: Optional[str] = None
    status: Optional[AssistantStatus] = None


class AssistantResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    instructions: Optional[str] = None
    model: str
    status: AssistantStatus
    created_at: datetime
    updated_at: Optional[datetime] = None
    usage_stats: Dict[str, Any]
