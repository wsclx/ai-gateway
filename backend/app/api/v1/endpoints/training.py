from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
import logging
import os
import tempfile
import shutil

from app.core.database import get_db
from app.core.authz import require_role
from app.core.openai_client import openai_client
from app.models.training import TrainingJob, TrainingDataset
from app.schemas.training import (
    TrainingJobCreate, TrainingJobUpdate, TrainingJobResponse,
    TrainingDatasetCreate, TrainingDatasetResponse,
    TrainingMetrics
)

logger = logging.getLogger(__name__)
router = APIRouter()


# Training Jobs
@router.post("/jobs", response_model=TrainingJobResponse)
async def create_training_job(
    job_data: TrainingJobCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_role("admin"))
):
    """Create a new training job"""
    try:
        job = TrainingJob(
            name=job_data.name,
            description=job_data.description,
            base_model=job_data.base_model,
            training_type=job_data.training_type,
            learning_rate=job_data.learning_rate,
            epochs=job_data.epochs,
            batch_size=job_data.batch_size,
            status="pending"
        )
        
        db.add(job)
        await db.commit()
        await db.refresh(job)
        
        logger.info(f"Created training job: {job.id}")
        return job
        
    except Exception as e:
        await db.rollback()
        logger.error(f"Failed to create training job: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create training job: {str(e)}"
        )


@router.get("/jobs", response_model=List[TrainingJobResponse])
async def list_training_jobs(
    limit: int = 20,
    offset: int = 0,
    status_filter: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_role("admin"))
):
    """List training jobs with optional filtering"""
    try:
        query = select(TrainingJob)
        
        if status_filter:
            query = query.where(TrainingJob.status == status_filter)
            
        query = query.offset(offset).limit(limit)
        
        result = await db.execute(query)
        jobs = result.scalars().all()
        
        return jobs
        
    except Exception as e:
        logger.error(f"Failed to list training jobs: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list training jobs: {str(e)}"
        )


@router.get("/jobs/{job_id}", response_model=TrainingJobResponse)
async def get_training_job(
    job_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_role("admin"))
):
    """Get training job details"""
    try:
        result = await db.execute(
            select(TrainingJob).where(TrainingJob.id == job_id)
        )
        job = result.scalar_one_or_none()
        
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Training job not found"
            )
            
        return job
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get training job {job_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get training job: {str(e)}"
        )


@router.put("/jobs/{job_id}", response_model=TrainingJobResponse)
async def update_training_job(
    job_id: str,
    job_update: TrainingJobUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_role("admin"))
):
    """Update training job"""
    try:
        result = await db.execute(
            select(TrainingJob).where(TrainingJob.id == job_id)
        )
        job = result.scalar_one_or_none()
        
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Training job not found"
            )
        
        update_data = job_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(job, field, value)
        
        await db.commit()
        await db.refresh(job)
        
        logger.info(f"Updated training job: {job_id}")
        return job
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Failed to update training job {job_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update training job: {str(e)}"
        )


@router.delete("/jobs/{job_id}")
async def delete_training_job(
    job_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_role("admin"))
):
    """Delete training job"""
    try:
        result = await db.execute(
            select(TrainingJob).where(TrainingJob.id == job_id)
        )
        job = result.scalar_one_or_none()
        
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Training job not found"
            )
        
        if job.openai_job_id:
            try:
                await openai_client.cancel_finetuning_job(job.openai_job_id)
                logger.info(f"Cancelled OpenAI job: {job.openai_job_id}")
            except Exception as e:
                logger.warning(f"Failed to cancel OpenAI job: {e}")
        
        await db.delete(job)
        await db.commit()
        
        logger.info(f"Deleted training job: {job_id}")
        return {"message": "Training job deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Failed to delete training job {job_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete training job: {str(e)}"
        )


@router.post("/jobs/{job_id}/start")
async def start_training_job(
    job_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_role("admin"))
):
    """Start a training job"""
    try:
        result = await db.execute(
            select(TrainingJob).where(TrainingJob.id == job_id)
        )
        job = result.scalar_one_or_none()
        
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Training job not found"
            )
        
        if job.status not in ["pending", "paused"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot start job with status: {job.status}"
            )
        
        job.status = "queued"
        await db.commit()
        
        logger.info(f"Started training job: {job_id}")
        return {"message": "Training job started successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Failed to start training job {job_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to start training job: {str(e)}"
        )


@router.post("/jobs/{job_id}/pause")
async def pause_training_job(
    job_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_role("admin"))
):
    """Pause a training job"""
    try:
        result = await db.execute(
            select(TrainingJob).where(TrainingJob.id == job_id)
        )
        job = result.scalar_one_or_none()
        
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Training job not found"
            )
        
        if job.status not in ["training", "queued"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot pause job with status: {job.status}"
            )
        
        job.status = "paused"
        await db.commit()
        
        logger.info(f"Paused training job: {job_id}")
        return {"message": "Training job paused successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Failed to pause training job {job_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to pause training job: {str(e)}"
        )


# Training Datasets
@router.post("/datasets", response_model=TrainingDatasetResponse)
async def create_training_dataset(
    dataset_data: TrainingDatasetCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_role("admin"))
):
    """Create a new training dataset"""
    try:
        dataset = TrainingDataset(
            name=dataset_data.name,
            description=dataset_data.description,
            dataset_type=dataset_data.dataset_type,
            validation_split=dataset_data.validation_split,
            tags=dataset_data.tags,
            metadata=dataset_data.metadata,
            data=[],
            total_examples=0,
            total_tokens=0
        )
        
        db.add(dataset)
        await db.commit()
        await db.refresh(dataset)
        
        logger.info(f"Created training dataset: {dataset.id}")
        return dataset
        
    except Exception as e:
        await db.rollback()
        logger.error(f"Failed to create training dataset: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create training dataset: {str(e)}"
        )


@router.post("/datasets/{dataset_id}/upload")
async def upload_dataset_file(
    dataset_id: str,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_role("admin"))
):
    """Upload a file for training dataset"""
    try:
        result = await db.execute(
            select(TrainingDataset).where(TrainingDataset.id == dataset_id)
        )
        dataset = result.scalar_one_or_none()
        
        if not dataset:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Training dataset not found"
            )
        
        temp_dir = tempfile.mkdtemp()
        file_path = os.path.join(temp_dir, file.filename)
        
        try:
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            dataset.file_path = file_path
            dataset.file_size = os.path.getsize(file_path)
            dataset.format = (
                file.filename.split('.')[-1] 
                if '.' in file.filename else 'txt'
            )
            
            await db.commit()
            
            logger.info(f"Uploaded file for dataset: {dataset_id}")
            return {"message": "File uploaded successfully"}
            
        finally:
            shutil.rmtree(temp_dir, ignore_errors=True)
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Failed to upload file for dataset {dataset_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload file: {str(e)}"
        )


@router.get("/datasets", response_model=List[TrainingDatasetResponse])
async def list_training_datasets(
    limit: int = 20,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_role("admin"))
):
    """List training datasets"""
    try:
        result = await db.execute(
            select(TrainingDataset)
            .offset(offset)
            .limit(limit)
        )
        datasets = result.scalars().all()
        
        return datasets
        
    except Exception as e:
        logger.error(f"Failed to list training datasets: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list training datasets: {str(e)}"
        )


@router.get("/metrics", response_model=TrainingMetrics)
async def get_training_metrics(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_role("admin"))
):
    """Get training metrics and statistics"""
    try:
        total_jobs = await db.scalar(select(func.count(TrainingJob.id)))
        active_jobs = await db.scalar(
            select(func.count(TrainingJob.id))
            .where(TrainingJob.status.in_(["pending", "queued", "training"]))
        )
        completed_jobs = await db.scalar(
            select(func.count(TrainingJob.id))
            .where(TrainingJob.status == "completed")
        )
        failed_jobs = await db.scalar(
            select(func.count(TrainingJob.id))
            .where(TrainingJob.status == "failed")
        )
        
        avg_accuracy = await db.scalar(
            select(func.avg(TrainingJob.accuracy))
            .where(TrainingJob.accuracy.is_not(None))
        )
        
        avg_training_time = await db.scalar(
            select(func.avg(TrainingJob.actual_duration))
            .where(TrainingJob.actual_duration.is_not(None))
        )
        
        return TrainingMetrics(
            total_jobs=total_jobs or 0,
            active_jobs=active_jobs or 0,
            completed_jobs=completed_jobs or 0,
            failed_jobs=failed_jobs or 0,
            average_accuracy=float(avg_accuracy) if avg_accuracy else None,
            average_training_time=float(avg_training_time) if avg_training_time else None,
            total_training_cost=None
        )
        
    except Exception as e:
        logger.error(f"Failed to get training metrics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get training metrics: {str(e)}"
        )
