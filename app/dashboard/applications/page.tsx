import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { Plus, Monitor, Smartphone, Globe, Laptop2, Bug, Users } from 'lucide-react'
import type { AppType, MemberRole } from '@prisma/client'
import { getLocale } from '@/lib/locale'
import { createTranslator } from '@/lib/i18n'

const typeIcon: Record<AppType, typeof Monitor> = {
  WEBSITE: Globe,
  ANDROID: Smartphone,
  IOS: Smartphone,
  DESKTOP: Laptop2,
}

const typeLabel: Record<AppType, string> = {
  WEBSITE: 'Website',
  ANDROID: 'Android',
  IOS: 'iOS',
  DESKTOP: 'Desktop',
}

interface AppCardData {
  id: string
  name: string
  type: AppType
  description: string | null
  apiKey: string
  _count: { bugs: number }
}

function AppCard({ app, role }: { app: AppCardData; role?: string }) {
  const Icon = typeIcon[app.type]
  return (
    <Link
      href={`/dashboard/applications/${app.id}`}
      className="group rounded-xl border border-zinc-800 bg-zinc-900 p-5 transition-colors hover:border-indigo-500/50 hover:bg-zinc-800/50"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600/10 text-indigo-400">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-zinc-100 group-hover:text-indigo-300">{app.name}</h3>
            <p className="text-xs text-zinc-500">
              {typeLabel[app.type]}
              {role && <span className="ml-1.5 text-zinc-600">· {role}</span>}
            </p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-400">
          <Bug className="h-3 w-3" />
          {app._count.bugs}
        </span>
      </div>
      {app.description && (
        <p className="mt-3 line-clamp-2 text-sm text-zinc-500">{app.description}</p>
      )}
      <div className="mt-4 rounded-lg bg-zinc-800 px-3 py-2 font-mono text-xs text-zinc-500 truncate">
        {app.apiKey.slice(0, 20)}…
      </div>
    </Link>
  )
}

export default async function ApplicationsPage() {
  const { userId } = await requireAuth()
  const locale = await getLocale()
  const t = createTranslator(locale)

  const [ownedApps, memberships] = await Promise.all([
    prisma.application.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { bugs: true } } },
    }),
    prisma.applicationMember.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        application: { include: { _count: { select: { bugs: true } } } },
      },
    }),
  ])

  const sharedApps = memberships.map((m) => ({
    ...m.application,
    memberRole: m.role as MemberRole,
  }))

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">{t('apps.title')}</h1>
            <p className="mt-1 text-sm text-zinc-400">{t('apps.description')}</p>
          </div>
          <Link
            href="/dashboard/applications/new"
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
          >
            <Plus className="h-4 w-4" />
            {t('apps.newApp')}
          </Link>
        </div>

        {ownedApps.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-zinc-900 py-20">
            <Bug className="mb-4 h-10 w-10 text-zinc-600" />
            <p className="text-sm font-medium text-zinc-400">{t('apps.empty.title')}</p>
            <p className="mt-1 text-xs text-zinc-600">{t('apps.empty.description')}</p>
            <Link
              href="/dashboard/applications/new"
              className="mt-4 flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
            >
              <Plus className="h-4 w-4" />
              {t('apps.newApp')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {ownedApps.map((app) => <AppCard key={app.id} app={app} />)}
          </div>
        )}
      </div>

      {sharedApps.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-zinc-400" />
            <h2 className="text-base font-semibold text-zinc-100">{t('apps.sharedWithMe')}</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {sharedApps.map((app) => (
              <AppCard
                key={app.id}
                app={app}
                role={app.memberRole.charAt(0) + app.memberRole.slice(1).toLowerCase()}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
