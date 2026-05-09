import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { randomBytes } from 'crypto'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateApiKey(): string {
  return 'brm_' + randomBytes(24).toString('hex')
}

export function formatDate(date: Date | string, locale = 'en') {
  const l = locale === 'id' ? 'id-ID' : 'en-US'
  return new Date(date).toLocaleDateString(l, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(date: Date | string, locale = 'en') {
  const l = locale === 'id' ? 'id-ID' : 'en-US'
  return new Date(date).toLocaleString(l, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function relativeTime(date: Date | string, locale = 'en') {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (locale === 'id') {
    if (mins < 1) return 'baru saja'
    if (mins < 60) return `${mins} mnt lalu`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs} jam lalu`
    const days = Math.floor(hrs / 24)
    if (days < 30) return `${days} hari lalu`
    return formatDate(date, locale)
  }
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return formatDate(date, locale)
}
