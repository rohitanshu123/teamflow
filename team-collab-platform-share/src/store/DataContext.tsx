import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { ActivityLog, Message, Project, Task, TaskStatus, Team, User } from '../types'
import {
  SEED_ACTIVITY,
  SEED_MESSAGES,
  SEED_PROJECTS,
  SEED_TASKS,
  SEED_TEAM,
  SEED_USERS,
} from '../data/seed'
import { uid } from '../lib/utils'

/**
 * Single in-memory store for all demo entities. Persists to localStorage and
 * mirrors changes to other open tabs via BroadcastChannel — this is what makes
 * the chat and Kanban feel "real-time" without any backend or external API.
 */

interface StoreState {
  team: Team
  users: User[]
  projects: Project[]
  tasks: Task[]
  messages: Message[]
  activity: ActivityLog[]
}

interface DataContextValue extends StoreState {
  addProject: (data: { name: string; description?: string }, actorId: string) => Project
  updateProject: (id: string, data: { name: string; description?: string }, actorId: string) => void
  deleteProject: (id: string, actorId: string) => void
  addTask: (data: { title: string; description?: string; projectId: string; assignedTo?: string; status?: TaskStatus }, actorId: string) => Task
  updateTask: (id: string, patch: Partial<Task>, actorId: string) => void
  moveTask: (id: string, status: TaskStatus, actorId: string) => void
  deleteTask: (id: string, actorId: string) => void
  sendMessage: (content: string, senderId: string) => void
  userById: (id?: string) => User | undefined
  projectById: (id?: string) => Project | undefined
  resetDemo: () => void
}

const STORAGE_KEY = 'teamflow.store.v1'

function initialState(): StoreState {
  return {
    team: SEED_TEAM,
    users: SEED_USERS,
    projects: SEED_PROJECTS,
    tasks: SEED_TASKS,
    messages: SEED_MESSAGES,
    activity: SEED_ACTIVITY,
  }
}

function loadState(): StoreState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as StoreState
  } catch {
    /* fall through to seed */
  }
  return initialState()
}

const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoreState>(loadState)
  const channelRef = useRef<BroadcastChannel | null>(null)
  // Guards against echoing a broadcast we just received back out again.
  const applyingRemote = useRef(false)

  // Set up cross-tab channel once.
  useEffect(() => {
    const channel = 'BroadcastChannel' in window ? new BroadcastChannel('teamflow') : null
    channelRef.current = channel
    if (channel) {
      channel.onmessage = (e: MessageEvent<StoreState>) => {
        applyingRemote.current = true
        setState(e.data)
      }
    }
    return () => channel?.close()
  }, [])

  // Persist + broadcast on every change (except changes we just received).
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* storage may be full/disabled — demo continues in memory */
    }
    if (applyingRemote.current) {
      applyingRemote.current = false
      return
    }
    channelRef.current?.postMessage(state)
  }, [state])

  const logActivity = useCallback((draft: StoreState, actorId: string, text: string): StoreState => {
    const entry: ActivityLog = {
      id: uid('act'),
      teamId: draft.team.id,
      actorId,
      text,
      timestamp: new Date().toISOString(),
    }
    return { ...draft, activity: [entry, ...draft.activity].slice(0, 50) }
  }, [])

  const addProject: DataContextValue['addProject'] = useCallback(
    (data, actorId) => {
      const project: Project = {
        id: uid('proj'),
        name: data.name,
        description: data.description,
        teamId: SEED_TEAM.id,
        createdAt: new Date().toISOString(),
      }
      setState((s) => logActivity({ ...s, projects: [...s.projects, project] }, actorId, `created project "${project.name}"`))
      return project
    },
    [logActivity],
  )

  const updateProject: DataContextValue['updateProject'] = useCallback(
    (id, data, actorId) => {
      setState((s) =>
        logActivity(
          { ...s, projects: s.projects.map((p) => (p.id === id ? { ...p, ...data } : p)) },
          actorId,
          `updated project "${data.name}"`,
        ),
      )
    },
    [logActivity],
  )

  const deleteProject: DataContextValue['deleteProject'] = useCallback(
    (id, actorId) => {
      setState((s) => {
        const proj = s.projects.find((p) => p.id === id)
        const next = {
          ...s,
          projects: s.projects.filter((p) => p.id !== id),
          tasks: s.tasks.filter((t) => t.projectId !== id),
        }
        return logActivity(next, actorId, `deleted project "${proj?.name ?? ''}"`)
      })
    },
    [logActivity],
  )

  const addTask: DataContextValue['addTask'] = useCallback(
    (data, actorId) => {
      const task: Task = {
        id: uid('task'),
        title: data.title,
        description: data.description,
        status: data.status ?? 'todo',
        projectId: data.projectId,
        assignedTo: data.assignedTo,
        createdAt: new Date().toISOString(),
      }
      setState((s) => logActivity({ ...s, tasks: [...s.tasks, task] }, actorId, `created task "${task.title}"`))
      return task
    },
    [logActivity],
  )

  const updateTask: DataContextValue['updateTask'] = useCallback(
    (id, patch, actorId) => {
      setState((s) => {
        const task = s.tasks.find((t) => t.id === id)
        const next = { ...s, tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) }
        return logActivity(next, actorId, `updated task "${task?.title ?? ''}"`)
      })
    },
    [logActivity],
  )

  const moveTask: DataContextValue['moveTask'] = useCallback(
    (id, status, actorId) => {
      setState((s) => {
        const task = s.tasks.find((t) => t.id === id)
        if (!task || task.status === status) {
          return { ...s, tasks: s.tasks.map((t) => (t.id === id ? { ...t, status } : t)) }
        }
        const labels: Record<TaskStatus, string> = { todo: 'To Do', 'in-progress': 'In Progress', done: 'Done' }
        const next = { ...s, tasks: s.tasks.map((t) => (t.id === id ? { ...t, status } : t)) }
        return logActivity(next, actorId, `moved "${task.title}" to ${labels[status]}`)
      })
    },
    [logActivity],
  )

  const deleteTask: DataContextValue['deleteTask'] = useCallback(
    (id, actorId) => {
      setState((s) => {
        const task = s.tasks.find((t) => t.id === id)
        return logActivity({ ...s, tasks: s.tasks.filter((t) => t.id !== id) }, actorId, `deleted task "${task?.title ?? ''}"`)
      })
    },
    [logActivity],
  )

  const sendMessage: DataContextValue['sendMessage'] = useCallback((content, senderId) => {
    const msg: Message = {
      id: uid('msg'),
      content,
      senderId,
      teamId: SEED_TEAM.id,
      timestamp: new Date().toISOString(),
    }
    setState((s) => ({ ...s, messages: [...s.messages, msg] }))
  }, [])

  const resetDemo = useCallback(() => setState(initialState()), [])

  const userById = useCallback((id?: string) => state.users.find((u) => u.id === id), [state.users])
  const projectById = useCallback((id?: string) => state.projects.find((p) => p.id === id), [state.projects])

  const value = useMemo<DataContextValue>(
    () => ({
      ...state,
      addProject,
      updateProject,
      deleteProject,
      addTask,
      updateTask,
      moveTask,
      deleteTask,
      sendMessage,
      userById,
      projectById,
      resetDemo,
    }),
    [state, addProject, updateProject, deleteProject, addTask, updateTask, moveTask, deleteTask, sendMessage, userById, projectById, resetDemo],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useData(): DataContextValue {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
