'use client'

import { useTransition, useState } from 'react'
import { pushBugToTrelloAction } from '@/app/actions/trello'
import { ExternalLink } from 'lucide-react'

interface TrelloButtonProps {
  bugId: string
  trelloCardUrl: string | null
}

export function TrelloButton({ bugId, trelloCardUrl: initialUrl }: TrelloButtonProps) {
  const [pending, startTransition] = useTransition()
  const [cardUrl, setCardUrl] = useState(initialUrl)
  const [error, setError] = useState<string | null>(null)

  function handlePush() {
    setError(null)
    startTransition(async () => {
      try {
        const result = await pushBugToTrelloAction(bugId)
        setCardUrl(result.url)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to push to Trello.')
      }
    })
  }

  return (
    <div className="flex items-center gap-3">
      {cardUrl ? (
        <>
          <a
            href={cardUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg bg-[#0052CC]/20 border border-[#0052CC]/40 px-4 py-2 text-sm font-medium text-blue-400 transition-colors hover:bg-[#0052CC]/30"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View on Trello
          </a>
          <button
            onClick={handlePush}
            disabled={pending}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-50"
          >
            {pending ? 'Pushing…' : 'Re-push'}
          </button>
        </>
      ) : (
        <button
          onClick={handlePush}
          disabled={pending}
          className="flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-[#0052CC]/60 hover:text-blue-400 disabled:opacity-50"
        >
          <div className="flex h-4 w-4 items-center justify-center rounded bg-[#0052CC]">
            <svg viewBox="0 0 24 24" className="h-2.5 w-2.5 fill-white">
              <rect x="2.5" y="2.5" width="8.5" height="14" rx="1.5" />
              <rect x="13" y="2.5" width="8.5" height="9" rx="1.5" />
            </svg>
          </div>
          {pending ? 'Pushing…' : 'Push to Trello'}
        </button>
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
