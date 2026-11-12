import { useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

// index.html already picked the starting theme; we just read it back.
const initial = (): Theme => (document.documentElement.dataset.theme as Theme) || 'light'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(initial)
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem('theme', theme)
    } catch {
      /* storage can be unavailable; the theme just won't persist */
    }
  }, [theme])
  return { theme, toggle: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')) }
}
