'use client'

import { useTransition } from 'react'
import { updateFeedbackStatusAction } from '@/app/actions/feedback'
import type { FeedbackStatus } from '@prisma/client'

const statuses: { value: FeedbackStatus; label: string }[] = [
  { value: 'NEW', label: 'New' },
  { value: 'READ', label: 'Read' },
  { value: 'ARCHIVED', label: 'Archived' },
]

const statusColors: Record<FeedbackStatus, string> = {
  NEW: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
  READ: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
  ARCHIVED: 'text-zinc-400 border-zinc-500/30 bg-zinc-500/10',
}

export function FeedbackStatusUpdate({
  feedbackId,
  currentStatus,
}: {
  feedbackId: string
  currentStatus: FeedbackStatus
}) {
  const [pending, startTransition] = useTransition()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const status = e.target.value as FeedbackStatus
    startTransition(() => updateFeedbackStatusAction(feedbackId, status))
  }

  return (
    <select
      value={currentStatus}
      onChange={handleChange}
      disabled={pending}
      className={`rounded-lg border px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 ${statusColors[currentStatus]}`}
    >
      {statuses.map((s) => (
        <option key={s.value} value={s.value} className="bg-zinc-900 text-zinc-100">
          {s.label}
        </option>
      ))}
    </select>
  )
}
