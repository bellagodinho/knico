import { useState } from 'react'
import { addCounter, bump, deleteCounter, deleteProject, resetCounter, STATUSES, updateCounter, updateProject, useCounters, useProject } from './db/projects'
import type { Counter, Project } from './db/types'
import { beep, unlockAudio } from './feedback'
import { useWakeLock } from './wakelock'

function CounterCard({ c, onAlert }: { c: Counter; onAlert: (t: string) => void }) {
  const [flash, setFlash] = useState(0)
  const [ev, setEv] = useState('')
  const [fr, setFr] = useState('')
  const [txt, setTxt] = useState('')

  const tap = async (dir: 1 | -1) => {
    unlockAudio() // must happen inside the tap, before any await
    const { due } = await bump(c.id!, dir)
    setFlash((n) => n + 1)
    if (due.length) { onAlert(due.map((r) => r.text).join(' · ')); beep() }
  }

  const addReminder = () => {
    const every = Number(ev)
    if (!every || every < 1 || !txt.trim()) return
    void updateCounter(c.id!, { reminders: [...(c.reminders ?? []), { every, from: Number(fr) || every, text: txt.trim() }] })
    setEv(''); setFr(''); setTxt('')
  }

  return (
    <div className="card">
      <div className="row">
        <strong>{c.label}</strong>
        <button className="ghost" onClick={() => confirm(`Delete "${c.label}"?`) && deleteCounter(c.id!)}>Delete</button>
      </div>
      <div className="count">
        <button className="step" onClick={() => tap(-1)} aria-label="Subtract">−</button>
        <div key={flash} className="num pop">{c.value}{c.target ? <span className="muted"> / {c.target}</span> : null}</div>
        <button className="step big" onClick={() => tap(1)} aria-label="Add">+</button>
      </div>
      {c.target && c.value >= c.target ? <div className="done">Target reached</div> : null}
      <details>
        <summary>Options and reminders</summary>
        <div className="opts">
          <label>Step <input type="number" min={1} defaultValue={c.step} onBlur={(e) => updateCounter(c.id!, { step: Math.max(1, Number(e.target.value) || 1) })} /></label>
          <label>Target <input type="number" min={0} defaultValue={c.target ?? ''} onBlur={(e) => updateCounter(c.id!, { target: Number(e.target.value) || undefined })} /></label>
          <div className="muted small">Reminders: every N, starting from S</div>
          {(c.reminders ?? []).map((r, i) => (
            <div className="row small" key={i}>
              <span>Every {r.every} from {r.from}: {r.text}</span>
              <button className="ghost" onClick={() => updateCounter(c.id!, { reminders: (c.reminders ?? []).filter((_, j) => j !== i) })}>Remove</button>
            </div>
          ))}
          <div className="meta">
            <input type="number" min={1} placeholder="every" value={ev} onChange={(e) => setEv(e.target.value)} style={{ width: '5rem' }} />
            <input type="number" min={1} placeholder="from" value={fr} onChange={(e) => setFr(e.target.value)} style={{ width: '5rem' }} />
            <input placeholder="e.g. Increase" value={txt} onChange={(e) => setTxt(e.target.value)} style={{ flex: 1, minWidth: '8rem' }} />
            <button onClick={addReminder}>Add</button>
          </div>
          <div><button className="ghost" onClick={() => resetCounter(c.id!)}>Reset to 0</button></div>
        </div>
      </details>
    </div>
  )
}

export default function ProjectDetail({ id, onBack }: { id: number; onBack: () => void }) {
  useWakeLock()
  const project = useProject(id)
  const counters = useCounters(id)
  const [label, setLabel] = useState('')
  const [alertText, setAlertText] = useState('')

  if (!project) return <section><button className="ghost" onClick={onBack}>Back</button></section>

  const add = () => {
    if (!label.trim()) return
    void addCounter(id, label.trim())
    setLabel('')
  }

  return (
    <section>
      <button className="ghost" onClick={onBack}>← Projects</button>
      <input className="title" defaultValue={project.name} onBlur={(e) => updateProject(id, { name: e.target.value.trim() || project.name })} />
      <div className="meta">
        <select value={project.status} onChange={(e) => updateProject(id, { status: e.target.value as Project['status'] })}>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="muted small">{project.craft}</span>
      </div>
      <textarea placeholder="Notes" defaultValue={project.notes} onBlur={(e) => updateProject(id, { notes: e.target.value })} />

      {alertText && <div className="alert" role="status" onClick={() => setAlertText('')}>{alertText} (tap to dismiss)</div>}
      {counters?.map((c) => <CounterCard key={c.id} c={c} onAlert={setAlertText} />)}

      <div className="card">
        <div className="meta">
          <input placeholder="New counter, e.g. Rows" value={label} onChange={(e) => setLabel(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} style={{ flex: 1, minWidth: '10rem' }} />
          <button onClick={add}>Add counter</button>
        </div>
      </div>
      <p><button className="ghost" onClick={async () => { if (confirm('Delete this project and its counters?')) { await deleteProject(id); onBack() } }}>Delete project</button></p>
    </section>
  )
}
