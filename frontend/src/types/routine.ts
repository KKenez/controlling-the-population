// Routine types

export type LifeArea = 'fitness' | 'work' | 'personal' | 'social' | 'learning' | 'health'

export type PriorityLevel = 'critical' | 'high' | 'medium' | 'low' | 'flexible'

export interface TimeConstraint {
  earliestStart?: string // HH:MM
  latestEnd?: string     // HH:MM
  preferredDays?: number[] // 0=Mon, 6=Sun
  excludeDays?: number[]
}

export interface Routine {
  id: string
  name: string
  lifeArea: LifeArea
  description: string
  priority: PriorityLevel
  frequencyPerWeek: number
  durationMinutes: number
  constraints: TimeConstraint
  parameters: Record<string, unknown> // flexible AI params
}
