import { Router } from 'express'
import { Project, Task } from '../models/index.js'
import { authenticate, requireRole } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { projectCreateSchema, projectUpdateSchema } from '../validation/schemas.js'
import { emitToTeam } from '../socket.js'

const router = Router()
router.use(authenticate)

/** GET /api/projects — all projects for the caller's team. */
router.get('/', async (req, res) => {
  const projects = await Project.find({ teamId: req.user.teamId }).sort({ createdAt: -1 })
  res.json(projects)
})

/** POST /api/projects — create (Admin/Manager only). */
router.post('/', requireRole('ADMIN', 'MANAGER'), validate(projectCreateSchema), async (req, res) => {
  const project = await Project.create({ ...req.body, teamId: req.user.teamId })
  emitToTeam(String(req.user.teamId), 'project:created', project)
  res.status(201).json(project)
})

/** PUT /api/projects/:id — update (Admin/Manager only). */
router.put('/:id', requireRole('ADMIN', 'MANAGER'), validate(projectUpdateSchema), async (req, res) => {
  const project = await Project.findOneAndUpdate(
    { _id: req.params.id, teamId: req.user.teamId },
    req.body,
    { new: true },
  )
  if (!project) return res.status(404).json({ error: 'Project not found.' })
  emitToTeam(String(req.user.teamId), 'project:updated', project)
  res.json(project)
})

/** DELETE /api/projects/:id — delete + its tasks (Admin only). */
router.delete('/:id', requireRole('ADMIN'), async (req, res) => {
  const project = await Project.findOneAndDelete({ _id: req.params.id, teamId: req.user.teamId })
  if (!project) return res.status(404).json({ error: 'Project not found.' })
  await Task.deleteMany({ projectId: project._id })
  emitToTeam(String(req.user.teamId), 'project:deleted', { id: project._id })
  res.json({ id: project._id })
})

export default router
