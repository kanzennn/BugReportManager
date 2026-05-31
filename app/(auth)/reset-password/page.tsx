import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Bug } from 'lucide-react'
import { ResetPasswordForm } from './reset-form'

export const metadata: Metadata = { title: 'Reset Password' }

export default function ResetPasswordPage() {
  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600">
            <Bug className="h-6 w-6 text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-zinc-100">Set new password</h1>
        <p className="mt-1 text-sm text-zinc-400">Choose a strong password for your account</p>
      </div>
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
        <Suspense fallback={<div className="h-32 animate-pulse rounded-lg bg-zinc-800" />}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}
