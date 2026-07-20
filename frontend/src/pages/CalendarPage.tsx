import { useEvents, useSyncCalendars } from '../hooks/useEvents'

export default function CalendarPage() {
  const { data: events, isLoading } = useEvents()
  const syncMutation = useSyncCalendars()

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-kimbie-heading">Calendar</h1>
        <button
          onClick={() => syncMutation.mutate()}
          disabled={syncMutation.isPending}
          className="px-4 py-2 bg-kimbie-accent text-kimbie-bg rounded-md text-sm font-medium hover:brightness-110 disabled:opacity-50"
        >
          {syncMutation.isPending ? 'Syncing...' : 'Sync Calendars'}
        </button>
      </div>

      {isLoading ? (
        <p className="text-kimbie-muted">Loading events...</p>
      ) : !events?.length ? (
        <p className="text-kimbie-muted">No events. Sync your calendars or generate a week.</p>
      ) : (
        <div className="space-y-2">
          {events.map((event) => (
            <div key={event.id} className="flex items-center gap-3 bg-kimbie-surface border border-kimbie-border rounded-md p-3">
              <div className="w-2 h-2 rounded-full bg-kimbie-accent" />
              <div className="flex-1">
                <p className="text-sm font-medium text-kimbie-text">{event.title}</p>
                <p className="text-xs text-kimbie-muted">{event.start} — {event.end}</p>
              </div>
              <span className="text-xs text-kimbie-muted">{event.source}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
