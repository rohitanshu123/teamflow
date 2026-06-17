/** Domain types for the collaboration platform (demo, fully independent / mock data). */

export type Role = 'ADMIN' | 'MANAGER' | 'MEMBER'

export type TaskStatus = 'todo' | 'in-progress' | 'done'

export interface User {
  id: string
  email: string
  name: string
  role: Role
  teamId: string
}

export interface Team {
  id: string
  name: string
  description?: string
  adminId: string
}

export interface Project {
  id: string
  name: string
  description?: string
  teamId: string
  createdAt: string
}

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  projectId: string
  assignedTo?: string // User id
  createdAt: string
}

export interface Message {
  id: string
  content: string
  senderId: string
  teamId: string
  timestamp: string
}

export interface ActivityLog {
  id: string
  teamId: string
  actorId: string
  text: string
  timestamp: string
}

/** Ordered Kanban columns used across the board UI. */
export const TASK_COLUMNS: { key: TaskStatus; label: string }[] = [
  { key: 'todo', label: 'To Do' },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'done', label: 'Done' },
]
