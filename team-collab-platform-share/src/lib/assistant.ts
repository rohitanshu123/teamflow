import type { Project, Task, TaskStatus, User } from '../types'
import { can } from './permissions'

/**
 * Local, rule-based natural-language parser for the task assistant.
 * No external API / LLM call — everything runs in the browser so the demo
 * works offline with zero keys. It recognises intents like:
 *   - create task "Fix login" in Website Revamp assign to Priya
 *   - move "Onboarding screens" to in progress
 *   - assign "SEO migration plan" to Sameer
 *   - delete task "Audit current pages"
 *   - list tasks in Mobile App v2  /  show my tasks
 */

export type Intent =
  | { kind: 'create'; title: string; projectId: string; assignedTo?: string; status: TaskStatus; reply: string }
  | { kind: 'move'; taskId: string; status: TaskStatus; reply: string }
  | { kind: 'assign'; taskId: string; userId: string; reply: string }
  | { kind: 'delete'; taskId: string; reply: string }
  | { kind: 'reply'; reply: string }

interface Ctx {
  projects: Project[]
  users: User[]
  tasks: Task[]
  currentUser: User
}

const HELP = [
  'I can manage tasks for you. Try:',
  '• create task "Fix login bug" in Website Revamp assign to Priya',
  '• move "Onboarding screens" to in progress',
  '• assign "SEO migration plan" to Sameer',
  '• delete task "Audit current pages"',
  '• list tasks in Mobile App v2  ·  show my tasks',
].join('\n')

function normStatus(raw: string): TaskStatus | null {
  const s = raw.toLowerCase().trim()
  if (['todo', 'to do', 'to-do', 'backlog'].includes(s)) return 'todo'
  if (['in progress', 'in-progress', 'doing', 'wip', 'started'].includes(s)) return 'in-progress'
  if (['done', 'complete', 'completed', 'finished'].includes(s)) return 'done'
  return null
}

const STATUS_LABEL: Record<TaskStatus, string> = { todo: 'To Do', 'in-progress': 'In Progress', done: 'Done' }

/** Pull a quoted string, else the trimmed fallback span. */
function quoted(text: string): string | null {
  const m = text.match(/["“]([^"”]+)["”]/)
  return m ? m[1].trim() : null
}

function findProject(name: string, projects: Project[]): Project | undefined {
  const n = name.toLowerCase().trim()
  return projects.find((p) => p.name.toLowerCase() === n) ?? projects.find((p) => p.name.toLowerCase().includes(n))
}

function findUser(name: string, users: User[]): User | undefined {
  const n = name.toLowerCase().trim()
  return (
    users.find((u) => u.name.toLowerCase() === n) ??
    users.find((u) => u.name.toLowerCase().startsWith(n)) ??
    users.find((u) => u.name.toLowerCase().includes(n) || u.email.toLowerCase().includes(n))
  )
}

function findTask(name: string, tasks: Task[]): Task | undefined {
  const n = name.toLowerCase().trim()
  return tasks.find((t) => t.title.toLowerCase() === n) ?? tasks.find((t) => t.title.toLowerCase().includes(n))
}

export function parseCommand(input: string, ctx: Ctx): Intent {
  const text = input.trim()
  const lower = text.toLowerCase()
  const role = ctx.currentUser.role

  if (!text || lower === 'help') return { kind: 'reply', reply: HELP }

  // ---- LIST / SHOW ----
  if (/^(list|show|what)/.test(lower)) {
    let scope = ctx.tasks
    let label = 'all tasks'
    if (/(my|assigned to me|mine)/.test(lower)) {
      scope = ctx.tasks.filter((t) => t.assignedTo === ctx.currentUser.id)
      label = 'your tasks'
    }
    const inMatch = text.match(/in ([\w\s]+?)(?:$|[.?!])/i)
    if (inMatch) {
      const proj = findProject(inMatch[1], ctx.projects)
      if (proj) {
        scope = scope.filter((t) => t.projectId === proj.id)
        label = `tasks in ${proj.name}`
      }
    }
    if (scope.length === 0) return { kind: 'reply', reply: `No ${label} found.` }
    const lines = scope
      .slice(0, 12)
      .map((t) => `• ${t.title} — ${STATUS_LABEL[t.status]}${t.assignedTo ? ` (${ctx.users.find((u) => u.id === t.assignedTo)?.name ?? '—'})` : ''}`)
    return { kind: 'reply', reply: `Here are ${label} (${scope.length}):\n${lines.join('\n')}` }
  }

  // ---- CREATE ----
  if (/^(create|add|new)\b/.test(lower)) {
    const title = quoted(text) ?? text.replace(/^(create|add|new)\s+(task|a task)?\s*/i, '').replace(/\s+(in|for|assign|to|status)\b.*$/i, '').trim()
    if (!title) return { kind: 'reply', reply: 'What should the task be called? Try: create task "Write docs" in Mobile App v2' }

    // project
    let project = ctx.projects[0]
    const inMatch = text.match(/\bin ([\w\s]+?)(?:\s+(?:assign|to|status)\b|$)/i)
    if (inMatch) {
      const found = findProject(inMatch[1], ctx.projects)
      if (!found) return { kind: 'reply', reply: `I couldn't find a project named "${inMatch[1].trim()}".` }
      project = found
    }

    // assignee
    let assignedTo: string | undefined
    const asgMatch = text.match(/assign(?:ed)?\s+to\s+([\w\s.@]+?)(?:\s+(?:in|status)\b|$)/i)
    if (asgMatch) {
      if (!can.assignTask(role)) return { kind: 'reply', reply: 'Only Admins and Managers can assign tasks. The task can still be created without an assignee.' }
      const u = findUser(asgMatch[1], ctx.users)
      if (!u) return { kind: 'reply', reply: `I couldn't find a team member matching "${asgMatch[1].trim()}".` }
      assignedTo = u.id
    }

    // status
    let status: TaskStatus = 'todo'
    const stMatch = text.match(/status\s+([\w\s-]+?)$/i)
    if (stMatch) status = normStatus(stMatch[1]) ?? 'todo'

    const who = assignedTo ? `, assigned to ${ctx.users.find((u) => u.id === assignedTo)?.name}` : ''
    return {
      kind: 'create',
      title,
      projectId: project.id,
      assignedTo,
      status,
      reply: `Created "${title}" in ${project.name} (${STATUS_LABEL[status]})${who}.`,
    }
  }

  // ---- MOVE ----
  if (/^move\b/.test(lower) || /\bto (todo|to do|in progress|in-progress|done|doing|complete|completed)\b/.test(lower)) {
    const name = quoted(text) ?? text.replace(/^move\s+(task\s+)?/i, '').replace(/\s+to\s+.*$/i, '').trim()
    const task = findTask(name, ctx.tasks)
    if (!task) return { kind: 'reply', reply: `I couldn't find a task matching "${name}".` }
    const stMatch = text.match(/to\s+([\w\s-]+?)$/i)
    const status = stMatch ? normStatus(stMatch[1]) : null
    if (!status) return { kind: 'reply', reply: 'Move it to which column — To Do, In Progress, or Done?' }
    if (!can.editTask(role)) return { kind: 'reply', reply: "You don't have permission to update tasks." }
    return { kind: 'move', taskId: task.id, status, reply: `Moved "${task.title}" to ${STATUS_LABEL[status]}.` }
  }

  // ---- ASSIGN ----
  if (/^assign\b/.test(lower)) {
    if (!can.assignTask(role)) return { kind: 'reply', reply: 'Only Admins and Managers can assign tasks.' }
    const name = quoted(text)
    const toMatch = text.match(/\bto\s+([\w\s.@]+?)$/i)
    if (!name || !toMatch) return { kind: 'reply', reply: 'Try: assign "Task title" to Priya' }
    const task = findTask(name, ctx.tasks)
    if (!task) return { kind: 'reply', reply: `I couldn't find a task matching "${name}".` }
    const user = findUser(toMatch[1], ctx.users)
    if (!user) return { kind: 'reply', reply: `I couldn't find a team member matching "${toMatch[1].trim()}".` }
    return { kind: 'assign', taskId: task.id, userId: user.id, reply: `Assigned "${task.title}" to ${user.name}.` }
  }

  // ---- DELETE ----
  if (/^(delete|remove)\b/.test(lower)) {
    if (!can.deleteTask(role)) return { kind: 'reply', reply: 'Only Admins and Managers can delete tasks.' }
    const name = quoted(text) ?? text.replace(/^(delete|remove)\s+(task\s+)?/i, '').trim()
    const task = findTask(name, ctx.tasks)
    if (!task) return { kind: 'reply', reply: `I couldn't find a task matching "${name}".` }
    return { kind: 'delete', taskId: task.id, reply: `Deleted "${task.title}".` }
  }

  return { kind: 'reply', reply: `I didn't quite get that.\n\n${HELP}` }
}
