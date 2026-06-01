import { createHash, timingSafeEqual } from 'crypto'

const SNAP_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://app.midtrans.com'
    : 'https://app.sandbox.midtrans.com'

function authHeader() {
  const token = Buffer.from(`${process.env.MIDTRANS_SERVER_KEY!}:`).toString('base64')
  return `Basic ${token}`
}

export type MidtransSnapTransaction = {
  token: string
  redirect_url: string
}

export async function createSnapTransaction(params: {
  orderId: string
  itemId: string
  amount: number
  customerEmail: string
  customerName: string
  itemName: string
  finishUrl: string
  errorUrl: string
}): Promise<MidtransSnapTransaction> {
  const res = await fetch(`${SNAP_BASE_URL}/snap/v1/transactions`, {
    method: 'POST',
    headers: {
      Authorization: authHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      transaction_details: {
        order_id: params.orderId,
        gross_amount: params.amount,
      },
      customer_details: {
        first_name: params.customerName,
        email: params.customerEmail,
      },
      item_details: [
        {
          id: params.itemId,
          price: params.amount,
          quantity: 1,
          name: params.itemName,
        },
      ],
      callbacks: {
        finish: params.finishUrl,
        error: params.errorUrl,
      },
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Midtrans Snap failed (${res.status}): ${err}`)
  }
  return res.json() as Promise<MidtransSnapTransaction>
}

export function verifyWebhookSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  signatureKey: string,
): boolean {
  const expected = createHash('sha512')
    .update(`${orderId}${statusCode}${grossAmount}${process.env.MIDTRANS_SERVER_KEY!}`)
    .digest('hex')
  const a = Buffer.from(expected)
  const b = Buffer.from(signatureKey)
  return a.length === b.length && timingSafeEqual(a, b)
}

export const PLANS = {
  PRO: { name: 'Pro', price: 30000 },
  BUSINESS: { name: 'Business', price: 150000 },
} as const

export const PLAN_LIMITS = {
  FREE: { maxApps: 3, teamMembers: false },
  PRO: { maxApps: Infinity, teamMembers: false },
  BUSINESS: { maxApps: Infinity, teamMembers: true },
} as const
