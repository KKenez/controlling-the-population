// Week generation types

import type { CalendarEvent } from './event'

export type GenerationStatus = 'idle' | 'selecting' | 'chatting' | 'generating' | 'reviewing' | 'confirmed'

export interface ProposedEvent extends CalendarEvent {
  routineId: string
  editable: boolean
}

export interface GeneratedWeek {
  id: string
  weekStart: string // ISO date (Monday)
  status: GenerationStatus
  events: ProposedEvent[]
  createdAt: string
}
