'use client'

import { useActionState, useTransition } from 'react'
import { resendVerificationAction } from '@/app/actions/auth'
import { MailCheck, X } from 'lucide-react'
import { useState } from 'react'

export function EmailVerificationBanner() {
  const [dismissed, setDismissed] = useState(false)
  const [state, formAction] = useActionState(resendVerificationAction, null)
  const [isPending, startTransition] = useTransition()

  if (dismissed) return null
  if (state && 'sent' in state) {
    return (
      <div className="flex items-center gap-3 bg-green-900/40 border-b border-green-700/50 px-4 py-3 text-sm text-green-300">
        <MailCheck className="h-4 w-4 shrink-0" />
        <span>Verification email sent! Check your inbox.</span>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="ml-auto text-green-400 hover:text-green-200"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-amber-900/40 border-b border-amber-700/50 px-4 py-3 text-sm text-amber-300">
      <MailCheck className="h-4 w-4 shrink-0 mt-0.5 sm:mt-0" />
      <span className="flex-1">
        Please verify your email address to unlock all features.
        {state && 'error' in state && (
          <span className="ml-2 text-red-400">{state.error}</span>
        )}
      </span>
      <form
        action={(formData) => startTransition(() => formAction(formData))}
        className="shrink-0"
      >
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-amber-600 px-3 py-1 text-xs font-medium text-white hover:bg-amber-500 disabled:opacity-50"
        >
          {isPending ? 'Sending…' : 'Resend verification email'}
        </button>
      </form>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="ml-1 text-amber-400 hover:text-amber-200"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
