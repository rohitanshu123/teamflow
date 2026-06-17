import { Router } from 'express'
import { Team, User } from '../models/index.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()
router.use(authenticate)

/** GET /api/team — the caller's team plus its members. */
router.get('/', async (req, res) => {
  const team = await Team.findById(req.user.teamId)
  if (!team) return res.status(404).json({ error: 'Team not found.' })
  const members = await User.find({ teamId: req.user.teamId }).select('name email role teamId')
  res.json({ team, members })
})

export default router
