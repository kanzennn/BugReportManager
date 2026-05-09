import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createRecurringPayment, PLANS } from '@/lib/xendit'
import { Plan, SubscriptionStatus } from '@prisma/client'

type InvoicePaidPayload = {
  id: string
  external_id: string
  status: string
  amount: number
  currency: string
  payer_email: string
}

type RecurringChargedPayload = {
  id: string
  external_id: string
  status: string
  amount: number
  currency: string
  invoice_id: string
}

export async function POST(req: NextRequest) {
  const callbackToken = req.headers.get('x-callback-token')
  if (callbackToken !== process.env.XENDIT_WEBHOOK_TOKEN) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
  }

  const body = await req.json() as Record<string, unknown>
  const event = body.event as string | undefined

  // invoice.paid — fired when user pays the initial checkout invoice
  if (!event || body.status === 'PAID') {
    const payload = body as unknown as InvoicePaidPayload
    const externalId = payload.external_id ?? ''

    // external_id format: brm_{userId}_{PLAN}_{timestamp}
    const parts = externalId.split('_')
    if (parts[0] !== 'brm' || parts.length < 4) {
      return NextResponse.json({ received: true })
    }

    const userId = parts[1]
    const plan = parts[2] as Plan

    if (!userId || !(plan in Plan)) return NextResponse.json({ received: true })

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return NextResponse.json({ received: true })

    await prisma.user.update({
      where: { id: userId },
      data: { plan, subscriptionStatus: SubscriptionStatus.ACTIVE },
    })

    await prisma.transaction.create({
      data: {
        userId,
        amount: payload.amount,
        currency: (payload.currency ?? 'IDR').toLowerCase(),
        status: 'SUCCEEDED',
        paymentId: payload.id,
        plan,
      },
    })

    // Schedule the recurring payment to start one month from now
    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)

    const recurring = await createRecurringPayment({
      externalId: `brm_r_${userId}`,
      payerEmail: user.email,
      description: `BRM ${PLANS[plan as keyof typeof PLANS]?.name ?? plan} Plan - Monthly`,
      amount: PLANS[plan as keyof typeof PLANS]?.price ?? payload.amount,
      startDate: nextMonth.toISOString(),
    })

    await prisma.user.update({
      where: { id: userId },
      data: { xenditSubscriptionId: recurring.id },
    })

    return NextResponse.json({ received: true })
  }

  // recurring_payment.charged — monthly auto-renewal succeeded
  if (event === 'recurring_payment.charged') {
    const payload = body as unknown as RecurringChargedPayload
    const externalId = payload.external_id ?? ''

    // external_id format: brm_r_{userId}
    const parts = externalId.split('_')
    if (parts[0] !== 'brm' || parts[1] !== 'r') return NextResponse.json({ received: true })

    const userId = parts[2]
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return NextResponse.json({ received: true })

    await prisma.user.update({
      where: { id: userId },
      data: { subscriptionStatus: SubscriptionStatus.ACTIVE },
    })

    await prisma.transaction.create({
      data: {
        userId,
        amount: payload.amount,
        currency: (payload.currency ?? 'IDR').toLowerCase(),
        status: 'SUCCEEDED',
        paymentId: payload.invoice_id,
        plan: user.plan,
      },
    })

    return NextResponse.json({ received: true })
  }

  // recurring_payment.stopped — user cancelled or payment stopped
  if (event === 'recurring_payment.stopped') {
    const payload = body as unknown as RecurringChargedPayload
    const externalId = payload.external_id ?? ''

    const parts = externalId.split('_')
    if (parts[0] !== 'brm' || parts[1] !== 'r') return NextResponse.json({ received: true })

    const userId = parts[2]
    await prisma.user.updateMany({
      where: { id: userId },
      data: {
        plan: Plan.FREE,
        subscriptionStatus: SubscriptionStatus.CANCELLED,
        xenditSubscriptionId: null,
      },
    })

    return NextResponse.json({ received: true })
  }

  // recurring_payment.missed
  if (event === 'recurring_payment.missed') {
    const payload = body as unknown as RecurringChargedPayload
    const externalId = payload.external_id ?? ''

    const parts = externalId.split('_')
    if (parts[0] !== 'brm' || parts[1] !== 'r') return NextResponse.json({ received: true })

    const userId = parts[2]
    await prisma.user.updateMany({
      where: { id: userId },
      data: { subscriptionStatus: SubscriptionStatus.PAST_DUE },
    })

    return NextResponse.json({ received: true })
  }

  return NextResponse.json({ received: true })
}
