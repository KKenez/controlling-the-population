from app.schemas.base import CamelModel


# --- Category ---

class CategoryCreate(CamelModel):
    name: str
    emoji: str = "💰"
    color: str = "#a855f7"
    monthly_budget: float | None = None
    sort_order: int = 0


class CategoryUpdate(CamelModel):
    name: str | None = None
    emoji: str | None = None
    color: str | None = None
    monthly_budget: float | None = None
    sort_order: int | None = None


class CategoryRead(CamelModel):
    id: str
    name: str
    emoji: str
    color: str
    monthly_budget: float | None
    sort_order: int


# --- Expense ---

class ExpenseCreate(CamelModel):
    amount: float
    category_id: str
    description: str = ""
    date: str  # YYYY-MM-DD
    raw_text: str = ""


class ExpenseRead(CamelModel):
    id: str
    amount: float
    category_id: str
    description: str
    date: str
    raw_text: str
    created_at: str


# --- AI Parsing ---

class SpendingParseRequest(CamelModel):
    text: str
    date: str  # YYYY-MM-DD
    currency: str = "EUR"  # Currency the user typed amounts in


class ParsedExpenseItem(CamelModel):
    amount: float  # In EUR
    category_name: str
    description: str
    original_text: str


class SpendingParseResponse(CamelModel):
    items: list[ParsedExpenseItem]
    total_eur: float


class SpendingConfirmRequest(CamelModel):
    date: str
    items: list[ExpenseCreate]


# --- Budget Config ---

class BudgetConfigRead(CamelModel):
    currency: str
    huf_eur_rate: float
    rollover_enabled: bool


class BudgetConfigUpdate(CamelModel):
    currency: str | None = None
    huf_eur_rate: float | None = None
    rollover_enabled: bool | None = None


# --- Weekly Summary ---

class CategorySummary(CamelModel):
    category_id: str
    category_name: str
    emoji: str
    color: str
    spent: float
    budget: float | None
    pct_of_budget: float | None  # 0-100+
    vs_avg_pct: float | None  # e.g. +23 means 23% more than average
    trend: str  # "up" | "down" | "steady"


class WeeklySummary(CamelModel):
    week_start: str
    week_end: str
    total_spent: float
    vs_last_week_pct: float | None
    vs_avg_pct: float | None
    categories: list[CategorySummary]
    ai_recap: str | None = None


class MonthlySummary(CamelModel):
    month: str  # YYYY-MM
    total_spent: float
    total_budget: float | None
    weeks: list[WeeklySummary]
    categories: list[CategorySummary]
