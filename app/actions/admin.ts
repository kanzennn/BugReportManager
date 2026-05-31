'use server'

import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Plan } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { cacheDel } from '@/lib/cache'

export async function updateUserRoleAction(
  targetUserId: string,
  data: { plan?: Plan; isAdmin?: boolean },
) {
  const { userId } = await requireAuth()

  const admin = await prisma.user.findUnique({ where: { id: userId }, select: { isAdmin: true } })
  if (!admin?.isAdmin) throw new Error('Forbidden')

  // Prevent admin from removing their own admin status
  if (data.isAdmin === false && targetUserId === userId) {
    throw new Error('Cannot remove your own admin status')
  }

  await prisma.user.update({
    where: { id: targetUserId },
    data,
  })

  revalidatePath('/admin/users')
}

export async function banUserAction(targetUserId: string, ban: boolean) {
  const { userId } = await requireAuth()

  const admin = await prisma.user.findUnique({ where: { id: userId }, select: { isAdmin: true } })
  if (!admin?.isAdmin) throw new Error('Forbidden')

  if (targetUserId === userId) throw new Error('Cannot ban yourself')

  await prisma.user.update({
    where: { id: targetUserId },
    data: { bannedAt: ban ? new Date() : null },
  })

  await cacheDel(`user:${targetUserId}:banned`)
  revalidatePath(`/admin/users/${targetUserId}`)
}
