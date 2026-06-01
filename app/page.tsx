import type { Metadata } from 'next'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { LogoIcon } from '@/components/logo'
import { Bug, MessageSquare, Users, Zap, Check } from 'lucide-react'

export const metadata: Metadata = {
  title: 'BugReport — Track bugs, ship better software',
  description:
    'Collect bug reports and user feedback from your mobile, web, and desktop apps via a simple REST API. Manage everything in one dashboard. Free to start.',
  alternates: { canonical: '/' },
}

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://bugreportmanager.vercel.app'

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'BugReport',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Web',
  description:
    'Collect bug reports and user feedback from your mobile, web, and desktop apps via a simple REST API. Manage everything in one dashboard.',
  url: siteUrl,
  offers: [
    {
      '@type': 'Offer',
      name: 'Free',
      price: '0',
      priceCurrency: 'IDR',
      description: 'Up to 3 applications, unlimited bug reports and feedback.',
    },
    {
      '@type': 'Offer',
      name: 'Pro',
      price: '30000',
      priceCurrency: 'IDR',
      description: 'Unlimited applications, advanced dashboard and charts.',
    },
    {
      '@type': 'Offer',
      name: 'Business',
      price: '150000',
      priceCurrency: 'IDR',
      description: 'Everything in Pro plus team member invitations and role-based access control.',
    },
  ],
  featureList: [
    'Bug tracking via REST API',
    'User feedback collection',
    'Team collaboration with role-based access',
    'Real-time dashboard',
    'Trello integration',
  ],
}

export default async function LandingPage() {
  const session = await getSession()
  if (session) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <LogoIcon size={28} />
            <span className="font-semibold text-zinc-100">BugReport</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/docs"
              className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-100"
            >
              Docs
            </Link>
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-100"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
            >
              Get started free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-600/10 px-4 py-1.5 text-xs font-medium text-indigo-400 mb-8">
          <Zap className="h-3 w-3" />
          Ship bug-free software faster
        </div>
        <h1 className="text-5xl font-bold tracking-tight text-zinc-100 sm:text-6xl">
          Track bugs,
          <br />
          <span className="text-indigo-400">ship better software</span>
        </h1>
        <p className="mt-6 text-lg text-zinc-400 max-w-2xl mx-auto">
          Collect bug reports and user feedback from your apps via a simple API.
          Manage everything in one dashboard. Free to start.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/register"
            className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
          >
            Start for free
          </Link>
          <Link
            href="#pricing"
            className="rounded-lg border border-zinc-700 px-6 py-3 text-sm font-semibold text-zinc-300 transition-colors hover:border-zinc-600 hover:text-zinc-100"
          >
            See pricing
          </Link>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Bug,
              title: 'Bug Tracking',
              desc: 'Capture stack traces, device info, and app version automatically from your apps.',
            },
            {
              icon: MessageSquare,
              title: 'User Feedback',
              desc: 'Collect ratings, suggestions, and complaints directly from end users.',
            },
            {
              icon: Users,
              title: 'Team Collaboration',
              desc: 'Invite team members with role-based access to manage reports together.',
            },
            {
              icon: Zap,
              title: 'Simple API',
              desc: 'One POST request to submit a bug. Works with any language or platform.',
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-3"
            >
              <div className="h-10 w-10 rounded-lg bg-indigo-600/20 flex items-center justify-center">
                <Icon className="h-5 w-5 text-indigo-400" />
              </div>
              <h3 className="font-semibold text-zinc-100">{title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-zinc-100">Simple, transparent pricing</h2>
          <p className="mt-3 text-zinc-400">Start free, upgrade when you need to.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Free */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 flex flex-col">
            <div className="mb-6">
              <p className="text-sm font-medium text-zinc-400">Free</p>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-zinc-100">Rp 0</span>
                <span className="text-zinc-500">/bulan</span>
              </div>
              <p className="mt-3 text-sm text-zinc-400">Perfect for side projects and small apps.</p>
            </div>
            <ul className="space-y-3 flex-1 mb-8">
              {['Up to 3 applications', 'Unlimited bug reports', 'Unlimited feedback', 'API key authentication', 'Basic dashboard'].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-zinc-300">
                  <Check className="h-4 w-4 text-indigo-400 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="rounded-lg border border-zinc-700 px-4 py-2.5 text-center text-sm font-semibold text-zinc-300 transition-colors hover:border-zinc-600 hover:text-zinc-100"
            >
              Get started
            </Link>
          </div>

          {/* Pro */}
          <div className="rounded-xl border border-indigo-500/50 bg-indigo-600/10 p-8 flex flex-col relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
                Most popular
              </span>
            </div>
            <div className="mb-6">
              <p className="text-sm font-medium text-indigo-400">Pro</p>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-zinc-100">Rp 30.000</span>
                <span className="text-zinc-500">/bulan</span>
              </div>
              <p className="mt-3 text-sm text-zinc-400">For developers with multiple projects.</p>
            </div>
            <ul className="space-y-3 flex-1 mb-8">
              {['Unlimited applications', 'Unlimited bug reports', 'Unlimited feedback', 'API key authentication', 'Advanced dashboard & charts'].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-zinc-300">
                  <Check className="h-4 w-4 text-indigo-400 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="rounded-lg bg-indigo-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
            >
              Get started
            </Link>
          </div>

          {/* Business */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 flex flex-col">
            <div className="mb-6">
              <p className="text-sm font-medium text-zinc-400">Business</p>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-zinc-100">Rp 150.000</span>
                <span className="text-zinc-500">/bulan</span>
              </div>
              <p className="mt-3 text-sm text-zinc-400">For teams that need collaboration.</p>
            </div>
            <ul className="space-y-3 flex-1 mb-8">
              {['Everything in Pro', 'Team member invitations', 'Role-based access control', 'Viewer / Editor / Admin roles', 'Priority support'].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-zinc-300">
                  <Check className="h-4 w-4 text-indigo-400 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="rounded-lg border border-zinc-700 px-4 py-2.5 text-center text-sm font-semibold text-zinc-300 transition-colors hover:border-zinc-600 hover:text-zinc-100"
            >
              Get started
            </Link>
          </div>
        </div>

        {/* Enterprise */}
        <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-semibold text-zinc-100">Enterprise</p>
            <p className="mt-1 text-sm text-zinc-400">
              Need custom limits, SSO, or dedicated support? Let&#39;s talk.
            </p>
          </div>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? 'YOUR_WHATSAPP_NUMBER'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-lg bg-green-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-500"
          >
            Talk to us on WhatsApp
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8">
        <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <LogoIcon size={20} />
            <span className="text-sm text-zinc-500">BugReport</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/docs" className="text-sm text-zinc-500 hover:text-zinc-400 transition-colors">
              API Docs
            </Link>
            <Link href="/register" className="text-sm text-zinc-500 hover:text-zinc-400 transition-colors">
              Get started
            </Link>
          </div>
          <p className="text-sm text-zinc-600">
            © {new Date().getFullYear()} BugReport. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
