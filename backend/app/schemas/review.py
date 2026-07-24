from app.schemas.base import CamelModel


class EventReviewCreate(CamelModel):
    event_id: str
    event_title: str = ""
    status: str  # completed | skipped | partial | dismissed
    feedback: str = ""
    actual_duration_minutes: int | None = None


class EventReviewRead(CamelModel):
    id: str
    event_id: str
    event_title: str
    status: str
    feedback: str
    actual_duration_minutes: int | None = None


class DailyReviewCreate(CamelModel):
    date: str  # YYYY-MM-DD
    overall_notes: str = ""
    event_reviews: list[EventReviewCreate] = []


class DailyReviewRead(CamelModel):
    id: str
    date: str
    overall_notes: str
    completed_at: str
    event_reviews: list[EventReviewRead] = []
