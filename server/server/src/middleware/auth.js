import { User } from '../models/index.js'

/**
 * Demo authentication: the client sends its signed-in user id in the
 * `x-user-id` header (set after /api/auth/login). We load that user and
 * attach it to req.user. In a production build this would verify a Firebase
 * ID token or JWT instead — the rest of the code stays the same.
 */
export async function authenticate(req, res, next) {
  try {
    const userId = req.header('x-user-id')
    debugger
    if (!userId) return res.status(401).json({ error: 'Not authenticated. Missing x-user-id header.' })

    const user = await User.findById(userId)
    if (!user) return res.status(401).json({ error: 'Invalid session. User not found.' })

    req.user = user
    next()
  } catch {
    return res.status(401).json({ error: 'Authentication failed.' })
  }
}

/** Allow only the given roles; otherwise 403. Use after authenticate. */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated.' })
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Forbidden. Requires role: ${roles.join(' or ')}.` })
    }
    next()
  }
}
