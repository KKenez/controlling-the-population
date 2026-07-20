"""Calendar sync service — pulls events from MS Graph and Google Calendar APIs."""

# TODO: Implement MS Graph OAuth + event fetch
# TODO: Implement Google Calendar OAuth + event fetch
# TODO: Implement push of generated events to external calendars


async def sync_outlook_events(account: str):
    """Sync events from an Outlook account via MS Graph API."""
    raise NotImplementedError


async def sync_google_events():
    """Sync events from Google Calendar API."""
    raise NotImplementedError


async def push_event_to_calendar(event_id: str, target_source: str):
    """Push a confirmed generated event to the appropriate external calendar."""
    raise NotImplementedError
