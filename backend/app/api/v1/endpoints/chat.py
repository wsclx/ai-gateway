from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from hashlib import sha256
import logging

from app.core.database import get_db
from app.models.chat import Thread, Message
from app.models.assistant import Assistant
from app.models.user import User
from app.schemas.chat import (
    ThreadCreate,
    ThreadResponse,
    MessageCreate,
    MessageResponse,
    ThreadListResponse,
)
from app.core.openai_client import openai_client

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/threads", response_model=ThreadResponse)
async def create_thread(
    thread_data: ThreadCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new chat thread with optional OpenAI conversation"""
    try:
        # Verify assistant exists
        asst_row = await db.execute(
            select(Assistant).where(Assistant.id == thread_data.assistant_id)
        )
        assistant = asst_row.scalar_one_or_none()
        if not assistant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Assistant not found"
            )

        # Pick a user (local test): first user in DB
        urow = await db.execute(select(User).order_by(User.created_at.asc()))
        user = urow.scalars().first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="No user available"
            )

        # Create OpenAI conversation if enabled
        conversation_id = None
        if assistant.model and assistant.model.startswith("gpt"):
            try:
                # Create conversation with title
                title = thread_data.title or f"Chat mit {assistant.name}"
                conv_result = await openai_client.create_conversation(
                    title=title
                )
                conversation_id = conv_result.get("id")
                logger.info(f"Created OpenAI conversation: {conversation_id}")
            except Exception as e:
                logger.warning(
                    f"Failed to create OpenAI conversation: {e}"
                )
                # Continue without conversation (fallback to thread-only)

        # Create thread (DB schema has no title/updated_at)
        thread = Thread(
            assistant_id=thread_data.assistant_id,
            user_id=user.id,
            status="open",
        )
        db.add(thread)
        await db.commit()
        await db.refresh(thread)

        # Store conversation_id in thread metadata if available
        if conversation_id:
            # Note: This would require adding a metadata field to Thread model
            # For now, we'll store it in the response
            pass

        # Compute derived fields
        title = thread_data.title or f"Chat mit {assistant.name}"
        created_at = (
            thread.created_at.isoformat()
            if thread.created_at
            else datetime.now().isoformat()
        )
        updated_at = created_at

        return ThreadResponse(
            id=str(thread.id),
            title=title,
            assistant_id=str(thread.assistant_id),
            created_at=created_at,
            updated_at=updated_at,
            message_count=0,
            conversation_id=conversation_id,  # Add this field to schema
        )
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create thread: {str(e)}",
        )


@router.get("/threads", response_model=List[ThreadListResponse])
async def get_threads(
    db: AsyncSession = Depends(get_db),
):
    """Get all chat threads from DB with message counts and derived title/updated_at"""
    try:
        # Join threads with messages for counts and updated_at
        result = await db.execute(
            select(
                Thread.id,
                Thread.assistant_id,
                func.max(Message.created_at).label("updated_at"),
                func.count(Message.id).label("message_count"),
                Thread.created_at,
            )
            .select_from(Thread)
            .outerjoin(Message, Thread.id == Message.thread_id)
            .group_by(Thread.id)
            .order_by(func.max(Message.created_at).desc())
        )
        rows = result.all()

        # Fetch assistant names to build titles
        asst_ids = [r.assistant_id for r in rows]
        names_map = {}
        if asst_ids:
            asst_rows = await db.execute(
                select(Assistant.id, Assistant.name).where(
                    Assistant.id.in_(asst_ids)
                )
            )
            names_map = {row.id: row.name for row in asst_rows}

        threads: List[ThreadListResponse] = []
        for r in rows:
            asst_name = names_map.get(r.assistant_id, "Assistant")
            title = f"Chat mit {asst_name}"
            created = (
                r.created_at.isoformat()
                if r.created_at
                else datetime.now().isoformat()
            )
            updated = r.updated_at.isoformat() if r.updated_at else created
            threads.append(
                ThreadListResponse(
                    id=str(r.id),
                    title=title,
                    assistant_id=str(r.assistant_id),
                    created_at=created,
                    updated_at=updated,
                    message_count=int(r.message_count or 0),
                )
            )
        return threads
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get threads: {str(e)}",
        )


@router.get("/threads/{thread_id}/messages", response_model=List[MessageResponse])
async def get_thread_messages(
    thread_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get all messages in a thread"""
    try:
        thr_row = await db.execute(select(Thread).where(Thread.id == thread_id))
        thread = thr_row.scalar_one_or_none()
        if not thread:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Thread not found"
            )

        result = await db.execute(
            select(Message)
            .where(Message.thread_id == thread_id)
            .order_by(Message.created_at.asc())
        )
        messages: List[MessageResponse] = []
        for row in result.scalars():
            # Decode plaintext from stored bytes; if None, show empty
            content_bytes = row.content_ciphertext or b""
            content_text = content_bytes.decode("utf-8", errors="replace")
            messages.append(
                MessageResponse(
                    id=str(row.id),
                    role=row.role,
                    content=content_text,
                    timestamp=(
                        row.created_at.isoformat()
                        if row.created_at
                        else datetime.now().isoformat()
                    ),
                    assistant_id=str(thread.assistant_id) if thread.assistant_id else None,
                    thread_id=str(thread.id),
                )
            )
        return messages
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get messages: {str(e)}",
        )


@router.post("/threads/{thread_id}/messages", response_model=MessageResponse)
async def send_message(
    thread_id: str,
    message_data: MessageCreate,
    db: AsyncSession = Depends(get_db),
):
    """Persist user message, call OpenAI for a real response, persist and return it"""
    try:
        thr_row = await db.execute(select(Thread).where(Thread.id == thread_id))
        thread = thr_row.scalar_one_or_none()
        if not thread:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Thread not found"
            )

        asst_row = await db.execute(
            select(Assistant).where(Assistant.id == message_data.assistant_id)
        )
        assistant = asst_row.scalar_one_or_none()
        if not assistant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Assistant not found"
            )

        # Save user message
        user_bytes = (message_data.content or "").encode("utf-8")
        user_msg = Message(
            role="user",
            content_ciphertext=user_bytes,
            content_sha256=sha256(user_bytes).hexdigest(),
            thread_id=thread.id,
            tokens_in=0,
            tokens_out=0,
            cost_in_cents=0,
            cost_out_cents=0,
            latency_ms=None,
            redaction_map={},
        )
        db.add(user_msg)
        await db.commit()
        await db.refresh(user_msg)

        # Build chat history for OpenAI (kept for future use)
        history_rows = await db.execute(
            select(Message)
            .where(Message.thread_id == thread.id)
            .order_by(Message.created_at.asc())
        )
        if assistant.system_prompt:
            _ = [m for m in history_rows.scalars()]
            # We send only the latest user input to Responses, see below.

        # OpenAI Responses API (with fallback in client)
        try:
            instruction_text = assistant.system_prompt or None
            user_input = (message_data.content or "").strip()
            result = await openai_client.responses_create(
                input_text=user_input,
                model=assistant.model or "gpt-4o-mini",
                conversation_id=None,
                instructions=instruction_text,
            )
            ai_text = result.get("text", "")
        except Exception as e:
            raise HTTPException(
                status_code=502, detail=f"OpenAI request failed: {str(e)}"
            )

        # Save assistant message
        ai_bytes = ai_text.encode("utf-8")
        ai_msg = Message(
            role="assistant",
            content_ciphertext=ai_bytes,
            content_sha256=sha256(ai_bytes).hexdigest(),
            thread_id=thread.id,
            tokens_in=0,
            tokens_out=0,
            cost_in_cents=0,
            cost_out_cents=0,
            latency_ms=None,
            redaction_map={},
        )
        db.add(ai_msg)
        await db.commit()
        await db.refresh(ai_msg)

        return MessageResponse(
            id=str(ai_msg.id),
            role=ai_msg.role,
            content=ai_text,
            timestamp=(
                ai_msg.created_at.isoformat()
                if ai_msg.created_at
                else datetime.now().isoformat()
            ),
            assistant_id=str(thread.assistant_id) if thread.assistant_id else None,
            thread_id=str(thread.id),
        )
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send message: {str(e)}",
        )


@router.delete("/threads/{thread_id}")
async def delete_thread(
    thread_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Delete a chat thread and all its messages"""
    try:
        thr_row = await db.execute(select(Thread).where(Thread.id == thread_id))
        thread = thr_row.scalar_one_or_none()
        if not thread:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Thread not found"
            )

        await db.execute(select(Message).where(Message.thread_id == thread_id))
        # Delete messages
        await db.execute(
            Message.__table__.delete().where(Message.thread_id == thread_id)
        )
        # Delete thread
        await db.execute(Thread.__table__.delete().where(Thread.id == thread_id))
        await db.commit()
        return {"message": "Thread deleted successfully"}
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete thread: {str(e)}",
        )
