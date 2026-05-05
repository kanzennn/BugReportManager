'use client'

import { useActionState } from 'react'
import { registerAction } from '@/app/actions/auth'
import Link from 'next/link'
import { Bug } from 'lucide-react'

export default function RegisterPage() {
  const [state, action, pending] = useActionState(registerAction, null)

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600">
            <Bug className="h-6 w-6 text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-zinc-100">Create an account</h1>
        <p className="mt-1 text-sm text-zinc-400">Start managing your bug reports</p>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
        <form action={action} className="space-y-4">
          {state?.error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {state.error}
            </div>
          )}
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-zinc-300">
              Full name
            </label>
            <input
              id="name" name="name" type="text" required autoComplete="name"
              placeholder="John Doe"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
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
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-zinc-300">
              Password
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
            {pending ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-zinc-400">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-indigo-400 hover:text-indigo-300">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
