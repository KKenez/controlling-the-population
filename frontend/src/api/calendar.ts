import type { CalendarEvent } from '../types/event'
import { apiGet, apiPost, apiPut, apiDelete } from './client'

interface GetEventsParams {
  start?: string
  end?: string
  source?: string
}

export function getEvents(params?: GetEventsParams): Promise<CalendarEvent[]> {
  const query = new URLSearchParams()
  if (params?.start) query.set('start', params.start)
  if (params?.end) query.set('end', params.end)
  if (params?.source) query.set('source', params.source)
  const qs = query.toString()
  return apiGet(`/api/events${qs ? `?${qs}` : ''}`)
}

export function syncCalendars(): Promise<{ message: string }> {
  return apiPost('/api/events/sync', {})
}

export interface CreateEventPayload {
  title: string
  start: string
  end: string
  source: string
  location?: string
  notes?: string
}

export function createEvent(payload: CreateEventPayload): Promise<CalendarEvent> {
  return apiPost('/api/events', payload)
}

export function updateEvent(id: string, payload: CreateEventPayload): Promise<CalendarEvent> {
  return apiPut(`/api/events/${id}`, payload)
}

export function deleteEvent(id: string): Promise<void> {
  return apiDelete(`/api/events/${id}`)
}
