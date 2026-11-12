import { useState } from 'react'
import { useTheme } from './theme'
import Diagnostics from './Diagnostics'

const phases = [
  ['Foundation', 'Starter app, theme, install on iPhone, device tests', true],
  ['Data layer', 'Schema, units setting, backup and restore', false],
  ['Projects and row counter', 'The core loop you will use daily', false],
  ['Pattern library', 'Manual entry, PDF upload and viewer', false],
  ['Ravelry import', 'Pattern search and details', false],
] as const

function Home() {
  return (
    <section>
      <h2>Your craft notebook</h2>
      <p className="muted">Projects, patterns and yarn, stored on this device.</p>
      <ul className="phases">
        {phases.map(([name, desc, now]) => (
          <li key={name} className={now ? 'now' : ''}>
            <strong>{name}</strong>
            <span className="muted">{desc}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function App() {
  const { theme, toggle } = useTheme()
  const [tab, setTab] = useState<'home' | 'diag'>('home')
  return (
    <>
      <header className="bar">
        <h1>Skein</h1>
        <nav>
          <button className={tab === 'home' ? 'tab on' : 'tab'} onClick={() => setTab('home')}>Home</button>
          <button className={tab === 'diag' ? 'tab on' : 'tab'} onClick={() => setTab('diag')}>Diagnostics</button>
        </nav>
        <button className="ghost" onClick={toggle} aria-label="Toggle light and dark theme">
          {theme === 'dark' ? 'Light' : 'Dark'}
        </button>
      </header>
      <main>{tab === 'home' ? <Home /> : <Diagnostics />}</main>
    </>
  )
}
