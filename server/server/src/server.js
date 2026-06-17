import 'dotenv/config'
import http from 'http'
import express from 'express'
import cors from 'cors'
import { Server } from 'socket.io'
import { connectDB } from './config/db.js'
import { setIO } from './socket.js'
import authRoutes from './routes/auth.js'
import projectRoutes from './routes/projects.js'
import taskRoutes from './routes/tasks.js'
import messageRoutes from './routes/messages.js'
import teamRoutes from './routes/team.js'

const app = express()
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173'

app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }))
app.use(express.json())

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'teamflow-api' }))
app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/team', teamRoutes)

// 404 + central error handler — always returns clean JSON.
app.use((_req, res) => res.status(404).json({ error: 'Not found' }))
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err.message)
  if (err?.name === 'CastError') return res.status(400).json({ error: 'Invalid id format' })
  res.status(500).json({ error: 'Internal server error' })
})

const server = http.createServer(app)
const io = new Server(server, { cors: { origin: CLIENT_ORIGIN } })
setIO(io)

io.on('connection', (socket) => {
  // Clients join their team room to receive live project/task/chat events.
  socket.on('team:join', (teamId) => {
    if (teamId) socket.join(`team:${teamId}`)
  })
})

const PORT = process.env.PORT || 4000

async function start() {
  try {
    await connectDB()
    server.listen(PORT, () => console.log(`🚀 TeamFlow API + Socket.IO on http://localhost:${PORT}`))
  } catch (err) {
    console.error('❌ Failed to start server:', err.message)
    process.exit(1)
  }
}

start()
