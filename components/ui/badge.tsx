'use client'

import { cn } from '@/lib/utils'
import { useLanguage } from '@/components/language-provider'
import type { BugStatus, Priority, FeedbackType, FeedbackStatus } from '@prisma/client'

const statusColors: Record<BugStatus, string> = {
  OPEN: 'bg-red-500/15 text-red-400 border-red-500/30',
  IN_PROGRESS: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  RESOLVED: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  CLOSED: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
}

const priorityColors: Record<Priority, string> = {
  LOW: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  MEDIUM: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  HIGH: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  CRITICAL: 'bg-red-500/15 text-red-400 border-red-500/30',
}

const feedbackTypeColors: Record<FeedbackType, string> = {
  GENERAL: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
  SUGGESTION: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  COMPLAINT: 'bg-red-500/15 text-red-400 border-red-500/30',
  COMPLIMENT: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
}

const feedbackStatusColors: Record<FeedbackStatus, string> = {
  NEW: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
  READ: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  ARCHIVED: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
}

export function StatusBadge({ status }: { status: BugStatus }) {
  const { t } = useLanguage()
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium', statusColors[status])}>
      {t(`status.${status}`)}
    </span>
  )
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const { t } = useLanguage()
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium', priorityColors[priority])}>
      {t(`priority.${priority}`)}
    </span>
  )
}

export function FeedbackTypeBadge({ type }: { type: FeedbackType }) {
  const { t } = useLanguage()
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium', feedbackTypeColors[type])}>
      {t(`feedbackType.${type}`)}
    </span>
  )
}

export function FeedbackStatusBadge({ status }: { status: FeedbackStatus }) {
  const { t } = useLanguage()
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium', feedbackStatusColors[status])}>
      {t(`feedbackStatus.${status}`)}
    </span>
  )
}
