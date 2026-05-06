'use client'

import { useEffect, useRef } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { toast } from 'sonner'

const MESSAGES: Record<string, string> = {
  'logged-in':        'Welcome back!',
  'registered':       'Account created! Welcome aboard.',
  'logged-out':       'Signed out.',
  'app-created':      'Application created.',
  'app-updated':      'Application updated.',
  'app-deleted':      'Application deleted.',
  'bug-deleted':      'Bug report deleted.',
  'feedback-deleted': 'Feedback deleted.',
}

export function FlashToast() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const didRun = useRef(false)

  useEffect(() => {
    if (didRun.current) return
    const flash = searchParams.get('flash')
    if (!flash || !MESSAGES[flash]) return
    didRun.current = true
    toast.success(MESSAGES[flash])
    const params = new URLSearchParams(searchParams.toString())
    params.delete('flash')
    const query = params.toString()
    router.replace(pathname + (query ? `?${query}` : ''), { scroll: false })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}
