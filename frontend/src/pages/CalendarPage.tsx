import { useEvents, useSyncCalendars } from '../hooks/useEvents'

export default function CalendarPage() {
  const { data: events, isLoading } = useEvents()
  const syncMutation = useSyncCalendars()

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
        <button
          onClick={() => syncMutation.mutate()}
          disabled={syncMutation.isPending}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {syncMutation.isPending ? 'Syncing...' : 'Sync Calendars'}
        </button>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Loading events...</p>
      ) : !events?.length ? (
        <p className="text-gray-500">No events. Sync your calendars or generate a week.</p>
      ) : (
        <div className="space-y-2">
          {events.map((event) => (
            <div key={event.id} className="flex items-center gap-3 bg-white border border-gray-200 rounded-md p-3">
              <div className="w-2 h-2 rounded-full bg-indigo-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{event.title}</p>
                <p className="text-xs text-gray-500">{event.start} — {event.end}</p>
              </div>
              <span className="text-xs text-gray-400">{event.source}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
