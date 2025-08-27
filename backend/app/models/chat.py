from sqlalchemy import Column, String, DateTime, ForeignKey, Integer
from sqlalchemy import CheckConstraint
from sqlalchemy.dialects.postgresql import UUID, JSONB, BYTEA
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.core.database import Base


class Thread(Base):
    __tablename__ = "threads"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    assistant_id = Column(UUID(as_uuid=True), ForeignKey("assistants.id"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("app_users.id"))
    status = Column(
        String(20), 
        nullable=False, 
        default="open"
    )
    __table_args__ = (
        CheckConstraint("status in ('open','closed','archived')"),
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    assistant = relationship("Assistant", back_populates="threads")
    user = relationship("User", back_populates="threads")
    messages = relationship("Message", back_populates="thread")
    
    def __repr__(self):
        return f"<Thread(id='{self.id}', status='{self.status}')>"


class Message(Base):
    __tablename__ = "messages"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    thread_id = Column(UUID(as_uuid=True), ForeignKey("threads.id"))
    role = Column(String(20))
    __table_args__ = (
        CheckConstraint("role in ('user','assistant','system')"),
    )
    content_ciphertext = Column(BYTEA, nullable=False)
    content_sha256 = Column(String(64), nullable=False)
    tokens_in = Column(Integer, default=0)
    tokens_out = Column(Integer, default=0)
    cost_in_cents = Column(Integer, default=0)
    cost_out_cents = Column(Integer, default=0)
    latency_ms = Column(Integer)
    redaction_map = Column(JSONB, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    thread = relationship("Thread", back_populates="messages")
    
    def __repr__(self):
        return f"<Message(role='{self.role}', thread_id='{self.thread_id}')>"
