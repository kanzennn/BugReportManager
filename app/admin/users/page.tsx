import { prisma } from '@/lib/db'

const PLAN_BADGE: Record<string, string> = {
  FREE: 'bg-zinc-700 text-zinc-300',
  PRO: 'bg-indigo-600/20 text-indigo-400',
  BUSINESS: 'bg-amber-600/20 text-amber-400',
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; plan?: string }>
}) {
  const params = await searchParams
  const page = Math.max(1, Number(params.page ?? 1))
  const planFilter = params.plan as 'FREE' | 'PRO' | 'BUSINESS' | undefined
  const pageSize = 20
  const skip = (page - 1) * pageSize

  const where = planFilter ? { plan: planFilter } : {}

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        plan: true,
        subscriptionStatus: true,
        createdAt: true,
        isAdmin: true,
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ])

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Users</h1>
          <p className="mt-1 text-sm text-zinc-400">{total} total users</p>
        </div>
        {/* Plan filter */}
        <div className="flex gap-2">
          {['', 'FREE', 'PRO', 'BUSINESS'].map((p) => (
            <a
              key={p}
              href={p ? `/admin/users?plan=${p}` : '/admin/users'}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                (planFilter ?? '') === p
                  ? 'bg-indigo-600 text-white'
                  : 'border border-zinc-700 text-zinc-400 hover:text-zinc-100'
              }`}
            >
              {p || 'All'}
            </a>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-900">
            <tr>
              {['Name', 'Email', 'Plan', 'Apps', 'Joined', 'Admin'].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium text-zinc-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-zinc-900/50 transition-colors">
                <td className="px-4 py-3 text-zinc-100 font-medium">{u.name}</td>
                <td className="px-4 py-3 text-zinc-400">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${PLAN_BADGE[u.plan]}`}>
                    {u.plan}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-400">{u._count.applications}</td>
                <td className="px-4 py-3 text-zinc-500 text-xs">
                  {u.createdAt.toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-xs text-zinc-500">
                  {u.isAdmin ? <span className="text-indigo-400">Admin</span> : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <a
                href={`/admin/users?page=${page - 1}${planFilter ? `&plan=${planFilter}` : ''}`}
                className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                Previous
              </a>
            )}
            {page < totalPages && (
              <a
                href={`/admin/users?page=${page + 1}${planFilter ? `&plan=${planFilter}` : ''}`}
                className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                Next
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
