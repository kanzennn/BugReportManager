'use client'

import { useEffect } from 'react'
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

  useEffect(() => {
    const flash = searchParams.get('flash')
    if (!flash || !MESSAGES[flash]) return
    toast.success(MESSAGES[flash])
    const params = new URLSearchParams(searchParams.toString())
    params.delete('flash')
    const query = params.toString()
    router.replace(pathname + (query ? `?${query}` : ''), { scroll: false })
  }, [searchParams]) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}
