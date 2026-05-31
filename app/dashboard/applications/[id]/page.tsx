import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getAppRole, isOwner as checkOwner, ROLE_LABELS } from '@/lib/access'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Globe, Smartphone, Laptop2, Pencil, Trash2, Users, MessageSquare, Bug, BarChart2, Plug } from 'lucide-react'
import { ApiKeyCard } from '@/components/applications/api-key-card'
import { ApiDocs } from '@/components/applications/api-docs'
import { MembersList } from '@/components/applications/members-list'
import { InviteForm } from '@/components/applications/invite-form'
import { StatusBadge, PriorityBadge, FeedbackTypeBadge, FeedbackStatusBadge } from '@/components/ui/badge'
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

  const role = await getAppRole(userId, id)
  if (!role) notFound()

  const owner = checkOwner(role)

  const app = await prisma.application.findFirst({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      bugs: { orderBy: { createdAt: 'desc' }, take: 50 },
      feedback: { orderBy: { createdAt: 'desc' }, take: 10 },
      members: {
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'asc' },
      },
      invitations: {
        where: { status: 'PENDING', expiresAt: { gt: new Date() } },
        orderBy: { createdAt: 'desc' },
        select: { id: true, email: true, role: true, expiresAt: true },
      },
      _count: { select: { bugs: true, feedback: true } },
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-400">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-100 sm:text-2xl">{app.name}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <p className="text-sm text-zinc-400">
                  {typeLabel[app.type]} · {app._count.bugs} bug{app._count.bugs !== 1 ? 's' : ''} · {app._count.feedback} feedback
                </p>
                <span className="rounded-full border px-2 py-0.5 text-xs font-medium bg-zinc-500/15 text-zinc-400 border-zinc-500/30">
                  {ROLE_LABELS[role]}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/dashboard/applications/${app.id}/analytics`}
              className="flex items-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:text-zinc-100"
            >
              <BarChart2 className="h-3.5 w-3.5" />
              <span>Analytics</span>
            </Link>
            {owner && (
              <Link
                href={`/dashboard/applications/${app.id}/integrations`}
                className="flex items-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:text-zinc-100"
              >
                <Plug className="h-3.5 w-3.5" />
                <span>Integrations</span>
              </Link>
            )}
            {owner && (
              <>
                <Link
                  href={`/dashboard/applications/${app.id}/edit`}
                  className="flex items-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:text-zinc-100"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </Link>
                <ConfirmButton
                  title="Are you sure?"
                  action={deleteApplicationAction.bind(null, app.id)}
                  message="Delete this application and all its bug reports?"
                  className="flex items-center gap-2 rounded-lg border border-red-800/50 px-3 py-2 text-sm font-medium text-red-400 transition-colors hover:border-red-600 hover:bg-red-500/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </ConfirmButton>
              </>
            )}
          </div>
        </div>
        {app.description && <p className="mt-3 text-sm text-zinc-400">{app.description}</p>}
      </div>

      {/* API Key (owner only) */}
      {owner && <ApiKeyCard appId={app.id} apiKey={app.apiKey} />}

      {/* API Docs (owner only) */}
      {owner && <ApiDocs apiKey={app.apiKey} baseUrl={baseUrl} />}

      {/* Members */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-5">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-zinc-400" />
          <h3 className="text-sm font-semibold text-zinc-100">Members</h3>
        </div>
        <MembersList
          appId={app.id}
          owner={{ name: app.user.name, email: app.user.email }}
          members={app.members.map((m) => ({ userId: m.userId, role: m.role, user: m.user }))}
          pendingInvitations={app.invitations}
          isOwner={owner}
        />
        {owner && (
          <>
            <hr className="border-zinc-800" />
            <InviteForm appId={app.id} />
          </>
        )}
      </div>

      {/* Bug Reports */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
          <div className="flex items-center gap-2">
            <Bug className="h-4 w-4 text-zinc-400" />
            <h3 className="text-sm font-semibold text-zinc-100">Bug Reports ({app._count.bugs})</h3>
          </div>
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

      {/* Feedback */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-zinc-400" />
            <h3 className="text-sm font-semibold text-zinc-100">Feedback ({app._count.feedback})</h3>
          </div>
          <Link href={`/dashboard/feedback?appId=${app.id}`} className="text-xs font-medium text-indigo-400 hover:text-indigo-300">
            View all →
          </Link>
        </div>
        {app.feedback.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-zinc-500">
            No feedback yet. Integrate the feedback API to start receiving responses.
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {app.feedback.map((fb) => (
              <Link
                key={fb.id}
                href={`/dashboard/feedback/${fb.id}`}
                className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-zinc-800/50"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-100">{fb.title}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {fb.rating != null && `${'★'.repeat(fb.rating)}${'☆'.repeat(5 - fb.rating)} · `}
                    {relativeTime(fb.createdAt)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <FeedbackTypeBadge type={fb.type} />
                  <FeedbackStatusBadge status={fb.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
