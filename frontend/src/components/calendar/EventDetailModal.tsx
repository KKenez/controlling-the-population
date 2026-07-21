import { useState } from 'react'
import type { CalendarEvent } from '../../types/event'
import { sourceColors } from '../../utils/colors'
import { formatTime } from '../../utils/dates'
import Modal from '../common/Modal'
import AddEventForm from './AddEventForm'

interface EventDetailModalProps {
  event: CalendarEvent | null
  onClose: () => void
  onUpdate: (id: string, data: {
    title: string
    start: string
    end: string
    source: string
    location?: string
    notes?: string
  }) => void
  onDelete: (id: string) => void
  isUpdating: boolean
  isDeleting: boolean
}

const SOURCE_LABELS: Record<string, string> = {
  work1: 'Work 1',
  work2: 'Work 2',
  personal: 'Personal',
  apple_home: 'Apple Home',
  apple_work: 'Apple Work',
  generated: 'Generated',
}

export default function EventDetailModal({
  event,
  onClose,
  onUpdate,
  onDelete,
  isUpdating,
  isDeleting,
}: EventDetailModalProps) {
  const [editing, setEditing] = useState(false)

  if (!event) return null

  const start = new Date(event.start)
  const end = new Date(event.end)
  const color = sourceColors[event.source] ?? '#a855f7'

  const dateStr = start.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  const timeStr = `${formatTime(start)} – ${formatTime(end)}`

  if (editing) {
    return (
      <Modal open onClose={onClose} title="Edit Event">
        <AddEventForm
          isPending={isUpdating}
          onCancel={() => setEditing(false)}
          onSubmit={(data) => onUpdate(event.id, data)}
          initialValues={{
            title: event.title,
            start: event.start,
            end: event.end,
            source: event.source,
            location: event.location ?? '',
            notes: event.notes ?? '',
          }}
        />
      </Modal>
    )
  }

  return (
    <Modal open onClose={onClose}>
      <div className="space-y-4">
        {/* Header with color bar */}
        <div className="flex items-start gap-3">
          <div className="w-1 self-stretch rounded-full" style={{ backgroundColor: color }} />
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-kimbie-heading">{event.title}</h2>
            <p className="text-sm text-kimbie-muted mt-0.5">{dateStr}</p>
            <p className="text-sm text-kimbie-text">{timeStr}</p>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-kimbie-muted">Calendar:</span>
            <span
              className="px-2 py-0.5 rounded text-xs font-medium"
              style={{ backgroundColor: color + '22', color }}
            >
              {SOURCE_LABELS[event.source] ?? event.source}
            </span>
          </div>
          {event.location && (
            <div className="flex items-center gap-2">
              <span className="text-kimbie-muted">Location:</span>
              <span className="text-kimbie-text">{event.location}</span>
            </div>
          )}
          {event.notes && (
            <div>
              <span className="text-kimbie-muted">Notes:</span>
              <p className="text-kimbie-text mt-1 text-xs bg-kimbie-bg rounded p-2">{event.notes}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-kimbie-border">
          <button
            onClick={() => onDelete(event.id)}
            disabled={isDeleting}
            className="px-3 py-1.5 text-xs font-medium text-kimbie-red hover:bg-kimbie-red/10 rounded-md disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
          <button
            onClick={() => setEditing(true)}
            className="px-3 py-1.5 text-xs font-medium text-kimbie-muted hover:text-kimbie-text hover:bg-kimbie-surface rounded-md"
          >
            Edit
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium bg-kimbie-accent text-kimbie-bg rounded-md hover:brightness-110"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  )
}
