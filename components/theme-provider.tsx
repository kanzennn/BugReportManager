'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  setTheme: () => {},
  resolvedTheme: 'dark',
})

export function useTheme() {
  return useContext(ThemeContext)
}

function getResolved(theme: Theme): 'light' | 'dark' {
  if (theme !== 'system') return theme
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({
  children,
  defaultTheme = 'dark',
  disableTransitionOnChange = false,
  attribute: _attribute = 'class',
}: {
  children: React.ReactNode
  defaultTheme?: Theme
  disableTransitionOnChange?: boolean
  attribute?: 'class'
}) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme)
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark')

  function setTheme(t: Theme) {
    setThemeState(t)
    localStorage.setItem('theme', t)
  }

  // Sync stored preference on mount
  useEffect(() => {
    const stored = (localStorage.getItem('theme') as Theme | null) ?? defaultTheme
    setThemeState(stored)
  }, [defaultTheme])

  // Apply theme class to <html> on every change
  useEffect(() => {
    const effective = getResolved(theme)
    setResolvedTheme(effective)

    if (disableTransitionOnChange) {
      const style = document.createElement('style')
      style.textContent = '*,*::before,*::after{transition:none!important}'
      document.head.appendChild(style)
      window.getComputedStyle(document.body)
      setTimeout(() => style.remove(), 1)
    }

    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(effective)
  }, [theme, disableTransitionOnChange])

  // Track system preference changes when theme === 'system'
  useEffect(() => {
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    function onChange() {
      const effective = mq.matches ? 'dark' : 'light'
      setResolvedTheme(effective)
      document.documentElement.classList.remove('light', 'dark')
      document.documentElement.classList.add(effective)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
