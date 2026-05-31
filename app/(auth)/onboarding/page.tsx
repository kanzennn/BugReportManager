import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { Bug } from 'lucide-react'
import { OnboardingForm } from './onboarding-form'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Welcome' }

export default async function OnboardingPage() {
  const { userId } = await requireAuth()
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { agreedToTermsAt: true, name: true },
  })

  if (user?.agreedToTermsAt) redirect('/dashboard')

  const firstName = user?.name?.split(' ')[0] ?? 'there'

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600">
            <Bug className="h-6 w-6 text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-zinc-100">Welcome, {firstName}!</h1>
        <p className="mt-1 text-sm text-zinc-400">Just a couple of quick questions before you get started.</p>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
        <Suspense fallback={<div className="h-48 animate-pulse rounded-lg bg-zinc-800" />}>
          <OnboardingForm />
        </Suspense>
      </div>
    </div>
  )
}
