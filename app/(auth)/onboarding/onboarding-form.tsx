'use client'

import { useActionState } from 'react'
import { onboardingAction } from '@/app/actions/onboarding'
import Link from 'next/link'

const HEARD_FROM = [
  { value: 'search',    label: 'Search Engine (Google, Bing…)' },
  { value: 'social',    label: 'Social Media' },
  { value: 'friend',    label: 'Friend or Colleague' },
  { value: 'youtube',   label: 'YouTube / Tutorial' },
  { value: 'github',    label: 'GitHub / Open Source' },
  { value: 'other',     label: 'Other' },
]

const USER_TYPES = [
  { value: 'student',   label: 'Student' },
  { value: 'developer', label: 'Individual Developer' },
  { value: 'freelancer',label: 'Freelancer' },
  { value: 'company',   label: 'Company / Business' },
  { value: 'other',     label: 'Other' },
]

const selectClass = 'w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-zinc-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'

export function OnboardingForm() {
  const [state, action, pending] = useActionState(onboardingAction, null)

  return (
    <form action={action} className="space-y-5">
      {state?.error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {state.error}
        </div>
      )}

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
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
      >
        {pending ? 'Saving…' : 'Get started'}
      </button>
    </form>
  )
}
