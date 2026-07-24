import type { Note } from '../types/goals'
import { apiGet, apiPost, apiPatch, apiDelete } from './client'

export function getNotes(resolved?: boolean): Promise<Note[]> {
  const qs = resolved !== undefined ? `?resolved=${resolved}` : ''
  return apiGet(`/api/notes${qs}`)
}

export function createNote(data: { text: string; dueHint?: string }): Promise<Note> {
  return apiPost('/api/notes', data)
}

export function updateNote(id: string, data: Partial<{ text: string; dueHint: string; resolved: boolean }>): Promise<Note> {
  return apiPatch(`/api/notes/${id}`, data)
}

export function deleteNote(id: string): Promise<void> {
  return apiDelete(`/api/notes/${id}`)
}
