import uuid

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class LifeArea(Base):
    __tablename__ = "life_areas"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String, nullable=False)
    color: Mapped[str] = mapped_column(String, default="#6366f1")  # hex color for UI
    icon: Mapped[str] = mapped_column(String, default="circle")  # lucide icon name
    description: Mapped[str] = mapped_column(String, default="")

    routines: Mapped[list["Routine"]] = relationship(back_populates="life_area_rel", cascade="all, delete-orphan")


# Avoid circular import - import Routine after module load
from app.models.routine import Routine  # noqa: E402, F401
