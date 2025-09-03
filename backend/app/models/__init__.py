# Database models
from .user import Department, User
from .assistant import Assistant
from .chat import Thread, Message
from .ticket import Ticket, TicketComment, TicketAttachment, TicketAuditLog

__all__ = [
    "Department",
    "User", 
    "Assistant",
    "Thread",
    "Message",
    "Ticket",
    "TicketComment",
    "TicketAttachment",
    "TicketAuditLog"
]
