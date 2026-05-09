'use client'

import { useEffect, useState } from 'react'
import { Printer } from 'lucide-react'

export function PrintTrigger() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Scroll to bottom to force all Recharts SVGs to mount, then wait for paint
    window.scrollTo(0, document.body.scrollHeight)
    const t = setTimeout(() => {
      window.scrollTo(0, 0)
      setReady(true)
      window.print()
    }, 2000)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="print:hidden fixed bottom-5 right-5 z-50 flex items-center gap-2">
      {!ready && (
        <span className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-500 shadow-sm">
          Preparing document…
        </span>
      )}
      <button
        type="button"
        onClick={() => window.print()}
        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-indigo-500 transition-colors"
      >
        <Printer className="h-4 w-4" />
        Print / Save PDF
      </button>
    </div>
  )
}
