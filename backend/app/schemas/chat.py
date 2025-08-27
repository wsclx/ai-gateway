from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ThreadCreate(BaseModel):
    assistant_id: str
    title: Optional[str] = None

class ThreadResponse(BaseModel):
    id: str
    title: str
    assistant_id: str
    created_at: str
    updated_at: str
    message_count: int

class ThreadListResponse(BaseModel):
    id: str
    title: str
    assistant_id: str
    created_at: str
    updated_at: str
    message_count: int

class MessageCreate(BaseModel):
    content: str
    assistant_id: str

class MessageResponse(BaseModel):
    id: str
    role: str
    content: str
    timestamp: str
    assistant_id: Optional[str] = None
    thread_id: Optional[str] = None

class ChatRequest(BaseModel):
    assistant_id: str
    message: str
    thread_id: Optional[str] = None

class ChatResponse(BaseModel):
    content: str
    tokens_used: int
    cost_cents: int
