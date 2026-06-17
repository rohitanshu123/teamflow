import type { ActivityLog, Message, Project, Task, Team, User } from '../types'

/**
 * Seed data for the demo. Completely fictional — no real organization,
 * users, or external data. Used to initialise the in-memory store.
 */

export const SEED_TEAM: Team = {
  id: 'team_1',
  name: 'TeamFlow Studio',
  description: 'Product & engineering crew building the demo platform.',
  adminId: 'user_admin',
}

export const SEED_USERS: User[] = [
  { id: 'user_admin', name: 'Asha Verma', email: 'asha@teamflow.dev', role: 'ADMIN', teamId: 'team_1' },
  { id: 'user_mgr', name: 'Rohan Mehta', email: 'rohan@teamflow.dev', role: 'MANAGER', teamId: 'team_1' },
  { id: 'user_m1', name: 'Priya Nair', email: 'priya@teamflow.dev', role: 'MEMBER', teamId: 'team_1' },
  { id: 'user_m2', name: 'Sameer Khan', email: 'sameer@teamflow.dev', role: 'MEMBER', teamId: 'team_1' },
  { id: 'user_m3', name: 'Lena Park', email: 'lena@teamflow.dev', role: 'MEMBER', teamId: 'team_1' },
]

export const SEED_PROJECTS: Project[] = [
  {
    id: 'proj_1',
    name: 'Website Revamp',
    description: 'Redesign marketing site with new brand system.',
    teamId: 'team_1',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9).toISOString(),
  },
  {
    id: 'proj_2',
    name: 'Mobile App v2',
    description: 'Offline mode, push notifications, and a faster onboarding flow.',
    teamId: 'team_1',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
  },
]

export const SEED_TASKS: Task[] = [
  { id: 'task_1', title: 'Audit current pages', status: 'done', projectId: 'proj_1', assignedTo: 'user_m1', createdAt: iso(8), description: 'List pages to keep, merge, or drop.' },
  { id: 'task_2', title: 'Design new hero section', status: 'in-progress', projectId: 'proj_1', assignedTo: 'user_m3', createdAt: iso(6), description: 'Two variants for A/B test.' },
  { id: 'task_3', title: 'Build component library', status: 'in-progress', projectId: 'proj_1', assignedTo: 'user_m2', createdAt: iso(5) },
  { id: 'task_4', title: 'SEO migration plan', status: 'todo', projectId: 'proj_1', createdAt: iso(3), description: 'Redirect map for changed URLs.' },
  { id: 'task_5', title: 'Set up offline cache', status: 'todo', projectId: 'proj_2', assignedTo: 'user_m1', createdAt: iso(3) },
  { id: 'task_6', title: 'Push notification service', status: 'in-progress', projectId: 'proj_2', assignedTo: 'user_m2', createdAt: iso(2) },
  { id: 'task_7', title: 'Onboarding screens', status: 'todo', projectId: 'proj_2', createdAt: iso(1) },
]

export const SEED_MESSAGES: Message[] = [
  { id: 'msg_1', content: 'Morning team! Standup in 10 minutes.', senderId: 'user_mgr', teamId: 'team_1', timestamp: iso(0, 120) },
  { id: 'msg_2', content: 'Hero section variants are ready for review.', senderId: 'user_m3', teamId: 'team_1', timestamp: iso(0, 90) },
  { id: 'msg_3', content: 'Nice! Pushing the SEO plan to To Do for now.', senderId: 'user_admin', teamId: 'team_1', timestamp: iso(0, 30) },
]

export const SEED_ACTIVITY: ActivityLog[] = [
  { id: 'act_1', teamId: 'team_1', actorId: 'user_m1', text: 'completed "Audit current pages"', timestamp: iso(0, 200) },
  { id: 'act_2', teamId: 'team_1', actorId: 'user_mgr', text: 'created project "Mobile App v2"', timestamp: iso(0, 150) },
  { id: 'act_3', teamId: 'team_1', actorId: 'user_m3', text: 'moved "Design new hero section" to In Progress', timestamp: iso(0, 80) },
]

/** ISO string for `days` ago (optionally minus extra `min` minutes). */
function iso(days: number, min = 0): string {
  return new Date(Date.now() - days * 86400000 - min * 60000).toISOString()
}
