'use server'

import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { cacheDel } from '@/lib/cache'

export async function completeTourAction() {
  const { userId } = await requireAuth()
  await prisma.user.update({
    where: { id: userId },
    data: { tourCompletedAt: new Date() },
  })
  await cacheDel(`user:${userId}:profile`)
}
