import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/db'
import type Stripe from 'stripe'
import { Plan, SubscriptionStatus } from '@prisma/client'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const checkoutSession = event.data.object as Stripe.Checkout.Session
      const userId = checkoutSession.metadata?.userId
      const plan = checkoutSession.metadata?.plan as Plan | undefined
      if (!userId || !plan) break

      const subscriptionId = typeof checkoutSession.subscription === 'string'
        ? checkoutSession.subscription
        : checkoutSession.subscription?.id

      await prisma.user.update({
        where: { id: userId },
        data: {
          plan,
          subscriptionStatus: SubscriptionStatus.ACTIVE,
          stripeSubscriptionId: subscriptionId,
        },
      })

      await prisma.transaction.create({
        data: {
          userId,
          amount: (checkoutSession.amount_total ?? 0),
          currency: checkoutSession.currency ?? 'usd',
          status: 'SUCCEEDED',
          stripePaymentId: checkoutSession.payment_intent as string | null,
          plan,
        },
      })
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const user = await prisma.user.findFirst({ where: { stripeSubscriptionId: sub.id } })
      if (!user) break

      const statusMap: Record<string, SubscriptionStatus> = {
        active: SubscriptionStatus.ACTIVE,
        canceled: SubscriptionStatus.CANCELLED,
        past_due: SubscriptionStatus.PAST_DUE,
        trialing: SubscriptionStatus.TRIALING,
      }
      await prisma.user.update({
        where: { id: user.id },
        data: { subscriptionStatus: statusMap[sub.status] ?? SubscriptionStatus.INACTIVE },
      })
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const user = await prisma.user.findFirst({ where: { stripeSubscriptionId: sub.id } })
      if (!user) break

      await prisma.user.update({
        where: { id: user.id },
        data: {
          plan: Plan.FREE,
          subscriptionStatus: SubscriptionStatus.CANCELLED,
          stripeSubscriptionId: null,
        },
      })
      break
    }
  }

  return NextResponse.json({ received: true })
}
