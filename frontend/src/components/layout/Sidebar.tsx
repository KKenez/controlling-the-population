import { NavLink } from 'react-router-dom'
import { Calendar, ListChecks, Sparkles, Settings, LayoutDashboard, Archive, StickyNote, ClipboardCheck } from 'lucide-react'
import { sourceColors } from '../../utils/colors'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/calendar', label: 'Calendar', icon: Calendar },
  { to: '/routines', label: 'Routines', icon: ListChecks },
  { to: '/backlog', label: 'Goals & Quests', icon: Archive },
  { to: '/notes', label: 'Quick Notes', icon: StickyNote },
  { to: '/review', label: 'Day Review', icon: ClipboardCheck },
  { to: '/generate', label: 'Generate', icon: Sparkles },
  { to: '/settings', label: 'Settings', icon: Settings },
]

const SOURCE_LABELS: Record<string, string> = {
  work1: 'Work 1',
  work2: 'Work 2',
  personal: 'Personal',
  apple_home: 'Apple Home',
  apple_work: 'Apple Work',
  generated: 'Generated',
}

export default function Sidebar() {
  return (
    <nav className="w-56 border-r border-kimbie-border bg-kimbie-panel flex flex-col">
      <div className="px-4 py-5 font-bold text-lg text-kimbie-cream">
        CtP
      </div>
      <ul className="flex-1 space-y-1 px-2">
        {links.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-kimbie-bg text-kimbie-accent'
                    : 'text-kimbie-muted hover:bg-kimbie-surface hover:text-kimbie-text'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Calendar source legend */}
      <div className="px-4 py-4 border-t border-kimbie-border">
        <p className="text-[10px] uppercase tracking-wider text-kimbie-muted mb-2">Calendars</p>
        <div className="space-y-1.5">
          {Object.entries(sourceColors).map(([source, color]) => (
            <div key={source} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
              <span className="text-xs text-kimbie-text">{SOURCE_LABELS[source] ?? source}</span>
            </div>
          ))}
        </div>
      </div>
    </nav>
  )
}
