import logging
import uuid
from datetime import datetime, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import async_session
from app.models.routine import Routine
from app.models.scheduler import SchedulerConfig, GenerationLog
from app.services.generation import generate_week

logger = logging.getLogger(__name__)


def _get_next_monday() -> str:
    now = datetime.utcnow()
    days_ahead = 7 - now.weekday()  # Monday = 0
    if days_ahead == 7:
        days_ahead = 0
    monday = now + timedelta(days=days_ahead)
    return monday.strftime("%Y-%m-%d")


def _in_quiet_hours(quiet_start: str, quiet_end: str) -> bool:
    now = datetime.now()
    current_time = now.strftime("%H:%M")

    if quiet_start <= quiet_end:
        return quiet_start <= current_time <= quiet_end
    else:
        # Wraps midnight (e.g. 23:00 → 07:00)
        return current_time >= quiet_start or current_time <= quiet_end


async def run_scheduled_generation():
    """Run a single scheduled generation cycle. Called by APScheduler."""
    async with async_session() as db:
        try:
            config = await db.get(SchedulerConfig, "singleton")
            if not config or not config.enabled:
                return

            if _in_quiet_hours(config.quiet_start, config.quiet_end):
                logger.debug("Skipping generation — quiet hours")
                return

            # Get all active routines
            result = await db.execute(select(Routine))
            routines = result.scalars().all()
            if not routines:
                logger.debug("Skipping generation — no routines")
                return

            routine_ids = [r.id for r in routines]
            week_start = _get_next_monday()

            logger.info("Scheduled generation starting: %d routines, week %s", len(routine_ids), week_start)

            week = await generate_week(routine_ids, week_start, db)

            # Log success
            log_entry = GenerationLog(
                id=str(uuid.uuid4()),
                triggered_at=datetime.utcnow(),
                trigger_reason="scheduled",
                events_proposed=len(week.events),
                week_id=week.id,
                success=True,
            )
            db.add(log_entry)

            # Update last_run
            config.last_run = datetime.utcnow()
            await db.commit()

            logger.info("Scheduled generation complete: %d events proposed (week_id=%s)", len(week.events), week.id)

        except Exception as e:
            logger.exception("Scheduled generation failed")
            # Log failure
            log_entry = GenerationLog(
                id=str(uuid.uuid4()),
                triggered_at=datetime.utcnow(),
                trigger_reason="scheduled",
                events_proposed=0,
                success=False,
                error_message=str(e),
            )
            db.add(log_entry)
            await db.commit()
