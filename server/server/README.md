# TeamFlow — Backend (Express + MongoDB + Socket.IO)

REST API and real-time server for the TeamFlow demo. Independent — uses only the
MongoDB you point it at via `.env`. No external/private servers are hardcoded.

## Tech
- **Express** (REST API)
- **MongoDB + Mongoose** (data + schemas)
- **Socket.IO** (real-time chat + live project/task events)
- **Joi** (request validation)
- Role-based permission middleware (ADMIN / MANAGER / MEMBER)

## Setup

```bash
cd server
npm install

# Configure your OWN database (never commit real creds — .env is gitignored)
cp .env.example .env
#   set MONGODB_URI to your MongoDB Atlas / local connection string

npm run seed     # load fictional demo data
npm run dev      # start API + Socket.IO on http://localhost:4000
```

If `MONGODB_URI` is not set, the server falls back to a **local** MongoDB at
`mongodb://127.0.0.1:27017/teamflow`.

## Auth (demo)
Login returns a user; the client then sends `x-user-id: <id>` on every request.
The `authenticate` middleware loads the user and `requireRole(...)` enforces roles.
Swap this for Firebase/JWT verification in production without changing routes.

## API

| Method | Endpoint | Access | Notes |
|---|---|---|---|
| POST | `/api/auth/login` | public | `{ email }` → user |
| GET | `/api/auth/me` | auth | current user |
| GET | `/api/team` | auth | team + members |
| GET | `/api/projects` | auth | team's projects |
| POST | `/api/projects` | Admin/Manager | create |
| PUT | `/api/projects/:id` | Admin/Manager | update |
| DELETE | `/api/projects/:id` | Admin | delete + its tasks |
| GET | `/api/tasks?projectId=` | auth | tasks for a project |
| POST | `/api/tasks` | auth (assign → Admin/Manager) | create |
| PUT | `/api/tasks/:id` | auth (reassign → Admin/Manager) | status/assignee |
| DELETE | `/api/tasks/:id` | Admin/Manager | delete |
| GET | `/api/messages` | auth | chat history |
| POST | `/api/messages` | auth | send (broadcasts live) |

All errors return clean JSON: `{ error, details? }` with proper status codes
(400 validation, 401 auth, 403 role, 404 not found, 500 server).

## Socket.IO events
Client emits `team:join` with its `teamId`. Server broadcasts to the team room:
`message:new`, `project:created|updated|deleted`, `task:created|updated|deleted`.

## Deploy (Render / Railway)
- Start command: `npm start`
- Set env vars `MONGODB_URI`, `CLIENT_ORIGIN` (your deployed frontend URL), `PORT`.
