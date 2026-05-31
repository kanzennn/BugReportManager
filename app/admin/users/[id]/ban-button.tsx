'use client'

import { useTransition, useState } from 'react'
import { banUserAction } from '@/app/actions/admin'
import { useRouter } from 'next/navigation'
import { ShieldOff, ShieldCheck } from 'lucide-react'

interface BanButtonProps {
  userId: string
  isBanned: boolean
}

export function BanButton({ userId, isBanned }: BanButtonProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [confirm, setConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function execute() {
    setError(null)
    startTransition(async () => {
      try {
        await banUserAction(userId, !isBanned)
        setConfirm(false)
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
        setConfirm(false)
      }
    })
  }

  if (isBanned) {
    return (
      <div className="flex items-center gap-3">
        {error && <p className="text-xs text-red-400">{error}</p>}
        <button
          onClick={execute}
          disabled={pending}
          className="flex items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700 disabled:opacity-50"
        >
          <ShieldCheck className="h-4 w-4" />
          {pending ? 'Unbanning…' : 'Unban user'}
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      {error && <p className="text-xs text-red-400">{error}</p>}
      {confirm ? (
        <>
          <span className="text-sm text-zinc-400">Ban this user?</span>
          <button
            onClick={execute}
            disabled={pending}
            className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50"
          >
            {pending ? 'Banning…' : 'Confirm ban'}
          </button>
          <button
            onClick={() => setConfirm(false)}
            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-100"
          >
            Cancel
          </button>
        </>
      ) : (
        <button
          onClick={() => setConfirm(true)}
          className="flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:border-red-800 hover:text-red-400"
        >
          <ShieldOff className="h-4 w-4" />
          Ban user
        </button>
      )}
    </div>
  )
}
