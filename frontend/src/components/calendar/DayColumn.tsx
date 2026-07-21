import type { CalendarEvent } from '../../types/event'
import { isToday } from '../../utils/dates'
import EventCard from './EventCard'

interface DayColumnProps {
  date: Date
  events: CalendarEvent[] // expects only timed events (all-day handled by WeekView)
}

const START_HOUR = 4
const HOURS = Array.from({ length: 24 }, (_, i) => (i + START_HOUR) % 24)

interface LayoutedEvent {
  event: CalendarEvent
  column: number
  totalColumns: number
}

function layoutEvents(events: CalendarEvent[]): LayoutedEvent[] {
  if (events.length === 0) return []

  const sorted = [...events].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  )

  // Group overlapping events into clusters
  const clusters: CalendarEvent[][] = []
  let currentCluster: CalendarEvent[] = [sorted[0]]
  let clusterEnd = new Date(sorted[0].end).getTime()

  for (let i = 1; i < sorted.length; i++) {
    const eventStart = new Date(sorted[i].start).getTime()
    if (eventStart < clusterEnd) {
      // Overlaps with current cluster
      currentCluster.push(sorted[i])
      clusterEnd = Math.max(clusterEnd, new Date(sorted[i].end).getTime())
    } else {
      clusters.push(currentCluster)
      currentCluster = [sorted[i]]
      clusterEnd = new Date(sorted[i].end).getTime()
    }
  }
  clusters.push(currentCluster)

  // Assign columns within each cluster
  const result: LayoutedEvent[] = []
  for (const cluster of clusters) {
    const columns: number[] = []
    for (const event of cluster) {
      const eventStart = new Date(event.start).getTime()
      // Find first column where this event doesn't overlap
      let col = 0
      while (col < columns.length && columns[col] > eventStart) {
        col++
      }
      if (col === columns.length) columns.push(0)
      columns[col] = new Date(event.end).getTime()
      result.push({ event, column: col, totalColumns: 0 })
    }
    // Set totalColumns for all events in this cluster
    const totalCols = columns.length
    for (let i = result.length - cluster.length; i < result.length; i++) {
      result[i].totalColumns = totalCols
    }
  }

  return result
}

export default function DayColumn({ date, events }: DayColumnProps) {
  const today = isToday(date)

  const layouted = layoutEvents(events)

  return (
    <div className={`flex-1 min-w-0 border-r border-kimbie-border/50 ${today ? 'bg-kimbie-accent/5' : ''}`}>
      {/* Time grid */}
      <div className="relative pt-2">
        {HOURS.map((hour, i) => (
          <div
            key={hour}
            className={`h-12 ${i < HOURS.length - 1 ? 'border-b border-kimbie-border/30' : ''}`}
          />
        ))}

        {/* Positioned timed events — side by side when overlapping */}
        {layouted.map(({ event, column, totalColumns }) => {
          const start = new Date(event.start)
          const end = new Date(event.end)
          const rawMinutes = start.getHours() * 60 + start.getMinutes()
          const topMinutes = (rawMinutes - START_HOUR * 60 + 1440) % 1440
          const durationMinutes = (end.getTime() - start.getTime()) / 60000
          const top = (topMinutes / 60) * 48 + 8
          const height = Math.max((durationMinutes / 60) * 48, 20)

          const width = `calc(${100 / totalColumns}% - 2px)`
          const left = `calc(${(column / totalColumns) * 100}% + 1px)`

          return (
            <div
              key={event.id}
              className="absolute overflow-hidden"
              style={{ top: `${top}px`, height: `${height}px`, width, left }}
            >
              <EventCard event={event} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
