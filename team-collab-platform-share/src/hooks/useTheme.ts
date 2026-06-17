import { useCallback, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'
const THEME_KEY = 'teamflow.theme'

function getInitial(): Theme {
  try {
    const saved = localStorage.getItem(THEME_KEY) as Theme | null
    if (saved) return saved
  } catch {
    /* ignore */
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/** Dark/light theme with `.dark` class on <html> and localStorage persistence. */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitial)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch {
      /* ignore */
    }
  }, [theme])

  const toggle = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), [])

  return { theme, toggle }
}
