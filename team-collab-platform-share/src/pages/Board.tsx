import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import type { DropResult } from '@hello-pangea/dnd'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import { useData } from '../store/DataContext'
import { useAuth } from '../store/AuthContext'
import { can } from '../lib/permissions'
import { TASK_COLUMNS } from '../types'
import type { Task, TaskStatus } from '../types'
import { Button } from '../components/ui/Button'
import { Dialog } from '../components/ui/Dialog'
import { Input, Label, Select, Textarea } from '../components/ui/Input'
import { Avatar } from '../components/ui/Avatar'
import { cn } from '../lib/utils'

const COLUMN_ACCENT: Record<TaskStatus, string> = {
  todo: 'border-t-slate-400',
  'in-progress': 'border-t-amber-400',
  done: 'border-t-emerald-400',
}

export function Board() {
  const { projects, tasks, users, addTask, moveTask, updateTask, deleteTask } = useData()
  const { currentUser } = useAuth()
  const role = currentUser!.role
  const [params, setParams] = useSearchParams()

  const projectId = params.get('project') || projects[0]?.id || ''
  const project = projects.find((p) => p.id === projectId)
  const projectTasks = useMemo(() => tasks.filter((t) => t.projectId === projectId), [tasks, projectId])
  const members = users // team members available for assignment

  const [creating, setCreating] = useState(false)
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [assignee, setAssignee] = useState('')

  function onDragEnd(result: DropResult) {
    const { destination, draggableId } = result
    if (!destination) return
    if (!can.editTask(role)) return
    moveTask(draggableId, destination.droppableId as TaskStatus, currentUser!.id)
  }

  function createTask() {
    if (!title.trim() || !projectId) return
    addTask(
      { title: title.trim(), description: desc.trim(), projectId, assignedTo: assignee || undefined },
      currentUser!.id,
    )
    setTitle('')
    setDesc('')
    setAssignee('')
    setCreating(false)
  }

  if (projects.length === 0) {
    return <div className="rounded-lg border border-border bg-card p-12 text-center text-muted-foreground">Create a project first to use the board.</div>
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Label className="mb-0">Project</Label>
          <Select
            value={projectId}
            onChange={(e) => setParams({ project: e.target.value })}
            className="w-56"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> Add Task
        </Button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid flex-1 gap-4 md:grid-cols-3">
          {TASK_COLUMNS.map((col) => {
            const colTasks = projectTasks.filter((t) => t.status === col.key)
            return (
              <Droppable droppableId={col.key} key={col.key}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      'flex min-h-[200px] flex-col rounded-lg border border-t-4 border-border bg-muted/40 p-3 transition-colors',
                      COLUMN_ACCENT[col.key],
                      snapshot.isDraggingOver && 'bg-primary/5',
                    )}
                  >
                    <div className="mb-3 flex items-center justify-between px-1">
                      <h3 className="text-sm font-semibold">{col.label}</h3>
                      <span className="rounded-full bg-background px-2 py-0.5 text-xs text-muted-foreground">{colTasks.length}</span>
                    </div>
                    <div className="flex-1 space-y-2">
                      {colTasks.map((task, index) => (
                        <Draggable draggableId={task.id} index={index} key={task.id}>
                          {(prov, snap) => (
                            <div
                              ref={prov.innerRef}
                              {...prov.draggableProps}
                              className={cn(
                                'group rounded-lg border border-border bg-card p-3 shadow-sm transition-shadow',
                                snap.isDragging && 'shadow-lg ring-2 ring-primary/40',
                              )}
                            >
                              <TaskCard
                                task={task}
                                dragHandle={prov.dragHandleProps}
                                members={members}
                                canAssign={can.assignTask(role)}
                                canDelete={can.deleteTask(role)}
                                onAssign={(uid) => updateTask(task.id, { assignedTo: uid || undefined }, currentUser!.id)}
                                onDelete={() => deleteTask(task.id, currentUser!.id)}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {colTasks.length === 0 && !snapshot.isDraggingOver && (
                        <p className="px-1 py-6 text-center text-xs text-muted-foreground">No tasks</p>
                      )}
                    </div>
                  </div>
                )}
              </Droppable>
            )
          })}
        </div>
      </DragDropContext>

      <Dialog
        open={creating}
        onClose={() => setCreating(false)}
        title="Add Task"
        description={project ? `in ${project.name}` : undefined}
        footer={
          <>
            <Button variant="outline" onClick={() => setCreating(false)}>
              Cancel
            </Button>
            <Button onClick={createTask} disabled={!title.trim()}>
              Create
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="ttitle">Title</Label>
            <Input id="ttitle" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Fix login redirect" autoFocus />
          </div>
          <div>
            <Label htmlFor="tdesc">Description</Label>
            <Textarea id="tdesc" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Optional details" />
          </div>
          <div>
            <Label htmlFor="tasg">Assign to</Label>
            <Select id="tasg" value={assignee} onChange={(e) => setAssignee(e.target.value)} disabled={!can.assignTask(role)}>
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </Select>
            {!can.assignTask(role) && <p className="mt-1 text-xs text-muted-foreground">Only Admins/Managers can assign.</p>}
          </div>
        </div>
      </Dialog>
    </div>
  )
}

function TaskCard({
  task,
  dragHandle,
  members,
  canAssign,
  canDelete,
  onAssign,
  onDelete,
}: {
  task: Task
  dragHandle: React.HTMLAttributes<HTMLElement> | null | undefined
  members: { id: string; name: string }[]
  canAssign: boolean
  canDelete: boolean
  onAssign: (userId: string) => void
  onDelete: () => void
}) {
  const assignee = members.find((m) => m.id === task.assignedTo)
  return (
    <div>
      <div className="flex items-start gap-2">
        <span {...dragHandle} className="mt-0.5 cursor-grab text-muted-foreground/50 hover:text-muted-foreground active:cursor-grabbing">
          <GripVertical className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-snug">{task.title}</p>
          {task.description && <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{task.description}</p>}
        </div>
        {canDelete && (
          <button onClick={onDelete} className="opacity-0 transition-opacity group-hover:opacity-100" aria-label="Delete task">
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
          </button>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between">
        {assignee ? (
          <div className="flex items-center gap-1.5">
            <Avatar name={assignee.name} id={assignee.id} className="h-6 w-6" />
            <span className="text-xs text-muted-foreground">{assignee.name.split(' ')[0]}</span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">Unassigned</span>
        )}
        {canAssign && (
          <select
            value={task.assignedTo ?? ''}
            onChange={(e) => onAssign(e.target.value)}
            className="rounded border border-border bg-background px-1.5 py-1 text-xs"
            aria-label="Reassign"
          >
            <option value="">—</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name.split(' ')[0]}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  )
}
