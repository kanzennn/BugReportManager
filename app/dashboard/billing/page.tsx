import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { BillingClient } from './client'

export default async function BillingPage() {
  const { userId } = await requireAuth()
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true, subscriptionStatus: true, stripeCustomerId: true },
  })

  return (
    <BillingClient
      currentPlan={user?.plan ?? 'FREE'}
      subscriptionStatus={user?.subscriptionStatus ?? 'INACTIVE'}
      hasStripeAccount={!!user?.stripeCustomerId}
      whatsappNumber={process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? 'YOUR_WHATSAPP_NUMBER'}
    />
  )
}
