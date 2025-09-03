from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import datetime
from uuid import UUID


class DocumentUpload(BaseModel):
    """Schema for uploaded training documents"""
    filename: str = Field(..., description="Original filename")
    content_type: str = Field(..., description="MIME type of the document")
    file_size: int = Field(..., description="File size in bytes")
    content: bytes = Field(..., description="File content")


class ChunkData(BaseModel):
    """Schema for document chunks"""
    chunk_index: int
    content: str
    embedding: List[float]
    metadata: Optional[Dict] = None


class TrainingDocumentResponse(BaseModel):
    """Response schema for training documents"""
    id: UUID
    assistant_id: UUID
    filename: str
    content_type: str
    file_size: int
    status: str
    processed_at: Optional[datetime] = None
    created_at: datetime
    metadata: Optional[Dict] = None
    
    class Config:
        from_attributes = True


class DocumentChunkResponse(BaseModel):
    """Response schema for document chunks"""
    id: UUID
    document_id: UUID
    chunk_index: int
    content: str
    metadata: Optional[Dict] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class FineTuneRequest(BaseModel):
    """Request schema for starting fine-tuning"""
    assistant_id: UUID
    base_model: str = Field(default="llama2-7b", description="Base model for fine-tuning")
    training_type: str = Field(default="chat", description="Type of training data")
    hyperparameters: Optional[Dict] = Field(default=None, description="Training parameters")


class FineTuningJobResponse(BaseModel):
    """Response schema for fine-tuning jobs"""
    id: UUID
    assistant_id: UUID
    base_model: str
    status: str
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    metrics: Optional[Dict] = None
    error_message: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class TrainingStatsResponse(BaseModel):
    """Response schema for training statistics"""
    total_documents: int
    total_chunks: int
    processed_documents: int
    processing_status: str


class ContextRequest(BaseModel):
    """Request schema for getting training context"""
    assistant_id: UUID
    query: str
    max_tokens: int = Field(default=4000, description="Maximum tokens for context")


class ContextResponse(BaseModel):
    """Response schema for training context"""
    context: str
    sources: int
    total_tokens: int
