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

export interface Counter {
  id?: number
  projectId: number
  label: string
  value: number
  step: number
  target?: number
}

// Append-only log: every tap is a row. The activity tracker is built from this later.
export interface CounterEvent { id?: number; counterId: number; projectId: number; delta: number; at: number }

export interface StoredFile { id?: number; name: string; type: string; blob: Blob; addedAt: number }
