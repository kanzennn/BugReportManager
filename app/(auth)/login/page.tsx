'use client'

import { useActionState } from 'react'
import { loginAction } from '@/app/actions/auth'
import Link from 'next/link'
import { Bug } from 'lucide-react'

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, null)

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600">
            <Bug className="h-6 w-6 text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-zinc-100">Bug Report Manager</h1>
        <p className="mt-1 text-sm text-zinc-400">Sign in to your account</p>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
        <form action={action} className="space-y-4">
          {state?.error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {state.error}
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
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-zinc-300">
              Password
            </label>
            <input
              id="password" name="password" type="password" required autoComplete="current-password"
              placeholder="••••••••"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit" disabled={pending}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
          >
            {pending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-zinc-400">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium text-indigo-400 hover:text-indigo-300">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
