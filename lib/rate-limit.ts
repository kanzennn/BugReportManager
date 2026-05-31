import { NextResponse } from 'next/server'

// Sliding window in-memory store: key → array of hit timestamps
const store = new Map<string, number[]>()

let lastCleanup = Date.now()
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000

function runCleanup(windowMs: number) {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return
  lastCleanup = now
  const cutoff = now - windowMs
  for (const [key, hits] of store) {
    const alive = hits.filter((t) => t > cutoff)
    if (alive.length === 0) store.delete(key)
    else store.set(key, alive)
  }
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; retryAfter: number } {
  const now = Date.now()
  const windowStart = now - windowMs

  runCleanup(windowMs)

  const hits = (store.get(key) ?? []).filter((t) => t > windowStart)

  if (hits.length >= limit) {
    const retryAfter = Math.ceil((hits[0] + windowMs - now) / 1000)
    return { allowed: false, retryAfter }
  }

  hits.push(now)
  store.set(key, hits)
  return { allowed: true, retryAfter: 0 }
}

export function getIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    '127.0.0.1'
  )
}

export function rateLimitResponse(retryAfter: number, extraHeaders?: Record<string, string>) {
  return NextResponse.json(
    { error: 'Too many requests. Please slow down.' },
    {
      status: 429,
      headers: { 'Retry-After': String(retryAfter), ...extraHeaders },
    },
  )
}
