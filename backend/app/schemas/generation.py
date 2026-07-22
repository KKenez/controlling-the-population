from datetime import datetime

from app.schemas.base import CamelModel


class ProposedEventRead(CamelModel):
    id: str
    routine_id: str
    title: str
    start: str
    end: str
    editable: bool


class GeneratedWeekRead(CamelModel):
    id: str
    week_start: str
    status: str
    events: list[ProposedEventRead]
    created_at: datetime | str


class GenerateRequest(CamelModel):
    routine_ids: list[str]
    week_start: str
