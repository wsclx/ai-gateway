from sqlalchemy import Column, String, DateTime, Text, Integer, Float, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.core.database import Base


class TrainingDocument(Base):
    __tablename__ = "training_documents"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    assistant_id = Column(UUID(as_uuid=True), ForeignKey("assistants.id"), nullable=False)
    filename = Column(String(255), nullable=False)
    content_type = Column(String(100))
    size = Column(Integer)  # in bytes
    chunk_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    processed = Column(Boolean, default=False)
    
    # Relationships
    assistant = relationship("Assistant", back_populates="training_documents")
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<TrainingDocument(filename='{self.filename}', assistant_id='{self.assistant_id}')>"


class DocumentChunk(Base):
    __tablename__ = "document_chunks"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey("training_documents.id"), nullable=False)
    content = Column(Text, nullable=False)
    # embedding = Column(Vector(384))  # Temporarily disabled - needs pgvector
    embedding_json = Column(JSONB)  # Store embedding as JSON temporarily
    chunk_index = Column(Integer, nullable=False)
    chunk_metadata = Column(JSONB, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    document = relationship("TrainingDocument", back_populates="chunks")
    
    def __repr__(self):
        return f"<DocumentChunk(document_id='{self.document_id}', index={self.chunk_index})>"


class TrainingJob(Base):
    __tablename__ = "training_jobs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    
    # Training Configuration
    base_model = Column(String(50), nullable=False)  # gpt-4o-mini, gpt-4o
    training_type = Column(String(30), nullable=False, default="finetuning")
    learning_rate = Column(Float, default=0.0001)
    epochs = Column(Integer, default=3)
    batch_size = Column(Integer, default=16)
    
    # Status and Progress
    status = Column(String(20), nullable=False, default="pending")
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
    assistant_id = Column(UUID(as_uuid=True), ForeignKey("assistants.id"))  # Link to assistant
    assistant = relationship("Assistant", back_populates="training_jobs")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        return f"<TrainingJob(name='{self.name}', status='{self.status}', progress={self.progress:.1%})>"


class TrainingDataset(Base):
    __tablename__ = "training_datasets"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    
    # Dataset Type
    dataset_type = Column(String(30), nullable=False, default="conversations")
    
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
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        return f"<TrainingDataset(name='{self.name}', type='{self.dataset_type}', examples={self.total_examples})>"
