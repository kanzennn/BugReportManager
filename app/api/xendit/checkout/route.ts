import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createInvoice, PLANS } from '@/lib/xendit'
import { Plan } from '@prisma/client'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { plan } = await req.json() as { plan: 'PRO' | 'BUSINESS' }
  if (!PLANS[plan]) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  const externalId = `brm_${user.id}_${plan}_${Date.now()}`

  const invoice = await createInvoice({
    externalId,
    amount: PLANS[plan].price,
    payerEmail: user.email,
    description: `BRM ${PLANS[plan].name} Plan - Monthly`,
    successRedirectUrl: `${baseUrl}/dashboard/billing?payment=success`,
    failureRedirectUrl: `${baseUrl}/dashboard/billing`,
  })

  await prisma.user.update({
    where: { id: user.id },
    data: {
      xenditCustomerId: user.xenditCustomerId ?? user.email,
      plan: plan as Plan,
    },
  })

  return NextResponse.json({ url: invoice.invoice_url })
}
