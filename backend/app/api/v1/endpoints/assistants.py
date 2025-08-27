from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.models.assistant import Assistant as AssistantModel
from app.schemas.assistant import AssistantCreate, AssistantResponse

router = APIRouter()


@router.get("/", response_model=List[AssistantResponse])
async def get_assistants(
    db: AsyncSession = Depends(get_db)
):
    """Get available assistants from DB"""
    try:
        result = await db.execute(
            # select all assistants
            AssistantModel.__table__.select()
        )
        rows = result.fetchall()
        assistants: List[AssistantResponse] = []
        for row in rows:
            # row is Row object; access by column
            created_at = row.created_at if isinstance(row.created_at, datetime) else datetime.utcnow()
            assistants.append(
                AssistantResponse(
                    id=str(row.id),
                    name=row.name,
                    description=None,
                    instructions=getattr(row, "system_prompt", ""),
                    department_id=None,
                    openai_id=getattr(row, "provider_assistant_id", None) or "",
                    model=row.model,
                    created_at=created_at,
                )
            )
        return assistants
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load assistants: {str(e)}")


@router.post("/", response_model=AssistantResponse)
async def create_assistant(
    assistant: AssistantCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create new assistant (admin only)"""
    try:
        # Minimal creation mapping; provider/model/system_prompt required by model
        new_asst = AssistantModel(
            name=assistant.name,
            provider="openai",
            provider_assistant_id="",
            model="gpt-4o-mini",
            system_prompt=assistant.instructions or "",
            dept_scope=[],
            tools=[],
            visibility="internal",
        )
        db.add(new_asst)
        await db.commit()
        await db.refresh(new_asst)
        return AssistantResponse(
            id=str(new_asst.id),
            name=new_asst.name,
            description=assistant.description,
            instructions=new_asst.system_prompt,
            department_id=None,
            openai_id=new_asst.provider_assistant_id or "",
            model=new_asst.model,
            created_at=new_asst.created_at or datetime.utcnow(),
        )
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create assistant: {str(e)}")
