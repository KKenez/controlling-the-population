import { useAiStatus } from '../hooks/useGeneration'
import { useMutation } from '@tanstack/react-query'
import { apiPost } from '../api/client'

export default function SettingsPage() {
  const { data: aiStatus, isLoading: aiLoading, refetch: refetchAi } = useAiStatus()

  const syncMutation = useMutation({
    mutationFn: () => apiPost('/api/events/sync', {}),
  })

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-kimbie-heading mb-6">Settings</h1>

      {/* AI Model Status */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-kimbie-heading mb-3">AI Model</h2>
        <div className="bg-kimbie-surface border border-kimbie-border rounded-lg p-4 space-y-3">
          {aiLoading ? (
            <p className="text-sm text-kimbie-muted">Checking AI status...</p>
          ) : aiStatus ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-kimbie-text">Ollama</span>
                <StatusDot ok={aiStatus.ollama_reachable} label={aiStatus.ollama_reachable ? 'Connected' : 'Unreachable'} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-kimbie-text">Model</span>
                <span className="text-sm text-kimbie-muted font-mono">{aiStatus.model}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-kimbie-text">Model Status</span>
                <StatusDot ok={aiStatus.model_ready} label={aiStatus.model_ready ? 'Ready' : 'Not downloaded'} />
              </div>
              {aiStatus.available_models.length > 0 && (
                <div>
                  <span className="text-xs text-kimbie-muted">Available models:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {aiStatus.available_models.map((m: string) => (
                      <span key={m} className="text-xs bg-kimbie-bg px-2 py-0.5 rounded font-mono text-kimbie-text">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <button
                onClick={() => refetchAi()}
                className="text-xs text-kimbie-accent hover:underline"
              >
                Refresh status
              </button>
            </>
          ) : (
            <p className="text-sm text-kimbie-red">Failed to check AI status</p>
          )}

          {!aiStatus?.ollama_reachable && (
            <div className="mt-2 p-3 bg-kimbie-bg rounded-md">
              <p className="text-xs text-kimbie-muted">
                Start Ollama with <code className="bg-kimbie-panel px-1 rounded">ollama serve</code> to enable AI generation.
              </p>
            </div>
          )}
          {aiStatus?.ollama_reachable && !aiStatus.model_ready && (
            <div className="mt-2 p-3 bg-kimbie-bg rounded-md">
              <p className="text-xs text-kimbie-muted">
                Pull the model with <code className="bg-kimbie-panel px-1 rounded">ollama pull {aiStatus.model}</code>
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Calendar Connections */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-kimbie-heading mb-3">Calendar Connections</h2>
        <div className="bg-kimbie-surface border border-kimbie-border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-kimbie-text">Apple Home Calendar</p>
              <p className="text-xs text-kimbie-muted">ICS subscription sync</p>
            </div>
            <StatusDot ok={true} label="Configured" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-kimbie-text">Apple Work Calendar</p>
              <p className="text-xs text-kimbie-muted">ICS subscription sync</p>
            </div>
            <StatusDot ok={true} label="Configured" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-kimbie-text">Work 1 / Work 2 (Outlook)</p>
              <p className="text-xs text-kimbie-muted">Manual entry only (org blocks API access)</p>
            </div>
            <span className="text-xs text-kimbie-yellow">Manual</span>
          </div>

          <div className="pt-2 border-t border-kimbie-border">
            <button
              onClick={() => syncMutation.mutate()}
              disabled={syncMutation.isPending}
              className="px-3 py-1.5 bg-kimbie-accent text-kimbie-bg rounded-md text-sm font-medium hover:brightness-110 disabled:opacity-50"
            >
              {syncMutation.isPending ? 'Syncing...' : 'Sync Apple Calendars Now'}
            </button>
            {syncMutation.isSuccess && (
              <span className="ml-3 text-xs text-kimbie-green">Synced successfully</span>
            )}
            {syncMutation.isError && (
              <span className="ml-3 text-xs text-kimbie-red">Sync failed</span>
            )}
          </div>
        </div>
      </section>

      {/* About */}
      <section>
        <h2 className="text-lg font-semibold text-kimbie-heading mb-3">About</h2>
        <div className="bg-kimbie-surface border border-kimbie-border rounded-lg p-4">
          <p className="text-sm text-kimbie-text font-medium">Controlling the Population</p>
          <p className="text-xs text-kimbie-muted mt-1">Personal life management system with AI-powered scheduling</p>
          <p className="text-xs text-kimbie-muted mt-1">MVP 1 — Self-hosted on Windows</p>
        </div>
      </section>
    </div>
  )
}

function StatusDot({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full ${ok ? 'bg-kimbie-green' : 'bg-kimbie-red'}`} />
      <span className={`text-xs ${ok ? 'text-kimbie-green' : 'text-kimbie-red'}`}>{label}</span>
    </span>
  )
}
