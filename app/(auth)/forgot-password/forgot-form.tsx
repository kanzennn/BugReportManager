'use client'

import { useActionState } from 'react'
import { forgotPasswordAction } from '@/app/actions/auth'
import Link from 'next/link'

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(forgotPasswordAction, null)

  if (state && 'sent' in state) {
    return (
      <div className="space-y-4 text-center">
        <div className="rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
          If an account with that email exists, a reset link has been sent.
        </div>
        <Link href="/login" className="block text-sm text-indigo-400 hover:text-indigo-300">
          ← Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <form action={action} className="space-y-4">
      {state && 'error' in state && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {'error' in state && state.error}
        </div>
      )}
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-zinc-300">
          Email address
        </label>
        <input
          id="email" name="email" type="email" required autoComplete="email"
          placeholder="you@example.com"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>
      <button
        type="submit" disabled={pending}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
      >
        {pending ? 'Sending…' : 'Send reset link'}
      </button>
      <p className="text-center text-sm text-zinc-400">
        <Link href="/login" className="text-indigo-400 hover:text-indigo-300">← Back to sign in</Link>
      </p>
    </form>
  )
}
