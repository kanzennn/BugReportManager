'use client'

import { createContext, useContext, useMemo } from 'react'
import { createTranslator, type Locale } from '@/lib/i18n'

type LanguageContextValue = {
  locale: Locale
  t: ReturnType<typeof createTranslator>
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: 'en',
  t: createTranslator('en'),
})

export function LanguageProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const value = useMemo(() => ({ locale, t: createTranslator(locale) }), [locale])
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  return useContext(LanguageContext)
}
