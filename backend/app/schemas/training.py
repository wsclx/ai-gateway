from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID


class TrainingJobBase(BaseModel):
    name: str = Field(..., description="Name of the training job")
    description: Optional[str] = Field(None, description="Job description")
    base_model: str = Field(..., description="Base model for training")
    training_type: str = Field(
        default="finetuning", 
        description="Type of training"
    )
    learning_rate: float = Field(
        default=0.0001, 
        description="Learning rate for training"
    )
    epochs: int = Field(default=3, description="Number of training epochs")
    batch_size: int = Field(default=16, description="Training batch size")


class TrainingJobCreate(TrainingJobBase):
    pass


class TrainingJobUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    progress: Optional[float] = None
    current_epoch: Optional[int] = None


class TrainingJobResponse(TrainingJobBase):
    id: UUID
    status: str
    progress: float
    current_epoch: int
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    estimated_duration: Optional[int] = None
    actual_duration: Optional[int] = None
    openai_job_id: Optional[str] = None
    openai_model_id: Optional[str] = None
    training_data_size: Optional[int] = None
    validation_data_size: Optional[int] = None
    accuracy: Optional[float] = None
    loss: Optional[float] = None
    validation_loss: Optional[float] = None
    assistant_id: Optional[UUID] = None
    config: Dict[str, Any] = Field(default_factory=dict)
    logs: List[Dict[str, Any]] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TrainingDatasetBase(BaseModel):
    name: str = Field(..., description="Name of the dataset")
    description: Optional[str] = Field(None, description="Dataset description")
    dataset_type: str = Field(
        default="conversations", 
        description="Type of dataset"
    )
    validation_split: float = Field(
        default=0.2, 
        description="Validation split ratio"
    )
    tags: List[str] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class TrainingDatasetCreate(TrainingDatasetBase):
    pass


class TrainingDatasetUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = None
    metadata_json: Optional[Dict[str, Any]] = None


class TrainingDatasetResponse(TrainingDatasetBase):
    id: UUID
    format: str
    total_examples: int
    total_tokens: int
    is_validated: bool
    file_path: Optional[str] = None
    file_size: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TrainingJobStatus(BaseModel):
    id: UUID
    status: str
    progress: float
    current_epoch: int
    estimated_duration: Optional[int] = None
    actual_duration: Optional[int] = None
    accuracy: Optional[float] = None
    loss: Optional[float] = None
    validation_loss: Optional[float] = None
    logs: List[Dict[str, Any]] = Field(default_factory=list)


class TrainingMetrics(BaseModel):
    total_jobs: int
    active_jobs: int
    completed_jobs: int
    failed_jobs: int
    average_accuracy: Optional[float] = None
    average_training_time: Optional[float] = None
    total_training_cost: Optional[float] = None
