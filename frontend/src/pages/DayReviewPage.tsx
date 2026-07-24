import { useState, useMemo } from 'react'
import { useEvents } from '../hooks/useEvents'
import { useCreateReview, useReviews } from '../hooks/useReviews'
import { useBudgetConfig, useCategories, useParseSpending, useCreateExpenses } from '../hooks/useBudget'
import type { EventReviewData } from '../api/reviews'
import type { CalendarEvent } from '../types/event'
import type { ParsedExpenseItem } from '../types/budget'

type ReviewStatus = 'completed' | 'skipped' | 'partial' | 'dismissed'

interface EventReviewState {
  eventId: string
  eventTitle: string
  status: ReviewStatus | null
  feedback: string
  actualDurationMinutes: number | null
}

export default function DayReviewPage() {
  const today = new Date().toISOString().split('T')[0]
  const [reviewDate, setReviewDate] = useState(today)
  const [overallNotes, setOverallNotes] = useState('')
  const [eventStates, setEventStates] = useState<EventReviewState[]>([])
  const [step, setStep] = useState<'select' | 'review' | 'done'>('select')

  // Spending state
  const [spendingText, setSpendingText] = useState('')
  const [parsedItems, setParsedItems] = useState<ParsedExpenseItem[] | null>(null)
  const [spendingSaved, setSpendingSaved] = useState(false)

  const { data: events } = useEvents()
  const { data: existingReviews } = useReviews()
  const createMutation = useCreateReview()
  const { data: budgetConfig } = useBudgetConfig()
  const { data: categories } = useCategories()
  const parseMutation = useParseSpending()
  const confirmExpenses = useCreateExpenses()

  // Filter events for the selected date
  const dayEvents = useMemo(() => {
    if (!events) return []
    return events.filter((e: CalendarEvent) => e.start.startsWith(reviewDate))
  }, [events, reviewDate])

  // Check if review already exists for this date
  const alreadyReviewed = existingReviews?.some((r) => r.date === reviewDate)

  const startReview = () => {
    setEventStates(
      dayEvents.map((e: CalendarEvent) => ({
        eventId: e.id,
        eventTitle: e.title,
        status: null,
        feedback: '',
        actualDurationMinutes: null,
      }))
    )
    setStep('review')
  }

  const setStatus = (index: number, status: ReviewStatus) => {
    setEventStates((prev) => {
      const copy = [...prev]
      copy[index] = { ...copy[index], status }
      return copy
    })
  }

  const setFeedback = (index: number, feedback: string) => {
    setEventStates((prev) => {
      const copy = [...prev]
      copy[index] = { ...copy[index], feedback }
      return copy
    })
  }

  const handleSubmit = () => {
    const eventReviews: EventReviewData[] = eventStates
      .filter((es) => es.status !== null)
      .map((es) => ({
        eventId: es.eventId,
        eventTitle: es.eventTitle,
        status: es.status!,
        feedback: es.feedback,
        actualDurationMinutes: es.actualDurationMinutes,
      }))

    createMutation.mutate(
      { date: reviewDate, overallNotes, eventReviews },
      { onSuccess: () => setStep('done') }
    )
  }

  const allReviewed = eventStates.every((es) => es.status !== null)

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-kimbie-heading mb-2">Day Review</h1>
      <p className="text-sm text-kimbie-muted mb-6">
        Reflect on your day. Mark events as completed or skipped, and leave feedback for the AI.
      </p>

      {step === 'done' && (
        <div className="bg-kimbie-green/10 border border-kimbie-green/30 rounded-lg p-4 mb-6">
          <p className="text-sm text-kimbie-green font-medium">Review saved!</p>
          <p className="text-xs text-kimbie-muted mt-1">Your feedback will improve future schedule generation.</p>
          <button
            onClick={() => { setStep('select'); setOverallNotes(''); setEventStates([]) }}
            className="mt-3 text-xs text-kimbie-accent hover:underline"
          >
            Review another day
          </button>
        </div>
      )}

      {step === 'select' && (
        <>
          {/* Date Picker */}
          <div className="mb-6 flex items-center gap-3">
            <label className="text-sm text-kimbie-text">Date:</label>
            <input
              type="date"
              value={reviewDate}
              onChange={(e) => setReviewDate(e.target.value)}
              max={today}
              className="px-3 py-1.5 bg-kimbie-bg border border-kimbie-border rounded-md text-sm text-kimbie-text"
            />
            {alreadyReviewed && (
              <span className="text-xs text-kimbie-yellow">Already reviewed</span>
            )}
          </div>

          {dayEvents.length === 0 ? (
            <p className="text-sm text-kimbie-muted">No events found for this date.</p>
          ) : (
            <>
              <p className="text-sm text-kimbie-muted mb-3">
                {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''} scheduled for this day:
              </p>
              <div className="space-y-2 mb-4">
                {dayEvents.map((e: CalendarEvent) => (
                  <div key={e.id} className="bg-kimbie-surface border border-kimbie-border rounded-md p-3">
                    <p className="text-sm text-kimbie-text font-medium">{e.title}</p>
                    <p className="text-xs text-kimbie-muted">
                      {new Date(e.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {' — '}
                      {new Date(e.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))}
              </div>
              <button
                onClick={startReview}
                disabled={alreadyReviewed}
                className="px-4 py-2 bg-kimbie-accent text-kimbie-bg rounded-md text-sm font-medium hover:brightness-110 disabled:opacity-50"
              >
                {alreadyReviewed ? 'Already Reviewed' : 'Start Review'}
              </button>
            </>
          )}
        </>
      )}

      {step === 'review' && (
        <>
          <div className="space-y-4 mb-6">
            {eventStates.map((es, i) => (
              <div key={es.eventId} className="bg-kimbie-surface border border-kimbie-border rounded-lg p-4">
                <p className="text-sm font-medium text-kimbie-text mb-3">{es.eventTitle}</p>

                {/* Status Buttons */}
                <div className="flex gap-2 mb-3">
                  {(['completed', 'partial', 'skipped', 'dismissed'] as ReviewStatus[]).map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatus(i, status)}
                      className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                        es.status === status
                          ? status === 'completed'
                            ? 'bg-kimbie-green/20 border-kimbie-green text-kimbie-green'
                            : status === 'partial'
                            ? 'bg-kimbie-yellow/20 border-kimbie-yellow text-kimbie-yellow'
                            : status === 'skipped'
                            ? 'bg-kimbie-red/20 border-kimbie-red text-kimbie-red'
                            : 'bg-kimbie-muted/20 border-kimbie-muted text-kimbie-muted'
                          : 'border-kimbie-border text-kimbie-muted hover:text-kimbie-text'
                      }`}
                    >
                      {status === 'completed' && '✓ '}
                      {status === 'skipped' && '✗ '}
                      {status === 'partial' && '◐ '}
                      {status === 'dismissed' && '— '}
                      {status}
                    </button>
                  ))}
                </div>

                {/* Feedback */}
                <textarea
                  value={es.feedback}
                  onChange={(e) => setFeedback(i, e.target.value)}
                  placeholder="How did it go? (timing, what you learned, anything to adjust...)"
                  rows={2}
                  className="w-full px-3 py-2 bg-kimbie-bg border border-kimbie-border rounded-md text-xs text-kimbie-text placeholder-kimbie-muted focus:outline-none focus:ring-1 focus:ring-kimbie-accent"
                />
              </div>
            ))}
          </div>

          {/* Spending Input */}
          <div className="bg-kimbie-surface border border-kimbie-border rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-kimbie-text mb-3">💰 What did you spend today?</h3>
            {spendingSaved ? (
              <p className="text-xs text-kimbie-green">✓ Spending logged!</p>
            ) : (
              <>
                <textarea
                  value={spendingText}
                  onChange={(e) => setSpendingText(e.target.value)}
                  placeholder="e.g. Spar 42, lunch 15, Bolt 8, Netflix 12.99"
                  rows={2}
                  className="w-full px-3 py-2 bg-kimbie-bg border border-kimbie-border rounded-md text-xs text-kimbie-text placeholder-kimbie-muted focus:outline-none focus:ring-1 focus:ring-kimbie-accent mb-2"
                />
                {!parsedItems && (
                  <button
                    onClick={() => {
                      if (!spendingText.trim()) return
                      parseMutation.mutate(
                        { text: spendingText, date: reviewDate, currency: budgetConfig?.currency || 'EUR' },
                        { onSuccess: (data) => setParsedItems(data.items) }
                      )
                    }}
                    disabled={!spendingText.trim() || parseMutation.isPending}
                    className="px-3 py-1.5 bg-kimbie-accent text-kimbie-bg rounded-md text-xs font-medium hover:brightness-110 disabled:opacity-50"
                  >
                    {parseMutation.isPending ? 'Parsing...' : 'Parse'}
                  </button>
                )}
                {parsedItems && (
                  <div className="space-y-1 mb-2">
                    {parsedItems.map((item, i) => {
                      const cat = categories?.find((c) => c.name === item.categoryName)
                      return (
                        <div key={i} className="flex items-center justify-between text-xs bg-kimbie-bg rounded px-2 py-1">
                          <span>{cat?.emoji || '💰'} {item.description} <span className="text-kimbie-muted">({item.categoryName})</span></span>
                          <span className="font-medium">€{item.amount.toFixed(2)}</span>
                        </div>
                      )
                    })}
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => {
                          if (!categories) return
                          const items = parsedItems.map((item) => {
                            const cat = categories.find((c) => c.name === item.categoryName)
                            return { amount: item.amount, categoryId: cat?.id || categories[categories.length - 1].id, description: item.description, rawText: item.originalText }
                          })
                          confirmExpenses.mutate({ date: reviewDate, items }, { onSuccess: () => { setSpendingSaved(true); setParsedItems(null) } })
                        }}
                        disabled={confirmExpenses.isPending}
                        className="px-3 py-1 bg-kimbie-green text-kimbie-bg rounded text-xs font-medium hover:brightness-110 disabled:opacity-50"
                      >
                        ✓ Confirm
                      </button>
                      <button
                        onClick={() => setParsedItems(null)}
                        className="px-3 py-1 text-xs text-kimbie-muted hover:text-kimbie-text"
                      >
                        Redo
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Overall Notes */}
          <div className="mb-6">
            <label className="block text-sm text-kimbie-text mb-1">Overall notes (optional)</label>
            <textarea
              value={overallNotes}
              onChange={(e) => setOverallNotes(e.target.value)}
              placeholder="How was your day overall? Any patterns you noticed?"
              rows={3}
              className="w-full px-3 py-2 bg-kimbie-bg border border-kimbie-border rounded-md text-sm text-kimbie-text placeholder-kimbie-muted focus:outline-none focus:ring-1 focus:ring-kimbie-accent"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={!allReviewed || createMutation.isPending}
              className="px-4 py-2 bg-kimbie-accent text-kimbie-bg rounded-md text-sm font-medium hover:brightness-110 disabled:opacity-50"
            >
              {createMutation.isPending ? 'Saving...' : 'Submit Review'}
            </button>
            <button
              onClick={() => setStep('select')}
              className="px-4 py-2 bg-kimbie-panel text-kimbie-muted rounded-md text-sm font-medium hover:text-kimbie-text"
            >
              Cancel
            </button>
            {!allReviewed && (
              <span className="text-xs text-kimbie-muted self-center">
                Mark all events before submitting
              </span>
            )}
          </div>
        </>
      )}

      {/* Recent Reviews History */}
      {step === 'select' && existingReviews && existingReviews.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-medium text-kimbie-muted uppercase tracking-wider mb-3">
            Recent Reviews
          </h2>
          <div className="space-y-2">
            {existingReviews.slice(0, 7).map((review) => {
              const completed = review.eventReviews.filter((er) => er.status === 'completed').length
              const total = review.eventReviews.length
              return (
                <div key={review.id} className="bg-kimbie-surface border border-kimbie-border rounded-md p-3 flex items-center justify-between">
                  <span className="text-sm text-kimbie-text">{review.date}</span>
                  <span className="text-xs text-kimbie-muted">
                    {completed}/{total} completed
                  </span>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
