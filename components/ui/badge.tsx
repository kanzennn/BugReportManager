import { cn } from '@/lib/utils'
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

const statusLabels: Record<BugStatus, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
}

const priorityLabels: Record<Priority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
}

export function StatusBadge({ status }: { status: BugStatus }) {
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium', statusColors[status])}>
      {statusLabels[status]}
    </span>
  )
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium', priorityColors[priority])}>
      {priorityLabels[priority]}
    </span>
  )
}

const feedbackTypeColors: Record<FeedbackType, string> = {
  GENERAL: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
  SUGGESTION: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  COMPLAINT: 'bg-red-500/15 text-red-400 border-red-500/30',
  COMPLIMENT: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
}

const feedbackTypeLabels: Record<FeedbackType, string> = {
  GENERAL: 'General',
  SUGGESTION: 'Suggestion',
  COMPLAINT: 'Complaint',
  COMPLIMENT: 'Compliment',
}

const feedbackStatusColors: Record<FeedbackStatus, string> = {
  NEW: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
  READ: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  ARCHIVED: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
}

const feedbackStatusLabels: Record<FeedbackStatus, string> = {
  NEW: 'New',
  READ: 'Read',
  ARCHIVED: 'Archived',
}

export function FeedbackTypeBadge({ type }: { type: FeedbackType }) {
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium', feedbackTypeColors[type])}>
      {feedbackTypeLabels[type]}
    </span>
  )
}

export function FeedbackStatusBadge({ status }: { status: FeedbackStatus }) {
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium', feedbackStatusColors[status])}>
      {feedbackStatusLabels[status]}
    </span>
  )
}
