'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Globe } from 'lucide-react'
import { setLocaleAction } from '@/app/actions/locale'
import { useLanguage } from '@/components/language-provider'
import { cn } from '@/lib/utils'
import type { Locale } from '@/lib/i18n'

const LOCALES: Locale[] = ['en', 'id']

export function LanguageSelector() {
  const { locale, t } = useLanguage()
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function handleChange(next: Locale) {
    if (next === locale) return
    startTransition(async () => {
      await setLocaleAction(next)
      router.refresh()
    })
  }

  return (
    <div className="flex gap-2">
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          disabled={pending}
          onClick={() => handleChange(l)}
          className={cn(
            'flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50',
            locale === l
              ? 'border-indigo-500/50 bg-indigo-600/20 text-indigo-400'
              : 'border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:bg-zinc-800 hover:text-zinc-100'
          )}
        >
          <Globe className="h-4 w-4" />
          {t(`settings.language.${l}`)}
        </button>
      ))}
    </div>
  )
}
