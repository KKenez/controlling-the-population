from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.event import Event
from app.schemas.event import EventRead

router = APIRouter(prefix="/api/events", tags=["calendar"])


@router.get("", response_model=list[EventRead])
async def get_events(
    start: str | None = Query(None, description="Filter events starting from (ISO datetime)"),
    end: str | None = Query(None, description="Filter events ending before (ISO datetime)"),
    source: str | None = Query(None, description="Filter by source"),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Event)
    if start:
        stmt = stmt.where(Event.start >= start)
    if end:
        stmt = stmt.where(Event.end <= end)
    if source:
        stmt = stmt.where(Event.source == source)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post("/sync")
async def sync_calendars():
    """Trigger calendar sync from external providers."""
    # TODO: implement calendar sync service
    return {"message": "sync triggered"}
