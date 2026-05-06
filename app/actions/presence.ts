'use server'

import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function updatePresenceAction(): Promise<void> {
  const session = await getSession()
  if (!session) return
  await prisma.user.update({
    where: { id: session.userId },
    data: { lastSeenAt: new Date() },
  })
}
