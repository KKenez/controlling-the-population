import uuid

from sqlalchemy import String, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime

from app.database import Base


class Note(Base):
    __tablename__ = "notes"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    text: Mapped[str] = mapped_column(String, nullable=False)
    due_hint: Mapped[str | None] = mapped_column(String, nullable=True)  # e.g. "Thursday afternoon"
    resolved: Mapped[bool] = mapped_column(Boolean, default=False)
    linked_event_id: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
