import { formatMonthYear } from '../../utils/dates'

export type ViewMode = 'week' | 'month'

interface CalendarToolbarProps {
  currentDate: Date
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  onSync: () => void
  isSyncing: boolean
  onReload: () => void
  isReloading: boolean
}

export default function CalendarToolbar({
  currentDate,
  viewMode,
  onViewModeChange,
  onPrev,
  onNext,
  onToday,
  onSync,
  isSyncing,
  onReload,
  isReloading,
}: CalendarToolbarProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-kimbie-heading">
          {formatMonthYear(currentDate)}
        </h1>
        <div className="flex items-center gap-1">
          <button
            onClick={onPrev}
            className="p-1.5 rounded hover:bg-kimbie-surface text-kimbie-muted hover:text-kimbie-text"
          >
            ‹
          </button>
          <button
            onClick={onToday}
            className="px-2 py-1 text-xs rounded hover:bg-kimbie-surface text-kimbie-muted hover:text-kimbie-text"
          >
            Today
          </button>
          <button
            onClick={onNext}
            className="p-1.5 rounded hover:bg-kimbie-surface text-kimbie-muted hover:text-kimbie-text"
          >
            ›
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex rounded-md border border-kimbie-border overflow-hidden">
          <button
            onClick={() => onViewModeChange('week')}
            className={`px-3 py-1.5 text-xs font-medium ${
              viewMode === 'week'
                ? 'bg-kimbie-accent text-kimbie-bg'
                : 'bg-kimbie-surface text-kimbie-muted hover:text-kimbie-text'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => onViewModeChange('month')}
            className={`px-3 py-1.5 text-xs font-medium ${
              viewMode === 'month'
                ? 'bg-kimbie-accent text-kimbie-bg'
                : 'bg-kimbie-surface text-kimbie-muted hover:text-kimbie-text'
            }`}
          >
            Month
          </button>
        </div>
        <button
          onClick={onSync}
          disabled={isSyncing}
          className="px-3 py-1.5 bg-kimbie-surface border border-kimbie-border text-kimbie-muted rounded-md text-xs font-medium hover:text-kimbie-text disabled:opacity-50"
        >
          {isSyncing ? 'Syncing...' : 'Sync'}
        </button>
        <button
          onClick={onReload}
          disabled={isReloading}
          className="px-3 py-1.5 bg-kimbie-surface border border-kimbie-border text-kimbie-muted rounded-md text-xs font-medium hover:text-kimbie-text disabled:opacity-50"
        >
          {isReloading ? 'Reloading...' : 'Reload'}
        </button>
      </div>
    </div>
  )
}
