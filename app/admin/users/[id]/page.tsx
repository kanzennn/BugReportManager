import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { UserRoleForm } from './user-role-form'
import { BanButton } from './ban-button'

const APP_TYPE_BADGE: Record<string, string> = {
  WEBSITE: 'bg-blue-600/20 text-blue-400',
  ANDROID: 'bg-green-600/20 text-green-400',
  IOS: 'bg-zinc-600/20 text-zinc-400',
  DESKTOP: 'bg-purple-600/20 text-purple-400',
}

const STATUS_BADGE: Record<string, string> = {
  OPEN: 'bg-red-600/20 text-red-400',
  IN_PROGRESS: 'bg-yellow-600/20 text-yellow-400',
  RESOLVED: 'bg-green-600/20 text-green-400',
  CLOSED: 'bg-zinc-700 text-zinc-400',
}

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { userId: adminId } = await requireAuth()
  const { id } = await params

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      plan: true,
      subscriptionStatus: true,
      isAdmin: true,
      bannedAt: true,
      createdAt: true,
      _count: { select: { applications: true, transactions: true } },
      applications: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          type: true,
          createdAt: true,
          _count: { select: { bugs: true, feedback: true } },
          bugs: {
            select: { status: true },
          },
        },
      },
    },
  })

  if (!user) notFound()

  return (
    <div className="max-w-2xl space-y-6">
      <Link href="/admin/users" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors">
        ← Users
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-zinc-100">{user.name}</h1>
            {user.bannedAt && (
              <span className="rounded-full bg-red-600/20 px-2.5 py-0.5 text-xs font-medium text-red-400">
                Banned
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-zinc-400">{user.email}</p>
        </div>
      </div>

      {/* Info */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 divide-y divide-zinc-800">
        {[
          { label: 'User ID', value: user.id },
          { label: 'Joined', value: user.createdAt.toLocaleDateString('en-US', { dateStyle: 'long' }) },
          { label: 'Plan', value: user.plan },
          { label: 'Subscription', value: user.subscriptionStatus },
          { label: 'Applications', value: String(user._count.applications) },
          { label: 'Transactions', value: String(user._count.transactions) },
          ...(user.bannedAt
            ? [{ label: 'Banned on', value: user.bannedAt.toLocaleDateString('en-US', { dateStyle: 'long' }) }]
            : []),
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between px-5 py-3">
            <span className="text-sm text-zinc-400">{label}</span>
            <span className="text-sm text-zinc-200 font-mono">{value}</span>
          </div>
        ))}
      </div>

      {/* Edit Role */}
      <UserRoleForm
        userId={user.id}
        currentPlan={user.plan}
        isAdmin={user.isAdmin}
        isSelf={user.id === adminId}
      />

      {/* Ban */}
      {user.id !== adminId && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-3">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              {user.bannedAt ? 'User is banned' : 'Ban user'}
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              {user.bannedAt
                ? 'This user cannot log in. Unban to restore access.'
                : 'Immediately revokes access. The user will be signed out on their next request.'}
            </p>
          </div>
          <BanButton userId={user.id} isBanned={!!user.bannedAt} />
        </div>
      )}

      {/* Applications */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
          Applications ({user.applications.length})
        </h2>

        {user.applications.length === 0 ? (
          <p className="text-sm text-zinc-500">No applications.</p>
        ) : (
          <div className="space-y-3">
            {user.applications.map((app) => {
              const bugsByStatus = app.bugs.reduce<Record<string, number>>((acc, b) => {
                acc[b.status] = (acc[b.status] ?? 0) + 1
                return acc
              }, {})
              const openCount = (bugsByStatus.OPEN ?? 0) + (bugsByStatus.IN_PROGRESS ?? 0)

              return (
                <div key={app.id} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${APP_TYPE_BADGE[app.type]}`}>
                        {app.type}
                      </span>
                      <span className="font-medium text-zinc-100">{app.name}</span>
                    </div>
                    <span className="text-xs text-zinc-500">
                      {app.createdAt.toLocaleDateString()}
                    </span>
                  </div>

                  {/* Bug status breakdown */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-zinc-500">
                      Bugs — {app._count.bugs} total, {openCount} active
                    </p>
                    {app._count.bugs > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(bugsByStatus).map(([status, count]) => (
                          <span
                            key={status}
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[status] ?? 'bg-zinc-700 text-zinc-400'}`}
                          >
                            {count} {status.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-600">No bugs reported.</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-xs text-zinc-500">
                    <span>{app._count.feedback} feedback</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
