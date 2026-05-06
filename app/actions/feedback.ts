'use server'

import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { getAppRole, canEdit } from '@/lib/access'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { FeedbackStatus } from '@prisma/client'

export async function updateFeedbackStatusAction(feedbackId: string, status: FeedbackStatus) {
  const { userId } = await requireAuth()

  const feedback = await prisma.feedback.findFirst({
    where: { id: feedbackId },
    select: { id: true, applicationId: true },
  })
  if (!feedback) return

  const role = await getAppRole(userId, feedback.applicationId)
  if (!role || !canEdit(role)) return

  await prisma.feedback.update({ where: { id: feedbackId }, data: { status } })
  revalidatePath('/dashboard/feedback')
  revalidatePath(`/dashboard/feedback/${feedbackId}`)
  revalidatePath(`/dashboard/applications/${feedback.applicationId}`)
}

export async function deleteFeedbackAction(feedbackId: string, redirectTo = '/dashboard/feedback') {
  const { userId } = await requireAuth()

  const feedback = await prisma.feedback.findFirst({
    where: { id: feedbackId },
    select: { applicationId: true },
  })
  if (!feedback) redirect(redirectTo)

  const role = await getAppRole(userId, feedback.applicationId)
  if (!role || !canEdit(role)) redirect(redirectTo)

  await prisma.feedback.delete({ where: { id: feedbackId } })
  revalidatePath('/dashboard/feedback')
  redirect(redirectTo.includes('?') ? `${redirectTo}&flash=feedback-deleted` : `${redirectTo}?flash=feedback-deleted`)
}
