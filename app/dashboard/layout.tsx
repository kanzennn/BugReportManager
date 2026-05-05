import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Sidebar } from '@/components/layout/sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await requireAuth()
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } })

  return (
    <div className="flex min-h-screen bg-zinc-950">
      <Sidebar userName={user?.name ?? user?.email ?? 'User'} />
      <div className="flex-1 pl-60">
        <main className="p-8">{children}</main>
      </div>
    </div>
  )
}
