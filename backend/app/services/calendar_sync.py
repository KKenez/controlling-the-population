"""Calendar sync service — pulls events from external calendar sources."""

import uuid
from datetime import datetime, timezone

import httpx
from icalendar import Calendar
from dateutil.rrule import rrulestr
from dateutil.tz import tzutc
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.event import Event


# TODO: Implement MS Graph OAuth + event fetch
# TODO: Implement Google Calendar OAuth + event fetch
# TODO: Implement push of generated events to external calendars


async def sync_outlook_events(account: str):
    """Sync events from an Outlook account via MS Graph API."""
    raise NotImplementedError


async def sync_google_events():
    """Sync events from Google Calendar API."""
    raise NotImplementedError


async def sync_apple_calendar(db: AsyncSession) -> int:
    """Fetch and sync events from Apple Calendar via ICS URL.

    Returns the number of events synced.
    """
    if not settings.apple_calendar_ics_url:
        raise ValueError("apple_calendar_ics_url not configured in .env")

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(settings.apple_calendar_ics_url)
        response.raise_for_status()

    cal = Calendar.from_ical(response.text)

    # Delete existing apple events and replace with fresh data
    await db.execute(delete(Event).where(Event.source == "apple"))

    events_synced = 0
    now = datetime.now(timezone.utc)

    for component in cal.walk():
        if component.name != "VEVENT":
            continue

        dtstart = component.get("dtstart")
        dtend = component.get("dtend")
        if not dtstart:
            continue

        start_dt = dtstart.dt
        end_dt = dtend.dt if dtend else start_dt

        # Normalize date objects (all-day events) to datetime
        if not isinstance(start_dt, datetime):
            start_dt = datetime(start_dt.year, start_dt.month, start_dt.day, tzinfo=timezone.utc)
        if not isinstance(end_dt, datetime):
            end_dt = datetime(end_dt.year, end_dt.month, end_dt.day, tzinfo=timezone.utc)

        # Ensure timezone-aware
        if start_dt.tzinfo is None:
            start_dt = start_dt.replace(tzinfo=timezone.utc)
        if end_dt.tzinfo is None:
            end_dt = end_dt.replace(tzinfo=timezone.utc)

        # Skip events older than 30 days
        from datetime import timedelta
        if end_dt < now - timedelta(days=30):
            continue

        summary = str(component.get("summary", "Untitled"))
        location = component.get("location")
        description = component.get("description")
        uid = str(component.get("uid", ""))

        event = Event(
            id=str(uuid.uuid4()),
            title=summary,
            start=start_dt.isoformat(),
            end=end_dt.isoformat(),
            source="apple",
            location=str(location) if location else None,
            notes=str(description) if description else None,
            external_id=uid,
        )
        db.add(event)
        events_synced += 1

    await db.commit()
    return events_synced


async def push_event_to_calendar(event_id: str, target_source: str):
    """Push a confirmed generated event to the appropriate external calendar."""
    raise NotImplementedError
