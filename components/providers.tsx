'use client'

import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import { Suspense } from 'react'
import { FlashToast } from '@/components/ui/flash-toast'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
      {children}
      <Toaster position="top-right" richColors />
      <Suspense><FlashToast /></Suspense>
    </ThemeProvider>
  )
}
