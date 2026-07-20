import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useRoutines, useCreateRoutine, useUpdateRoutine } from '../hooks/useRoutines'
import type { LifeArea, PriorityLevel, TimeConstraint } from '../types/routine'

const LIFE_AREAS: LifeArea[] = ['fitness', 'work', 'personal', 'social', 'learning', 'health']
const PRIORITIES: PriorityLevel[] = ['critical', 'high', 'medium', 'low', 'flexible']
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function RoutineEditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: routines } = useRoutines()
  const createMutation = useCreateRoutine()
  const updateMutation = useUpdateRoutine()

  const isEditing = !!id
  const existing = routines?.find((r) => r.id === id)

  const [name, setName] = useState('')
  const [lifeArea, setLifeArea] = useState<LifeArea>('fitness')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<PriorityLevel>('medium')
  const [frequencyPerWeek, setFrequencyPerWeek] = useState(3)
  const [durationMinutes, setDurationMinutes] = useState(60)
  const [constraints, setConstraints] = useState<TimeConstraint>({})

  useEffect(() => {
    if (existing) {
      setName(existing.name)
      setLifeArea(existing.lifeArea)
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
      lifeArea,
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isEditing ? 'Edit Routine' : 'New Routine'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g. Morning Gym Session"
          />
        </div>

        {/* Life Area + Priority row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Life Area</label>
            <select
              value={lifeArea}
              onChange={(e) => setLifeArea(e.target.value as LifeArea)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {LIFE_AREAS.map((area) => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as PriorityLevel)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="What does this routine involve?"
          />
        </div>

        {/* Frequency + Duration row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Times per week
            </label>
            <input
              type="number"
              min={1}
              max={14}
              value={frequencyPerWeek}
              onChange={(e) => setFrequencyPerWeek(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              min={5}
              max={480}
              step={5}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Time Constraints */}
        <fieldset className="border border-gray-200 rounded-md p-4">
          <legend className="text-sm font-medium text-gray-700 px-1">Time Constraints</legend>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Earliest start</label>
              <input
                type="time"
                value={constraints.earliestStart || ''}
                onChange={(e) => setConstraints((c) => ({ ...c, earliestStart: e.target.value || undefined }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Latest end</label>
              <input
                type="time"
                value={constraints.latestEnd || ''}
                onChange={(e) => setConstraints((c) => ({ ...c, latestEnd: e.target.value || undefined }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-xs text-gray-500 mb-2">Preferred days</label>
            <div className="flex gap-2">
              {DAYS.map((day, i) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(i, 'preferredDays')}
                  className={`px-2 py-1 text-xs rounded-md border ${
                    constraints.preferredDays?.includes(i)
                      ? 'bg-indigo-100 border-indigo-400 text-indigo-700'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-2">Exclude days</label>
            <div className="flex gap-2">
              {DAYS.map((day, i) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(i, 'excludeDays')}
                  className={`px-2 py-1 text-xs rounded-md border ${
                    constraints.excludeDays?.includes(i)
                      ? 'bg-red-100 border-red-400 text-red-700'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
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
            disabled={isPending || !name}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {isPending ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Routine'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/routines')}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
