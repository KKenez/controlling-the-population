import type { Quest } from '../types/goals'
import { apiGet, apiPost, apiPatch, apiDelete } from './client'

export function getQuests(status?: string): Promise<Quest[]> {
  const qs = status ? `?status=${status}` : ''
  return apiGet(`/api/quests${qs}`)
}

export function createQuest(data: Omit<Quest, 'id' | 'createdAt' | 'completedAt'>): Promise<Quest> {
  return apiPost('/api/quests', data)
}

export function updateQuest(id: string, data: Partial<Omit<Quest, 'id' | 'createdAt' | 'completedAt'>>): Promise<Quest> {
  return apiPatch(`/api/quests/${id}`, data)
}

export function deleteQuest(id: string): Promise<void> {
  return apiDelete(`/api/quests/${id}`)
}
