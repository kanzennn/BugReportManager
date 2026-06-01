'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, AppWindow, List, LogOut,
  MessageSquare, UserPlus, Users, Settings2, CreditCard, ShieldCheck, Loader2,
  Menu, X, ChevronUp, User,
} from 'lucide-react'
import { LogoIcon } from '@/components/logo'
import { logoutAction } from '@/app/actions/auth'
import { cn } from '@/lib/utils'
import { InviteModal } from './invite-modal'
import { useLanguage } from '@/components/language-provider'

const navItems = [
  { href: '/dashboard',              labelKey: 'nav.dashboard',    icon: LayoutDashboard, exact: true, tourId: 'nav-dashboard' },
  { href: '/dashboard/applications', labelKey: 'nav.applications', icon: AppWindow,                   tourId: 'nav-applications' },
  { href: '/dashboard/bugs',         labelKey: 'nav.bugs',         icon: List,                        tourId: 'nav-bugs' },
  { href: '/dashboard/feedback',     labelKey: 'nav.feedback',     icon: MessageSquare,               tourId: 'nav-feedback' },
  { href: '/dashboard/members',      labelKey: 'nav.members',      icon: Users,                       tourId: 'nav-members' },
  { href: '/dashboard/billing',      labelKey: 'nav.billing',      icon: CreditCard,                  tourId: 'nav-billing' },
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
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setPendingHref(null)
    setProfileOpen(false)
  }, [pathname])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!profileOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [profileOpen])

  function handleNav(href: string) {
    if (href !== pathname) setPendingHref(href)
    setMobileOpen(false)
  }

  const isNavigating = pendingHref !== null

  return (
    <>
      {/* ── Mobile top bar ── */}
      <div className="print:hidden fixed top-0 left-0 right-0 z-30 flex h-14 items-center gap-3 border-b border-zinc-800 bg-zinc-950 px-4 md:hidden">
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setMobileOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
        >
          <Menu className="h-5 w-5" />
        </button>
        <LogoIcon size={26} />
        <span className="text-sm font-semibold text-zinc-100">BugReport</span>
      </div>

      {/* ── Mobile backdrop ── */}
      {mobileOpen && (
        <div
          className="print:hidden fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar drawer ── */}
      <aside
        className={cn(
          'print:hidden fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-zinc-800 bg-zinc-950',
          'transition-transform duration-300 ease-in-out',
          '-translate-x-full md:translate-x-0 md:w-60',
          mobileOpen && 'translate-x-0',
        )}
      >
        {/* Logo row — close button on mobile */}
        <div className="flex h-16 items-center gap-3 border-b border-zinc-800 px-5">
          <LogoIcon size={32} />
          <span className="text-sm font-semibold text-zinc-100">BugReport</span>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 md:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map(({ href, labelKey, icon: Icon, exact, tourId }) => {
            const active = exact ? pathname === href : pathname.startsWith(href)
            const loading = pendingHref === href
            return (
              <Link
                key={href}
                href={href}
                onClick={() => handleNav(href)}
                aria-disabled={isNavigating && !loading}
                data-tour={tourId}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-indigo-600/20 text-indigo-400'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100',
                  isNavigating && !loading && 'pointer-events-none opacity-50',
                )}
              >
                {loading
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <Icon className="h-4 w-4" />}
                {t(labelKey)}
              </Link>
            )
          })}
        </nav>

        {/* Invite button */}
        {ownedApps.length > 0 && (
          <div className="border-t border-zinc-800 p-3">
            <button
              type="button"
              onClick={() => { setInviteOpen(true); setMobileOpen(false) }}
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
                isNavigating && pendingHref !== '/admin' && 'pointer-events-none opacity-50',
              )}
            >
              {pendingHref === '/admin'
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <ShieldCheck className="h-4 w-4" />}
              {t('nav.adminPanel')}
            </Link>
          </div>
        )}

        {/* Settings + Profile dropdown */}
        <div className={cn('p-3 space-y-1', ownedApps.length === 0 && !isAdmin ? 'border-t border-zinc-800' : '')}>
          <Link
            href="/dashboard/settings"
            onClick={() => handleNav('/dashboard/settings')}
            data-tour="nav-settings"
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              pathname.startsWith('/dashboard/settings')
                ? 'bg-indigo-600/20 text-indigo-400'
                : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100',
            )}
          >
            {pendingHref === '/dashboard/settings'
              ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
              : <Settings2 className="h-4 w-4 shrink-0" />}
            {t('nav.settings')}
          </Link>

          {/* Profile button with dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              data-tour="nav-profile"
              onClick={() => setProfileOpen(o => !o)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                pathname.startsWith('/dashboard/profile')
                  ? 'bg-indigo-600/20 text-indigo-400'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100',
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
              <span className="flex-1 truncate text-left">{userName}</span>
              <ChevronUp
                className={cn(
                  'h-3.5 w-3.5 shrink-0 transition-transform duration-200',
                  !profileOpen && 'rotate-180',
                )}
              />
            </button>

            {/* Dropdown */}
            {profileOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-1 overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900 py-1 shadow-xl">
                <Link
                  href="/dashboard/profile"
                  onClick={() => { handleNav('/dashboard/profile'); setProfileOpen(false) }}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
                >
                  <User className="h-4 w-4 shrink-0" />
                  {t('nav.profile')}
                </Link>
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="flex w-full items-center gap-3 px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
                  >
                    <LogOut className="h-4 w-4 shrink-0" />
                    {t('nav.signOut')}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </aside>

      {inviteOpen && (
        <InviteModal apps={ownedApps} onClose={() => setInviteOpen(false)} />
      )}
    </>
  )
}
