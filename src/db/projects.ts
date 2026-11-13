import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './db'
import type { Counter, Craft, Project, Reminder } from './types'

export const STATUSES: Project['status'][] = ['planned', 'active', 'finished', 'frogged']

// Reads are live: components re-render when the data changes.
export const useProjects = () => useLiveQuery(() => db.projects.orderBy('updatedAt').reverse().toArray(), [])
export const useProject = (id: number) => useLiveQuery(() => db.projects.get(id), [id])
export const useCounters = (projectId: number) =>
  useLiveQuery(() => db.counters.where('projectId').equals(projectId).toArray(), [projectId])

export function createProject(name: string, craft: Craft) {
  const now = Date.now()
  return db.projects.add({ name, craft, status: 'planned', notes: '', createdAt: now, updatedAt: now })
}

export const updateProject = (id: number, changes: Partial<Project>) =>
  db.projects.update(id, { ...changes, updatedAt: Date.now() })

// Deleting a project removes everything that belongs to it, all or nothing.
export const deleteProject = (id: number) =>
  db.transaction('rw', db.projects, db.counters, db.counterEvents, async () => {
    await db.counterEvents.where('projectId').equals(id).delete()
    await db.counters.where('projectId').equals(id).delete()
    await db.projects.delete(id)
  })

export const addCounter = (projectId: number, label: string) =>
  db.counters.add({ projectId, label, value: 0, step: 1, reminders: [] })

export const updateCounter = (id: number, changes: Partial<Counter>) => db.counters.update(id, changes)

export const deleteCounter = (id: number) =>
  db.transaction('rw', db.counters, db.counterEvents, async () => {
    await db.counterEvents.where('counterId').equals(id).delete()
    await db.counters.delete(id)
  })

// Business rule lives here, not in the UI: reminders are derived from value + rules, never stored as "fired".
const dueReminders = (rs: Reminder[], value: number) =>
  rs.filter((r) => value >= r.from && (value - r.from) % r.every === 0)

// One tap = one transaction. Reading the value INSIDE it avoids lost updates on fast double taps,
// and the value and the event log can never disagree. Undo is just a tap the other way (history stays append-only).
export function bump(id: number, direction: 1 | -1) {
  return db.transaction('rw', db.counters, db.counterEvents, db.projects, async () => {
    const c = await db.counters.get(id)
    if (!c) return { due: [] as Reminder[] }
    const value = Math.max(0, c.value + direction * c.step)
    if (value === c.value) return { due: [] as Reminder[] }
    const now = Date.now()
    await db.counters.update(id, { value })
    await db.counterEvents.add({ counterId: id, projectId: c.projectId, delta: value - c.value, at: now })
    await db.projects.update(c.projectId, { updatedAt: now })
    return { due: direction === 1 ? dueReminders(c.reminders ?? [], value) : [] }
  })
}

export const resetCounter = (id: number) =>
  db.transaction('rw', db.counters, db.counterEvents, async () => {
    const c = await db.counters.get(id)
    if (!c || c.value === 0) return
    await db.counters.update(id, { value: 0 })
    await db.counterEvents.add({ counterId: id, projectId: c.projectId, delta: -c.value, at: Date.now() })
  })
