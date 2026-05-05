'use server'

import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { BugStatus } from '@prisma/client'

export async function updateBugStatusAction(bugId: string, status: BugStatus) {
  const session = await requireAuth()

  const bug = await prisma.bugReport.findFirst({
    where: { id: bugId, application: { userId: session.userId } },
  })
  if (!bug) return

  await prisma.bugReport.update({ where: { id: bugId }, data: { status } })
  revalidatePath('/dashboard/bugs')
  revalidatePath(`/dashboard/bugs/${bugId}`)
  revalidatePath(`/dashboard/applications/${bug.applicationId}`)
}

export async function deleteBugAction(bugId: string, redirectTo = '/dashboard/bugs') {
  const session = await requireAuth()

  await prisma.bugReport.deleteMany({
    where: { id: bugId, application: { userId: session.userId } },
  })

  revalidatePath('/dashboard/bugs')
  redirect(redirectTo)
}
