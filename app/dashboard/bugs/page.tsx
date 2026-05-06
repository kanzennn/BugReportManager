import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { StatusBadge, PriorityBadge } from '@/components/ui/badge'
import { BugFilters } from '@/components/bugs/bug-filters'
import { relativeTime } from '@/lib/utils'
import type { BugStatus, Priority } from '@prisma/client'

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
  searchParams: Promise<{ status?: string; priority?: string; appId?: string; q?: string }>
}) {
  const sp = await searchParams
  const { userId } = await requireAuth()

  const status = STATUS_OPTIONS.find((s) => s === sp.status?.toUpperCase())
  const priority = PRIORITY_OPTIONS.find((p) => p === sp.priority?.toUpperCase())

  const [bugs, apps] = await Promise.all([
    prisma.bugReport.findMany({
      where: {
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
        <h1 className="text-2xl font-bold text-zinc-100">Bug Reports</h1>
        <p className="mt-1 text-sm text-zinc-400">
          {bugs.length} report{bugs.length !== 1 ? 's' : ''} found
        </p>
      </div>

      <BugFilters apps={apps} />

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
        {bugs.length === 0 ? (
          <div className="px-5 py-16 text-center text-sm text-zinc-500">
            No bugs found matching your filters.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-800/50">
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-400">Bug</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-400">Application</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-400">Priority</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-400">Status</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-400">Reported</th>
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
                  <td className="px-5 py-3.5 text-xs text-zinc-500">{relativeTime(bug.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
