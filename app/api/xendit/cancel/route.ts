import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { stopRecurringPayment } from '@/lib/xendit'
import { Plan, SubscriptionStatus } from '@prisma/client'

export async function POST() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  if (!user.xenditSubscriptionId) {
    return NextResponse.json({ error: 'No active subscription' }, { status: 400 })
  }

  await stopRecurringPayment(user.xenditSubscriptionId)

  await prisma.user.update({
    where: { id: user.id },
    data: {
      plan: Plan.FREE,
      subscriptionStatus: SubscriptionStatus.CANCELLED,
      xenditSubscriptionId: null,
    },
  })

  return NextResponse.json({ success: true })
}
