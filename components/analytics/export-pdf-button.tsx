'use client'

import { Download } from 'lucide-react'

export function ExportPdfButton({ printUrl }: { printUrl: string }) {
  return (
    <button
      type="button"
      onClick={() => window.open(printUrl, '_blank')}
      className="print:hidden flex items-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:text-zinc-100"
    >
      <Download className="h-3.5 w-3.5" />
      Export PDF
    </button>
  )
}
