import { NavLink } from 'react-router-dom'
import { Calendar, ListChecks, Sparkles, Settings } from 'lucide-react'

const links = [
  { to: '/calendar', label: 'Calendar', icon: Calendar },
  { to: '/routines', label: 'Routines', icon: ListChecks },
  { to: '/generate', label: 'Generate', icon: Sparkles },
  { to: '/settings', label: 'Settings', icon: Settings },
]

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
    </nav>
  )
}
