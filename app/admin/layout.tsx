import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LogoIcon } from '@/components/logo'
import { LayoutDashboard, Users, CreditCard } from 'lucide-react'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await requireAuth()
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { isAdmin: true } })
  if (!user?.isAdmin) redirect('/dashboard')

  return (
    <div className="flex min-h-screen bg-zinc-950">
      <aside className="fixed inset-y-0 left-0 z-40 flex w-56 flex-col border-r border-zinc-800 bg-zinc-950">
        <div className="flex h-16 items-center gap-3 border-b border-zinc-800 px-5">
          <LogoIcon size={28} />
          <span className="text-sm font-semibold text-zinc-100">Admin</span>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {[
            { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
            { href: '/admin/users', label: 'Users', icon: Users },
            { href: '/admin/transactions', label: 'Transactions', icon: CreditCard },
          ].map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-zinc-800 p-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </aside>
      <div className="flex-1 pl-56">
        <main className="p-8">{children}</main>
      </div>
    </div>
  )
}
