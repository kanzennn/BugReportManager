'use client'

import { useTransition } from 'react'

interface ConfirmButtonProps {
  action: () => Promise<void>
  message: string
  className?: string
  children: React.ReactNode
}

export function ConfirmButton({ action, message, className, children }: ConfirmButtonProps) {
  const [pending, startTransition] = useTransition()

  function handleClick() {
    if (!confirm(message)) return
    startTransition(() => action())
  }

  return (
    <button type="button" onClick={handleClick} disabled={pending} className={className}>
      {children}
    </button>
  )
}
