import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { StatusBadge, PriorityBadge } from '@/components/ui/badge'
import { BugFilters } from '@/components/bugs/bug-filters'
import { Pagination } from '@/components/ui/pagination'
import { relativeTime } from '@/lib/utils'
import { getLocale } from '@/lib/locale'
import { createTranslator } from '@/lib/i18n'
import type { BugStatus, Priority } from '@prisma/client'

const PAGE_SIZE = 10
const STATUS_OPTIONS: BugStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']
const PRIORITY_OPTIONS: Priority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

const accessible = (userId: string) => ({
  OR: [
    { userId },
    { members: { some: { userId } } },
  ],
})

export default async function BugsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; priority?: string; appId?: string; q?: string; page?: string }>
}) {
  const sp = await searchParams
  const { userId } = await requireAuth()
  const locale = await getLocale()
  const t = createTranslator(locale)

  const status = STATUS_OPTIONS.find((s) => s === sp.status?.toUpperCase())
  const priority = PRIORITY_OPTIONS.find((p) => p === sp.priority?.toUpperCase())
  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1)

  const where = {
    application: {
      ...accessible(userId),
      ...(sp.appId && { id: sp.appId }),
    },
    ...(status && { status }),
    ...(priority && { priority }),
    ...(sp.q && {
      OR: [
        { title: { contains: sp.q } },
        { description: { contains: sp.q } },
      ],
    }),
  }

  const [bugs, total, apps] = await Promise.all([
    prisma.bugReport.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { application: { select: { id: true, name: true } } },
    }),
    prisma.bugReport.count({ where }),
    prisma.application.findMany({
      where: accessible(userId),
      select: { id: true, name: true },
    }),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">{t('bugs.title')}</h1>
          <p className="mt-1 text-sm text-zinc-400">
            {total} {locale === 'id' ? 'laporan ditemukan' : `report${total !== 1 ? 's' : ''} found`}
          </p>
        </div>
        <a
          href={`/api/export/bugs${sp.appId ? `?appId=${sp.appId}` : ''}`}
          className="shrink-0 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-100"
        >
          Export CSV
        </a>
      </div>

      <BugFilters apps={apps} />

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
        {bugs.length === 0 ? (
          <div className="px-5 py-16 text-center text-sm text-zinc-500">
            {t('bugs.empty')}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-800/50">
                    {['bugs.table.bug', 'bugs.table.application', 'bugs.table.priority', 'bugs.table.status', 'bugs.table.reported'].map((k) => (
                      <th key={k} className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-400">{t(k)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {bugs.map((bug) => (
                    <tr key={bug.id} className="transition-colors hover:bg-zinc-800/50">
                      <td className="px-5 py-3.5">
                        <Link href={`/dashboard/bugs/${bug.id}`} className="font-medium text-zinc-100 hover:text-indigo-400">
                          {bug.title}
                        </Link>
                        {bug.reporterEmail && (
                          <p className="mt-0.5 text-xs text-zinc-500">{bug.reporterEmail}</p>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <Link href={`/dashboard/applications/${bug.application.id}`} className="text-xs text-zinc-400 hover:text-zinc-100">
                          {bug.application.name}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5"><PriorityBadge priority={bug.priority} /></td>
                      <td className="px-5 py-3.5"><StatusBadge status={bug.status} /></td>
                      <td className="px-5 py-3.5 text-xs text-zinc-500">{relativeTime(bug.createdAt, locale)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="divide-y divide-zinc-800 md:hidden">
              {bugs.map((bug) => (
                <Link
                  key={bug.id}
                  href={`/dashboard/bugs/${bug.id}`}
                  className="flex flex-col gap-2 px-4 py-3.5 transition-colors hover:bg-zinc-800/50"
                >
                  <p className="text-sm font-medium text-zinc-100 leading-snug">{bug.title}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <PriorityBadge priority={bug.priority} />
                    <StatusBadge status={bug.status} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">{bug.application.name}</span>
                    <span className="text-xs text-zinc-500">{relativeTime(bug.createdAt, locale)}</span>
                  </div>
                </Link>
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} total={total} pageSize={PAGE_SIZE} />
          </>
        )}
      </div>
    </div>
  )
}
