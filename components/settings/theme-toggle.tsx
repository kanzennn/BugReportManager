'use client'

import { useEffect, useState } from 'react'
import { useTheme } from '@/components/theme-provider'
import { Sun, Moon, Monitor } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/components/language-provider'
import type { Locale } from '@/lib/i18n'

const OPTIONS = [
  { value: 'light',  labelKey: 'settings.theme.light',  icon: Sun },
  { value: 'dark',   labelKey: 'settings.theme.dark',   icon: Moon },
  { value: 'system', labelKey: 'settings.theme.system', icon: Monitor },
] as const

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const { t } = useLanguage()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  return (
    <div className="flex gap-2">
      {OPTIONS.map(({ value, labelKey, icon: Icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => setTheme(value)}
          className={cn(
            'flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
            theme === value
              ? 'border-indigo-500/50 bg-indigo-600/20 text-indigo-400'
              : 'border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:bg-zinc-800 hover:text-zinc-100'
          )}
        >
          <Icon className="h-4 w-4" />
          {t(labelKey)}
        </button>
      ))}
    </div>
  )
}
