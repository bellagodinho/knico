export type Craft = 'knit' | 'crochet'

export interface Setting { key: string; value: unknown }

export interface Project {
  id?: number
  name: string
  craft: Craft
  status: 'planned' | 'active' | 'finished' | 'frogged'
  patternId?: number
  notes: string
  createdAt: number
  updatedAt: number
}

export interface Pattern {
  id?: number
  title: string
  designer?: string
  craft: Craft
  source: 'manual' | 'pdf' | 'ravelry'
  ravelryId?: number
  fileId?: number
  notes: string
  createdAt: number
}

// "Every N from S": fires when value >= from and (value - from) is a multiple of every.
export interface Reminder { every: number; from: number; text: string }

export interface Counter {
  id?: number
  projectId: number
  label: string
  value: number
  step: number
  target?: number // with a target, a counter doubles as a repeat counter ("3 / 8")
  reminders?: Reminder[] // added in Phase 2; older records lack it, so always use `?? []`
}

// Append-only log: every tap is a row. The activity tracker is built from this later.
export interface CounterEvent { id?: number; counterId: number; projectId: number; delta: number; at: number }

export interface StoredFile { id?: number; name: string; type: string; blob: Blob; addedAt: number }
