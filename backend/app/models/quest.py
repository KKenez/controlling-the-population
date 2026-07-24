import uuid

from sqlalchemy import String, Integer, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime

from app.database import Base


class Quest(Base):
    __tablename__ = "quests"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(String, default="")
    life_area_id: Mapped[str] = mapped_column(ForeignKey("life_areas.id"), nullable=False)
    status: Mapped[str] = mapped_column(String, default="backlog")  # backlog | active | paused | completed
    done_when: Mapped[str] = mapped_column(String, default="")  # completion criteria
    estimated_sessions: Mapped[int] = mapped_column(Integer, default=1)
    duration_minutes: Mapped[int] = mapped_column(Integer, default=60)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    life_area_rel: Mapped["LifeArea"] = relationship()


from app.models.life_area import LifeArea  # noqa: E402, F401
