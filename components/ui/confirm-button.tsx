'use client'

import { useState, useTransition } from 'react'
import { ConfirmDialog } from './confirm-dialog'

interface ConfirmButtonProps {
  action: () => Promise<void>
  title: string
  message: string
  confirmLabel?: string
  className?: string
  children: React.ReactNode
}

export function ConfirmButton({
  action,
  title,
  message,
  confirmLabel,
  className,
  children,
}: ConfirmButtonProps) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  function handleConfirm() {
    setOpen(false)
    startTransition(() => action())
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={pending}
        className={className}
      >
        {children}
      </button>
      <ConfirmDialog
        open={open}
        title={title}
        message={message}
        confirmLabel={confirmLabel}
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      />
    </>
  )
}
