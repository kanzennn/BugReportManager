'use client'

import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import { Suspense } from 'react'
import { FlashToast } from '@/components/ui/flash-toast'
import NextTopLoader from 'nextjs-toploader'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
      <NextTopLoader color="#6366f1" shadow="0 0 10px #6366f1,0 0 5px #6366f1" showSpinner={false} />
      {children}
      <Toaster position="top-right" richColors />
      <Suspense><FlashToast /></Suspense>
    </ThemeProvider>
  )
}
