import { NavLink } from 'react-router-dom'
import { LayoutDashboard, FolderKanban, LayoutGrid, MessagesSquare, Users, Sparkles } from 'lucide-react'
import { cn } from '../lib/utils'

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/board', label: 'Kanban Board', icon: LayoutGrid },
  { to: '/chat', label: 'Team Chat', icon: MessagesSquare },
  { to: '/team', label: 'Team', icon: Users },
]

export function Sidebar({ onAssistant }: { onAssistant: () => void }) {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card md:flex">
      <div className="flex h-16 items-center gap-2 border-b border-border px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <LayoutGrid className="h-5 w-5" />
        </div>
        <span className="text-lg font-bold tracking-tight">TeamFlow</span>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3">
        <button
          onClick={onAssistant}
          className="flex w-full items-center gap-3 rounded-md bg-gradient-to-r from-violet-500 to-primary px-3 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <Sparkles className="h-4 w-4" />
          AI Assistant
        </button>
      </div>
    </aside>
  )
}
