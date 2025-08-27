from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.authz import require_role
from app.models.config import GatewayConfig

router = APIRouter()


def _to_dict(cfg: GatewayConfig) -> dict:
    return {
        "openaiApiKey": bool(cfg.openai_api_key),  # do not expose key
        "anthropicApiKey": bool(cfg.anthropic_api_key),
        "retentionDays": cfg.retention_days,
        "redactionEnabled": cfg.redaction_enabled,
        "budgetMonthlyCents": cfg.budget_monthly_cents,
        "costAlertThresholdCents": cfg.cost_alert_threshold_cents,
        "featureDemoMode": cfg.feature_demo_mode,
        "enableAnalytics": cfg.enable_analytics,
    }


async def _get_or_create_config(db: AsyncSession) -> GatewayConfig:
    row = await db.execute(select(GatewayConfig))
    cfg = row.scalars().first()
    if not cfg:
        cfg = GatewayConfig()
        db.add(cfg)
        await db.commit()
        await db.refresh(cfg)
    return cfg


@router.get("/config")
async def get_config(db: AsyncSession = Depends(get_db), user=Depends(require_role("admin", "dpo"))):
    cfg = await _get_or_create_config(db)
    return _to_dict(cfg)


@router.put("/config")
async def update_config(payload: dict, db: AsyncSession = Depends(get_db), user=Depends(require_role("admin", "dpo"))):
    cfg = await _get_or_create_config(db)
    # Update allowed fields
    rd = payload.get("retentionDays")
    if isinstance(rd, int) and rd >= 0:
        cfg.retention_days = rd
    cfg.redaction_enabled = bool(payload.get("redactionEnabled", cfg.redaction_enabled))
    bm = payload.get("budgetMonthlyCents")
    if isinstance(bm, int) and bm >= 0:
        cfg.budget_monthly_cents = bm
    ca = payload.get("costAlertThresholdCents")
    if isinstance(ca, int) and ca >= 0:
        cfg.cost_alert_threshold_cents = ca
    cfg.feature_demo_mode = bool(payload.get("featureDemoMode", cfg.feature_demo_mode))
    cfg.enable_analytics = bool(payload.get("enableAnalytics", cfg.enable_analytics))

    # Provider keys (optional; avoid echoing back)
    if isinstance(payload.get("openaiApiKey"), str) and payload["openaiApiKey"].strip():
        cfg.openai_api_key = payload["openaiApiKey"].strip()
    if isinstance(payload.get("anthropicApiKey"), str) and payload["anthropicApiKey"].strip():
        cfg.anthropic_api_key = payload["anthropicApiKey"].strip()

    await db.commit()
    await db.refresh(cfg)
    return _to_dict(cfg)


