from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime
from uuid import UUID
from enum import Enum


class TicketStatus(str, Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"


class TicketPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class TicketBase(BaseModel):
    title: str
    description: str
    category: str = "IT"
    thread_id: Optional[UUID] = None
    external_id: Optional[str] = None
    external_system: Optional[str] = None
    status: TicketStatus = TicketStatus.OPEN
    priority: TicketPriority = TicketPriority.MEDIUM


class TicketCreate(TicketBase):
    user_id: UUID


class TicketUpdate(BaseModel):
    status: Optional[TicketStatus] = None
    priority: Optional[TicketPriority] = None
    external_id: Optional[str] = None
    external_system: Optional[str] = None


class TicketResponse(TicketBase):
    id: UUID
    user_id: UUID
    thread_id: Optional[UUID] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TicketCommentBase(BaseModel):
    comment: str
    is_internal: bool = False


class TicketCommentCreate(TicketCommentBase):
    ticket_id: UUID
    user_id: UUID


class TicketCommentResponse(TicketCommentBase):
    id: UUID
    ticket_id: UUID
    user_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class TicketAttachmentBase(BaseModel):
    filename: str
    file_path: str
    file_size: Optional[str] = None
    mime_type: Optional[str] = None


class TicketAttachmentCreate(TicketAttachmentBase):
    ticket_id: UUID
    user_id: UUID


class TicketAttachmentResponse(TicketAttachmentBase):
    id: UUID
    ticket_id: UUID
    user_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class TicketAuditLog(BaseModel):
    id: UUID
    ticket_id: UUID
    user_id: UUID
    action: str
    details: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class TicketWithDetails(TicketResponse):
    comments: List[TicketCommentResponse] = []
    attachments: List[TicketAttachmentResponse] = []
    audit_logs: List[TicketAuditLog] = []


class TicketStats(BaseModel):
    total_tickets: int
    open_tickets: int
    in_progress_tickets: int
    resolved_tickets: int
    closed_tickets: int
    tickets_by_priority: dict
    tickets_by_status: dict


class TicketFilter(BaseModel):
    status: Optional[TicketStatus] = None
    priority: Optional[TicketPriority] = None
    user_id: Optional[UUID] = None
    external_system: Optional[str] = None
