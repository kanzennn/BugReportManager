'use client'

import { useEffect, useTransition } from 'react'
import { updatePresenceAction } from '@/app/actions/presence'

const INTERVAL_MS = 60_000

export function Heartbeat() {
  const [, start] = useTransition()

  useEffect(() => {
    const ping = () => start(() => updatePresenceAction())
    ping()
    const id = setInterval(ping, INTERVAL_MS)
    return () => clearInterval(id)
  }, [])

  return null
}
