import { apiGet, apiPost } from './client'

export interface EventReviewData {
  eventId: string
  eventTitle: string
  status: 'completed' | 'skipped' | 'partial' | 'dismissed'
  feedback: string
  actualDurationMinutes: number | null
}

export interface DailyReviewData {
  date: string
  overallNotes: string
  eventReviews: EventReviewData[]
}

export interface DailyReview {
  id: string
  date: string
  overallNotes: string
  completedAt: string
  eventReviews: {
    id: string
    eventId: string
    eventTitle: string
    status: string
    feedback: string
    actualDurationMinutes: number | null
  }[]
}

export function getReviews(limit?: number): Promise<DailyReview[]> {
  const qs = limit ? `?limit=${limit}` : ''
  return apiGet(`/api/reviews${qs}`)
}

export function getReviewByDate(date: string): Promise<DailyReview> {
  return apiGet(`/api/reviews/${date}`)
}

export function createReview(data: DailyReviewData): Promise<DailyReview> {
  return apiPost('/api/reviews', data)
}
