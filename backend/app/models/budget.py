import uuid
from datetime import datetime

from sqlalchemy import String, Float, Integer, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class BudgetConfig(Base):
    __tablename__ = "budget_config"

    id: Mapped[str] = mapped_column(String, primary_key=True, default="singleton")
    currency: Mapped[str] = mapped_column(String, default="EUR")  # EUR or HUF
    huf_eur_rate: Mapped[float] = mapped_column(Float, default=370.0)
    period: Mapped[str] = mapped_column(String, default="monthly")  # monthly
    rollover_enabled: Mapped[bool] = mapped_column(Boolean, default=True)


class ExpenseCategory(Base):
    __tablename__ = "expense_categories"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String, nullable=False)
    emoji: Mapped[str] = mapped_column(String, default="💰")
    monthly_budget: Mapped[float] = mapped_column(Float, default=0.0)  # in EUR
    color: Mapped[str] = mapped_column(String, default="#94a3b8")
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    expenses: Mapped[list["Expense"]] = relationship(back_populates="category")


class Expense(Base):
    __tablename__ = "expenses"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    amount: Mapped[float] = mapped_column(Float, nullable=False)  # always stored in EUR
    category_id: Mapped[str] = mapped_column(ForeignKey("expense_categories.id"), nullable=False)
    description: Mapped[str] = mapped_column(String, default="")
    date: Mapped[str] = mapped_column(String, nullable=False)  # YYYY-MM-DD
    raw_text: Mapped[str] = mapped_column(Text, default="")  # original user input
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    category: Mapped["ExpenseCategory"] = relationship(back_populates="expenses")


class SpendingSummary(Base):
    __tablename__ = "spending_summaries"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    period_start: Mapped[str] = mapped_column(String, nullable=False)  # YYYY-MM-DD (week start)
    period_type: Mapped[str] = mapped_column(String, default="week")  # week | month
    category_id: Mapped[str] = mapped_column(ForeignKey("expense_categories.id"), nullable=False)
    total: Mapped[float] = mapped_column(Float, default=0.0)
    budget: Mapped[float] = mapped_column(Float, default=0.0)  # weekly budget share
    vs_avg_pct: Mapped[float] = mapped_column(Float, default=0.0)
    vs_prev_pct: Mapped[float] = mapped_column(Float, default=0.0)
