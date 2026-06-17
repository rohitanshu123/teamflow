import type { Role } from '../types'

/**
 * Central role-based access rules. Mirrors what a real backend would enforce
 * on each endpoint — kept in one place so UI and (future) API stay in sync.
 */
export const can = {
  createProject: (r: Role) => r === 'ADMIN' || r === 'MANAGER',
  editProject: (r: Role) => r === 'ADMIN' || r === 'MANAGER',
  deleteProject: (r: Role) => r === 'ADMIN',

  createTask: (_r: Role) => true, // any team member can create a task
  editTask: (_r: Role) => true, // status/assignee updates allowed for all members
  deleteTask: (r: Role) => r === 'ADMIN' || r === 'MANAGER',
  assignTask: (r: Role) => r === 'ADMIN' || r === 'MANAGER',

  manageTeam: (r: Role) => r === 'ADMIN',
} as const

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  MEMBER: 'Member',
}

export const ROLE_BADGE: Record<Role, string> = {
  ADMIN: 'bg-destructive/15 text-destructive',
  MANAGER: 'bg-primary/15 text-primary',
  MEMBER: 'bg-muted text-muted-foreground',
}
