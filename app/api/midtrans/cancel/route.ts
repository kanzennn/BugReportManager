import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Plan, SubscriptionStatus } from '@prisma/client'

export async function POST() {
  const { userId } = await requireAuth()

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  if (!user.midtransSubscriptionId) {
    return NextResponse.json({ error: 'No active subscription' }, { status: 400 })
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      plan: Plan.FREE,
      subscriptionStatus: SubscriptionStatus.CANCELLED,
      midtransSubscriptionId: null,
    },
  })

  return NextResponse.json({ success: true })
}
