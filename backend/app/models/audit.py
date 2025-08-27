from sqlalchemy import Column, String, DateTime, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

from app.core.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("app_users.id"), nullable=True)
    method = Column(String(10), nullable=False)
    path = Column(String(512), nullable=False)
    status = Column(Integer, nullable=False)
    ip = Column(String(100))
    user_agent = Column(String(512))
    duration_ms = Column(Integer)
    request_bytes = Column(Integer)
    response_bytes = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


