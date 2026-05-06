'use client'

import { useActionState } from 'react'
import { changePasswordAction } from '@/app/actions/profile'

type State = { error?: string; success?: string } | null

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState<State, FormData>(changePasswordAction, null)

  return (
    <form action={action} className="space-y-4">
      {state?.error && (
        <p className="text-sm text-red-400">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-sm text-emerald-400">{state.success}</p>
      )}
      <div>
        <label htmlFor="current" className="mb-1.5 block text-sm font-medium text-zinc-300">
          Current password
        </label>
        <input
          id="current"
          name="current"
          type="password"
          required
          placeholder="••••••••"
          autoComplete="current-password"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>
      <div>
        <label htmlFor="next" className="mb-1.5 block text-sm font-medium text-zinc-300">
          New password
        </label>
        <input
          id="next"
          name="next"
          type="password"
          required
          placeholder="At least 8 characters"
          autoComplete="new-password"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>
      <div>
        <label htmlFor="confirm" className="mb-1.5 block text-sm font-medium text-zinc-300">
          Confirm new password
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          required
          placeholder="••••••••"
          autoComplete="new-password"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
      >
        {pending ? 'Updating…' : 'Update password'}
      </button>
    </form>
  )
}
