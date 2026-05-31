import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Trash2, User, Cpu, Tag, Clock } from 'lucide-react'
import { StatusBadge, PriorityBadge } from '@/components/ui/badge'
import { StatusUpdate } from '@/components/bugs/status-update'
import { deleteBugAction } from '@/app/actions/bugs'
import { ConfirmButton } from '@/components/ui/confirm-button'
import { formatDateTime } from '@/lib/utils'
import { TrelloButton } from './trello-button'

export default async function BugDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { userId } = await requireAuth()

  const bug = await prisma.bugReport.findFirst({
    where: {
      id,
      application: { OR: [{ userId }, { members: { some: { userId } } }] },
    },
    include: {
      application: {
        select: { id: true, name: true, trelloListId: true, userId: true },
      },
    },
  })

  if (!bug) notFound()

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <Link href="/dashboard/bugs" className="mb-4 flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-100">
          <ArrowLeft className="h-4 w-4" />
          Back to Bugs
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-zinc-100">{bug.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <PriorityBadge priority={bug.priority} />
              <StatusBadge status={bug.status} />
              <Link
                href={`/dashboard/applications/${bug.application.id}`}
                className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-xs font-medium text-indigo-400 hover:text-indigo-300"
              >
                {bug.application.name}
              </Link>
            </div>
          </div>
          <ConfirmButton
              title="Are you sure?"
            action={deleteBugAction.bind(null, bug.id, '/dashboard/bugs')}
            message="Delete this bug report?"
            className="flex shrink-0 items-center gap-2 rounded-lg border border-red-800/50 px-3 py-2 text-sm font-medium text-red-400 transition-colors hover:border-red-600 hover:bg-red-500/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </ConfirmButton>
        </div>
      </div>

      {/* Status Update */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-zinc-100">Update Status</p>
            <p className="mt-0.5 text-xs text-zinc-500">Change the current status of this bug report.</p>
          </div>
          <StatusUpdate bugId={bug.id} currentStatus={bug.status} />
        </div>
      </div>

      {/* Description */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="mb-3 text-sm font-semibold text-zinc-100">Description</h2>
        <p className="whitespace-pre-wrap text-sm text-zinc-300">{bug.description}</p>
      </div>

      {/* Metadata */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="mb-4 text-sm font-semibold text-zinc-100">Details</h2>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
            <div>
              <dt className="text-xs text-zinc-500">Reported</dt>
              <dd className="text-sm text-zinc-300">{formatDateTime(bug.createdAt)}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
            <div>
              <dt className="text-xs text-zinc-500">Last Updated</dt>
              <dd className="text-sm text-zinc-300">{formatDateTime(bug.updatedAt)}</dd>
            </div>
          </div>
          {bug.reporterEmail && (
            <div className="flex items-start gap-3">
              <User className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
              <div>
                <dt className="text-xs text-zinc-500">Reporter</dt>
                <dd className="text-sm text-zinc-300">{bug.reporterEmail}</dd>
              </div>
            </div>
          )}
          {bug.appVersion && (
            <div className="flex items-start gap-3">
              <Tag className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
              <div>
                <dt className="text-xs text-zinc-500">App Version</dt>
                <dd className="text-sm text-zinc-300">{bug.appVersion}</dd>
              </div>
            </div>
          )}
          {bug.deviceInfo && (
            <div className="flex items-start gap-3 sm:col-span-2">
              <Cpu className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
              <div>
                <dt className="text-xs text-zinc-500">Device Info</dt>
                <dd className="text-sm text-zinc-300">{bug.deviceInfo}</dd>
              </div>
            </div>
          )}
        </dl>
      </div>

      {/* Trello */}
      {bug.application.trelloListId && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-zinc-100">Trello</p>
              <p className="mt-0.5 text-xs text-zinc-500">
                {bug.trelloCardUrl ? 'This bug has been pushed to Trello.' : 'Push this bug as a Trello card.'}
              </p>
            </div>
            <TrelloButton bugId={bug.id} trelloCardUrl={bug.trelloCardUrl ?? null} />
          </div>
        </div>
      )}

      {/* Stack Trace */}
      {bug.stackTrace && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="mb-3 text-sm font-semibold text-zinc-100">Stack Trace</h2>
          <pre className="overflow-x-auto rounded-lg bg-zinc-950 p-4 font-mono text-xs text-zinc-400 border border-zinc-800">
            {bug.stackTrace}
          </pre>
        </div>
      )}
    </div>
  )
}
