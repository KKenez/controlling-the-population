from app.schemas.base import CamelModel


class QuestCreate(CamelModel):
    name: str
    description: str = ""
    life_area_id: str
    status: str = "backlog"
    done_when: str = ""
    estimated_sessions: int = 1
    duration_minutes: int = 60


class QuestUpdate(CamelModel):
    name: str | None = None
    description: str | None = None
    life_area_id: str | None = None
    status: str | None = None
    done_when: str | None = None
    estimated_sessions: int | None = None
    duration_minutes: int | None = None


class QuestRead(CamelModel):
    id: str
    name: str
    description: str
    life_area_id: str
    status: str
    done_when: str
    estimated_sessions: int
    duration_minutes: int
    created_at: str
    completed_at: str | None = None
