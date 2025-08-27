from sqlalchemy import Column, String, DateTime, Text, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.core.database import Base


class Assistant(Base):
    __tablename__ = "assistants"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    provider = Column(
        String(20), 
        nullable=False
    )
    __table_args__ = (
        CheckConstraint("provider in ('openai','anthropic')"),
    )
    provider_assistant_id = Column(String(255))
    model = Column(String(50), nullable=False)
    system_prompt = Column(Text, nullable=False)
    dept_scope = Column(JSONB, nullable=False, default=list)
    tools = Column(JSONB, nullable=False, default=list)
    visibility = Column(
        String(20), 
        nullable=False, 
        default="internal"
    )
    __table_args__ = (
        CheckConstraint("provider in ('openai','anthropic')"),
        CheckConstraint("visibility in ('internal','public','private')"),
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    threads = relationship("Thread", back_populates="assistant")
    
    def __repr__(self):
        return f"<Assistant(name='{self.name}', provider='{self.provider}')>"
