import { apiGet, apiPost, apiPatch, apiDelete } from './client'
import type {
  ExpenseCategory,
  Expense,
  SpendingParseResponse,
  WeeklySummary,
  MonthlySummary,
  BudgetConfig,
} from '../types/budget'

// Config
export const fetchBudgetConfig = () => apiGet<BudgetConfig>('/api/budget/config')
export const updateBudgetConfig = (data: Partial<BudgetConfig>) =>
  apiPatch<BudgetConfig>('/api/budget/config', data)

// Categories
export const fetchCategories = () => apiGet<ExpenseCategory[]>('/api/budget/categories')
export const createCategory = (data: { name: string; emoji?: string; color?: string; monthlyBudget?: number }) =>
  apiPost<ExpenseCategory>('/api/budget/categories', data)
export const updateCategory = (id: string, data: Partial<ExpenseCategory>) =>
  apiPatch<ExpenseCategory>(`/api/budget/categories/${id}`, data)

// Expenses
export const fetchExpenses = (params?: { dateFrom?: string; dateTo?: string; categoryId?: string }) => {
  const qs = new URLSearchParams()
  if (params?.dateFrom) qs.set('date_from', params.dateFrom)
  if (params?.dateTo) qs.set('date_to', params.dateTo)
  if (params?.categoryId) qs.set('category_id', params.categoryId)
  const q = qs.toString()
  return apiGet<Expense[]>(`/api/budget/expenses${q ? '?' + q : ''}`)
}
export const createExpenses = (data: { date: string; items: Array<{ amount: number; categoryId: string; description: string; rawText?: string }> }) =>
  apiPost<Expense[]>('/api/budget/expenses', data)
export const deleteExpense = (id: string) => apiDelete(`/api/budget/expenses/${id}`)

// AI Parse
export const parseSpending = (data: { text: string; date: string; currency: string }) =>
  apiPost<SpendingParseResponse>('/api/budget/parse', data)

// Summaries
export const fetchWeeklySummary = (weekOf?: string) =>
  apiGet<WeeklySummary>(`/api/budget/summary/weekly${weekOf ? '?week_of=' + weekOf : ''}`)
export const fetchMonthlySummary = (month?: string) =>
  apiGet<MonthlySummary>(`/api/budget/summary/monthly${month ? '?month=' + month : ''}`)
