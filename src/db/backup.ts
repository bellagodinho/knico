import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate'
import { db } from './db'
import type { StoredFile } from './types'

// Version the file format. Old backups must stay readable as the app grows.
const FORMAT = { app: 'knico', version: 1 }

export async function buildBackup(): Promise<Uint8Array> {
  const files = await db.files.toArray()
  const tables = {
    settings: await db.settings.toArray(),
    projects: await db.projects.toArray(),
    patterns: await db.patterns.toArray(),
    counters: await db.counters.toArray(),
    counterEvents: await db.counterEvents.toArray(),
    // JSON cannot hold binary data, so file metadata goes here and the bytes go in the zip.
    files: files.map(({ blob, ...meta }) => meta),
  }
  const entries: Record<string, Uint8Array> = {
    'data.json': strToU8(JSON.stringify({ ...FORMAT, exportedAt: Date.now(), tables })),
  }
  for (const f of files) entries[`files/${f.id}`] = new Uint8Array(await f.blob.arrayBuffer())
  return zipSync(entries)
}

export async function restoreBackup(bytes: Uint8Array): Promise<void> {
  // Validate everything BEFORE touching the database, so a bad file changes nothing.
  const entries = unzipSync(bytes)
  if (!entries['data.json']) throw new Error('Not a Knico backup (data.json is missing).')
  const data = JSON.parse(strFromU8(entries['data.json']))
  if (data.app !== FORMAT.app) throw new Error('Not a Knico backup.')
  if (data.version > FORMAT.version) throw new Error('This backup is from a newer version of the app. Update first.')
  const t = data.tables
  const files: StoredFile[] = t.files.map((m: Omit<StoredFile, 'blob'>) => {
    const b = entries[`files/${m.id}`]
    if (!b) throw new Error(`Backup is missing the file "${m.name}".`)
    return { ...m, blob: new Blob([b.slice().buffer], { type: m.type }) }
  })
  // One transaction: either everything is replaced or nothing is.
  await db.transaction('rw', db.tables, async () => {
    await Promise.all(db.tables.map((table) => table.clear()))
    await db.settings.bulkAdd(t.settings)
    await db.projects.bulkAdd(t.projects)
    await db.patterns.bulkAdd(t.patterns)
    await db.counters.bulkAdd(t.counters)
    await db.counterEvents.bulkAdd(t.counterEvents)
    await db.files.bulkAdd(files)
  })
}

// iOS home-screen apps handle downloads poorly, so prefer the share sheet ("Save to Files").
export async function saveBackupFile(bytes: Uint8Array, name: string) {
  const file = new File([bytes.slice().buffer], name, { type: 'application/zip' })
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: name })
    return
  }
  const url = URL.createObjectURL(file)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 10000)
}
