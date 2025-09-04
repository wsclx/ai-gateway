from sqlalchemy import Column, String, DateTime, Text, CheckConstraint, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.core.database import Base


class Assistant(Base):
    __tablename__ = "assistants"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    instructions = Column(Text, nullable=True)
    provider = Column(String(20), nullable=False)
    provider_assistant_id = Column(String(255))
    model = Column(String(50), nullable=False)
    system_prompt = Column(Text, nullable=False)
    status = Column(String(20), nullable=False, default="active")
    dept_scope = Column(JSONB, nullable=False, default=list)
    tools = Column(JSONB, nullable=False, default=list)
    visibility = Column(
        String(20), 
        nullable=False, 
        default="internal"
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    __table_args__ = (
        UniqueConstraint('name', name='uq_assistants_name'),
        CheckConstraint("provider in ('openai','anthropic')", name='ck_assistants_provider'),
        CheckConstraint("visibility in ('internal','public','private')", name='ck_assistants_visibility'),
        CheckConstraint("status in ('active','inactive','maintenance')", name='ck_assistants_status'),
    )
    
    # Relationships
    threads = relationship("Thread", back_populates="assistant")
    training_documents = relationship("TrainingDocument", back_populates="assistant")
    training_jobs = relationship("TrainingJob", back_populates="assistant")
    
    def __repr__(self):
        return f"<Assistant(name='{self.name}', provider='{self.provider}')>"
