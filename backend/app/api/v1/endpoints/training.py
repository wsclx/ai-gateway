from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import logging

from app.core.database import get_db
from app.core.authz import get_current_user
from app.models.user import User
from app.models.training import TrainingDocument, DocumentChunk, FineTuningJob
from app.schemas.training import (
    DocumentUpload, TrainingDocumentResponse, DocumentChunkResponse,
    FineTuneRequest, FineTuningJobResponse, TrainingStatsResponse,
    ContextRequest, ContextResponse
)
from app.core.training.context_manager import ContextManager

logger = logging.getLogger(__name__)
router = APIRouter()
context_manager = ContextManager()


@router.post("/documents", response_model=List[TrainingDocumentResponse])
async def upload_training_documents(
    documents: List[UploadFile] = File(...),
    assistant_id: str = Form(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload training documents for an assistant"""
    
    try:
        # Convert UploadFile to DocumentUpload
        doc_uploads = []
        for doc in documents:
            content = await doc.read()
            doc_upload = DocumentUpload(
                filename=doc.filename,
                content_type=doc.content_type or "application/octet-stream",
                file_size=len(content),
                content=content
            )
            doc_uploads.append(doc_upload)
        
        # Process documents
        results = await context_manager.add_training_data(
            db=db,
            assistant_id=assistant_id,
            documents=doc_uploads
        )
        
        return results
        
    except Exception as e:
        logger.error(f"Failed to upload documents: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload documents: {str(e)}"
        )


@router.get("/documents/{assistant_id}", response_model=List[TrainingDocumentResponse])
async def get_training_documents(
    assistant_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all training documents for an assistant"""
    
    query = select(TrainingDocument).where(
        TrainingDocument.assistant_id == assistant_id
    ).order_by(TrainingDocument.created_at.desc())
    
    result = await db.execute(query)
    documents = result.scalars().all()
    
    return documents


@router.get("/documents/{document_id}/chunks", response_model=List[DocumentChunkResponse])
async def get_document_chunks(
    document_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get chunks for a specific document"""
    
    query = select(DocumentChunk).where(
        DocumentChunk.document_id == document_id
    ).order_by(DocumentChunk.chunk_index)
    
    result = await db.execute(query)
    chunks = result.scalars().all()
    
    return chunks


@router.delete("/documents/{document_id}")
async def delete_training_document(
    document_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a training document and its chunks"""
    
    document = await db.get(TrainingDocument, document_id)
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    await db.delete(document)
    await db.commit()
    
    return {"message": "Document deleted successfully"}


@router.post("/context", response_model=ContextResponse)
async def get_training_context(
    request: ContextRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get relevant context for a query from training data"""
    
    try:
        context = await context_manager.get_relevant_context(
            db=db,
            assistant_id=str(request.assistant_id),
            query=request.query,
            max_tokens=request.max_tokens
        )
        
        # Count sources (documents that contributed to context)
        sources_query = select(DocumentChunk.document_id).where(
            DocumentChunk.content.in_(context.split('\n\n'))
        ).distinct()
        
        result = await db.execute(sources_query)
        sources = len(result.scalars().all())
        
        return ContextResponse(
            context=context,
            sources=sources,
            total_tokens=len(context.split())
        )
        
    except Exception as e:
        logger.error(f"Failed to get context: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get context: {str(e)}"
        )


@router.get("/stats/{assistant_id}", response_model=TrainingStatsResponse)
async def get_training_stats(
    assistant_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get training statistics for an assistant"""
    
    stats = await context_manager.get_training_stats(db, assistant_id)
    return TrainingStatsResponse(**stats)


@router.post("/fine-tune", response_model=FineTuningJobResponse)
async def start_fine_tuning(
    request: FineTuneRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Start fine-tuning job (placeholder for future implementation)"""
    
    # Create fine-tuning job record
    job = FineTuningJob(
        assistant_id=str(request.assistant_id),
        base_model=request.base_model,
        status="pending"
    )
    db.add(job)
    await db.commit()
    await db.refresh(job)
    
    # TODO: Implement actual fine-tuning logic
    logger.info(f"Fine-tuning job {job.id} created for assistant {request.assistant_id}")
    
    return job


@router.get("/fine-tune/{job_id}", response_model=FineTuningJobResponse)
async def get_fine_tuning_job(
    job_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get fine-tuning job status"""
    
    job = await db.get(FineTuningJob, job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fine-tuning job not found"
        )
    
    return job


@router.get("/fine-tune/assistant/{assistant_id}", response_model=List[FineTuningJobResponse])
async def get_assistant_fine_tuning_jobs(
    assistant_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all fine-tuning jobs for an assistant"""
    
    query = select(FineTuningJob).where(
        FineTuningJob.assistant_id == assistant_id
    ).order_by(FineTuningJob.created_at.desc())
    
    result = await db.execute(query)
    jobs = result.scalars().all()
    
    return jobs
