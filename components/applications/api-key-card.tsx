'use client'

import { useState } from 'react'
import { Copy, Check, RefreshCw, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { regenerateApiKeyAction } from '@/app/actions/applications'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

export function ApiKeyCard({ appId, apiKey }: { appId: string; apiKey: string }) {
  const [copied, setCopied] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [visible, setVisible] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(apiKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleRegenerate() {
    setShowConfirm(false)
    setRegenerating(true)
    try {
      await regenerateApiKeyAction(appId)
      toast.success('API key regenerated')
    } catch {
      toast.error('Failed to regenerate API key')
    } finally {
      setRegenerating(false)
    }
  }

  return (
    <>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-100">API Key</h3>
          <button
            onClick={() => setShowConfirm(true)}
            disabled={regenerating}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${regenerating ? 'animate-spin' : ''}`} />
            Regenerate
          </button>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3">
          <code className="flex-1 truncate font-mono text-sm text-zinc-300">
            {visible ? apiKey : `${apiKey.slice(0, 7)}${'•'.repeat(20)}${apiKey.slice(-4)}`}
          </code>
          <button
            onClick={() => setVisible((v) => !v)}
            className="shrink-0 rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-700 hover:text-zinc-100"
            title={visible ? 'Hide API key' : 'Show API key'}
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          <button
            onClick={handleCopy}
            className="shrink-0 rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-700 hover:text-zinc-100"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
        <p className="mt-2 text-xs text-zinc-500">
          Send this key in the <code className="font-mono text-zinc-400">x-api-key</code> header when reporting bugs.
        </p>
      </div>

      <ConfirmDialog
        open={showConfirm}
        title="Regenerate API key?"
        message="The current key will stop working immediately. All integrations using it will break until updated."
        confirmLabel="Regenerate"
        onConfirm={handleRegenerate}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  )
}
