import { Router } from 'express'
import { Message, User } from '../models/index.js'
import { authenticate } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { messageCreateSchema } from '../validation/schemas.js'
import { emitToTeam } from '../socket.js'

const router = Router()
router.use(authenticate)

/** GET /api/messages — team chat history (most recent 200). */
router.get('/', async (req, res) => {
  const messages = await Message.find({ teamId: req.user.teamId }).sort({ timestamp: 1 }).limit(200)
  res.json(messages)
})

/** POST /api/messages — send a message; broadcast to the team in real time. */
router.post('/', validate(messageCreateSchema), async (req, res) => {
  const message = await Message.create({
    content: req.body.content,
    senderId: req.user._id,
    teamId: req.user.teamId,
    timestamp: new Date(),
  })
  // Attach sender name for convenient rendering on clients.
  const sender = await User.findById(req.user._id).select('name')
  const payload = { ...message.toObject(), senderName: sender?.name }
  emitToTeam(String(req.user.teamId), 'message:new', payload)
  res.status(201).json(payload)
})

export default router
