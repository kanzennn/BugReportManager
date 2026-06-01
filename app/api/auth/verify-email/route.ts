import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) {
    return NextResponse.redirect(new URL('/dashboard?flash=verify-invalid', req.url))
  }

  const user = await prisma.user.findUnique({
    where: { emailVerifyToken: token },
    select: { id: true, emailVerifyTokenExpiresAt: true, emailVerified: true },
  })

  if (!user) {
    return NextResponse.redirect(new URL('/dashboard?flash=verify-invalid', req.url))
  }

  if (user.emailVerified) {
    return NextResponse.redirect(new URL('/dashboard?flash=email-verified', req.url))
  }

  if (!user.emailVerifyTokenExpiresAt || user.emailVerifyTokenExpiresAt < new Date()) {
    return NextResponse.redirect(new URL('/dashboard?flash=verify-expired', req.url))
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      emailVerifyToken: null,
      emailVerifyTokenExpiresAt: null,
    },
  })

  return NextResponse.redirect(new URL('/dashboard?flash=email-verified', req.url))
}
