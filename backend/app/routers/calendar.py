from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.event import Event
from app.schemas.event import EventCreate, EventRead
from app.config import settings
from app.services.calendar_sync import sync_apple_calendar

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


@router.post("", response_model=EventRead, status_code=201)
async def create_event(payload: EventCreate, db: AsyncSession = Depends(get_db)):
    """Create a new manual event."""
    import uuid
    event = Event(
        id=str(uuid.uuid4()),
        title=payload.title,
        start=payload.start,
        end=payload.end,
        source=payload.source,
        location=payload.location,
        notes=payload.notes,
    )
    db.add(event)
    await db.commit()
    await db.refresh(event)
    return event


@router.post("/sync")
async def sync_calendars(db: AsyncSession = Depends(get_db)):
    """Trigger calendar sync from external providers."""
    results = {}

    apple_calendars = {
        "apple_home": settings.apple_home_ics_url,
        "apple_work": settings.apple_work_ics_url,
    }

    for source, url in apple_calendars.items():
        if not url:
            results[source] = {"status": "skipped", "reason": "not configured"}
            continue
        try:
            count = await sync_apple_calendar(db, source=source, ics_url=url)
            results[source] = {"status": "ok", "events_synced": count}
        except Exception as e:
            results[source] = {"status": "error", "reason": str(e)}

    return {"message": "sync complete", "results": results}
