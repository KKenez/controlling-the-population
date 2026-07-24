export interface ExpenseCategory {
  id: string
  name: string
  emoji: string
  color: string
  monthlyBudget: number | null
  sortOrder: number
}

export interface Expense {
  id: string
  amount: number
  categoryId: string
  description: string
  date: string
  rawText: string
  createdAt: string
}

export interface ParsedExpenseItem {
  amount: number
  categoryName: string
  description: string
  originalText: string
}

export interface SpendingParseResponse {
  items: ParsedExpenseItem[]
  totalEur: number
}

export interface CategorySummary {
  categoryId: string
  categoryName: string
  emoji: string
  color: string
  spent: number
  budget: number | null
  pctOfBudget: number | null
  vsAvgPct: number | null
  trend: 'up' | 'down' | 'steady'
}

export interface WeeklySummary {
  weekStart: string
  weekEnd: string
  totalSpent: number
  vsLastWeekPct: number | null
  vsAvgPct: number | null
  categories: CategorySummary[]
  aiRecap: string | null
}

export interface MonthlySummary {
  month: string
  totalSpent: number
  totalBudget: number | null
  weeks: WeeklySummary[]
  categories: CategorySummary[]
}

export interface BudgetConfig {
  currency: string
  hufEurRate: number
  rolloverEnabled: boolean
}
