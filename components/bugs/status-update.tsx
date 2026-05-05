'use client'

import { useTransition } from 'react'
import { updateBugStatusAction } from '@/app/actions/bugs'
import type { BugStatus } from '@prisma/client'

const statuses: { value: BugStatus; label: string }[] = [
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
]

const statusColors: Record<BugStatus, string> = {
  OPEN: 'text-red-400 border-red-500/30 bg-red-500/10',
  IN_PROGRESS: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
  RESOLVED: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
  CLOSED: 'text-zinc-400 border-zinc-500/30 bg-zinc-500/10',
}

export function StatusUpdate({ bugId, currentStatus }: { bugId: string; currentStatus: BugStatus }) {
  const [pending, startTransition] = useTransition()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const status = e.target.value as BugStatus
    startTransition(() => updateBugStatusAction(bugId, status))
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
