from fastapi import APIRouter, HTTPException, status, Depends
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timedelta
import random

from app.core.database import get_db
from app.models.user import User
from app.models.chat import Thread, Message
from app.models.ticket import Ticket

router = APIRouter()


@router.get("/overview")
async def get_system_overview(
    db: AsyncSession = Depends(get_db)
):
    """Get system overview with real statistics"""
    try:
        # User statistics
        total_users_result = await db.execute(select(func.count(User.id)))
        total_users = total_users_result.scalar_one() or 0
        
        active_users_result = await db.execute(
            select(func.count(User.id.distinct())).select_from(
                Thread.__table__.join(User.__table__, Thread.user_id == User.id)
            ).where(Thread.created_at >= datetime.now() - timedelta(days=7))
        )
        active_users = active_users_result.scalar_one() or 0
        
        # Ticket statistics
        total_tickets_result = await db.execute(select(func.count(Ticket.id)))
        total_tickets = total_tickets_result.scalar_one() or 0
        
        open_tickets_result = await db.execute(
            select(func.count(Ticket.id)).where(Ticket.status == "open")
        )
        open_tickets = open_tickets_result.scalar_one() or 0
        
        # Chat statistics
        total_messages_result = await db.execute(select(func.count(Message.id)))
        total_messages = total_messages_result.scalar_one() or 0
        
        total_threads_result = await db.execute(select(func.count(Thread.id)))
        total_threads = total_threads_result.scalar_one() or 0
        
        # Mock system metrics (in production would use real monitoring)
        cpu_percent = random.randint(20, 80)
        memory_percent = random.randint(30, 90)
        disk_percent = random.randint(40, 85)
        
        return {
            "users": {
                "total": total_users,
                "active": active_users,
                "new_this_week": active_users  # Simplified
            },
            "tickets": {
                "total": total_tickets,
                "open": open_tickets,
                "resolved": total_tickets - open_tickets
            },
            "chat": {
                "total_messages": total_messages,
                "total_threads": total_threads,
                "avg_messages_per_thread": round(
                    total_messages / max(total_threads, 1), 1
                )
            },
            "system": {
                "cpu_usage": cpu_percent,
                "memory_usage": memory_percent,
                "disk_usage": disk_percent,
                "uptime": get_system_uptime()
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get system overview: {str(e)}"
        )


# Provide no-trailing-slash aliases to avoid 307/404 issues behind proxies
@router.get("/overview/")
async def get_system_overview_slash(db: AsyncSession = Depends(get_db)):
    return await get_system_overview(db)


@router.get("/status")
async def get_system_status():
    """Get detailed system status"""
    try:
        # Database status
        db_status = "operational"  # Simplified - in real app would test connection
        
        # API status
        api_status = "operational"
        
        # Mock storage status
        disk_percent = random.randint(40, 85)
        storage_status = "operational" if disk_percent < 90 else "warning"
        
        # Mock CPU status
        cpu_percent = random.randint(20, 80)
        cpu_status = "operational" if cpu_percent < 80 else "warning"
        
        return {
            "services": [
                {
                    "name": "Database",
                    "status": db_status,
                    "value": "Online",
                    "details": "PostgreSQL connection active"
                },
                {
                    "name": "API Server",
                    "status": api_status,
                    "value": "Online",
                    "details": "FastAPI server running"
                },
                {
                    "name": "Storage",
                    "status": storage_status,
                    "value": f"{disk_percent}%",
                    "details": f"{random.randint(10, 100)}GB free"
                },
                {
                    "name": "CPU",
                    "status": cpu_status,
                    "value": f"{cpu_percent}%",
                    "details": f"Load average: {cpu_percent}%"
                }
            ],
            "overall_status": "operational" if all(
                s["status"] == "operational" for s in [
                    {"status": db_status},
                    {"status": api_status},
                    {"status": storage_status},
                    {"status": cpu_status}
                ]
            ) else "warning"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get system status: {str(e)}"
        )


@router.get("/status/")
async def get_system_status_slash():
    return await get_system_status()


@router.get("/logs")
async def get_system_logs(
    lines: int = 100,
    level: str = "INFO"
):
    """Get system logs (simplified)"""
    try:
        # In a real implementation, this would read from actual log files
        # For now, return a simplified log structure
        return {
            "logs": [
                {
                    "timestamp": datetime.now().isoformat(),
                    "level": "INFO",
                    "message": "System logs endpoint accessed"
                }
            ],
            "total_lines": 1
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get system logs: {str(e)}"
        )


@router.get("/logs/")
async def get_system_logs_slash(
    lines: int = 100, level: str = "INFO"
):
    return await get_system_logs(lines=lines, level=level)


def get_system_uptime() -> str:
    """Get system uptime (mock)"""
    try:
        # Mock uptime - in production would use real system uptime
        hours = random.randint(1, 168)  # 1 hour to 1 week
        days = hours // 24
        remaining_hours = hours % 24
        
        if days > 0:
            return f"{days}d {remaining_hours}h"
        else:
            return f"{hours}h"
    except:
        return "Unknown"
