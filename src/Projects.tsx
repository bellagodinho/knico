import { useState } from 'react'
import './projects.css'
import { createProject, useProjects } from './db/projects'
import type { Craft } from './db/types'
import ProjectDetail from './ProjectDetail'

export default function Projects() {
  const projects = useProjects()
  const [openId, setOpenId] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [craft, setCraft] = useState<Craft>('knit')

  if (openId !== null) return <ProjectDetail id={openId} onBack={() => setOpenId(null)} />

  const add = async () => {
    if (!name.trim()) return
    const id = await createProject(name.trim(), craft)
    setName('')
    setOpenId(id)
  }

  return (
    <section>
      <h2>Projects</h2>
      <div className="card">
        <input placeholder="New project name" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} style={{ width: '100%' }} />
        <div className="row actions">
          <div className="seg" style={{ margin: 0 }}>
            <button className={craft === 'knit' ? 'tab on' : 'tab'} onClick={() => setCraft('knit')}>Knit</button>
            <button className={craft === 'crochet' ? 'tab on' : 'tab'} onClick={() => setCraft('crochet')}>Crochet</button>
          </div>
          <button onClick={add}>Create</button>
        </div>
      </div>
      {projects?.length === 0 && <p className="muted">No projects yet. Create your first one above.</p>}
      {projects?.map((p) => (
        <button key={p.id} className="item" onClick={() => setOpenId(p.id!)}>
          <strong>{p.name}</strong>
          <span className="muted small">{p.craft} · {p.status}</span>
        </button>
      ))}
    </section>
  )
}
