import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLifeAreas, useCreateLifeArea, useDeleteLifeArea } from '../hooks/useLifeAreas'
import { useRoutines, useDeleteRoutine } from '../hooks/useRoutines'
import EmojiPicker from '../components/common/EmojiPicker'
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
  const [newAreaIcon, setNewAreaIcon] = useState('🎯')

  const handleCreateArea = () => {
    if (!newAreaName.trim()) return
    createAreaMutation.mutate(
      { name: newAreaName, color: newAreaColor, icon: newAreaIcon, description: '' },
      { onSuccess: () => { setNewAreaName(''); setNewAreaIcon('🎯'); setShowNewArea(false) } }
    )
  }

  if (isLoading) return <div className="p-6">Loading...</div>

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-kimbie-heading">Life Areas & Routines</h1>
        <button
          onClick={() => setShowNewArea(true)}
          className="px-4 py-2 bg-kimbie-accent text-kimbie-bg rounded-md text-sm font-medium hover:brightness-110"
        >
          + New Life Area
        </button>
      </div>

      {showNewArea && (
        <div className="mb-6 bg-kimbie-surface border border-kimbie-border rounded-lg p-4">
          <h3 className="text-sm font-medium text-kimbie-text mb-3">Create Life Area</h3>
          <div className="flex gap-3 items-end">
            <EmojiPicker value={newAreaIcon} onChange={setNewAreaIcon} />
            <div className="flex-1">
              <input
                type="text"
                value={newAreaName}
                onChange={(e) => setNewAreaName(e.target.value)}
                placeholder="e.g. Fitness, Deep Work, Social..."
                className="w-full px-3 py-2 bg-kimbie-bg border border-kimbie-border rounded-md text-sm text-kimbie-text placeholder-kimbie-muted"
              />
            </div>
            <div>
              <input
                type="color"
                value={newAreaColor}
                onChange={(e) => setNewAreaColor(e.target.value)}
                className="w-10 h-9 rounded border border-kimbie-border cursor-pointer"
              />
            </div>
            <button
              onClick={handleCreateArea}
              disabled={!newAreaName.trim()}
              className="px-4 py-2 bg-kimbie-accent text-kimbie-bg rounded-md text-sm font-medium hover:brightness-110 disabled:opacity-50"
            >
              Create
            </button>
            <button
              onClick={() => setShowNewArea(false)}
              className="px-4 py-2 bg-kimbie-panel text-kimbie-muted rounded-md text-sm font-medium hover:text-kimbie-text"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {!lifeAreas?.length ? (
        <p className="text-kimbie-muted">No life areas yet. Create one to get started!</p>
      ) : (
        <div className="space-y-6">
          {lifeAreas.map((area: LifeArea) => {
            const routines = allRoutines?.filter((r) => r.lifeAreaId === area.id) || []
            return (
              <div key={area.id} className="bg-kimbie-surface border border-kimbie-border rounded-lg overflow-hidden">
                <div className="px-5 py-4 border-b border-kimbie-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{area.icon}</span>
                    <h2 className="text-lg font-semibold text-kimbie-heading">{area.name}</h2>
                    <span className="text-xs text-kimbie-muted">{routines.length} routine{routines.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/routines/new?areaId=${area.id}`}
                      className="text-xs text-kimbie-accent hover:underline"
                    >
                      + Add Routine
                    </Link>
                    <button
                      onClick={() => deleteAreaMutation.mutate(area.id)}
                      className="text-xs text-kimbie-red hover:underline"
                    >
                      Delete Area
                    </button>
                  </div>
                </div>

                {routines.length === 0 ? (
                  <div className="px-5 py-3 text-sm text-kimbie-muted">
                    No routines yet.{' '}
                    <Link to={`/routines/new?areaId=${area.id}`} className="text-kimbie-accent hover:underline">
                      Create one
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-kimbie-border">
                    {routines.map((routine: Routine) => (
                      <div key={routine.id} className="px-5 py-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-kimbie-text">{routine.name}</p>
                          <p className="text-xs text-kimbie-muted">
                            {routine.frequencyPerWeek}x/week · {routine.durationMinutes} min · {routine.priority}
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <Link to={`/routines/${routine.id}`} className="text-xs text-kimbie-accent hover:underline">
                            Edit
                          </Link>
                          <button
                            onClick={() => deleteRoutineMutation.mutate(routine.id)}
                            className="text-xs text-kimbie-red hover:underline"
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
