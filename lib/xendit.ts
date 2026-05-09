const XENDIT_BASE_URL = 'https://api.xendit.co'

function authHeader() {
  const token = Buffer.from(`${process.env.XENDIT_SECRET_KEY!}:`).toString('base64')
  return `Basic ${token}`
}

async function xenditPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${XENDIT_BASE_URL}${path}`, {
    method: 'POST',
    headers: { Authorization: authHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Xendit ${path} failed (${res.status}): ${err}`)
  }
  return res.json() as Promise<T>
}

export type XenditInvoice = {
  id: string
  invoice_url: string
  external_id: string
  status: string
}

export type XenditRecurringPayment = {
  id: string
  status: string
  external_id: string
}

export async function createInvoice(params: {
  externalId: string
  amount: number
  payerEmail: string
  description: string
  successRedirectUrl: string
  failureRedirectUrl: string
}): Promise<XenditInvoice> {
  return xenditPost<XenditInvoice>('/v2/invoices', {
    external_id: params.externalId,
    amount: params.amount,
    payer_email: params.payerEmail,
    description: params.description,
    currency: 'IDR',
    success_redirect_url: params.successRedirectUrl,
    failure_redirect_url: params.failureRedirectUrl,
  })
}

export async function createRecurringPayment(params: {
  externalId: string
  payerEmail: string
  description: string
  amount: number
  startDate: string
}): Promise<XenditRecurringPayment> {
  return xenditPost<XenditRecurringPayment>('/recurring_payments', {
    external_id: params.externalId,
    payer_email: params.payerEmail,
    description: params.description,
    amount: params.amount,
    interval: 'MONTH',
    interval_count: 1,
    currency: 'IDR',
    should_send_email: true,
    missed_payment_action: 'IGNORE',
    invoice_duration: 86400,
    start_date: params.startDate,
  })
}

export async function stopRecurringPayment(id: string): Promise<void> {
  await fetch(`${XENDIT_BASE_URL}/recurring_payments/${id}/stop!`, {
    method: 'POST',
    headers: { Authorization: authHeader() },
  })
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
