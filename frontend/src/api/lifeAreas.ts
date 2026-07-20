import type { LifeArea } from '../types/routine'
import { apiGet, apiPost, apiPatch, apiDelete } from './client'

export function getLifeAreas(): Promise<LifeArea[]> {
  return apiGet('/api/life-areas')
}

export function getLifeArea(id: string): Promise<LifeArea> {
  return apiGet(`/api/life-areas/${id}`)
}

export function createLifeArea(data: Omit<LifeArea, 'id' | 'routineCount'>): Promise<LifeArea> {
  return apiPost('/api/life-areas', data)
}

export function updateLifeArea(id: string, data: Partial<Omit<LifeArea, 'id' | 'routineCount'>>): Promise<LifeArea> {
  return apiPatch(`/api/life-areas/${id}`, data)
}

export function deleteLifeArea(id: string): Promise<void> {
  return apiDelete(`/api/life-areas/${id}`)
}
