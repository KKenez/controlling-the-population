import type { CalendarEvent } from '../../types/event'
import { formatDayHeader, isToday, isSameDay } from '../../utils/dates'
import EventCard from './EventCard'

interface DayColumnProps {
  date: Date
  events: CalendarEvent[]
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)

export default function DayColumn({ date, events }: DayColumnProps) {
  const today = isToday(date)

  // Sort events by start time
  const sorted = [...events].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  )

  // Separate all-day events from timed events
  const allDayEvents = sorted.filter((e) => {
    const start = new Date(e.start)
    const end = new Date(e.end)
    return end.getTime() - start.getTime() >= 86400000 || (start.getHours() === 0 && end.getHours() === 0)
  })

  const timedEvents = sorted.filter((e) => !allDayEvents.includes(e))

  return (
    <div className="flex-1 min-w-0">
      {/* Day header */}
      <div
        className={`sticky top-0 z-10 px-2 py-2 text-center text-xs font-medium border-b border-kimbie-border ${
          today ? 'bg-kimbie-accent/10 text-kimbie-accent' : 'bg-kimbie-panel text-kimbie-muted'
        }`}
      >
        {formatDayHeader(date)}
      </div>

      {/* All-day events */}
      {allDayEvents.length > 0 && (
        <div className="px-1 py-1 border-b border-kimbie-border bg-kimbie-surface/50">
          {allDayEvents.map((e) => (
            <EventCard key={e.id} event={e} compact />
          ))}
        </div>
      )}

      {/* Time grid */}
      <div className="relative">
        {HOURS.map((hour) => (
          <div
            key={hour}
            className="h-12 border-b border-kimbie-border/30"
          />
        ))}

        {/* Positioned timed events */}
        {timedEvents.map((event) => {
          const start = new Date(event.start)
          const end = new Date(event.end)
          const topMinutes = start.getHours() * 60 + start.getMinutes()
          const durationMinutes = (end.getTime() - start.getTime()) / 60000
          const top = (topMinutes / 60) * 48 // 48px per hour (h-12 = 3rem = 48px)
          const height = Math.max((durationMinutes / 60) * 48, 20)

          return (
            <div
              key={event.id}
              className="absolute left-1 right-1"
              style={{ top: `${top}px`, height: `${height}px` }}
            >
              <EventCard event={event} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
