import uuid

from sqlalchemy import String, Integer, ForeignKey, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime

from app.database import Base


class DailyReview(Base):
    __tablename__ = "daily_reviews"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    date: Mapped[str] = mapped_column(String, nullable=False)  # ISO date (YYYY-MM-DD)
    overall_notes: Mapped[str] = mapped_column(Text, default="")
    completed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    event_reviews: Mapped[list["EventReview"]] = relationship(
        back_populates="daily_review", cascade="all, delete-orphan"
    )


class EventReview(Base):
    __tablename__ = "event_reviews"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    daily_review_id: Mapped[str] = mapped_column(ForeignKey("daily_reviews.id"), nullable=False)
    event_id: Mapped[str] = mapped_column(String, nullable=False)
    event_title: Mapped[str] = mapped_column(String, default="")  # denormalized for history
    status: Mapped[str] = mapped_column(String, nullable=False)  # completed | skipped | partial | dismissed
    feedback: Mapped[str] = mapped_column(Text, default="")
    actual_duration_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)

    daily_review: Mapped["DailyReview"] = relationship(back_populates="event_reviews")
