import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"
import { Providers } from '@/components/providers'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://bugreportmanager.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'BugReport — Track bugs, ship better software',
    template: '%s | BugReport',
  },
  description:
    'Collect bug reports and user feedback from your mobile, web, and desktop apps via a simple REST API. Manage everything in one dashboard. Free to start.',
  keywords: [
    'bug tracking',
    'bug report',
    'error tracking',
    'feedback management',
    'crash reporting',
    'app monitoring',
    'bug tracker',
    'mobile bug report',
  ],
  authors: [{ name: 'BugReport' }],
  creator: 'BugReport',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'BugReport',
    title: 'BugReport — Track bugs, ship better software',
    description:
      'Collect bug reports and user feedback from your apps via a simple API. Manage everything in one dashboard. Free to start.',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'BugReport' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BugReport — Track bugs, ship better software',
    description:
      'Collect bug reports and user feedback from your apps via a simple API. Manage everything in one dashboard. Free to start.',
    images: ['/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
      <body suppressHydrationWarning className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
        <Providers>
          {children}
        </Providers>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}
