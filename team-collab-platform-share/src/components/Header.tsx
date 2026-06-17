import { Moon, Sun, LogOut, Sparkles } from 'lucide-react'
import { useAuth } from '../store/AuthContext'
import { useTheme } from '../hooks/useTheme'
import { Avatar } from './ui/Avatar'
import { Badge } from './ui/Badge'
import { Button } from './ui/Button'
import { ROLE_BADGE, ROLE_LABELS } from '../lib/permissions'

export function Header({ title, onAssistant }: { title: string; onAssistant: () => void }) {
  const { currentUser, signOut } = useAuth()
  const { theme, toggle } = useTheme()

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-4 md:px-6">
      <h1 className="text-lg font-semibold">{title}</h1>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="md:hidden" onClick={onAssistant} aria-label="AI Assistant">
          <Sparkles className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {currentUser && (
          <div className="flex items-center gap-2 rounded-full border border-border py-1 pl-1 pr-2">
            <Avatar name={currentUser.name} id={currentUser.id} />
            <div className="hidden text-right sm:block">
              <div className="text-sm font-medium leading-none">{currentUser.name}</div>
              <Badge className={ROLE_BADGE[currentUser.role] + ' mt-0.5'}>{ROLE_LABELS[currentUser.role]}</Badge>
            </div>
          </div>
        )}

        <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
