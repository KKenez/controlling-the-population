from app.schemas.base import CamelModel


class GoalCreate(CamelModel):
    name: str
    description: str = ""
    life_area_id: str
    status: str = "backlog"


class GoalUpdate(CamelModel):
    name: str | None = None
    description: str | None = None
    life_area_id: str | None = None
    status: str | None = None


class GoalRead(CamelModel):
    id: str
    name: str
    description: str
    life_area_id: str
    status: str
    created_at: str
    routine_count: int = 0
