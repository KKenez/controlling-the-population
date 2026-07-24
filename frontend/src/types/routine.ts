// Routine types

export type PriorityLevel = 'critical' | 'high' | 'medium' | 'low' | 'flexible'

export interface LifeArea {
  id: string
  name: string
  color: string
  icon: string
  description: string
  routineCount: number
}

export interface TimeConstraint {
  earliestStart?: string // HH:MM
  latestEnd?: string     // HH:MM
  preferredDays?: number[] // 0=Mon, 6=Sun
  excludeDays?: number[]
}

export interface Routine {
  id: string
  name: string
  lifeAreaId: string
  goalId: string | null
  description: string
  priority: PriorityLevel
  frequencyPerWeek: number
  durationMinutes: number
  constraints: TimeConstraint
  parameters: Record<string, unknown> // flexible AI params
}
