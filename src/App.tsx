import { useEffect, useState } from 'react'
import { useTheme } from './theme'
import { APP_NAME } from './config'
import Diagnostics from './Diagnostics'
import Settings from './Settings'

const phases = [
  ['Foundation', 'Starter app, theme, install on iPhone, device tests', 'done'],
  ['Data layer', 'Database schema, units setting, backup and restore', 'now'],
  ['Projects and row counter', 'The core loop you will use daily', ''],
  ['Pattern library', 'Manual entry, PDF upload and viewer', ''],
  ['Ravelry import', 'Pattern search and details', ''],
] as const

type Tab = 'home' | 'settings' | 'diag'
const tabs: [Tab, string][] = [['home', 'Home'], ['settings', 'Settings'], ['diag', 'Diagnostics']]

function Home() {
  return (
    <section>
      <h2>Your craft notebook</h2>
      <p className="muted">Projects, patterns and yarn, stored on this device.</p>
      <ul className="phases">
        {phases.map(([name, desc, state]) => (
          <li key={name} className={state}>
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
  const [tab, setTab] = useState<Tab>('home')

  // Ask the browser not to evict our data. Safe to call repeatedly.
  useEffect(() => { void navigator.storage?.persist?.() }, [])

  return (
    <>
      <header className="bar">
        <h1>{APP_NAME}</h1>
        <nav>
          {tabs.map(([id, label]) => (
            <button key={id} className={tab === id ? 'tab on' : 'tab'} onClick={() => setTab(id)}>{label}</button>
          ))}
        </nav>
        <button className="ghost" onClick={toggle} aria-label="Toggle light and dark theme">
          {theme === 'dark' ? 'Light' : 'Dark'}
        </button>
      </header>
      <main>{tab === 'home' ? <Home /> : tab === 'settings' ? <Settings /> : <Diagnostics />}</main>
    </>
  )
}
