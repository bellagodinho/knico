import { useEffect } from 'react'

// Keeps the screen on while mounted. The browser drops the lock when the page is hidden, so re-acquire on return.
export function useWakeLock() {
  useEffect(() => {
    let lock: WakeLockSentinel | null = null
    const acquire = async () => {
      try {
        if (document.visibilityState === 'visible') lock = (await navigator.wakeLock?.request('screen')) ?? null
      } catch { /* denied: the screen may dim */ }
    }
    void acquire()
    document.addEventListener('visibilitychange', acquire)
    return () => {
      document.removeEventListener('visibilitychange', acquire)
      void lock?.release()
    }
  }, [])
}
