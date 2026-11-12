import { useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import './settings.css'
import { db } from './db/db'
import { setSetting, useUnits } from './db/settings'
import { buildBackup, restoreBackup, saveBackupFile } from './db/backup'
import { formatLength, formatNeedle, formatWeight } from './units'

const DAY = 86400000

export default function Settings() {
  const [units, setUnits] = useUnits()
  const counts = useLiveQuery(async () => ({ projects: await db.projects.count(), patterns: await db.patterns.count() }), [])
  const last = useLiveQuery(() => db.settings.get('lastBackupAt'), [])
  const [msg, setMsg] = useState('')
  const input = useRef<HTMLInputElement>(null)

  const lastAt = last?.value as number | undefined
  const hasData = !!counts && counts.projects + counts.patterns > 0
  const stale = hasData && (!lastAt || Date.now() - lastAt > 14 * DAY)

  const doExport = async () => {
    try {
      const bytes = await buildBackup()
      await saveBackupFile(bytes, `knico-backup-${new Date().toISOString().slice(0, 10)}.zip`)
      await setSetting('lastBackupAt', Date.now())
      setMsg('Backup created.')
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return // share sheet closed
      setMsg(`Backup failed: ${e instanceof Error ? e.message : e}`)
    }
  }

  const doRestore = async (file?: File) => {
    if (!file) return
    if (!confirm('Restoring replaces everything on this device with the backup. Continue?')) return
    try {
      await restoreBackup(new Uint8Array(await file.arrayBuffer()))
      setMsg('Restore complete.')
    } catch (e) {
      setMsg(`Restore failed, nothing was changed: ${e instanceof Error ? e.message : e}`)
    } finally {
      if (input.current) input.current.value = ''
    }
  }

  const addSample = () =>
    db.projects.add({ name: 'Sample scarf', craft: 'knit', status: 'active', notes: '', createdAt: Date.now(), updatedAt: Date.now() })

  return (
    <section>
      <h2>Settings</h2>

      <div className="card">
        <strong>Units</strong>
        <div className="seg">
          <button className={units === 'metric' ? 'tab on' : 'tab'} onClick={() => setUnits('metric')}>Metric</button>
          <button className={units === 'imperial' ? 'tab on' : 'tab'} onClick={() => setUnits('imperial')}>Imperial</button>
        </div>
        <div className="muted small">Example: 100 g skein, 200 m, 5 mm needle = {formatWeight(100, units)}, {formatLength(200, units)}, {formatNeedle(5, units)}</div>
      </div>

      <div className="card">
        <strong>Backup</strong>
        <div className="muted small">
          On this device: {counts ? `${counts.projects} projects, ${counts.patterns} patterns` : '…'}. Last backup: {lastAt ? new Date(lastAt).toLocaleDateString() : 'never'}.
        </div>
        {stale && <div className="warn">Your data only exists on this device. Make a backup.</div>}
        <div className="row actions">
          <button onClick={doExport}>Export backup</button>
          <button onClick={() => input.current?.click()}>Restore from backup</button>
          <input ref={input} type="file" accept=".zip,application/zip" hidden onChange={(e) => doRestore(e.target.files?.[0])} />
        </div>
        {msg && <div className="small status">{msg}</div>}
      </div>

      <div className="card">
        <strong>Developer</strong>
        <div className="muted small">Temporary: adds a project so you can test backup and restore.</div>
        <div className="actions"><button onClick={addSample}>Add sample project</button></div>
      </div>
    </section>
  )
}
