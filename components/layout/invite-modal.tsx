'use client'

import { useActionState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { inviteUserGeneralAction } from '@/app/actions/invitations'
import { X, UserPlus, Send } from 'lucide-react'

type State = { error?: string; success?: string } | null

const ROLES = [
  { value: 'VIEWER', label: 'Viewer', desc: 'Can view bugs & feedback' },
  { value: 'EDITOR', label: 'Editor', desc: 'Can view & update status' },
  { value: 'ADMIN',  label: 'Admin',  desc: 'Can view, update & delete' },
] as const

interface Props {
  apps: { id: string; name: string }[]
  onClose: () => void
}

export function InviteModal({ apps, onClose }: Props) {
  const [state, action, pending] = useActionState<State, FormData>(inviteUserGeneralAction, null)
  const formRef = useRef<HTMLFormElement>(null)

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  useEffect(() => {
    if (!state?.success) return
    toast.success(state.success)
    formRef.current?.reset()
    onClose()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.success])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-title"
        className="relative z-10 w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl"
      >
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600/20">
              <UserPlus className="h-3.5 w-3.5 text-indigo-400" />
            </div>
            <h2 id="invite-title" className="text-sm font-semibold text-zinc-100">
              Invite a member
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form ref={formRef} action={action} className="space-y-4">
          {/* Application */}
          <div>
            <label htmlFor="invite-app" className="mb-1.5 block text-xs font-medium text-zinc-400">
              Application
            </label>
            {apps.length === 1 ? (
              <>
                <input type="hidden" name="appId" value={apps[0].id} />
                <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-300">
                  {apps[0].name}
                </div>
              </>
            ) : (
              <select
                id="invite-app"
                name="appId"
                required
                defaultValue=""
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="" disabled>Select an application…</option>
                {apps.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* Email */}
          <div>
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

          {/* Role */}
          <div>
            <label htmlFor="invite-role" className="mb-1.5 block text-xs font-medium text-zinc-400">
              Role
            </label>
            <select
              id="invite-role"
              name="role"
              defaultValue="VIEWER"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label} — {r.desc}
                </option>
              ))}
            </select>
          </div>

          {/* Feedback */}
          {state?.error && (
            <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
              {state.error}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={pending || !!state?.success}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              {pending ? 'Sending…' : 'Send invitation'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:text-zinc-100"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
