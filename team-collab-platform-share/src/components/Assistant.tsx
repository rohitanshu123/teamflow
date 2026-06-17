import { useEffect, useRef, useState } from 'react'
import { Sparkles, X, Send } from 'lucide-react'
import { useData } from '../store/DataContext'
import { useAuth } from '../store/AuthContext'
import { parseCommand } from '../lib/assistant'
import { cn } from '../lib/utils'
import { Button } from './ui/Button'
import { Input } from './ui/Input'

interface ChatTurn {
  role: 'user' | 'assistant'
  text: string
}

const SUGGESTIONS = [
  'create task "Fix login bug" in Mobile App v2',
  'move "Onboarding screens" to in progress',
  'show my tasks',
]

export function Assistant({ open, onClose }: { open: boolean; onClose: () => void }) {
  const data = useData()
  const { currentUser } = useAuth()
  const [input, setInput] = useState('')
  const [turns, setTurns] = useState<ChatTurn[]>([
    { role: 'assistant', text: 'Hi! I can create, move, assign, and list tasks in plain English. Type "help" to see examples.' },
  ])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [turns, open])

  function run(text: string) {
    if (!text.trim() || !currentUser) return
    const intent = parseCommand(text, {
      projects: data.projects,
      users: data.users,
      tasks: data.tasks,
      currentUser,
    })

    // Execute side effects for actionable intents.
    switch (intent.kind) {
      case 'create':
        data.addTask({ title: intent.title, projectId: intent.projectId, assignedTo: intent.assignedTo, status: intent.status }, currentUser.id)
        break
      case 'move':
        data.moveTask(intent.taskId, intent.status, currentUser.id)
        break
      case 'assign':
        data.updateTask(intent.taskId, { assignedTo: intent.userId }, currentUser.id)
        break
      case 'delete':
        data.deleteTask(intent.taskId, currentUser.id)
        break
      case 'reply':
        break
    }

    setTurns((t) => [...t, { role: 'user', text }, { role: 'assistant', text: intent.reply }])
    setInput('')
  }

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={onClose} aria-hidden />}
      <div
        className={cn(
          'fixed right-0 top-0 z-50 flex h-screen w-full max-w-md flex-col border-l border-border bg-card shadow-2xl transition-transform duration-300',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-violet-500 to-primary text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-semibold">Task Assistant</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close assistant">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
          {turns.map((turn, i) => (
            <div key={i} className={cn('flex', turn.role === 'user' ? 'justify-end' : 'justify-start')}>
              <div
                className={cn(
                  'max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2 text-sm',
                  turn.role === 'user' ? 'rounded-br-sm bg-primary text-primary-foreground' : 'rounded-bl-sm bg-muted text-foreground',
                )}
              >
                {turn.text}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-border p-3">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => run(s)}
                className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {s}
              </button>
            ))}
          </div>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              run(input)
            }}
          >
            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder='Try: create task "..." in ...' autoFocus={open} />
            <Button type="submit" size="icon" aria-label="Send">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </>
  )
}
