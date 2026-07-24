import { useGoals } from '../hooks/useGoals'
import { useQuests } from '../hooks/useQuests'
import { useRoutines } from '../hooks/useRoutines'
import { useNotes } from '../hooks/useNotes'
import { useLifeAreas } from '../hooks/useLifeAreas'
import type { Goal, Quest, Note } from '../types/goals'
import type { Routine } from '../types/routine'

export default function DashboardPage() {
  const { data: activeGoals } = useGoals('active')
  const { data: activeQuests } = useQuests('active')
  const { data: allRoutines } = useRoutines()
  const { data: notes } = useNotes(false) // unresolved only
  const { data: lifeAreas } = useLifeAreas()
  const { data: backlogGoals } = useGoals('backlog')
  const { data: backlogQuests } = useQuests('backlog')

  // Calculate capacity
  const activeRoutines = allRoutines?.filter((r) =>
    activeGoals?.some((g) => g.id === r.goalId) || !r.goalId
  ) || allRoutines || []

  const committedMinutes = activeRoutines.reduce(
    (sum, r) => sum + r.frequencyPerWeek * r.durationMinutes,
    0
  )
  const questMinutes = (activeQuests || []).reduce(
    (sum, q) => sum + q.durationMinutes,
    0
  )
  const totalCommittedHours = (committedMinutes + questMinutes) / 60
  const availableHours = 40 // TODO: make configurable (waking hours minus work)
  const capacityPercent = Math.min(100, Math.round((totalCommittedHours / availableHours) * 100))

  const getAreaIcon = (areaId: string) => lifeAreas?.find((a) => a.id === areaId)?.icon || '🎯'

  const backlogCount = (backlogGoals?.length || 0) + (backlogQuests?.length || 0)

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-kimbie-heading mb-6">Dashboard</h1>

      {/* Capacity Meter */}
      <div className="mb-8 bg-kimbie-surface border border-kimbie-border rounded-lg p-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-medium text-kimbie-text">Weekly Capacity</h2>
          <span className="text-sm text-kimbie-muted">
            {totalCommittedHours.toFixed(1)}h / {availableHours}h
          </span>
        </div>
        <div className="w-full h-3 bg-kimbie-bg rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              capacityPercent > 90 ? 'bg-kimbie-red' : capacityPercent > 70 ? 'bg-kimbie-yellow' : 'bg-kimbie-green'
            }`}
            style={{ width: `${capacityPercent}%` }}
          />
        </div>
        <p className="text-xs text-kimbie-muted mt-1">
          {capacityPercent}% committed
          {capacityPercent < 60 && backlogCount > 0 && (
            <span className="text-kimbie-accent"> — you have capacity! Consider activating something from backlog.</span>
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Goals */}
        <section>
          <h2 className="text-sm font-medium text-kimbie-muted uppercase tracking-wider mb-3">
            Active Goals ({activeGoals?.length || 0})
          </h2>
          {!activeGoals?.length ? (
            <p className="text-xs text-kimbie-muted">No active goals. Activate some from the backlog.</p>
          ) : (
            <div className="space-y-3">
              {activeGoals.map((goal: Goal) => {
                const goalRoutines = allRoutines?.filter((r) => r.goalId === goal.id) || []
                const goalHours = goalRoutines.reduce((s, r) => s + r.frequencyPerWeek * r.durationMinutes, 0) / 60
                return (
                  <div key={goal.id} className="bg-kimbie-surface border border-kimbie-border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span>{getAreaIcon(goal.lifeAreaId)}</span>
                      <span className="text-sm font-medium text-kimbie-text">{goal.name}</span>
                      {goalHours > 0 && (
                        <span className="text-xs text-kimbie-muted ml-auto">{goalHours.toFixed(1)}h/week</span>
                      )}
                    </div>
                    {goalRoutines.length > 0 && (
                      <div className="ml-6 space-y-0.5">
                        {goalRoutines.map((r: Routine) => (
                          <p key={r.id} className="text-xs text-kimbie-muted">
                            {r.name} — {r.frequencyPerWeek}x/week · {r.durationMinutes}min
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Active Quests */}
        <section>
          <h2 className="text-sm font-medium text-kimbie-muted uppercase tracking-wider mb-3">
            Active Quests ({activeQuests?.length || 0})
          </h2>
          {!activeQuests?.length ? (
            <p className="text-xs text-kimbie-muted">No active quests.</p>
          ) : (
            <div className="space-y-3">
              {activeQuests.map((quest: Quest) => (
                <div key={quest.id} className="bg-kimbie-surface border border-kimbie-border rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <span>{getAreaIcon(quest.lifeAreaId)}</span>
                    <span className="text-sm font-medium text-kimbie-text">{quest.name}</span>
                    <span className="text-xs text-kimbie-muted ml-auto">{quest.durationMinutes}min/session</span>
                  </div>
                  {quest.doneWhen && (
                    <p className="text-xs text-kimbie-muted ml-6 mt-0.5">Done when: {quest.doneWhen}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Quick Notes */}
      {notes && notes.length > 0 && (
        <section className="mt-6">
          <h2 className="text-sm font-medium text-kimbie-muted uppercase tracking-wider mb-3">
            Pending Notes ({notes.length})
          </h2>
          <div className="bg-kimbie-surface border border-kimbie-border rounded-lg p-3">
            <div className="space-y-1">
              {notes.slice(0, 5).map((note: Note) => (
                <p key={note.id} className="text-xs text-kimbie-text">
                  • {note.text}
                  {note.dueHint && <span className="text-kimbie-muted"> ({note.dueHint})</span>}
                </p>
              ))}
              {notes.length > 5 && (
                <p className="text-xs text-kimbie-muted">+{notes.length - 5} more</p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Backlog Summary */}
      {backlogCount > 0 && (
        <section className="mt-6">
          <div className="bg-kimbie-panel border border-kimbie-border rounded-lg p-4 flex items-center justify-between">
            <span className="text-sm text-kimbie-muted">
              {backlogGoals?.length || 0} goal{(backlogGoals?.length || 0) !== 1 ? 's' : ''} and{' '}
              {backlogQuests?.length || 0} quest{(backlogQuests?.length || 0) !== 1 ? 's' : ''} in backlog
            </span>
            <a href="/backlog" className="text-xs text-kimbie-accent hover:underline">
              View Backlog →
            </a>
          </div>
        </section>
      )}
    </div>
  )
}
