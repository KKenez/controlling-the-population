import type { CalendarEvent } from '../../types/event'
import { getMonthDays, isSameDay, isToday } from '../../utils/dates'
import EventCard from './EventCard'

interface MonthViewProps {
  currentDate: Date
  events: CalendarEvent[]
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function MonthView({ currentDate, events }: MonthViewProps) {
  const days = getMonthDays(currentDate)
  const currentMonth = currentDate.getMonth()

  function eventsForDay(date: Date) {
    return events.filter((e) => {
      const start = new Date(e.start)
      const end = new Date(e.end)
      const dayStart = new Date(date)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(date)
      dayEnd.setHours(23, 59, 59, 999)
      return start <= dayEnd && end >= dayStart
    })
  }

  return (
    <div className="flex-1 border border-kimbie-border rounded-md bg-kimbie-surface overflow-hidden">
      {/* Day name headers */}
      <div className="grid grid-cols-7 border-b border-kimbie-border">
        {DAY_NAMES.map((name) => (
          <div
            key={name}
            className="px-2 py-2 text-xs font-medium text-kimbie-muted text-center bg-kimbie-panel"
          >
            {name}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 auto-rows-fr" style={{ minHeight: 'calc(100vh - 200px)' }}>
        {days.map((day) => {
          const dayEvents = eventsForDay(day)
          const isCurrentMonth = day.getMonth() === currentMonth
          const today = isToday(day)

          return (
            <div
              key={day.toISOString()}
              className={`border-b border-r border-kimbie-border/50 p-1 min-h-[100px] ${
                !isCurrentMonth ? 'opacity-40' : ''
              } ${today ? 'bg-kimbie-accent/5' : ''}`}
            >
              <div
                className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                  today
                    ? 'bg-kimbie-accent text-kimbie-bg'
                    : 'text-kimbie-muted'
                }`}
              >
                {day.getDate()}
              </div>
              <div className="space-y-0.5">
                {dayEvents.slice(0, 3).map((e) => (
                  <EventCard key={e.id} event={e} compact />
                ))}
                {dayEvents.length > 3 && (
                  <p className="text-[10px] text-kimbie-muted px-1">
                    +{dayEvents.length - 3} more
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
