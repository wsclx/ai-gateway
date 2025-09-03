from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.models.ticket import (
    Ticket, TicketComment, TicketAttachment, TicketAuditLog
)
from app.schemas.ticket import (
    TicketCreate, TicketUpdate, TicketResponse, TicketCommentCreate,
    TicketCommentResponse, TicketWithDetails, TicketStats
)
from app.models.user import User
import uuid

router = APIRouter()


@router.post("/", response_model=TicketResponse)
async def create_ticket(
    ticket: TicketCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new ticket"""
    # Verify user exists
    result = await db.execute(select(User).where(User.id == ticket.user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    db_ticket = Ticket(
        id=uuid.uuid4(),
        user_id=ticket.user_id,
        thread_id=ticket.thread_id,
        external_id=ticket.external_id,
        external_system=ticket.external_system,
        status=ticket.status,
        priority=ticket.priority
    )
    
    db.add(db_ticket)
    await db.commit()
    await db.refresh(db_ticket)
    
    # Create audit log
    audit_log = TicketAuditLog(
        id=uuid.uuid4(),
        ticket_id=db_ticket.id,
        user_id=ticket.user_id,
        action="ticket_created",
        details=f"Ticket created with status: {ticket.status}"
    )
    db.add(audit_log)
    await db.commit()
    
    return db_ticket


@router.get("", response_model=List[TicketResponse])
async def get_tickets(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    """Get all tickets with pagination"""
    result = await db.execute(
        select(Ticket).offset(skip).limit(limit)
    )
    tickets = result.scalars().all()
    return tickets


@router.get("/stats", response_model=TicketStats)
async def get_ticket_stats(db: AsyncSession = Depends(get_db)):
    """Get ticket statistics"""
    result = await db.execute(select(func.count(Ticket.id)))
    total_tickets = result.scalar()
    
    # Count by status
    result = await db.execute(
        select(func.count(Ticket.id)).where(Ticket.status == "Offen")
    )
    open_tickets = result.scalar()
    
    result = await db.execute(
        select(func.count(Ticket.id)).where(Ticket.status == "In Bearbeitung")
    )
    in_progress_tickets = result.scalar()
    
    result = await db.execute(
        select(func.count(Ticket.id)).where(Ticket.status == "Gelöst")
    )
    resolved_tickets = result.scalar()
    
    result = await db.execute(
        select(func.count(Ticket.id)).where(Ticket.status == "Geschlossen")
    )
    closed_tickets = result.scalar()
    
    # Count by priority
    result = await db.execute(
        select(Ticket.priority, func.count(Ticket.id))
        .group_by(Ticket.priority)
    )
    tickets_by_priority = result.all()
    priority_dict = {
        priority: count for priority, count in tickets_by_priority
    }
    
    # Count by status
    result = await db.execute(
        select(Ticket.status, func.count(Ticket.id))
        .group_by(Ticket.status)
    )
    tickets_by_status = result.all()
    status_dict = {status: count for status, count in tickets_by_status}
    
    return TicketStats(
        total_tickets=total_tickets,
        open_tickets=open_tickets,
        in_progress_tickets=in_progress_tickets,
        resolved_tickets=resolved_tickets,
        closed_tickets=closed_tickets,
        tickets_by_priority=priority_dict,
        tickets_by_status=status_dict
    )


@router.get("/{ticket_id}", response_model=TicketWithDetails)
async def get_ticket(
    ticket_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get a specific ticket with details"""
    result = await db.execute(select(Ticket).where(Ticket.id == ticket_id))
    ticket = result.scalar_one_or_none()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )
    
    # Get comments
    result = await db.execute(
        select(TicketComment).where(TicketComment.ticket_id == ticket_id)
    )
    comments = result.scalars().all()
    
    # Get attachments
    result = await db.execute(
        select(TicketAttachment).where(TicketAttachment.ticket_id == ticket_id)
    )
    attachments = result.scalars().all()
    
    # Get audit logs
    result = await db.execute(
        select(TicketAuditLog).where(TicketAuditLog.ticket_id == ticket_id)
    )
    audit_logs = result.scalars().all()
    
    return TicketWithDetails(
        **ticket.__dict__,
        comments=comments,
        attachments=attachments,
        audit_logs=audit_logs
    )


@router.put("/{ticket_id}", response_model=TicketResponse)
async def update_ticket(
    ticket_id: uuid.UUID,
    ticket_update: TicketUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update a ticket"""
    result = await db.execute(select(Ticket).where(Ticket.id == ticket_id))
    db_ticket = result.scalar_one_or_none()
    if not db_ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )
    
    update_data = ticket_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_ticket, field, value)
    
    await db.commit()
    await db.refresh(db_ticket)
    
    # Create audit log
    audit_log = TicketAuditLog(
        id=uuid.uuid4(),
        ticket_id=ticket_id,
        user_id=db_ticket.user_id,
        action="ticket_updated",
        details=f"Ticket updated: {update_data}"
    )
    db.add(audit_log)
    await db.commit()
    
    return db_ticket


@router.delete("/{ticket_id}")
async def delete_ticket(
    ticket_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """Delete a ticket"""
    result = await db.execute(select(Ticket).where(Ticket.id == ticket_id))
    db_ticket = result.scalar_one_or_none()
    if not db_ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )
    
    await db.delete(db_ticket)
    await db.commit()
    
    return {"message": "Ticket deleted successfully"}


@router.post("/{ticket_id}/comments", response_model=TicketCommentResponse)
async def add_ticket_comment(
    ticket_id: uuid.UUID,
    comment: TicketCommentCreate,
    db: AsyncSession = Depends(get_db)
):
    """Add a comment to a ticket"""
    # Verify ticket exists
    result = await db.execute(select(Ticket).where(Ticket.id == ticket_id))
    ticket = result.scalar_one_or_none()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )
    
    db_comment = TicketComment(
        id=uuid.uuid4(),
        ticket_id=ticket_id,
        user_id=comment.user_id,
        comment=comment.comment,
        is_internal=comment.is_internal
    )
    
    db.add(db_comment)
    await db.commit()
    await db.refresh(db_comment)
    
    return db_comment


@router.get("/{ticket_id}/comments", response_model=List[TicketCommentResponse])
async def get_ticket_comments(
    ticket_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get all comments for a ticket"""
    result = await db.execute(
        select(TicketComment).where(TicketComment.ticket_id == ticket_id)
    )
    comments = result.scalars().all()
    return comments


@router.post("/{ticket_id}/assign")
async def assign_ticket(
    ticket_id: uuid.UUID,
    assigned_user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """Assign a ticket to a user"""
    result = await db.execute(select(Ticket).where(Ticket.id == ticket_id))
    ticket = result.scalar_one_or_none()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )
    
    # Verify assigned user exists
    result = await db.execute(select(User).where(User.id == assigned_user_id))
    assigned_user = result.scalar_one_or_none()
    if not assigned_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assigned user not found"
        )
    
    # Update ticket status to in progress
    ticket.status = "In Bearbeitung"
    await db.commit()
    
    # Create audit log
    audit_log = TicketAuditLog(
        id=uuid.uuid4(),
        ticket_id=ticket_id,
        user_id=ticket.user_id,
        action="ticket_assigned",
        details=f"User: {assigned_user_id}"
    )
    db.add(audit_log)
    await db.commit()
    
    return {"message": "Ticket assigned successfully"}


@router.post("/{ticket_id}/resolve")
async def resolve_ticket(
    ticket_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """Resolve a ticket"""
    result = await db.execute(select(Ticket).where(Ticket.id == ticket_id))
    ticket = result.scalar_one_or_none()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )
    
    ticket.status = "Gelöst"
    await db.commit()
    
    # Create audit log
    audit_log = TicketAuditLog(
        id=uuid.uuid4(),
        ticket_id=ticket_id,
        user_id=ticket.user_id,
        action="ticket_resolved",
        details="Ticket resolved"
    )
    db.add(audit_log)
    await db.commit()
    
    return {"message": "Ticket resolved successfully"}
