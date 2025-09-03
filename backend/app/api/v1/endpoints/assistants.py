from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timedelta

from app.core.database import get_db
from app.models.assistant import Assistant
from app.models.chat import Thread
from app.schemas.assistant import AssistantResponse, AssistantCreate, AssistantUpdate

router = APIRouter()


@router.get("/", response_model=List[AssistantResponse])
async def get_assistants(
    db: AsyncSession = Depends(get_db)
):
    """Get all assistants with usage statistics"""
    try:
        # Get all assistants
        assistants_result = await db.execute(select(Assistant))
        assistants = assistants_result.scalars().all()
        
        # Get usage statistics for each assistant
        assistants_with_stats = []
        for assistant in assistants:
            # Count threads for this assistant
            thread_count_result = await db.execute(
                select(func.count(Thread.id)).where(Thread.assistant_id == assistant.id)
            )
            thread_count = thread_count_result.scalar_one() or 0
            
            # Get active users (unique users in last 7 days)
            active_users_result = await db.execute(
                select(func.count(Thread.user_id.distinct())).where(
                    Thread.assistant_id == assistant.id,
                    Thread.created_at >= datetime.now() - timedelta(days=7)
                )
            )
            active_users = active_users_result.scalar_one() or 0
            
            assistants_with_stats.append(
                AssistantResponse(
                    id=str(assistant.id),
                    name=assistant.name,
                    description=assistant.description,
                    instructions=assistant.instructions,
                    model=assistant.model,
                    status=assistant.status,
                    created_at=assistant.created_at,
                    updated_at=assistant.updated_at,
                    usage_stats={
                        "total_threads": thread_count,
                        "active_users": active_users,
                        "last_used": assistant.updated_at.isoformat() if assistant.updated_at else None
                    }
                )
            )
        
        return assistants_with_stats
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch assistants: {str(e)}"
        )


# Handle no-trailing-slash to avoid 307 redirects that break proxies
@router.get("", response_model=List[AssistantResponse])
async def get_assistants_no_slash(db: AsyncSession = Depends(get_db)):
    return await get_assistants(db)


@router.get("/{assistant_id}", response_model=AssistantResponse)
async def get_assistant(
    assistant_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get a specific assistant by ID"""
    try:
        assistant_result = await db.execute(
            select(Assistant).where(Assistant.id == assistant_id)
        )
        assistant = assistant_result.scalar_one_or_none()
        
        if not assistant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assistant not found"
            )
        
        # Get usage statistics
        thread_count_result = await db.execute(
            select(func.count(Thread.id)).where(Thread.assistant_id == assistant.id)
        )
        thread_count = thread_count_result.scalar_one() or 0
        
        active_users_result = await db.execute(
            select(func.count(Thread.user_id.distinct())).where(
                Thread.assistant_id == assistant.id,
                Thread.created_at >= datetime.now() - timedelta(days=7)
            )
        )
        active_users = active_users_result.scalar_one() or 0
        
        return AssistantResponse(
            id=str(assistant.id),
            name=assistant.name,
            description=assistant.description,
            instructions=assistant.instructions,
            model=assistant.model,
            status=assistant.status,
            created_at=assistant.created_at,
            updated_at=assistant.updated_at,
            usage_stats={
                "total_threads": thread_count,
                "active_users": active_users,
                "last_used": assistant.updated_at.isoformat() if assistant.updated_at else None
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch assistant: {str(e)}"
        )


@router.post("/", response_model=AssistantResponse)
async def create_assistant(
    assistant_data: AssistantCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new assistant"""
    try:
        assistant = Assistant(
            name=assistant_data.name,
            description=assistant_data.description,
            instructions=assistant_data.instructions,
            provider=assistant_data.provider or "openai",
            model=assistant_data.model,
            system_prompt=assistant_data.system_prompt or "Du bist ein hilfreicher KI-Assistent.",
            status=assistant_data.status,
            visibility="internal",
            dept_scope=[],
            tools=[],
        )

        db.add(assistant)
        await db.commit()
        await db.refresh(assistant)

        return AssistantResponse(
            id=str(assistant.id),
            name=assistant.name,
            description=assistant.description,
            instructions=assistant.instructions,
            model=assistant.model,
            status=assistant.status,
            created_at=assistant.created_at,
            updated_at=assistant.updated_at,
            usage_stats={
                "total_threads": 0,
                "active_users": 0,
                "last_used": None
            }
        )

    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create assistant: {str(e)}"
        )


@router.post("", response_model=AssistantResponse)
async def create_assistant_no_slash(
    assistant_data: AssistantCreate,
    db: AsyncSession = Depends(get_db)
):
    return await create_assistant(assistant_data, db)


@router.put("/{assistant_id}", response_model=AssistantResponse)
async def update_assistant(
    assistant_id: str,
    assistant_data: AssistantUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update an existing assistant"""
    try:
        assistant_result = await db.execute(
            select(Assistant).where(Assistant.id == assistant_id)
        )
        assistant = assistant_result.scalar_one_or_none()
        
        if not assistant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assistant not found"
            )
        
        # Update fields
        if assistant_data.name is not None:
            assistant.name = assistant_data.name
        if assistant_data.description is not None:
            assistant.description = assistant_data.description
        if assistant_data.instructions is not None:
            assistant.instructions = assistant_data.instructions
        if assistant_data.model is not None:
            assistant.model = assistant_data.model
        if assistant_data.status is not None:
            assistant.status = assistant_data.status
        
        assistant.updated_at = datetime.now()
        
        await db.commit()
        await db.refresh(assistant)
        
        # Get updated usage stats
        thread_count_result = await db.execute(
            select(func.count(Thread.id)).where(Thread.assistant_id == assistant.id)
        )
        thread_count = thread_count_result.scalar_one() or 0
        
        active_users_result = await db.execute(
            select(func.count(Thread.user_id.distinct())).where(
                Thread.assistant_id == assistant.id,
                Thread.created_at >= datetime.now() - timedelta(days=7)
            )
        )
        active_users = active_users_result.scalar_one() or 0
        
        return AssistantResponse(
            id=str(assistant.id),
            name=assistant.name,
            description=assistant.description,
            instructions=assistant.instructions,
            model=assistant.model,
            status=assistant.status,
            created_at=assistant.created_at,
            updated_at=assistant.updated_at,
            usage_stats={
                "total_threads": thread_count,
                "active_users": active_users,
                "last_used": assistant.updated_at.isoformat() if assistant.updated_at else None
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update assistant: {str(e)}"
        )


@router.delete("/{assistant_id}")
async def delete_assistant(
    assistant_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Delete an assistant"""
    try:
        assistant_result = await db.execute(
            select(Assistant).where(Assistant.id == assistant_id)
        )
        assistant = assistant_result.scalar_one_or_none()
        
        if not assistant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assistant not found"
            )
        
        await db.delete(assistant)
        await db.commit()
        
        return {"message": "Assistant deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete assistant: {str(e)}"
        )
