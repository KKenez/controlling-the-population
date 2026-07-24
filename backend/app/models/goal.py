import uuid

from sqlalchemy import String, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime

from app.database import Base


class Goal(Base):
    __tablename__ = "goals"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(String, default="")
    life_area_id: Mapped[str] = mapped_column(ForeignKey("life_areas.id"), nullable=False)
    status: Mapped[str] = mapped_column(String, default="backlog")  # backlog | active | paused
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    life_area_rel: Mapped["LifeArea"] = relationship()
    routines: Mapped[list["Routine"]] = relationship(back_populates="goal_rel")


from app.models.life_area import LifeArea  # noqa: E402, F401
from app.models.routine import Routine  # noqa: E402, F401
