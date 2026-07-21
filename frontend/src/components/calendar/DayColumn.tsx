import type { CalendarEvent } from '../../types/event'
import { isToday } from '../../utils/dates'
import EventCard from './EventCard'

interface DayColumnProps {
  date: Date
  events: CalendarEvent[] // expects only timed events (all-day handled by WeekView)
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)

export default function DayColumn({ date, events }: DayColumnProps) {
  const today = isToday(date)

  // Sort events by start time
  const sorted = [...events].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  )

  return (
    <div className={`flex-1 min-w-0 border-r border-kimbie-border/50 ${today ? 'bg-kimbie-accent/5' : ''}`}>
      {/* Time grid */}
      <div className="relative">
        {HOURS.map((hour) => (
          <div
            key={hour}
            className="h-12 border-b border-kimbie-border/30"
          />
        ))}

        {/* Positioned timed events */}
        {sorted.map((event) => {
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
