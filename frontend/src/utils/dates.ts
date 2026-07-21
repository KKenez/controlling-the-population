/**
 * Date utility helpers for calendar views.
 */

/** Get Monday of the week containing the given date. */
export function startOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day // Monday = 1
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

/** Get Sunday (end) of the week containing the given date. */
export function endOfWeek(date: Date): Date {
  const start = startOfWeek(date)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return end
}

/** Get the first day to show in a month grid (Monday of the week containing the 1st). */
export function startOfMonthGrid(date: Date): Date {
  const first = new Date(date.getFullYear(), date.getMonth(), 1)
  return startOfWeek(first)
}

/** Get the last day to show in a month grid (Sunday of the week containing the last day). */
export function endOfMonthGrid(date: Date): Date {
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  return endOfWeek(last)
}

/** Get array of 7 dates starting from the Monday of the given date's week. */
export function getWeekDays(date: Date): Date[] {
  const start = startOfWeek(date)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    return d
  })
}

/** Get all dates for a month grid (6 weeks max). */
export function getMonthDays(date: Date): Date[] {
  const start = startOfMonthGrid(date)
  const end = endOfMonthGrid(date)
  const days: Date[] = []
  const current = new Date(start)
  while (current <= end) {
    days.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }
  return days
}

/** Add days to a date. */
export function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

/** Add months to a date. */
export function addMonths(date: Date, months: number): Date {
  const d = new Date(date)
  d.setMonth(d.getMonth() + months)
  return d
}

/** Format time as HH:MM. */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
}

/** Format a short day header like "Mon 21". */
export function formatDayHeader(date: Date): string {
  return date.toLocaleDateString([], { weekday: 'short', day: 'numeric' })
}

/** Format month/year like "July 2026". */
export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString([], { month: 'long', year: 'numeric' })
}

/** Check if two dates are the same calendar day. */
export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

/** Check if a date is today. */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date())
}
