import { cookies } from 'next/headers'
import type { Locale } from '@/lib/i18n'

export async function getLocale(): Promise<Locale> {
  const store = await cookies()
  return store.get('brm_locale')?.value === 'id' ? 'id' : 'en'
}
