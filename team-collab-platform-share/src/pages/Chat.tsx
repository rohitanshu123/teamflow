import { useEffect, useRef, useState } from 'react'
import { Send, Radio } from 'lucide-react'
import { useData } from '../store/DataContext'
import { useAuth } from '../store/AuthContext'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { cn, clockTime } from '../lib/utils'

export function Chat() {
  const { messages, sendMessage, userById, team } = useData()
  const { currentUser } = useAuth()
  const [text, setText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() || !currentUser) return
    sendMessage(text.trim(), currentUser.id)
    setText('')
  }

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div>
          <h2 className="font-semibold">{team.name} · Team Chat</h2>
          <p className="text-xs text-muted-foreground">{messages.length} messages</p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          <Radio className="h-3.5 w-3.5 animate-pulse" /> Live
        </span>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-5">
        {messages.map((m) => {
          const sender = userById(m.senderId)
          const mine = m.senderId === currentUser?.id
          return (
            <div key={m.id} className={cn('flex gap-2.5', mine && 'flex-row-reverse')}>
              <Avatar name={sender?.name ?? '?'} id={m.senderId} className="h-8 w-8" />
              <div className={cn('max-w-[75%]', mine && 'items-end text-right')}>
                <div className={cn('mb-0.5 flex items-center gap-2 text-xs text-muted-foreground', mine && 'flex-row-reverse')}>
                  <span className="font-medium text-foreground">{mine ? 'You' : sender?.name ?? 'Unknown'}</span>
                  <span>{clockTime(m.timestamp)}</span>
                </div>
                <div
                  className={cn(
                    'inline-block whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm',
                    mine ? 'rounded-br-sm bg-primary text-primary-foreground' : 'rounded-bl-sm bg-muted text-foreground',
                  )}
                >
                  {m.content}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={submit} className="flex gap-2 border-t border-border p-3">
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message…" />
        <Button type="submit" disabled={!text.trim()}>
          <Send className="h-4 w-4" /> Send
        </Button>
      </form>
    </div>
  )
}
