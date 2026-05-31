'use client'

import { useTransition, useState } from 'react'
import { updateUserRoleAction } from '@/app/actions/admin'
import { Plan } from '@prisma/client'
import { useRouter } from 'next/navigation'

interface UserRoleFormProps {
  userId: string
  currentPlan: Plan
  isAdmin: boolean
  isSelf: boolean
}

export function UserRoleForm({ userId, currentPlan, isAdmin, isSelf }: UserRoleFormProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [plan, setPlan] = useState<Plan>(currentPlan)
  const [admin, setAdmin] = useState(isAdmin)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaved(false)
    startTransition(async () => {
      try {
        await updateUserRoleAction(userId, { plan, isAdmin: admin })
        setSaved(true)
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-5">
      <h2 className="text-sm font-semibold text-zinc-100">Edit Role</h2>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-400">Plan</label>
          <select
            value={plan}
            onChange={(e) => { setPlan(e.target.value as Plan); setSaved(false) }}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {Object.values(Plan).map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-zinc-700 px-4 py-3">
          <div>
            <p className="text-sm text-zinc-200">Admin access</p>
            <p className="text-xs text-zinc-500 mt-0.5">Can access the /admin panel</p>
          </div>
          <button
            type="button"
            disabled={isSelf}
            onClick={() => { setAdmin((v) => !v); setSaved(false) }}
            title={isSelf ? 'Cannot change your own admin status' : undefined}
            className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed ${
              admin ? 'bg-indigo-600' : 'bg-zinc-700'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                admin ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}
      {saved && <p className="text-xs text-green-400">Changes saved.</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
      >
        {pending ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  )
}
