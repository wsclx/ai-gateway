from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from sqlalchemy import select
import logging

from app.core.database import get_db
from app.models.assistant import Assistant
from app.schemas.assistant import (
    AssistantCreate,
    AssistantUpdate,
    AssistantResponse,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/openai", tags=["openai"])


@router.get("/health")
async def openai_health():
    """Health check for OpenAI connectivity"""
    try:
        # Simple health check - could be extended to test actual API calls
        return {"ok": True, "message": "OpenAI endpoints available"}
    except Exception as e:
        logger.error(f"OpenAI health check failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/assistants", response_model=AssistantResponse)
async def create_assistant(
    assistant_data: AssistantCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new assistant (local DB only)"""
    try:
        # Store in database (no remote OpenAI calls)
        db_assistant = Assistant(
            name=assistant_data.name,
            description=assistant_data.description,
            instructions=assistant_data.instructions,
            provider="openai",
            provider_assistant_id=None,  # No remote assistant
            model=assistant_data.model,
            department_id=assistant_data.department_id,
        )
        
        db.add(db_assistant)
        await db.commit()
        await db.refresh(db_assistant)
        
        logger.info(f"Created local assistant: {db_assistant.name}")
        
        return AssistantResponse(
            id=str(db_assistant.id),
            name=db_assistant.name,
            description=db_assistant.description,
            instructions=db_assistant.instructions,
            openai_id=None,  # No remote ID
            model=db_assistant.model,
            department_id=(
                str(db_assistant.department_id) if db_assistant.department_id else None
            ),
            created_at=db_assistant.created_at,
        )
        
    except Exception as e:
        logger.error(f"Failed to create assistant: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create assistant: {str(e)}",
        )


@router.get("/assistants", response_model=List[AssistantResponse])
async def list_assistants(
    db: AsyncSession = Depends(get_db),
    department_id: Optional[str] = None,
):
    """List all assistants, optionally filtered by department"""
    try:
        query = select(Assistant)
        if department_id:
            query = query.where(Assistant.department_id == department_id)
        
        result = await db.execute(query)
        assistants = result.scalars().all()
        
        return [
            AssistantResponse(
                id=str(assistant.id),
                name=assistant.name,
                description=assistant.description,
                instructions=assistant.instructions,
                openai_id=assistant.provider_assistant_id,
                model=assistant.model,
                department_id=(
                    str(assistant.department_id) if assistant.department_id else None
                ),
                created_at=assistant.created_at,
            )
            for assistant in assistants
        ]
        
    except Exception as e:
        logger.error(f"Failed to list assistants: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list assistants: {str(e)}",
        )


@router.get("/assistants/{assistant_id}", response_model=AssistantResponse)
async def get_assistant(
    assistant_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get a specific assistant by ID"""
    try:
        result = await db.execute(
            select(Assistant).where(Assistant.id == assistant_id)
        )
        assistant = result.scalar_one_or_none()
        
        if not assistant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assistant not found",
            )
        
        return AssistantResponse(
            id=str(assistant.id),
            name=assistant.name,
            description=assistant.description,
            instructions=assistant.instructions,
            openai_id=assistant.provider_assistant_id,
            model=assistant.model,
            department_id=(
                str(assistant.department_id) if assistant.department_id else None
            ),
            created_at=assistant.created_at,
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get assistant: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get assistant: {str(e)}",
        )


@router.put("/assistants/{assistant_id}", response_model=AssistantResponse)
async def update_assistant(
    assistant_id: str,
    assistant_data: AssistantUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update an existing assistant (local DB only)"""
    try:
        result = await db.execute(
            select(Assistant).where(Assistant.id == assistant_id)
        )
        assistant = result.scalar_one_or_none()
        
        if not assistant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assistant not found",
            )
        
        # Update database only (no remote OpenAI calls)
        if assistant_data.name:
            assistant.name = assistant_data.name
        if assistant_data.description:
            assistant.description = assistant_data.description
        if assistant_data.instructions:
            assistant.instructions = assistant_data.instructions
        if assistant_data.department_id:
            assistant.department_id = assistant_data.department_id
        
        await db.commit()
        await db.refresh(assistant)
        
        return AssistantResponse(
            id=str(assistant.id),
            name=assistant.name,
            description=assistant.description,
            instructions=assistant.instructions,
            openai_id=assistant.provider_assistant_id,
            model=assistant.model,
            department_id=(
                str(assistant.department_id) if assistant.department_id else None
            ),
            created_at=assistant.created_at,
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update assistant: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update assistant: {str(e)}",
        )


@router.delete("/assistants/{assistant_id}")
async def delete_assistant(
    assistant_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Delete an assistant (local DB only)"""
    try:
        result = await db.execute(
            select(Assistant).where(Assistant.id == assistant_id)
        )
        assistant = result.scalar_one_or_none()
        
        if not assistant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assistant not found",
            )
        
        # Delete from database only (no remote OpenAI calls)
        await db.delete(assistant)
        await db.commit()
        
        return {"message": "Assistant deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete assistant: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete assistant: {str(e)}",
        )
