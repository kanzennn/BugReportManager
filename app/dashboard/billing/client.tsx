'use client'

import { useState } from 'react'
import { Check, CreditCard, Zap, AlertTriangle } from 'lucide-react'
import { useLanguage } from '@/components/language-provider'

const PLAN_DEFS = [
  {
    key: 'FREE',
    name: 'Free',
    price: 0,
    priceDisplay: 'Rp 0',
    featureKeys: [
      'billing.feature.max3Apps',
      'billing.feature.unlimitedBugs',
      'billing.feature.unlimitedFeedback',
      'billing.feature.apiKey',
    ],
    upgradeKey: null as string | null,
  },
  {
    key: 'PRO',
    name: 'Pro',
    price: 30000,
    priceDisplay: 'Rp 30.000',
    featureKeys: [
      'billing.feature.unlimitedApps',
      'billing.feature.unlimitedBugs',
      'billing.feature.unlimitedFeedback',
      'billing.feature.advancedDashboard',
    ],
    upgradeKey: 'billing.upgradeProLabel',
  },
  {
    key: 'BUSINESS',
    name: 'Business',
    price: 150000,
    priceDisplay: 'Rp 150.000',
    featureKeys: [
      'billing.feature.everythingInPro',
      'billing.feature.teamInvitations',
      'billing.feature.rbac',
      'billing.feature.prioritySupport',
    ],
    upgradeKey: 'billing.upgradeBusinessLabel',
  },
]

interface BillingClientProps {
  currentPlan: string
  subscriptionStatus: string
  hasActiveSubscription: boolean
  whatsappNumber: string
}

export function BillingClient({ currentPlan, subscriptionStatus, hasActiveSubscription, whatsappNumber }: BillingClientProps) {
  const { t } = useLanguage()
  const [loading, setLoading] = useState<string | null>(null)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  async function handleUpgrade(planKey: string) {
    setLoading(planKey)
    try {
      const res = await fetch('/api/midtrans/checkout', {
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

  async function handleCancel() {
    setLoading('cancel')
    try {
      await fetch('/api/midtrans/cancel', { method: 'POST' })
      window.location.reload()
    } finally {
      setLoading(null)
      setShowCancelConfirm(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">{t('billing.title')}</h1>
        <p className="mt-1 text-sm text-zinc-400">{t('billing.description')}</p>
      </div>

      {/* Current plan banner */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-indigo-600/20 flex items-center justify-center">
            <Zap className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <p className="font-semibold text-zinc-100">
              {t('billing.currentPlan')} <span className="text-indigo-400">{currentPlan}</span>
            </p>
            {subscriptionStatus !== 'INACTIVE' && (
              <p className="text-sm text-zinc-400 capitalize">{t('billing.status')} {subscriptionStatus.toLowerCase()}</p>
            )}
          </div>
        </div>
        {hasActiveSubscription && currentPlan !== 'FREE' && (
          <div className="flex items-center gap-3">
            <CreditCard className="h-4 w-4 text-zinc-500" />
            {showCancelConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-400">{t('billing.cancelConfirm')}</span>
                <button
                  onClick={handleCancel}
                  disabled={loading === 'cancel'}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50"
                >
                  {loading === 'cancel' ? t('billing.cancelling') : t('billing.confirm')}
                </button>
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-100"
                >
                  {t('billing.keepPlan')}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-red-800 hover:text-red-400"
              >
                <AlertTriangle className="h-4 w-4" />
                {t('billing.cancel')}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {PLAN_DEFS.map((plan) => {
          const isCurrent = currentPlan === plan.key
          const isHigher = (plan.key === 'PRO' && currentPlan === 'FREE') ||
            (plan.key === 'BUSINESS' && (currentPlan === 'FREE' || currentPlan === 'PRO'))

          return (
            <div
              key={plan.key}
              className={`rounded-xl border p-6 flex flex-col ${
                isCurrent ? 'border-indigo-500/50 bg-indigo-600/10' : 'border-zinc-800 bg-zinc-900/50'
              }`}
            >
              <div className="mb-5">
                <p className="text-sm font-medium text-zinc-400">{plan.name}</p>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-zinc-100">{plan.priceDisplay}</span>
                  <span className="text-zinc-500 text-sm">{t('billing.perMonth')}</span>
                </div>
              </div>
              <ul className="space-y-2.5 flex-1 mb-6">
                {plan.featureKeys.map((k) => (
                  <li key={k} className="flex items-center gap-2 text-sm text-zinc-300">
                    <Check className="h-4 w-4 text-indigo-400 shrink-0" />
                    {t(k)}
                  </li>
                ))}
              </ul>
              {isCurrent ? (
                <div className="rounded-lg border border-indigo-500/30 px-4 py-2.5 text-center text-sm font-medium text-indigo-400">
                  {t('billing.currentPlanBadge')}
                </div>
              ) : isHigher && plan.upgradeKey ? (
                <button
                  onClick={() => handleUpgrade(plan.key)}
                  disabled={loading === plan.key}
                  className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
                >
                  {loading === plan.key ? t('billing.redirecting') : t(plan.upgradeKey)}
                </button>
              ) : (
                <div className="rounded-lg border border-zinc-700/50 px-4 py-2.5 text-center text-sm font-medium text-zinc-600">
                  {plan.price === 0 ? t('billing.downgrade') : t('billing.lowerPlan')}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Enterprise */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-zinc-100">{t('billing.enterprise.title')}</p>
          <p className="text-sm text-zinc-400 mt-1">{t('billing.enterprise.description')}</p>
        </div>
        <a
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-500"
        >
          {t('billing.enterprise.cta')}
        </a>
      </div>
    </div>
  )
}
