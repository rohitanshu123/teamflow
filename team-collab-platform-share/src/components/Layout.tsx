import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { Assistant } from './Assistant'

const TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/projects': 'Projects',
  '/board': 'Kanban Board',
  '/chat': 'Team Chat',
  '/team': 'Team Overview',
}

export function Layout() {
  const [assistantOpen, setAssistantOpen] = useState(false)
  const { pathname } = useLocation()
  const title = TITLES[pathname] ?? 'TeamFlow'

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar onAssistant={() => setAssistantOpen(true)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header title={title} onAssistant={() => setAssistantOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6">
          <Outlet />
        </main>
      </div>
      <Assistant open={assistantOpen} onClose={() => setAssistantOpen(false)} />
    </div>
  )
}
