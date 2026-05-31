'use client'

import { useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import { registerAction } from '@/app/actions/auth'
import Link from 'next/link'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
    </svg>
  )
}

const HEARD_FROM = [
  { value: 'search',     label: 'Search Engine (Google, Bing…)' },
  { value: 'social',     label: 'Social Media' },
  { value: 'friend',     label: 'Friend or Colleague' },
  { value: 'youtube',    label: 'YouTube / Tutorial' },
  { value: 'github',     label: 'GitHub / Open Source' },
  { value: 'other',      label: 'Other' },
]

const USER_TYPES = [
  { value: 'student',    label: 'Student' },
  { value: 'developer',  label: 'Individual Developer' },
  { value: 'freelancer', label: 'Freelancer' },
  { value: 'company',    label: 'Company / Business' },
  { value: 'other',      label: 'Other' },
]

const selectClass = 'w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, null)
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') ?? ''

  return (
    <>
      {/* Social buttons */}
      <div className="space-y-2.5">
        <a
          href="/api/auth/google"
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-100 transition-colors hover:border-zinc-600 hover:bg-zinc-700"
        >
          <GoogleIcon />
          Sign up with Google
        </a>
        <a
          href="/api/auth/github"
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-100 transition-colors hover:border-zinc-600 hover:bg-zinc-700"
        >
          <GitHubIcon />
          Sign up with GitHub
        </a>
      </div>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-zinc-800" />
        <span className="text-xs text-zinc-600">or continue with email</span>
        <div className="h-px flex-1 bg-zinc-800" />
      </div>

      <form action={action} className="space-y-4">
        {state?.error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {state.error}
          </div>
        )}
        <input type="hidden" name="redirectTo" value={redirectTo} />
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
        <div>
          <label htmlFor="heardFrom" className="mb-1.5 block text-sm font-medium text-zinc-300">
            How did you hear about us?
          </label>
          <select id="heardFrom" name="heardFrom" required className={selectClass} defaultValue="">
            <option value="" disabled>Select an option…</option>
            {HEARD_FROM.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="userType" className="mb-1.5 block text-sm font-medium text-zinc-300">
            I am a…
          </label>
          <select id="userType" name="userType" required className={selectClass} defaultValue="">
            <option value="" disabled>Select your role…</option>
            {USER_TYPES.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="terms"
              required
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-zinc-600 bg-zinc-800 accent-indigo-500"
            />
            <span className="text-sm text-zinc-300 leading-relaxed">
              I have read and agree to the{' '}
              <Link href="/terms" target="_blank" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2">
                Terms and Conditions
              </Link>{' '}
              and{' '}
              <Link href="/privacy" target="_blank" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2">
                Privacy Policy
              </Link>.
            </span>
          </label>
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
        <Link
          href={redirectTo ? `/login?redirect=${encodeURIComponent(redirectTo)}` : '/login'}
          className="font-medium text-indigo-400 hover:text-indigo-300"
        >
          Sign in
        </Link>
      </p>
    </>
  )
}
