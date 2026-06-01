'use client'

import { useEffect, useState } from 'react'
import { Analytics } from '@vercel/analytics/next'

export function ConditionalAnalytics() {
  const [consent, setConsent] = useState<string | null>(null)

  useEffect(() => {
    try {
      setConsent(localStorage.getItem('brm_cookie_consent'))
    } catch {
      // localStorage unavailable
    }
  }, [])

  // Don't render Analytics until we've read consent (avoids flash)
  if (consent === null) return null

  if (consent === 'accepted') {
    return <Analytics />
  }

  return null
}
