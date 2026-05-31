'use server'

import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const onboardingSchema = z.object({
  terms: z.literal('on', { errorMap: () => ({ message: 'You must accept the Terms and Conditions.' }) }),
  heardFrom: z.enum(['search', 'social', 'friend', 'youtube', 'github', 'other'], {
    errorMap: () => ({ message: 'Please select how you heard about us.' }),
  }),
  userType: z.enum(['student', 'developer', 'freelancer', 'company', 'other'], {
    errorMap: () => ({ message: 'Please select your role.' }),
  }),
})

type OnboardingState = { error: string } | null

export async function onboardingAction(_: OnboardingState, formData: FormData): Promise<OnboardingState> {
  const { userId } = await requireAuth()

  const parsed = onboardingSchema.safeParse({
    terms: formData.get('terms'),
    heardFrom: formData.get('heardFrom'),
    userType: formData.get('userType'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  await prisma.user.update({
    where: { id: userId },
    data: {
      agreedToTermsAt: new Date(),
      heardFrom: parsed.data.heardFrom,
      userType: parsed.data.userType,
    },
  })

  redirect('/dashboard')
}
