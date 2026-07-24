import { useState } from 'react'
import { useGoals, useCreateGoal, useUpdateGoal, useDeleteGoal } from '../hooks/useGoals'
import { useQuests, useCreateQuest, useUpdateQuest, useDeleteQuest } from '../hooks/useQuests'
import { useLifeAreas } from '../hooks/useLifeAreas'
import type { Goal, Quest, ItemStatus } from '../types/goals'

const STATUS_TABS: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'backlog', label: 'Backlog' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
]

export default function BacklogPage() {
  const [tab, setTab] = useState('backlog')
  const [showNewGoal, setShowNewGoal] = useState(false)
  const [showNewQuest, setShowNewQuest] = useState(false)

  const statusFilter = tab === 'all' ? undefined : tab
  const { data: goals, isLoading: goalsLoading } = useGoals(statusFilter)
  const { data: quests, isLoading: questsLoading } = useQuests(statusFilter)
  const { data: lifeAreas } = useLifeAreas()
  const createGoalMutation = useCreateGoal()
  const updateGoalMutation = useUpdateGoal()
  const deleteGoalMutation = useDeleteGoal()
  const createQuestMutation = useCreateQuest()
  const updateQuestMutation = useUpdateQuest()
  const deleteQuestMutation = useDeleteQuest()

  // New goal form state
  const [goalName, setGoalName] = useState('')
  const [goalDesc, setGoalDesc] = useState('')
  const [goalAreaId, setGoalAreaId] = useState('')

  // New quest form state
  const [questName, setQuestName] = useState('')
  const [questDesc, setQuestDesc] = useState('')
  const [questAreaId, setQuestAreaId] = useState('')
  const [questDoneWhen, setQuestDoneWhen] = useState('')
  const [questDuration, setQuestDuration] = useState(60)
  const [questSessions, setQuestSessions] = useState(1)

  const handleCreateGoal = () => {
    if (!goalName.trim() || !goalAreaId) return
    createGoalMutation.mutate(
      { name: goalName, description: goalDesc, lifeAreaId: goalAreaId, status: 'backlog' as ItemStatus },
      {
        onSuccess: () => {
          setGoalName('')
          setGoalDesc('')
          setGoalAreaId('')
          setShowNewGoal(false)
        },
      }
    )
  }

  const handleCreateQuest = () => {
    if (!questName.trim() || !questAreaId) return
    createQuestMutation.mutate(
      {
        name: questName,
        description: questDesc,
        lifeAreaId: questAreaId,
        status: 'backlog' as ItemStatus,
        doneWhen: questDoneWhen,
        estimatedSessions: questSessions,
        durationMinutes: questDuration,
      },
      {
        onSuccess: () => {
          setQuestName('')
          setQuestDesc('')
          setQuestAreaId('')
          setQuestDoneWhen('')
          setQuestDuration(60)
          setQuestSessions(1)
          setShowNewQuest(false)
        },
      }
    )
  }

  const cycleStatus = (current: string): ItemStatus => {
    const cycle: Record<string, ItemStatus> = { backlog: 'active', active: 'paused', paused: 'backlog' }
    return cycle[current] || 'backlog'
  }

  const getAreaName = (areaId: string) => lifeAreas?.find((a) => a.id === areaId)?.name || '—'

  const isLoading = goalsLoading || questsLoading

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-kimbie-heading">Goals & Quests</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowNewGoal(true)}
            className="px-3 py-1.5 bg-kimbie-accent text-kimbie-bg rounded-md text-sm font-medium hover:brightness-110"
          >
            + Goal
          </button>
          <button
            onClick={() => setShowNewQuest(true)}
            className="px-3 py-1.5 bg-kimbie-purple text-kimbie-bg rounded-md text-sm font-medium hover:brightness-110"
          >
            + Quest
          </button>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1 mb-6 bg-kimbie-panel rounded-lg p-1">
        {STATUS_TABS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === value
                ? 'bg-kimbie-bg text-kimbie-accent'
                : 'text-kimbie-muted hover:text-kimbie-text'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* New Goal Form */}
      {showNewGoal && (
        <div className="mb-6 bg-kimbie-surface border border-kimbie-border rounded-lg p-4">
          <h3 className="text-sm font-medium text-kimbie-text mb-3">New Goal</h3>
          <div className="space-y-3">
            <input
              type="text"
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
              placeholder="Goal name — e.g. Learn to bake"
              className="w-full px-3 py-2 bg-kimbie-bg border border-kimbie-border rounded-md text-sm text-kimbie-text placeholder-kimbie-muted"
            />
            <textarea
              value={goalDesc}
              onChange={(e) => setGoalDesc(e.target.value)}
              placeholder="Description (optional)"
              rows={2}
              className="w-full px-3 py-2 bg-kimbie-bg border border-kimbie-border rounded-md text-sm text-kimbie-text placeholder-kimbie-muted"
            />
            <select
              value={goalAreaId}
              onChange={(e) => setGoalAreaId(e.target.value)}
              className="w-full px-3 py-2 bg-kimbie-bg border border-kimbie-border rounded-md text-sm text-kimbie-text"
            >
              <option value="">Select life area...</option>
              {lifeAreas?.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <button onClick={handleCreateGoal} disabled={!goalName.trim() || !goalAreaId} className="px-4 py-2 bg-kimbie-accent text-kimbie-bg rounded-md text-sm font-medium hover:brightness-110 disabled:opacity-50">
                Create Goal
              </button>
              <button onClick={() => setShowNewGoal(false)} className="px-4 py-2 bg-kimbie-panel text-kimbie-muted rounded-md text-sm font-medium hover:text-kimbie-text">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Quest Form */}
      {showNewQuest && (
        <div className="mb-6 bg-kimbie-surface border border-kimbie-border rounded-lg p-4">
          <h3 className="text-sm font-medium text-kimbie-text mb-3">New Quest</h3>
          <div className="space-y-3">
            <input
              type="text"
              value={questName}
              onChange={(e) => setQuestName(e.target.value)}
              placeholder="Quest name — e.g. Bake a cherry pie"
              className="w-full px-3 py-2 bg-kimbie-bg border border-kimbie-border rounded-md text-sm text-kimbie-text placeholder-kimbie-muted"
            />
            <textarea
              value={questDesc}
              onChange={(e) => setQuestDesc(e.target.value)}
              placeholder="Description (optional)"
              rows={2}
              className="w-full px-3 py-2 bg-kimbie-bg border border-kimbie-border rounded-md text-sm text-kimbie-text placeholder-kimbie-muted"
            />
            <input
              type="text"
              value={questDoneWhen}
              onChange={(e) => setQuestDoneWhen(e.target.value)}
              placeholder="Done when...? (completion criteria)"
              className="w-full px-3 py-2 bg-kimbie-bg border border-kimbie-border rounded-md text-sm text-kimbie-text placeholder-kimbie-muted"
            />
            <div className="grid grid-cols-3 gap-3">
              <select
                value={questAreaId}
                onChange={(e) => setQuestAreaId(e.target.value)}
                className="px-3 py-2 bg-kimbie-bg border border-kimbie-border rounded-md text-sm text-kimbie-text"
              >
                <option value="">Life area...</option>
                {lifeAreas?.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
              <div>
                <label className="block text-xs text-kimbie-muted mb-1">Sessions</label>
                <input
                  type="number"
                  min={1}
                  value={questSessions}
                  onChange={(e) => setQuestSessions(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-kimbie-bg border border-kimbie-border rounded-md text-sm text-kimbie-text"
                />
              </div>
              <div>
                <label className="block text-xs text-kimbie-muted mb-1">Duration (min)</label>
                <input
                  type="number"
                  min={5}
                  step={5}
                  value={questDuration}
                  onChange={(e) => setQuestDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-kimbie-bg border border-kimbie-border rounded-md text-sm text-kimbie-text"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleCreateQuest} disabled={!questName.trim() || !questAreaId} className="px-4 py-2 bg-kimbie-purple text-kimbie-bg rounded-md text-sm font-medium hover:brightness-110 disabled:opacity-50">
                Create Quest
              </button>
              <button onClick={() => setShowNewQuest(false)} className="px-4 py-2 bg-kimbie-panel text-kimbie-muted rounded-md text-sm font-medium hover:text-kimbie-text">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="text-kimbie-muted">Loading...</p>
      ) : (
        <div className="space-y-6">
          {/* Goals Section */}
          {goals && goals.length > 0 && (
            <section>
              <h2 className="text-sm font-medium text-kimbie-muted uppercase tracking-wider mb-3">
                Goals ({goals.length})
              </h2>
              <div className="space-y-2">
                {goals.map((goal: Goal) => (
                  <div key={goal.id} className="bg-kimbie-surface border border-kimbie-border rounded-lg p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-kimbie-text">{goal.name}</span>
                        <span className="text-xs text-kimbie-muted bg-kimbie-bg px-2 py-0.5 rounded">{getAreaName(goal.lifeAreaId)}</span>
                        {goal.routineCount > 0 && (
                          <span className="text-xs text-kimbie-muted">{goal.routineCount} routine{goal.routineCount !== 1 ? 's' : ''}</span>
                        )}
                      </div>
                      {goal.description && (
                        <p className="text-xs text-kimbie-muted mt-1">{goal.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateGoalMutation.mutate({ id: goal.id, data: { status: cycleStatus(goal.status) } })}
                        className={`px-2 py-1 text-xs rounded-md border ${
                          goal.status === 'active'
                            ? 'bg-kimbie-green/20 border-kimbie-green text-kimbie-green'
                            : goal.status === 'paused'
                            ? 'bg-kimbie-yellow/20 border-kimbie-yellow text-kimbie-yellow'
                            : 'border-kimbie-border text-kimbie-muted'
                        }`}
                      >
                        {goal.status}
                      </button>
                      <button
                        onClick={() => deleteGoalMutation.mutate(goal.id)}
                        className="text-xs text-kimbie-red hover:underline"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Quests Section */}
          {quests && quests.length > 0 && (
            <section>
              <h2 className="text-sm font-medium text-kimbie-muted uppercase tracking-wider mb-3">
                Quests ({quests.length})
              </h2>
              <div className="space-y-2">
                {quests.map((quest: Quest) => (
                  <div key={quest.id} className="bg-kimbie-surface border border-kimbie-border rounded-lg p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-kimbie-text">{quest.name}</span>
                        <span className="text-xs text-kimbie-muted bg-kimbie-bg px-2 py-0.5 rounded">{getAreaName(quest.lifeAreaId)}</span>
                        <span className="text-xs text-kimbie-muted">{quest.estimatedSessions} session{quest.estimatedSessions !== 1 ? 's' : ''} · {quest.durationMinutes}min</span>
                      </div>
                      {quest.doneWhen && (
                        <p className="text-xs text-kimbie-muted mt-1">Done when: {quest.doneWhen}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {quest.status !== 'completed' && (
                        <button
                          onClick={() => updateQuestMutation.mutate({ id: quest.id, data: { status: 'completed' as ItemStatus } })}
                          className="px-2 py-1 text-xs rounded-md border border-kimbie-green text-kimbie-green hover:bg-kimbie-green/20"
                        >
                          ✓ Done
                        </button>
                      )}
                      <button
                        onClick={() => updateQuestMutation.mutate({ id: quest.id, data: { status: cycleStatus(quest.status) } })}
                        className={`px-2 py-1 text-xs rounded-md border ${
                          quest.status === 'active'
                            ? 'bg-kimbie-green/20 border-kimbie-green text-kimbie-green'
                            : quest.status === 'paused'
                            ? 'bg-kimbie-yellow/20 border-kimbie-yellow text-kimbie-yellow'
                            : quest.status === 'completed'
                            ? 'bg-kimbie-purple/20 border-kimbie-purple text-kimbie-purple'
                            : 'border-kimbie-border text-kimbie-muted'
                        }`}
                      >
                        {quest.status}
                      </button>
                      <button
                        onClick={() => deleteQuestMutation.mutate(quest.id)}
                        className="text-xs text-kimbie-red hover:underline"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {(!goals || goals.length === 0) && (!quests || quests.length === 0) && (
            <p className="text-kimbie-muted text-sm">
              {tab === 'backlog' ? 'Backlog is empty. Add goals or quests to get started!' : 'Nothing here yet.'}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
