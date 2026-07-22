import { useState } from 'react'
import { useRoutines } from '../hooks/useRoutines'
import { useGenerateWeek, useConfirmWeek, useAiStatus } from '../hooks/useGeneration'
import type { GeneratedWeek } from '../types/generation'

export default function GenerateWeekPage() {
  const { data: routines, isLoading } = useRoutines()
  const { data: aiStatus } = useAiStatus()
  const generateMutation = useGenerateWeek()
  const confirmMutation = useConfirmWeek()
  const [selected, setSelected] = useState<string[]>([])
  const [result, setResult] = useState<GeneratedWeek | null>(null)
  const [error, setError] = useState<string | null>(null)

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const handleGenerate = () => {
    setError(null)
    const weekStart = getNextMonday()
    generateMutation.mutate(
      { routineIds: selected, weekStart },
      {
        onSuccess: (data) => setResult(data),
        onError: (err) => setError(err instanceof Error ? err.message : 'Generation failed'),
      }
    )
  }

  const handleConfirm = () => {
    if (!result) return
    confirmMutation.mutate(result.id, {
      onSuccess: () => setResult(null),
      onError: (err) => setError(err instanceof Error ? err.message : 'Confirm failed'),
    })
  }

  if (isLoading) return <div className="p-6">Loading...</div>

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-kimbie-heading mb-6">Generate Week</h1>

      {/* AI Status Banner */}
      {aiStatus && !aiStatus.ollamaReachable && (
        <div className="mb-4 p-3 bg-kimbie-red/10 border border-kimbie-red/30 rounded-md">
          <p className="text-sm text-kimbie-red font-medium">Ollama is not running</p>
          <p className="text-xs text-kimbie-muted mt-1">Start Ollama to enable AI generation. Run <code className="bg-kimbie-bg px-1 rounded">ollama serve</code> in a terminal.</p>
        </div>
      )}
      {aiStatus && aiStatus.ollamaReachable && !aiStatus.modelReady && (
        <div className="mb-4 p-3 bg-kimbie-yellow/10 border border-kimbie-yellow/30 rounded-md">
          <p className="text-sm text-kimbie-yellow font-medium">Model not downloaded</p>
          <p className="text-xs text-kimbie-muted mt-1">Run <code className="bg-kimbie-bg px-1 rounded">ollama pull {aiStatus.model}</code> to download the model.</p>
        </div>
      )}
      {aiStatus && aiStatus.modelReady && (
        <div className="mb-4 p-3 bg-kimbie-green/10 border border-kimbie-green/30 rounded-md">
          <p className="text-sm text-kimbie-green font-medium">AI ready — {aiStatus.model}</p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-kimbie-red/10 border border-kimbie-red/30 rounded-md">
          <p className="text-sm text-kimbie-red">{error}</p>
        </div>
      )}

      {confirmMutation.isSuccess && (
        <div className="mb-4 p-3 bg-kimbie-green/10 border border-kimbie-green/30 rounded-md">
          <p className="text-sm text-kimbie-green font-medium">Week confirmed! Events added to your calendar.</p>
        </div>
      )}

      {!result ? (
        <>
          <p className="text-sm text-kimbie-muted mb-4">Select routines to include in next week&apos;s schedule:</p>
          {!routines?.length ? (
            <p className="text-sm text-kimbie-muted">No routines yet. Create some on the Routines page first.</p>
          ) : (
            <>
              <div className="space-y-2 mb-6">
                {routines.map((r) => (
                  <label key={r.id} className="flex items-center gap-3 p-3 bg-kimbie-surface border border-kimbie-border rounded-md cursor-pointer hover:border-kimbie-accent">
                    <input
                      type="checkbox"
                      checked={selected.includes(r.id)}
                      onChange={() => toggle(r.id)}
                      className="rounded text-kimbie-accent accent-kimbie-accent"
                    />
                    <span className="text-sm font-medium text-kimbie-text">{r.name}</span>
                    <span className="text-xs text-kimbie-muted ml-auto">{r.frequencyPerWeek}x/week · {r.durationMinutes} min · {r.priority}</span>
                  </label>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleGenerate}
                  disabled={!selected.length || generateMutation.isPending || (aiStatus && !aiStatus.modelReady)}
                  className="px-4 py-2 bg-kimbie-accent text-kimbie-bg rounded-md text-sm font-medium hover:brightness-110 disabled:opacity-50"
                >
                  {generateMutation.isPending ? 'Generating...' : 'Generate Week'}
                </button>
                {generateMutation.isPending && (
                  <span className="text-xs text-kimbie-muted">This may take a minute with a local model...</span>
                )}
              </div>
            </>
          )}
        </>
      ) : (
        <div>
          <h2 className="text-lg font-semibold text-kimbie-heading mb-4">
            Proposed Schedule — week of {result.weekStart}
          </h2>
          <div className="space-y-2 mb-6">
            {result.events.length === 0 ? (
              <p className="text-sm text-kimbie-muted">No events generated. Try adjusting your routines.</p>
            ) : (
              result.events.map((event) => (
                <div key={event.id} className="bg-kimbie-surface border border-kimbie-border rounded-md p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-kimbie-text">{event.title}</p>
                    <p className="text-xs text-kimbie-muted">
                      {formatDateTime(event.start)} — {formatTime(event.end)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleConfirm}
              disabled={confirmMutation.isPending || result.events.length === 0}
              className="px-4 py-2 bg-kimbie-green text-kimbie-bg rounded-md text-sm font-medium hover:brightness-110 disabled:opacity-50"
            >
              {confirmMutation.isPending ? 'Confirming...' : 'Confirm & Add to Calendar'}
            </button>
            <button
              onClick={() => { setResult(null); setError(null) }}
              className="px-4 py-2 bg-kimbie-panel text-kimbie-muted rounded-md text-sm font-medium hover:text-kimbie-text"
            >
              Start Over
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function getNextMonday(): string {
  const now = new Date()
  const day = now.getDay()
  const diff = day === 0 ? 1 : 8 - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + diff)
  return monday.toISOString().split('T')[0]
}

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) +
    ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}
