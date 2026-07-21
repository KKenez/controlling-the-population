import { useState } from 'react'
import type { CalendarSource } from '../../types/event'

interface AddEventFormProps {
  onSubmit: (data: {
    title: string
    start: string
    end: string
    source: string
    location?: string
    notes?: string
  }) => void
  onCancel: () => void
  isPending: boolean
  initialValues?: {
    title: string
    start: string
    end: string
    source: string
    location: string
    notes: string
  }
}

const SOURCES: { value: CalendarSource; label: string }[] = [
  { value: 'apple_home', label: 'Apple Home' },
  { value: 'apple_work', label: 'Apple Work' },
  { value: 'personal', label: 'Personal' },
  { value: 'work1', label: 'Work 1' },
  { value: 'work2', label: 'Work 2' },
  { value: 'generated', label: 'Generated' },
]

function toLocalDatetimeString(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export default function AddEventForm({ onSubmit, onCancel, isPending, initialValues }: AddEventFormProps) {
  const now = new Date()
  const oneHourLater = new Date(now.getTime() + 3600000)

  const [title, setTitle] = useState(initialValues?.title ?? '')
  const [start, setStart] = useState(
    initialValues ? toLocalDatetimeString(new Date(initialValues.start)) : toLocalDatetimeString(now)
  )
  const [end, setEnd] = useState(
    initialValues ? toLocalDatetimeString(new Date(initialValues.end)) : toLocalDatetimeString(oneHourLater)
  )
  const [source, setSource] = useState<string>(initialValues?.source ?? 'personal')
  const [location, setLocation] = useState(initialValues?.location ?? '')
  const [notes, setNotes] = useState(initialValues?.notes ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !start || !end) return
    onSubmit({
      title: title.trim(),
      start: new Date(start).toISOString(),
      end: new Date(end).toISOString(),
      source,
      location: location.trim() || undefined,
      notes: notes.trim() || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div>
        <label className="block text-xs font-medium text-kimbie-muted mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 bg-kimbie-bg border border-kimbie-border rounded-md text-sm text-kimbie-text focus:outline-none focus:border-kimbie-accent"
          placeholder="Event title"
          autoFocus
          required
        />
      </div>

      {/* Start / End */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-kimbie-muted mb-1">Start</label>
          <input
            type="datetime-local"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="w-full px-3 py-2 bg-kimbie-bg border border-kimbie-border rounded-md text-sm text-kimbie-text focus:outline-none focus:border-kimbie-accent"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-kimbie-muted mb-1">End</label>
          <input
            type="datetime-local"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="w-full px-3 py-2 bg-kimbie-bg border border-kimbie-border rounded-md text-sm text-kimbie-text focus:outline-none focus:border-kimbie-accent"
            required
          />
        </div>
      </div>

      {/* Source */}
      <div>
        <label className="block text-xs font-medium text-kimbie-muted mb-1">Calendar</label>
        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="w-full px-3 py-2 bg-kimbie-bg border border-kimbie-border rounded-md text-sm text-kimbie-text focus:outline-none focus:border-kimbie-accent"
        >
          {SOURCES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Location */}
      <div>
        <label className="block text-xs font-medium text-kimbie-muted mb-1">Location</label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full px-3 py-2 bg-kimbie-bg border border-kimbie-border rounded-md text-sm text-kimbie-text focus:outline-none focus:border-kimbie-accent"
          placeholder="Optional"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-medium text-kimbie-muted mb-1">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 bg-kimbie-bg border border-kimbie-border rounded-md text-sm text-kimbie-text focus:outline-none focus:border-kimbie-accent resize-none"
          placeholder="Optional"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-kimbie-muted hover:text-kimbie-text rounded-md"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending || !title.trim()}
          className="px-4 py-2 bg-kimbie-accent text-kimbie-bg text-sm font-medium rounded-md hover:brightness-110 disabled:opacity-50"
        >
          {isPending ? 'Adding...' : 'Add Event'}
        </button>
      </div>
    </form>
  )
}
