from datetime import datetime

from app.schemas.base import CamelModel


class EventCreate(CamelModel):
    title: str
    start: datetime
    end: datetime
    source: str
    location: str | None = None
    notes: str | None = None


class EventRead(CamelModel):
    id: str
    title: str
    start: datetime
    end: datetime
    source: str
    location: str | None = None
    notes: str | None = None
