import { apiGet, apiPatch } from './client'

export interface SchedulerConfig {
  enabled: boolean
  intervalMinutes: number
  quietStart: string
  quietEnd: string
  autoConfirm: boolean
  lastRun: string | null
}

export interface GenerationLog {
  id: string
  triggeredAt: string
  triggerReason: string
  eventsProposed: number
  weekId: string | null
  success: boolean
  errorMessage: string
}

export function getSchedulerConfig(): Promise<SchedulerConfig> {
  return apiGet('/api/scheduler/config')
}

export function updateSchedulerConfig(data: Partial<SchedulerConfig>): Promise<SchedulerConfig> {
  return apiPatch('/api/scheduler/config', data)
}

export function getGenerationLogs(limit?: number): Promise<GenerationLog[]> {
  const qs = limit ? `?limit=${limit}` : ''
  return apiGet(`/api/scheduler/logs${qs}`)
}
