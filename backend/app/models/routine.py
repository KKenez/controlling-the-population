import uuid

from sqlalchemy import String, Integer, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Routine(Base):
    __tablename__ = "routines"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String, nullable=False)
    life_area: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(String, default="")
    priority: Mapped[str] = mapped_column(String, nullable=False)
    frequency_per_week: Mapped[int] = mapped_column(Integer, nullable=False)
    duration_minutes: Mapped[int] = mapped_column(Integer, nullable=False)
    constraints: Mapped[dict] = mapped_column(JSON, default=dict)
    parameters: Mapped[dict] = mapped_column(JSON, default=dict)
