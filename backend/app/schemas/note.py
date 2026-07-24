from app.schemas.base import CamelModel


class NoteCreate(CamelModel):
    text: str
    due_hint: str | None = None


class NoteUpdate(CamelModel):
    text: str | None = None
    due_hint: str | None = None
    resolved: bool | None = None


class NoteRead(CamelModel):
    id: str
    text: str
    due_hint: str | None = None
    resolved: bool
    linked_event_id: str | None = None
    created_at: str
