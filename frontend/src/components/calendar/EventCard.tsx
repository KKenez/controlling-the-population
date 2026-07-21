import type { CalendarEvent } from '../../types/event'
import { sourceColors } from '../../utils/colors'
import { formatTime } from '../../utils/dates'

interface EventCardProps {
  event: CalendarEvent
  compact?: boolean
  onClick?: () => void
}

export default function EventCard({ event, compact, onClick }: EventCardProps) {
  const color = sourceColors[event.source] ?? '#a855f7'
  const start = new Date(event.start)

  if (compact) {
    return (
      <div
        className="text-xs truncate rounded px-1 py-0.5 mb-0.5 cursor-pointer hover:brightness-125"
        style={{ backgroundColor: color + '22', borderLeft: `3px solid ${color}` }}
        title={`${event.title} — ${formatTime(start)}`}
        onClick={onClick}
      >
        <span className="font-medium text-kimbie-text">{event.title}</span>
      </div>
    )
  }

  return (
    <div
      className="text-xs rounded px-1.5 py-1 mb-0.5 cursor-pointer overflow-hidden hover:brightness-125"
      style={{ backgroundColor: color + '22', borderLeft: `3px solid ${color}` }}
      title={event.title}
      onClick={onClick}
    >
      <p className="font-medium text-kimbie-text truncate">{event.title}</p>
      <p className="text-kimbie-muted">{formatTime(start)}</p>
    </div>
  )
}
