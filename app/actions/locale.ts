'use server'

import { cookies } from 'next/headers'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import type { Locale } from '@/lib/i18n'

export async function setLocaleAction(locale: Locale) {
  const store = await cookies()
  store.set('brm_locale', locale, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
  })

  const session = await getSession()
  if (session) {
    await prisma.user.update({
      where: { id: session.userId },
      data: { locale },
    })
  }
}
