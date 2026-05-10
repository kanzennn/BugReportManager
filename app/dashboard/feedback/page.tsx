import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { FeedbackTypeBadge, FeedbackStatusBadge } from '@/components/ui/badge'
import { FeedbackFilters } from '@/components/feedback/feedback-filters'
import { Pagination } from '@/components/ui/pagination'
import { relativeTime } from '@/lib/utils'
import { getLocale } from '@/lib/locale'
import { createTranslator } from '@/lib/i18n'
import type { FeedbackType, FeedbackStatus } from '@prisma/client'

const PAGE_SIZE = 10
const TYPE_OPTIONS: FeedbackType[] = ['GENERAL', 'SUGGESTION', 'COMPLAINT', 'COMPLIMENT']
const STATUS_OPTIONS: FeedbackStatus[] = ['NEW', 'READ', 'ARCHIVED']

const accessible = (userId: string) => ({
  OR: [
    { userId },
    { members: { some: { userId } } },
  ],
})

export default async function FeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string; appId?: string; q?: string; page?: string }>
}) {
  const sp = await searchParams
  const { userId } = await requireAuth()
  const locale = await getLocale()
  const t = createTranslator(locale)

  const type = TYPE_OPTIONS.find((t2) => t2 === sp.type?.toUpperCase())
  const status = STATUS_OPTIONS.find((s) => s === sp.status?.toUpperCase())
  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1)

  const where = {
    application: {
      ...accessible(userId),
      ...(sp.appId && { id: sp.appId }),
    },
    ...(type && { type }),
    ...(status && { status }),
    ...(sp.q && {
      OR: [
        { title: { contains: sp.q } },
        { message: { contains: sp.q } },
      ],
    }),
  }

  const [items, total, apps] = await Promise.all([
    prisma.feedback.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { application: { select: { id: true, name: true } } },
    }),
    prisma.feedback.count({ where }),
    prisma.application.findMany({
      where: accessible(userId),
      select: { id: true, name: true },
    }),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">{t('feedback.title')}</h1>
        <p className="mt-1 text-sm text-zinc-400">
          {total} {locale === 'id' ? 'item ditemukan' : `item${total !== 1 ? 's' : ''} found`}
        </p>
      </div>

      <FeedbackFilters apps={apps} />

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
        {items.length === 0 ? (
          <div className="px-5 py-16 text-center text-sm text-zinc-500">
            {t('feedback.empty')}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-800/50">
                    {['feedback.table.feedback', 'feedback.table.application', 'feedback.table.type', 'feedback.table.status', 'feedback.table.received'].map((k) => (
                      <th key={k} className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-400">{t(k)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {items.map((item) => (
                    <tr key={item.id} className="transition-colors hover:bg-zinc-800/50">
                      <td className="px-5 py-3.5">
                        <Link href={`/dashboard/feedback/${item.id}`} className="font-medium text-zinc-100 hover:text-indigo-400">
                          {item.title}
                        </Link>
                        {item.reporterEmail && (
                          <p className="mt-0.5 text-xs text-zinc-500">{item.reporterEmail}</p>
                        )}
                        {item.rating != null && (
                          <p className="mt-0.5 text-xs text-amber-400">{'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}</p>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <Link href={`/dashboard/applications/${item.application.id}`} className="text-xs text-zinc-400 hover:text-zinc-100">
                          {item.application.name}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5"><FeedbackTypeBadge type={item.type} /></td>
                      <td className="px-5 py-3.5"><FeedbackStatusBadge status={item.status} /></td>
                      <td className="px-5 py-3.5 text-xs text-zinc-500">{relativeTime(item.createdAt, locale)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="divide-y divide-zinc-800 md:hidden">
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={`/dashboard/feedback/${item.id}`}
                  className="flex flex-col gap-2 px-4 py-3.5 transition-colors hover:bg-zinc-800/50"
                >
                  <p className="text-sm font-medium text-zinc-100 leading-snug">{item.title}</p>
                  {item.rating != null && (
                    <p className="text-xs text-amber-400">{'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}</p>
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    <FeedbackTypeBadge type={item.type} />
                    <FeedbackStatusBadge status={item.status} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">{item.application.name}</span>
                    <span className="text-xs text-zinc-500">{relativeTime(item.createdAt, locale)}</span>
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
