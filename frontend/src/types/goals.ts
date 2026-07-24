export type ItemStatus = 'backlog' | 'active' | 'paused' | 'completed'

export interface Goal {
  id: string
  name: string
  description: string
  lifeAreaId: string
  status: ItemStatus
  createdAt: string
  routineCount: number
}

export interface Quest {
  id: string
  name: string
  description: string
  lifeAreaId: string
  status: ItemStatus
  doneWhen: string
  estimatedSessions: number
  durationMinutes: number
  createdAt: string
  completedAt: string | null
}

export interface Note {
  id: string
  text: string
  dueHint: string | null
  resolved: boolean
  linkedEventId: string | null
  createdAt: string
}
