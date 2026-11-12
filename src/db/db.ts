import Dexie, { type Table } from 'dexie'
import type { Counter, CounterEvent, Pattern, Project, Setting, StoredFile } from './types'

class KnicoDB extends Dexie {
  settings!: Table<Setting, string>
  projects!: Table<Project, number>
  patterns!: Table<Pattern, number>
  counters!: Table<Counter, number>
  counterEvents!: Table<CounterEvent, number>
  files!: Table<StoredFile, number>

  constructor() {
    super('knico')
    // Never edit a shipped version. Schema changes get a NEW version number, and Dexie
    // migrates existing data on users' devices. Only fields we query or sort by are listed
    // (indexes); '++id' means an auto-incrementing primary key.
    this.version(1).stores({
      settings: 'key',
      projects: '++id, status, updatedAt',
      patterns: '++id, title, craft',
      counters: '++id, projectId',
      counterEvents: '++id, counterId, projectId, at',
      files: '++id',
    })
  }
}

export const db = new KnicoDB()
