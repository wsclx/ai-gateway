from sqlalchemy import (
    Column, String, Text, DateTime, ForeignKey, Boolean
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    thread_id = Column(
        UUID(as_uuid=True), ForeignKey("threads.id"), nullable=True
    )
    user_id = Column(
        UUID(as_uuid=True), ForeignKey("app_users.id"), nullable=False
    )
    external_id = Column(String(255), nullable=True)
    external_system = Column(String(100), nullable=True)
    status = Column(String(50), default="open")
    priority = Column(String(20), default="medium")
    category = Column(String(100), default="IT")
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    thread = relationship("Thread", foreign_keys=[thread_id])
    comments = relationship(
        "TicketComment", back_populates="ticket", 
        cascade="all, delete-orphan"
    )
    attachments = relationship(
        "TicketAttachment", back_populates="ticket", 
        cascade="all, delete-orphan"
    )
    audit_logs = relationship(
        "TicketAuditLog", back_populates="ticket", 
        cascade="all, delete-orphan"
    )


class TicketComment(Base):
    __tablename__ = "ticket_comments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ticket_id = Column(
        UUID(as_uuid=True), ForeignKey("tickets.id"), nullable=False
    )
    user_id = Column(
        UUID(as_uuid=True), ForeignKey("app_users.id"), nullable=False
    )
    comment = Column(Text, nullable=False)
    is_internal = Column(Boolean, default=False)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    ticket = relationship("Ticket", back_populates="comments")
    user = relationship("User")


class TicketAttachment(Base):
    __tablename__ = "ticket_attachments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ticket_id = Column(
        UUID(as_uuid=True), ForeignKey("tickets.id"), nullable=False
    )
    user_id = Column(
        UUID(as_uuid=True), ForeignKey("app_users.id"), nullable=False
    )
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(String(20))
    mime_type = Column(String(100))
    created_at = Column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    ticket = relationship("Ticket", back_populates="attachments")
    user = relationship("User")


class TicketAuditLog(Base):
    __tablename__ = "ticket_audit_log"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ticket_id = Column(
        UUID(as_uuid=True), ForeignKey("tickets.id"), nullable=False
    )
    user_id = Column(
        UUID(as_uuid=True), ForeignKey("app_users.id"), nullable=False
    )
    action = Column(String(100), nullable=False)
    details = Column(Text)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    ticket = relationship("Ticket", back_populates="audit_logs")
    user = relationship("User")
