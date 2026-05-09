'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { updateBugStatusAction } from '@/app/actions/bugs'
import { useLanguage } from '@/components/language-provider'
import type { BugStatus } from '@prisma/client'

const STATUS_VALUES: BugStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']

const statusColors: Record<BugStatus, string> = {
  OPEN: 'text-red-400 border-red-500/30 bg-red-500/10',
  IN_PROGRESS: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
  RESOLVED: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
  CLOSED: 'text-zinc-400 border-zinc-500/30 bg-zinc-500/10',
}

export function StatusUpdate({ bugId, currentStatus }: { bugId: string; currentStatus: BugStatus }) {
  const [pending, startTransition] = useTransition()
  const { t } = useLanguage()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const status = e.target.value as BugStatus
    startTransition(async () => {
      try {
        await updateBugStatusAction(bugId, status)
        toast.success(t('bugs.status.updated'))
      } catch {
        toast.error(t('bugs.status.updateFailed'))
      }
    })
  }

  return (
    <select
      value={currentStatus}
      onChange={handleChange}
      disabled={pending}
      className={`rounded-lg border px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 ${statusColors[currentStatus]}`}
    >
      {STATUS_VALUES.map((s) => (
        <option key={s} value={s} className="bg-zinc-900 text-zinc-100">
          {t(`status.${s}`)}
        </option>
      ))}
    </select>
  )
}
