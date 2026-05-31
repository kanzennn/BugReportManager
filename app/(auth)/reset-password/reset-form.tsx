'use client'

import { useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import { resetPasswordAction } from '@/app/actions/auth'
import Link from 'next/link'

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState(resetPasswordAction, null)
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''

  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          Invalid or missing reset token.
        </div>
        <Link href="/forgot-password" className="block text-sm text-indigo-400 hover:text-indigo-300">
          Request a new reset link
        </Link>
      </div>
    )
  }

  return (
    <form action={action} className="space-y-4">
      {state?.error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {state.error}
        </div>
      )}
      <input type="hidden" name="token" value={token} />
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-zinc-300">
          New password
        </label>
        <input
          id="password" name="password" type="password" required autoComplete="new-password"
          placeholder="At least 8 characters"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>
      <button
        type="submit" disabled={pending}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
      >
        {pending ? 'Saving…' : 'Set new password'}
      </button>
    </form>
  )
}
