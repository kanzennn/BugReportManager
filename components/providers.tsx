'use client'

import { Toaster } from 'sonner'
import { Suspense } from 'react'
import { FlashToast } from '@/components/ui/flash-toast'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster position="top-right" theme="dark" richColors />
      <Suspense><FlashToast /></Suspense>
    </>
  )
}
