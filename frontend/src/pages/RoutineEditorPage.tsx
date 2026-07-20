import { useState, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useRoutines, useCreateRoutine, useUpdateRoutine } from '../hooks/useRoutines'
import { useLifeAreas } from '../hooks/useLifeAreas'
import type { PriorityLevel, TimeConstraint } from '../types/routine'

const PRIORITIES: PriorityLevel[] = ['critical', 'high', 'medium', 'low', 'flexible']
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function RoutineEditorPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { data: routines } = useRoutines()
  const { data: lifeAreas } = useLifeAreas()
  const createMutation = useCreateRoutine()
  const updateMutation = useUpdateRoutine()

  const isEditing = !!id
  const existing = routines?.find((r) => r.id === id)

  const [name, setName] = useState('')
  const [lifeAreaId, setLifeAreaId] = useState(searchParams.get('areaId') || '')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<PriorityLevel>('medium')
  const [frequencyPerWeek, setFrequencyPerWeek] = useState(3)
  const [durationMinutes, setDurationMinutes] = useState(60)
  const [constraints, setConstraints] = useState<TimeConstraint>({})

  useEffect(() => {
    if (existing) {
      setName(existing.name)
      setLifeAreaId(existing.lifeAreaId)
      setDescription(existing.description)
      setPriority(existing.priority)
      setFrequencyPerWeek(existing.frequencyPerWeek)
      setDurationMinutes(existing.durationMinutes)
      setConstraints(existing.constraints)
    }
  }, [existing])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data = {
      name,
      lifeAreaId,
      description,
      priority,
      frequencyPerWeek,
      durationMinutes,
      constraints,
      parameters: {},
    }

    if (isEditing && id) {
      updateMutation.mutate({ id, data }, { onSuccess: () => navigate('/routines') })
    } else {
      createMutation.mutate(data, { onSuccess: () => navigate('/routines') })
    }
  }

  const toggleDay = (dayIndex: number, field: 'preferredDays' | 'excludeDays') => {
    setConstraints((prev) => {
      const current = prev[field] || []
      const next = current.includes(dayIndex)
        ? current.filter((d) => d !== dayIndex)
        : [...current, dayIndex]
      return { ...prev, [field]: next.length ? next : undefined }
    })
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-kimbie-heading mb-6">
        {isEditing ? 'Edit Routine' : 'New Routine'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-kimbie-text mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 bg-kimbie-bg border border-kimbie-border rounded-md text-sm text-kimbie-text placeholder-kimbie-muted focus:outline-none focus:ring-2 focus:ring-kimbie-accent"
            placeholder="e.g. Morning Gym Session"
          />
        </div>

        {/* Life Area + Priority row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-kimbie-text mb-1">Life Area</label>
            <select
              value={lifeAreaId}
              onChange={(e) => setLifeAreaId(e.target.value)}
              required
              className="w-full px-3 py-2 bg-kimbie-bg border border-kimbie-border rounded-md text-sm text-kimbie-text focus:outline-none focus:ring-2 focus:ring-kimbie-accent"
            >
              <option value="">Select a life area...</option>
              {lifeAreas?.map((area) => (
                <option key={area.id} value={area.id}>{area.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-kimbie-text mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as PriorityLevel)}
              className="w-full px-3 py-2 bg-kimbie-bg border border-kimbie-border rounded-md text-sm text-kimbie-text focus:outline-none focus:ring-2 focus:ring-kimbie-accent"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-kimbie-text mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-kimbie-bg border border-kimbie-border rounded-md text-sm text-kimbie-text placeholder-kimbie-muted focus:outline-none focus:ring-2 focus:ring-kimbie-accent"
            placeholder="What does this routine involve?"
          />
        </div>

        {/* Frequency + Duration row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-kimbie-text mb-1">
              Times per week
            </label>
            <input
              type="number"
              min={1}
              max={14}
              value={frequencyPerWeek}
              onChange={(e) => setFrequencyPerWeek(Number(e.target.value))}
              className="w-full px-3 py-2 bg-kimbie-bg border border-kimbie-border rounded-md text-sm text-kimbie-text focus:outline-none focus:ring-2 focus:ring-kimbie-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-kimbie-text mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              min={5}
              max={480}
              step={5}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full px-3 py-2 bg-kimbie-bg border border-kimbie-border rounded-md text-sm text-kimbie-text focus:outline-none focus:ring-2 focus:ring-kimbie-accent"
            />
          </div>
        </div>

        {/* Time Constraints */}
        <fieldset className="border border-kimbie-border rounded-md p-4">
          <legend className="text-sm font-medium text-kimbie-text px-1">Time Constraints</legend>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-kimbie-muted mb-1">Earliest start</label>
              <input
                type="time"
                value={constraints.earliestStart || ''}
                onChange={(e) => setConstraints((c) => ({ ...c, earliestStart: e.target.value || undefined }))}
                className="w-full px-3 py-2 bg-kimbie-bg border border-kimbie-border rounded-md text-sm text-kimbie-text"
              />
            </div>
            <div>
              <label className="block text-xs text-kimbie-muted mb-1">Latest end</label>
              <input
                type="time"
                value={constraints.latestEnd || ''}
                onChange={(e) => setConstraints((c) => ({ ...c, latestEnd: e.target.value || undefined }))}
                className="w-full px-3 py-2 bg-kimbie-bg border border-kimbie-border rounded-md text-sm text-kimbie-text"
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-xs text-kimbie-muted mb-2">Preferred days</label>
            <div className="flex gap-2">
              {DAYS.map((day, i) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(i, 'preferredDays')}
                  className={`px-2 py-1 text-xs rounded-md border ${
                    constraints.preferredDays?.includes(i)
                      ? 'bg-kimbie-accent/20 border-kimbie-accent text-kimbie-accent'
                      : 'border-kimbie-border text-kimbie-muted hover:bg-kimbie-surface'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-kimbie-muted mb-2">Exclude days</label>
            <div className="flex gap-2">
              {DAYS.map((day, i) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(i, 'excludeDays')}
                  className={`px-2 py-1 text-xs rounded-md border ${
                    constraints.excludeDays?.includes(i)
                      ? 'bg-kimbie-red/20 border-kimbie-red text-kimbie-red'
                      : 'border-kimbie-border text-kimbie-muted hover:bg-kimbie-surface'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        </fieldset>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isPending || !name || !lifeAreaId}
            className="px-4 py-2 bg-kimbie-accent text-kimbie-bg rounded-md text-sm font-medium hover:brightness-110 disabled:opacity-50"
          >
            {isPending ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Routine'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/routines')}
            className="px-4 py-2 bg-kimbie-panel text-kimbie-muted rounded-md text-sm font-medium hover:text-kimbie-text"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
