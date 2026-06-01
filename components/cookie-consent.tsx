'use client'

import { useState, useEffect } from 'react'

const CONSENT_KEY = 'brm_cookie_consent'

export type ConsentValue = 'accepted' | 'rejected' | null

export function useCookieConsent(): ConsentValue {
  const [consent, setConsent] = useState<ConsentValue>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_KEY)
      if (stored === 'accepted' || stored === 'rejected') {
        setConsent(stored)
      }
    } catch {
      // localStorage unavailable (SSR or blocked)
    }
  }, [])

  return consent
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_KEY)
      if (!stored) setVisible(true)
    } catch {
      // localStorage unavailable
    }
  }, [])

  function accept() {
    try { localStorage.setItem(CONSENT_KEY, 'accepted') } catch { /* ignore */ }
    setVisible(false)
    // Reload to activate analytics
    window.location.reload()
  }

  function reject() {
    try { localStorage.setItem(CONSENT_KEY, 'rejected') } catch { /* ignore */ }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-lg rounded-xl border border-zinc-700 bg-zinc-900 p-4 shadow-2xl sm:left-auto sm:right-6 sm:max-w-sm"
    >
      <p className="text-sm text-zinc-300 leading-relaxed">
        Kami menggunakan analytics untuk meningkatkan layanan. Data tidak dibagikan ke pihak ketiga.
      </p>
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={accept}
          className="flex-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
        >
          Terima
        </button>
        <button
          type="button"
          onClick={reject}
          className="flex-1 rounded-lg border border-zinc-600 px-3 py-1.5 text-sm font-medium text-zinc-300 hover:border-zinc-500 hover:text-zinc-100 transition-colors"
        >
          Tolak
        </button>
      </div>
    </div>
  )
}
