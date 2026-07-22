// Week generation types

export type GenerationStatus = 'idle' | 'selecting' | 'chatting' | 'generating' | 'reviewing' | 'confirmed'

export interface ProposedEvent {
  id: string
  routineId: string
  title: string
  start: string
  end: string
  editable: boolean
}

export interface GeneratedWeek {
  id: string
  weekStart: string // ISO date (Monday)
  status: GenerationStatus
  events: ProposedEvent[]
  createdAt: string
}
