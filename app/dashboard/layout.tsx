import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { withCache } from '@/lib/cache'
import { Sidebar } from '@/components/layout/sidebar'
import { Heartbeat } from '@/components/layout/heartbeat'
import { LanguageProvider } from '@/components/language-provider'
import { getLocale } from '@/lib/locale'
import type { Locale } from '@/lib/i18n'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await requireAuth()

  const [user, ownedApps, locale] = await Promise.all([
    withCache(`user:${userId}:profile`, 120, () =>
      prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true, avatarUrl: true, isAdmin: true, locale: true },
      })
    ),
    withCache(`user:${userId}:apps`, 60, () =>
      prisma.application.findMany({
        where: { userId },
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      })
    ),
    getLocale(),
  ])

  // If the DB preference differs from the cookie (e.g. new device), use the DB value
  const effectiveLocale: Locale = (user?.locale === 'id' || user?.locale === 'en')
    ? (user.locale as Locale)
    : locale

  return (
    <LanguageProvider locale={effectiveLocale}>
      <div className="flex min-h-screen bg-zinc-950">
        <Heartbeat />
        <Sidebar
          userName={user?.name ?? user?.email ?? 'User'}
          avatarUrl={user?.avatarUrl}
          ownedApps={ownedApps}
          isAdmin={user?.isAdmin ?? false}
        />
        <div className="flex-1 pl-0 md:pl-60 print:pl-0">
          <main className="p-4 pt-[72px] md:p-8 md:pt-8">{children}</main>
        </div>
      </div>
    </LanguageProvider>
  )
}
