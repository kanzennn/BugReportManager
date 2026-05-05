'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import Link from 'next/link'

const STATUS_OPTIONS = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const
const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const

interface App {
  id: string
  name: string
}

function statusLabel(s: string) {
  return s === 'IN_PROGRESS' ? 'In Progress' : s.charAt(0) + s.slice(1).toLowerCase()
}

export function BugFilters({ apps }: { apps: App[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()

  const currentStatus = sp.get('status') ?? undefined
  const currentPriority = sp.get('priority') ?? undefined
  const currentAppId = sp.get('appId') ?? undefined
  const currentQ = sp.get('q') ?? undefined

  function buildUrl(overrides: Record<string, string | undefined>) {
    const merged = { status: currentStatus, priority: currentPriority, appId: currentAppId, q: currentQ, ...overrides }
    const query = Object.entries(merged)
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
      .join('&')
    return `${pathname}${query ? '?' + query : ''}`
  }

  return (
    <div className="flex flex-wrap gap-3">
      {/* Search */}
      <form method="get" action="/dashboard/bugs" className="flex-1 min-w-48">
        <input
          name="q"
          defaultValue={currentQ}
          placeholder="Search bugs…"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
        />
      </form>

      {/* Status tabs */}
      <div className="flex gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 p-1">
        <Link
          href={buildUrl({ status: undefined })}
          className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${!currentStatus ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-400 hover:text-zinc-100'}`}
        >
          All
        </Link>
        {STATUS_OPTIONS.map((s) => (
          <Link
            key={s}
            href={buildUrl({ status: s })}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${currentStatus === s ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-400 hover:text-zinc-100'}`}
          >
            {statusLabel(s)}
          </Link>
        ))}
      </div>

      {/* Priority */}
      <select
        value={currentPriority ?? ''}
        onChange={(e) => router.push(buildUrl({ priority: e.target.value || undefined }))}
        className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-300 focus:border-indigo-500 focus:outline-none"
      >
        <option value="">All Priorities</option>
        {PRIORITY_OPTIONS.map((p) => (
          <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>
        ))}
      </select>

      {/* App */}
      {apps.length > 1 && (
        <select
          value={currentAppId ?? ''}
          onChange={(e) => router.push(buildUrl({ appId: e.target.value || undefined }))}
          className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-300 focus:border-indigo-500 focus:outline-none"
        >
          <option value="">All Apps</option>
          {apps.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      )}
    </div>
  )
}
