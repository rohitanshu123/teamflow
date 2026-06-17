import { Mail, Crown } from 'lucide-react'
import { useData } from '../store/DataContext'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Avatar } from '../components/ui/Avatar'
import { Badge } from '../components/ui/Badge'
import { ROLE_BADGE, ROLE_LABELS } from '../lib/permissions'
import { timeAgo } from '../lib/utils'

export function Team() {
  const { team, users, tasks, activity, userById } = useData()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{team.name}</CardTitle>
          <p className="text-sm text-muted-foreground">{team.description}</p>
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">MEMBERS ({users.length})</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {users.map((u) => {
              const open = tasks.filter((t) => t.assignedTo === u.id && t.status !== 'done').length
              return (
                <Card key={u.id}>
                  <CardContent className="flex items-center gap-3 p-4">
                    <Avatar name={u.name} id={u.id} className="h-11 w-11 text-sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate font-medium">{u.name}</p>
                        {u.id === team.adminId && <Crown className="h-3.5 w-3.5 text-amber-500" />}
                      </div>
                      <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" /> {u.email}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <Badge className={ROLE_BADGE[u.role]}>{ROLE_LABELS[u.role]}</Badge>
                        <span className="text-xs text-muted-foreground">{open} open task(s)</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">ACTIVITY LOG</h3>
          <Card>
            <CardContent className="space-y-3 p-4">
              {activity.map((a) => {
                const actor = userById(a.actorId)
                return (
                  <div key={a.id} className="flex gap-3 text-sm">
                    <Avatar name={actor?.name ?? '?'} id={a.actorId} className="h-7 w-7" />
                    <div className="min-w-0">
                      <p className="leading-snug">
                        <span className="font-medium">{actor?.name?.split(' ')[0] ?? 'Someone'}</span>{' '}
                        <span className="text-muted-foreground">{a.text}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{timeAgo(a.timestamp)}</p>
                    </div>
                  </div>
                )
              })}
              {activity.length === 0 && <p className="text-sm text-muted-foreground">No activity yet.</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
