from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID

class AssistantBase(BaseModel):
    name: str = Field(..., description="Name of the assistant")
    description: Optional[str] = Field(None, description="Description of the assistant")
    instructions: str = Field(..., description="Instructions for the assistant")
    department_id: Optional[UUID] = Field(None, description="Department ID")

class AssistantCreate(AssistantBase):
    pass

class AssistantUpdate(BaseModel):
    name: Optional[str] = Field(None, description="Name of the assistant")
    description: Optional[str] = Field(None, description="Description of the assistant")
    instructions: Optional[str] = Field(None, description="Instructions for the assistant")
    department_id: Optional[UUID] = Field(None, description="Department ID")

class AssistantResponse(AssistantBase):
    id: str = Field(..., description="Assistant ID")
    openai_id: Optional[str] = Field(None, description="OpenAI Assistant ID")
    model: str = Field(..., description="AI model used")
    created_at: datetime = Field(..., description="Creation timestamp")
    
    class Config:
        from_attributes = True

class ChatMessage(BaseModel):
    content: str = Field(..., description="Message content")
    role: str = Field(default="user", description="Message role (user/assistant)")

class ChatRequest(BaseModel):
    message: str = Field(..., description="User message")
    assistant_id: str = Field(..., description="Assistant ID to chat with")

class ChatResponse(BaseModel):
    assistant_id: str = Field(..., description="Assistant ID")
    thread_id: str = Field(..., description="OpenAI thread ID")
    response: str = Field(..., description="Assistant response")
    run_id: str = Field(..., description="OpenAI run ID")
