import { useState } from 'react'

// Phase 0 "spikes": cheap experiments that test risky assumptions on the real device
// before we build features on top of them.
type Check = { id: string; title: string; why: string; run: () => Promise<string> }
type Result = { state: 'run' | 'pass' | 'fail'; detail: string }

const mb = (n?: number) => (n === undefined ? '?' : Math.round(n / 1048576))

const idbRoundTrip = () =>
  new Promise<string>((resolve, reject) => {
    const open = indexedDB.open('skein-diag', 1)
    open.onupgradeneeded = () => open.result.createObjectStore('kv')
    open.onerror = () => reject(open.error)
    open.onsuccess = () => {
      const db = open.result
      const tx = db.transaction('kv', 'readwrite')
      tx.objectStore('kv').put('hello', 'k')
      const get = tx.objectStore('kv').get('k')
      tx.oncomplete = () => { db.close(); resolve(`wrote and read back "${get.result}"`) }
      tx.onerror = () => reject(tx.error)
    }
  })

const baseChecks: Check[] = [
  {
    id: 'storage',
    title: 'Persistent storage',
    why: 'Asks the browser not to evict our data, and shows the quota.',
    run: async () => {
      if (!navigator.storage) throw new Error('Storage API not available')
      const persisted = navigator.storage.persist ? await navigator.storage.persist() : false
      const est = await navigator.storage.estimate()
      return `persistent: ${persisted}; using ${mb(est.usage)} MB of ${mb(est.quota)} MB`
    },
  },
  { id: 'idb', title: 'Database round trip', why: 'Writes and reads one record in IndexedDB.', run: idbRoundTrip },
  {
    id: 'wake',
    title: 'Keep screen awake',
    why: 'Needed so the row counter does not dim mid-row.',
    run: async () => {
      if (!('wakeLock' in navigator)) throw new Error('Wake Lock API not available')
      const lock = await navigator.wakeLock.request('screen')
      await lock.release()
      return 'screen wake lock granted and released'
    },
  },
  {
    id: 'vibrate',
    title: 'Vibration',
    why: 'Would give tap feedback on the counter.',
    run: async () => {
      if (!('vibrate' in navigator)) throw new Error('navigator.vibrate not available')
      return navigator.vibrate(50) ? 'call accepted (did you feel a buzz?)' : 'call returned false'
    },
  },
]

const ravelryCheck = (user: string, key: string): Check => ({
  id: 'ravelry',
  title: 'Ravelry API from the browser',
  why: 'Decides if pattern import can live in the app or needs a PC helper.',
  run: async () => {
    const u = user.trim(), k = key.trim() // phones often add stray spaces

    if (!u || !k) throw new Error('Enter a username and key first')
    const url = 'https://api.ravelry.com/patterns/search.json?query=socks&page_size=1'

    // Probe 1: 'no-cors' skips the CORS check, so it fails only on real network problems.
    try { await fetch(url, { mode: 'no-cors' }) }

    catch { throw new Error('Network: cannot reach api.ravelry.com from this device') }
    // Probe 2: the real call. If probe 1 passed and this fails, it is CORS or bad credentials.
    let res: Response
    try {
      res = await fetch(url, { headers: { Authorization: 'Basic ' + btoa(`${u}:${k}`) } })
    } catch {
      throw new Error(`Reachable, but the response was blocked (CORS or wrong credentials). Origin: ${location.origin}`)
    }
    
    if (!res.ok) throw new Error(`Ravelry answered HTTP ${res.status}`)
    const data = await res.json()
    return `OK, ${data.paginator?.results ?? '?'} results for "socks"`
  },
})

export default function Diagnostics() {
  const [results, setResults] = useState<Record<string, Result>>({})
  const [user, setUser] = useState('')
  const [key, setKey] = useState('') // kept in memory only, never saved
  const checks = [...baseChecks, ravelryCheck(user, key)]

  const run = async (c: Check) => {
    const set = (r: Result) => setResults((prev) => ({ ...prev, [c.id]: r }))
    set({ state: 'run', detail: 'running…' })
    try {
      set({ state: 'pass', detail: await c.run() })
    } catch (e) {
      set({ state: 'fail', detail: e instanceof Error ? e.message : String(e) })
    }
  }

  return (
    <section>
      <h2>Device diagnostics</h2>
      <p className="muted">Run each test on your iPhone from the installed app, then send me the results.</p>

      {checks.map((c) => (
        <div className="card" key={c.id}>
          <div className="row">
            <div>
              <strong>{c.title}</strong>
              <div className="muted small">{c.why}</div>
            </div>
            <button onClick={() => run(c)}>Run</button>
          </div>

          {c.id === 'ravelry' && (
            <div className="fields">
              <input placeholder="Ravelry username (read-… key)" value={user} onChange={(e) => setUser(e.target.value)} autoCapitalize="off" />
              <input placeholder="Ravelry key" type="password" value={key} onChange={(e) => setKey(e.target.value)} />
            </div>
          )}
          
          {results[c.id] && <div className={`result ${results[c.id].state}`}>{results[c.id].state}: {results[c.id].detail}</div>}
        </div>
      ))}
    </section>
  )
}
