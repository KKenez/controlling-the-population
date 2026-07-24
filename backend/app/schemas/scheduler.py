from app.schemas.base import CamelModel


class SchedulerConfigRead(CamelModel):
    enabled: bool
    interval_minutes: int
    quiet_start: str
    quiet_end: str
    auto_confirm: bool
    last_run: str | None = None


class SchedulerConfigUpdate(CamelModel):
    enabled: bool | None = None
    interval_minutes: int | None = None
    quiet_start: str | None = None
    quiet_end: str | None = None
    auto_confirm: bool | None = None


class GenerationLogRead(CamelModel):
    id: str
    triggered_at: str
    trigger_reason: str
    events_proposed: int
    week_id: str | None = None
    success: bool
    error_message: str
