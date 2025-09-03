from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from app.database import get_db
from app.models.ticket import Ticket, TicketComment, TicketAttachment, TicketAuditLog
from app.models.user import User
from app.schemas.ticket import (
    TicketCreate, TicketUpdate, TicketResponse, TicketWithDetails,
    TicketCommentCreate, TicketCommentResponse, TicketStats, TicketFilter
)
from app.core.auth import get_current_user
from app.core.permissions import require_admin_role

router = APIRouter(prefix="/tickets", tags=["tickets"])


@router.post("/", response_model=TicketResponse)
async def create_ticket(
    ticket_data: TicketCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new support ticket"""
    db_ticket = Ticket(
        **ticket_data.dict(),
        user_id=current_user.id
    )
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)
    
    # Log the ticket creation
    audit_log = TicketAuditLog(
        ticket_id=db_ticket.id,
        user_id=current_user.id,
        action="created",
        new_value=f"Ticket '{ticket_data.title}' created"
    )
    db.add(audit_log)
    db.commit()
    
    return db_ticket


@router.get("/", response_model=List[TicketResponse])
async def get_tickets(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    assigned_to: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(100, le=1000),
    offset: int = Query(0, ge=0)
):
    """Get tickets with optional filtering"""
    query = db.query(Ticket)
    
    # Apply filters based on user role
    if current_user.role != "admin":
        # Regular users can only see their own tickets
        query = query.filter(Ticket.user_id == current_user.id)
    else:
        # Admins can filter by assigned_to
        if assigned_to:
            query = query.filter(Ticket.assigned_to == assigned_to)
    
    # Apply other filters
    if status:
        query = query.filter(Ticket.status == status)
    if priority:
        query = query.filter(Ticket.priority == priority)
    if category:
        query = query.filter(Ticket.category == category)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Ticket.title.ilike(search_filter)) |
            (Ticket.description.ilike(search_filter))
        )
    
    # Order by creation date (newest first)
    query = query.order_by(Ticket.created_at.desc())
    
    # Apply pagination
    tickets = query.offset(offset).limit(limit).all()
    return tickets


@router.get("/stats", response_model=TicketStats)
async def get_ticket_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get ticket statistics"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can view ticket statistics"
        )
    
    # Get basic counts
    total_tickets = db.query(Ticket).count()
    open_tickets = db.query(Ticket).filter(Ticket.status == "Offen").count()
    in_progress_tickets = db.query(Ticket).filter(
        Ticket.status == "In Bearbeitung"
    ).count()
    closed_tickets = db.query(Ticket).filter(
        Ticket.status == "Geschlossen"
    ).count()
    resolved_tickets = db.query(Ticket).filter(
        Ticket.status == "Gelöst"
    ).count()
    
    # Calculate average response time
    response_time_result = db.query(
        db.func.avg(Ticket.response_time_hours)
    ).filter(Ticket.response_time_hours.isnot(None)).scalar()
    avg_response_time = float(response_time_result) if response_time_result else None
    
    # Calculate average satisfaction rating
    satisfaction_result = db.query(
        db.func.avg(Ticket.satisfaction_rating)
    ).filter(Ticket.satisfaction_rating.isnot(None)).scalar()
    avg_satisfaction = float(satisfaction_result) if satisfaction_result else None
    
    # Get counts by priority
    tickets_by_priority = {}
    for priority in ["Niedrig", "Mittel", "Hoch", "Kritisch"]:
        count = db.query(Ticket).filter(Ticket.priority == priority).count()
        tickets_by_priority[priority] = count
    
    # Get counts by category
    tickets_by_category = {}
    categories = db.query(Ticket.category).distinct().all()
    for (category,) in categories:
        count = db.query(Ticket).filter(Ticket.category == category).count()
        tickets_by_category[category] = count
    
    # Get counts by status
    tickets_by_status = {}
    for status in ["Offen", "In Bearbeitung", "Geschlossen", "Gelöst"]:
        count = db.query(Ticket).filter(Ticket.status == status).count()
        tickets_by_status[status] = count
    
    return TicketStats(
        total_tickets=total_tickets,
        open_tickets=open_tickets,
        in_progress_tickets=in_progress_tickets,
        closed_tickets=closed_tickets,
        resolved_tickets=resolved_tickets,
        avg_response_time_hours=avg_response_time,
        avg_satisfaction_rating=avg_satisfaction,
        tickets_by_priority=tickets_by_priority,
        tickets_by_category=tickets_by_category,
        tickets_by_status=tickets_by_status
    )


@router.get("/{ticket_id}", response_model=TicketWithDetails)
async def get_ticket(
    ticket_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific ticket with all details"""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )
    
    # Check permissions
    if current_user.role != "admin" and ticket.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    return ticket


@router.put("/{ticket_id}", response_model=TicketResponse)
async def update_ticket(
    ticket_id: int,
    ticket_update: TicketUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a ticket"""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )
    
    # Check permissions
    if current_user.role != "admin" and ticket.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Regular users can only update certain fields
    if current_user.role != "admin":
        update_data = ticket_update.dict(exclude_unset=True)
        allowed_fields = {"title", "description", "priority", "category", "tags"}
        update_data = {k: v for k, v in update_data.items() if k in allowed_fields}
    else:
        update_data = ticket_update.dict(exclude_unset=True)
        
        # If status is being changed to resolved, set resolved_at
        if "status" in update_data and update_data["status"] == "Gelöst":
            update_data["resolved_at"] = datetime.utcnow()
    
    # Log the update
    for field, new_value in update_data.items():
        old_value = getattr(ticket, field)
        if old_value != new_value:
            audit_log = TicketAuditLog(
                ticket_id=ticket_id,
                user_id=current_user.id,
                action=f"updated_{field}",
                old_value=str(old_value) if old_value is not None else None,
                new_value=str(new_value) if new_value is not None else None
            )
            db.add(audit_log)
    
    # Update the ticket
    for field, value in update_data.items():
        setattr(ticket, field, value)
    
    ticket.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(ticket)
    
    return ticket


@router.delete("/{ticket_id}")
async def delete_ticket(
    ticket_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a ticket (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can delete tickets"
        )
    
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )
    
    # Log the deletion
    audit_log = TicketAuditLog(
        ticket_id=ticket_id,
        user_id=current_user.id,
        action="deleted",
        old_value=f"Ticket '{ticket.title}' deleted"
    )
    db.add(audit_log)
    
    db.delete(ticket)
    db.commit()
    
    return {"message": "Ticket deleted successfully"}


@router.post("/{ticket_id}/comments", response_model=TicketCommentResponse)
async def add_ticket_comment(
    ticket_id: int,
    comment_data: TicketCommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a comment to a ticket"""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )
    
    # Check permissions
    if current_user.role != "admin" and ticket.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Regular users cannot add internal comments
    if comment_data.is_internal and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can add internal comments"
        )
    
    comment = TicketComment(
        **comment_data.dict(),
        ticket_id=ticket_id,
        user_id=current_user.id
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    
    # Log the comment addition
    audit_log = TicketAuditLog(
        ticket_id=ticket_id,
        user_id=current_user.id,
        action="added_comment",
        new_value=f"Comment added: {comment_data.comment[:50]}..."
    )
    db.add(audit_log)
    db.commit()
    
    return comment


@router.get("/{ticket_id}/comments", response_model=List[TicketCommentResponse])
async def get_ticket_comments(
    ticket_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get comments for a ticket"""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )
    
    # Check permissions
    if current_user.role != "admin" and ticket.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    query = db.query(TicketComment).filter(TicketComment.ticket_id == ticket_id)
    
    # Regular users cannot see internal comments
    if current_user.role != "admin":
        query = query.filter(TicketComment.is_internal == False)
    
    comments = query.order_by(TicketComment.created_at.asc()).all()
    return comments


@router.post("/{ticket_id}/assign")
async def assign_ticket(
    ticket_id: int,
    assigned_to: int,
    current_user: User = Depends(require_admin_role),
    db: Session = Depends(get_db)
):
    """Assign a ticket to a user (admin only)"""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )
    
    # Check if assigned user exists
    assigned_user = db.query(User).filter(User.id == assigned_to).first()
    if not assigned_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assigned user not found"
        )
    
    old_assigned_to = ticket.assigned_to
    ticket.assigned_to = assigned_to
    ticket.updated_at = datetime.utcnow()
    
    # Log the assignment
    audit_log = TicketAuditLog(
        ticket_id=ticket_id,
        user_id=current_user.id,
        action="assigned",
        old_value=str(old_assigned_to) if old_assigned_to else "None",
        new_value=str(assigned_to)
    )
    db.add(audit_log)
    
    db.commit()
    db.refresh(ticket)
    
    return {"message": f"Ticket assigned to {assigned_user.full_name}"}


@router.post("/{ticket_id}/resolve")
async def resolve_ticket(
    ticket_id: int,
    current_user: User = Depends(require_admin_role),
    db: Session = Depends(get_db)
):
    """Mark a ticket as resolved (admin only)"""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )
    
    if ticket.status == "Gelöst":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ticket is already resolved"
        )
    
    old_status = ticket.status
    ticket.status = "Gelöst"
    ticket.resolved_at = datetime.utcnow()
    ticket.updated_at = datetime.utcnow()
    
    # Calculate response time
    if ticket.created_at:
        response_time = (ticket.resolved_at - ticket.created_at).total_seconds() / 3600
        ticket.response_time_hours = int(response_time)
    
    # Log the resolution
    audit_log = TicketAuditLog(
        ticket_id=ticket_id,
        user_id=current_user.id,
        action="resolved",
        old_value=old_status,
        new_value="Gelöst"
    )
    db.add(audit_log)
    
    db.commit()
    db.refresh(ticket)
    
    return {"message": "Ticket marked as resolved"}
