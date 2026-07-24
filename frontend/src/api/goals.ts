import type { Goal } from '../types/goals'
import { apiGet, apiPost, apiPatch, apiDelete } from './client'

export function getGoals(status?: string): Promise<Goal[]> {
  const qs = status ? `?status=${status}` : ''
  return apiGet(`/api/goals${qs}`)
}

export function createGoal(data: Omit<Goal, 'id' | 'createdAt' | 'routineCount'>): Promise<Goal> {
  return apiPost('/api/goals', data)
}

export function updateGoal(id: string, data: Partial<Omit<Goal, 'id' | 'createdAt' | 'routineCount'>>): Promise<Goal> {
  return apiPatch(`/api/goals/${id}`, data)
}

export function deleteGoal(id: string): Promise<void> {
  return apiDelete(`/api/goals/${id}`)
}
