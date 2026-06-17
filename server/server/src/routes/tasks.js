import { Router } from 'express'
import { Project, Task } from '../models/index.js'
import { authenticate, requireRole } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { taskCreateSchema, taskUpdateSchema } from '../validation/schemas.js'
import { emitToTeam } from '../socket.js'

const router = Router()
router.use(authenticate)

/** Ensure a project exists and belongs to the caller's team. */
async function assertProjectInTeam(projectId, teamId) {
  return Project.findOne({ _id: projectId, teamId })
}

/** GET /api/tasks?projectId=... — tasks for a project (team-scoped). */
router.get('/', async (req, res) => {
  const { projectId } = req.query
  if (!projectId) return res.status(400).json({ error: 'projectId query param is required.' })
  const project = await assertProjectInTeam(projectId, req.user.teamId)
  if (!project) return res.status(404).json({ error: 'Project not found.' })
  const tasks = await Task.find({ projectId }).sort({ createdAt: 1 })
  res.json(tasks)
})

/** POST /api/tasks — create a task (any team member). Assigning needs Admin/Manager. */
router.post('/', validate(taskCreateSchema), async (req, res) => {
  const project = await assertProjectInTeam(req.body.projectId, req.user.teamId)
  if (!project) return res.status(404).json({ error: 'Project not found in your team.' })

  if (req.body.assignedTo && req.user.role === 'MEMBER') {
    return res.status(403).json({ error: 'Only Admins/Managers can assign tasks.' })
  }

  const task = await Task.create(req.body)
  emitToTeam(String(req.user.teamId), 'task:created', task)
  res.status(201).json(task)
})

/** PUT /api/tasks/:id — update status/assignee/etc. Reassigning needs Admin/Manager. */
router.put('/:id', validate(taskUpdateSchema), async (req, res) => {
  if ('assignedTo' in req.body && req.user.role === 'MEMBER') {
    return res.status(403).json({ error: 'Only Admins/Managers can assign tasks.' })
  }

  const task = await Task.findById(req.params.id)
  if (!task) return res.status(404).json({ error: 'Task not found.' })

  // Confirm the task's project is in the caller's team.
  const project = await assertProjectInTeam(task.projectId, req.user.teamId)
  if (!project) return res.status(403).json({ error: 'Task is outside your team.' })

  Object.assign(task, req.body)
  await task.save()
  emitToTeam(String(req.user.teamId), 'task:updated', task)
  res.json(task)
})

/** DELETE /api/tasks/:id — delete a task (Admin/Manager only). */
router.delete('/:id', requireRole('ADMIN', 'MANAGER'), async (req, res) => {
  const task = await Task.findById(req.params.id)
  if (!task) return res.status(404).json({ error: 'Task not found.' })
  const project = await assertProjectInTeam(task.projectId, req.user.teamId)
  if (!project) return res.status(403).json({ error: 'Task is outside your team.' })
  await task.deleteOne()
  emitToTeam(String(req.user.teamId), 'task:deleted', { id: task._id })
  res.json({ id: task._id })
})

export default router
