'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, AppWindow, List, LogOut,
  MessageSquare, UserPlus, Users, Settings2, CreditCard, ShieldCheck, Loader2,
} from 'lucide-react'
import { LogoIcon } from '@/components/logo'
import { logoutAction } from '@/app/actions/auth'
import { cn } from '@/lib/utils'
import { InviteModal } from './invite-modal'
import { useLanguage } from '@/components/language-provider'

const navItems = [
  { href: '/dashboard',              labelKey: 'nav.dashboard',    icon: LayoutDashboard, exact: true },
  { href: '/dashboard/applications', labelKey: 'nav.applications', icon: AppWindow },
  { href: '/dashboard/bugs',         labelKey: 'nav.bugs',         icon: List },
  { href: '/dashboard/feedback',     labelKey: 'nav.feedback',     icon: MessageSquare },
  { href: '/dashboard/members',      labelKey: 'nav.members',      icon: Users },
  { href: '/dashboard/billing',      labelKey: 'nav.billing',      icon: CreditCard },
]

interface SidebarProps {
  userName: string
  avatarUrl?: string | null
  ownedApps: { id: string; name: string }[]
  isAdmin?: boolean
}

export function Sidebar({ userName, avatarUrl, ownedApps, isAdmin }: SidebarProps) {
  const pathname = usePathname()
  const { t } = useLanguage()
  const [inviteOpen, setInviteOpen] = useState(false)
  const [pendingHref, setPendingHref] = useState<string | null>(null)

  useEffect(() => {
    setPendingHref(null)
  }, [pathname])

  function handleNav(href: string) {
    if (href !== pathname) setPendingHref(href)
  }

  const isNavigating = pendingHref !== null

  return (
    <>
      {isNavigating && (
        <div className="fixed top-0 left-0 right-0 z-[9999] h-[2px] overflow-hidden bg-indigo-950">
          <div
            className="h-full w-2/5 rounded-full bg-indigo-500"
            style={{ animation: 'nav-progress 0.9s ease-in-out infinite' }}
          />
        </div>
      )}
      <aside className="fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-zinc-800 bg-zinc-950">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-zinc-800 px-5">
          <LogoIcon size={32} />
          <span className="text-sm font-semibold text-zinc-100">BugReport</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map(({ href, labelKey, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href)
            const loading = pendingHref === href
            return (
              <Link
                key={href}
                href={href}
                onClick={() => handleNav(href)}
                aria-disabled={isNavigating && !loading}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-indigo-600/20 text-indigo-400'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100',
                  isNavigating && !loading && 'pointer-events-none opacity-50'
                )}
              >
                {loading
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <Icon className="h-4 w-4" />
                }
                {t(labelKey)}
              </Link>
            )
          })}
        </nav>

        {/* Invite button — only shown when user owns ≥1 app */}
        {ownedApps.length > 0 && (
          <div className="border-t border-zinc-800 p-3">
            <button
              type="button"
              onClick={() => setInviteOpen(true)}
              className="flex w-full items-center gap-3 rounded-lg border border-dashed border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-400 transition-colors hover:border-indigo-500/50 hover:bg-indigo-600/10 hover:text-indigo-400"
            >
              <UserPlus className="h-4 w-4" />
              {t('nav.inviteMember')}
            </button>
          </div>
        )}

        {/* Admin link */}
        {isAdmin && (
          <div className="border-t border-zinc-800 p-3">
            <Link
              href="/admin"
              onClick={() => handleNav('/admin')}
              aria-disabled={isNavigating && pendingHref !== '/admin'}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                pathname.startsWith('/admin')
                  ? 'bg-amber-600/20 text-amber-400'
                  : 'text-amber-500/70 hover:bg-amber-600/10 hover:text-amber-400',
                isNavigating && pendingHref !== '/admin' && 'pointer-events-none opacity-50'
              )}
            >
              {pendingHref === '/admin'
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <ShieldCheck className="h-4 w-4" />
              }
              {t('nav.adminPanel')}
            </Link>
          </div>
        )}

        {/* Settings + User */}
        <div className={cn('p-3 space-y-1', ownedApps.length === 0 && !isAdmin ? 'border-t border-zinc-800' : '')}>
          <Link
            href="/dashboard/settings"
            onClick={() => handleNav('/dashboard/settings')}
            aria-disabled={isNavigating && pendingHref !== '/dashboard/settings'}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              pathname.startsWith('/dashboard/settings')
                ? 'bg-indigo-600/20 text-indigo-400'
                : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100',
              isNavigating && pendingHref !== '/dashboard/settings' && 'pointer-events-none opacity-50'
            )}
          >
            {pendingHref === '/dashboard/settings'
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Settings2 className="h-4 w-4" />
            }
            {t('nav.settings')}
          </Link>
          <Link
            href="/dashboard/profile"
            onClick={() => handleNav('/dashboard/profile')}
            aria-disabled={isNavigating && pendingHref !== '/dashboard/profile'}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              pathname.startsWith('/dashboard/profile')
                ? 'bg-indigo-600/20 text-indigo-400'
                : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100',
              isNavigating && pendingHref !== '/dashboard/profile' && 'pointer-events-none opacity-50'
            )}
          >
            {pendingHref === '/dashboard/profile' ? (
              <Loader2 className="h-6 w-6 shrink-0 animate-spin text-indigo-400" />
            ) : (
              <div className="h-6 w-6 shrink-0 overflow-hidden rounded-full border border-zinc-600">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt={userName} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-indigo-600/20 text-[10px] font-bold text-indigo-400">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            )}
            <span className="truncate">{userName}</span>
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
            >
              <LogOut className="h-4 w-4" />
              {t('nav.signOut')}
            </button>
          </form>
        </div>
      </aside>

      {inviteOpen && (
        <InviteModal apps={ownedApps} onClose={() => setInviteOpen(false)} />
      )}
    </>
  )
}
