import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Sidebar } from '@/components/layout/sidebar'
import { Heartbeat } from '@/components/layout/heartbeat'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await requireAuth()

  const [user, ownedApps] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, avatarUrl: true, isAdmin: true },
    }),
    prisma.application.findMany({
      where: { userId },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ])

  return (
    <div className="flex min-h-screen bg-zinc-950">
      <Heartbeat />
      <Sidebar
        userName={user?.name ?? user?.email ?? 'User'}
        avatarUrl={user?.avatarUrl}
        ownedApps={ownedApps}
        isAdmin={user?.isAdmin ?? false}
      />
      <div className="flex-1 pl-60">
        <main className="p-8">{children}</main>
      </div>
    </div>
  )
}
