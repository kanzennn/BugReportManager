import { prisma } from '@/lib/db'
import { deleteFromS3 } from '@/lib/s3'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) {
    return NextResponse.redirect(new URL('/dashboard?flash=delete-invalid', req.url))
  }

  const user = await prisma.user.findUnique({
    where: { deleteToken: token },
    select: { id: true, deleteTokenExpiresAt: true, avatarUrl: true },
  })

  if (!user) {
    return NextResponse.redirect(new URL('/dashboard?flash=delete-invalid', req.url))
  }

  if (!user.deleteTokenExpiresAt || user.deleteTokenExpiresAt < new Date()) {
    return NextResponse.redirect(new URL('/dashboard?flash=delete-expired', req.url))
  }

  // Remove avatar from S3 before deleting account
  if (user.avatarUrl) {
    const match = user.avatarUrl.match(/avatars\/[^/?]+/)
    if (match) {
      try { await deleteFromS3(match[0]) } catch { /* ignore */ }
    }
  }

  await prisma.user.delete({ where: { id: user.id } })

  return NextResponse.redirect(new URL('/register?flash=account-deleted', req.url))
}
