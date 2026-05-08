import { prisma } from '@/lib/db'

const STATUS_BADGE: Record<string, string> = {
  SUCCEEDED: 'bg-green-600/20 text-green-400',
  FAILED: 'bg-red-600/20 text-red-400',
  REFUNDED: 'bg-zinc-700 text-zinc-300',
}

const PLAN_BADGE: Record<string, string> = {
  PRO: 'bg-indigo-600/20 text-indigo-400',
  BUSINESS: 'bg-amber-600/20 text-amber-400',
  FREE: 'bg-zinc-700 text-zinc-300',
}

export default async function AdminTransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const params = await searchParams
  const page = Math.max(1, Number(params.page ?? 1))
  const pageSize = 25
  const skip = (page - 1) * pageSize

  const [transactions, total, revenueAgg] = await Promise.all([
    prisma.transaction.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.transaction.count(),
    prisma.transaction.aggregate({ _sum: { amount: true }, where: { status: 'SUCCEEDED' } }),
  ])

  const totalPages = Math.ceil(total / pageSize)
  const totalRevenue = ((revenueAgg._sum.amount ?? 0) / 100).toFixed(2)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Transactions</h1>
          <p className="mt-1 text-sm text-zinc-400">
            {total} transactions · ${totalRevenue} total revenue
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-900">
            <tr>
              {['User', 'Plan', 'Amount', 'Status', 'Stripe ID', 'Date'].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium text-zinc-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {transactions.map((t) => (
              <tr key={t.id} className="hover:bg-zinc-900/50 transition-colors">
                <td className="px-4 py-3">
                  <p className="text-zinc-100 font-medium">{t.user.name}</p>
                  <p className="text-xs text-zinc-500">{t.user.email}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${PLAN_BADGE[t.plan]}`}>
                    {t.plan}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-100 font-medium">
                  ${(t.amount / 100).toFixed(2)} <span className="text-xs text-zinc-500 uppercase">{t.currency}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[t.status]}`}>
                    {t.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-500 font-mono text-xs">
                  {t.stripePaymentId ? t.stripePaymentId.slice(0, 20) + '…' : '—'}
                </td>
                <td className="px-4 py-3 text-zinc-500 text-xs">
                  {t.createdAt.toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {transactions.length === 0 && (
          <p className="py-12 text-center text-sm text-zinc-500">No transactions yet.</p>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-500">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            {page > 1 && (
              <a href={`/admin/transactions?page=${page - 1}`} className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-100 transition-colors">
                Previous
              </a>
            )}
            {page < totalPages && (
              <a href={`/admin/transactions?page=${page + 1}`} className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-100 transition-colors">
                Next
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
