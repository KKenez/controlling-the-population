import { useState } from 'react'
import { useEvents, useSyncCalendars } from '../hooks/useEvents'
import CalendarToolbar, { type ViewMode } from '../components/calendar/CalendarToolbar'
import WeekView from '../components/calendar/WeekView'
import MonthView from '../components/calendar/MonthView'
import { addDays, addMonths } from '../utils/dates'

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('week')

  const { data: events, isLoading, isFetching, refetch } = useEvents()
  const syncMutation = useSyncCalendars()

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
      />

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-kimbie-muted">Loading events...</p>
        </div>
      ) : viewMode === 'week' ? (
        <WeekView currentDate={currentDate} events={events ?? []} />
      ) : (
        <MonthView currentDate={currentDate} events={events ?? []} />
      )}
    </div>
  )
}
