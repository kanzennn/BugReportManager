'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bug, LayoutDashboard, AppWindow, List, LogOut, MessageSquare } from 'lucide-react'
import { logoutAction } from '@/app/actions/auth'
import { cn } from '@/lib/utils'

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/applications', label: 'Applications', icon: AppWindow },
  { href: '/dashboard/bugs', label: 'All Bugs', icon: List },
  { href: '/dashboard/feedback', label: 'Feedback', icon: MessageSquare },
]

export function Sidebar({ userName }: { userName: string }) {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-zinc-800 bg-zinc-950">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-zinc-800 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
          <Bug className="h-4 w-4 text-white" />
        </div>
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

      {/* User */}
      <div className="border-t border-zinc-800 p-3">
        <div className="mb-2 px-3 py-1">
          <p className="truncate text-xs font-medium text-zinc-300">{userName}</p>
        </div>
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
  )
}
