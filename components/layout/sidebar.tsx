'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, AppWindow, List, LogOut,
  MessageSquare, UserPlus, Users,
} from 'lucide-react'
import { LogoIcon } from '@/components/logo'
import { logoutAction } from '@/app/actions/auth'
import { cn } from '@/lib/utils'
import { InviteModal } from './invite-modal'

const nav = [
  { href: '/dashboard',              label: 'Dashboard',    icon: LayoutDashboard, exact: true },
  { href: '/dashboard/applications', label: 'Applications', icon: AppWindow },
  { href: '/dashboard/bugs',         label: 'All Bugs',     icon: List },
  { href: '/dashboard/feedback',     label: 'Feedback',     icon: MessageSquare },
  { href: '/dashboard/members',      label: 'Members',      icon: Users },
]

interface SidebarProps {
  userName: string
  avatarUrl?: string | null
  ownedApps: { id: string; name: string }[]
}

export function Sidebar({ userName, avatarUrl, ownedApps }: SidebarProps) {
  const pathname = usePathname()
  const [inviteOpen, setInviteOpen] = useState(false)

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-zinc-800 bg-zinc-950">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-zinc-800 px-5">
          <LogoIcon size={32} />
          <span className="text-sm font-semibold text-zinc-100">BugReport</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3">
          {nav.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-indigo-600/20 text-indigo-400'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
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
              Invite member
            </button>
          </div>
        )}

        {/* User */}
        <div className={cn('p-3 space-y-1', ownedApps.length === 0 ? 'border-t border-zinc-800' : '')}>
          <Link
            href="/dashboard/profile"
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              pathname.startsWith('/dashboard/profile')
                ? 'bg-indigo-600/20 text-indigo-400'
                : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
            )}
          >
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
            <span className="truncate">{userName}</span>
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
            >
              <LogOut className="h-4 w-4" />
              Sign out
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
