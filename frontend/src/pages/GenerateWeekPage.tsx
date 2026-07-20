import { useState } from 'react'
import { useRoutines } from '../hooks/useRoutines'
import { useGenerateWeek, useConfirmWeek } from '../hooks/useGeneration'
import type { GeneratedWeek } from '../types/generation'

export default function GenerateWeekPage() {
  const { data: routines, isLoading } = useRoutines()
  const generateMutation = useGenerateWeek()
  const confirmMutation = useConfirmWeek()
  const [selected, setSelected] = useState<string[]>([])
  const [result, setResult] = useState<GeneratedWeek | null>(null)

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const handleGenerate = () => {
    const weekStart = getNextMonday()
    generateMutation.mutate(
      { routineIds: selected, weekStart },
      { onSuccess: (data) => setResult(data) }
    )
  }

  if (isLoading) return <div className="p-6">Loading...</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Generate Week</h1>

      {!result ? (
        <>
          <p className="text-sm text-gray-600 mb-4">Select routines to include:</p>
          <div className="space-y-2 mb-6">
            {routines?.map((r) => (
              <label key={r.id} className="flex items-center gap-3 p-3 bg-white border rounded-md cursor-pointer hover:border-indigo-300">
                <input
                  type="checkbox"
                  checked={selected.includes(r.id)}
                  onChange={() => toggle(r.id)}
                  className="rounded text-indigo-600"
                />
                <span className="text-sm font-medium text-gray-900">{r.name}</span>
                <span className="text-xs text-gray-500 ml-auto">{r.frequencyPerWeek}x · {r.durationMinutes}min</span>
              </label>
            ))}
          </div>
          <button
            onClick={handleGenerate}
            disabled={!selected.length || generateMutation.isPending}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {generateMutation.isPending ? 'Generating...' : 'Generate Week'}
          </button>
        </>
      ) : (
        <div>
          <h2 className="text-lg font-semibold mb-4">Proposed Schedule</h2>
          <div className="space-y-2 mb-6">
            {result.events.map((event) => (
              <div key={event.id} className="bg-white border rounded-md p-3">
                <p className="text-sm font-medium">{event.title}</p>
                <p className="text-xs text-gray-500">{event.start} — {event.end}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => confirmMutation.mutate(result.id)}
              disabled={confirmMutation.isPending}
              className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
            >
              Confirm & Push
            </button>
            <button
              onClick={() => setResult(null)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300"
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
