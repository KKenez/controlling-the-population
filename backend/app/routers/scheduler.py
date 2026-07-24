import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.scheduler import SchedulerConfig, GenerationLog
from app.schemas.scheduler import SchedulerConfigRead, SchedulerConfigUpdate, GenerationLogRead

router = APIRouter(prefix="/api/scheduler", tags=["scheduler"])


@router.get("/config", response_model=SchedulerConfigRead)
async def get_scheduler_config(db: AsyncSession = Depends(get_db)):
    """Get current scheduler configuration."""
    config = await db.get(SchedulerConfig, "singleton")
    if not config:
        # Create default config
        config = SchedulerConfig(id="singleton")
        db.add(config)
        await db.commit()
        await db.refresh(config)
    return SchedulerConfigRead(
        enabled=config.enabled,
        interval_minutes=config.interval_minutes,
        quiet_start=config.quiet_start,
        quiet_end=config.quiet_end,
        auto_confirm=config.auto_confirm,
        last_run=config.last_run.isoformat() if config.last_run else None,
    )


@router.patch("/config", response_model=SchedulerConfigRead)
async def update_scheduler_config(data: SchedulerConfigUpdate, db: AsyncSession = Depends(get_db)):
    """Update scheduler configuration."""
    config = await db.get(SchedulerConfig, "singleton")
    if not config:
        config = SchedulerConfig(id="singleton")
        db.add(config)

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(config, field, value)

    await db.commit()
    await db.refresh(config)
    return SchedulerConfigRead(
        enabled=config.enabled,
        interval_minutes=config.interval_minutes,
        quiet_start=config.quiet_start,
        quiet_end=config.quiet_end,
        auto_confirm=config.auto_confirm,
        last_run=config.last_run.isoformat() if config.last_run else None,
    )


@router.get("/logs", response_model=list[GenerationLogRead])
async def list_generation_logs(limit: int = 20, db: AsyncSession = Depends(get_db)):
    """List recent generation log entries."""
    stmt = select(GenerationLog).order_by(GenerationLog.triggered_at.desc()).limit(limit)
    result = await db.execute(stmt)
    logs = result.scalars().all()
    return [
        GenerationLogRead(
            id=log.id,
            triggered_at=log.triggered_at.isoformat(),
            trigger_reason=log.trigger_reason,
            events_proposed=log.events_proposed,
            week_id=log.week_id,
            success=log.success,
            error_message=log.error_message,
        )
        for log in logs
    ]
