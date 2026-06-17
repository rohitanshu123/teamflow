import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, FolderKanban, ArrowRight } from 'lucide-react'
import { useData } from '../store/DataContext'
import { useAuth } from '../store/AuthContext'
import { can } from '../lib/permissions'
import type { Project } from '../types'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Dialog } from '../components/ui/Dialog'
import { Input, Label, Textarea } from '../components/ui/Input'
import { timeAgo } from '../lib/utils'

export function Projects() {
  const { projects, tasks, addProject, updateProject, deleteProject } = useData()
  const { currentUser } = useAuth()
  const role = currentUser!.role

  const [editing, setEditing] = useState<Project | null>(null)
  const [creating, setCreating] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<Project | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  function openCreate() {
    setName('')
    setDescription('')
    setCreating(true)
  }
  function openEdit(p: Project) {
    setName(p.name)
    setDescription(p.description ?? '')
    setEditing(p)
  }
  function save() {
    if (!name.trim()) return
    if (editing) updateProject(editing.id, { name: name.trim(), description: description.trim() }, currentUser!.id)
    else addProject({ name: name.trim(), description: description.trim() }, currentUser!.id)
    setEditing(null)
    setCreating(false)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{projects.length} project(s)</p>
        {can.createProject(role) && (
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> New Project
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => {
          const pt = tasks.filter((t) => t.projectId === p.id)
          const done = pt.filter((t) => t.status === 'done').length
          const pct = pt.length ? Math.round((done / pt.length) * 100) : 0
          return (
            <Card key={p.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <FolderKanban className="h-4.5 w-4.5" />
                  </span>
                  <div className="flex gap-1">
                    {can.editProject(role) && (
                      <Button variant="ghost" size="icon" onClick={() => openEdit(p)} aria-label="Edit">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    {can.deleteProject(role) && (
                      <Button variant="ghost" size="icon" onClick={() => setConfirmDelete(p)} aria-label="Delete">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
                <CardTitle className="mt-2">{p.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <p className="line-clamp-2 min-h-[40px] text-sm text-muted-foreground">{p.description || 'No description.'}</p>
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                    <span>{done}/{pt.length} done</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                  <span className="text-xs text-muted-foreground">Created {timeAgo(p.createdAt)}</span>
                  <Link to={`/board?project=${p.id}`} className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                    Board <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {projects.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">No projects yet. Create your first one.</CardContent>
        </Card>
      )}

      <Dialog
        open={creating || !!editing}
        onClose={() => {
          setCreating(false)
          setEditing(null)
        }}
        title={editing ? 'Edit Project' : 'New Project'}
        footer={
          <>
            <Button variant="outline" onClick={() => { setCreating(false); setEditing(null) }}>
              Cancel
            </Button>
            <Button onClick={save} disabled={!name.trim()}>
              {editing ? 'Save' : 'Create'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="pname">Name</Label>
            <Input id="pname" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Q3 Marketing Site" autoFocus />
          </div>
          <div>
            <Label htmlFor="pdesc">Description</Label>
            <Textarea id="pdesc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional summary" />
          </div>
        </div>
      </Dialog>

      <Dialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Delete project?"
        description={`"${confirmDelete?.name}" and all its tasks will be removed. This can't be undone.`}
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirmDelete) deleteProject(confirmDelete.id, currentUser!.id)
                setConfirmDelete(null)
              }}
            >
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">Only Admins can delete projects.</p>
      </Dialog>
    </div>
  )
}
