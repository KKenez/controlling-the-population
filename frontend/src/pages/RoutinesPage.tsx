import { Link } from 'react-router-dom'
import { useRoutines, useDeleteRoutine } from '../hooks/useRoutines'
import type { Routine } from '../types/routine'

const areaColors: Record<string, string> = {
  fitness: 'bg-green-100 text-green-800',
  work: 'bg-blue-100 text-blue-800',
  personal: 'bg-purple-100 text-purple-800',
  social: 'bg-yellow-100 text-yellow-800',
  learning: 'bg-orange-100 text-orange-800',
  health: 'bg-red-100 text-red-800',
}

export default function RoutinesPage() {
  const { data: routines, isLoading, error } = useRoutines()
  const deleteMutation = useDeleteRoutine()

  if (isLoading) return <div className="p-6">Loading routines...</div>
  if (error) return <div className="p-6 text-red-600">Failed to load routines</div>

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Routines</h1>
        <Link
          to="/routines/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
        >
          + New Routine
        </Link>
      </div>

      {!routines?.length ? (
        <p className="text-gray-500">No routines yet. Create your first one!</p>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {routines.map((routine: Routine) => (
            <div key={routine.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{routine.name}</h3>
                  <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${areaColors[routine.lifeArea] || 'bg-gray-100 text-gray-800'}`}>
                    {routine.lifeArea}
                  </span>
                </div>
                <span className="text-xs text-gray-400 capitalize">{routine.priority}</span>
              </div>
              <p className="mt-2 text-sm text-gray-600 line-clamp-2">{routine.description}</p>
              <div className="mt-3 text-xs text-gray-500">
                {routine.frequencyPerWeek}x/week · {routine.durationMinutes} min
              </div>
              <div className="mt-3 flex gap-2">
                <Link
                  to={`/routines/${routine.id}`}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  Edit
                </Link>
                <button
                  onClick={() => deleteMutation.mutate(routine.id)}
                  className="text-xs text-red-600 hover:underline"
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
}
