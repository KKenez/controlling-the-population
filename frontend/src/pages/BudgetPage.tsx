import { useState } from 'react'
import {
  useBudgetConfig,
  useCategories,
  useWeeklySummary,
  useMonthlySummary,
  useParseSpending,
  useCreateExpenses,
} from '../hooks/useBudget'
import type { ParsedExpenseItem } from '../types/budget'

export default function BudgetPage() {
  const [viewMode, setViewMode] = useState<'weekly' | 'monthly'>('weekly')
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [weekOf, setWeekOf] = useState(new Date().toISOString().split('T')[0])

  const { data: config } = useBudgetConfig()
  const { data: categories } = useCategories()
  const { data: weeklySummary } = useWeeklySummary(weekOf)
  const { data: monthlySummary } = useMonthlySummary(selectedMonth)

  // Spending input state
  const [spendingText, setSpendingText] = useState('')
  const [spendingDate, setSpendingDate] = useState(new Date().toISOString().split('T')[0])
  const [parsedItems, setParsedItems] = useState<ParsedExpenseItem[] | null>(null)
  const [parsedTotal, setParsedTotal] = useState(0)

  const parseMutation = useParseSpending()
  const confirmMutation = useCreateExpenses()

  const handleParse = () => {
    if (!spendingText.trim()) return
    parseMutation.mutate(
      { text: spendingText, date: spendingDate, currency: config?.currency || 'EUR' },
      {
        onSuccess: (data) => {
          setParsedItems(data.items)
          setParsedTotal(data.totalEur)
        },
      }
    )
  }

  const handleConfirm = () => {
    if (!parsedItems || !categories) return
    const items = parsedItems.map((item) => {
      const cat = categories.find((c) => c.name === item.categoryName)
      return {
        amount: item.amount,
        categoryId: cat?.id || categories[categories.length - 1].id, // fallback to "Other"
        description: item.description,
        rawText: item.originalText,
      }
    })
    confirmMutation.mutate(
      { date: spendingDate, items },
      {
        onSuccess: () => {
          setSpendingText('')
          setParsedItems(null)
          setParsedTotal(0)
        },
      }
    )
  }

  const trendIcon = (trend: string) => {
    if (trend === 'up') return '↑'
    if (trend === 'down') return '↓'
    return '→'
  }

  const trendColor = (trend: string) => {
    if (trend === 'up') return 'text-kimbie-red'
    if (trend === 'down') return 'text-kimbie-green'
    return 'text-kimbie-muted'
  }

  const budgetBarColor = (pct: number | null) => {
    if (!pct) return 'bg-kimbie-green'
    if (pct > 100) return 'bg-kimbie-red'
    if (pct > 75) return 'bg-kimbie-yellow'
    return 'bg-kimbie-green'
  }

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-kimbie-heading mb-2">Budget</h1>
      <p className="text-sm text-kimbie-muted mb-6">
        Track spending, compare to your averages, and stay on pace.
      </p>

      {/* ─── Spending Input ─── */}
      <section className="bg-kimbie-surface border border-kimbie-border rounded-lg p-4 mb-8">
        <h2 className="text-sm font-medium text-kimbie-text mb-3">💰 Log Spending</h2>
        <div className="flex items-center gap-3 mb-3">
          <input
            type="date"
            value={spendingDate}
            onChange={(e) => setSpendingDate(e.target.value)}
            className="px-3 py-1.5 bg-kimbie-bg border border-kimbie-border rounded-md text-sm text-kimbie-text"
          />
          <span className="text-xs text-kimbie-muted">
            Currency: {config?.currency || 'EUR'}
          </span>
        </div>
        <textarea
          value={spendingText}
          onChange={(e) => setSpendingText(e.target.value)}
          placeholder="Describe what you spent today, e.g.&#10;Spar 42, lunch with Jake 15, Bolt home 8, Netflix 12.99"
          rows={3}
          className="w-full px-3 py-2 bg-kimbie-bg border border-kimbie-border rounded-md text-sm text-kimbie-text placeholder-kimbie-muted focus:outline-none focus:ring-1 focus:ring-kimbie-accent mb-3"
        />
        <button
          onClick={handleParse}
          disabled={!spendingText.trim() || parseMutation.isPending}
          className="px-4 py-2 bg-kimbie-accent text-kimbie-bg rounded-md text-sm font-medium hover:brightness-110 disabled:opacity-50"
        >
          {parseMutation.isPending ? 'Parsing...' : 'Parse with AI'}
        </button>

        {/* Parsed results */}
        {parsedItems && (
          <div className="mt-4 border-t border-kimbie-border pt-4">
            <p className="text-xs text-kimbie-muted mb-2">AI categorized your spending:</p>
            <div className="space-y-2 mb-3">
              {parsedItems.map((item, i) => {
                const cat = categories?.find((c) => c.name === item.categoryName)
                return (
                  <div key={i} className="flex items-center justify-between bg-kimbie-bg rounded-md px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span>{cat?.emoji || '💰'}</span>
                      <span className="text-sm text-kimbie-text">{item.description}</span>
                      <span className="text-xs text-kimbie-muted">({item.categoryName})</span>
                    </div>
                    <span className="text-sm font-medium text-kimbie-text">
                      €{item.amount.toFixed(2)}
                    </span>
                  </div>
                )
              })}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-kimbie-text">
                Total: €{parsedTotal.toFixed(2)}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => { setParsedItems(null); setParsedTotal(0) }}
                  className="px-3 py-1.5 text-xs text-kimbie-muted hover:text-kimbie-text border border-kimbie-border rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={confirmMutation.isPending}
                  className="px-4 py-1.5 bg-kimbie-green text-kimbie-bg rounded-md text-xs font-medium hover:brightness-110 disabled:opacity-50"
                >
                  {confirmMutation.isPending ? 'Saving...' : '✓ Confirm & Save'}
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ─── View Toggle ─── */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setViewMode('weekly')}
          className={`text-sm font-medium px-3 py-1.5 rounded-md ${
            viewMode === 'weekly' ? 'bg-kimbie-accent text-kimbie-bg' : 'text-kimbie-muted hover:text-kimbie-text'
          }`}
        >
          Weekly
        </button>
        <button
          onClick={() => setViewMode('monthly')}
          className={`text-sm font-medium px-3 py-1.5 rounded-md ${
            viewMode === 'monthly' ? 'bg-kimbie-accent text-kimbie-bg' : 'text-kimbie-muted hover:text-kimbie-text'
          }`}
        >
          Monthly
        </button>

        {viewMode === 'weekly' && (
          <input
            type="date"
            value={weekOf}
            onChange={(e) => setWeekOf(e.target.value)}
            className="ml-auto px-3 py-1.5 bg-kimbie-bg border border-kimbie-border rounded-md text-sm text-kimbie-text"
          />
        )}
        {viewMode === 'monthly' && (
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="ml-auto px-3 py-1.5 bg-kimbie-bg border border-kimbie-border rounded-md text-sm text-kimbie-text"
          />
        )}
      </div>

      {/* ─── Weekly View ─── */}
      {viewMode === 'weekly' && weeklySummary && (
        <section>
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-kimbie-text">
                Week of {weeklySummary.weekStart}
              </h2>
              <p className="text-sm text-kimbie-muted">
                to {weeklySummary.weekEnd}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-kimbie-heading">
                €{weeklySummary.totalSpent.toFixed(2)}
              </p>
              <div className="flex gap-3 text-xs">
                {weeklySummary.vsLastWeekPct !== null && (
                  <span className={weeklySummary.vsLastWeekPct > 0 ? 'text-kimbie-red' : 'text-kimbie-green'}>
                    {weeklySummary.vsLastWeekPct > 0 ? '+' : ''}{weeklySummary.vsLastWeekPct.toFixed(1)}% vs last week
                  </span>
                )}
                {weeklySummary.vsAvgPct !== null && (
                  <span className={weeklySummary.vsAvgPct > 0 ? 'text-kimbie-red' : 'text-kimbie-green'}>
                    {weeklySummary.vsAvgPct > 0 ? '+' : ''}{weeklySummary.vsAvgPct.toFixed(1)}% vs avg
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {weeklySummary.categories.map((cat) => (
              <div key={cat.categoryId} className="bg-kimbie-surface border border-kimbie-border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span>{cat.emoji}</span>
                    <span className="text-sm font-medium text-kimbie-text">{cat.categoryName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-kimbie-text">
                      €{cat.spent.toFixed(2)}
                      {cat.budget && (
                        <span className="text-kimbie-muted font-normal"> / €{cat.budget.toFixed(2)}</span>
                      )}
                    </span>
                    {cat.vsAvgPct !== null && (
                      <span className={`text-xs font-medium ${trendColor(cat.trend)}`}>
                        {trendIcon(cat.trend)} {cat.vsAvgPct > 0 ? '+' : ''}{cat.vsAvgPct.toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>
                {cat.budget && (
                  <div className="w-full h-2 bg-kimbie-bg rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${budgetBarColor(cat.pctOfBudget)}`}
                      style={{ width: `${Math.min(cat.pctOfBudget || 0, 100)}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {weeklySummary.categories.length === 0 && (
            <p className="text-sm text-kimbie-muted text-center py-8">
              No spending recorded this week. Log some above!
            </p>
          )}
        </section>
      )}

      {/* ─── Monthly View ─── */}
      {viewMode === 'monthly' && monthlySummary && (
        <section>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-lg font-semibold text-kimbie-text">
              {new Date(monthlySummary.month + '-01').toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </h2>
            <div className="text-right">
              <p className="text-xl font-bold text-kimbie-heading">
                €{monthlySummary.totalSpent.toFixed(2)}
                {monthlySummary.totalBudget && (
                  <span className="text-sm text-kimbie-muted font-normal">
                    {' '}/ €{monthlySummary.totalBudget.toFixed(2)}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Monthly category bars */}
          <div className="space-y-3 mb-8">
            {monthlySummary.categories.map((cat) => (
              <div key={cat.categoryId} className="bg-kimbie-surface border border-kimbie-border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span>{cat.emoji}</span>
                    <span className="text-sm font-medium text-kimbie-text">{cat.categoryName}</span>
                  </div>
                  <span className="text-sm font-medium text-kimbie-text">
                    €{cat.spent.toFixed(2)}
                    {cat.budget && (
                      <span className="text-kimbie-muted font-normal"> / €{cat.budget.toFixed(2)}</span>
                    )}
                  </span>
                </div>
                {cat.budget && (
                  <div className="w-full h-2 bg-kimbie-bg rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${budgetBarColor(cat.pctOfBudget)}`}
                      style={{ width: `${Math.min(cat.pctOfBudget || 0, 100)}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Weekly breakdown */}
          {monthlySummary.weeks.length > 0 && (
            <>
              <h3 className="text-sm font-medium text-kimbie-muted uppercase tracking-wider mb-3">
                Weekly Breakdown
              </h3>
              <div className="space-y-3">
                {monthlySummary.weeks.map((week) => (
                  <div key={week.weekStart} className="bg-kimbie-surface border border-kimbie-border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-kimbie-text">
                        {week.weekStart} — {week.weekEnd}
                      </span>
                      <span className="text-sm font-medium text-kimbie-heading">
                        €{week.totalSpent.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {week.categories.map((cat) => (
                        <span
                          key={cat.categoryId}
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: cat.color + '20', color: cat.color }}
                        >
                          {cat.emoji} €{cat.spent.toFixed(0)}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {monthlySummary.categories.length === 0 && (
            <p className="text-sm text-kimbie-muted text-center py-8">
              No spending recorded this month.
            </p>
          )}
        </section>
      )}
    </div>
  )
}
