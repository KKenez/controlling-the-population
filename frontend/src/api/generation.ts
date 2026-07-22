import type { GeneratedWeek } from '../types/generation'
import { apiGet, apiPost } from './client'

interface GenerateRequest {
  routineIds: string[]
  weekStart: string
}

export interface AiStatus {
  ollama_reachable: boolean
  model: string
  model_ready: boolean
  available_models: string[]
}

export function getAiStatus(): Promise<AiStatus> {
  return apiGet('/api/generation/ai/status')
}

export function generateWeek(data: GenerateRequest): Promise<GeneratedWeek> {
  return apiPost('/api/generation', {
    routineIds: data.routineIds,
    weekStart: data.weekStart,
  })
}

export function getGeneratedWeek(weekId: string): Promise<GeneratedWeek> {
  return apiGet(`/api/generation/${weekId}`)
}

export function confirmWeek(weekId: string): Promise<{ message: string }> {
  return apiPost(`/api/generation/${weekId}/confirm`, {})
}
