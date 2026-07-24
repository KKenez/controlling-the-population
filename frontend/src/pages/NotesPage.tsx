import { useState } from 'react'
import { useNotes, useCreateNote, useUpdateNote, useDeleteNote } from '../hooks/useNotes'
import type { Note } from '../types/goals'

export default function NotesPage() {
  const { data: notes, isLoading } = useNotes()
  const createMutation = useCreateNote()
  const updateMutation = useUpdateNote()
  const deleteMutation = useDeleteNote()
  const [text, setText] = useState('')
  const [dueHint, setDueHint] = useState('')
  const [showResolved, setShowResolved] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    createMutation.mutate(
      { text: text.trim(), dueHint: dueHint.trim() || undefined },
      { onSuccess: () => { setText(''); setDueHint('') } }
    )
  }

  const unresolvedNotes = notes?.filter((n) => !n.resolved) || []
  const resolvedNotes = notes?.filter((n) => n.resolved) || []

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-kimbie-heading mb-2">Quick Notes</h1>
      <p className="text-sm text-kimbie-muted mb-6">
        One-off items for the AI to schedule. These get included in the next generation.
      </p>

      {/* Quick Add Form */}
      <form onSubmit={handleSubmit} className="mb-6 bg-kimbie-surface border border-kimbie-border rounded-lg p-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. Dentist appointment Thursday afternoon"
              className="w-full px-3 py-2 bg-kimbie-bg border border-kimbie-border rounded-md text-sm text-kimbie-text placeholder-kimbie-muted focus:outline-none focus:ring-2 focus:ring-kimbie-accent"
            />
          </div>
          <button
            type="submit"
            disabled={!text.trim() || createMutation.isPending}
            className="px-4 py-2 bg-kimbie-accent text-kimbie-bg rounded-md text-sm font-medium hover:brightness-110 disabled:opacity-50"
          >
            Add
          </button>
        </div>
        <input
          type="text"
          value={dueHint}
          onChange={(e) => setDueHint(e.target.value)}
          placeholder="Timing hint (optional) — e.g. before Saturday, morning preferred"
          className="mt-2 w-full px-3 py-1.5 bg-kimbie-bg border border-kimbie-border rounded-md text-xs text-kimbie-text placeholder-kimbie-muted focus:outline-none focus:ring-2 focus:ring-kimbie-accent"
        />
      </form>

      {isLoading ? (
        <p className="text-kimbie-muted text-sm">Loading...</p>
      ) : (
        <>
          {/* Active Notes */}
          {unresolvedNotes.length === 0 ? (
            <p className="text-kimbie-muted text-sm">No pending notes. Add one above!</p>
          ) : (
            <div className="space-y-2 mb-6">
              {unresolvedNotes.map((note: Note) => (
                <div key={note.id} className="bg-kimbie-surface border border-kimbie-border rounded-md p-3 flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm text-kimbie-text">{note.text}</p>
                    {note.dueHint && (
                      <p className="text-xs text-kimbie-muted mt-0.5">⏰ {note.dueHint}</p>
                    )}
                    <p className="text-[10px] text-kimbie-muted mt-1">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => updateMutation.mutate({ id: note.id, data: { resolved: true } })}
                      className="px-2 py-1 text-xs rounded border border-kimbie-green text-kimbie-green hover:bg-kimbie-green/20"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(note.id)}
                      className="px-2 py-1 text-xs rounded border border-kimbie-red text-kimbie-red hover:bg-kimbie-red/20"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Resolved Notes Toggle */}
          {resolvedNotes.length > 0 && (
            <div>
              <button
                onClick={() => setShowResolved(!showResolved)}
                className="text-xs text-kimbie-muted hover:text-kimbie-text"
              >
                {showResolved ? '▼' : '▶'} Resolved ({resolvedNotes.length})
              </button>
              {showResolved && (
                <div className="space-y-2 mt-2">
                  {resolvedNotes.map((note: Note) => (
                    <div key={note.id} className="bg-kimbie-panel border border-kimbie-border rounded-md p-3 opacity-60">
                      <p className="text-sm text-kimbie-text line-through">{note.text}</p>
                      <p className="text-[10px] text-kimbie-muted mt-1">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
