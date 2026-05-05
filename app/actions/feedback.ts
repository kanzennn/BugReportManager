'use server'

import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { FeedbackStatus } from '@prisma/client'

export async function updateFeedbackStatusAction(feedbackId: string, status: FeedbackStatus) {
  const session = await requireAuth()

  const feedback = await prisma.feedback.findFirst({
    where: { id: feedbackId, application: { userId: session.userId } },
  })
  if (!feedback) return

  await prisma.feedback.update({ where: { id: feedbackId }, data: { status } })
  revalidatePath('/dashboard/feedback')
  revalidatePath(`/dashboard/feedback/${feedbackId}`)
  revalidatePath(`/dashboard/applications/${feedback.applicationId}`)
}

export async function deleteFeedbackAction(feedbackId: string, redirectTo = '/dashboard/feedback') {
  const session = await requireAuth()

  await prisma.feedback.deleteMany({
    where: { id: feedbackId, application: { userId: session.userId } },
  })

  revalidatePath('/dashboard/feedback')
  redirect(redirectTo)
}
