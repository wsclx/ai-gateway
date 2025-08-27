from sqlalchemy import Column, String, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.core.database import Base


class Department(Base):
    __tablename__ = "departments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    key = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    users = relationship("User", back_populates="department")
    
    def __repr__(self):
        return f"<Department(key='{self.key}', name='{self.name}')>"


class User(Base):
    __tablename__ = "app_users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ext_subject = Column(String(255), unique=True, nullable=False, index=True)
    ext_subject_hash = Column(String(64), nullable=False, index=True)
    display_name = Column(String(100), nullable=False)
    dept_id = Column(UUID(as_uuid=True), ForeignKey("departments.id"))
    role = Column(
        String(20), 
        nullable=False
    )
    __table_args__ = (
        CheckConstraint("role in ('user','lead','admin','dpo','steward')"),
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    department = relationship("Department", back_populates="users")
    threads = relationship("Thread", back_populates="user")
    
    def __repr__(self):
        return f"<User(ext_subject='{self.ext_subject}', role='{self.role}')>"
