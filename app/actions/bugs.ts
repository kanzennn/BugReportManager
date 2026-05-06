'use server'

import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { getAppRole, canEdit } from '@/lib/access'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { BugStatus } from '@prisma/client'

export async function updateBugStatusAction(bugId: string, status: BugStatus) {
  const { userId } = await requireAuth()

  const bug = await prisma.bugReport.findFirst({
    where: { id: bugId },
    select: { id: true, applicationId: true },
  })
  if (!bug) return

  const role = await getAppRole(userId, bug.applicationId)
  if (!role || !canEdit(role)) return

  await prisma.bugReport.update({ where: { id: bugId }, data: { status } })
  revalidatePath('/dashboard/bugs')
  revalidatePath(`/dashboard/bugs/${bugId}`)
  revalidatePath(`/dashboard/applications/${bug.applicationId}`)
}

export async function deleteBugAction(bugId: string, redirectTo = '/dashboard/bugs') {
  const { userId } = await requireAuth()

  const bug = await prisma.bugReport.findFirst({
    where: { id: bugId },
    select: { applicationId: true },
  })
  if (!bug) redirect(redirectTo)

  const role = await getAppRole(userId, bug.applicationId)
  if (!role || !canEdit(role)) redirect(redirectTo)

  await prisma.bugReport.delete({ where: { id: bugId } })
  revalidatePath('/dashboard/bugs')
  redirect(redirectTo.includes('?') ? `${redirectTo}&flash=bug-deleted` : `${redirectTo}?flash=bug-deleted`)
}
