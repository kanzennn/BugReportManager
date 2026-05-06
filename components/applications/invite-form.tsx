'use client'

import { useActionState, useEffect } from 'react'
import { toast } from 'sonner'
import { inviteUserAction } from '@/app/actions/invitations'
import { Send } from 'lucide-react'

type State = { error?: string; success?: string } | null

const ROLES = [
  { value: 'VIEWER', label: 'Viewer', desc: 'View only' },
  { value: 'EDITOR', label: 'Editor', desc: 'View + update status' },
  { value: 'ADMIN', label: 'Admin', desc: 'View, update + delete' },
] as const

export function InviteForm({ appId }: { appId: string }) {
  const boundAction = inviteUserAction.bind(null, appId)
  const [state, action, pending] = useActionState<State, FormData>(boundAction, null)

  useEffect(() => {
    if (state?.success) toast.success(state.success)
  }, [state?.success])

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Invite a member</h4>
      <form action={action} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="invite-email" className="mb-1.5 block text-xs font-medium text-zinc-400">
            Email address
          </label>
          <input
            id="invite-email"
            name="email"
            type="email"
            required
            placeholder="colleague@example.com"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="invite-role" className="mb-1.5 block text-xs font-medium text-zinc-400">
            Role
          </label>
          <select
            id="invite-role"
            name="role"
            defaultValue="VIEWER"
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label} — {r.desc}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
        >
          <Send className="h-3.5 w-3.5" />
          {pending ? 'Sending…' : 'Send invite'}
        </button>
      </form>

      {state?.error && (
        <p className="text-xs text-red-400">{state.error}</p>
      )}
    </div>
  )
}
