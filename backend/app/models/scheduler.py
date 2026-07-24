import uuid

from sqlalchemy import String, Boolean, DateTime, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime

from app.database import Base


class GenerationLog(Base):
    __tablename__ = "generation_logs"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    triggered_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    trigger_reason: Mapped[str] = mapped_column(String, default="manual")  # manual | scheduled
    events_proposed: Mapped[int] = mapped_column(Integer, default=0)
    week_id: Mapped[str | None] = mapped_column(String, nullable=True)
    success: Mapped[bool] = mapped_column(Boolean, default=True)
    error_message: Mapped[str] = mapped_column(Text, default="")


class SchedulerConfig(Base):
    __tablename__ = "scheduler_config"

    id: Mapped[str] = mapped_column(String, primary_key=True, default="singleton")
    enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    interval_minutes: Mapped[int] = mapped_column(Integer, default=60)
    quiet_start: Mapped[str] = mapped_column(String, default="23:00")  # HH:MM
    quiet_end: Mapped[str] = mapped_column(String, default="07:00")  # HH:MM
    auto_confirm: Mapped[bool] = mapped_column(Boolean, default=False)
    last_run: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
