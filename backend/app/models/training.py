from sqlalchemy import (
    Column, String, DateTime, Text, Integer, Float, 
    CheckConstraint, Boolean
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
import uuid

from app.core.database import Base


class TrainingJob(Base):
    __tablename__ = "training_jobs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    
    # Training Configuration
    base_model = Column(String(50), nullable=False)  # gpt-4o-mini, gpt-4o
    training_type = Column(
        String(30), 
        nullable=False,
        default="finetuning"
    )
    learning_rate = Column(Float, default=0.0001)
    epochs = Column(Integer, default=3)
    batch_size = Column(Integer, default=16)
    
    # Status and Progress
    status = Column(
        String(20), 
        nullable=False, 
        default="pending"
    )
    progress = Column(Float, default=0.0)  # 0.0 to 1.0
    current_epoch = Column(Integer, default=0)
    
    # Timing
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    estimated_duration = Column(Integer)  # in seconds
    actual_duration = Column(Integer)  # in seconds
    
    # OpenAI Specific
    openai_job_id = Column(String(255))  # OpenAI fine-tuning job ID
    openai_model_id = Column(String(255))  # Resulting fine-tuned model ID
    
    # Training Data
    training_data_size = Column(Integer)  # number of examples
    validation_data_size = Column(Integer)
    
    # Results and Metrics
    accuracy = Column(Float)
    loss = Column(Float)
    validation_loss = Column(Float)
    
    # Metadata
    config = Column(JSONB, default=dict)  # Additional training parameters
    logs = Column(JSONB, default=list)  # Training logs
    
    # Relationships
    assistant_id = Column(UUID(as_uuid=True))  # Link to resulting assistant
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        onupdate=func.now()
    )
    
    __table_args__ = (
        CheckConstraint(
            "training_type in ('finetuning', 'rag', 'custom_instructions')"
        ),
        CheckConstraint(
            "status in ('pending', 'queued', 'training', 'paused', "
            "'completed', 'failed', 'cancelled')"
        ),
        CheckConstraint("progress >= 0.0 and progress <= 1.0"),
        CheckConstraint("learning_rate > 0.0"),
        CheckConstraint("epochs > 0"),
        CheckConstraint("batch_size > 0"),
    )
    
    def __repr__(self):
        return (
            f"<TrainingJob(name='{self.name}', status='{self.status}', "
            f"progress={self.progress:.1%})>"
        )


class TrainingDataset(Base):
    __tablename__ = "training_datasets"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    
    # Dataset Type
    dataset_type = Column(
        String(30), 
        nullable=False,
        default="conversations"
    )
    
    # Content
    data = Column(JSONB, nullable=False)  # The actual training data
    format = Column(String(20), default="jsonl")  # jsonl, csv
    # Statistics
    total_examples = Column(Integer, default=0)
    total_tokens = Column(Integer, default=0)
    
    # Validation
    validation_split = Column(Float, default=0.2)  # 20% for validation
    is_validated = Column(Boolean, default=False)
    
    # File Management
    file_path = Column(String(500))  # Path to uploaded file
    file_size = Column(Integer)  # in bytes
    
    # Metadata
    tags = Column(JSONB, default=list)
    metadata_json = Column(JSONB, default=dict)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        onupdate=func.now()
    )
    
    __table_args__ = (
        CheckConstraint(
            "dataset_type in ('conversations', 'qa_pairs', 'instructions', "
            "'code_examples')"
        ),
        CheckConstraint("validation_split >= 0.0 and validation_split <= 1.0"),
        CheckConstraint("total_examples >= 0"),
        CheckConstraint("total_tokens >= 0"),
    )
    
    def __repr__(self):
        return (
            f"<TrainingDataset(name='{self.name}', "
            f"type='{self.dataset_type}', "
            f"examples={self.total_examples})>"
        )
