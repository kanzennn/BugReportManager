import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { FeedbackTypeBadge, FeedbackStatusBadge } from '@/components/ui/badge'
import { FeedbackFilters } from '@/components/feedback/feedback-filters'
import { relativeTime } from '@/lib/utils'
import type { FeedbackType, FeedbackStatus } from '@prisma/client'

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
  searchParams: Promise<{ status?: string; type?: string; appId?: string; q?: string }>
}) {
  const sp = await searchParams
  const { userId } = await requireAuth()

  const type = TYPE_OPTIONS.find((t) => t === sp.type?.toUpperCase())
  const status = STATUS_OPTIONS.find((s) => s === sp.status?.toUpperCase())

  const [items, apps] = await Promise.all([
    prisma.feedback.findMany({
      where: {
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
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { application: { select: { id: true, name: true } } },
    }),
    prisma.application.findMany({
      where: accessible(userId),
      select: { id: true, name: true },
    }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Feedback</h1>
        <p className="mt-1 text-sm text-zinc-400">
          {items.length} item{items.length !== 1 ? 's' : ''} found
        </p>
      </div>

      <FeedbackFilters apps={apps} />

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
        {items.length === 0 ? (
          <div className="px-5 py-16 text-center text-sm text-zinc-500">
            No feedback found matching your filters.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-800/50">
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-400">Feedback</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-400">Application</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-400">Type</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-400">Status</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-400">Received</th>
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
                  <td className="px-5 py-3.5 text-xs text-zinc-500">{relativeTime(item.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
