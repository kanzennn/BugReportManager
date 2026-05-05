import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Globe, Smartphone, Laptop2, Pencil, Trash2 } from 'lucide-react'
import { ApiKeyCard } from '@/components/applications/api-key-card'
import { ApiDocs } from '@/components/applications/api-docs'
import { StatusBadge, PriorityBadge } from '@/components/ui/badge'
import { deleteApplicationAction } from '@/app/actions/applications'
import { ConfirmButton } from '@/components/ui/confirm-button'
import { relativeTime } from '@/lib/utils'
import { headers } from 'next/headers'
import type { AppType } from '@prisma/client'

const typeIcon: Record<AppType, typeof Globe> = {
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

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { userId } = await requireAuth()

  const app = await prisma.application.findFirst({
    where: { id, userId },
    include: {
      bugs: {
        orderBy: { createdAt: 'desc' },
        take: 50,
      },
      _count: { select: { bugs: true } },
    },
  })

  if (!app) notFound()

  const headerStore = await headers()
  const host = headerStore.get('host') ?? 'localhost:3000'
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  const baseUrl = `${protocol}://${host}`

  const Icon = typeIcon[app.type]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/dashboard/applications" className="mb-4 flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-100">
          <ArrowLeft className="h-4 w-4" />
          Back to Applications
        </Link>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-400">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-100">{app.name}</h1>
              <p className="text-sm text-zinc-400">{typeLabel[app.type]} · {app._count.bugs} bugs</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/applications/${app.id}/edit`}
              className="flex items-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:text-zinc-100"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Link>
            <ConfirmButton
              action={deleteApplicationAction.bind(null, app.id)}
              message="Delete this application and all its bug reports?"
              className="flex items-center gap-2 rounded-lg border border-red-800/50 px-3 py-2 text-sm font-medium text-red-400 transition-colors hover:border-red-600 hover:bg-red-500/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </ConfirmButton>
          </div>
        </div>
        {app.description && <p className="mt-3 text-sm text-zinc-400">{app.description}</p>}
      </div>

      {/* API Key */}
      <ApiKeyCard appId={app.id} apiKey={app.apiKey} />

      {/* API Docs */}
      <ApiDocs apiKey={app.apiKey} baseUrl={baseUrl} />

      {/* Bug Reports */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
          <h3 className="text-sm font-semibold text-zinc-100">Bug Reports ({app._count.bugs})</h3>
          <Link href={`/dashboard/bugs?appId=${app.id}`} className="text-xs font-medium text-indigo-400 hover:text-indigo-300">
            View all →
          </Link>
        </div>
        {app.bugs.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-zinc-500">
            No bugs reported yet. Integrate the API above to start receiving reports.
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {app.bugs.map((bug) => (
              <Link
                key={bug.id}
                href={`/dashboard/bugs/${bug.id}`}
                className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-zinc-800/50"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-100">{bug.title}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">{relativeTime(bug.createdAt)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <PriorityBadge priority={bug.priority} />
                  <StatusBadge status={bug.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
