import { prisma } from '@/lib/db'
import { UserGrowthChart } from '@/components/admin/user-growth-chart'
import { Users, DollarSign, TrendingUp, AppWindow, Bug, MessageSquare, CreditCard, ArrowUpRight } from 'lucide-react'

function buildLast7Days(rows: { createdAt: Date }[]) {
  const days: { date: string; count: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const dateStr = d.toISOString().slice(0, 10)
    const count = rows.filter((r) => r.createdAt.toISOString().slice(0, 10) === dateStr).length
    days.push({ date: label, count })
  }
  return days
}

const PLAN_BADGE: Record<string, string> = {
  FREE: 'bg-zinc-700 text-zinc-300',
  PRO: 'bg-indigo-600/20 text-indigo-400',
  BUSINESS: 'bg-amber-600/20 text-amber-400',
}

const TX_STATUS_BADGE: Record<string, string> = {
  SUCCEEDED: 'bg-green-600/20 text-green-400',
  FAILED: 'bg-red-600/20 text-red-400',
  REFUNDED: 'bg-zinc-700 text-zinc-300',
}

export default async function AdminOverviewPage() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const sevenDaysAgo = new Date(now)
  sevenDaysAgo.setDate(now.getDate() - 6)
  sevenDaysAgo.setHours(0, 0, 0, 0)

  const [
    totalUsers,
    newUsersThisMonth,
    totalTransactions,
    revenue,
    planCounts,
    totalApps,
    totalBugs,
    totalFeedback,
    recentUsers,
    recentTransactions,
    last7DaySignups,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.transaction.count(),
    prisma.transaction.aggregate({ _sum: { amount: true }, where: { status: 'SUCCEEDED' } }),
    prisma.user.groupBy({ by: ['plan'], _count: { plan: true } }),
    prisma.application.count(),
    prisma.bugReport.count(),
    prisma.feedback.count(),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: { id: true, name: true, email: true, plan: true, createdAt: true },
    }),
    prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.user.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true },
    }),
  ])

  const revenueTotal = (revenue._sum.amount ?? 0) / 100
  const planMap = Object.fromEntries(planCounts.map((p) => [p.plan, p._count.plan]))
  const proCount = planMap['PRO'] ?? 0
  const businessCount = planMap['BUSINESS'] ?? 0
  const paidUsers = proCount + businessCount
  const mrr = proCount * 2 + businessCount * 10
  const conversionRate = totalUsers > 0 ? ((paidUsers / totalUsers) * 100).toFixed(1) : '0.0'
  const growthData = buildLast7Days(last7DaySignups)

  const kpiCards = [
    { label: 'Total users',         value: totalUsers.toLocaleString(),            icon: Users,          sub: `+${newUsersThisMonth} this month` },
    { label: 'Monthly Rec. Revenue',value: `$${mrr.toFixed(2)}`,                   icon: TrendingUp,     sub: `${paidUsers} paying users` },
    { label: 'Total revenue',       value: `$${revenueTotal.toFixed(2)}`,          icon: DollarSign,     sub: `${totalTransactions} transactions` },
    { label: 'Conversion rate',     value: `${conversionRate}%`,                   icon: ArrowUpRight,   sub: `${paidUsers} of ${totalUsers} users` },
    { label: 'Total applications',  value: totalApps.toLocaleString(),             icon: AppWindow,      sub: 'across all users' },
    { label: 'Bug reports',         value: totalBugs.toLocaleString(),             icon: Bug,            sub: 'submitted via API' },
    { label: 'Feedback items',      value: totalFeedback.toLocaleString(),         icon: MessageSquare,  sub: 'submitted via API' },
    { label: 'Total transactions',  value: totalTransactions.toLocaleString(),     icon: CreditCard,     sub: `$${revenueTotal.toFixed(2)} total` },
    { label: 'Free users',          value: (planMap['FREE'] ?? 0).toLocaleString(), icon: Users,         sub: `${(100 - Number(conversionRate)).toFixed(1)}% of users` },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Admin Overview</h1>
        <p className="mt-1 text-sm text-zinc-400">Platform-wide stats at a glance.</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpiCards.map(({ label, value, icon: Icon, sub }) => (
          <div key={label} className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 flex items-start gap-4">
            <div className="h-10 w-10 shrink-0 rounded-lg bg-indigo-600/20 flex items-center justify-center">
              <Icon className="h-5 w-5 text-indigo-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-zinc-500">{label}</p>
              <p className="mt-0.5 text-2xl font-bold text-zinc-100">{value}</p>
              <p className="mt-0.5 text-xs text-zinc-500">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* User growth chart */}
      <UserGrowthChart data={growthData} />

      {/* Recent activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent signups */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
          <div className="border-b border-zinc-800 px-5 py-4">
            <h3 className="text-sm font-semibold text-zinc-100">Recent Signups</h3>
          </div>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-zinc-800">
              {recentUsers.map((u) => (
                <tr key={u.id} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-medium text-zinc-100 truncate max-w-[140px]">{u.name}</p>
                    <p className="text-xs text-zinc-500 truncate max-w-[140px]">{u.email}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${PLAN_BADGE[u.plan]}`}>
                      {u.plan}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right text-xs text-zinc-500">
                    {u.createdAt.toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent transactions */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
          <div className="border-b border-zinc-800 px-5 py-4">
            <h3 className="text-sm font-semibold text-zinc-100">Recent Transactions</h3>
          </div>
          {recentTransactions.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-zinc-500">No transactions yet.</p>
          ) : (
            <table className="w-full text-sm">
              <tbody className="divide-y divide-zinc-800">
                {recentTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-medium text-zinc-100 truncate max-w-[140px]">{t.user.name}</p>
                      <p className="text-xs text-zinc-500 truncate max-w-[140px]">{t.user.email}</p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-semibold text-zinc-100">${(t.amount / 100).toFixed(2)}</p>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${TX_STATUS_BADGE[t.status]}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-xs text-zinc-500">
                      {t.createdAt.toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
