# TeamFlow — Real-Time Team Collaboration (Demo)

A self-contained **React + TypeScript** demo of a team collaboration platform:
projects, a drag-and-drop **Kanban board**, **real-time team chat**, **role-based
access control**, and a built-in **natural-language task assistant**.

> \*\*Demo notes\*\*
> - Fully \*\*independent\*\* — uses its own fictional, in-browser \*\*mock data\*\*. 
> - \*\*No API keys required.\*\* Auth is mocked and the assistant is rule-based (runs in the browser). Real Firebase / a backend can be plugged in later via `.env`.
> - Data persists in `localStorage` and syncs \*\*live across browser tabs\*\* (BroadcastChannel) — open two tabs to see chat \& the board update in real time.

\---

## Tech Stack

|Layer|Choice|
|-|-|
|Framework|React 19 + TypeScript (Vite)|
|Styling|Tailwind CSS + Shadcn-style UI primitives|
|Routing|React Router v6|
|Drag \& Drop|`@hello-pangea/dnd` (maintained React Beautiful DnD successor)|
|Icons|lucide-react|
|State|React Context + `localStorage` persistence|
|Real-time|BroadcastChannel (cross-tab) — swappable for Socket.IO|
|Auth|Mock provider shaped like Firebase Auth (swap-in ready)|
|Assistant|Local rule-based NL parser (no LLM/API key)|

\---

## Features

* **Authentication \& RBAC** — three roles: **Admin**, **Manager**, **Member**. Permissions are enforced in one place (`src/lib/permissions.ts`) and applied across the UI.
* **Project Management** — view all projects; create/edit (Admin \& Manager); delete (Admin only). Live progress bars.
* **Kanban Board** — drag tasks between *To Do → In Progress → Done*; create tasks; assign/reassign members (Admin/Manager).
* **Real-Time Chat** — team chat that updates instantly across open tabs.
* **Team Overview** — members, roles, open-task counts, and a live activity log.
* **AI Task Assistant** — manage tasks in plain English from the slide-over panel.
* **UI/UX** — responsive layout, **dark mode**, clean Shadcn-style components.

### Role permission matrix

|Action|Admin|Manager|Member|
|-|:-:|:-:|:-:|
|View projects / tasks / chat|✅|✅|✅|
|Create / edit project|✅|✅|❌|
|Delete project|✅|❌|❌|
|Create task / move task|✅|✅|✅|
|Assign / delete task|✅|✅|❌|
|Manage team|✅|❌|❌|

\---

## Getting Started

```bash
# 1. Install
npm install

# 2. Run dev server (http://localhost:5173)
npm run dev

# 3. Production build / preview
npm run build
npm run preview
```

No `.env` is needed to run the demo. See `.env.example` only if you later wire in real Firebase or a backend.

### Quick login

On the login screen use the **Quick Demo Login** buttons (Admin / Manager / Member),
or sign in with a seeded email such as `asha@teamflow.dev`, `rohan@teamflow.dev`, `priya@teamflow.dev`.

\---

## AI Assistant — example commands

Open the **AI Assistant** (sidebar button) and try:

```
create task "Fix login bug" in Mobile App v2 assign to Priya
move "Onboarding screens" to in progress
assign "SEO migration plan" to Sameer
delete task "Audit current pages"
show my tasks
list tasks in Website Revamp
help
```

The assistant honours role permissions (e.g. a Member can't assign/delete).

\---

## Project Structure

```
src/
  components/        # Layout, Sidebar, Header, Assistant, ui/ primitives
  pages/             # Login, Dashboard, Projects, Board, Chat, Team
  store/             # AuthContext, DataContext (state + persistence + cross-tab sync)
  lib/               # utils, permissions (RBAC), assistant (NL parser)
  data/              # seed.ts (mock, fictional data)
  types/             # shared TypeScript types
```

\---

## Deployment

This is a static SPA — deploy the `dist/` build to any static host.

* **Vercel** — import the repo; framework: *Vite*. `vercel.json` already adds the SPA rewrite.
* **Netlify** — build command `npm run build`, publish dir `dist`. `public/\_redirects` handles SPA routing.

\---

## Extending to a full MERN backend (optional)

The frontend is structured so a real backend drops in cleanly:

1. **Auth** — replace `src/store/AuthContext.tsx` internals with the Firebase Auth SDK using `VITE\_FIREBASE\_\*` keys.
2. **Data** — replace `DataContext` mutations with `fetch`/axios calls to an Express + MongoDB (Mongoose) API at `VITE\_API\_BASE\_URL`. Endpoints map 1:1 to the current actions (projects, tasks, messages).
3. **Real-time** — swap the BroadcastChannel in `DataContext` for a Socket.IO client at `VITE\_SOCKET\_URL`.

The role rules in `src/lib/permissions.ts` are meant to be mirrored by server-side validation (e.g. Joi + role middleware) on every endpoint.

