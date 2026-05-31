import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyWebhookSignature } from '@/lib/midtrans'
import { Plan, SubscriptionStatus } from '@prisma/client'

type MidtransNotification = {
  transaction_id: string
  order_id: string
  transaction_status: string
  fraud_status?: string
  status_code: string
  gross_amount: string
  signature_key: string
  currency: string
}

export async function POST(req: NextRequest) {
  const body = await req.json() as MidtransNotification

  const isValid = verifyWebhookSignature(
    body.order_id,
    body.status_code,
    body.gross_amount,
    body.signature_key,
  )
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // order_id format: brm_{16-char userId prefix}_{PLAN}_{timestamp}
  const parts = body.order_id.split('_')
  if (parts[0] !== 'brm' || parts.length < 4) {
    return NextResponse.json({ received: true })
  }

  const userIdPrefix = parts[1]
  const plan = parts[2] as Plan

  if (!userIdPrefix || !(plan in Plan)) return NextResponse.json({ received: true })

  const user = await prisma.user.findFirst({ where: { id: { startsWith: userIdPrefix } } })
  if (!user) return NextResponse.json({ received: true })
  const userId = user.id

  const isSuccess =
    body.transaction_status === 'settlement' ||
    (body.transaction_status === 'capture' && body.fraud_status === 'accept')

  if (isSuccess) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        plan,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        midtransSubscriptionId: body.transaction_id,
      },
    })

    await prisma.transaction.create({
      data: {
        userId,
        amount: Math.round(parseFloat(body.gross_amount)),
        currency: (body.currency ?? 'IDR').toLowerCase(),
        status: 'SUCCEEDED',
        paymentId: body.transaction_id,
        plan,
      },
    })
  }

  return NextResponse.json({ received: true })
}
