// Calendar event types

export type CalendarSource = 'work1' | 'work2' | 'personal' | 'generated'

export interface CalendarEvent {
  id: string
  title: string
  start: string // ISO datetime
  end: string
  source: CalendarSource
  location?: string
  notes?: string
}

export interface RecurringEvent extends CalendarEvent {
  recurrenceRule: string // RRULE string
}
