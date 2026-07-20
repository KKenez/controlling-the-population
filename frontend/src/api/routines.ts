import type { Routine } from '../types/routine'
import { apiGet, apiPost, apiPatch, apiDelete } from './client'

export function getRoutines(lifeAreaId?: string): Promise<Routine[]> {
  const qs = lifeAreaId ? `?lifeAreaId=${lifeAreaId}` : ''
  return apiGet(`/api/routines${qs}`)
}

export function getRoutine(id: string): Promise<Routine> {
  return apiGet(`/api/routines/${id}`)
}

export function createRoutine(data: Omit<Routine, 'id'>): Promise<Routine> {
  return apiPost('/api/routines', data)
}

export function updateRoutine(id: string, data: Partial<Omit<Routine, 'id'>>): Promise<Routine> {
  return apiPatch(`/api/routines/${id}`, data)
}

export function deleteRoutine(id: string): Promise<void> {
  return apiDelete(`/api/routines/${id}`)
}
