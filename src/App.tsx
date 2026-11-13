import { useEffect, useState } from 'react'
import { useTheme } from './theme'
import { APP_NAME } from './config'
import Diagnostics from './Diagnostics'
import Projects from './Projects'
import Settings from './Settings'

type Tab = 'projects' | 'settings' | 'diag'
const tabs: [Tab, string][] = [['projects', 'Projects'], ['settings', 'Settings'], ['diag', 'Diagnostics']]

export default function App() {
  const { theme, toggle } = useTheme()
  const [tab, setTab] = useState<Tab>('projects')

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
      <main>{tab === 'projects' ? <Projects /> : tab === 'settings' ? <Settings /> : <Diagnostics />}</main>
    </>
  )
}
