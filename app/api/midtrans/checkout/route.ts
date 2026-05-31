import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createSnapTransaction, PLANS } from '@/lib/midtrans'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rl = rateLimit(`checkout:${session.userId}`, 10, 60 * 60_000)
  if (!rl.allowed) return rateLimitResponse(rl.retryAfter)

  const { plan } = await req.json() as { plan: 'PRO' | 'BUSINESS' }
  if (!PLANS[plan]) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  // Midtrans order_id limit: 50 chars
  // Format: brm_{16-char userId prefix}_{plan}_{timestamp}  → max 43 chars
  const orderId = `brm_${user.id.slice(0, 16)}_${plan}_${Date.now()}`

  const transaction = await createSnapTransaction({
    orderId,
    itemId: `brm-${plan.toLowerCase()}`,
    amount: PLANS[plan].price,
    customerEmail: user.email,
    customerName: user.name,
    itemName: `BugReport ${PLANS[plan].name} Plan`,
    finishUrl: `${baseUrl}/dashboard/billing?payment=success`,
    errorUrl: `${baseUrl}/dashboard/billing`,
  })

  return NextResponse.json({ url: transaction.redirect_url })
}
