import type { Metadata } from 'next'
import { ThemeToggle } from '@/components/settings/theme-toggle'
import { LanguageSelector } from '@/components/settings/language-selector'
import { getLocale } from '@/lib/locale'
import { createTranslator } from '@/lib/i18n'

export const metadata: Metadata = { title: 'Settings' }

export default async function SettingsPage() {
  const locale = await getLocale()
  const t = createTranslator(locale)

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">{t('settings.title')}</h1>
        <p className="mt-1 text-sm text-zinc-400">{t('settings.description')}</p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-sm font-semibold text-zinc-100">{t('settings.appearance.title')}</h2>
        <p className="mt-1 text-sm text-zinc-400">{t('settings.appearance.description')}</p>
        <div className="mt-4">
          <ThemeToggle />
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-sm font-semibold text-zinc-100">{t('settings.language.title')}</h2>
        <p className="mt-1 text-sm text-zinc-400">{t('settings.language.description')}</p>
        <div className="mt-4">
          <LanguageSelector />
        </div>
      </div>
    </div>
  )
}
