import type { CalendarEvent } from '../../types/event'
import { sourceColors } from '../../utils/colors'
import { formatTime } from '../../utils/dates'

interface EventCardProps {
  event: CalendarEvent
  compact?: boolean
}

export default function EventCard({ event, compact }: EventCardProps) {
  const color = sourceColors[event.source] ?? '#a855f7'
  const start = new Date(event.start)

  if (compact) {
    return (
      <div
        className="text-xs truncate rounded px-1 py-0.5 mb-0.5 cursor-default"
        style={{ backgroundColor: color + '22', borderLeft: `3px solid ${color}` }}
        title={`${event.title} — ${formatTime(start)}`}
      >
        <span className="font-medium text-kimbie-text">{event.title}</span>
      </div>
    )
  }

  return (
    <div
      className="text-xs rounded px-1.5 py-1 mb-0.5 cursor-default overflow-hidden"
      style={{ backgroundColor: color + '22', borderLeft: `3px solid ${color}` }}
      title={event.title}
    >
      <p className="font-medium text-kimbie-text truncate">{event.title}</p>
      <p className="text-kimbie-muted">{formatTime(start)}</p>
    </div>
  )
}
