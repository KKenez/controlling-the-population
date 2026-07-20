from app.schemas.base import CamelModel


class EventCreate(CamelModel):
    title: str
    start: str
    end: str
    source: str
    location: str | None = None
    notes: str | None = None


class EventRead(CamelModel):
    id: str
    title: str
    start: str
    end: str
    source: str
    location: str | None = None
    notes: str | None = None
