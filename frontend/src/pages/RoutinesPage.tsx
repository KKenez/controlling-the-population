import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLifeAreas, useCreateLifeArea, useDeleteLifeArea } from '../hooks/useLifeAreas'
import { useRoutines, useDeleteRoutine } from '../hooks/useRoutines'
import type { LifeArea, Routine } from '../types/routine'

export default function RoutinesPage() {
  const { data: lifeAreas, isLoading } = useLifeAreas()
  const { data: allRoutines } = useRoutines()
  const createAreaMutation = useCreateLifeArea()
  const deleteAreaMutation = useDeleteLifeArea()
  const deleteRoutineMutation = useDeleteRoutine()
  const [showNewArea, setShowNewArea] = useState(false)
  const [newAreaName, setNewAreaName] = useState('')
  const [newAreaColor, setNewAreaColor] = useState('#6366f1')

  const handleCreateArea = () => {
    if (!newAreaName.trim()) return
    createAreaMutation.mutate(
      { name: newAreaName, color: newAreaColor, icon: 'circle', description: '' },
      { onSuccess: () => { setNewAreaName(''); setShowNewArea(false) } }
    )
  }

  if (isLoading) return <div className="p-6">Loading...</div>

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Life Areas & Routines</h1>
        <button
          onClick={() => setShowNewArea(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
        >
          + New Life Area
        </button>
      </div>

      {showNewArea && (
        <div className="mb-6 bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Create Life Area</h3>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <input
                type="text"
                value={newAreaName}
                onChange={(e) => setNewAreaName(e.target.value)}
                placeholder="e.g. Fitness, Deep Work, Social..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div>
              <input
                type="color"
                value={newAreaColor}
                onChange={(e) => setNewAreaColor(e.target.value)}
                className="w-10 h-9 rounded border border-gray-300 cursor-pointer"
              />
            </div>
            <button
              onClick={handleCreateArea}
              disabled={!newAreaName.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              Create
            </button>
            <button
              onClick={() => setShowNewArea(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {!lifeAreas?.length ? (
        <p className="text-gray-500">No life areas yet. Create one to get started!</p>
      ) : (
        <div className="space-y-6">
          {lifeAreas.map((area: LifeArea) => {
            const routines = allRoutines?.filter((r) => r.lifeAreaId === area.id) || []
            return (
              <div key={area.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: area.color }}
                    />
                    <h2 className="text-lg font-semibold text-gray-900">{area.name}</h2>
                    <span className="text-xs text-gray-400">{routines.length} routine{routines.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/routines/new?areaId=${area.id}`}
                      className="text-xs text-indigo-600 hover:underline"
                    >
                      + Add Routine
                    </Link>
                    <button
                      onClick={() => deleteAreaMutation.mutate(area.id)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Delete Area
                    </button>
                  </div>
                </div>

                {routines.length === 0 ? (
                  <div className="px-5 py-3 text-sm text-gray-400">
                    No routines yet.{' '}
                    <Link to={`/routines/new?areaId=${area.id}`} className="text-indigo-600 hover:underline">
                      Create one
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {routines.map((routine: Routine) => (
                      <div key={routine.id} className="px-5 py-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{routine.name}</p>
                          <p className="text-xs text-gray-500">
                            {routine.frequencyPerWeek}x/week · {routine.durationMinutes} min · {routine.priority}
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <Link to={`/routines/${routine.id}`} className="text-xs text-indigo-600 hover:underline">
                            Edit
                          </Link>
                          <button
                            onClick={() => deleteRoutineMutation.mutate(routine.id)}
                            className="text-xs text-red-500 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
