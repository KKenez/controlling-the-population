from app.schemas.base import CamelModel


class TimeConstraintSchema(CamelModel):
    earliest_start: str | None = None
    latest_end: str | None = None
    preferred_days: list[int] | None = None
    exclude_days: list[int] | None = None


class RoutineCreate(CamelModel):
    name: str
    life_area_id: str
    goal_id: str | None = None
    description: str = ""
    priority: str
    frequency_per_week: int
    duration_minutes: int
    constraints: TimeConstraintSchema = TimeConstraintSchema()
    parameters: dict = {}


class RoutineUpdate(CamelModel):
    name: str | None = None
    life_area_id: str | None = None
    goal_id: str | None = None
    description: str | None = None
    priority: str | None = None
    frequency_per_week: int | None = None
    duration_minutes: int | None = None
    constraints: TimeConstraintSchema | None = None
    parameters: dict | None = None


class RoutineRead(CamelModel):
    id: str
    name: str
    life_area_id: str
    goal_id: str | None = None
    description: str
    priority: str
    frequency_per_week: int
    duration_minutes: int
    constraints: dict
    parameters: dict
