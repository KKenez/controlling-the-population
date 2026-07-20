import uuid
from datetime import datetime

from sqlalchemy import String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class GeneratedWeek(Base):
    __tablename__ = "generated_weeks"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    week_start: Mapped[str] = mapped_column(String, nullable=False)  # ISO date (Monday)
    status: Mapped[str] = mapped_column(String, default="idle")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    events: Mapped[list["ProposedEvent"]] = relationship(back_populates="generated_week", cascade="all, delete-orphan")


class ProposedEvent(Base):
    __tablename__ = "proposed_events"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    generated_week_id: Mapped[str] = mapped_column(ForeignKey("generated_weeks.id"), nullable=False)
    routine_id: Mapped[str] = mapped_column(String, nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    start: Mapped[str] = mapped_column(DateTime, nullable=False)
    end: Mapped[str] = mapped_column(DateTime, nullable=False)
    editable: Mapped[bool] = mapped_column(Boolean, default=True)

    generated_week: Mapped["GeneratedWeek"] = relationship(back_populates="events")
