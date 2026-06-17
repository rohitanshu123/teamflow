import { Router } from 'express'
import { User } from '../models/index.js'
import { validate } from '../middleware/validate.js'
import { authenticate } from '../middleware/auth.js'
import { loginSchema } from '../validation/schemas.js'

const router = Router()

/** POST /api/auth/login — demo login by email; returns the user record. */
router.post('/login', validate(loginSchema), async (req, res) => {
  const user = await User.findOne({ email: req.body.email })
  if (!user) return res.status(404).json({ error: 'No account with that email.' })
  res.json(user)
})

/** GET /api/auth/me — current user from x-user-id header. */
router.get('/me', authenticate, (req, res) => {
  res.json(req.user)
})

export default router
