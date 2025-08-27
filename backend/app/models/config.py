from sqlalchemy import Column, String, Integer, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

from app.core.database import Base


class GatewayConfig(Base):
    __tablename__ = "gateway_config"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Provider keys (store securely in production; placeholder for local testing)
    openai_api_key = Column(String(512), nullable=True)
    anthropic_api_key = Column(String(512), nullable=True)

    # Privacy / Compliance
    retention_days = Column(Integer, nullable=False, default=365)
    redaction_enabled = Column(Boolean, nullable=False, default=False)

    # Costs / Budgets
    budget_monthly_cents = Column(Integer, nullable=False, default=0)
    cost_alert_threshold_cents = Column(Integer, nullable=False, default=0)

    # Feature toggles
    feature_demo_mode = Column(Boolean, nullable=False, default=False)
    enable_analytics = Column(Boolean, nullable=False, default=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


