import type { CalendarEvent } from '../../types/event'
import { getWeekDays, formatDayHeader, isToday } from '../../utils/dates'
import DayColumn from './DayColumn'
import EventCard from './EventCard'

interface WeekViewProps {
  currentDate: Date
  events: CalendarEvent[]
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)

function isAllDay(event: CalendarEvent): boolean {
  const start = new Date(event.start)
  const end = new Date(event.end)
  return end.getTime() - start.getTime() >= 86400000 || (start.getHours() === 0 && end.getHours() === 0 && end.getDate() !== start.getDate())
}

export default function WeekView({ currentDate, events }: WeekViewProps) {
  const days = getWeekDays(currentDate)

  const allDayEvents = events.filter(isAllDay)
  const timedEvents = events.filter((e) => !isAllDay(e))

  function allDayForDay(date: Date) {
    return allDayEvents.filter((e) => {
      const start = new Date(e.start)
      const end = new Date(e.end)
      const dayStart = new Date(date)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(date)
      dayEnd.setHours(23, 59, 59, 999)
      return start <= dayEnd && end >= dayStart
    })
  }

  function timedForDay(date: Date) {
    return timedEvents.filter((e) => {
      const start = new Date(e.start)
      const end = new Date(e.end)
      const dayStart = new Date(date)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(date)
      dayEnd.setHours(23, 59, 59, 999)
      return start <= dayEnd && end >= dayStart
    })
  }

  const hasAllDay = days.some((d) => allDayForDay(d).length > 0)

  return (
    <div className="flex-1 border border-kimbie-border rounded-md bg-kimbie-surface overflow-auto flex flex-col">
      {/* Sticky header: day names + all-day events */}
      <div className="sticky top-0 z-20 bg-kimbie-panel">
        <div className="flex">
          {/* Gutter spacer */}
          <div className="w-12 flex-shrink-0 border-r border-b border-kimbie-border" />
          {/* Day headers */}
          {days.map((day) => {
            const today = isToday(day)
            return (
              <div
                key={day.toISOString()}
                className={`flex-1 min-w-0 px-2 py-2 text-center text-xs font-medium border-b border-r border-kimbie-border ${
                  today ? 'bg-kimbie-accent/10 text-kimbie-accent' : 'text-kimbie-muted'
                }`}
              >
                {formatDayHeader(day)}
              </div>
            )
          })}
        </div>

        {/* All-day events row */}
        {hasAllDay && (
          <div className="flex border-b border-kimbie-border">
            <div className="w-12 flex-shrink-0 border-r border-kimbie-border flex items-center justify-end pr-1">
              <span className="text-[9px] text-kimbie-muted">all day</span>
            </div>
            {days.map((day) => {
              const dayAllDay = allDayForDay(day)
              return (
                <div key={day.toISOString()} className="flex-1 min-w-0 px-1 py-1 border-r border-kimbie-border/50">
                  {dayAllDay.map((e) => (
                    <EventCard key={e.id} event={e} compact />
                  ))}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Scrollable time grid */}
      <div className="flex flex-1">
        {/* Time gutter */}
        <div className="w-12 flex-shrink-0 border-r border-kimbie-border">
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="h-12 flex items-start justify-end pr-1 text-[10px] text-kimbie-muted -mt-2"
            >
              {hour.toString().padStart(2, '0')}:00
            </div>
          ))}
        </div>

        {/* Day columns (timed events only) */}
        {days.map((day) => (
          <DayColumn
            key={day.toISOString()}
            date={day}
            events={timedForDay(day)}
          />
        ))}
      </div>
    </div>
  )
}
