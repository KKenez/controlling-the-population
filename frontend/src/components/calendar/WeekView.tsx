import type { CalendarEvent } from '../../types/event'
import { getWeekDays, isSameDay } from '../../utils/dates'
import DayColumn from './DayColumn'

interface WeekViewProps {
  currentDate: Date
  events: CalendarEvent[]
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)

export default function WeekView({ currentDate, events }: WeekViewProps) {
  const days = getWeekDays(currentDate)

  function eventsForDay(date: Date) {
    return events.filter((e) => {
      const start = new Date(e.start)
      const end = new Date(e.end)
      // Event overlaps with this day
      const dayStart = new Date(date)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(date)
      dayEnd.setHours(23, 59, 59, 999)
      return start <= dayEnd && end >= dayStart
    })
  }

  return (
    <div className="flex flex-1 overflow-auto border border-kimbie-border rounded-md bg-kimbie-surface">
      {/* Time gutter */}
      <div className="w-12 flex-shrink-0 border-r border-kimbie-border">
        <div className="h-[33px] border-b border-kimbie-border" /> {/* header spacer */}
        {HOURS.map((hour) => (
          <div
            key={hour}
            className="h-12 flex items-start justify-end pr-1 text-[10px] text-kimbie-muted -mt-2"
          >
            {hour.toString().padStart(2, '0')}:00
          </div>
        ))}
      </div>

      {/* Day columns */}
      {days.map((day) => (
        <DayColumn
          key={day.toISOString()}
          date={day}
          events={eventsForDay(day)}
        />
      ))}
    </div>
  )
}
