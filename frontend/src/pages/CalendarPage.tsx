import { useState, useEffect } from 'react'
import type { CalendarEvent } from '../types/event'
import { useEvents, useSyncCalendars, useCreateEvent, useUpdateEvent, useDeleteEvent } from '../hooks/useEvents'
import CalendarToolbar, { type ViewMode } from '../components/calendar/CalendarToolbar'
import WeekView from '../components/calendar/WeekView'
import MonthView from '../components/calendar/MonthView'
import Modal from '../components/common/Modal'
import AddEventForm from '../components/calendar/AddEventForm'
import EventDetailModal from '../components/calendar/EventDetailModal'
import { addDays, addMonths } from '../utils/dates'

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('week')
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  const { data: events, isLoading, isFetching, refetch } = useEvents()
  const syncMutation = useSyncCalendars()
  const createMutation = useCreateEvent()
  const updateMutation = useUpdateEvent()
  const deleteMutation = useDeleteEvent()

  // Auto-sync on first load
  useEffect(() => {
    syncMutation.mutate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handlePrev() {
    setCurrentDate((d) => (viewMode === 'week' ? addDays(d, -7) : addMonths(d, -1)))
  }

  function handleNext() {
    setCurrentDate((d) => (viewMode === 'week' ? addDays(d, 7) : addMonths(d, 1)))
  }

  function handleToday() {
    setCurrentDate(new Date())
  }

  return (
    <div className="flex flex-col h-full p-4">
      <CalendarToolbar
        currentDate={currentDate}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
        onSync={() => syncMutation.mutate()}
        isSyncing={syncMutation.isPending}
        onReload={() => refetch()}
        isReloading={isFetching}
        onAdd={() => setShowAddEvent(true)}
      />

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-kimbie-muted">Loading events...</p>
        </div>
      ) : viewMode === 'week' ? (
        <WeekView currentDate={currentDate} events={events ?? []} onEventClick={setSelectedEvent} />
      ) : (
        <MonthView currentDate={currentDate} events={events ?? []} onEventClick={setSelectedEvent} />
      )}

      {/* Add Event Modal */}
      <Modal open={showAddEvent} onClose={() => setShowAddEvent(false)} title="Add Event">
        <AddEventForm
          isPending={createMutation.isPending}
          onCancel={() => setShowAddEvent(false)}
          onSubmit={(data) => {
            createMutation.mutate(data, {
              onSuccess: () => setShowAddEvent(false),
            })
          }}
        />
      </Modal>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onUpdate={(id, data) => {
            updateMutation.mutate(
              { id, payload: data },
              { onSuccess: () => setSelectedEvent(null) }
            )
          }}
          onDelete={(id) => {
            deleteMutation.mutate(id, {
              onSuccess: () => setSelectedEvent(null),
            })
          }}
          isUpdating={updateMutation.isPending}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </div>
  )
}
