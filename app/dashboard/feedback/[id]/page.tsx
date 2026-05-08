import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Trash2, User, Tag, Clock, Star } from 'lucide-react'
import { FeedbackTypeBadge, FeedbackStatusBadge } from '@/components/ui/badge'
import { FeedbackStatusUpdate } from '@/components/feedback/feedback-status-update'
import { deleteFeedbackAction } from '@/app/actions/feedback'
import { ConfirmButton } from '@/components/ui/confirm-button'
import { formatDateTime } from '@/lib/utils'

export default async function FeedbackDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { userId } = await requireAuth()

  const feedback = await prisma.feedback.findFirst({
    where: { id, application: { userId } },
    include: { application: { select: { id: true, name: true } } },
  })

  if (!feedback) notFound()

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <Link href="/dashboard/feedback" className="mb-4 flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-100">
          <ArrowLeft className="h-4 w-4" />
          Back to Feedback
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-zinc-100">{feedback.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <FeedbackTypeBadge type={feedback.type} />
              <FeedbackStatusBadge status={feedback.status} />
              <Link
                href={`/dashboard/applications/${feedback.application.id}`}
                className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-xs font-medium text-indigo-400 hover:text-indigo-300"
              >
                {feedback.application.name}
              </Link>
            </div>
          </div>
          <ConfirmButton
              title="Are you sure?"
            action={deleteFeedbackAction.bind(null, feedback.id, '/dashboard/feedback')}
            message="Delete this feedback?"
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
            <p className="mt-0.5 text-xs text-zinc-500">Mark this feedback as read or archive it.</p>
          </div>
          <FeedbackStatusUpdate feedbackId={feedback.id} currentStatus={feedback.status} />
        </div>
      </div>

      {/* Message */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="mb-3 text-sm font-semibold text-zinc-100">Message</h2>
        <p className="whitespace-pre-wrap text-sm text-zinc-300">{feedback.message}</p>
      </div>

      {/* Metadata */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="mb-4 text-sm font-semibold text-zinc-100">Details</h2>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
            <div>
              <dt className="text-xs text-zinc-500">Received</dt>
              <dd className="text-sm text-zinc-300">{formatDateTime(feedback.createdAt)}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
            <div>
              <dt className="text-xs text-zinc-500">Last Updated</dt>
              <dd className="text-sm text-zinc-300">{formatDateTime(feedback.updatedAt)}</dd>
            </div>
          </div>
          {feedback.rating != null && (
            <div className="flex items-start gap-3">
              <Star className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
              <div>
                <dt className="text-xs text-zinc-500">Rating</dt>
                <dd className="text-sm text-amber-400">
                  {'★'.repeat(feedback.rating)}{'☆'.repeat(5 - feedback.rating)} ({feedback.rating}/5)
                </dd>
              </div>
            </div>
          )}
          {feedback.reporterEmail && (
            <div className="flex items-start gap-3">
              <User className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
              <div>
                <dt className="text-xs text-zinc-500">Reporter</dt>
                <dd className="text-sm text-zinc-300">{feedback.reporterEmail}</dd>
              </div>
            </div>
          )}
          {feedback.appVersion && (
            <div className="flex items-start gap-3">
              <Tag className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
              <div>
                <dt className="text-xs text-zinc-500">App Version</dt>
                <dd className="text-sm text-zinc-300">{feedback.appVersion}</dd>
              </div>
            </div>
          )}
        </dl>
      </div>
    </div>
  )
}
