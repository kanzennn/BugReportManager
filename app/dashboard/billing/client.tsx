'use client'

import { useState } from 'react'
import { Check, CreditCard, Zap } from 'lucide-react'

const PLANS = [
  {
    key: 'FREE',
    name: 'Free',
    price: 0,
    features: ['Up to 3 applications', 'Unlimited bug reports', 'Unlimited feedback', 'API key authentication'],
    cta: null,
  },
  {
    key: 'PRO',
    name: 'Pro',
    price: 2,
    features: ['Unlimited applications', 'Unlimited bug reports', 'Unlimited feedback', 'Advanced dashboard'],
    cta: 'Upgrade to Pro',
  },
  {
    key: 'BUSINESS',
    name: 'Business',
    price: 10,
    features: ['Everything in Pro', 'Team member invitations', 'Role-based access control', 'Priority support'],
    cta: 'Upgrade to Business',
  },
]

interface BillingClientProps {
  currentPlan: string
  subscriptionStatus: string
  hasStripeAccount: boolean
  whatsappNumber: string
}

export function BillingClient({ currentPlan, subscriptionStatus, hasStripeAccount, whatsappNumber }: BillingClientProps) {
  const [loading, setLoading] = useState<string | null>(null)

  async function handleUpgrade(planKey: string) {
    setLoading(planKey)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey }),
      })
      const data = await res.json() as { url?: string; error?: string }
      if (data.url) window.location.href = data.url
    } finally {
      setLoading(null)
    }
  }

  async function handleManage() {
    setLoading('portal')
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json() as { url?: string }
      if (data.url) window.location.href = data.url
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Billing & Plans</h1>
        <p className="mt-1 text-sm text-zinc-400">Manage your subscription and usage limits.</p>
      </div>

      {/* Current plan banner */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-indigo-600/20 flex items-center justify-center">
            <Zap className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <p className="font-semibold text-zinc-100">
              Current plan: <span className="text-indigo-400">{currentPlan}</span>
            </p>
            {subscriptionStatus !== 'INACTIVE' && (
              <p className="text-sm text-zinc-400 capitalize">Status: {subscriptionStatus.toLowerCase()}</p>
            )}
          </div>
        </div>
        {hasStripeAccount && currentPlan !== 'FREE' && (
          <button
            onClick={handleManage}
            disabled={loading === 'portal'}
            className="flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:text-zinc-100 disabled:opacity-50"
          >
            <CreditCard className="h-4 w-4" />
            {loading === 'portal' ? 'Loading…' : 'Manage billing'}
          </button>
        )}
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.key
          const isHigher = (plan.key === 'PRO' && currentPlan === 'FREE') ||
            (plan.key === 'BUSINESS' && (currentPlan === 'FREE' || currentPlan === 'PRO'))

          return (
            <div
              key={plan.key}
              className={`rounded-xl border p-6 flex flex-col ${
                isCurrent
                  ? 'border-indigo-500/50 bg-indigo-600/10'
                  : 'border-zinc-800 bg-zinc-900/50'
              }`}
            >
              <div className="mb-5">
                <p className="text-sm font-medium text-zinc-400">{plan.name}</p>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-zinc-100">${plan.price}</span>
                  <span className="text-zinc-500 text-sm">/month</span>
                </div>
              </div>
              <ul className="space-y-2.5 flex-1 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-zinc-300">
                    <Check className="h-4 w-4 text-indigo-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              {isCurrent ? (
                <div className="rounded-lg border border-indigo-500/30 px-4 py-2.5 text-center text-sm font-medium text-indigo-400">
                  Current plan
                </div>
              ) : isHigher && plan.cta ? (
                <button
                  onClick={() => handleUpgrade(plan.key)}
                  disabled={loading === plan.key}
                  className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
                >
                  {loading === plan.key ? 'Redirecting…' : plan.cta}
                </button>
              ) : (
                <div className="rounded-lg border border-zinc-700/50 px-4 py-2.5 text-center text-sm font-medium text-zinc-600">
                  {plan.price === 0 ? 'Downgrade' : 'Lower plan'}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Enterprise */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-zinc-100">Need something bigger?</p>
          <p className="text-sm text-zinc-400 mt-1">Custom limits, SSO, or dedicated support — let&#39;s talk.</p>
        </div>
        <a
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-500"
        >
          Talk to us
        </a>
      </div>
    </div>
  )
}
