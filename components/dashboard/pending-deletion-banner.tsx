'use client'

import { useTransition } from 'react'
import { cancelDeletionAction } from '@/app/actions/profile'
import { AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function PendingDeletionBanner() {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleCancel() {
    startTransition(async () => {
      await cancelDeletionAction()
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-red-900/40 border-b border-red-700/50 px-4 py-3 text-sm text-red-300">
      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 sm:mt-0" />
      <span className="flex-1">
        Your account is scheduled for deletion in 30 days. All your data will be permanently removed.
      </span>
      <button
        type="button"
        onClick={handleCancel}
        disabled={isPending}
        className="shrink-0 rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-500 disabled:opacity-50"
      >
        {isPending ? 'Cancelling…' : 'Cancel deletion'}
      </button>
    </div>
  )
}
