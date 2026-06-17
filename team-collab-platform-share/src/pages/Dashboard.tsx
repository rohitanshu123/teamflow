import { Link } from 'react-router-dom'
import { FolderKanban, CheckCircle2, Loader2, ListTodo, ArrowRight } from 'lucide-react'
import { useData } from '../store/DataContext'
import { useAuth } from '../store/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Avatar } from '../components/ui/Avatar'
import { timeAgo } from '../lib/utils'

export function Dashboard() {
  const { projects, tasks, activity, userById } = useData()
  const { currentUser } = useAuth()

  const done = tasks.filter((t) => t.status === 'done').length
  const inProgress = tasks.filter((t) => t.status === 'in-progress').length
  const todo = tasks.filter((t) => t.status === 'todo').length
  const myTasks = tasks.filter((t) => t.assignedTo === currentUser?.id)

  const stats = [
    { label: 'Projects', value: projects.length, icon: FolderKanban, color: 'text-primary' },
    { label: 'To Do', value: todo, icon: ListTodo, color: 'text-slate-500' },
    { label: 'In Progress', value: inProgress, icon: Loader2, color: 'text-amber-500' },
    { label: 'Done', value: done, icon: CheckCircle2, color: 'text-emerald-500' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Welcome back, {currentUser?.name.split(' ')[0]} 👋</h2>
        <p className="text-sm text-muted-foreground">
          You have {myTasks.filter((t) => t.status !== 'done').length} open task(s) assigned to you.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-1 text-2xl font-bold">{value}</p>
              </div>
              <Icon className={`h-8 w-8 ${color}`} />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Project Progress</CardTitle>
            <Link to="/projects" className="flex items-center gap-1 text-sm text-primary hover:underline">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {projects.map((p) => {
              const pt = tasks.filter((t) => t.projectId === p.id)
              const pct = pt.length ? Math.round((pt.filter((t) => t.status === 'done').length / pt.length) * 100) : 0
              return (
                <div key={p.id}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium">{p.name}</span>
                    <span className="text-muted-foreground">{pct}% · {pt.length} tasks</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
            {projects.length === 0 && <p className="text-sm text-muted-foreground">No projects yet.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activity.slice(0, 8).map((a) => {
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
  )
}
