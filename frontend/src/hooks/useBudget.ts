import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchBudgetConfig, updateBudgetConfig,
  fetchCategories, createCategory, updateCategory,
  fetchExpenses, createExpenses, deleteExpense,
  parseSpending,
  fetchWeeklySummary, fetchMonthlySummary,
} from '../api/budget'

export function useBudgetConfig() {
  return useQuery({ queryKey: ['budgetConfig'], queryFn: fetchBudgetConfig })
}

export function useUpdateBudgetConfig() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: updateBudgetConfig,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budgetConfig'] }),
  })
}

export function useCategories() {
  return useQuery({ queryKey: ['budgetCategories'], queryFn: fetchCategories })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budgetCategories'] }),
  })
}

export function useUpdateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<{ name: string; emoji: string; color: string; monthlyBudget: number }>) =>
      updateCategory(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budgetCategories'] }),
  })
}

export function useExpenses(params?: { dateFrom?: string; dateTo?: string; categoryId?: string }) {
  return useQuery({
    queryKey: ['expenses', params],
    queryFn: () => fetchExpenses(params),
  })
}

export function useCreateExpenses() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createExpenses,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] })
      qc.invalidateQueries({ queryKey: ['weeklySummary'] })
      qc.invalidateQueries({ queryKey: ['monthlySummary'] })
    },
  })
}

export function useDeleteExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] })
      qc.invalidateQueries({ queryKey: ['weeklySummary'] })
      qc.invalidateQueries({ queryKey: ['monthlySummary'] })
    },
  })
}

export function useParseSpending() {
  return useMutation({
    mutationFn: parseSpending,
  })
}

export function useWeeklySummary(weekOf?: string) {
  return useQuery({
    queryKey: ['weeklySummary', weekOf],
    queryFn: () => fetchWeeklySummary(weekOf),
  })
}

export function useMonthlySummary(month?: string) {
  return useQuery({
    queryKey: ['monthlySummary', month],
    queryFn: () => fetchMonthlySummary(month),
  })
}
