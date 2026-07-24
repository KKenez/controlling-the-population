import uuid
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.budget import BudgetConfig, ExpenseCategory, Expense
from app.schemas.budget import (
    CategoryCreate, CategoryUpdate, CategoryRead,
    ExpenseCreate, ExpenseRead,
    SpendingParseRequest, SpendingParseResponse, ParsedExpenseItem,
    SpendingConfirmRequest,
    BudgetConfigRead, BudgetConfigUpdate,
    WeeklySummary, CategorySummary, MonthlySummary,
)

router = APIRouter(prefix="/api/budget", tags=["budget"])

# ─── Default categories seeded on first access ──────────────────────────────

DEFAULT_CATEGORIES = [
    ("Groceries", "🛒", "#22c55e", 200.0),
    ("Eating Out", "🍕", "#f97316", 100.0),
    ("Transport", "🚗", "#3b82f6", 80.0),
    ("Subscriptions", "📺", "#8b5cf6", 50.0),
    ("Entertainment", "🎬", "#ec4899", 80.0),
    ("Shopping", "🛍️", "#14b8a6", 100.0),
    ("Health", "💊", "#06b6d4", 50.0),
    ("Bills", "🏠", "#eab308", 150.0),
    ("Other", "💰", "#94a3b8", 50.0),
]


async def _ensure_config(db: AsyncSession) -> BudgetConfig:
    config = await db.get(BudgetConfig, "singleton")
    if not config:
        config = BudgetConfig(id="singleton")
        db.add(config)
        await db.commit()
        await db.refresh(config)
    return config


async def _ensure_categories(db: AsyncSession) -> None:
    result = await db.execute(select(func.count(ExpenseCategory.id)))
    count = result.scalar() or 0
    if count == 0:
        for i, (name, emoji, color, budget) in enumerate(DEFAULT_CATEGORIES):
            cat = ExpenseCategory(
                id=str(uuid.uuid4()),
                name=name,
                emoji=emoji,
                color=color,
                monthly_budget=budget,
                sort_order=i,
            )
            db.add(cat)
        await db.commit()


# ─── Config ─────────────────────────────────────────────────────────────────

@router.get("/config", response_model=BudgetConfigRead)
async def get_config(db: AsyncSession = Depends(get_db)):
    config = await _ensure_config(db)
    return BudgetConfigRead(
        currency=config.currency,
        huf_eur_rate=config.huf_eur_rate,
        rollover_enabled=config.rollover_enabled,
    )


@router.patch("/config", response_model=BudgetConfigRead)
async def update_config(data: BudgetConfigUpdate, db: AsyncSession = Depends(get_db)):
    config = await _ensure_config(db)
    if data.currency is not None:
        config.currency = data.currency
    if data.huf_eur_rate is not None:
        config.huf_eur_rate = data.huf_eur_rate
    if data.rollover_enabled is not None:
        config.rollover_enabled = data.rollover_enabled
    await db.commit()
    await db.refresh(config)
    return BudgetConfigRead(
        currency=config.currency,
        huf_eur_rate=config.huf_eur_rate,
        rollover_enabled=config.rollover_enabled,
    )


# ─── Categories ─────────────────────────────────────────────────────────────

@router.get("/categories", response_model=list[CategoryRead])
async def list_categories(db: AsyncSession = Depends(get_db)):
    await _ensure_categories(db)
    result = await db.execute(select(ExpenseCategory).order_by(ExpenseCategory.sort_order))
    cats = result.scalars().all()
    return [
        CategoryRead(
            id=c.id, name=c.name, emoji=c.emoji, color=c.color,
            monthly_budget=c.monthly_budget if c.monthly_budget else None,
            sort_order=c.sort_order,
        )
        for c in cats
    ]


@router.post("/categories", response_model=CategoryRead, status_code=201)
async def create_category(data: CategoryCreate, db: AsyncSession = Depends(get_db)):
    cat = ExpenseCategory(
        id=str(uuid.uuid4()),
        name=data.name,
        emoji=data.emoji,
        color=data.color,
        monthly_budget=data.monthly_budget or 0.0,
        sort_order=data.sort_order,
    )
    db.add(cat)
    await db.commit()
    await db.refresh(cat)
    return CategoryRead(
        id=cat.id, name=cat.name, emoji=cat.emoji, color=cat.color,
        monthly_budget=cat.monthly_budget if cat.monthly_budget else None,
        sort_order=cat.sort_order,
    )


@router.patch("/categories/{cat_id}", response_model=CategoryRead)
async def update_category(cat_id: str, data: CategoryUpdate, db: AsyncSession = Depends(get_db)):
    cat = await db.get(ExpenseCategory, cat_id)
    if not cat:
        raise HTTPException(404, "Category not found")
    if data.name is not None:
        cat.name = data.name
    if data.emoji is not None:
        cat.emoji = data.emoji
    if data.color is not None:
        cat.color = data.color
    if data.monthly_budget is not None:
        cat.monthly_budget = data.monthly_budget
    if data.sort_order is not None:
        cat.sort_order = data.sort_order
    await db.commit()
    await db.refresh(cat)
    return CategoryRead(
        id=cat.id, name=cat.name, emoji=cat.emoji, color=cat.color,
        monthly_budget=cat.monthly_budget if cat.monthly_budget else None,
        sort_order=cat.sort_order,
    )


# ─── Expenses ───────────────────────────────────────────────────────────────

@router.get("/expenses", response_model=list[ExpenseRead])
async def list_expenses(
    date_from: str | None = None,
    date_to: str | None = None,
    category_id: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Expense).order_by(Expense.date.desc(), Expense.created_at.desc())
    if date_from:
        stmt = stmt.where(Expense.date >= date_from)
    if date_to:
        stmt = stmt.where(Expense.date <= date_to)
    if category_id:
        stmt = stmt.where(Expense.category_id == category_id)
    result = await db.execute(stmt)
    expenses = result.scalars().all()
    return [
        ExpenseRead(
            id=e.id, amount=e.amount, category_id=e.category_id,
            description=e.description, date=e.date, raw_text=e.raw_text,
            created_at=e.created_at.isoformat(),
        )
        for e in expenses
    ]


@router.post("/expenses", response_model=list[ExpenseRead], status_code=201)
async def create_expenses(data: SpendingConfirmRequest, db: AsyncSession = Depends(get_db)):
    """Bulk create expenses (called after AI parse confirm)."""
    created = []
    for item in data.items:
        expense = Expense(
            id=str(uuid.uuid4()),
            amount=item.amount,
            category_id=item.category_id,
            description=item.description,
            date=data.date,
            raw_text=item.raw_text,
        )
        db.add(expense)
        created.append(expense)
    await db.commit()
    return [
        ExpenseRead(
            id=e.id, amount=e.amount, category_id=e.category_id,
            description=e.description, date=e.date, raw_text=e.raw_text,
            created_at=e.created_at.isoformat(),
        )
        for e in created
    ]


@router.delete("/expenses/{expense_id}", status_code=204)
async def delete_expense(expense_id: str, db: AsyncSession = Depends(get_db)):
    expense = await db.get(Expense, expense_id)
    if not expense:
        raise HTTPException(404, "Expense not found")
    await db.delete(expense)
    await db.commit()


# ─── AI Parse ───────────────────────────────────────────────────────────────

@router.post("/parse", response_model=SpendingParseResponse)
async def parse_spending(data: SpendingParseRequest, db: AsyncSession = Depends(get_db)):
    """Use AI to parse free-text spending into categorized items."""
    from app.services.budget import parse_spending_text

    config = await _ensure_config(db)
    await _ensure_categories(db)

    # Get categories for the prompt
    result = await db.execute(select(ExpenseCategory).order_by(ExpenseCategory.sort_order))
    categories = result.scalars().all()

    items = await parse_spending_text(
        text=data.text,
        date=data.date,
        input_currency=data.currency,
        huf_eur_rate=config.huf_eur_rate,
        categories=categories,
    )

    total = sum(i.amount for i in items)
    return SpendingParseResponse(items=items, total_eur=total)


# ─── Summaries ──────────────────────────────────────────────────────────────

def _week_start(date_str: str) -> str:
    """Get Monday of the week containing date_str."""
    d = datetime.strptime(date_str, "%Y-%m-%d").date()
    monday = d - timedelta(days=d.weekday())
    return monday.isoformat()


def _week_end(monday_str: str) -> str:
    d = datetime.strptime(monday_str, "%Y-%m-%d").date()
    return (d + timedelta(days=6)).isoformat()


@router.get("/summary/weekly", response_model=WeeklySummary)
async def get_weekly_summary(
    week_of: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    """Get spending summary for a specific week. Defaults to current week."""
    await _ensure_categories(db)

    if not week_of:
        week_of = datetime.now().strftime("%Y-%m-%d")

    monday = _week_start(week_of)
    sunday = _week_end(monday)

    # Get all expenses for this week
    result = await db.execute(
        select(Expense).where(Expense.date >= monday, Expense.date <= sunday)
    )
    week_expenses = result.scalars().all()

    # Get categories
    cat_result = await db.execute(select(ExpenseCategory).order_by(ExpenseCategory.sort_order))
    categories = {c.id: c for c in cat_result.scalars().all()}

    # Previous week
    prev_monday = (datetime.strptime(monday, "%Y-%m-%d").date() - timedelta(days=7)).isoformat()
    prev_sunday = (datetime.strptime(prev_monday, "%Y-%m-%d").date() + timedelta(days=6)).isoformat()
    result = await db.execute(
        select(Expense).where(Expense.date >= prev_monday, Expense.date <= prev_sunday)
    )
    prev_expenses = result.scalars().all()

    # 4-week rolling average (exclude current week)
    avg_start = (datetime.strptime(monday, "%Y-%m-%d").date() - timedelta(days=28)).isoformat()
    avg_end = (datetime.strptime(monday, "%Y-%m-%d").date() - timedelta(days=1)).isoformat()
    result = await db.execute(
        select(Expense).where(Expense.date >= avg_start, Expense.date <= avg_end)
    )
    avg_expenses = result.scalars().all()
    avg_weeks = 4.0

    # Build category summaries
    cat_summaries = []
    total_spent = sum(e.amount for e in week_expenses)
    prev_total = sum(e.amount for e in prev_expenses)
    avg_total = sum(e.amount for e in avg_expenses) / avg_weeks if avg_expenses else 0

    for cat_id, cat in categories.items():
        cat_spent = sum(e.amount for e in week_expenses if e.category_id == cat_id)
        cat_prev = sum(e.amount for e in prev_expenses if e.category_id == cat_id)
        cat_avg = sum(e.amount for e in avg_expenses if e.category_id == cat_id) / avg_weeks if avg_expenses else 0
        weekly_budget = (cat.monthly_budget / 4.33) if cat.monthly_budget else None

        # Trend
        if cat_avg == 0:
            trend = "steady"
            vs_avg = None
        else:
            pct_diff = ((cat_spent - cat_avg) / cat_avg) * 100
            vs_avg = round(pct_diff, 1)
            trend = "up" if pct_diff > 10 else "down" if pct_diff < -10 else "steady"

        cat_summaries.append(CategorySummary(
            category_id=cat_id,
            category_name=cat.name,
            emoji=cat.emoji,
            color=cat.color,
            spent=round(cat_spent, 2),
            budget=round(weekly_budget, 2) if weekly_budget else None,
            pct_of_budget=round((cat_spent / weekly_budget) * 100, 1) if weekly_budget and weekly_budget > 0 else None,
            vs_avg_pct=vs_avg,
            trend=trend,
        ))

    vs_last_week = round(((total_spent - prev_total) / prev_total) * 100, 1) if prev_total > 0 else None
    vs_avg = round(((total_spent - avg_total) / avg_total) * 100, 1) if avg_total > 0 else None

    return WeeklySummary(
        week_start=monday,
        week_end=sunday,
        total_spent=round(total_spent, 2),
        vs_last_week_pct=vs_last_week,
        vs_avg_pct=vs_avg,
        categories=[c for c in cat_summaries if c.spent > 0 or (c.budget and c.budget > 0)],
    )


@router.get("/summary/monthly", response_model=MonthlySummary)
async def get_monthly_summary(
    month: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    """Get monthly overview with weekly breakdowns. month format: YYYY-MM"""
    await _ensure_categories(db)

    if not month:
        month = datetime.now().strftime("%Y-%m")

    month_start = f"{month}-01"
    # Get last day of month
    year, mo = int(month[:4]), int(month[5:7])
    if mo == 12:
        next_month_start = f"{year + 1}-01-01"
    else:
        next_month_start = f"{year}-{mo + 1:02d}-01"
    month_end = (datetime.strptime(next_month_start, "%Y-%m-%d").date() - timedelta(days=1)).isoformat()

    # All expenses for the month
    result = await db.execute(
        select(Expense).where(Expense.date >= month_start, Expense.date <= month_end)
    )
    month_expenses = result.scalars().all()

    # Categories
    cat_result = await db.execute(select(ExpenseCategory).order_by(ExpenseCategory.sort_order))
    categories = {c.id: c for c in cat_result.scalars().all()}

    total_spent = sum(e.amount for e in month_expenses)
    total_budget = sum(c.monthly_budget for c in categories.values() if c.monthly_budget)

    # Monthly category summaries
    cat_summaries = []
    for cat_id, cat in categories.items():
        cat_spent = sum(e.amount for e in month_expenses if e.category_id == cat_id)
        if cat_spent == 0 and not cat.monthly_budget:
            continue
        cat_summaries.append(CategorySummary(
            category_id=cat_id,
            category_name=cat.name,
            emoji=cat.emoji,
            color=cat.color,
            spent=round(cat_spent, 2),
            budget=cat.monthly_budget if cat.monthly_budget else None,
            pct_of_budget=round((cat_spent / cat.monthly_budget) * 100, 1) if cat.monthly_budget and cat.monthly_budget > 0 else None,
            vs_avg_pct=None,
            trend="steady",
        ))

    # Weekly breakdowns
    weeks = []
    current = datetime.strptime(month_start, "%Y-%m-%d").date()
    # Start from first Monday on or before month_start
    current = current - timedelta(days=current.weekday())
    month_end_date = datetime.strptime(month_end, "%Y-%m-%d").date()

    while current <= month_end_date:
        w_start = current.isoformat()
        w_end = (current + timedelta(days=6)).isoformat()
        w_expenses = [e for e in month_expenses if w_start <= e.date <= w_end]
        w_total = sum(e.amount for e in w_expenses)

        w_cats = []
        for cat_id, cat in categories.items():
            cs = sum(e.amount for e in w_expenses if e.category_id == cat_id)
            if cs > 0:
                weekly_budget = (cat.monthly_budget / 4.33) if cat.monthly_budget else None
                w_cats.append(CategorySummary(
                    category_id=cat_id, category_name=cat.name,
                    emoji=cat.emoji, color=cat.color,
                    spent=round(cs, 2),
                    budget=round(weekly_budget, 2) if weekly_budget else None,
                    pct_of_budget=round((cs / weekly_budget) * 100, 1) if weekly_budget and weekly_budget > 0 else None,
                    vs_avg_pct=None, trend="steady",
                ))

        if w_total > 0:
            weeks.append(WeeklySummary(
                week_start=w_start, week_end=w_end,
                total_spent=round(w_total, 2),
                vs_last_week_pct=None, vs_avg_pct=None,
                categories=w_cats,
            ))

        current += timedelta(days=7)

    return MonthlySummary(
        month=month,
        total_spent=round(total_spent, 2),
        total_budget=total_budget if total_budget > 0 else None,
        weeks=weeks,
        categories=cat_summaries,
    )
