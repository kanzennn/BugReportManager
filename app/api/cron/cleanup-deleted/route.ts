import { prisma } from '@/lib/db'
import { deleteFromS3 } from '@/lib/s3'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago

  const usersToDelete = await prisma.user.findMany({
    where: { deletedAt: { lt: cutoff } },
    select: { id: true, avatarUrl: true },
  })

  let deleted = 0
  for (const user of usersToDelete) {
    if (user.avatarUrl) {
      const match = user.avatarUrl.match(/avatars\/[^/?]+/)
      if (match) {
        try { await deleteFromS3(match[0]) } catch { /* ignore */ }
      }
    }
    await prisma.user.delete({ where: { id: user.id } })
    deleted++
  }

  return NextResponse.json({ deleted, message: `Cleaned up ${deleted} expired accounts.` })
}
