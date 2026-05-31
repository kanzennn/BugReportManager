import { getRedis } from './redis'

const P = 'brm:'

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const r = getRedis()
    if (!r) return null
    const raw = await r.get(P + key)
    if (raw === null) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export async function cacheSet(key: string, value: unknown, ttl: number): Promise<void> {
  try {
    const r = getRedis()
    if (!r) return
    await r.set(P + key, JSON.stringify(value), 'EX', ttl)
  } catch {
    // never crash the app over cache
  }
}

export async function cacheDel(...keys: string[]): Promise<void> {
  try {
    const r = getRedis()
    if (!r) return
    await r.del(...keys.map((k) => P + k))
  } catch {}
}

/**
 * Try cache → on miss run fn, store result, return it.
 * If Redis is unavailable the fn always runs (transparent fallback).
 */
export async function withCache<T>(key: string, ttl: number, fn: () => Promise<T>): Promise<T> {
  const hit = await cacheGet<T>(key)
  if (hit !== null) return hit
  const value = await fn()
  await cacheSet(key, value, ttl)
  return value
}
